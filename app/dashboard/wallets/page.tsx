import type { Metadata } from 'next';
import WalletsPage from './_components/wallets';

export const metadata: Metadata = {
    title: 'Wallets',
};

export default function Page() {
    return <WalletsPage />
}