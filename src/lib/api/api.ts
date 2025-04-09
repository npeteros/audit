import { AddCategoryPayload, DeleteCategoryPayload, EditCategoryPayload } from "@/types/categories.types";
import { AddTransactionPayload, DeleteTransactionPayload, EditTransactionPayload } from "@/types/transactions.types";
import { AddWalletPayload, DeleteWalletPayload, EditWalletPayload } from "@/types/wallets.types";
import axios from "axios";

export const getUserWallets = async ({ userId }: { userId: string }) => {
    const { data } = await axios.get("/api/wallets?userId=" + userId);
    return data;
}

export const getUserTransactions = async ({ userId }: { userId: string }) => {
    const { data } = await axios.get("/api/transactions?userId=" + userId);
    return data;
}

export const getUserCategories = async ({ userId }: { userId: string }) => {
    const { data } = await axios.get("/api/categories?userId=" + userId);
    return data;
}

export const getWallet = async ({ id }: { id: number }) => {
    const { data } = await axios.get("/api/wallets?id=" + id);
    return data;
}

export const createWallet = async (payload: AddWalletPayload) => {
    const { data } = await axios.post("/api/wallets", payload);
    return data;
}

export const createTransaction = async (payload: AddTransactionPayload) => {
    const { data } = await axios.post("/api/transactions", payload);
    return data;
}

export const createCategory = async (payload: AddCategoryPayload) => {
    const { data } = await axios.post("/api/categories", payload);
    return data;
}

export const editWallet = async (payload: EditWalletPayload) => {
    const { data } = await axios.put("/api/wallets", payload);
    return data;
}

export const editTransaction = async (payload: EditTransactionPayload) => {
    const { data } = await axios.put("/api/transactions", payload);
    return data;
}

export const editCategory = async (payload: EditCategoryPayload) => {
    const { data } = await axios.put("/api/categories", payload);
    return data;
}

export const deleteWallet = async (payload: DeleteWalletPayload) => {
    const { data } = await axios.delete("/api/wallets", { data: payload });
    return data;
}

export const deleteTransaction = async (payload: DeleteTransactionPayload) => {
    const { data } = await axios.delete("/api/transactions", { data: payload });
    return data;
}

export const deleteCategory = async (payload: DeleteCategoryPayload) => {
    const { data } = await axios.delete("/api/categories", { data: payload });
    return data;
}