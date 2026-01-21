import { prisma } from '@/lib/prisma';
import type {
    AddCategoryInput,
    EditCategoryInput,
    DeleteCategoryInput,
    CategoryResponse,
    CategoryWithUserResponse,
    CategoryCountResponse,
    CategoryWithTransactionCount,
} from '@/types/categories.types';
import type { CategoryScope, TransactionType } from '@/lib/prisma/generated/client';

export interface GetCategoriesFilters {
    scope?: CategoryScope;
    ownerId?: string;
    type?: TransactionType;
}

export class CategoryService {
    async addCategory(input: AddCategoryInput): Promise<CategoryResponse> {
        const category = await prisma.category.create({
            data: {
                scope: input.scope,
                ownerId: input.ownerId,
                name: input.name,
                icon: input.icon,
                type: input.type,
            },
        });

        return category;
    }

    async getCategories(filters?: GetCategoriesFilters): Promise<CategoryWithTransactionCount[]> {
        const categories = await prisma.category.findMany({
            where: {
                scope: filters?.scope,
                ownerId: filters?.ownerId,
                type: filters?.type,
            },
            include: {
                _count: {
                    select: {
                        transactions: true,
                    },
                },
                transactions: {
                    select: {
                        amount: true,
                    },
                },
            },
            orderBy: [{ scope: 'asc' }, { name: 'asc' }],
        });

        // Calculate totals for each category
        return categories.map((category) => {
            const totalAmount = category.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
            const { transactions, ...categoryData } = category;

            return {
                ...categoryData,
                totalIncome: category.type === 'INCOME' ? totalAmount : 0,
                totalExpense: category.type === 'EXPENSE' ? totalAmount : 0,
            };
        });
    }

    async getCategoriesForUser(userId: string, type?: TransactionType): Promise<CategoryWithTransactionCount[]> {
        const categories = await prisma.category.findMany({
            where: {
                OR: [{ scope: 'GLOBAL' }, { scope: 'USER', ownerId: userId }],
                type: type,
            },
            include: {
                _count: {
                    select: {
                        transactions: true,
                    },
                },
                transactions: {
                    select: {
                        amount: true,
                    },
                },
            },
            orderBy: [{ scope: 'asc' }, { name: 'asc' }],
        });

        // Calculate totals for each category
        return categories.map((category) => {
            const totalAmount = category.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
            const { transactions, ...categoryData } = category;

            return {
                ...categoryData,
                totalIncome: category.type === 'INCOME' ? totalAmount : 0,
                totalExpense: category.type === 'EXPENSE' ? totalAmount : 0,
            };
        });
    }

    async getCategoryById(id: string): Promise<CategoryWithUserResponse | null> {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });

        return category;
    }

    async editCategory(input: EditCategoryInput): Promise<CategoryResponse> {
        const category = await prisma.category.update({
            where: { id: input.id },
            data: {
                scope: input.scope,
                ownerId: input.ownerId,
                name: input.name,
                icon: input.icon,
                type: input.type,
            },
        });

        return category;
    }

    /**
     * Note: This will fail if there are transactions using this category (due to onDelete: Restrict)
     */
    async deleteCategory(input: DeleteCategoryInput): Promise<CategoryResponse> {
        const category = await prisma.category.delete({
            where: { id: input.id },
        });

        return category;
    }

    /**
     * Bulk delete categories
     * Note: This will fail if any categories have transactions using them (due to onDelete: Restrict)
     */
    async bulkDeleteCategories(ids: string[]): Promise<number> {
        const result = await prisma.category.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return result.count;
    }

    async categoryExists(id: string): Promise<boolean> {
        const count = await prisma.category.count({
            where: { id },
        });

        return count > 0;
    }

    async getCategoryCountByType(userId?: string): Promise<CategoryCountResponse> {
        const where = userId
            ? {
                  OR: [{ scope: 'GLOBAL' as CategoryScope }, { scope: 'USER' as CategoryScope, ownerId: userId }],
              }
            : {};

        const [incomeCount, expenseCount] = await Promise.all([
            prisma.category.count({
                where: { ...where, type: 'INCOME' },
            }),
            prisma.category.count({
                where: { ...where, type: 'EXPENSE' },
            }),
        ]);

        return {
            income: incomeCount,
            expense: expenseCount,
            total: incomeCount + expenseCount,
        };
    }

    async categoryNameExists(name: string, type: TransactionType, scope: CategoryScope, ownerId?: string, excludeId?: string): Promise<boolean> {
        const count = await prisma.category.count({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
                type,
                scope,
                ownerId: scope === 'USER' ? ownerId : null,
                id: excludeId ? { not: excludeId } : undefined,
            },
        });

        return count > 0;
    }
}

// Export singleton instance
export const categoryService = new CategoryService();
