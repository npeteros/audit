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
    ChartBarStacked,
    ChevronUp,
    Cog,
    FileText,
    Home,
    User2,
} from "lucide-react";
import Link from "next/link";
import SignOutButton from "./signout-btn";
import Username from "./username-span";
import AppSidebarHeader from "./app-sidebar-header";

export default function AppSidebar() {
    const items = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: Home,
        },
        {
            title: "Transactions",
            url: "/transactions",
            icon: Banknote,
        },
        {
            title: "Categories",
            url: "/categories",
            icon: ChartBarStacked,
        },
        {
            title: "Reports",
            url: "/reports",
            icon: FileText,
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Cog,
        },
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
