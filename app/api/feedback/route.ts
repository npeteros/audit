import { NextRequest, NextResponse } from 'next/server';
import { FeedbackSchema } from '@/types/feedback.types';
import { feedbackService } from '@/services/feedback.services';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = FeedbackSchema.parse(body);

        await feedbackService.submitFeedback(validatedData);

        return NextResponse.json({ success: true, message: 'Feedback submitted successfully' }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: error.message,
                },
                { status: 400 }
            );
        }

        console.error('Error submitting feedback:', error);

        return NextResponse.json(
            {
                error: 'Failed to submit feedback',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
