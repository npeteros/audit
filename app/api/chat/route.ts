import { createAgentUIStreamResponse, UIMessage } from 'ai';
import { NextResponse } from 'next/server';
import { financialAnalystAgent } from '@/lib/agent/financial-analyst-agent';
import { rateLimiter } from '@/lib/agent/utils/rate-limiter';
import { userService } from '@/services/users.services';

export async function POST(req: Request) {
    try {
        // Authenticate user
        const user = await userService.getLoggedUser();

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized. Please log in to use the chat.' }, { status: 401 });
        }

        const userId = user.id;

        // Check rate limit
        const rateLimitResult = rateLimiter.checkLimit(userId);

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded. Please try again later.',
                    resetAt: rateLimitResult.resetAt,
                    remaining: rateLimitResult.remaining,
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '100',
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
                    },
                }
            );
        }

        // Parse request body
        const { messages }: { messages: UIMessage[] } = await req.json();

        // Create agent response with user context
        return createAgentUIStreamResponse({
            agent: financialAnalystAgent,
            uiMessages: messages,
        });
    } catch (error) {

        // Handle authentication errors
        if (error instanceof Error && error.message === 'User not authenticated') {
            return NextResponse.json({ error: 'Unauthorized. Please log in to use the chat.' }, { status: 401 });
        }

        // Handle other errors
        return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
    }
}
