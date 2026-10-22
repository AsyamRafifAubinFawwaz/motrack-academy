import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import {
    LuArrowLeft,
    LuCheck,
    LuDownload,
    LuFileText,
    LuSearch,
    LuSend,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import SuperadminLayout from '@/layouts/superadmin-layout';
import { create as invoiceCreate, index as invoiceIndex, store as invoiceStore } from '@/actions/App/Http/Controllers/Superadmin/InvoiceController';

import primaryLogo from '../../../../assets/Primary Logo.png';
import secondaryLogo from '../../../../assets/Secondary Logo.png';

type StudentOption = { id: number; name: string; email: string };
type CourseOption = { id: number; name: string; price: number };
type Issuer = { name: string; address: string; phone: string; email: string };
type Props = {
    students: StudentOption[];
    courses: CourseOption[];
    filters: { student_search: string };
    invoiceNumber: string;
};
type InvoiceForm = {
    invoice_number: string;
    student_id: string;
    course_id: string;
    issuer: Issuer;
    invoice_pdf: File | null;
};

const defaultIssuer: Issuer = {
    name: 'Asyam Rafif Aubin Fawwaz',
    address: 'Jember, Jawa Timur',
    phone: '0812-4917-5576',
    email: 'motrackofficial@gmail.com',
};

const currency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);

