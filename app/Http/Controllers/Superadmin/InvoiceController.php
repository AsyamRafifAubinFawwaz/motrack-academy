<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Invoice;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Mail\InvoiceCreated;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Throwable;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

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
            'paymentMethods' => PaymentMethod::query()->latest()->get(),
        ]);
    }

    public function create(Request $request): Response
    {
        $studentSearch = $request->string('student_search')->trim()->toString();
        $students = User::query()
            ->where('role', 'siswa')
            ->when($studentSearch !== '', fn (Builder $query) => $query->where(
                fn (Builder $query) => $query
                    ->where('name', 'like', "%{$studentSearch}%")
                    ->orWhere('email', 'like', "%{$studentSearch}%")
            ))
            ->when($studentSearch === '', fn (Builder $query) => $query->whereRaw('1 = 0'))
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name', 'email']);

        return Inertia::render('superadmin/invoice/create', [
            'students' => $students,
            'courses' => Course::query()->orderBy('name')->get(['id', 'name', 'price']),
            'filters' => ['student_search' => $studentSearch],
            'invoiceNumber' => $this->generateInvoiceNumber(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_number' => ['required', 'string', 'max:20', 'regex:/^INV-\d{8}-[A-Z0-9]{7}$/', 'unique:invoices,invoice_number'],
            'student_id' => 'required|integer|exists:users,id',
            'course_id' => 'required|integer|exists:courses,id',
            'issuer.name' => 'required|string|max:255',
            'issuer.address' => 'required|string|max:500',
            'issuer.phone' => 'required|string|max:50',
            'issuer.email' => 'required|email|max:255',
            'invoice_pdf' => 'required|file|mimes:pdf|max:5120',
        ]);

        $pdfPath = $request->file('invoice_pdf')->store('invoices', 'local');

        try {
            $invoice = DB::transaction(function () use ($validated, $pdfPath) {
                $student = User::query()
                    ->where('role', 'siswa')
                    ->lockForUpdate()
                    ->findOrFail($validated['student_id']);
                $course = Course::query()->findOrFail($validated['course_id']);

                $hasOpenInvoice = Invoice::query()
                    ->where('student_id', $student->id)
                    ->where('course_id', $course->id)
                    ->whereIn('status', ['unpaid', 'pending'])
                    ->exists();

                if ($hasOpenInvoice) {
                    throw ValidationException::withMessages([
                        'student_id' => 'Murid ini masih memiliki invoice yang belum lunas untuk paket tersebut.',
                    ]);
                }

                $invoice = Invoice::query()->create([
                    'invoice_number' => $validated['invoice_number'],
                    'student_id' => $student->id,
                    'course_id' => $course->id,
                    'amount' => $course->price,
                    'issuer_details' => $validated['issuer'],
                    'pdf_path' => $pdfPath,
                    'status' => 'unpaid',
                ]);

                return $invoice->load(['student', 'course']);
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($pdfPath);
            throw $exception;
        }

        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            return redirect()->route('superadmin.invoice.index')
                ->with('warning', "Invoice {$invoice->invoice_number} tersimpan, tetapi belum dikirim. Atur MAIL_MAILER SMTP agar email benar-benar terkirim.");
        }

        try {
            Mail::to($invoice->student->email)->send(new InvoiceCreated($invoice));
        } catch (TransportExceptionInterface $exception) {
            report($exception);

            return redirect()->route('superadmin.invoice.index')
                ->with('error', "Invoice {$invoice->invoice_number} tersimpan, tetapi email gagal dikirim. Periksa konfigurasi email lalu kirim ulang.");
        }

        return redirect()->route('superadmin.invoice.index')
            ->with('success', "Invoice {$invoice->invoice_number} berhasil dibuat dan dikirim ke {$invoice->student->email}");
    }

    public function send(Invoice $invoice)
    {
        if (! $invoice->pdf_path || ! Storage::disk('local')->exists($invoice->pdf_path)) {
            return back()->with('error', 'File PDF invoice tidak ditemukan. Buat ulang invoice sebelum mengirim.');
        }

        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            return back()->with('error', 'Email belum dikirim. Atur MAIL_MAILER SMTP terlebih dahulu.');
        }

        try {
            Mail::to($invoice->student()->firstOrFail()->email)->send(new InvoiceCreated($invoice));
        } catch (TransportExceptionInterface $exception) {
            report($exception);

            return back()->with('error', 'Email invoice gagal dikirim. Periksa konfigurasi email dan coba lagi.');
        }

        return back()->with('success', "Invoice {$invoice->invoice_number} berhasil dikirim ulang.");
    }

    public function download(Invoice $invoice)
    {
        abort_unless($invoice->pdf_path && Storage::disk('local')->exists($invoice->pdf_path), 404);

        return Storage::disk('local')->download($invoice->pdf_path, $invoice->invoice_number.'.pdf');
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

    private function generateInvoiceNumber(): string
    {
        do {
            $invoiceNumber = 'INV-'.now()->format('Ymd').'-'.Str::upper(Str::random(7));
        } while (Invoice::withTrashed()->where('invoice_number', $invoiceNumber)->exists());

        return $invoiceNumber;
    }
}
