<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $mentor = Auth::user();

        $submissions = Submission::query()
            ->whereHas('assignment', fn ($q) => $q->where('mentor_id', $mentor->id))
            ->when($request->search, fn ($q, $s) => $q->whereHas(
                'student', fn ($q) => $q->where('name', 'like', "%{$s}%")
            ))
            ->when($request->graded !== null, function ($q) use ($request) {
                $request->graded === 'true'
                    ? $q->whereNotNull('grade')
                    : $q->whereNull('grade');
            })
            ->with([
                'student:id,name,email',
                'assignment:id,title,material_id',
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('mentor/submission/index', [
            'submissions' => $submissions,
            'filters'     => $request->only(['search', 'graded']),
        ]);
    }

    public function update(Request $request, Submission $submission)
    {
        $mentor = Auth::user();

        abort_unless(
            $submission->assignment->mentor_id === $mentor->id,
            403
        );

        $validated = $request->validate([
            'grade'    => 'required|integer|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $submission->update($validated);

        return redirect()->route('mentor.submission.index')
            ->with('success', 'Nilai berhasil disimpan');
    }
}
