import { Head, router, useForm } from '@inertiajs/react';
import {
    LuCirclePlus,
    LuGraduationCap,
    LuPencil,
    LuSearch,
    LuTrash2,
    LuX,
} from 'react-icons/lu';
import { useState } from 'react';
import SuperadminLayout from '@/layouts/superadmin-layout';
import Pagination from '@/components/ui/pagination';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Paginated } from '@/types';
import { index as mentorIndex } from '@/actions/App/Http/Controllers/Superadmin/MentorController';

type Mentor = {
    id: number;
    name: string;
    email: string;
    created_at: string;
};

type Props = {
    mentors: Paginated<Mentor>;
    filters: { search?: string };
};

type FormData = {
    name: string;
    email: string;
    password: string;
    _method?: string;
};

function MentorModal({
    mentor,
    onClose,
}: {
    mentor?: Mentor;
    onClose: () => void;
}) {
    const isEdit = !!mentor;

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: mentor?.name ?? '',
        email: mentor?.email ?? '',
        password: '',
        ...(isEdit ? { _method: 'put' } : {}),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit
            ? `/superadmin/mentor/${mentor!.id}`
            : '/superadmin/mentor';
        post(url, {
            forceFormData: true,
            onSuccess: () => { onClose(); reset(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h3 className="text-xl font-semibold text-brand-navy">
                        {isEdit ? 'Edit Mentor' : 'Tambah Mentor'}
                    </h3>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Tutup">
                        <LuX aria-hidden="true" className="size-5" />
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-5 px-6 py-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-navy">Nama Lengkap</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nama mentor"
                            className="w-full min-h-[44px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-navy">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="mentor@email.com"
                            className="w-full min-h-[44px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-brand-navy">
                            Password{isEdit && <span className="ml-1 text-xs font-normal text-slate-400">(kosongkan jika tidak diubah)</span>}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={isEdit ? '••••••••' : 'Minimal 8 karakter'}
                            className="w-full min-h-[44px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-1"
                        >
                            {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Mentor'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MentorIndex({ mentors, filters }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editMentor, setEditMentor] = useState<Mentor | undefined>();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(
            mentorIndex.url({ query: { search: e.target.value || undefined } }),
            {},
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (mentor: Mentor) => {
        if (confirm(`Hapus mentor "${mentor.name}"?`)) {
            router.delete(`/superadmin/mentor/${mentor.id}`);
        }
    };

    return (
        <>
            <Head title="Kelola Mentor" />
            {modalOpen && (
                <MentorModal
                    mentor={editMentor}
                    onClose={() => setModalOpen(false)}
                />
            )}

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-navy">Kelola Mentor</h1>
                        <p className="mt-1 text-sm text-slate-500">Total {mentors.total} mentor terdaftar</p>
                    </div>
                    <Button
                        type="button"
                        onClick={() => { setEditMentor(undefined); setModalOpen(true); }}
                    >
                        <LuCirclePlus aria-hidden="true" className="size-4" />
                        Tambah Mentor
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4">
                        <div className="relative max-w-sm">
                            <LuSearch aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="search"
                                defaultValue={filters.search}
                                onChange={handleSearch}
                                placeholder="Cari mentor..."
                                aria-label="Cari mentor"
                                className="h-11 bg-white pl-10 text-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Bergabung</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mentors.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center">
                                            <LuGraduationCap aria-hidden="true" className="mx-auto mb-3 size-10 text-slate-300" />
                                            <p className="text-sm font-medium text-slate-500">Belum ada mentor</p>
                                        </td>
                                    </tr>
                                ) : (
                                    mentors.data.map((mentor) => (
                                        <tr key={mentor.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-navy">
                                                        {mentor.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-brand-navy">{mentor.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{mentor.email}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(mentor.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => { setEditMentor(mentor); setModalOpen(true); }}
                                                        aria-label={`Edit ${mentor.name}`}
                                                        className="text-slate-500 hover:border-brand-blue hover:text-brand-navy"
                                                    >
                                                        <LuPencil aria-hidden="true" className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(mentor)}
                                                        aria-label={`Hapus ${mentor.name}`}
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

                    {mentors.last_page > 1 && (
                        <div className="border-t border-slate-200 px-6 py-4">
                            <Pagination data={mentors} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

MentorIndex.layout = (page: React.ReactNode) => <SuperadminLayout>{page}</SuperadminLayout>;
