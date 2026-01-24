'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FeedbackInput, FeedbackResponse } from '@/types/feedback.types';

export const useSubmitFeedback = () => {
    return useMutation<FeedbackResponse, Error, FeedbackInput>({
        mutationFn: async (data: FeedbackInput) => {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit feedback');
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success('Thank you for your feedback!');
        },
        onError: (error) => {
            toast.error(`Failed to submit feedback: ${error.message}`);
        },
    });
};
