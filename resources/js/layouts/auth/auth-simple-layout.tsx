import { Link } from '@inertiajs/react';
import { LuGraduationCap } from 'react-icons/lu';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen lg:grid lg:grid-cols-2">
            {/* Kiri: Form */}
            <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-16">
                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <Link href={home()} className="mb-8 flex items-center gap-3">
                        <img
                            src="/images/logo.svg"
                            alt="Motrack Academy"
                            className="h-8 w-8"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="text-xl font-bold text-brand-navy">Motrack Academy</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-brand-navy">{title}</h1>
                        <p className="mt-2 text-base leading-relaxed text-slate-500">{description}</p>
                    </div>

                    {children}
                </div>
            </div>

            {/* Kanan: Panel brand-navy */}
            <div className="relative hidden bg-brand-navy lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
                {/* Konten tengah */}
                <div className="relative z-10 text-center">
                    {/* Logo */}
                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10">
                        <LuGraduationCap className="h-12 w-12 text-white" />
                    </div>

                    <h2 className="text-3xl font-bold text-white">
                        Platform Belajar Coding
                    </h2>
                    <p className="mt-3 text-lg font-semibold text-brand-blue">
                        Bersama Praktisi Industri
                    </p>
                    <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-400">
                        Tingkatkan skill kodingmu dengan kurikulum terstruktur dan
                        bimbingan langsung dari mentor berpengalaman.
                    </p>

                    {/* Stats */}
                    <div className="mt-10 grid grid-cols-3 gap-6">
                        {[
                            { label: 'Siswa Aktif', value: '500+' },
                            { label: 'Mentor Expert', value: '20+' },
                            { label: 'Kelas Tersedia', value: '15+' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-xl border border-brand-soft bg-brand-soft p-4">
                                <div className="text-2xl font-bold text-brand-blue">{stat.value}</div>
                                <div className="mt-1 text-xs text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
