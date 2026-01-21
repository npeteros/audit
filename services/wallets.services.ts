import { prisma } from '@/lib/prisma';
import type {
    AddWalletInput,
    EditWalletInput,
    DeleteWalletInput,
    BulkDeleteWalletInput,
    WalletResponse,
    WalletWithCountResponse,
    WalletWithDetailsResponse,
    PaginatedWalletResponse,
} from '@/types/wallets.types';

export interface GetWalletsFilters {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    pageSize?: number;
}

export class WalletService {
    /**
     * Efficiently calculate balances for multiple wallets using database aggregation
     * @param walletIds - Array of wallet IDs to calculate balances for
     * @param startDate - Optional start date for filtering transactions
     * @param endDate - Optional end date for filtering transactions
     * @private
     */
    private async calculateBalances(walletIds: string[], startDate?: Date, endDate?: Date): Promise<Map<string, { income: number; expense: number; balance: number }>> {
        if (walletIds.length === 0) {
            return new Map();
        }

        // Get income and expense separately using parallel queries for optimal performance
        const [incomeAggregations, expenseAggregations] = await Promise.all([
            prisma.transaction.groupBy({
                by: ['walletId'],
                where: {
                    walletId: { in: walletIds },
                    category: { type: 'INCOME' },
                    transactionDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
            prisma.transaction.groupBy({
                by: ['walletId'],
                where: {
                    walletId: { in: walletIds },
                    category: { type: 'EXPENSE' },
                    transactionDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

        // Build balance map with income, expense, and total balance
        const balanceMap = new Map<string, { income: number; expense: number; balance: number }>();
        const incomeMap = new Map(incomeAggregations.map((agg) => [agg.walletId, Number(agg._sum.amount || 0)]));
        const expenseMap = new Map(expenseAggregations.map((agg) => [agg.walletId, Number(agg._sum.amount || 0)]));

        for (const walletId of walletIds) {
            const income = incomeMap.get(walletId) || 0;
            const expense = expenseMap.get(walletId) || 0;
            balanceMap.set(walletId, {
                income,
                expense,
                balance: income - expense,
            });
        }

        return balanceMap;
    }

    async addWallet(input: AddWalletInput): Promise<WalletResponse> {
        const wallet = await prisma.wallet.create({
            data: {
                userId: input.userId,
                name: input.name,
            },
        });

        return {
            ...wallet,
            balance: 0,
            income: 0,
            expense: 0,
        };
    }

    async getWallets(filters?: GetWalletsFilters): Promise<WalletResponse[]> {
        const wallets = await prisma.wallet.findMany({
            where: {
                userId: filters?.userId,
            },
            orderBy: { name: 'asc' },
        });

        // Calculate balances for all wallets efficiently
        const walletIds = wallets.map((w) => w.id);
        const balances = await this.calculateBalances(walletIds, filters?.startDate, filters?.endDate);

        return wallets.map((wallet) => {
            const balanceData = balances.get(wallet.id) || { income: 0, expense: 0, balance: 0 };
            return {
                ...wallet,
                balance: balanceData.balance,
                income: balanceData.income,
                expense: balanceData.expense,
            };
        });
    }

    async getWalletsByUserId(userId: string, search?: string, page?: number, pageSize?: number): Promise<PaginatedWalletResponse> {
        const where = {
            userId,
            ...(search && {
                name: {
                    contains: search,
                    mode: 'insensitive' as const,
                },
            }),
        };

        // Determine pagination params
        const currentPage = page || 1;
        const currentPageSize = pageSize || 20;
        const skip = (currentPage - 1) * currentPageSize;

        const [wallets, total] = await Promise.all([
            prisma.wallet.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: currentPageSize,
                include: {
                    _count: {
                        select: {
                            transactions: true,
                        },
                    },
                },
            }),
            prisma.wallet.count({ where }),
        ]);

        // Calculate balances for all wallets efficiently
        const walletIds = wallets.map((w) => w.id);
        const balances = await this.calculateBalances(walletIds);

        const walletsWithBalances = wallets.map((wallet) => {
            const balanceData = balances.get(wallet.id) || { income: 0, expense: 0, balance: 0 };
            return {
                ...wallet,
                balance: balanceData.balance,
                income: balanceData.income,
                expense: balanceData.expense,
            };
        });

        return {
            data: walletsWithBalances,
            meta: {
                page: currentPage,
                pageSize: currentPageSize,
                total,
                totalPages: Math.ceil(total / currentPageSize),
            },
        };
    }

    async getWalletById(id: string): Promise<WalletWithDetailsResponse | null> {
        const wallet = await prisma.wallet.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
        });

        if (!wallet) {
            return null;
        }

        // Calculate balance efficiently
        const balances = await this.calculateBalances([id]);
        const balanceData = balances.get(id) || { income: 0, expense: 0, balance: 0 };

        return {
            ...wallet,
            balance: balanceData.balance,
            income: balanceData.income,
            expense: balanceData.expense,
        };
    }

    async editWallet(input: EditWalletInput): Promise<WalletResponse> {
        const wallet = await prisma.wallet.update({
            where: { id: input.id },
            data: {
                name: input.name,
            },
        });

        // Calculate balance efficiently
        const balances = await this.calculateBalances([wallet.id]);
        const balanceData = balances.get(wallet.id) || { income: 0, expense: 0, balance: 0 };

        return {
            ...wallet,
            balance: balanceData.balance,
            income: balanceData.income,
            expense: balanceData.expense,
        };
    }

    /**
     * Note: This will fail if there are transactions using this wallet (due to onDelete: Restrict)
     */
    async deleteWallet(input: DeleteWalletInput): Promise<WalletResponse> {
        // Get balance before deletion
        const balances = await this.calculateBalances([input.id]);
        const balanceData = balances.get(input.id) || { income: 0, expense: 0, balance: 0 };

        const wallet = await prisma.wallet.delete({
            where: { id: input.id },
        });

        return {
            ...wallet,
            balance: balanceData.balance,
            income: balanceData.income,
            expense: balanceData.expense,
        };
    }

    async bulkDeleteWallets(input: BulkDeleteWalletInput, userId: string): Promise<{ count: number }> {
        const result = await prisma.wallet.deleteMany({
            where: {
                id: { in: input.ids },
                userId, // Security: only delete wallets owned by the user
            },
        });

        return { count: result.count };
    }

    async walletExists(id: string): Promise<boolean> {
        const count = await prisma.wallet.count({
            where: { id },
        });

        return count > 0;
    }

    async walletNameExists(userId: string, name: string, excludeId?: string): Promise<boolean> {
        const count = await prisma.wallet.count({
            where: {
                userId,
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
                id: excludeId ? { not: excludeId } : undefined,
            },
        });

        return count > 0;
    }

    async getWalletBalance(walletId: string): Promise<number> {
        const balances = await this.calculateBalances([walletId]);
        const balanceData = balances.get(walletId);
        return balanceData ? balanceData.balance : 0;
    }
}

// Export singleton instance
export const walletService = new WalletService();
