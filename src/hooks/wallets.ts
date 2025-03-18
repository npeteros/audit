import { createWallet, deleteWallet, editWallet, getUserWallets } from "@/lib/api/api";
import { queryClient } from "@/lib/queryClient";
import { Wallet } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserWallets = (userId: string) => useQuery<{ wallets: Wallet[] }, unknown>({
    queryKey: ["wallets", userId],
    queryFn: () => getUserWallets({ userId }),
    enabled: !!userId,
    staleTime: 3000
})

export const useCreateWallet = () => {
    return useMutation({
        mutationFn: createWallet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] })
        },
    })
}

export const useEditWallet = () => {
    return useMutation({
        mutationFn: editWallet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] })
        },
    })
}

export const useDeleteWallet = () => {
    return useMutation({
        mutationFn: deleteWallet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] })
        },
    })
}

