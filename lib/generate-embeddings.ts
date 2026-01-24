import dotenv from 'dotenv';
import { prisma } from './prisma';
import { EmbeddingService } from './embeddings/service';

dotenv.config();

type EntityType = 'transaction' | 'category' | 'all';

interface BatchStats {
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    skipped: number;
    errors: Array<{ entityId: string; error: string }>;
}

/**
 * Backfill script to generate embeddings for existing transactions and categories.
 *
 * Usage:
 *   npm run embeddings:backfill -- --entity-type=all
 *   npm run embeddings:backfill -- --entity-type=transaction
 *   npm run embeddings:backfill -- --entity-type=category
 *
 * Options:
 *   --entity-type: Type of entities to process (transaction|category|all) [default: all]
 *   --batch-size: Number of entities to process in each batch [default: 50]
 *   --delay: Delay between batches in milliseconds [default: 500]
 */

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 500;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse command line arguments
 */
function parseArgs(): { entityType: EntityType; batchSize: number; delay: number } {
    const args = process.argv.slice(2);
    let entityType: EntityType = 'all';
    let batchSize = BATCH_SIZE;
    let delay = BATCH_DELAY_MS;

    for (const arg of args) {
        if (arg.startsWith('--entity-type=')) {
            const value = arg.split('=')[1] as EntityType;
            if (['transaction', 'category', 'all'].includes(value)) {
                entityType = value;
            }
        } else if (arg.startsWith('--batch-size=')) {
            const value = parseInt(arg.split('=')[1], 10);
            if (!isNaN(value) && value > 0) {
                batchSize = value;
            }
        } else if (arg.startsWith('--delay=')) {
            const value = parseInt(arg.split('=')[1], 10);
            if (!isNaN(value) && value >= 0) {
                delay = value;
            }
        }
    }

    return { entityType, batchSize, delay };
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(fn: () => Promise<T>, entityId: string, maxRetries: number = MAX_RETRIES): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries - 1) {
                const delay = RETRY_DELAYS[attempt];
                console.log(`  Retry ${attempt + 1}/${maxRetries} for ${entityId} after ${delay}ms (${lastError.message})`);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

/**
 * Process transactions in batches
 */
async function processTransactions(embeddingService: EmbeddingService, batchSize: number, delay: number): Promise<BatchStats> {
    const stats: BatchStats = {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        errors: [],
    };

    console.log('\n📝 Processing Transactions...\n');

    // Count total transactions with descriptions
    const total = await prisma.transaction.count({
        where: {
            description: {
                not: null,
            },
        },
    });

    stats.total = total;
    console.log(`Found ${total} transactions with descriptions\n`);

    if (total === 0) {
        console.log('No transactions to process.\n');
        return stats;
    }

    // Process in batches
    const batches = Math.ceil(total / batchSize);

    for (let batch = 0; batch < batches; batch++) {
        const skip = batch * batchSize;
        const batchNum = batch + 1;

        console.log(`Processing batch ${batchNum}/${batches} (${skip + 1}-${Math.min(skip + batchSize, total)})...`);

        // Fetch batch of transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                description: {
                    not: null,
                },
            },
            select: {
                id: true,
                description: true,
            },
            skip,
            take: batchSize,
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Process each transaction in the batch
        for (const transaction of transactions) {
            stats.processed++;

            try {
                const result = await retryWithBackoff(() => embeddingService.generateTransactionEmbedding(transaction.id), transaction.id);

                if (result === null) {
                    stats.skipped++;
                    console.log(`  ⊝ Skipped: ${transaction.id}`);
                } else {
                    stats.succeeded++;
                    console.log(`  ✓ Success: ${transaction.id}`);
                }
            } catch (error) {
                stats.failed++;
                const errorMessage = error instanceof Error ? error.message : String(error);
                stats.errors.push({ entityId: transaction.id, error: errorMessage });
                console.error(`  ✗ Failed: ${transaction.id} - ${errorMessage}`);
            }
        }

        // Delay between batches to respect rate limits
        if (batch < batches - 1 && delay > 0) {
            console.log(`  Waiting ${delay}ms before next batch...\n`);
            await sleep(delay);
        }
    }

    return stats;
}

/**
 * Process categories in batches
 */
