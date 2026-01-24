import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import type { AddUserInput, EditUserInput, DeleteUserInput, UserResponse, UserWithDetailsResponse, UserStatsResponse } from '@/types/users.types';

export class UserService {
    /**
     * Get the currently logged-in user from Supabase JWT claims
     * @throws Error if user is not authenticated
     */
    async getLoggedUser(): Promise<{ id: string; email: string }> {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getClaims();

        if (error || !data?.claims?.sub) {
            throw new Error('User not authenticated');
        }

        const userId = data.claims.sub as string;
        const email = data.claims.email as string;

        return {
            id: userId,
            email: email || '',
        };
    }
    async addUser(input: AddUserInput): Promise<UserResponse> {
        const user = await prisma.user.create({
            data: {
                email: input.email,
            },
        });

        return user;
    }

    async getUsers(): Promise<UserResponse[]> {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return users;
    }

    async getUserById(id: string): Promise<UserWithDetailsResponse | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                wallets: {
                    orderBy: { name: 'asc' },
                },
                _count: {
                    select: {
                        wallets: true,
                        transactions: true,
                        categories: true,
                    },
                },
            },
        });

        return user;
    }

    async getUserByEmail(email: string): Promise<UserResponse | null> {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        return user;
    }

    async editUser(input: EditUserInput): Promise<UserResponse> {
        const user = await prisma.user.update({
            where: { id: input.id },
            data: {
                email: input.email,
            },
        });

        return user;
    }

    /**
     * Note: This will cascade delete all wallets, transactions, and categories
     */
    async deleteUser(input: DeleteUserInput): Promise<UserResponse> {
        const user = await prisma.user.delete({
            where: { id: input.id },
        });

        return user;
    }

    async userExists(id: string): Promise<boolean> {
        const count = await prisma.user.count({
            where: { id },
        });

        return count > 0;
    }

    async emailExists(email: string, excludeId?: string): Promise<boolean> {
        const count = await prisma.user.count({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive',
                },
                id: excludeId ? { not: excludeId } : undefined,
            },
        });

        return count > 0;
    }

    async getUserStats(userId: string): Promise<UserStatsResponse> {
        const [walletsCount, transactionsCount, categoriesCount] = await Promise.all([
            prisma.wallet.count({ where: { userId } }),
            prisma.transaction.count({ where: { userId } }),
            prisma.category.count({ where: { ownerId: userId } }),
        ]);

        return {
            wallets: walletsCount,
            transactions: transactionsCount,
            categories: categoriesCount,
        };
    }
}

// Export singleton instance
export const userService = new UserService();
