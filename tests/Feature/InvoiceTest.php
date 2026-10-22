<?php

use App\Mail\InvoiceCreated;
use App\Models\Course;
use App\Models\Invoice;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

function createInvoiceCourse(int $price = 450000): Course
{
    return Course::query()->create([
        'name' => 'React Fundamental',
        'description' => 'Kelas pengantar React',
        'price' => $price,
        'cover_image' => 'courses/react.png',
    ]);
}

function invoicePayload(User $student, Course $course, ?string $invoiceNumber = null): array
{
    return [
        'invoice_number' => $invoiceNumber ?? 'INV-'.now()->format('Ymd').'-'.Str::upper(Str::random(7)),
        'student_id' => $student->id,
        'course_id' => $course->id,
        'issuer' => [
            'name' => 'Motrack Academy',
            'address' => 'Jember, Jawa Timur',
            'phone' => '0812-0000-0000',
            'email' => 'billing@motrack.test',
        ],
        'invoice_pdf' => UploadedFile::fake()->create('invoice.pdf', 20, 'application/pdf'),
    ];
}

it('creates an invoice from the package price and emails its PDF', function () {
    Storage::fake('local');
    Mail::fake();
    config(['mail.default' => 'smtp']);

    $admin = User::factory()->create(['role' => 'superadmin']);
    $student = User::factory()->create(['role' => 'siswa']);
    $course = createInvoiceCourse();
    $invoiceNumber = 'INV-'.now()->format('Ymd').'-'.Str::upper(Str::random(7));

    $this->actingAs($admin)
        ->post(route('superadmin.invoice.store'), invoicePayload($student, $course, $invoiceNumber))
        ->assertRedirect(route('superadmin.invoice.index'))
        ->assertSessionHas('success');

    $invoice = Invoice::query()->sole();
    expect($invoice->invoice_number)->toBe($invoiceNumber)
        ->and($invoice->amount)->toBe(450000)
        ->and($invoice->status)->toBe('unpaid')
        ->and($invoice->issuer_details['name'])->toBe('Motrack Academy');
    Storage::disk('local')->assertExists($invoice->pdf_path);

    Mail::assertSent(InvoiceCreated::class, fn (InvoiceCreated $mail) => $mail->hasTo($student->email)
        && $mail->invoice->is($invoice));
});

it('generates an invoice number on the invoice creation page', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);

    $response = $this->actingAs($admin)
        ->get(route('superadmin.invoice.create'))
        ->assertOk();

    expect($response->viewData('page')['props']['invoiceNumber'])
        ->toMatch('/^INV-\d{8}-[A-Z0-9]{7}$/');

    $response->assertInertia(fn (Assert $page) => $page
            ->component('superadmin/invoice/create')
            ->has('invoiceNumber'),
        );
});

it('keeps an invoice and warns when email delivery is not configured', function () {
    Storage::fake('local');
    Mail::fake();
    config(['mail.default' => 'array']);

    $admin = User::factory()->create(['role' => 'superadmin']);
    $student = User::factory()->create(['role' => 'siswa']);
    $course = createInvoiceCourse();
    $invoiceNumber = 'INV-'.now()->format('Ymd').'-'.Str::upper(Str::random(7));

    $this->actingAs($admin)
        ->post(route('superadmin.invoice.store'), invoicePayload($student, $course, $invoiceNumber))
        ->assertRedirect(route('superadmin.invoice.index'))
        ->assertSessionHas('warning', "Invoice {$invoiceNumber} tersimpan, tetapi belum dikirim. Atur MAIL_MAILER SMTP agar email benar-benar terkirim.");

    expect(Invoice::query()->sole()->invoice_number)->toBe($invoiceNumber);
    Mail::assertNothingSent();
});

