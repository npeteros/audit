import { prisma } from "@/lib/prisma";
import { AddTransactionPayload, DeleteTransactionPayload, EditTransactionPayload } from "@/types/transactions.types";
import { Transaction } from "@prisma/client";

export type TransactionFilters = Partial<Pick<Transaction, 'id' | 'userId' | 'walletId' | 'categoryId'>>;

class TransactionService {

    /**
     * Fetches transactions from the database.
     *
     * @param params - Filters to apply to the query.
     * @returns A promise that resolves to an array of Transaction objects.
     * @throws {Error} If there was an error fetching the transactions.
     */
    async getTransactions({ filters = {} }: { filters?: TransactionFilters }) {
        try {
            const transactions = await prisma.transaction.findMany({
                where: {
                    ...(filters.id && { id: filters.id }),
                    ...(filters.userId && { userId: filters.userId }),
                    ...(filters.walletId && { walletId: filters.walletId }),
                    ...(filters.categoryId && { categoryId: filters.categoryId }),
                },
            });

            return transactions;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw new Error('Could not fetch transactions');
        }
    }

    /**
     * Adds a new transaction to the database.
     *
     * @param params - The transaction data to add.
     * @returns A promise that resolves to the newly added transaction object.
     * @throws {Error} If there was an error adding the transaction.
     */

    async addTransaction({ userId, walletId, categoryId, transactionDate, description, amount }: AddTransactionPayload) {
        try {
            const newTransaction = await prisma.transaction.create({
                data: {
                    userId,
                    walletId,
                    categoryId,
                    transactionDate,
                    description,
                    amount
                }
            });

            return newTransaction;
        } catch (error) {
            console.error("Error adding transaction:", error);
            throw new Error("An unexpected error occurred while adding the transaction.");
        }
    }

    /**
     * Updates a transaction in the database.
     *
     * @param params - The transaction data to update.
     * @returns A promise that resolves to the updated transaction object.
     * @throws {Error} If there was an error updating the transaction.
     */
    async editTransaction({ id, userId, walletId, categoryId, transactionDate, description, amount }: EditTransactionPayload) {
        try {
            const updatedTransaction = await prisma.transaction.update({
                where: { id },
                data: {
                    userId,
                    walletId,
                    categoryId,
                    transactionDate,
                    description,
                    amount
                }
            });
            return updatedTransaction;
        } catch (error) {
            console.error("Error updating transaction:", error);
            throw new Error("An unexpected error occurred while updating the transaction.");
        }
    }

    /**
     * Deletes a transaction from the database.
     *
     * @param params - The ID of the transaction to delete.
     * @returns A promise that resolves to the deleted transaction object.
     * @throws {Error} If there was an error deleting the transaction.
     */
    async deleteTransaction({ id }: DeleteTransactionPayload) {
        try {
            const deletedTransaction = await prisma.transaction.delete({
                where: { id },
            });
            return deletedTransaction;
        } catch (error) {
            console.error("Error deleting transaction:", error);
            throw new Error("An unexpected error occurred while deleting the transaction.");
        }
    }
}

export default TransactionService;