<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SiswaController extends Controller
{
    public function index(Request $request): Response
    {
        $siswas = User::query()
            ->where('role', 'siswa')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('superadmin/siswa/index', [
            'siswas' => $siswas,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        $courses = Course::query()
            ->with(['mentors:id,name'])
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('superadmin/siswa/create', [
            'courses' => $courses,
        ]);
    }



public function store(Request $request)
{
    $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'unique:users,email'],
        'password' => ['required', 'string', 'min:8'],
        'course_id' => ['required', 'integer', 'exists:courses,id'],
        'mentor_id' => ['required', 'integer', 'exists:users,id'],
    ]);

    DB::transaction(function () use ($validated) {
        $course = Course::query()->find($validated['course_id']);

        if (! $course) {
            throw ValidationException::withMessages([
                'course_id' => 'Kelas yang dipilih tidak ditemukan.',
            ]);
        }

        $mentorIsAssigned = $course->mentors()
            ->where('users.role', 'mentor')
            ->whereKey($validated['mentor_id'])
            ->exists();

        if (! $mentorIsAssigned) {
            throw ValidationException::withMessages([
                'mentor_id' => 'Mentor yang dipilih tidak terdaftar pada kelas tersebut.',
            ]);
        }

        $siswa = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'siswa',
        ]);

        $course->students()->attach($siswa->id, [
            'mentor_id' => $validated['mentor_id'],
            'status' => 'active',
        ]);
    });

    return redirect()->route('superadmin.siswa.index')
        ->with('success', 'Siswa berhasil ditambahkan dan didaftarkan ke kelas');
}

    public function update(Request $request, User $siswa)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $siswa->id,
            'password' => 'nullable|string|min:8',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $siswa->update($validated);

        return redirect()->route('superadmin.siswa.index')
            ->with('success', 'Siswa berhasil diupdate');
    }

    public function destroy(User $siswa)
    {
        $siswa->delete();

        return redirect()->route('superadmin.siswa.index')
            ->with('success', 'Siswa berhasil dihapus');
    }
}
