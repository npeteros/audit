"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    Banknote,
    ChartColumnIncreasing,
    ChevronUp,
    Home,
    User2,
    // ChartBarStacked,
    // Cog,
    // FileText,
} from "lucide-react";
import Link from "next/link";
import SignOutButton from "@/app/(dashboard)/_components/signout-btn";
import Username from "@/app/(dashboard)/_components/username-span";
import AppSidebarHeader from "./app-sidebar-header";
import { useCurrentWallet } from "../../WalletContext";

export default function AppSidebar() {
    const wallet = useCurrentWallet();

    const items = [
        {
            title: "General",
            url: "/wallets/dashboard",
            icon: Home,
        },
        {
            title: "Dashboard",
            url: `/wallet/${wallet.id}/dashboard`,
            icon: ChartColumnIncreasing,
        },
        {
            title: "Transactions",
            url: `/wallet/${wallet.id}/transactions`,
            icon: Banknote,
        },
        // {
        //     title: "Categories",
        //     url: `/wallet/${wallet.id}/categories`,
        //     icon: ChartBarStacked,
        // },
        // {
        //     title: "Reports",
        //     url: `/wallet/${wallet.id}/reports`,
        //     icon: FileText,
        // },
        // {
        //     title: "Settings",
        //     url: `/wallet/${wallet.id}/settings`,
        //     icon: Cog,
        // },
    ];

    return (
        <Sidebar>
            <AppSidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>AuditPH</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem
                                    key={item.title}
                                    className="hover:bg-muted"
                                >
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 /> <Username />
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="min-w-[var(--radix-popper-anchor-width)]"
                            >
                                <DropdownMenuItem>
                                    <span>Account</span>
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem>
                                    <span>Billing</span>
                                </DropdownMenuItem> */}
                                <SignOutButton />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
