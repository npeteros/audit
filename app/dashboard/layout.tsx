import type { Metadata } from 'next';
import DashboardLayout from './_components/dashboard-layout';
import FloatingChatbot from '@/components/shared/floating-chatbot';
import FeedbackModal from '@/components/shared/feedback-modal';

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
    return (
        <>
            <DashboardLayout>{children}</DashboardLayout>
            <FloatingChatbot />
            <FeedbackModal />
        </>
    );
}
