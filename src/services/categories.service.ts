import { prisma } from "@/lib/prisma";
import { AddCategoryPayload, DeleteCategoryPayload, EditCategoryPayload } from "@/types/categories.types";
import { Category } from "@prisma/client";

export type CategoryFilters = Partial<Pick<Category, 'id' | 'userId' | 'walletId' | 'type'>>;

class CategoryService {

    /**
     * Fetches categories from the database.
     *
     * @param params - Filters to apply to the query.
     * @returns A promise that resolves to an array of Category objects.
     * @throws {Error} If there was an error fetching the categories.
     */
    async getCategories({ filters = {} }: { filters?: CategoryFilters }) {
        try {
            const categories = await prisma.category.findMany({
                where: {
                    ...(filters.id && { id: filters.id }),
                    ...(filters.userId && { userId: filters.userId }),
                    ...(filters.walletId && { walletId: filters.walletId }),
                    ...(filters.type && { type: filters.type }),
                },
            });
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Could not fetch categories');
        }
    }

    /**
     * Adds a new category to the database.
     *
     * @param params - The category data to add.
     * @returns A promise that resolves to the new category object.
     * @throws {Error} If there was an error adding the category.
     */
    async addCategory({ userId, walletId, name, icon, type }: AddCategoryPayload) {
        try {
            const newCategory = await prisma.category.create({
                data: {
                    userId,
                    walletId,
                    name,
                    icon,
                    type
                }
            });
            return newCategory;
        } catch (error) {
            console.error('Error adding category:', error);
            throw new Error('An unexpected error occurred while adding the category.');
        }
    }

    /**
     * Updates a category in the database.
     *
     * @param params - The category data to update.
     * @returns A promise that resolves to the updated category object.
     * @throws {Error} If there was an error updating the category.
     */
    async editCategory({ id, userId, walletId, name, icon, type }: EditCategoryPayload) {
        try {
            const updatedCategory = await prisma.category.update({
                where: { id },
                data: {
                    userId,
                    walletId,
                    name,
                    icon,
                    type
                }
            });
            return updatedCategory;
        } catch (error) {
            console.error('Error editing category:', error);
            throw new Error('An unexpected error occurred while editing the category.');
        }
    }

    /**
     * Deletes a category from the database.
     *
     * @param params - The category id to delete
     * @returns A promise that resolves to the deleted category object.
     * @throws {Error} If there was an error deleting the category.
     */
    async deleteCategory({ id }: DeleteCategoryPayload) {
        try {
            const deletedCategory = await prisma.category.delete({
                where: { id },
            });
            return deletedCategory;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw new Error('An unexpected error occurred while deleting the category.');
        }
    }
}

export default CategoryService;