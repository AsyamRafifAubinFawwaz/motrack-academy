import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    LuBookOpen,
    LuCirclePlus,
    LuPencil,
    LuSearch,
    LuTrash2,
    LuX,
} from 'react-icons/lu';
import Pagination from '@/components/ui/pagination';
import SuperadminLayout from '@/layouts/superadmin-layout';
import { create, destroy, edit, index } from '@/actions/App/Http/Controllers/Superadmin/CourseController';
import type { Paginated } from '@/types';

type Course = {
    id: number;
    name: string;
    description: string;
    price: number;
    cover_image: string | null;
    created_at: string;
};

type Props = {
    courses: Paginated<Course>;
    filters: { search?: string };
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(price);

export default function CourseIndex({ courses, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const skipSearch = useRef(true);

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        if (skipSearch.current) {
            skipSearch.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                index.url({ query: search.trim() ? { search: search.trim() } : {} }),
                {},
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const handleDelete = (course: Course) => {
        if (confirm(`Hapus kelas "${course.name}"?`)) {
            router.delete(destroy.url(course.id), { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Kelola Kelas" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">
                            Kelola Kelas
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola informasi dan harga kelas yang tersedia.
                        </p>
                    </div>
                    <Link
                        href={create.url()}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-blue-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:transform-none"
                    >
                        <LuCirclePlus aria-hidden="true" className="size-4" />
                        Tambah Kelas
                    </Link>
                </div>

                <section
                    aria-label="Daftar kelas"
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <h2 className="text-sm font-semibold text-brand-navy">
                                Semua kelas
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {courses.total.toLocaleString('id-ID')} kelas terdaftar
                            </p>
                        </div>

                        <div className="flex w-full items-center gap-2 sm:max-w-sm">
                            <label className="relative min-w-0 flex-1">
                                <span className="sr-only">Cari nama kelas</span>
                                <LuSearch
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Cari nama kelas..."
                                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                                />
                            </label>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    aria-label="Hapus pencarian"
                                    className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                                >
                                    <LuX aria-hidden="true" className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Kelas
                                    </th>
                                    <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Harga
                                    </th>
                                    <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Tanggal dibuat
                                    </th>
                                    <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-14 text-center">
                                            <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-blue">
                                                <LuBookOpen aria-hidden="true" className="size-5" />
                                            </span>
                                            <p className="text-sm font-medium text-slate-700">
                                                {search ? 'Kelas tidak ditemukan' : 'Belum ada kelas'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {search
                                                    ? 'Coba kata kunci lain atau hapus pencarian.'
                                                    : 'Tambahkan kelas pertama untuk mulai mengelola katalog.'}
                                            </p>
                                            {search ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearch('')}
                                                    className="mt-3 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark"
                                                >
                                                    Hapus pencarian
                                                </button>
                                            ) : (
                                                <Link
                                                    href={create.url()}
                                                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand-blue hover:bg-brand-soft"
                                                >
                                                    <LuCirclePlus aria-hidden="true" className="size-4" />
                                                    Tambah kelas
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    courses.data.map((course) => (
                                        <tr
                                            key={course.id}
                                            className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {course.cover_image ? (
                                                        <img
                                                            src={`/storage/${course.cover_image}`}
                                                            alt=""
                                                            className="size-11 shrink-0 rounded-lg border border-slate-200 object-cover"
                                                        />
                                                    ) : (
                                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-blue">
                                                            <LuBookOpen aria-hidden="true" className="size-5" />
                                                        </span>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-brand-navy">
                                                            {course.name}
                                                        </p>
                                                        <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-slate-500">
                                                            {course.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-slate-700">
                                                {formatPrice(course.price)}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500">
                                                {new Date(course.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={edit.url(course.id)}
                                                        aria-label={`Edit kelas ${course.name}`}
                                                        title="Edit kelas"
                                                        className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-brand-blue hover:bg-brand-soft hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                                                    >
                                                        <LuPencil aria-hidden="true" className="size-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(course)}
                                                        aria-label={`Hapus kelas ${course.name}`}
                                                        title="Hapus kelas"
                                                        className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                                    >
                                                        <LuTrash2 aria-hidden="true" className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-200 px-4 py-3 sm:px-5">
                        <Pagination data={courses} />
                    </div>
                </section>
            </div>
        </>
    );
}

CourseIndex.layout = (page: React.ReactNode) => <SuperadminLayout>{page}</SuperadminLayout>;
