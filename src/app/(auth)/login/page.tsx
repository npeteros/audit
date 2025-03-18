"use client";

import { signInWithEmail } from "./actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    );
}

function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setLoading(true);
        e.preventDefault();

        const formData = new FormData();
        formData.append("email", email);

        const result = await signInWithEmail(formData);

        if (result.success) toast.success(result.message);
        else toast.error(result.message);
        setLoading(false);
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <Link
                            href="/"
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="flex h-40 w-40 items-center justify-center rounded-md">
                                <Image
                                    src="/audit-black.png"
                                    alt="AuditPH"
                                    className="dark:invert"
                                    //   className="max-h-40 max-w-40"
                                    width={2000}
                                    height={1247}
                                />
                            </div>
                            <span className="sr-only">AuditPH</span>
                        </Link>
                        <h1 className="text-xl font-bold">
                            Welcome to AuditPH
                        </h1>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className={`bg-primary hover:bg-primary/90 w-full`}
                            disabled={loading}
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </form>
            <div className="text-muted-foreground text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-neutral-800">
                By clicking continue, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}
