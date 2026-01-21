import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@/services/wallets.services';
import { AddWalletSchema, BulkDeleteWalletSchema } from '@/types/wallets.types';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const search = searchParams.get('search') || undefined;
        const pageStr = searchParams.get('page');
        const pageSizeStr = searchParams.get('pageSize');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Parse pagination parameters
        const page = pageStr ? parseInt(pageStr, 10) : 1;
        const pageSize = pageSizeStr ? parseInt(pageSizeStr, 10) : 20;

        // Validate pagination parameters
        if (isNaN(page) || page < 1) {
            return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 });
        }
        if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
            return NextResponse.json({ error: 'Invalid pageSize parameter (must be 1-100)' }, { status: 400 });
        }

        const wallets = await walletService.getWalletsByUserId(userId, search, page, pageSize);

        return NextResponse.json(wallets);
    } catch (error) {
        console.error('Error fetching wallets:', error);
        return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = AddWalletSchema.parse(body);

        // Check if wallet name already exists for this user
        const nameExists = await walletService.walletNameExists(validatedData.userId, validatedData.name);

        if (nameExists) {
            return NextResponse.json({ error: 'Wallet name already exists' }, { status: 409 });
        }

        const wallet = await walletService.addWallet(validatedData);

        return NextResponse.json(wallet, { status: 201 });
    } catch (error) {
        if (error instanceof Error && 'issues' in error) {
            return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
        }

        console.error('Error creating wallet:', error);
        return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = BulkDeleteWalletSchema.parse(body);

        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const result = await walletService.bulkDeleteWallets(validatedData, userId);

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof Error && 'issues' in error) {
            return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
        }

        if (error instanceof Error && error.message.includes('Foreign key constraint')) {
            return NextResponse.json({ error: 'Cannot delete one or more wallets with existing transactions' }, { status: 409 });
        }

        console.error('Error deleting wallets:', error);
        return NextResponse.json({ error: 'Failed to delete wallets' }, { status: 500 });
    }
}
