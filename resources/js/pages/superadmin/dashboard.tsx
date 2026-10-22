import { Head } from '@inertiajs/react';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
    type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
    LuGraduationCap,
    LuTrendingUp,
    LuUsers,
    LuWallet,
} from 'react-icons/lu';
import SuperadminLayout from '@/layouts/superadmin-layout';
import { chartColors } from '@/lib/chart-colors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Stats = {
    total_pendapatan: number;
    total_siswa: number;
    total_mentor: number;
};

type CourseRevenue = {
    name: string;
    amount: number;
};

type Props = {
    stats: Stats;
    pendapatan_per_kursus: CourseRevenue[];
};

const currencyFormat = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const compactCurrencyFormat = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
});

const statCards = (stats: Stats) => [
    {
        label: 'Total Pendapatan',
        value: currencyFormat.format(stats.total_pendapatan),
        description: 'Dari invoice yang sudah lunas',
        icon: LuWallet,
    },
    {
        label: 'Total Murid',
        value: stats.total_siswa.toLocaleString('id-ID'),
        description: 'Akun dengan role siswa',
        icon: LuUsers,
    },
    {
        label: 'Total Mentor',
        value: stats.total_mentor.toLocaleString('id-ID'),
        description: 'Akun mentor terdaftar',
        icon: LuGraduationCap,
    },
];

const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: chartColors.brandNavy,
            padding: 12,
            callbacks: {
                label: (context) => ` ${currencyFormat.format(context.parsed.x ?? 0)}`,
            },
        },
    },
    scales: {
        x: {
            beginAtZero: true,
            grid: { color: chartColors.grid },
            ticks: {
                color: chartColors.tick,
                callback: (value) => compactCurrencyFormat.format(Number(value)),
            },
        },
        y: {
            grid: { display: false },
            ticks: {
                color: chartColors.tick,
                autoSkip: false,
            },
        },
    },
};

export default function Dashboard({ stats, pendapatan_per_kursus }: Props) {
    const revenueChart = {
        labels: pendapatan_per_kursus.map((course) => course.name),
        datasets: [
            {
                label: 'Pendapatan',
                data: pendapatan_per_kursus.map((course) => course.amount),
                backgroundColor: chartColors.brandBlue,
                hoverBackgroundColor: chartColors.brandBlueDark,
                borderRadius: 5,
                barThickness: 22,
            },
        ],
    };

    return (
        <>
            <Head title="Dashboard Superadmin" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Ringkasan performa Motrack Academy.
                    </p>
                </div>

                <section aria-label="Ringkasan statistik" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {statCards(stats).map((card) => (
                        <article
                            key={card.label}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-500">
                                        {card.label}
                                    </p>
                                    <p className="mt-1.5 break-words text-xl font-semibold leading-tight tracking-tight text-brand-navy tabular-nums">
                                        {card.value}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        {card.description}
                                    </p>
                                </div>
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-blue">
                                    <card.icon aria-hidden="true" className="size-[18px]" />
                                </span>
                            </div>
                        </article>
                    ))}
                </section>

                <section
                    aria-labelledby="revenue-chart-title"
                    className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
                >
                    <div className="mb-5">
                        <h2 id="revenue-chart-title" className="text-lg font-semibold text-brand-navy">
                            Pendapatan per kursus
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Maksimal 8 kursus dengan invoice lunas terbanyak.
                        </p>
                    </div>

                    {pendapatan_per_kursus.length > 0 ? (
                        <div className="h-64 sm:h-80">
                            <Bar
                                aria-label="Grafik pendapatan dari invoice lunas per kursus"
                                role="img"
                                data={revenueChart}
                                options={chartOptions}
                            />
                        </div>
                    ) : (
                        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg bg-slate-50 px-4 text-center">
                            <LuTrendingUp aria-hidden="true" className="size-6 text-slate-400" />
                            <p className="text-sm font-medium text-slate-700">
                                Belum ada pendapatan tercatat
                            </p>
                            <p className="text-xs text-slate-500">
                                Grafik akan muncul setelah ada invoice berstatus lunas.
                            </p>
                        </div>
                    )}
                </section>

            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <SuperadminLayout>{page}</SuperadminLayout>;
