<?php

use App\Models\Course;
use App\Models\Invoice;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('superadmin dashboard shows revenue and separate student and mentor totals', function () {
    $student = User::factory()->create(['role' => 'siswa']);
    User::factory()->create(['role' => 'mentor']);
    User::factory()->create(['role' => 'mentor']);
    User::factory()->create(['role' => 'superadmin']);

    $course = Course::query()->create([
        'name' => 'React Fundamental',
        'description' => 'Kelas pengantar React',
        'price' => 500000,
        'cover_image' => 'courses/react.png',
    ]);

    Invoice::query()->create([
        'invoice_number' => 'INV-PAID-001',
        'student_id' => $student->id,
        'course_id' => $course->id,
        'amount' => 500000,
        'status' => 'paid',
    ]);
    Invoice::query()->create([
        'invoice_number' => 'INV-PENDING-001',
        'student_id' => $student->id,
        'course_id' => $course->id,
        'amount' => 500000,
        'status' => 'pending',
    ]);

    $this->actingAs(User::factory()->create(['role' => 'superadmin']))
        ->get(route('superadmin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('superadmin/dashboard')
            ->where('stats.total_pendapatan', 500000)
            ->where('stats.total_siswa', 1)
            ->where('stats.total_mentor', 2)
            ->where('pendapatan_per_kursus', [
                ['name' => 'React Fundamental', 'amount' => 500000],
            ]),
        );
});
