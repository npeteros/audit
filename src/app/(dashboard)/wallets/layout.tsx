import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./_components/app-sidebar";
import "@/app/globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-screen">
                <div className="flex w-full justify-between px-4 pt-4">
                    <SidebarTrigger />
                    <ThemeProvider />
                </div>
                {children}
            </main>
        </SidebarProvider>
    );
}
