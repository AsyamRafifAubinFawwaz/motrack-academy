import { useEffect, useRef, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { LuImagePlus, LuUpload } from 'react-icons/lu';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { index, store, update } from '@/actions/App/Http/Controllers/Superadmin/CourseController';

type Course = {
    id: number;
    name: string;
    description: string;
    price: number;
    cover_image: string | null;
};

type CourseFormData = {
    name: string;
    description: string;
    price: string;
    cover_image: File | null;
};

export default function CourseForm({ course }: { course?: Course }) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(
        course?.cover_image ? `/storage/${course.cover_image}` : null,
    );
    const { data, setData, post, processing, errors, transform } = useForm<CourseFormData>({
        name: course?.name ?? '',
        description: course?.description ?? '',
        price: course?.price.toString() ?? '',
        cover_image: null,
    });

    const handleFile = (file: File | undefined) => {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('File cover harus berupa JPG, PNG, atau GIF.');
            setData('cover_image', null);
            setPreview(course?.cover_image ? `/storage/${course.cover_image}` : null);
            if (fileInput.current) fileInput.current.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran file cover maksimal 2 MB.');
            setData('cover_image', null);
            setPreview(course?.cover_image ? `/storage/${course.cover_image}` : null);
            if (fileInput.current) fileInput.current.value = '';
            return;
        }

        setData('cover_image', file);
        setPreview(URL.createObjectURL(file));
    };

    useEffect(() => {
        return () => {
            if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(event.target.files?.[0]);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (course) {
            transform((formData) => ({ ...formData, _method: 'put' }));
            post(update.url(course.id), {
                forceFormData: true,
            });
            return;
        }

        post(store.url(), { forceFormData: true });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <section className="max-w-3xl rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-brand-navy">
                        Informasi kelas
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Lengkapi detail yang akan dilihat calon murid.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="course-name" className="text-sm font-medium text-slate-700">
                            Nama kelas <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="course-name"
                            type="text"
                            required
                            maxLength={255}
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="Contoh: Web Development Bootcamp"
                            aria-invalid={Boolean(errors.name)}
                            className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="course-description" className="text-sm font-medium text-slate-700">
                            Deskripsi <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            id="course-description"
                            required
                            rows={5}
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            placeholder="Jelaskan materi, tujuan, dan manfaat kelas..."
                            aria-invalid={Boolean(errors.description)}
                            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="course-price" className="text-sm font-medium text-slate-700">
                            Harga (Rp) <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="course-price"
                            type="text"
                            inputMode="numeric"
                            required
                            value={data.price ? Number(data.price).toLocaleString('id-ID') : ''}
                            onChange={(event) => setData('price', event.target.value.replace(/\D/g, ''))}
                            placeholder="500.000"
                            aria-invalid={Boolean(errors.price)}
                            className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                        />
                        <InputError message={errors.price} />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700">
                            Cover kelas {course ? '' : <span className="text-red-600">*</span>}
                        </label>
                        <label
                            htmlFor="course-cover"
                            className={`flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-5 text-center transition-colors focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/30 ${
                                isDragging
                                    ? 'border-brand-blue bg-brand-soft'
                                    : 'border-slate-300 bg-white hover:border-brand-blue hover:bg-brand-soft'
                            }`}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={(event) => {
                                if (
                                    event.relatedTarget instanceof Node &&
                                    event.currentTarget.contains(event.relatedTarget)
                                ) {
                                    return;
                                }

                                setIsDragging(false);
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                setIsDragging(false);
                                handleFile(event.dataTransfer.files.item(0) ?? undefined);
                            }}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Pratinjau cover kelas"
                                    className="max-h-56 w-full rounded-lg object-contain"
                                />
                            ) : (
                                <>
                                    <span className="flex size-11 items-center justify-center rounded-lg bg-brand-soft text-brand-blue">
                                        <LuImagePlus aria-hidden="true" className="size-5" />
                                    </span>
                                    <span className="space-y-1">
                                        <span className="flex items-center justify-center gap-1.5 text-sm font-medium text-brand-navy">
                                            <LuUpload aria-hidden="true" className="size-4" />
                                            Pilih gambar cover
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                            JPG, PNG, atau GIF. Maksimal 2 MB.
                                        </span>
                                    </span>
                                </>
                            )}
                            <input
                                ref={fileInput}
                                id="course-cover"
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                required={!course && !data.cover_image}
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                        </label>
                        {preview && (
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => fileInput.current?.click()}
                            >
                                Ganti gambar
                            </Button>
                        )}
                        <InputError message={errors.cover_image} />
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end sm:px-6">
                    <Button asChild variant="outline">
                        <Link href={index.url()}>Batal</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        {processing ? 'Menyimpan...' : course ? 'Simpan perubahan' : 'Simpan kelas'}
                    </Button>
                </div>
            </section>
        </form>
    );
}