function InvoiceCreate({ students, courses, filters, invoiceNumber }: Props) {
    const previewRef = useRef<HTMLDivElement>(null);
    const [studentSearch, setStudentSearch] = useState(filters.student_search);
    const [pdfError, setPdfError] = useState('');
    const { data, setData, post, processing, errors, transform } = useForm<InvoiceForm>({
        invoice_number: invoiceNumber,
        student_id: '',
        course_id: '',
        issuer: defaultIssuer,
        invoice_pdf: null,
    });

    useEffect(() => {
        setStudentSearch(filters.student_search);
    }, [filters.student_search]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            if (!studentSearch.trim()) {
                router.get(invoiceCreate.url(), {}, {
                    only: ['students', 'filters'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
                return;
            }

            router.get(
                invoiceCreate.url({
                    query: { student_search: studentSearch.trim() || undefined },
                }),
                {},
                {
                    only: ['students', 'filters'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [studentSearch]);

    const selectedStudent = students.find((student) => String(student.id) === data.student_id);
    const selectedCourse = courses.find((course) => String(course.id) === data.course_id);

    const renderPdf = async () => {
        if (!previewRef.current) {
            throw new Error('Pratinjau invoice belum siap.');
        }

        const image = await toJpeg(previewRef.current, {
            quality: 0.95,
            cacheBust: true,
            pixelRatio: 2,
        });
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (previewRef.current.offsetHeight * width) / previewRef.current.offsetWidth;
        pdf.addImage(image, 'JPEG', 0, 0, width, height);

        return pdf;
    };

    const downloadPdf = async () => {
        setPdfError('');

        try {
            const pdf = await renderPdf();
            pdf.save('Pratinjau-Invoice-Motrack.pdf');
        } catch (error) {
            console.error('Gagal membuat PDF invoice:', error);
            setPdfError('PDF gagal dibuat. Periksa pratinjau lalu coba lagi.');
        }
    };

    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPdfError('');

        try {
            const pdf = await renderPdf();
            const file = new File([pdf.output('blob')], 'invoice.pdf', {
                type: 'application/pdf',
            });

            transform((form) => ({ ...form, invoice_pdf: file }));
            post(invoiceStore.url(), {
                forceFormData: true,
                onFinish: () => transform((form) => form),
            });
        } catch (error) {
            console.error('Gagal membuat PDF invoice:', error);
            setPdfError('PDF gagal dibuat. Periksa pratinjau lalu coba lagi.');
        }
    };

    return (
        <>
            <Head title="Buat Invoice" />
            <div className="space-y-5">
                <div className="space-y-3">
                    <Link
                        href={invoiceIndex.url()}
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                    >
                        <LuArrowLeft aria-hidden="true" className="size-4" />
                        Kembali ke invoice
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">
                            Buat invoice paket
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Pilih murid dan paket. Nominal mengikuti harga paket dan nomor invoice dibuat otomatis.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid items-start gap-6 xl:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.15fr)]">
                    <div className="space-y-5">
                        <section className="rounded-xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-200 px-5 py-4">
                                <h2 className="text-base font-semibold text-brand-navy">Info tagihan</h2>
                                <p className="mt-1 text-sm text-slate-500">Invoice dibuat untuk satu murid dan satu paket.</p>
                            </div>
                            <div className="space-y-5 p-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="student-search" className="text-sm font-medium text-slate-700">
                                        Cari murid
                                    </label>
                                    <div className="relative">
                                        <LuSearch aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="student-search"
                                            type="search"
                                            value={studentSearch}
                                            onChange={(event) => {
                                                setStudentSearch(event.target.value);
                                                setData('student_id', '');
                                            }}
                                            placeholder="Cari nama atau email murid"
                                            className="h-11 pl-10"
                                        />
                                    </div>
                                    <InputError message={errors.student_id} />
                                    {data.student_id && selectedStudent && (
                                        <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-brand-blue bg-brand-soft px-3 py-2">
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-medium text-brand-navy">{selectedStudent.name}</span>
                                                <span className="block truncate text-xs text-slate-600">{selectedStudent.email}</span>
                                            </span>
                                            <LuCheck aria-hidden="true" className="size-4 shrink-0 text-brand-blue" />
                                        </div>
                                    )}
                                    {studentSearch.trim() && (
                                        <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-1">
                                            {students.length ? students.map((student) => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    onClick={() => setData('student_id', String(student.id))}
                                                    className="flex min-h-11 w-full flex-col items-start justify-center rounded-md px-3 py-2 text-left hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                                                >
                                                    <span className="text-sm font-medium text-slate-700">{student.name}</span>
                                                    <span className="text-xs text-slate-500">{student.email}</span>
                                                </button>
                                            )) : (
                                                <p className="px-3 py-3 text-sm text-slate-500">Murid tidak ditemukan.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="invoice-course" className="text-sm font-medium text-slate-700">
                                        Paket / kelas
                                    </label>
                                    <Select value={data.course_id} onValueChange={(value) => setData('course_id', value)}>
                                        <SelectTrigger id="invoice-course" className="w-full bg-white">
                                            <SelectValue placeholder="Pilih paket" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={String(course.id)}>
                                                    {course.name} — {currency(course.price)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.course_id} />
                                    {selectedCourse && (
                                        <p className="text-xs text-slate-500">
                                            Total tagihan: <span className="font-semibold text-brand-navy">{currency(selectedCourse.price)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-200 px-5 py-4">
                                <h2 className="text-base font-semibold text-brand-navy">Diterbitkan oleh</h2>
                                <p className="mt-1 text-sm text-slate-500">Informasi ini disimpan pada invoice dan bisa diubah sebelum dikirim.</p>
                            </div>
                            <div className="grid gap-4 p-5 sm:grid-cols-2">
                                {([
                                    ['name', 'Nama'],
                                    ['address', 'Alamat'],
                                    ['phone', 'WhatsApp / telepon'],
                                    ['email', 'Email'],
                                ] as const).map(([field, label]) => (
                                    <div key={field} className={field === 'address' ? 'space-y-1.5 sm:col-span-2' : 'space-y-1.5'}>
                                        <label htmlFor={`issuer-${field}`} className="text-sm font-medium text-slate-700">{label}</label>
                                        <Input
                                            id={`issuer-${field}`}
                                            type={field === 'email' ? 'email' : 'text'}
                                            value={data.issuer[field]}
                                            onChange={(event) => setData('issuer', { ...data.issuer, [field]: event.target.value })}
                                            className="h-11"
                                        />
                                        <InputError message={errors[`issuer.${field}` as keyof typeof errors]} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="space-y-3">
                            <Button type="submit" disabled={processing || !data.student_id || !data.course_id} className="w-full">
                                <LuSend aria-hidden="true" className="size-4" />
                                {processing ? 'Membuat dan mengirim...' : 'Buat & kirim invoice'}
                            </Button>
                            <Button type="button" variant="outline" onClick={downloadPdf} className="w-full">
                                <LuDownload aria-hidden="true" className="size-4" />
                                Unduh pratinjau PDF
                            </Button>
                            {pdfError && <p role="alert" className="text-sm text-red-600">{pdfError}</p>}
                            <p className="text-xs leading-relaxed text-slate-500">
                                Invoice PDF tidak memuat detail QRIS, DANA, atau rekening. Murid melihat metode pembayaran di halaman invoice setelah menerima tagihan.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-5">
                        <div
                            ref={previewRef}
                            className="relative mx-auto bg-white text-slate-700 shadow-sm"
                            style={{ width: '210mm', minHeight: '297mm', padding: '16mm 14mm' }}
                        >
                            <div className="mb-7 flex items-start justify-between">
                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-blue">Motrack Academy</p>
                                    <h2 className="mt-2 text-[34px] font-extrabold tracking-tight text-brand-navy">INVOICE</h2>
                                </div>
                                <img src={primaryLogo} alt="Logo Motrack Academy" className="h-14 max-w-44 object-contain" />
                            </div>
                            <div className="h-1 rounded-full bg-brand-navy" />

                            <div className="mt-6 grid grid-cols-2 gap-8 text-[11px]">
                                <div className="space-y-1">
                                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-brand-navy">Diterbitkan oleh</h3>
                                    <p className="font-semibold text-slate-800">{data.issuer.name || 'Nama penerbit'}</p>
                                    <p>{data.issuer.address || 'Alamat penerbit'}</p>
                                    <p>WA: {data.issuer.phone || 'Kontak penerbit'}</p>
                                    <p>Email: {data.issuer.email || 'Email penerbit'}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-brand-navy">Ditagihkan kepada</h3>
                                    <p className="font-semibold text-slate-800">{selectedStudent?.name ?? 'Pilih murid'}</p>
                                    <p>{selectedStudent?.email ?? ''}</p>
                                    <p>No. Invoice: {data.invoice_number}</p>
                                    <p>Tanggal: {formatDate(new Date())}</p>
                                </div>
                            </div>

                            <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
                                <table className="w-full border-collapse text-left text-[11px]">
                                    <thead className="bg-brand-navy text-white">
                                        <tr>
                                            <th className="w-12 px-3 py-3 text-center font-semibold">No</th>
                                            <th className="px-3 py-3 font-semibold">Paket / layanan</th>
                                            <th className="w-32 px-3 py-3 text-right font-semibold">Harga</th>
                                            <th className="w-14 px-3 py-3 text-center font-semibold">Qty</th>
                                            <th className="w-36 px-3 py-3 text-right font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="h-14 border-b border-slate-200">
                                            <td className="px-3 py-3 text-center">1</td>
                                            <td className="px-3 py-3 font-semibold text-slate-800">{selectedCourse?.name ?? 'Pilih paket'}</td>
                                            <td className="px-3 py-3 text-right">{selectedCourse ? currency(selectedCourse.price) : '—'}</td>
                                            <td className="px-3 py-3 text-center">1</td>
                                            <td className="px-3 py-3 text-right font-semibold">{selectedCourse ? currency(selectedCourse.price) : '—'}</td>
                                        </tr>
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <tr key={index} className="h-12 border-b border-slate-100">
                                                <td colSpan={5} />
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <img src={secondaryLogo} alt="" className="h-9 max-w-36 object-contain" />
                                <div className="flex min-w-64 justify-between gap-6 rounded-lg bg-brand-navy px-5 py-3 text-[11px] font-semibold text-white">
                                    <span>Total tagihan</span>
                                    <span>{selectedCourse ? currency(selectedCourse.price) : '—'}</span>
                                </div>
                            </div>

                            <div className="absolute right-14 bottom-12 left-14 flex items-end justify-between border-t border-slate-200 pt-3 text-[9px] text-slate-500">
                                <span>Terima kasih telah memilih Motrack Academy.</span>
                                <span className="inline-flex items-center gap-1"><LuFileText aria-hidden="true" className="size-3" /> Dokumen tagihan</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

InvoiceCreate.layout = (page: React.ReactNode) => <SuperadminLayout>{page}</SuperadminLayout>;

export default InvoiceCreate;
