// model Category {
//     id        Int             @id @default(autoincrement())
//     userId    String?
//     walletId  Int?
//     name      String
//     icon      String
//     type      TransactionType
//     createdAt DateTime        @default(now())

//     user         User?         @relation(fields: [userId], references: [id])
//     wallet       Wallet?       @relation(fields: [walletId], references: [id])
//     transactions Transaction[]

//     @@index([userId])
//     @@index([walletId])
//     @@index([type])
// }

import { z } from "zod";

export const AddCategorySchema = z.object({
    userId: z.string({
        invalid_type_error: "userId must be a string.",
    }).optional(),
    walletId: z.number({
        invalid_type_error: "walletId must be a string.",
    }).optional(),
    name: z.string({
        required_error: "name is required.",
        invalid_type_error: "name must be a string.",
    }),
    icon: z.string({
        required_error: "icon is required.",
        invalid_type_error: "icon must be a string.",
    }),
    type: z.enum(["INCOME", "EXPENSE"], {
        required_error: "type is required.",
        invalid_type_error: "type must be a string.",
    })
});

export const EditCategorySchema = z.object({
    id: z.number({
        required_error: "id is required.",
        invalid_type_error: "id must be a number.",
    }),
    userId: z.string({
        required_error: "userId is required.",
        invalid_type_error: "userId must be a string.",
    }).optional(),
    walletId: z.number({
        invalid_type_error: "walletId must be a string.",
    }).optional(),
    name: z.string({
        required_error: "name is required.",
        invalid_type_error: "name must be a string.",
    }),
    icon: z.string({
        required_error: "icon is required.",
        invalid_type_error: "icon must be a string.",
    }),
    type: z.enum(["INCOME", "EXPENSE"], {
        required_error: "type is required.",
        invalid_type_error: "type must be a string.",
    })
});

export const DeleteCategorySchema = z.object({
    id: z.number({
        required_error: "id is required.",
        invalid_type_error: "id must be a number.",
    }),
});

export type AddCategoryPayload = z.infer<typeof AddCategorySchema>;
export type EditCategoryPayload = z.infer<typeof EditCategorySchema>;
export type DeleteCategoryPayload = z.infer<typeof DeleteCategorySchema>;