<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(): Response
    {
        $siswa = Auth::user();

        $invoices = Invoice::where('student_id', $siswa->id)
            ->with('course:id,name,cover_image')
            ->latest()
            ->paginate(10);

        return Inertia::render('siswa/invoice/index', [
            'invoices' => $invoices,
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $siswa = Auth::user();

        abort_unless($invoice->student_id === $siswa->id, 403);

        // Siswa hanya boleh upload bukti bayar (status pending)
        $validated = $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($invoice->payment_proof) {
            Storage::disk('public')->delete($invoice->payment_proof);
        }

        $invoice->update([
            'payment_proof' => $request->file('payment_proof')->store('payment_proofs', 'public'),
            'status'        => 'pending',
        ]);

        return redirect()->route('siswa.invoice.index')
            ->with('success', 'Bukti pembayaran berhasil dikirim');
    }
}
