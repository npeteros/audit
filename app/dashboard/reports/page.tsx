import type { Metadata } from 'next';
import ReportsPage from './_components/reports';

export const metadata: Metadata = {
    title: 'Reports',
};

export default function Page() {
    return <ReportsPage />;
}
