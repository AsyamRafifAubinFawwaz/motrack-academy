<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MaterialController extends Controller
{
    public function show(Material $material): Response
    {
        $siswa = Auth::user();

        // Pastikan siswa hanya bisa baca materi dari kelas yang dia ikuti
        abort_unless(
            $material->course->students()->where('users.id', $siswa->id)->exists(),
            403
        );

        // Materi sebelum & sesudah untuk navigasi
        $prev = Material::where('course_id', $material->course_id)
            ->where('order', '<', $material->order)
            ->orderBy('order', 'desc')
            ->select('id', 'title', 'order')
            ->first();

        $next = Material::where('course_id', $material->course_id)
            ->where('order', '>', $material->order)
            ->orderBy('order')
            ->select('id', 'title', 'order')
            ->first();

        // Daftar semua materi di sidebar
        $allMaterials = Material::where('course_id', $material->course_id)
            ->orderBy('order')
            ->select('id', 'title', 'order')
            ->get();

        return Inertia::render('siswa/materi/show', [
            'material'     => $material->load('course:id,name'),
            'prev'         => $prev,
            'next'         => $next,
            'allMaterials' => $allMaterials,
        ]);
    }
}
