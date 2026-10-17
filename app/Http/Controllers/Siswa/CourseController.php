<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Material;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $siswa = Auth::user();

        $kelas = Course::whereHas('students', fn ($q) => $q->where('users.id', $siswa->id))
            ->withCount('materials')
            ->latest()
            ->paginate(10);

        return Inertia::render('siswa/kelas/index', [
            'kelas' => $kelas,
        ]);
    }

    public function show(Course $course): Response
    {
        $siswa = Auth::user();

        // Pastikan siswa hanya bisa lihat kelas yang dia ikuti
        abort_unless(
            $course->students()->where('users.id', $siswa->id)->exists(),
            403
        );

        $materials = $course->materials()
            ->with(['assignments' => fn ($q) => $q->where('mentor_id', function ($sub) use ($siswa) {
                $sub->select('mentor_id')
                    ->from('course_student')
                    ->where('student_id', $siswa->id)
                    ->where('course_id', request()->route('course')->id);
            })])
            ->get();

        return Inertia::render('siswa/kelas/show', [
            'course'    => $course,
            'materials' => $materials,
        ]);
    }
}
