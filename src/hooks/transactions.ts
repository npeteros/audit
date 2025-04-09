import { createTransaction, deleteTransaction, editTransaction, getUserTransactions } from "@/lib/api/api";
import { queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserTransactions = (userId: string) => useQuery({
    queryKey: ["transactions", userId],
    queryFn: () => getUserTransactions({ userId }),
    enabled: !!userId
})

export const useCreateTransaction = () => {
    return useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
        },
    })
}

export const useEditTransaction = () => {
    return useMutation({
        mutationFn: editTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
        },
    })
}

export const useDeleteTransaction = () => {
    return useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
        },
    })
}

