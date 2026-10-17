<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $courses = Course::latest()->take(6)->get(['id', 'name', 'description', 'price', 'cover_image']);

        $mentors = User::where('role', 'mentor')
            ->latest()
            ->take(8)
            ->get(['id', 'name', 'email']);

        return Inertia::render('welcome', [
            'courses' => $courses,
            'mentors' => $mentors,
        ]);
    }
}
