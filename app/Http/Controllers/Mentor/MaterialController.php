<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MaterialController extends Controller
{
    public function index(Request $request): Response
    {
        $mentor = Auth::user();

        // Hanya materi dari kelas yang diajar mentor ini
        $materials = Material::query()
            ->whereHas('course.mentors', fn ($q) => $q->where('users.id', $mentor->id))
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->with('course:id,name')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $courses = Course::whereHas('mentors', fn ($q) => $q->where('users.id', $mentor->id))
            ->select('id', 'name')
            ->get();

        return Inertia::render('mentor/materi/index', [
            'materials' => $materials,
            'courses'   => $courses,
            'filters'   => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $mentor = Auth::user();

        $validated = $request->validate([
            'course_id'   => 'required|exists:courses,id',
            'title'       => 'required|string|max:255',
            'content'     => 'nullable|string',
            'youtube_url' => 'nullable|url|max:255',
            'file_path'   => 'nullable|file|mimes:pdf|max:10240',
            'order'       => 'required|integer|min:1',
        ]);

        // Pastikan mentor hanya bisa tambah materi ke kelas sendiri
        $course = Course::whereHas('mentors', fn ($q) => $q->where('users.id', $mentor->id))
            ->findOrFail($validated['course_id']);

        if ($request->hasFile('file_path')) {
            $validated['file_path'] = $request->file('file_path')->store('materials', 'public');
        }

        Material::create($validated);

        return redirect()->route('mentor.materi.index')
            ->with('success', 'Materi berhasil ditambahkan');
    }

    public function update(Request $request, Material $material)
    {
        $mentor = Auth::user();

        // Scope: materi harus dari kelas yang diajar mentor ini
        abort_unless(
            $material->course->mentors()->where('users.id', $mentor->id)->exists(),
            403
        );

        $validated = $request->validate([
            'course_id'   => 'required|exists:courses,id',
            'title'       => 'required|string|max:255',
            'content'     => 'nullable|string',
            'youtube_url' => 'nullable|url|max:255',
            'file_path'   => 'nullable|file|mimes:pdf|max:10240',
            'order'       => 'required|integer|min:1',
        ]);

        if ($request->hasFile('file_path')) {
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
            }
            $validated['file_path'] = $request->file('file_path')->store('materials', 'public');
        } else {
            unset($validated['file_path']);
        }

        $material->update($validated);

        return redirect()->route('mentor.materi.index')
            ->with('success', 'Materi berhasil diupdate');
    }

    public function destroy(Material $material)
    {
        $mentor = Auth::user();

        abort_unless(
            $material->course->mentors()->where('users.id', $mentor->id)->exists(),
            403
        );

        $material->delete();

        return redirect()->route('mentor.materi.index')
            ->with('success', 'Materi berhasil dihapus');
    }
}
