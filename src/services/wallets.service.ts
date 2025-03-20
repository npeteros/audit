import { prisma } from "@/lib/prisma";
import { AddWalletPayload, EditWalletPayload, DeleteWalletPayload } from "@/types/wallets.types";
import { Wallet } from "@prisma/client";

export type WalletFilters = Partial<Pick<Wallet, 'id' | 'userId'>>;

class WalletService {

    async getWallet({ id }: { id: number }) {
        try {
            const wallet = await prisma.wallet.findFirst({
                where: {
                    id
                },
                include: {
                    transactions: {
                        include: {
                            category: true
                        }
                    }
                }
            });
            return wallet
        } catch (error) {
            console.error('Error fetching wallet:', error);
            throw new Error('Could not fetch wallet');
        }
    }

    /**
     * Fetches wallets from the database.
     *
     * @param params- Filters to apply to the query.
     * @returns A promise that resolves to an array of Wallet objects.
     * @throws {Error} If there was an error fetching the wallets.
     */
    async getWallets({ filters = {} }: { filters?: WalletFilters }) {
        try {
            const wallets = await prisma.wallet.findMany({
                where: {
                    ...(filters.id && { id: filters.id }),

                    ...(filters.userId && { userId: filters.userId }),
                },
                include: {
                    transactions: {
                        include: {
                            category: true
                        }
                    }
                }
            });
            return wallets;
        } catch (error) {
            console.error('Error fetching wallets:', error);
            throw new Error('Could not fetch wallets');
        }
    }

    /**
     * Adds a new wallet to the database.
     *
     * @param params - The wallet data to add.
     * @returns A promise that resolves to the new wallet object.
     * @throws {Error} If there was an error adding the wallet.
     */


    async addWallet({ userId, name, balance }: AddWalletPayload) {
        try {
            const newWallet = await prisma.wallet.create({ data: { userId, name, balance } });
            return newWallet;
        } catch (error) {
            console.error('Error adding wallet:', error);
            throw new Error('An unexpected error occurred while adding the wallet.');
        }
    }

    /**
     * Updates a wallet in the database.
     *
     * @param params The wallet data to update.
     * @returns A promise that resolves to the updated wallet object.
     * @throws {Error} If there was an error updating the wallet.
     */
    async editWallet(params: EditWalletPayload): Promise<Wallet> {
        try {
            const updatedWallet = await prisma.wallet.update({ where: { id: params.id }, data: { userId: params.userId, name: params.name, balance: params.balance } });
            return updatedWallet;
        } catch (error) {
            console.error('Error editing wallet:', error);
            throw new Error('An unexpected error occurred while editing the wallet.');
        }
    }

    /**
     * Deletes a wallet from the database.
     *
     * @param params The wallet data to delete.
     * @returns A promise that resolves to the deleted wallet object.
     * @throws {Error} If there was an error deleting the wallet.
     */

    async deleteWallet({ id }: DeleteWalletPayload) {
        try {
            const deletedWallet = await prisma.wallet.delete({ where: { id } });
            return deletedWallet;
        } catch (error) {
            console.error('Error deleting wallet:', error);
            throw new Error('An unexpected error occurred while deleting the wallet.');
        }
    }
}

export default WalletService;