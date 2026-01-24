/**
 * Central registry of all AI agent tools
 * Organized by category for easy management and configuration
 */

// Date and Time Tools
export { getCurrentDateTime, parseRelativeDate, parseAbsoluteDate } from './date-tools';

// Transaction Tools
export { getTransactions, getTransactionById, getRecentTransactions, getTransactionsByDateRange, getTransactionSummary } from './transaction-tools';

// Wallet Tools
export { getWallets, getWalletsPaginated, getWalletById, getWalletBalance } from './wallet-tools';

// Category Tools
export { getCategories, getCategoriesByScope, getCategoryById, getCategoryCountByType } from './category-tools';

// User and Validation Tools
export { getUserStats, getUserProfile, walletExists, categoryExists, transactionExists, getAuthenticatedUserId } from './user-tools';

/**
 * All available tools grouped by category
 * Use this for selective tool assignment or documentation
 */
export const toolsByCategory = {
    date: {
        getCurrentDateTime: 'Get current date and time',
        parseRelativeDate: 'Parse relative date expressions (e.g., "last month")',
        parseAbsoluteDate: 'Parse absolute date expressions (e.g., "January 22, 2026")',
    },
    transactions: {
        getTransactions: 'Get paginated transactions with filters',
        getTransactionById: 'Get specific transaction details',
        getRecentTransactions: 'Get recent transactions',
        getTransactionsByDateRange: 'Get transactions in date range',
        getTransactionSummary: 'Get financial summary (income, expense, balance)',
    },
    wallets: {
        getWallets: 'Get all user wallets with balances',
        getWalletsPaginated: 'Get paginated wallets with search',
        getWalletById: 'Get specific wallet details',
        getWalletBalance: 'Get wallet balance',
    },
    categories: {
        getCategories: 'Get all available categories',
        getCategoriesByScope: 'Get categories by scope (GLOBAL/USER)',
        getCategoryById: 'Get specific category details',
        getCategoryCountByType: 'Get category counts by type',
    },
    user: {
        getUserStats: 'Get user statistics overview',
        getUserProfile: 'Get user profile details',
        walletExists: 'Check if wallet exists',
        categoryExists: 'Check if category exists',
        transactionExists: 'Check if transaction exists',
    },
};

/**
 * Total tool count: 21 read-only tools
 * - 3 date/time tools
 * - 5 transaction tools
 * - 4 wallet tools
 * - 4 category tools
 * - 5 user/validation tools
 */
