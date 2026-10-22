import { Head, Link } from '@inertiajs/react';
import { LuArrowLeft } from 'react-icons/lu';
import CourseForm from '@/pages/superadmin/course/form';
import SuperadminLayout from '@/layouts/superadmin-layout';
import { index } from '@/actions/App/Http/Controllers/Superadmin/CourseController';

function CourseCreate() {
    return (
        <>
            <Head title="Tambah Kelas" />
            <div className="space-y-5">
                <div className="space-y-3">
                    <Link
                        href={index.url()}
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                    >
                        <LuArrowLeft aria-hidden="true" className="size-4" />
                        Kembali ke kelas
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">
                            Tambah Kelas
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Isi detail kelas dan unggah cover sebelum menyimpan.
                        </p>
                    </div>
                </div>
                <CourseForm />
            </div>
        </>
    );
}

CourseCreate.layout = (page: React.ReactNode) => <SuperadminLayout>{page}</SuperadminLayout>;

export default CourseCreate;
