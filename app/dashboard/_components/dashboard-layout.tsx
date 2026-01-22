'use client';
import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLogoutUser, useUser } from '@/lib/api/users.api';
import { useWallets } from '@/lib/api/wallets.api';
import { formatCurrency } from '@/lib/utils';
import { LayoutDashboard, ArrowLeftRight, FolderOpen, Wallet, BarChart3, PiggyBank, Settings, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function DashboardLayoutComponent({ children }: { children: React.ReactNode }) {
    const { data: userData, isLoading: userLoading } = useUser();
    const { id: userId, email, avatarUrl } = userData?.user || {};
    const searchParams = useSearchParams();
    const router = useRouter();

    const walletId = searchParams.get('walletId');

    // Fetch all wallets for the sidebar (no pagination needed for dropdown)
    const { data: walletsData, isLoading: walletsLoading } = useWallets(userId!);
    const wallets = walletsData?.data || [];

    const logout = useLogoutUser();

    async function handleLogout() {
        logout.mutate(undefined, {
            onSuccess: () => {
                toast.success('Logged out successfully');
                router.push('/login');
            },
            onError: (error) => {
                toast.error(`Logout failed: ${error.message}`);
            },
        });
    }

    const handleWalletSelect = (selectedWalletId: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedWalletId === null) {
            params.delete('walletId');
        } else {
            params.set('walletId', selectedWalletId);
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Get user initials for avatar
    const userInitials = email ? email.substring(0, 2).toUpperCase() : '??';

    // Helper to build navigation URLs with search params
    const buildNavUrl = (path: string) => {
        const params = searchParams.toString();
        return params ? `${path}?${params}` : path;
    };

    return (
        <SidebarProvider>
            <Sidebar>
                {/* Sidebar Header - Wallets */}
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton>
                                        <Wallet className="h-4 w-4" />
                                        {walletsLoading ? (
                                            <Skeleton className="h-4 w-32" />
                                        ) : walletId ? (
                                            <span>{wallets.find((w) => w.id === walletId)?.name || 'Select Wallet'}</span>
                                        ) : (
                                            <span>All Wallets</span>
                                        )}
                                        <ChevronDown className="ml-auto h-4 w-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                                    {walletsLoading ? (
                                        <>
                                            {[1, 2, 3].map((i) => (
                                                <DropdownMenuItem key={i}>
                                                    <Skeleton className="h-6 w-full" />
                                                </DropdownMenuItem>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem onSelect={() => handleWalletSelect(null)} className={walletId === null ? 'bg-accent' : ''}>
                                                <Wallet className="h-4 w-4" />
                                                <span>All Wallets</span>
                                                {!walletsLoading && wallets && (
                                                    <span className="ml-auto text-xs text-muted-foreground">{formatCurrency(wallets.reduce((sum, w) => sum + w.balance, 0))}</span>
                                                )}
                                            </DropdownMenuItem>
                                            {wallets.map((wallet) => (
                                                <DropdownMenuItem
                                                    key={wallet.id}
                                                    onSelect={() => handleWalletSelect(wallet.id)}
                                                    className={walletId === wallet.id ? 'bg-accent' : ''}
                                                >
                                                    <Wallet className="h-4 w-4" />
                                                    <span className="truncate">{wallet.name}</span>
                                                    <span
                                                        className={`ml-auto text-xs ${wallet.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                                    >
                                                        {formatCurrency(wallet.balance)}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))}
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    {/* <SidebarGroup>
                        <SidebarGroupLabel>Filter by Wallet</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => handleWalletSelect(null)} isActive={walletId === null} tooltip="All Wallets">
                                        <Wallet className="h-4 w-4" />
                                        <span>All Wallets</span>
                                        {!walletsLoading && wallets && (
                                            <span className="ml-auto text-xs text-muted-foreground">{formatCurrency(wallets.reduce((sum, w) => sum + w.balance, 0))}</span>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>

                                {walletsLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <SidebarMenuItem key={i}>
                                                <Skeleton className="h-10 w-full" />
                                            </SidebarMenuItem>
                                        ))}
                                    </>
                                )}

                                {!walletsLoading &&
                                    wallets?.data.map((wallet) => (
                                        <SidebarMenuItem key={wallet.id}>
                                            <SidebarMenuButton onClick={() => handleWalletSelect(wallet.id)} isActive={walletId === wallet.id} tooltip={wallet.name}>
                                                <Wallet className="h-4 w-4" />
                                                <span className="truncate">{wallet.name}</span>
                                                <span
                                                    className={`ml-auto text-xs ${wallet.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                                >
                                                    {formatCurrency(wallet.balance)}
                                                </span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup> */}
                </SidebarHeader>

                {/* Sidebar Content - Navigation */}
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={buildNavUrl('/dashboard')}>
                                            <LayoutDashboard className="h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={buildNavUrl('/dashboard/transactions')}>
                                            <ArrowLeftRight className="h-4 w-4" />
                                            <span>Transactions</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Coming Soon">
                                        <Link href={buildNavUrl('/dashboard/categories')}>
                                            <FolderOpen className="h-4 w-4" />
                                            <span>Categories</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Coming Soon">
                                        <Link href={buildNavUrl('/dashboard/wallets')}>
                                            <Wallet className="h-4 w-4" />
                                            <span>Wallets</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Coming Soon">
                                        <Link href={buildNavUrl('/dashboard/reports')}>
                                            <BarChart3 className="h-4 w-4" />
                                            <span>Reports</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Coming Soon">
                                        <Link href={buildNavUrl('/dashboard/budget')}>
                                            <PiggyBank className="h-4 w-4" />
                                            <span>Budget</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Sidebar Footer - User Menu */}
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={avatarUrl!} alt={email || 'User'} />
                                            <AvatarFallback>{userLoading ? <Skeleton className="h-6 w-6" /> : userInitials}</AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{email || 'User'}</span>
                                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top" align="start" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <button onClick={handleLogout} className="flex w-full cursor-pointer items-center text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log Out</span>
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            {/* Main Content */}
            <SidebarInset>
                <header className="flex h-14 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <div className="flex-1" />
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="h-screen w-full animate-pulse bg-muted" />}>
            <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
        </Suspense>
    );
}