<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalPendapatan = (int) Invoice::where('status', 'paid')->sum('amount');
        $totalSiswa = User::where('role', 'siswa')->count();
        $totalMentor = User::where('role', 'mentor')->count();
        $pendapatanPerKursus = Invoice::query()
            ->join('courses', 'courses.id', '=', 'invoices.course_id')
            ->where('invoices.status', 'paid')
            ->select('courses.id', 'courses.name')
            ->selectRaw('SUM(invoices.amount) as amount')
            ->groupBy('courses.id', 'courses.name')
            ->orderByDesc('amount')
            ->limit(8)
            ->get()
            ->map(fn (Invoice $invoice) => [
                'name' => $invoice->name,
                'amount' => (int) $invoice->amount,
            ]);

        return Inertia::render('superadmin/dashboard', [
            'stats' => [
                'total_pendapatan' => $totalPendapatan,
                'total_siswa' => $totalSiswa,
                'total_mentor' => $totalMentor,
            ],
            'pendapatan_per_kursus' => $pendapatanPerKursus,
        ]);
    }
}
