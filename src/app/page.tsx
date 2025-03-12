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
                        <span className="sr-only text-neutral-900">
                            AuditPH
                        </span>
                    </Link>
                    <h1 className="text-4xl font-bold text-neutral-900">
                        AuditPH
                    </h1>
                    <h2 className="text-2xl font-bold text-neutral-900">
                        Coming Soon
                    </h2>
                    <span className="text-center text-neutral-900">
                        Our website is currently under construction. We&apos;re
                        working hard to create something amazing. Stay tuned!
                    </span>
                    <Link href="mailto:n.peteros2003@gmail.com">
                        <Button
                            size={"lg"}
                            className="bg-neutral-900 text-white hover:cursor-pointer hover:bg-black"
                        >
                            Contact Us
                        </Button>
                    </Link>
                </div>
            </div>
            <footer className="absolute bottom-4 text-sm text-neutral-900">
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
