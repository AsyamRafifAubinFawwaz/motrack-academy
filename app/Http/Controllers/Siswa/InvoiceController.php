<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Invoice;
use App\Models\PaymentMethod;
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

        $invoices = Invoice::query()->where('student_id', $siswa->id)
            ->with('course:id,name,cover_image')
            ->latest()
            ->paginate(10);

        return Inertia::render('siswa/invoice/index', [
            'invoices' => $invoices,
            'hasOpenInvoice' => Invoice::query()
                ->where('student_id', $siswa->id)
                ->whereIn('status', ['unpaid', 'pending'])
                ->exists(),
            'paymentMethods' => PaymentMethod::query()
                ->where('is_active', true)
                ->latest()
                ->get(['id', 'type', 'label', 'account_name', 'account_number', 'qr_image']),
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $siswa = Auth::user();

        abort_unless($invoice->student_id === $siswa->id, 403);
        abort_unless($invoice->status !== 'paid', 403);

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $previousProof = $invoice->payment_proof;
        $proofPath = $request->file('payment_proof')->store('payment_proofs', 'public');

        $invoice->update([
            'payment_proof' => $proofPath,
            'status'        => 'pending',
        ]);

        if ($previousProof) {
            Storage::disk('public')->delete($previousProof);
        }

        return redirect()->route('siswa.invoice.index')
            ->with('success', 'Bukti pembayaran berhasil dikirim');
    }

    public function download(Invoice $invoice)
    {
        abort_unless($invoice->student_id === Auth::id(), 403);
        abort_unless($invoice->pdf_path && Storage::disk('local')->exists($invoice->pdf_path), 404);

        return Storage::disk('local')->download($invoice->pdf_path, $invoice->invoice_number.'.pdf');
    }
}
