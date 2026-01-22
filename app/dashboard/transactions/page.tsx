import type { Metadata } from 'next';
import TransactionsPage from './_components/transactions';

export const metadata: Metadata = {
    title: 'Transactions',
};

export default function Page() {
    return <TransactionsPage />
}
