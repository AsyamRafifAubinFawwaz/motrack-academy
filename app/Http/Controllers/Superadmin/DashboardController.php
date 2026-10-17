<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Invoice;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalPendapatan = Invoice::where('status', 'paid')->sum('amount');
        $totalKelas      = Course::count();
        $totalUser       = User::whereIn('role', ['mentor', 'siswa'])->count();

        return Inertia::render('superadmin/dashboard', [
            'stats' => [
                'total_pendapatan' => $totalPendapatan,
                'total_kelas'      => $totalKelas,
                'total_user'       => $totalUser,
            ],
        ]);
    }
}
