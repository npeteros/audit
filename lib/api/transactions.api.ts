'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    TransactionResponse,
    TransactionWithDetailsResponse,
    TransactionSummaryResponse,
    AddTransactionInput,
    EditTransactionInput,
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

const QUERY_KEYS = {
    transactions: (filters?: GetTransactionsFilters) => ['transactions', filters] as const,
    transaction: (id: string) => ['transaction', id] as const,
    recentTransactions: (userId?: string, limit?: number) => ['transactions', 'recent', userId, limit] as const,
    transactionSummary: (userId?: string, walletId?: string, startDate?: Date, endDate?: Date) =>
        ['transactions', 'summary', userId, walletId, startDate?.toISOString(), endDate?.toISOString()] as const,
};

/**
 * Fetch transactions with optional filters
 * Always returns paginated response for consistency
 */
export const useTransactions = (filters?: GetTransactionsFilters) =>
    useQuery<PaginatedTransactionResponse, Error>({
        queryKey: QUERY_KEYS.transactions(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.userId) params.append('userId', filters.userId);
            if (filters?.walletId) params.append('walletId', filters.walletId);
            if (filters?.categoryId) params.append('categoryId', filters.categoryId);
            if (filters?.type) params.append('type', filters.type);
            if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters?.limit) params.append('limit', filters.limit.toString());
            if (filters?.page) params.append('page', filters.page.toString());
            if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

            const url = params.toString() ? `/api/transactions?${params}` : '/api/transactions';
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch transactions');
            }

            return response.json();
        },
        enabled: !!filters?.userId,
        refetchOnWindowFocus: true,
    });

/**
 * Fetch recent transactions for a user
 */
export const useRecentTransactions = (userId?: string, limit: number = 10) =>
    useQuery<TransactionWithDetailsResponse[], Error>({
        queryKey: QUERY_KEYS.recentTransactions(userId, limit),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            params.append('limit', limit.toString());

            const response = await fetch(`/api/transactions?${params}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch recent transactions');
            }

            return response.json();
        },
        enabled: !!userId,
        refetchOnWindowFocus: true,
    });

/**
 * Fetch transaction summary with optional date range and wallet filtering
 */
export const useTransactionSummary = (userId?: string, walletId?: string, startDate?: Date, endDate?: Date) =>
    useQuery<TransactionSummaryResponse, Error>({
        queryKey: QUERY_KEYS.transactionSummary(userId, walletId, startDate, endDate),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            if (walletId) params.append('walletId', walletId);
            if (startDate) params.append('startDate', startDate.toISOString());
            if (endDate) params.append('endDate', endDate.toISOString());

            const response = await fetch(`/api/transactions/summary?${params}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch transaction summary');
            }

            return response.json();
        },
        enabled: !!userId,
        refetchOnWindowFocus: true,
    });

/**
 * Fetch a single transaction by ID
 */
export const useTransaction = (id: string) =>
    useQuery<TransactionWithDetailsResponse, Error>({
        queryKey: QUERY_KEYS.transaction(id),
        queryFn: async () => {
            const response = await fetch(`/api/transactions/${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch transaction');
            }

            return response.json();
        },
        enabled: !!id,
        refetchOnWindowFocus: true,
    });

/**
 * Create a new transaction
 */
export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation<TransactionResponse, Error, AddTransactionInput>({
        mutationFn: async (input) => {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create transaction');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate all transaction-related queries
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            // Invalidate wallet queries to update balances
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
        },
    });
};

/**
 * Update an existing transaction
 */
export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation<TransactionResponse, Error, EditTransactionInput>({
        mutationFn: async (input) => {
            const response = await fetch(`/api/transactions/${input.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update transaction');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Invalidate specific transaction and all transaction lists
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transaction(data.id) });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            // Invalidate wallet queries to update balances
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
        },
    });
};

/**
 * Delete a transaction
 */
export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation<TransactionResponse, Error, string>({
        mutationFn: async (id) => {
            const response = await fetch(`/api/transactions/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete transaction');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate all transaction-related queries
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            // Invalidate wallet queries to update balances
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
        },
    });
};

/**
 * Bulk delete multiple transactions
 */
export const useBulkDeleteTransactions = () => {
    const queryClient = useQueryClient();

    return useMutation<{ count: number }, Error, { ids: string[]; userId: string }>({
        mutationFn: async ({ ids, userId }) => {
            const response = await fetch(`/api/transactions?userId=${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete transactions');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate all transaction-related queries
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            // Invalidate wallet queries to update balances
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
        },
    });
};
