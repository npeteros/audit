import TransactionService, { TransactionFilters } from "@/services/transactions.service";
import { AddTransactionSchema, EditTransactionSchema, DeleteTransactionSchema } from "@/types/transactions.types";
import { NextRequest, NextResponse } from "next/server";

const transactionService = new TransactionService;
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters: TransactionFilters = {};

        searchParams.forEach((value, key) => {
            if (key === "id" || key === "walletId" || key === "categoryId") {
                filters[key] = Number(value);
            }
            if (key === "userId") {
                filters.userId = value;
            }
        });

        const transactions = await transactionService.getTransactions({ filters });
        return NextResponse.json({ transactions }, { status: 200 });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = AddTransactionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const validatedBody = result.data;
        const newTransaction = await transactionService.addTransaction(validatedBody);
        return NextResponse.json({ newTransaction }, { status: 201 });
    } catch (error) {
        console.error('Error adding transaction:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const result = EditTransactionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const validatedBody = result.data;
        const updatedTransaction = await transactionService.editTransaction(validatedBody);
        return NextResponse.json({ updatedTransaction }, { status: 200 });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const result = DeleteTransactionSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const validatedBody = result.data;
        const deletedTransaction = await transactionService.deleteTransaction(validatedBody);
        return NextResponse.json({ deletedTransaction }, { status: 200 });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'An unexpected error occurred while deleting the transaction.' }, { status: 500 });
    }
}