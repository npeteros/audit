import WalletService, { WalletFilters } from "@/services/wallets.service";
import { AddWalletSchema, EditWalletSchema, DeleteWalletSchema } from "@/types/wallets.types";
import { NextRequest, NextResponse } from "next/server";

const walletService = new WalletService;
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters: WalletFilters = {};

        searchParams.forEach((value, key) => {
            if (key === "id") {
                filters[key] = Number(value);
            }
            if (key === "userId") {
                filters.userId = value;
            }
        });

        const wallets = await walletService.getWallets({ filters });
        return NextResponse.json({ wallets }, { status: 200 });
    } catch (error) {
        console.error('Error fetching wallets:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = AddWalletSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const validatedBody = result.data;
        const newWallet = await walletService.addWallet(validatedBody);
        return NextResponse.json({ newWallet }, { status: 201 });
    } catch (error) {
        console.error('Error adding wallet:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const result = EditWalletSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const validatedBody = result.data;
        const updatedWallet = await walletService.editWallet(validatedBody);
        return NextResponse.json({ updatedWallet }, { status: 200 });
    } catch (error) {
        console.error('Error updating wallet:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const result = DeleteWalletSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const validatedBody = result.data;
        const deletedWallet = await walletService.deleteWallet(validatedBody);
        return NextResponse.json({ deletedWallet }, { status: 200 });
    } catch (error) {
        console.error('Error deleting wallet:', error);
        return NextResponse.json({ error: 'An unexpected error occurred while deleting the wallet.' }, { status: 500 });
    }
}