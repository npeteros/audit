'use client';

import { Button } from '@/components/ui/button';
import { useLogoutUser } from '@/lib/api/users.api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LogoutPage() {
    const logout = useLogoutUser();
    const router = useRouter();

    async function handleLogout() {
        logout.mutate(undefined, {
            onSuccess: () => {
                toast.success('Logged out successfully');
                router.push('/login');
            },
            onError: (error) => {
                toast.error(`Logout failed: ${error.message}`);
            },
        });
    }
    return (
        <form action={handleLogout} className="flex items-center justify-center h-screen">
            <Button type="submit" variant="default" size="lg" disabled={logout.isPending}>
                Logout
            </Button>
        </form>
    );
}
