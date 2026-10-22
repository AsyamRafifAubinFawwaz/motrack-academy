import { Link } from '@inertiajs/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import type { Paginated } from '@/types';

type Props<T> = {
    data: Paginated<T>;
};

export default function Pagination<T>({ data }: Props<T>) {
    const firstItem = data.total === 0 ? 0 : (data.current_page - 1) * data.per_page + 1;
    const lastItem = Math.min(data.current_page * data.per_page, data.total);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
                Menampilkan{' '}
                <span className="font-semibold text-slate-700">
                    {firstItem}–{lastItem}
                </span>{' '}
                dari <span className="font-semibold text-slate-700">{data.total}</span> data
            </p>

            {data.last_page > 1 && (
                <nav aria-label="Navigasi halaman" className="flex items-center gap-1">
                    {data.links.map((link, index) => {
                        const isPrevious = index === 0;
                        const isNext = index === data.links.length - 1;
                        const isEllipsis = link.label === '...';

                        if (isEllipsis) {
                            return (
                                <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-400" aria-hidden="true">
                                    …
                                </span>
                            );
                        }

                        if (!link.url) {
                            return (
                                <span
                                    key={`disabled-${index}`}
                                    aria-disabled="true"
                                    aria-label={isPrevious ? 'Halaman sebelumnya' : 'Halaman berikutnya'}
                                    className="flex size-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 text-slate-300"
                                >
                                    {isPrevious ? (
                                        <LuChevronLeft aria-hidden="true" className="size-4" />
                                    ) : isNext ? (
                                        <LuChevronRight aria-hidden="true" className="size-4" />
                                    ) : (
                                        link.label
                                    )}
                                </span>
                            );
                        }

                        return (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url}
                                preserveScroll
                                aria-label={isPrevious ? 'Halaman sebelumnya' : isNext ? 'Halaman berikutnya' : `Halaman ${link.label}`}
                                aria-current={link.active ? 'page' : undefined}
                                className={[
                                    'flex size-10 items-center justify-center rounded-lg border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2',
                                    isPrevious || isNext ? 'text-slate-600' : 'font-medium',
                                    link.active
                                        ? 'border-brand-blue bg-brand-soft text-brand-navy'
                                        : 'border-slate-200 text-slate-600 hover:border-brand-blue hover:bg-slate-50 hover:text-brand-navy',
                                ].join(' ')}
                            >
                                {isPrevious ? (
                                    <LuChevronLeft aria-hidden="true" className="size-4" />
                                ) : isNext ? (
                                    <LuChevronRight aria-hidden="true" className="size-4" />
                                ) : (
                                    link.label
                                )}
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
}
