import { Wallet } from "@prisma/client";
import { z } from "zod";
import { TransactionIncluded } from "./transactions.types";

export const AddWalletSchema = z.object({
    userId: z.string({
        required_error: "userId is required.",
        invalid_type_error: "userId must be a string.",
    }),
    name: z.string({
        required_error: "name is required.",
        invalid_type_error: "name must be a string.",
    }),
    balance: z.number({
        required_error: "balance is required.",
        invalid_type_error: "balance must be a number.",
    }),
});

export const EditWalletSchema = z.object({
    id: z.number({
        required_error: "id is required.",
        invalid_type_error: "id must be a number.",
    }),
    userId: z.string({
        required_error: "userId is required.",
        invalid_type_error: "userId must be a string.",
    }),
    name: z.string({
        required_error: "name is required.",
        invalid_type_error: "name must be a string.",
    }),
    balance: z.number({
        required_error: "balance is required.",
        invalid_type_error: "balance must be a number.",
    }),
});

export const DeleteWalletSchema = z.object({
    id: z.number({
        required_error: "id is required.",
        invalid_type_error: "id must be a number.",
    }),
});

export type WalletIncluded = Wallet & {
    transactions: TransactionIncluded[]
}

export type AddWalletPayload = z.infer<typeof AddWalletSchema>;
export type EditWalletPayload = z.infer<typeof EditWalletSchema>;
export type DeleteWalletPayload = z.infer<typeof DeleteWalletSchema>;