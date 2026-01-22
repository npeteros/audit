import type { Metadata } from 'next';
import LogoutPage from './_components/logout';

export const metadata: Metadata = {
    title: 'Logout - AuditPH',
    robots: {
        index: false,
        follow: false,
    },
};

export default function Page() {
    return <LogoutPage />
}