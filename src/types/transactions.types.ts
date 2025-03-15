import { z } from "zod";

export const AddTransactionSchema = z.object({
    userId: z.string({
        required_error: "userId is required.",
        invalid_type_error: "userId must be a string.",
    }),
    walletId: z.number({
        required_error: "walletId is required.",
        invalid_type_error: "walletId must be a string.",
    }),
    categoryId: z.number({
        required_error: "categoryId is required.",
        invalid_type_error: "categoryId must be a string.",
    }),
    transactionDate: z.string({
        required_error: "transactionDate is required.",
        invalid_type_error: "transactionDate must be a string.",
    }),
    description: z.string({
        invalid_type_error: "description must be a string.",
    }).optional(),
    amount: z.number({
        required_error: "amount is required.",
        invalid_type_error: "amount must be a number.",
    }),
});

export const EditTransactionSchema = z.object({
    id: z.number({
        required_error: "id is required.",
        invalid_type_error: "id must be a number.",
    }),
    userId: z.string({
        required_error: "userId is required.",
        invalid_type_error: "userId must be a string.",
    }),
    walletId: z.number({
        required_error: "walletId is required.",
        invalid_type_error: "walletId must be a string.",
    }),
    categoryId: z.number({
        required_error: "categoryId is required.",
        invalid_type_error: "categoryId must be a string.",
    }),
    transactionDate: z.string({
        required_error: "transactionDate is required.",
        invalid_type_error: "transactionDate must be a string.",
    }),
    description: z.string({
        invalid_type_error: "description must be a string.",
    }).optional(),
    amount: z.number({
        required_error: "amount is required.",
        invalid_type_error: "amount must be a number.",
    }),
});

export const DeleteTransactionSchema = z.object({
    id: z.number({
        required_error: "id is required.",
        invalid_type_error: "id must be a number.",
    }),
});

export type AddTransactionPayload = z.infer<typeof AddTransactionSchema>;
export type EditTransactionPayload = z.infer<typeof EditTransactionSchema>;
export type DeleteTransactionPayload = z.infer<typeof DeleteTransactionSchema>;