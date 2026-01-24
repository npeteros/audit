/**
 * In-memory rate limiter for per-user request throttling
 * Tracks requests per userId with automatic cleanup of expired entries
 */

interface RateLimitEntry {
    count: number;
    resetAt: number; // Unix timestamp in milliseconds
}

export class RateLimiter {
    private requests: Map<string, RateLimitEntry> = new Map();
    private readonly maxRequests: number;
    private readonly windowMs: number;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(maxRequests: number = 100, windowMinutes: number = 60) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMinutes * 60 * 1000;

        // Start cleanup interval to remove expired entries every 5 minutes
        this.startCleanup();
    }

    /**
     * Check if a user has exceeded their rate limit
     * @param userId - The user ID to check
     * @returns true if limit exceeded, false otherwise
     */
    checkLimit(userId: string): { allowed: boolean; remaining: number; resetAt: Date } {
        const now = Date.now();
        const entry = this.requests.get(userId);

        // No previous requests or window expired
        if (!entry || now >= entry.resetAt) {
            const resetAt = now + this.windowMs;
            this.requests.set(userId, { count: 1, resetAt });
            return {
                allowed: true,
                remaining: this.maxRequests - 1,
                resetAt: new Date(resetAt),
            };
        }

        // Within current window
        if (entry.count >= this.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetAt: new Date(entry.resetAt),
            };
        }

        // Increment count
        entry.count += 1;
        this.requests.set(userId, entry);

        return {
            allowed: true,
            remaining: this.maxRequests - entry.count,
            resetAt: new Date(entry.resetAt),
        };
    }

    /**
     * Get current rate limit status for a user without incrementing
     */
    getStatus(userId: string): { count: number; remaining: number; resetAt: Date | null } {
        const entry = this.requests.get(userId);
        const now = Date.now();

        if (!entry || now >= entry.resetAt) {
            return {
                count: 0,
                remaining: this.maxRequests,
                resetAt: null,
            };
        }

        return {
            count: entry.count,
            remaining: Math.max(0, this.maxRequests - entry.count),
            resetAt: new Date(entry.resetAt),
        };
    }

    /**
     * Reset rate limit for a specific user (useful for testing or admin actions)
     */
    reset(userId: string): void {
        this.requests.delete(userId);
    }

    /**
     * Clear all rate limit entries
     */
    resetAll(): void {
        this.requests.clear();
    }

    /**
     * Start automatic cleanup of expired entries
     */
    private startCleanup(): void {
        // Clean up every 5 minutes
        this.cleanupInterval = setInterval(
            () => {
                const now = Date.now();
                for (const [userId, entry] of this.requests.entries()) {
                    if (now >= entry.resetAt) {
                        this.requests.delete(userId);
                    }
                }
            },
            5 * 60 * 1000
        );

        // Allow Node.js to exit even if interval is running
        if (this.cleanupInterval.unref) {
            this.cleanupInterval.unref();
        }
    }

    /**
     * Stop the cleanup interval (useful for testing or shutdown)
     */
    stopCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

// Export singleton instance with default configuration (100 requests per hour)
export const rateLimiter = new RateLimiter(100, 60);
