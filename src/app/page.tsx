import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full">
                <div className="flex flex-col items-center gap-4">
                    <Link
                        href="/"
                        className="flex flex-col items-center gap-2 font-medium"
                    >
                        <div className="flex size-72 items-center justify-center rounded-md">
                            <Image
                                src="/audit-black.png"
                                alt="AuditPH"
                                // className="bg-red-500"
                                width={2000}
                                height={1247}
                            />
                        </div>
                        <span className="text-primary sr-only">AuditPH</span>
                    </Link>
                    <h1 className="text-primary text-4xl font-bold">AuditPH</h1>
                    <h2 className="text-primary text-2xl font-bold">
                        Coming Soon
                    </h2>
                    <span className="text-center">
                        Our website is currently under construction. We&apos;re
                        working hard to create something amazing. Stay tuned!
                    </span>
                    <Button size={"lg"}>Contact Us</Button>
                </div>
            </div>
            <footer className="text-primary absolute bottom-4 text-sm">
                <p className="text-center">
                    Copyright &copy; {new Date().getFullYear()}, AuditPH. All
                    Rights Reserved.
                </p>
                <p className="mt-2 text-center">
                    Powered by <span className="font-bold">PeterosJS</span>
                </p>
            </footer>
        </div>
    );
}
