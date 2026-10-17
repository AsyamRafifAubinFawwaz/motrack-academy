<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Material;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $mentor = Auth::user();

        $assignments = Assignment::query()
            ->where('mentor_id', $mentor->id)
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->with('material:id,title,course_id', 'material.course:id,name')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $materials = Material::whereHas('course.mentors', fn ($q) => $q->where('users.id', $mentor->id))
            ->with('course:id,name')
            ->select('id', 'title', 'course_id')
            ->get();

        // Daftar siswa bimbingan untuk assign_type=specific_students
        $siswas = User::whereHas(
            'studentCourses', fn ($q) => $q->where('course_student.mentor_id', $mentor->id)
        )->select('id', 'name')->get();

        return Inertia::render('mentor/tugas/index', [
            'assignments' => $assignments,
            'materials'   => $materials,
            'siswas'      => $siswas,
            'filters'     => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $mentor = Auth::user();

        $validated = $request->validate([
            'material_id'  => 'required|exists:materials,id',
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'assign_type'  => 'required|in:all_mentees,specific_students',
            'student_ids'  => 'required_if:assign_type,specific_students|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        $assignment = Assignment::create([
            'material_id' => $validated['material_id'],
            'mentor_id'   => $mentor->id,
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'assign_type' => $validated['assign_type'],
        ]);

        // Attach siswa spesifik ke pivot assignment_student
        if ($validated['assign_type'] === 'specific_students') {
            $assignment->students()->sync($validated['student_ids']);
        }

        return redirect()->route('mentor.tugas.index')
            ->with('success', 'Tugas berhasil dibuat');
    }

    public function update(Request $request, Assignment $assignment)
    {
        $mentor = Auth::user();

        abort_unless($assignment->mentor_id === $mentor->id, 403);

        $validated = $request->validate([
            'material_id'  => 'required|exists:materials,id',
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'assign_type'  => 'required|in:all_mentees,specific_students',
            'student_ids'  => 'required_if:assign_type,specific_students|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        $assignment->update([
            'material_id' => $validated['material_id'],
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'assign_type' => $validated['assign_type'],
        ]);

        if ($validated['assign_type'] === 'specific_students') {
            $assignment->students()->sync($validated['student_ids'] ?? []);
        } else {
            $assignment->students()->detach();
        }

        return redirect()->route('mentor.tugas.index')
            ->with('success', 'Tugas berhasil diupdate');
    }

    public function destroy(Assignment $assignment)
    {
        abort_unless($assignment->mentor_id === Auth::id(), 403);

        $assignment->delete();

        return redirect()->route('mentor.tugas.index')
            ->with('success', 'Tugas berhasil dihapus');
    }
}
