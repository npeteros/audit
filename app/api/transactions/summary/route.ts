import { NextRequest, NextResponse } from 'next/server';
import { transactionService } from '@/services/transactions.services';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const walletId = searchParams.get('walletId');
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Parse optional date parameters
        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;

        // Validate dates if provided
        if (startDate && isNaN(startDate.getTime())) {
            return NextResponse.json({ error: 'Invalid startDate format' }, { status: 400 });
        }
        if (endDate && isNaN(endDate.getTime())) {
            return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 });
        }

        const summary = await transactionService.getTransactionSummary(userId, startDate, endDate, walletId || undefined);

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        return NextResponse.json({ error: 'Failed to fetch transaction summary' }, { status: 500 });
    }
}
