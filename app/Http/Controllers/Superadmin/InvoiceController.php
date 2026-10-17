<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $invoices = Invoice::query()
            ->with(['student:id,name,email', 'course:id,name'])
            ->when($request->search, fn ($q, $s) => $q->whereHas(
                'student', fn ($q) => $q->where('name', 'like', "%{$s}%")
            ))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('superadmin/invoice/index', [
            'invoices' => $invoices,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'required|in:unpaid,pending,paid',
        ]);

        $invoice->update($validated);

        return redirect()->route('superadmin.invoice.index')
            ->with('success', 'Status invoice berhasil diupdate');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return redirect()->route('superadmin.invoice.index')
            ->with('success', 'Invoice berhasil dihapus');
    }
}
