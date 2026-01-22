import type { Metadata } from 'next';
import DashboardLayout from './_components/dashboard-layout';

export const metadata: Metadata = {
    title: {
        template: '%s - AuditPH Dashboard',
        default: 'Dashboard - AuditPH',
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
