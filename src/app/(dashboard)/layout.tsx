"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./_components/app-sidebar";
import "../globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-screen">
                    <div className="flex w-full justify-between px-4 pt-4">
                        <SidebarTrigger />
                        <Button variant={"outline"} className="rounded-md p-2">
                            <Moon className="size-4" />
                        </Button>
                    </div>
                    {children}
                </main>
            </SidebarProvider>
        </QueryClientProvider>
    );
}
