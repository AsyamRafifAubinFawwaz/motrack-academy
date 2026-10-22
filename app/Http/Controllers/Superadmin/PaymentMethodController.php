<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PaymentMethodController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:qris,ewallet,bank_transfer',
            'label' => 'required|string|max:100',
            'account_name' => 'nullable|required_unless:type,qris|string|max:100',
            'account_number' => 'nullable|required_unless:type,qris|string|max:100',
            'qr_image' => 'nullable|required_if:type,qris|image|mimes:jpeg,jpg,png,webp|max:2048',
            'is_active' => 'required|boolean',
        ]);

        if ($request->hasFile('qr_image')) {
            $validated['qr_image'] = $request->file('qr_image')->store('payment-methods', 'public');
        }

        if ($validated['type'] === 'qris') {
            $validated['account_name'] = null;
            $validated['account_number'] = null;
        }

        PaymentMethod::query()->create($validated);

        return redirect()->route('superadmin.invoice.index')
            ->with('success', 'Metode pembayaran berhasil ditambahkan');
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $validated = $request->validate([
            'type' => 'required|in:qris,ewallet,bank_transfer',
            'label' => 'required|string|max:100',
            'account_name' => 'nullable|required_unless:type,qris|string|max:100',
            'account_number' => 'nullable|required_unless:type,qris|string|max:100',
            'qr_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
            'is_active' => 'required|boolean',
        ]);

        if ($validated['type'] === 'qris' && ! $request->hasFile('qr_image') && ! $paymentMethod->qr_image) {
            return back()->withErrors([
                'qr_image' => 'Gambar QRIS wajib diunggah',
            ])->withInput();
        }

        $previousQrImage = $paymentMethod->qr_image;

        if ($request->hasFile('qr_image')) {
            $validated['qr_image'] = $request->file('qr_image')->store('payment-methods', 'public');
        } elseif ($validated['type'] !== 'qris') {
            $validated['qr_image'] = null;
        } else {
            unset($validated['qr_image']);
        }

        if ($validated['type'] === 'qris') {
            $validated['account_name'] = null;
            $validated['account_number'] = null;
        }

        $paymentMethod->update($validated);

        if ($previousQrImage && $previousQrImage !== $paymentMethod->qr_image) {
            Storage::disk('public')->delete($previousQrImage);
        }

        return redirect()->route('superadmin.invoice.index')
            ->with('success', 'Metode pembayaran berhasil diperbarui');
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        if ($paymentMethod->qr_image) {
            Storage::disk('public')->delete($paymentMethod->qr_image);
        }

        $paymentMethod->delete();

        return redirect()->route('superadmin.invoice.index')
            ->with('success', 'Metode pembayaran berhasil dihapus');
    }
}
