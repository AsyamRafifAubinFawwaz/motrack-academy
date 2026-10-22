<?php

use App\Http\Controllers\Landing\HomeController;
use App\Http\Controllers\Superadmin;
use App\Http\Controllers\Mentor;
use App\Http\Controllers\Siswa;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'role:superadmin'])
    ->prefix('superadmin')
    ->name('superadmin.')
    ->group(function () {
        Route::get('dashboard', [Superadmin\DashboardController::class, 'index'])->name('dashboard');

        Route::resource('course', Superadmin\CourseController::class)
            ->except(['show']);

        Route::resource('mentor', Superadmin\MentorController::class)
            ->except(['create', 'show', 'edit']);

        Route::get('siswa/create',[Superadmin\SiswaController::class, 'create'])->name('siswa.create');
        Route::resource('siswa', Superadmin\SiswaController::class)
            ->except(['create', 'show', 'edit']);

        Route::get('invoice/create', [Superadmin\InvoiceController::class, 'create'])->name('invoice.create');
        Route::post('invoice', [Superadmin\InvoiceController::class, 'store'])->name('invoice.store');
        Route::get('invoice/{invoice}/pdf', [Superadmin\InvoiceController::class, 'download'])->name('invoice.pdf');
        Route::post('invoice/{invoice}/send', [Superadmin\InvoiceController::class, 'send'])->name('invoice.send');
        Route::resource('invoice/payment-methods', Superadmin\PaymentMethodController::class)
            ->only(['store', 'update', 'destroy']);
        Route::resource('invoice', Superadmin\InvoiceController::class)
            ->only(['index', 'update', 'destroy']);
    });

Route::middleware(['auth', 'role:mentor'])
    ->prefix('mentor')
    ->name('mentor.')
    ->group(function () {
        Route::get('dashboard', [Mentor\DashboardController::class, 'index'])->name('dashboard');

        Route::resource('materi', Mentor\MaterialController::class)
            ->except(['create', 'show', 'edit']);

        Route::resource('tugas', Mentor\AssignmentController::class)
            ->except(['create', 'show', 'edit']);

        Route::resource('submission', Mentor\SubmissionController::class)
            ->only(['index', 'update']);
    });

Route::middleware(['auth', 'role:siswa'])
    ->prefix('siswa')
    ->name('siswa.')
    ->group(function () {
        Route::get('dashboard', [Siswa\DashboardController::class, 'index'])->name('dashboard');

        Route::resource('kelas', Siswa\CourseController::class)
            ->only(['index', 'show']);

        Route::get('materi/{material}', [Siswa\MaterialController::class, 'show'])->name('materi.show');

        Route::resource('submission', Siswa\SubmissionController::class)
            ->only(['index']);
        Route::post('submission/{assignment}', [Siswa\SubmissionController::class, 'store'])
            ->name('submission.store');

        Route::resource('invoice', Siswa\InvoiceController::class)
            ->only(['index', 'update']);
        Route::get('invoice/{invoice}/pdf', [Siswa\InvoiceController::class, 'download'])->name('invoice.pdf');
    });

require __DIR__ . '/settings.php';
