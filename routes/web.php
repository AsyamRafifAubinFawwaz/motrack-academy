<?php

use App\Http\Controllers\Landing\HomeController;
use App\Http\Controllers\Superadmin;
use App\Http\Controllers\Mentor;
use App\Http\Controllers\Siswa;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified', 'role:superadmin'])
    ->prefix('superadmin')
    ->name('superadmin.')
    ->group(function () {
        Route::get('dashboard', [Superadmin\DashboardController::class, 'index'])->name('dashboard');

        Route::resource('course', Superadmin\CourseController::class)
            ->except(['create', 'show', 'edit']);

        Route::resource('mentor', Superadmin\MentorController::class)
            ->except(['create', 'show', 'edit']);

        Route::resource('siswa', Superadmin\SiswaController::class)
            ->except(['create', 'show', 'edit']);

        Route::resource('invoice', Superadmin\InvoiceController::class)
            ->only(['index', 'update', 'destroy']);
    });

Route::middleware(['auth', 'verified', 'role:mentor'])
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

Route::middleware(['auth', 'verified', 'role:siswa'])
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
    });

require __DIR__ . '/settings.php';
