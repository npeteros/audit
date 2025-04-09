"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

export default function Navbar() {
    const navLinks = [
        {
            name: "Browse",
            href: "/browse",
        },
        {
            name: "About",
            href: "/about",
        },
    ];

    const router = useRouter();
    const { user } = useSession();

    const signOut = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
            router.push("/login");
        } catch (error) {
            console.error("Error during login", error);
        }
    };

    return (
        <header className="top-0 z-50 flex h-20 w-full items-center justify-between gap-4 border-b bg-[#F8F8F8] px-4 md:px-6">
            <div className="hidden w-full md:block">
                <Link href="/">
                    <Image
                        src="/audit-black.png"
                        alt="AuditPH"
                        className="max-h-20 max-w-20"
                        width={2000}
                        height={1247}
                    />
                </Link>
            </div>
            <nav className="hidden flex-col gap-6 font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-10">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="text-neutral-800 transition-colors hover:font-bold hover:text-neutral-900"
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        size="icon"
                        className="shrink-0 border border-neutral-400 md:hidden"
                    >
                        <Menu />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-neutral-700">
                    <nav className="grid gap-6 px-8 py-4 text-lg font-medium">
                        <Link href="/">
                            <Image
                                src="/audit-white.png"
                                alt="AuditPH"
                                className="max-h-24 max-w-24"
                                width={2000}
                                height={1247}
                            />
                        </Link>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-white transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>

            {user ? (
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto flex-1 sm:flex-initial"></div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="cursor-pointer rounded-full"
                            >
                                <Avatar>
                                    <AvatarImage src="/default.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">
                                    Toggle user menu
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={async () => {
                                    await signOut();
                                }}
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <div className="w-full"></div>
            )}
        </header>
    );
}
