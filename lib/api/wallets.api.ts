'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WalletResponse, AddWalletInput, EditWalletInput, BulkDeleteWalletInput, WalletWithCountResponse, PaginatedWalletResponse } from '@/types/wallets.types';

const QUERY_KEYS = {
    wallets: (userId?: string, search?: string, page?: number, pageSize?: number) => ['wallets', userId, search, page, pageSize] as const,
    wallet: (id: string) => ['wallet', id] as const,
};

/**
 * Fetch all wallets for a user with pagination and search
 */
export const useWallets = (userId?: string, search?: string, page?: number, pageSize?: number) =>
    useQuery<PaginatedWalletResponse, Error>({
        queryKey: QUERY_KEYS.wallets(userId, search, page, pageSize),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            if (search) params.append('search', search);
            if (page) params.append('page', page.toString());
            if (pageSize) params.append('pageSize', pageSize.toString());

            const url = `/api/wallets?${params}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch wallets');
            }

            return response.json();
        },
        enabled: !!userId,
        refetchOnWindowFocus: true,
    });

/**
 * Fetch a single wallet by ID
 */
export const useWallet = (id: string) =>
    useQuery<WalletWithCountResponse, Error>({
        queryKey: QUERY_KEYS.wallet(id),
        queryFn: async () => {
            const response = await fetch(`/api/wallets/${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch wallet');
            }

            return response.json();
        },
        enabled: !!id,
        refetchOnWindowFocus: true,
    });

/**
 * Create a new wallet
 */
export const useCreateWallet = () => {
    const queryClient = useQueryClient();

    return useMutation<WalletResponse, Error, AddWalletInput>({
        mutationFn: async (input) => {
            const response = await fetch('/api/wallets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create wallet');
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            // Invalidate all wallet queries for this user
            queryClient.invalidateQueries({
                queryKey: ['wallets', variables.userId],
            });
        },
    });
};

/**
 * Update an existing wallet
 */
export const useUpdateWallet = () => {
    const queryClient = useQueryClient();

    return useMutation<WalletResponse, Error, EditWalletInput>({
        mutationFn: async (input) => {
            const response = await fetch(`/api/wallets/${input.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update wallet');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Invalidate specific wallet and all wallet lists
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet(data.id) });
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
        },
    });
};

/**
 * Delete a wallet
 */
export const useDeleteWallet = () => {
    const queryClient = useQueryClient();

    return useMutation<WalletResponse, Error, string>({
        mutationFn: async (id) => {
            const response = await fetch(`/api/wallets/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete wallet');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate all wallet queries
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
        },
    });
};

/**
 * Bulk delete wallets
 */
export const useBulkDeleteWallets = () => {
    const queryClient = useQueryClient();

    return useMutation<{ count: number }, Error, BulkDeleteWalletInput & { userId: string }>({
        mutationFn: async ({ ids, userId }) => {
            const params = new URLSearchParams();
            params.append('userId', userId);

            const response = await fetch(`/api/wallets?${params}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete wallets');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate all wallet queries
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
        },
    });
};
