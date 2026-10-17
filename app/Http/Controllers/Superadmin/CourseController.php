<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $courses = Course::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('superadmin/course/index', [
            'courses' => $courses,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'price'       => 'required|integer|min:0',
            'cover_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $validated['cover_image'] = $request->file('cover_image')->store('courses', 'public');
        Course::create($validated);

        return redirect()->route('superadmin.course.index')
            ->with('success', 'Kelas berhasil ditambahkan');
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'price'       => 'required|integer|min:0',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('cover_image')) {
            if ($course->cover_image) {
                Storage::disk('public')->delete($course->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('courses', 'public');
        } else {
            unset($validated['cover_image']);
        }

        $course->update($validated);

        return redirect()->route('superadmin.course.index')
            ->with('success', 'Kelas berhasil diupdate');
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('superadmin.course.index')
            ->with('success', 'Kelas berhasil dihapus');
    }
}
