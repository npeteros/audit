import { tool } from 'ai';
import { z } from 'zod';
import { executeToolSafely } from '../utils/format-response';

/**
 * Get the current date and time in ISO format
 */
export const getCurrentDateTime = tool({
    description: 'Get the current date and time in ISO format. Use this when the user asks about "today", "now", "current time", etc.',
    inputSchema: z.object({}),
    execute: async () => {
        return executeToolSafely(async () => {
            const now = new Date();
            return {
                timestamp: now.toISOString(),
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().split(' ')[0],
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };
        });
    },
});

/**
 * Parse relative date expressions into absolute date ranges
 */
export const parseRelativeDate = tool({
    description:
        'Convert relative date expressions (like "last month", "this year", "last 30 days", "Q1 2026") into specific start and end dates. Use this to interpret time-based queries from users.',
    inputSchema: z.object({
        expression: z.string().describe('The relative date expression to parse (e.g., "last month", "this week", "last year", "Q2 2025", "yesterday", "last 7 days")'),
    }),
    execute: async ({ expression }) => {
        return executeToolSafely(async () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let startDate: Date;
            let endDate: Date;

            const expr = expression.toLowerCase().trim();

            // Handle "today"
            if (expr === 'today') {
                startDate = today;
                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle "yesterday"
            else if (expr === 'yesterday') {
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 1);
                endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle "this week"
            else if (expr === 'this week') {
                const dayOfWeek = today.getDay();
                const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
                startDate = new Date(today);
                startDate.setDate(today.getDate() + diff);
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle "last week"
            else if (expr === 'last week') {
                const dayOfWeek = today.getDay();
                const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                startDate = new Date(today);
                startDate.setDate(today.getDate() + diff - 7);
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle "this month"
            else if (expr === 'this month') {
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle "last month"
            else if (expr === 'last month') {
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle "this year"
            else if (expr === 'this year') {
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle "last year"
            else if (expr === 'last year') {
                startDate = new Date(today.getFullYear() - 1, 0, 1);
                endDate = new Date(today.getFullYear() - 1, 11, 31);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle "last X days" or "past X days"
            else if (expr.match(/^(last|past)\s+(\d+)\s+days?$/)) {
                const match = expr.match(/^(last|past)\s+(\d+)\s+days?$/);
                const days = parseInt(match![2]);
                startDate = new Date(today);
                startDate.setDate(today.getDate() - days);
                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle quarters (Q1, Q2, Q3, Q4) with optional year
            else if (expr.match(/^q[1-4](\s+\d{4})?$/)) {
                const match = expr.match(/^q([1-4])(\s+(\d{4}))?$/);
                const quarter = parseInt(match![1]);
                const year = match![3] ? parseInt(match![3]) : today.getFullYear();
                const startMonth = (quarter - 1) * 3;
                startDate = new Date(year, startMonth, 1);
                endDate = new Date(year, startMonth + 3, 0);
                endDate.setHours(23, 59, 59, 999);
            }
            // Handle month names with optional year
            else if (expr.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)(\s+\d{4})?$/)) {
                const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
                const match = expr.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)(\s+(\d{4}))?$/);
                const monthName = match![1];
                const month = months.indexOf(monthName);
                const year = match![3] ? parseInt(match![3]) : today.getFullYear();
                startDate = new Date(year, month, 1);
                endDate = new Date(year, month + 1, 0);
                endDate.setHours(23, 59, 59, 999);
            }
            // Default: return error for unknown expression
            else {
                throw new Error(`Unable to parse date expression: "${expression}". Try expressions like "today", "last month", "this year", "last 30 days", "Q1 2026", etc.`);
            }

            return {
                expression,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                humanReadable: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
            };
        });
    },
});

/**
 * Parse absolute date expressions into specific dates
 */
export const parseAbsoluteDate = tool({
    description:
        'Parse absolute/specific date expressions (like "January 22, 2026", "2026-01-22", "01/22/2026") into a specific date. Use this when the user provides a specific date rather than a relative expression.',
    inputSchema: z.object({
        dateString: z.string().describe('The absolute date string to parse (e.g., "January 22, 2026", "2026-01-22", "01/22/2026", "22 Jan 2026")'),
    }),
    execute: async ({ dateString }) => {
        return executeToolSafely(async () => {
            const input = dateString.trim();
            let parsedDate: Date | null = null;

            // Try ISO format: YYYY-MM-DD
            const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
            if (isoMatch) {
                const [, year, month, day] = isoMatch;
                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }

            // Try US format: MM/DD/YYYY or M/D/YYYY
            if (!parsedDate) {
                const usMatch = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (usMatch) {
                    const [, month, day, year] = usMatch;
                    parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                }
            }

            // Try format: Month DD, YYYY (e.g., "January 22, 2026" or "Jan 22, 2026")
            if (!parsedDate) {
                const monthNames = [
                    { full: 'january', short: 'jan', index: 0 },
                    { full: 'february', short: 'feb', index: 1 },
                    { full: 'march', short: 'mar', index: 2 },
                    { full: 'april', short: 'apr', index: 3 },
                    { full: 'may', short: 'may', index: 4 },
                    { full: 'june', short: 'jun', index: 5 },
                    { full: 'july', short: 'jul', index: 6 },
                    { full: 'august', short: 'aug', index: 7 },
                    { full: 'september', short: 'sep', index: 8 },
                    { full: 'october', short: 'oct', index: 9 },
                    { full: 'november', short: 'nov', index: 10 },
                    { full: 'december', short: 'dec', index: 11 },
                ];

                const lowerInput = input.toLowerCase();
                const monthDayYearMatch = lowerInput.match(/^([a-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
                if (monthDayYearMatch) {
                    const [, monthStr, day, year] = monthDayYearMatch;
                    const monthInfo = monthNames.find((m) => m.full === monthStr || m.short === monthStr);
                    if (monthInfo) {
                        parsedDate = new Date(parseInt(year), monthInfo.index, parseInt(day));
                    }
                }
            }

            // Try format: DD Month YYYY (e.g., "22 January 2026" or "22 Jan 2026")
            if (!parsedDate) {
                const monthNames = [
                    { full: 'january', short: 'jan', index: 0 },
                    { full: 'february', short: 'feb', index: 1 },
                    { full: 'march', short: 'mar', index: 2 },
                    { full: 'april', short: 'apr', index: 3 },
                    { full: 'may', short: 'may', index: 4 },
                    { full: 'june', short: 'jun', index: 5 },
                    { full: 'july', short: 'jul', index: 6 },
                    { full: 'august', short: 'aug', index: 7 },
                    { full: 'september', short: 'sep', index: 8 },
                    { full: 'october', short: 'oct', index: 9 },
                    { full: 'november', short: 'nov', index: 10 },
                    { full: 'december', short: 'dec', index: 11 },
                ];

                const lowerInput = input.toLowerCase();
                const dayMonthYearMatch = lowerInput.match(/^(\d{1,2})\s+([a-z]+),?\s+(\d{4})$/);
                if (dayMonthYearMatch) {
                    const [, day, monthStr, year] = dayMonthYearMatch;
                    const monthInfo = monthNames.find((m) => m.full === monthStr || m.short === monthStr);
                    if (monthInfo) {
                        parsedDate = new Date(parseInt(year), monthInfo.index, parseInt(day));
                    }
                }
            }

            // If we couldn't parse it, throw an error
            if (!parsedDate || isNaN(parsedDate.getTime())) {
                throw new Error(`Unable to parse date: "${dateString}". Supported formats: "January 22, 2026", "Jan 22, 2026", "22 January 2026", "2026-01-22", "01/22/2026"`);
            }

            // Set to start of day
            const startDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
            // Set to end of day
            const endDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
            endDate.setHours(23, 59, 59, 999);

            return {
                originalInput: dateString,
                parsedDate: parsedDate.toISOString(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                humanReadable: parsedDate.toLocaleDateString(),
            };
        });
    },
});
