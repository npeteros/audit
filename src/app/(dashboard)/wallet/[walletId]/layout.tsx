import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./_components/app-sidebar";
import "@/app/globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { Decimal } from "@prisma/client/runtime/library";
import { notFound } from "next/navigation";
import { WalletProvider } from "../WalletContext";
import { createClient } from "@/utils/supabase/server";
import WalletService from "@/services/wallets.service";

const walletService = new WalletService();

export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ walletId: string }>;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    const walletId = (await params).walletId;

    const userWallets = await walletService.getWallets({
        filters: { userId: user?.id },
    });

    const currentWallet = userWallets.find(
        (wallet) => wallet.id.toString() === walletId,
    );

    if (!currentWallet) return notFound();

    const serializedWallet = JSON.parse(
        JSON.stringify(currentWallet, (key, value) => {
            return value instanceof Decimal ? value.toNumber() : value;
        }),
    );

    return (
        <WalletProvider wallet={serializedWallet}>
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
        </WalletProvider>
    );
}
