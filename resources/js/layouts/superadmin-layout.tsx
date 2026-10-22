import { Link, usePage } from '@inertiajs/react';
import { useFlashToast } from '@/hooks/use-flash-toast';
import {
    LuBookOpen,
    LuGraduationCap,
    LuLayoutDashboard,
    LuLogOut,
    LuReceipt,
    LuUsers,
} from 'react-icons/lu';
import {
    Avatar,
    AvatarFallback,
} from '@/components/ui/avatar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import type { Auth } from '@/types';
import { useEffect } from 'react';

const navItems = [
    { title: 'Dashboard', href: '/superadmin/dashboard', icon: LuLayoutDashboard },
    { title: 'Kelola Kelas', href: '/superadmin/course', icon: LuBookOpen },
    { title: 'Kelola Mentor', href: '/superadmin/mentor', icon: LuGraduationCap },
    { title: 'Kelola Siswa', href: '/superadmin/siswa', icon: LuUsers },
    { title: 'Invoice', href: '/superadmin/invoice', icon: LuReceipt },
];

function SuperadminShell({ children }: { children: React.ReactNode }) {
    const page = usePage<{ auth: Auth }>();
    const { auth } = page.props;
    const { setOpenMobile } = useSidebar();
    const currentPath = page.url.split('?')[0];
    const initials = auth?.user?.name?.charAt(0)?.toUpperCase() ?? 'A';

    useEffect(() => {
        setOpenMobile(false);
    }, [currentPath, setOpenMobile]);

    return (
        <>
            <Sidebar collapsible="icon">
                <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-3 py-0">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                size="lg"
                                tooltip={{ children: 'Motrack Academy' }}
                                className="h-14 gap-3 rounded-lg px-2 group-data-[collapsible=icon]:[&>span:last-child]:hidden"
                            >
                                <Link
                                    href="/superadmin/dashboard"
                                    onClick={() => setOpenMobile(false)}
                                    aria-label="Motrack Academy - Dashboard"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-navy">
                                        <LuGraduationCap aria-hidden="true" className="size-5" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-[13px] font-bold leading-tight text-brand-navy">
                                            Motrack Academy
                                        </span>
                                        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                            Panel superadmin
                                        </span>
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup className="px-3 py-4">
                        <SidebarGroupLabel className="h-7 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Menu utama
                        </SidebarGroupLabel>
                        <SidebarMenu className="gap-0.5">
                            {navItems.map((item) => {
                                const active =
                                    currentPath === item.href ||
                                    currentPath.startsWith(`${item.href}/`);

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={{ children: item.title }}
                                            className="h-11 gap-2 rounded-lg text-xs data-[active=true]:bg-brand-blue data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:[&>svg]:text-white data-[active=true]:hover:bg-brand-blue-dark data-[active=true]:hover:text-white group-data-[collapsible=icon]:[&>span]:hidden [&>svg]:size-4.5"
                                        >
                                            <Link
                                                href={item.href}
                                                onClick={() => setOpenMobile(false)}
                                                aria-current={active ? 'page' : undefined}
                                            >
                                                <item.icon aria-hidden="true" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="gap-0 p-3">
                    <SidebarSeparator className="mb-2" />
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: 'Keluar' }}
                                className="h-11 gap-2 rounded-lg text-xs hover:bg-red-50 hover:text-red-600 group-data-[collapsible=icon]:[&>span]:hidden [&>svg]:size-4.5"
                            >
                                <Link href="/logout" method="post" as="button">
                                    <LuLogOut aria-hidden="true" />
                                    <span>Keluar</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset className="min-w-0 bg-slate-50">
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
                    <SidebarTrigger />

                    <div className="flex-1" />

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-[13px] font-semibold leading-none text-brand-navy">
                                {auth?.user?.name ?? 'Admin'}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">Superadmin</p>
                        </div>
                        <Avatar className="size-9">
                            <AvatarFallback className="bg-brand-navy text-[13px] font-semibold text-white">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </SidebarInset>

        </>
    );
}

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
    useFlashToast();

    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': '16rem',
                    '--sidebar-width-icon': '4.5rem',
                } as React.CSSProperties
            }
        >
            <SuperadminShell>{children}</SuperadminShell>
        </SidebarProvider>
    );
}
