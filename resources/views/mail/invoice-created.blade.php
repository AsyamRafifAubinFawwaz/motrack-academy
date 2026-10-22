<!DOCTYPE html>
<html lang="id">
<body style="margin:0;background:#f8fafc;color:#334155;font-family:Arial,sans-serif">
    <main style="max-width:600px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:12px">
        <h1 style="margin:0 0 16px;color:#222569;font-size:22px">Invoice kelas Anda</h1>
        <p>Halo {{ $invoice->student->name }},</p>
        <p>Invoice untuk paket <strong>{{ $invoice->course->name }}</strong> telah dibuat.</p>
        <p style="padding:16px;background:#f1f5f9;border-radius:8px">
            Nomor invoice: <strong>{{ $invoice->invoice_number }}</strong><br>
            Total tagihan: <strong>Rp {{ number_format($invoice->amount, 0, ',', '.') }}</strong>
        </p>
        <p>PDF invoice terlampir. Silakan masuk ke portal murid untuk melihat metode pembayaran dan mengirim bukti pembayaran.</p>
        <p style="margin:24px 0">
            <a href="{{ route('siswa.invoice.index') }}" style="display:inline-block;padding:12px 18px;background:#3f5bd9;color:#fff;text-decoration:none;border-radius:8px">Buka invoice saya</a>
        </p>
        <p>Terima kasih,<br>{{ $invoice->issuer_details['name'] ?? 'Motrack Academy' }}</p>
    </main>
</body>
</html>
