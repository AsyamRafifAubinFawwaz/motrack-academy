import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    LuCirclePlus,
    LuChevronDown,
    LuCreditCard,
    LuDownload,
    LuPencil,
    LuReceipt,
    LuSearch,
    LuSend,
    LuTrash2,
    LuUpload,
    LuX,
} from 'react-icons/lu';
import { useRef, useState } from 'react';
import SuperadminLayout from '@/layouts/superadmin-layout';
import Pagination from '@/components/ui/pagination';
import type { Paginated } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    create as createInvoice,
    download as downloadInvoice,
    destroy as destroyInvoice,
    index as invoiceIndex,
    send as sendInvoice,
    update as updateInvoice,
} from '@/actions/App/Http/Controllers/Superadmin/InvoiceController';
import {
    destroy as destroyPaymentMethod,
    store as storePaymentMethod,
    update as updatePaymentMethod,
} from '@/actions/App/Http/Controllers/Superadmin/PaymentMethodController';

type Invoice = {
    id: number;
    invoice_number: string;
    amount: number;
    status: 'unpaid' | 'pending' | 'paid';
    payment_proof: string | null;
    pdf_path: string | null;
    created_at: string;
    student: { id: number; name: string; email: string };
    course: { id: number; name: string };
};

type Props = {
    invoices: Paginated<Invoice>;
    filters: { search?: string; status?: string };
    paymentMethods: PaymentMethod[];
};

type PaymentMethod = {
    id: number;
    type: 'qris' | 'ewallet' | 'bank_transfer';
    label: string;
    account_name: string | null;
    account_number: string | null;
    qr_image: string | null;
    is_active: boolean;
};

type PaymentMethodForm = {
    type: PaymentMethod['type'];
    label: string;
    account_name: string;
    account_number: string;
    qr_image: File | null;
    is_active: boolean;
    _method?: string;
};

