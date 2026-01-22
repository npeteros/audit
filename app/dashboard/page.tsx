import type { Metadata } from 'next';
import DashboardPage from './_components/dashboard';

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function Page() {
    return <DashboardPage />
}