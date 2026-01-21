'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CategoryResponse, AddCategoryInput, EditCategoryInput, CategoryWithTransactionCount } from '@/types/categories.types';
import type { TransactionType, CategoryScope } from '@/lib/prisma/generated/client';

export interface GetCategoriesFilters {
    scope?: CategoryScope;
    ownerId?: string;
    type?: TransactionType;
    userId?: string;
}

const QUERY_KEYS = {
    categories: (filters?: GetCategoriesFilters) => ['categories', filters] as const,
    category: (id: string) => ['category', id] as const,
    userCategories: (userId?: string, type?: TransactionType) => ['categories', 'user', userId, type] as const,
};

/**
 * Fetch categories with optional filters
 */
export const useCategories = (filters?: GetCategoriesFilters) =>
    useQuery<CategoryWithTransactionCount[], Error>({
        queryKey: QUERY_KEYS.categories(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.scope) params.append('scope', filters.scope);
            if (filters?.ownerId) params.append('ownerId', filters.ownerId);
            if (filters?.type) params.append('type', filters.type);
            if (filters?.userId) params.append('userId', filters.userId);

            const url = params.toString() ? `/api/categories?${params}` : '/api/categories';
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch categories');
            }

            return response.json();
        },
        refetchOnWindowFocus: true,
    });

/**
 * Fetch categories for a specific user (includes global + user-specific)
 */
export const useUserCategories = (userId?: string, type?: TransactionType) =>
    useQuery<CategoryWithTransactionCount[], Error>({
        queryKey: QUERY_KEYS.userCategories(userId, type),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            if (type) params.append('type', type);

            const response = await fetch(`/api/categories?${params}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch user categories');
            }

            return response.json();
        },
        enabled: !!userId,
        refetchOnWindowFocus: true,
    });

/**
 * Fetch a single category by ID
 */
export const useCategory = (id: string) =>
    useQuery<CategoryResponse, Error>({
        queryKey: QUERY_KEYS.category(id),
        queryFn: async () => {
            const response = await fetch(`/api/categories/${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch category');
            }

            return response.json();
        },
        enabled: !!id,
        refetchOnWindowFocus: true,
    });

/**
 * Create a new category
 */
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation<CategoryResponse, Error, AddCategoryInput>({
        mutationFn: async (input) => {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create category');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate all category queries
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

/**
 * Update an existing category
 */
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation<CategoryResponse, Error, EditCategoryInput>({
        mutationFn: async (input) => {
            const response = await fetch(`/api/categories/${input.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update category');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Invalidate specific category and all category lists
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.category(data.id) });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

/**
 * Delete a category
 */
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation<CategoryResponse, Error, string>({
        mutationFn: async (id) => {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete category');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate all category queries
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

/**
 * Bulk delete categories
 */
export const useBulkDeleteCategories = () => {
    const queryClient = useQueryClient();

    return useMutation<{ count: number }, Error, string[]>({
        mutationFn: async (ids) => {
            const response = await fetch('/api/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete categories');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate all category queries
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
