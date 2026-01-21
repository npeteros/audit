import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type DateRange } from 'react-day-picker';
import type { TransactionWithDetailsResponse } from '@/types/transactions.types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format transactions for line chart visualization (grouped by date)
 */
export function formatTransactionsForLineChart(transactions: TransactionWithDetailsResponse[]): Array<{
    date: string;
    income: number;
    expense: number;
    net: number;
}> {
    const groupedByDate = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
        const dateStr = new Date(transaction.transactionDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        const existing = groupedByDate.get(dateStr) || { income: 0, expense: 0 };

        if (transaction.category.type === 'INCOME') {
            existing.income += Number(transaction.amount);
        } else {
            existing.expense += Number(transaction.amount);
        }

        groupedByDate.set(dateStr, existing);
    });

    return Array.from(groupedByDate.entries())
        .map(([date, data]) => ({
            date,
            income: data.income,
            expense: data.expense,
            net: data.income - data.expense,
        }))
        .sort((a, b) => {
            // Sort by date
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
        });
}

/**
 * Format transactions by category for pie/donut chart
 */
export function formatTransactionsByCategory(
    transactions: TransactionWithDetailsResponse[],
    type?: 'INCOME' | 'EXPENSE'
): Array<{
    name: string;
    value: number;
    type: 'INCOME' | 'EXPENSE';
}> {
    const groupedByCategory = new Map<string, { value: number; type: 'INCOME' | 'EXPENSE' }>();

    transactions
        .filter((t) => !type || t.category.type === type)
        .forEach((transaction) => {
            const categoryName = transaction.category.name;
            const existing = groupedByCategory.get(categoryName);

            if (existing) {
                existing.value += Number(transaction.amount);
            } else {
                groupedByCategory.set(categoryName, {
                    value: Number(transaction.amount),
                    type: transaction.category.type,
                });
            }
        });

    return Array.from(groupedByCategory.entries())
        .map(([name, data]) => ({
            name,
            value: data.value,
            type: data.type,
        }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Get date range for last N days
 */
export function getLastNDays(days: number): DateRange {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return {
        from: startDate,
        to: today,
    };
}

/**
 * Get date range for last 7 days
 */
export function getLast7Days(): DateRange {
    return getLastNDays(6); // 6 days ago + today = 7 days
}

/**
 * Get date range for last 30 days
 */
export function getLast30Days(): DateRange {
    return getLastNDays(29); // 29 days ago + today = 30 days
}

/**
 * Get date range for current month
 */
export function getThisMonth(): DateRange {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return {
        from: startOfMonth,
        to: endOfMonth,
    };
}

/**
 * Get date range for last month
 */
export function getLastMonth(): DateRange {
    const today = new Date();
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    return {
        from: startOfLastMonth,
        to: endOfLastMonth,
    };
}

/**
 * Get date range for current year
 */
export function getThisYear(): DateRange {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const endOfYear = new Date(today.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    return {
        from: startOfYear,
        to: endOfYear,
    };
}
