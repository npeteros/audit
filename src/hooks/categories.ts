import { createCategory, deleteCategory, editCategory, getUserCategories } from "@/lib/api/api";
import { queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserCategories = (userId: string) => useQuery({
    queryKey: ["categories", userId],
    queryFn: () => getUserCategories({ userId }),
    enabled: !!userId
})

export const useCreateCategory = () => {
    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

export const useEditCategory = () => {
    return useMutation({
        mutationFn: editCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

export const useDeleteCategory = () => {
    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
    })
}

