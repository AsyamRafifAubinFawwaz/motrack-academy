<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $siswa = Auth::user();

        $kelas = Course::whereHas('students', fn ($q) => $q->where('users.id', $siswa->id))
            ->with(['materials' => fn ($q) => $q->select('id', 'course_id', 'order')])
            ->latest()
            ->get();

        return Inertia::render('siswa/dashboard', [
            'kelas' => $kelas,
        ]);
    }
}