async function processCategories(embeddingService: EmbeddingService, batchSize: number, delay: number): Promise<BatchStats> {
    const stats: BatchStats = {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        errors: [],
    };

    console.log('\n🏷️  Processing Categories...\n');

    // Count total categories
    const total = await prisma.category.count();
    stats.total = total;
    console.log(`Found ${total} categories\n`);

    if (total === 0) {
        console.log('No categories to process.\n');
        return stats;
    }

    // Process in batches
    const batches = Math.ceil(total / batchSize);

    for (let batch = 0; batch < batches; batch++) {
        const skip = batch * batchSize;
        const batchNum = batch + 1;

        console.log(`Processing batch ${batchNum}/${batches} (${skip + 1}-${Math.min(skip + batchSize, total)})...`);

        // Fetch batch of categories
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
            },
            skip,
            take: batchSize,
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Process each category in the batch
        for (const category of categories) {
            stats.processed++;

            try {
                const result = await retryWithBackoff(() => embeddingService.generateCategoryEmbedding(category.id), category.id);

                if (result === null) {
                    stats.skipped++;
                    console.log(`  ⊝ Skipped: ${category.name} (${category.id})`);
                } else {
                    stats.succeeded++;
                    console.log(`  ✓ Success: ${category.name} (${category.id})`);
                }
            } catch (error) {
                stats.failed++;
                const errorMessage = error instanceof Error ? error.message : String(error);
                stats.errors.push({ entityId: category.id, error: errorMessage });
                console.error(`  ✗ Failed: ${category.name} (${category.id}) - ${errorMessage}`);
            }
        }

        // Delay between batches to respect rate limits
        if (batch < batches - 1 && delay > 0) {
            console.log(`  Waiting ${delay}ms before next batch...\n`);
            await sleep(delay);
        }
    }

    return stats;
}

/**
 * Print summary statistics
 */
function printSummary(transactionStats: BatchStats | null, categoryStats: BatchStats | null, startTime: number) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60) + '\n');

    if (transactionStats) {
        console.log('Transactions:');
        console.log(`  Total:     ${transactionStats.total}`);
        console.log(`  Processed: ${transactionStats.processed}`);
        console.log(`  Succeeded: ${transactionStats.succeeded}`);
        console.log(`  Skipped:   ${transactionStats.skipped}`);
        console.log(`  Failed:    ${transactionStats.failed}`);
        console.log();
    }

    if (categoryStats) {
        console.log('Categories:');
        console.log(`  Total:     ${categoryStats.total}`);
        console.log(`  Processed: ${categoryStats.processed}`);
        console.log(`  Succeeded: ${categoryStats.succeeded}`);
        console.log(`  Skipped:   ${categoryStats.skipped}`);
        console.log(`  Failed:    ${categoryStats.failed}`);
        console.log();
    }

    const totalProcessed = (transactionStats?.processed || 0) + (categoryStats?.processed || 0);
    const totalSucceeded = (transactionStats?.succeeded || 0) + (categoryStats?.succeeded || 0);
    const totalFailed = (transactionStats?.failed || 0) + (categoryStats?.failed || 0);

    console.log(`Duration: ${duration}s`);
    console.log(`Success Rate: ${totalProcessed > 0 ? ((totalSucceeded / totalProcessed) * 100).toFixed(1) : 0}%`);

    // Print errors if any
    const allErrors = [...(transactionStats?.errors || []), ...(categoryStats?.errors || [])];

    if (allErrors.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('❌ ERRORS');
        console.log('='.repeat(60) + '\n');
        allErrors.forEach(({ entityId, error }) => {
            console.log(`${entityId}: ${error}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log(totalFailed === 0 ? '✅ All embeddings generated successfully!' : '⚠️  Some embeddings failed to generate');
    console.log('='.repeat(60) + '\n');
}

/**
 * Main function
 */
async function main() {
    const startTime = Date.now();

    console.log('\n' + '='.repeat(60));
    console.log('🚀 EMBEDDING BACKFILL SCRIPT');
    console.log('='.repeat(60) + '\n');

    // Parse arguments
    const { entityType, batchSize, delay } = parseArgs();

    console.log('Configuration:');
    console.log(`  Entity Type: ${entityType}`);
    console.log(`  Batch Size:  ${batchSize}`);
    console.log(`  Batch Delay: ${delay}ms`);
    console.log();

    // Check required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Error: Missing required environment variables');
        console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
        process.exit(1);
    }

    // Initialize embedding service
    const embeddingService = new EmbeddingService();

    if (!embeddingService.isEnabled()) {
        console.error('❌ Error: Embedding service is not available');
        console.error('   Please set OPENAI_API_KEY environment variable');
        process.exit(1);
    }

    console.log('✅ Embedding service initialized\n');

    let transactionStats: BatchStats | null = null;
    let categoryStats: BatchStats | null = null;

    try {
        // Process based on entity type
        if (entityType === 'transaction' || entityType === 'all') {
            transactionStats = await processTransactions(embeddingService, batchSize, delay);
        }

        if (entityType === 'category' || entityType === 'all') {
            categoryStats = await processCategories(embeddingService, batchSize, delay);
        }

        // Print summary
        printSummary(transactionStats, categoryStats, startTime);
    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
