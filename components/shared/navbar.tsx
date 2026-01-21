'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/user-provider';
import { useLogoutUser } from '@/lib/api/users.api';
import { toast } from 'sonner';

type NavLinkProps = {
    name: string;
    href: string;
};

const navLinks: NavLinkProps[] = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/#pricing' },
];

export default function Navbar() {
    const router = useRouter();
    const logout = useLogoutUser();
    const { userId, avatarUrl, email, isLoading } = useUser();

    const signOut = () => {
        logout.mutate(undefined, {
            onSuccess: () => {
                toast.success('Logged out successfully');
                router.push('/login');
            },
            onError: (error) => {
                toast.error(`Logout failed: ${error.message}`);
            },
        });
    };

    const getInitials = (email: string | null) => {
        if (!email) return 'U';
        return email.charAt(0).toUpperCase();
    };

    return (
        <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-6">
            {/* Logo - Left Side */}
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center">
                    <Image src="/audit-black.png" alt="AuditPH" className="max-h-16 max-w-16 dark:hidden" width={200} height={124} priority />
                    <Image src="/audit-white.png" alt="AuditPH" className="max-h-16 max-w-16 hidden dark:block" width={200} height={124} priority />
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex md:items-center md:gap-6 lg:gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.name} href={link.href} className="text-sm font-medium text-foreground transition-colors hover:text-foreground">
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Mobile Menu - Left Side */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className='px-6'>
                    <nav className="grid gap-6 py-6">
                        <Link href="/" className="flex items-center">
                            <Image src="/audit-black.png" alt="AuditPH" className="max-h-24 max-w-24 dark:hidden" width={200} height={124} />
                            <Image src="/audit-white.png" alt="AuditPH" className="max-h-24 max-w-24 hidden dark:block" width={200} height={124} />
                        </Link>
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground">
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* User Actions - Right Side */}
            <div className="flex items-center gap-4">
                {isLoading ? (
                    <Skeleton className="h-10 w-10 rounded-full" />
                ) : userId ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="size-8">
                                        
                                    <AvatarImage src={avatarUrl || '/default.png'} alt={email || 'User'} />
                                    <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(email)}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">My Account</p>
                                    {email && <p className="text-xs leading-none text-muted-foreground">{email}</p>}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {userId && (
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/dashboard">Dashboard</Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={signOut}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button asChild variant="default" size="sm">
                        <Link href="/login">Sign In</Link>
                    </Button>
                )}
            </div>
        </header>
    );
}
