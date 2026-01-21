import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@/services/wallets.services';
import { EditWalletSchema, DeleteWalletSchema } from '@/types/wallets.types';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const wallet = await walletService.getWalletById(params.id);

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const validatedData = EditWalletSchema.parse({ ...body, id: params.id });

    // Check if wallet exists
    const exists = await walletService.walletExists(params.id);
    if (!exists) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Get current wallet to check userId for name uniqueness
    const currentWallet = await walletService.getWalletById(params.id);
    if (!currentWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Check if new name already exists for this user
    const nameExists = await walletService.walletNameExists(
      currentWallet.userId,
      validatedData.name,
      params.id
    );

    if (nameExists) {
      return NextResponse.json({ error: 'Wallet name already exists' }, { status: 409 });
    }

    const wallet = await walletService.editWallet(validatedData);

    return NextResponse.json(wallet);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
    }

    console.error('Error updating wallet:', error);
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const validatedData = DeleteWalletSchema.parse({ id: params.id });

    // Check if wallet exists
    const exists = await walletService.walletExists(params.id);
    if (!exists) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    await walletService.deleteWallet(validatedData);

    return NextResponse.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Cannot delete wallet with existing transactions' },
        { status: 409 }
      );
    }

    console.error('Error deleting wallet:', error);
    return NextResponse.json({ error: 'Failed to delete wallet' }, { status: 500 });
  }
}
