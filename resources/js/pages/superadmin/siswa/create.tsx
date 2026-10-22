import { Head, Link, useForm } from "@inertiajs/react";
import { LuArrowLeft, LuUserPlus } from "react-icons/lu";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import SuperadminLayout from "@/layouts/superadmin-layout";
import {
    create as siswaCreate,
    index as siswaIndex,
    store as siswaStore,
} from "@/actions/App/Http/Controllers/Superadmin/SiswaController";

type Mentor = {
    id: number;
    name: string;
};

type Course = {
    id: number;
    name: string;
    mentors: Mentor[];
};

type Props = {
    courses: Course[];
};

type FormData = {
    name: string;
    email: string;
    password: string;
    course_id: string;
    mentor_id: string;
};

function SiswaCreate({ courses }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: "",
        email: "",
        password: "",
        course_id: "",
        mentor_id: "",
    });

    const selectedCourse = courses.find(
        (course) => String(course.id) === data.course_id,
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(siswaStore.url());
    };

    return (
        <>
            <Head title="Tambah Siswa" />

            <div className="space-y-5">
                <div className="space-y-3">
                    <Link
                        href={siswaIndex.url()}
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-navy"
                    >
                        <LuArrowLeft aria-hidden="true" className="size-4" />
                        Kembali ke siswa
                    </Link>

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">
                            Tambah Siswa
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Isi akun siswa sekaligus pilih kelas dan mentor.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <section className="max-w-3xl rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                            <h2 className="text-base font-semibold text-brand-navy">
                                Data siswa
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Siswa akan langsung terdaftar ke kelas dan
                                mentor yang dipilih.
                            </p>
                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label
                                    htmlFor="student-name"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Nama lengkap
                                </label>
                                <Input
                                    id="student-name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData("name", event.target.value)
                                    }
                                    placeholder="Nama siswa"
                                    required
                                    aria-invalid={Boolean(errors.name)}
                                    className="h-11"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="student-email"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Email
                                </label>
                                <Input
                                    id="student-email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData("email", event.target.value)
                                    }
                                    placeholder="siswa@email.com"
                                    required
                                    aria-invalid={Boolean(errors.email)}
                                    className="h-11"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="student-password"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Password
                                </label>
                                <Input
                                    id="student-password"
                                    type="password"
                                    value={data.password}
                                    onChange={(event) =>
                                        setData("password", event.target.value)
                                    }
                                    placeholder="Minimal 8 karakter"
                                    required
                                    aria-invalid={Boolean(errors.password)}
                                    className="h-11"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="student-course"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Kelas / paket
                                </label>
                                <Select
                                    value={data.course_id}
                                    onValueChange={(value) => {
                                        setData("course_id", value);
                                        setData("mentor_id", "");
                                    }}
                                >
                                    <SelectTrigger
                                        id="student-course"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Pilih kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem
                                                key={course.id}
                                                value={String(course.id)}
                                            >
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.course_id} />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="student-mentor"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Mentor
                                </label>
                                <Select
                                    value={data.mentor_id}
                                    onValueChange={(value) =>
                                        setData("mentor_id", value)
                                    }
                                    disabled={
                                        !selectedCourse ||
                                        selectedCourse.mentors.length === 0
                                    }
                                >
                                    <SelectTrigger
                                        id="student-mentor"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Pilih mentor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedCourse?.mentors.map(
                                            (mentor) => (
                                                <SelectItem
                                                    key={mentor.id}
                                                    value={String(mentor.id)}
                                                >
                                                    {mentor.name}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.mentor_id} />

                                {selectedCourse &&
                                    selectedCourse.mentors.length === 0 && (
                                        <p className="text-xs text-amber-700">
                                            Belum ada mentor yang ditugaskan ke
                                            kelas ini.
                                        </p>
                                    )}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end sm:px-6">
                            <Button asChild variant="outline">
                                <Link href={siswaIndex.url()}>Batal</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.course_id ||
                                    !data.mentor_id
                                }
                            >
                                <LuUserPlus
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                {processing ? "Menyimpan..." : "Tambah siswa"}
                            </Button>
                        </div>
                    </section>
                </form>
            </div>
        </>
    );
}

SiswaCreate.layout = (page: React.ReactNode) => (
    <SuperadminLayout>{page}</SuperadminLayout>
);

export default SiswaCreate;
