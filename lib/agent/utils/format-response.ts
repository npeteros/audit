/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Standardized response format for all AI agent tools
 */
export interface ToolResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Format a successful tool response
 */
export function formatSuccess<T>(data: T, message?: string): ToolResponse<T> {
    return {
        success: true,
        data,
        message,
    };
}

/**
 * Format an error tool response
 */
export function formatError(error: string | Error): ToolResponse {
    return {
        success: false,
        error: error instanceof Error ? error.message : error,
    };
}

/**
 * Format currency values with 2 decimal places
 */
export function formatCurrency(amount: number): string {
    return amount.toFixed(2);
}

/**
 * Format a transaction amount (handles both number and Decimal types)
 */
export function formatTransactionAmount(amount: number | any): number {
    if (typeof amount === 'number') {
        return Number(amount.toFixed(2));
    }
    // Handle Prisma Decimal type
    return Number(Number(amount).toFixed(2));
}

/**
 * Wrapper for tool execution with standardized error handling
 */
export async function executeToolSafely<T>(toolFn: () => Promise<T>, errorMessage?: string): Promise<ToolResponse<T>> {
    try {
        const data = await toolFn();
        return formatSuccess(data);
    } catch (error) {
        console.error('Tool execution error:', error);
        return formatError(errorMessage || (error as Error).message);
    }
}
