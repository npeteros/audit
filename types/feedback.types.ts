import { z } from 'zod';

export enum EmotionRating {
    TERRIBLE = 'terrible',
    BAD = 'bad',
    OKAY = 'okay',
    GOOD = 'good',
    AMAZING = 'amazing',
}

export const FeedbackSchema = z.object({
    userId: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    rating: z.nativeEnum(EmotionRating),
    npsRating: z.number().int().min(1).max(10),
    message: z.string().min(1, 'Message is required').max(1000, 'Message is too long'),
});

export type FeedbackInput = z.infer<typeof FeedbackSchema>;

export interface FeedbackResponse {
    success: boolean;
    message?: string;
}
