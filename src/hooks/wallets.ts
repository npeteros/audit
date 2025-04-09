import { createWallet, deleteWallet, editWallet, getUserWallets, getWallet } from "@/lib/api/api";
import { queryClient } from "@/lib/queryClient";
import { WalletIncluded } from "@/types/wallets.types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useWallet = (id: number) => useQuery<{ wallets: WalletIncluded }, unknown>({
    queryKey: ["wallet", id],
    queryFn: () => getWallet({ id }),
    enabled: !!id,
})

export const useUserWallets = (userId: string) => useQuery<{ wallets: WalletIncluded[] }, unknown>({
    queryKey: ["wallets", userId],
    queryFn: () => getUserWallets({ userId }),
    enabled: !!userId,
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

