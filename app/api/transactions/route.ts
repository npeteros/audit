import { NextRequest, NextResponse } from 'next/server';
import { transactionService } from '@/services/transactions.services';
import { AddTransactionSchema, BulkDeleteTransactionSchema } from '@/types/transactions.types';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const walletId = searchParams.get('walletId');
        const categoryId = searchParams.get('categoryId');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = searchParams.get('limit');
        const page = searchParams.get('page');
        const pageSize = searchParams.get('pageSize');

        const transactions = await transactionService.getTransactions({
            userId: userId || undefined,
            walletId: walletId || undefined,
            categoryId: categoryId || undefined,
            type: type === 'INCOME' || type === 'EXPENSE' ? type : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = AddTransactionSchema.parse(body);

        const transaction = await transactionService.addTransaction(validatedData);

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        if (error instanceof Error && 'issues' in error) {
            return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
        }

        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = BulkDeleteTransactionSchema.parse(body);

        // Get userId from request (assuming you have auth middleware)
        const userId = request.nextUrl.searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const result = await transactionService.bulkDeleteTransactions(validatedData, userId);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error instanceof Error && 'issues' in error) {
            return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
        }

        console.error('Error deleting transactions:', error);
        return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 });
    }
}
