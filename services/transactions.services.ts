import { prisma } from '@/lib/prisma';
import type {
    AddTransactionInput,
    EditTransactionInput,
    DeleteTransactionInput,
    BulkDeleteTransactionInput,
    TransactionResponse,
    TransactionWithDetailsResponse,
    TransactionWithFullDetailsResponse,
    TransactionSummaryResponse,
    PaginatedTransactionResponse,
} from '@/types/transactions.types';
import type { TransactionType } from '@/lib/prisma/generated/client';

export interface GetTransactionsFilters {
    userId?: string;
    walletId?: string;
    categoryId?: string;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
    pageSize?: number;
}

export class TransactionService {
    async addTransaction(input: AddTransactionInput): Promise<TransactionResponse> {
        const transaction = await prisma.transaction.create({
            data: {
                userId: input.userId,
                walletId: input.walletId,
                categoryId: input.categoryId,
                transactionDate: input.transactionDate,
                description: input.description,
                amount: input.amount,
            },
        });

        return transaction;
    }

    async getTransactions(filters?: GetTransactionsFilters): Promise<PaginatedTransactionResponse> {
        const where = {
            userId: filters?.userId,
            walletId: filters?.walletId,
            categoryId: filters?.categoryId,
            category: filters?.type ? { type: filters.type } : undefined,
            transactionDate: {
                gte: filters?.startDate,
                lte: filters?.endDate,
            },
        };

        // Determine pagination params - use defaults if not provided
        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || filters?.limit || 10;
        const skip = (page - 1) * pageSize;

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy: { transactionDate: 'desc' },
                skip,
                take: pageSize,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            icon: true,
                            type: true,
                        },
                    },
                    wallet: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.transaction.count({ where }),
        ]);

        return {
            data: transactions,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async getTransactionById(id: string): Promise<TransactionWithFullDetailsResponse | null> {
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                wallet: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        type: true,
                    },
                },
            },
        });

        return transaction;
    }

    async editTransaction(input: EditTransactionInput): Promise<TransactionResponse> {
        const transaction = await prisma.transaction.update({
            where: { id: input.id },
            data: {
                walletId: input.walletId,
                categoryId: input.categoryId,
                transactionDate: input.transactionDate,
                description: input.description,
                amount: input.amount,
            },
        });

        return transaction;
    }

    async deleteTransaction(input: DeleteTransactionInput): Promise<TransactionResponse> {
        const transaction = await prisma.transaction.delete({
            where: { id: input.id },
        });

        return transaction;
    }

    async bulkDeleteTransactions(input: BulkDeleteTransactionInput, userId: string): Promise<{ count: number }> {
        const result = await prisma.transaction.deleteMany({
            where: {
                id: { in: input.ids },
                userId: userId, // Security: ensure user owns all transactions
            },
        });

        return { count: result.count };
    }

    async transactionExists(id: string): Promise<boolean> {
        const count = await prisma.transaction.count({
            where: { id },
        });

        return count > 0;
    }

    async getTransactionSummary(userId: string, startDate?: Date, endDate?: Date, walletId?: string): Promise<TransactionSummaryResponse> {
        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                walletId,
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                category: {
                    select: {
                        type: true,
                    },
                },
            },
        });

        let totalIncome = 0;
        let totalExpense = 0;

        for (const transaction of transactions) {
            if (transaction.category.type === 'INCOME') {
                totalIncome += Number(transaction.amount);
            } else {
                totalExpense += Number(transaction.amount);
            }
        }

        return {
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense,
            count: transactions.length,
        };
    }

    async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date, walletId?: string): Promise<TransactionWithDetailsResponse[]> {
        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                walletId,
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { transactionDate: 'desc' },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        type: true,
                    },
                },
                wallet: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return transactions;
    }

    async getRecentTransactions(userId: string, limit: number = 10): Promise<TransactionWithDetailsResponse[]> {
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { transactionDate: 'desc' },
            take: limit,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        type: true,
                    },
                },
                wallet: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return transactions;
    }
}

// Export singleton instance
export const transactionService = new TransactionService();
