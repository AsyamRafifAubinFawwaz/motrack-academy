<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $mentor = Auth::user();

        // Hanya siswa yang dibimbing mentor ini
        $totalSiswa = User::whereHas(
            'studentCourses', fn ($q) => $q->where('course_student.mentor_id', $mentor->id)
        )->count();

        $tugasMenunggu = Submission::whereHas(
            'assignment', fn ($q) => $q->where('mentor_id', $mentor->id)
        )->whereNull('grade')->count();

        $siswas = User::query()
            ->whereHas('studentCourses', fn ($q) => $q->where('course_student.mentor_id', $mentor->id))
            ->with(['studentCourses' => fn ($q) => $q->where('course_student.mentor_id', $mentor->id)])
            ->latest()
            ->paginate(10);

        return Inertia::render('mentor/dashboard', [
            'stats' => [
                'total_siswa'    => $totalSiswa,
                'tugas_menunggu' => $tugasMenunggu,
            ],
            'siswas' => $siswas,
        ]);
    }
}
