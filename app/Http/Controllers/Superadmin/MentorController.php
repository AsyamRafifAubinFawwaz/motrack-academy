<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class MentorController extends Controller
{
    public function index(Request $request): Response
    {
        $mentors = User::query()
            ->where('role', 'mentor')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('superadmin/mentor/index', [
            'mentors' => $mentors,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $validated['role']     = 'mentor';
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('superadmin.mentor.index')
            ->with('success', 'Mentor berhasil ditambahkan');
    }

    public function update(Request $request, User $mentor)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $mentor->id,
            'password' => 'nullable|string|min:8',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $mentor->update($validated);

        return redirect()->route('superadmin.mentor.index')
            ->with('success', 'Mentor berhasil diupdate');
    }

    public function destroy(User $mentor)
    {
        $mentor->delete();

        return redirect()->route('superadmin.mentor.index')
            ->with('success', 'Mentor berhasil dihapus');
    }
}
