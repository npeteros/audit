import { NextRequest, NextResponse } from 'next/server';
import { transactionService } from '@/services/transactions.services';
import { EditTransactionSchema, DeleteTransactionSchema } from '@/types/transactions.types';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const transaction = await transactionService.getTransactionById(params.id);

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const validatedData = EditTransactionSchema.parse({ ...body, id: params.id });

    // Check if transaction exists
    const exists = await transactionService.transactionExists(params.id);
    if (!exists) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transaction = await transactionService.editTransaction(validatedData);

    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
    }

    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const validatedData = DeleteTransactionSchema.parse({ id: params.id });

    // Check if transaction exists
    const exists = await transactionService.transactionExists(params.id);
    if (!exists) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await transactionService.deleteTransaction(validatedData);

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
