"use client";

import { useSession } from "@/hooks/useSession";
import { Skeleton } from "@/components/ui/skeleton";

export default function Username() {
    const { user, loading } = useSession();

    return !loading && user ? (
        <span>{user.email}</span>
    ) : (
        <Skeleton className="h-5 w-20" />
    );
}
