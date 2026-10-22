import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import {
    LuCheck,
    LuCreditCard,
    LuDownload,
    LuFileImage,
    LuReceipt,
    LuUpload,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import Pagination from '@/components/ui/pagination';
import type { Paginated } from '@/types';
import { update as updateInvoice, download as downloadInvoice } from '@/actions/App/Http/Controllers/Siswa/InvoiceController';
import { index as studentDashboard } from '@/actions/App/Http/Controllers/Siswa/DashboardController';

type Invoice = {
    id: number;
    invoice_number: string;
    amount: number;
    status: 'unpaid' | 'pending' | 'paid';
    payment_proof: string | null;
    pdf_path: string | null;
    created_at: string;
    course: { id: number; name: string; cover_image: string | null };
};

type PaymentMethod = {
    id: number;
    type: 'qris' | 'ewallet' | 'bank_transfer';
    label: string;
    account_name: string | null;
    account_number: string | null;
    qr_image: string | null;
};

type Props = {
    invoices: Paginated<Invoice>;
    paymentMethods: PaymentMethod[];
    hasOpenInvoice: boolean;
};

const statusStyle: Record<Invoice['status'], string> = {
    unpaid: 'bg-slate-100 text-slate-600',
    pending: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
};

const statusLabel: Record<Invoice['status'], string> = {
    unpaid: 'Belum dibayar',
    pending: 'Menunggu konfirmasi',
    paid: 'Lunas',
};

function PaymentProofForm({ invoice }: { invoice: Invoice }) {
    const fileInput = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, errors } = useForm<{
        payment_proof: File | null;
        _method: string;
    }>({
        payment_proof: null,
        _method: 'put',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(updateInvoice.url(invoice.id), { forceFormData: true });
    };

    return (
        <form onSubmit={submit} className="space-y-3 border-t border-slate-200 pt-4">
            {invoice.payment_proof && (
                <a
                    href={`/storage/${invoice.payment_proof}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-navy"
                >
                    <LuFileImage aria-hidden="true" className="size-4" />
                    Lihat bukti yang dikirim
                </a>
            )}
            <div className="space-y-1.5">
                <label htmlFor={`payment-proof-${invoice.id}`} className="text-sm font-medium text-slate-700">
                    Unggah bukti pembayaran
                </label>
                <Input
                    ref={fileInput}
                    id={`payment-proof-${invoice.id}`}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(event) => setData('payment_proof', event.target.files?.[0] ?? null)}
                    className="h-11 bg-white file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-2 file:py-1 file:text-xs file:font-medium file:text-brand-navy"
                />
                <p className="text-xs text-slate-500">JPG atau PNG, maksimal 2 MB.</p>
                <InputError message={errors.payment_proof} />
            </div>
            <Button type="submit" disabled={processing || !data.payment_proof}>
                <LuUpload aria-hidden="true" className="size-4" />
                {processing ? 'Mengirim bukti...' : 'Kirim bukti pembayaran'}
            </Button>
        </form>
    );
}

function StudentInvoiceIndex({ invoices, paymentMethods, hasOpenInvoice }: Props) {
    return (
        <>
            <Head title="Invoice Saya" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">Invoice saya</h1>
                    <p className="mt-1 text-sm text-slate-500">Lihat tagihan paket dan kirim bukti pembayaran di sini.</p>
                </div>

                {hasOpenInvoice && (
                    <section className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-blue">
                                <LuCreditCard aria-hidden="true" className="size-5" />
                            </span>
                            <div>
                                <h2 className="text-base font-semibold text-brand-navy">Metode pembayaran</h2>
                                <p className="mt-1 text-sm text-slate-500">Gunakan salah satu metode berikut. Informasi pembayaran disediakan terpisah dari PDF invoice.</p>
                            </div>
                        </div>
                        {paymentMethods.length ? (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {paymentMethods.map((method) => (
                                    <article key={method.id} className="rounded-lg border border-slate-200 p-4">
                                        <p className="font-semibold text-brand-navy">{method.label}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {method.type === 'qris' ? 'QRIS' : method.type === 'ewallet' ? 'Dompet digital' : 'Transfer bank'}
                                        </p>
                                        {method.account_number && <p className="mt-2 text-sm font-medium text-slate-700">{method.account_number}</p>}
                                        {method.account_name && <p className="text-xs text-slate-500">a.n. {method.account_name}</p>}
                                        {method.qr_image && (
                                            <img
                                                src={`/storage/${method.qr_image}`}
                                                alt={`Kode pembayaran ${method.label}`}
                                                className="mt-3 max-h-48 w-full rounded-lg border border-slate-200 object-contain"
                                            />
                                        )}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                                Metode pembayaran belum tersedia. Silakan hubungi admin.
                            </p>
                        )}
                    </section>
                )}

                {invoices.data.length === 0 ? (
                    <section className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center">
                        <LuReceipt aria-hidden="true" className="mx-auto mb-3 size-10 text-slate-300" />
                        <p className="text-sm font-medium text-slate-700">Belum ada invoice</p>
                        <p className="mt-1 text-xs text-slate-500">Invoice paket yang diterbitkan admin akan muncul di sini.</p>
                    </section>
                ) : (
                    <div className="space-y-4">
                        {invoices.data.map((invoice) => (
                            <article key={invoice.id} className="rounded-xl border border-slate-200 bg-white p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-blue">
                                            <LuReceipt aria-hidden="true" className="size-5" />
                                        </span>
                                        <div>
                                            <p className="font-mono text-sm font-semibold text-brand-navy">{invoice.invoice_number}</p>
                                            <p className="mt-1 text-sm text-slate-700">{invoice.course.name}</p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {new Date(invoice.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                                        <span className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold ${statusStyle[invoice.status]}`}>
                                            {invoice.status === 'paid' && <LuCheck aria-hidden="true" className="mr-1.5 size-3.5" />}
                                            {statusLabel[invoice.status]}
                                        </span>
                                        <span className="text-base font-semibold text-brand-navy">
                                            Rp {invoice.amount.toLocaleString('id-ID')}
                                        </span>
                                        {invoice.pdf_path && (
                                            <a
                                                href={downloadInvoice.url(invoice.id)}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                                            >
                                                <LuDownload aria-hidden="true" className="size-4" />
                                                PDF invoice
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {invoice.status !== 'paid' && <PaymentProofForm invoice={invoice} />}
                            </article>
                        ))}
                    </div>
                )}

                {invoices.last_page > 1 && <Pagination data={invoices} />}
            </div>
        </>
    );
}

StudentInvoiceIndex.layout = (page: React.ReactNode) => (
    <div className="min-h-svh bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
        <header className="mx-auto mb-6 flex max-w-5xl items-center justify-between border-b border-slate-200 pb-4">
            <span className="font-semibold text-brand-navy">Motrack Academy</span>
            <Link
                href={studentDashboard.url()}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
                Kembali ke dashboard
            </Link>
        </header>
        <div className="mx-auto max-w-5xl">{page}</div>
    </div>
);

export default StudentInvoiceIndex;
