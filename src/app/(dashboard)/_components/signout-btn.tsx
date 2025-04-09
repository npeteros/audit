"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
    const router = useRouter();
    return (
        <DropdownMenuItem
            onClick={async () => {
                try {
                    await fetch("/api/auth/logout", {
                        method: "POST",
                    });
                    router.push("/login");
                } catch (error) {
                    console.error("Error during login", error);
                }
            }}
        >
            <span>Sign out</span>
        </DropdownMenuItem>
    );
}
