import EmailLoginForm from './_components/email-login-form';
import { Separator } from '@/components/ui/separator';
import GoogleLoginForm from './_components/google-login-form';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4 py-8">
            <div className="flex flex-col gap-6 w-full max-w-md">
                <div className="flex flex-col gap-6 w-full max-w-md">
                    <div className="flex flex-col items-center gap-2">
                        <Link href="/" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex h-40 w-40 items-center justify-center rounded-md">
                                <Image src="/audit-black.png" alt="AuditPH" className="dark:invert transition-all" width={2000} height={1247} priority />
                            </div>
                            <span className="sr-only">AuditPH</span>
                        </Link>
                    </div>
                    <EmailLoginForm />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                </div>
                <GoogleLoginForm />
            </div>
        </div>
    );
}
