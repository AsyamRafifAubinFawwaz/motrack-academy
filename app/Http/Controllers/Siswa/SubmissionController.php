<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function index(): Response
    {
        $siswa = Auth::user();

        $submissions = Submission::query()
            ->where('student_id', $siswa->id)
            ->with(['assignment:id,title,material_id', 'assignment.material:id,title'])
            ->latest()
            ->paginate(10);

        return Inertia::render('siswa/submission/index', [
            'submissions' => $submissions,
        ]);
    }

    public function store(Request $request, Assignment $assignment)
    {
        $siswa = Auth::user();

        // Pastikan siswa mendapat tugas ini
        $hasAssignment = $assignment->assign_type === 'all_mentees'
            ? $assignment->material->course->students()->where('users.id', $siswa->id)->exists()
            : $assignment->students()->where('users.id', $siswa->id)->exists();

        abort_unless($hasAssignment, 403);

        $validated = $request->validate([
            'file_path'       => 'nullable|file|mimes:pdf,zip|max:10240',
            'submission_text' => 'nullable|string',
        ], [
            'required_without' => 'File atau teks submission wajib diisi.',
        ]);

        // Minimal salah satu harus diisi
        if (empty($validated['submission_text']) && ! $request->hasFile('file_path')) {
            return back()->withErrors(['file_path' => 'File atau teks submission wajib diisi.']);
        }

        // Cek apakah sudah pernah submit (update jika sudah ada)
        $existing = Submission::where('assignment_id', $assignment->id)
            ->where('student_id', $siswa->id)
            ->first();

        $filePath = null;
        if ($request->hasFile('file_path')) {
            // Hapus file lama jika ada
            if ($existing && $existing->file_path) {
                Storage::disk('public')->delete($existing->file_path);
            }
            $filePath = $request->file('file_path')->store('submissions', 'public');
        }

        $data = [
            'assignment_id'   => $assignment->id,
            'student_id'      => $siswa->id,
            'submission_text' => $validated['submission_text'] ?? null,
        ];

        if ($filePath) {
            $data['file_path'] = $filePath;
        }

        Submission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'student_id' => $siswa->id],
            $data
        );

        return redirect()->route('siswa.submission.index')
            ->with('success', 'Tugas berhasil dikumpulkan');
    }
}