const statusBadge: Record<Invoice['status'], string> = {
    unpaid: 'border-slate-200 bg-slate-100 text-slate-600',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const statusLabel: Record<Invoice['status'], string> = {
    unpaid: 'Belum Bayar',
    pending: 'Menunggu Konfirmasi',
    paid: 'Lunas',
};

function StatusModal({
    invoice,
    onClose,
}: {
    invoice: Invoice;
    onClose: () => void;
}) {
    const { data, setData, post, processing } = useForm({
        status: invoice.status,
        _method: 'put',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(updateInvoice.url(invoice.id), {
            forceFormData: true,
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h3 className="text-xl font-semibold text-brand-navy">Update Status Invoice</h3>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Tutup">
                        <LuX aria-hidden="true" className="size-5" />
                    </Button>
                </div>
                <form onSubmit={submit} className="space-y-5 px-6 py-5">
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Invoice</p>
                        <p className="font-semibold text-brand-navy">{invoice.invoice_number}</p>
                        <p className="mt-1 text-sm text-slate-500">
                            {invoice.student.name} — {invoice.course.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-brand-navy">
                            Rp {invoice.amount.toLocaleString('id-ID')}
                        </p>
                    </div>

                    {invoice.payment_proof && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-brand-navy">Bukti Pembayaran</p>
                            <a
                                href={`/storage/${invoice.payment_proof}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={`/storage/${invoice.payment_proof}`}
                                    alt="Bukti bayar"
                                    className="h-40 w-full rounded-lg border border-slate-200 object-cover"
                                />
                            </a>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-navy">Status</label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value as Invoice['status'])}
                        >
                            <SelectTrigger className="h-11 w-full rounded-lg bg-white">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unpaid">Belum Bayar</SelectItem>
                                <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                                <SelectItem value="paid">Lunas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="flex-1">
                            {processing ? 'Menyimpan...' : 'Simpan Status'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PaymentMethodsPanel({ methods }: { methods: PaymentMethod[] }) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [editing, setEditing] = useState<PaymentMethod | null>(null);
    const { data, setData, post, processing, errors, reset, transform } = useForm<PaymentMethodForm>({
        type: 'qris',
        label: '',
        account_name: '',
        account_number: '',
        qr_image: null,
        is_active: true,
    });

    const startEditing = (method: PaymentMethod) => {
        setEditing(method);
        setData({
            type: method.type,
            label: method.label,
            account_name: method.account_name ?? '',
            account_number: method.account_number ?? '',
            qr_image: null,
            is_active: method.is_active,
            _method: 'put',
        });
        if (fileInput.current) fileInput.current.value = '';
    };

    const cancelEditing = () => {
        setEditing(null);
        reset();
        if (fileInput.current) fileInput.current.value = '';
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editing) {
            transform((form) => ({ ...form, _method: 'put' }));
            post(updatePaymentMethod.url(editing.id), {
                forceFormData: true,
                onSuccess: cancelEditing,
                onFinish: () => transform((form) => form),
            });
            return;
        }

        post(storePaymentMethod.url(), {
            forceFormData: true,
            onSuccess: cancelEditing,
        });
    };

    const handleDelete = (method: PaymentMethod) => {
        if (confirm(`Hapus metode pembayaran "${method.label}"?`)) {
            router.delete(destroyPaymentMethod.url(method.id));
        }
    };

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-brand-navy">Metode pembayaran</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Atur QRIS, dompet digital, atau rekening. Informasi ini tampil di portal murid dan tidak dicetak pada PDF invoice.
                </p>
            </div>
            <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
                <div className="space-y-3">
                    {methods.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                            Belum ada metode pembayaran.
                        </p>
                    ) : methods.map((method) => (
                        <article key={method.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center">
                            {method.qr_image && (
                                <img
                                    src={`/storage/${method.qr_image}`}
                                    alt={`QRIS ${method.label}`}
                                    className="size-20 rounded-lg border border-slate-200 object-contain"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-brand-navy">{method.label}</p>
                                <p className="text-xs text-slate-500">
                                    {method.type === 'qris' ? 'QRIS' : method.type === 'ewallet' ? 'Dompet digital' : 'Transfer bank'}
                                    {method.account_number ? ` · ${method.account_number}` : ''}
                                </p>
                                {method.account_name && <p className="text-xs text-slate-500">a.n. {method.account_name}</p>}
                                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${method.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {method.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="icon" aria-label={`Edit ${method.label}`} onClick={() => startEditing(method)}>
                                    <LuPencil aria-hidden="true" className="size-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" aria-label={`Hapus ${method.label}`} className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(method)}>
                                    <LuTrash2 aria-hidden="true" className="size-4" />
                                </Button>
                            </div>
                        </article>
                    ))}
                </div>

                <form onSubmit={submit} className="space-y-4 rounded-lg bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-brand-navy">
                        {editing ? 'Edit metode pembayaran' : 'Tambah metode pembayaran'}
                    </h3>
                    <div className="space-y-1.5">
                        <label htmlFor="payment-method-type" className="text-sm font-medium text-slate-700">Jenis</label>
                        <Select value={data.type} onValueChange={(value) => setData('type', value as PaymentMethod['type'])}>
                            <SelectTrigger id="payment-method-type" className="w-full bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="qris">QRIS</SelectItem>
                                <SelectItem value="ewallet">DANA / dompet digital</SelectItem>
                                <SelectItem value="bank_transfer">Transfer bank</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="payment-method-label" className="text-sm font-medium text-slate-700">Nama metode</label>
                        <Input id="payment-method-label" value={data.label} onChange={(event) => setData('label', event.target.value)} placeholder="Contoh: QRIS Motrack" className="h-11 bg-white" />
                        <InputError message={errors.label} />
                    </div>
                    {data.type !== 'qris' && (
                        <>
                            <div className="space-y-1.5">
                                <label htmlFor="payment-account-number" className="text-sm font-medium text-slate-700">Nomor rekening / akun</label>
                                <Input id="payment-account-number" value={data.account_number} onChange={(event) => setData('account_number', event.target.value)} className="h-11 bg-white" />
                                <InputError message={errors.account_number} />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="payment-account-name" className="text-sm font-medium text-slate-700">Atas nama</label>
                                <Input id="payment-account-name" value={data.account_name} onChange={(event) => setData('account_name', event.target.value)} className="h-11 bg-white" />
                                <InputError message={errors.account_name} />
                            </div>
                        </>
                    )}
                    <div className="space-y-1.5">
                        <label htmlFor="payment-qr-image" className="text-sm font-medium text-slate-700">
                            Gambar QRIS {data.type === 'qris' ? <span className="text-red-600">*</span> : '(opsional)'}
                        </label>
                        <Input
                            ref={fileInput}
                            id="payment-qr-image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) => setData('qr_image', event.target.files?.[0] ?? null)}
                            className="h-11 bg-white file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-2 file:py-1 file:text-xs file:font-medium file:text-brand-navy"
                        />
                        <p className="text-xs text-slate-500">Format JPG, PNG, atau WebP. Maksimal 2 MB.</p>
                        <InputError message={errors.qr_image} />
                    </div>
                    <label htmlFor="payment-method-active" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-700">
                        <Checkbox
                            id="payment-method-active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked === true)}
                        />
                        Tampilkan sebagai metode aktif
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={processing}>
                            <LuCreditCard aria-hidden="true" className="size-4" />
                            {processing ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Tambah metode'}
                        </Button>
                        {editing && <Button type="button" variant="outline" onClick={cancelEditing}>Batal</Button>}
                    </div>
                </form>
            </div>
        </section>
    );
}

export default function InvoiceIndex({ invoices, filters, paymentMethods }: Props) {
    const [statusModal, setStatusModal] = useState<Invoice | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(
            invoiceIndex.url({
                query: {
                    search: e.target.value || undefined,
                    status: filters.status || undefined,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilter = (status: string) => {
        router.get(
            invoiceIndex.url({
                query: {
                    search: filters.search || undefined,
                    status: status === 'all' ? undefined : status,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (invoice: Invoice) => {
        if (confirm(`Hapus invoice "${invoice.invoice_number}"?`)) {
            router.delete(destroyInvoice.url(invoice.id));
        }
    };

    return (
        <>
            <Head title="Invoice" />
            {statusModal && <StatusModal invoice={statusModal} onClose={() => setStatusModal(null)} />}

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">Invoice</h1>
                    <p className="mt-1 text-sm text-slate-500">Total {invoices.total} invoice</p>
                </div>
                <Link href={createInvoice.url()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-blue-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:transform-none">
                    <LuCirclePlus aria-hidden="true" className="size-4" />
                    Buat invoice
                </Link>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {/* Filters */}
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1 max-w-sm">
                            <LuSearch aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input type="search" defaultValue={filters.search} onChange={handleSearch}
                                placeholder="Cari nama siswa..."
                                aria-label="Cari nama siswa"
                                className="h-11 bg-white pl-10 text-sm" />
                        </div>
                        <Select value={filters.status ?? 'all'} onValueChange={handleStatusFilter}>
                            <SelectTrigger className="h-11 w-full rounded-lg bg-white sm:w-52">
                                <SelectValue placeholder="Semua status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="unpaid">Belum Bayar</SelectItem>
                                <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                                <SelectItem value="paid">Lunas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Siswa</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Jumlah</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <LuReceipt aria-hidden="true" className="mx-auto mb-3 size-10 text-slate-300" />
                                            <p className="text-sm font-medium text-slate-500">Belum ada invoice</p>
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.data.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <p className="font-mono text-sm font-semibold text-brand-navy">{invoice.invoice_number}</p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(invoice.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-brand-navy">{invoice.student.name}</p>
                                                <p className="text-xs text-slate-500">{invoice.student.email}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{invoice.course.name}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-brand-navy">
                                                Rp {invoice.amount.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setStatusModal(invoice)}
                                                    aria-label={`Ubah status invoice ${invoice.invoice_number}`}
                                                    className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${statusBadge[invoice.status]}`}
                                                >
                                                    {statusLabel[invoice.status]}
                                                    <LuChevronDown aria-hidden="true" className="size-3.5" />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <Button
                                                        asChild
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Unduh invoice ${invoice.invoice_number}`}
                                                        disabled={!invoice.pdf_path}
                                                    >
                                                        <a href={downloadInvoice.url(invoice.id)} download>
                                                            <LuDownload aria-hidden="true" className="size-4" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Kirim ulang invoice ${invoice.invoice_number}`}
                                                        onClick={() => router.post(sendInvoice.url(invoice.id))}
                                                        className="text-brand-blue hover:bg-brand-soft hover:text-brand-navy"
                                                    >
                                                        <LuSend aria-hidden="true" className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(invoice)}
                                                        aria-label={`Hapus invoice ${invoice.invoice_number}`}
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <LuTrash2 aria-hidden="true" className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {invoices.last_page > 1 && (
                        <div className="border-t border-slate-200 px-6 py-4">
                            <Pagination data={invoices} />
                        </div>
                    )}
                </div>
                <PaymentMethodsPanel methods={paymentMethods} />
            </div>
        </>
    );
}

InvoiceIndex.layout = (page: React.ReactNode) => <SuperadminLayout>{page}</SuperadminLayout>;
