"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { useUserWallets } from "@/hooks/wallets";
import { Wallet } from "@prisma/client";
import Link from "next/link";

export default function UserWallets() {
    const { user } = useSession();
    const { data: { wallets } = { wallets: [] }, isLoading } = useUserWallets(
        user ? user.id : "",
    );

    return !isLoading ? (
        wallets.map((wallet: Wallet) => (
            <Link key={wallet.id} href={`/dashboard/${wallet.id}`}>
                <DropdownMenuItem>{wallet.name}</DropdownMenuItem>
            </Link>
        ))
    ) : (
        <Skeleton className="h-8 w-full" />
    );
}