it('prevents a second open invoice for the same student and package', function () {
    Storage::fake('local');
    Mail::fake();

    $admin = User::factory()->create(['role' => 'superadmin']);
    $student = User::factory()->create(['role' => 'siswa']);
    $course = createInvoiceCourse();
    Invoice::query()->create([
        'invoice_number' => 'INV-OPEN-001',
        'student_id' => $student->id,
        'course_id' => $course->id,
        'amount' => 450000,
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->post(route('superadmin.invoice.store'), invoicePayload($student, $course))
        ->assertSessionHasErrors('student_id');

    expect(Invoice::query()->count())->toBe(1);
    expect(Storage::disk('local')->allFiles('invoices'))->toBe([]);
    Mail::assertNothingSent();
});

it('shows only active payment methods to the student', function () {
    $student = User::factory()->create(['role' => 'siswa']);
    $course = createInvoiceCourse();
    Invoice::query()->create([
        'invoice_number' => 'INV-STUDENT-001',
        'student_id' => $student->id,
        'course_id' => $course->id,
        'amount' => 450000,
        'status' => 'paid',
    ]);
    PaymentMethod::query()->create([
        'type' => 'qris',
        'label' => 'QRIS Aktif',
        'qr_image' => 'payment-methods/active.png',
        'is_active' => true,
    ]);
    PaymentMethod::query()->create([
        'type' => 'bank_transfer',
        'label' => 'Bank Nonaktif',
        'account_name' => 'Motrack',
        'account_number' => '123456',
        'is_active' => false,
    ]);

    $this->actingAs($student)
        ->get(route('siswa.invoice.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('siswa/invoice/index')
            ->where('hasOpenInvoice', false)
            ->has('invoices.data', 1)
            ->has('paymentMethods', 1)
            ->where('paymentMethods.0.label', 'QRIS Aktif'),
        );
});

it('clears QRIS fields and files when a payment method changes to bank transfer', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => 'superadmin']);

    $this->actingAs($admin)
        ->post(route('superadmin.payment-methods.store'), [
            'type' => 'qris',
            'label' => 'QRIS Motrack',
            'qr_image' => UploadedFile::fake()->image('qris.png'),
            'is_active' => true,
        ])
        ->assertRedirect(route('superadmin.invoice.index'));

    $method = PaymentMethod::query()->sole();
    $previousQrImage = $method->qr_image;
    Storage::disk('public')->assertExists($previousQrImage);

    $this->put(route('superadmin.payment-methods.update', $method), [
        'type' => 'bank_transfer',
        'label' => 'Bank Motrack',
        'account_name' => 'Motrack Academy',
        'account_number' => '123456789',
        'is_active' => true,
    ])->assertRedirect(route('superadmin.invoice.index'));

    expect($method->fresh()->qr_image)->toBeNull()
        ->and($method->fresh()->account_name)->toBe('Motrack Academy');
    Storage::disk('public')->assertMissing($previousQrImage);
});

it('accepts a student payment proof and marks the invoice pending', function () {
    Storage::fake('public');

    $student = User::factory()->create(['role' => 'siswa']);
    $course = createInvoiceCourse();
    $invoice = Invoice::query()->create([
        'invoice_number' => 'INV-STUDENT-002',
        'student_id' => $student->id,
        'course_id' => $course->id,
        'amount' => 450000,
        'status' => 'unpaid',
    ]);

    $this->actingAs($student)
        ->put(route('siswa.invoice.update', $invoice), [
            'payment_proof' => UploadedFile::fake()->image('proof.png'),
        ])
        ->assertRedirect(route('siswa.invoice.index'))
        ->assertSessionHas('success');

    expect($invoice->fresh()->status)->toBe('pending')
        ->and($invoice->fresh()->payment_proof)->not->toBeNull();
    Storage::disk('public')->assertExists($invoice->fresh()->payment_proof);
});

it('prevents a student from downloading another student invoice', function () {
    $owner = User::factory()->create(['role' => 'siswa']);
    $otherStudent = User::factory()->create(['role' => 'siswa']);
    $course = createInvoiceCourse();
    $invoice = Invoice::query()->create([
        'invoice_number' => 'INV-PRIVATE-001',
        'student_id' => $owner->id,
        'course_id' => $course->id,
        'amount' => 450000,
        'pdf_path' => 'invoices/private.pdf',
        'status' => 'unpaid',
    ]);
    Storage::fake('local');
    Storage::disk('local')->put($invoice->pdf_path, 'private PDF');

    $this->actingAs($otherStudent)
        ->get(route('siswa.invoice.pdf', $invoice))
        ->assertForbidden();
});

it('allows the invoice owner to download the private PDF', function () {
    $student = User::factory()->create(['role' => 'siswa']);
    $course = createInvoiceCourse();
    $invoice = Invoice::query()->create([
        'invoice_number' => 'INV-PRIVATE-002',
        'student_id' => $student->id,
        'course_id' => $course->id,
        'amount' => 450000,
        'pdf_path' => 'invoices/student.pdf',
        'status' => 'unpaid',
    ]);
    Storage::fake('local');
    Storage::disk('local')->put($invoice->pdf_path, 'private PDF');

    $this->actingAs($student)
        ->get(route('siswa.invoice.pdf', $invoice))
        ->assertDownload('INV-PRIVATE-002.pdf');
});

it('does not allow a student to upload proof for a paid invoice', function () {
    Storage::fake('public');

    $student = User::factory()->create(['role' => 'siswa']);
    $course = createInvoiceCourse();
    $invoice = Invoice::query()->create([
        'invoice_number' => 'INV-PAID-002',
        'student_id' => $student->id,
        'course_id' => $course->id,
        'amount' => 450000,
        'status' => 'paid',
    ]);

    $this->actingAs($student)
        ->put(route('siswa.invoice.update', $invoice), [
            'payment_proof' => UploadedFile::fake()->image('proof.png'),
        ])
        ->assertForbidden();

    expect($invoice->fresh()->payment_proof)->toBeNull()
        ->and($invoice->fresh()->status)->toBe('paid');
    expect(Storage::disk('public')->allFiles('payment_proofs'))->toBe([]);
});

it('requires a student role to access the invoice portal', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);

    $this->actingAs($admin)
        ->get(route('siswa.invoice.index'))
        ->assertForbidden();
});
