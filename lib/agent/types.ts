import { InferAgentUIMessage } from 'ai';
import { financialAnalystAgent } from './financial-analyst-agent';

/**
 * Type-safe message type for the financial analyst agent
 * Use this type in client components with useChat hook for full type safety
 *
 * @example
 * ```tsx
 * import { useChat } from '@ai-sdk/react';
 * import type { FinancialAnalystAgentMessage } from '@/lib/agent/types';
 *
 * export function ChatComponent() {
 *   const { messages } = useChat<FinancialAnalystAgentMessage>();
 *   // messages is now fully typed with tool call information
 * }
 * ```
 */
export type FinancialAnalystAgentMessage = InferAgentUIMessage<typeof financialAnalystAgent>;
/**
 * Rate limit information returned by the rate limiter
 */
export interface RateLimitInfo {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

/**
 * Context passed to the agent during execution
 */
export interface AgentContext {
    userId: string;
}
