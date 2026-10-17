<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SiswaController extends Controller
{
    public function index(Request $request): Response
    {
        $siswas = User::query()
            ->where('role', 'siswa')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('superadmin/siswa/index', [
            'siswas' => $siswas,
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

        $validated['role']     = 'siswa';
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('superadmin.siswa.index')
            ->with('success', 'Siswa berhasil ditambahkan');
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
