import OpenAI from 'openai';
import { createAdminClient } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';
import type { TransactionType, CategoryScope } from '@/lib/prisma/generated/client';

type EntityType = 'transaction' | 'category';

interface TransactionMetadata {
    categoryName: string;
    categoryType: TransactionType;
    transactionDate: string;
    amount: string;
    walletId: string;
}

interface CategoryMetadata {
    name: string;
    type: TransactionType;
    scope: CategoryScope;
    icon: string;
}

type EmbeddingMetadata = TransactionMetadata | CategoryMetadata;

interface EmbeddingRecord {
    id?: string;
    entity_type: EntityType;
    entity_id: string;
    user_id: string | null;
    content: string;
    embedding: number[];
    metadata: EmbeddingMetadata;
    created_at?: string;
    updated_at?: string;
}

interface SearchResult {
    transactionId: string;
    similarity: number;
    content: string;
    metadata: TransactionMetadata;
    rankScore?: number; // For hybrid search results
}

interface CategorySuggestion {
    categoryId: string;
    categoryName: string;
    similarity: number;
    type: TransactionType;
    rankScore?: number; // For hybrid search results
}

/**
 * Service for generating and managing embeddings for transactions and categories.
 * Uses OpenAI's text-embedding-3-small model and stores vectors in Supabase.
 */
export class EmbeddingService {
    private openai: OpenAI | null = null;
    private supabase: ReturnType<typeof createAdminClient>;
    private isAvailable: boolean = false;

    constructor() {
        // Initialize Supabase admin client
        try {
            this.supabase = createAdminClient();
        } catch (error) {
            throw new Error('Failed to initialize Supabase admin client. Check environment variables.');
        }

        // Initialize OpenAI client if API key is available
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
            this.isAvailable = true;
        } else {
            console.warn('OPENAI_API_KEY not found. Embedding generation will be disabled. ' + 'Set the environment variable to enable semantic search features.');
            this.isAvailable = false;
        }
    }

    /**
     * Check if the embedding service is available (OpenAI API key configured)
     */
    isEnabled(): boolean {
        return this.isAvailable;
    }

    /**
     * Generate an embedding vector for the given text using OpenAI
     * @private
     */
    private async generateEmbedding(text: string): Promise<number[]> {
        if (!this.openai) {
            throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY environment variable.');
        }

        const response = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
            encoding_format: 'float',
        });

        return response.data[0].embedding;
    }

    /**
     * Generate and store embedding for a transaction.
     * Content format: "[CategoryName] description"
     *
     * @param transactionId - UUID of the transaction
     * @returns The created/updated embedding record or null if service unavailable
     */
    async generateTransactionEmbedding(transactionId: string): Promise<EmbeddingRecord | null> {
        if (!this.isAvailable) {
            console.warn(`Embedding service unavailable. Skipping transaction ${transactionId}`);
            return null;
        }

        try {
            // Fetch transaction with category details
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    category: {
                        select: {
                            name: true,
                            type: true,
                        },
                    },
                },
            });

            if (!transaction) {
                throw new Error(`Transaction ${transactionId} not found`);
            }

            // Skip if no description
            if (!transaction.description || transaction.description.trim() === '') {
                console.log(`Transaction ${transactionId} has no description. Skipping embedding.`);
                return null;
            }

            // Format content: "[CategoryName] description"
            const content = `[${transaction.category.name}] ${transaction.description}`;

            // Generate embedding
            const embedding = await this.generateEmbedding(content);

            // Prepare metadata
            const metadata: TransactionMetadata = {
                categoryName: transaction.category.name,
                categoryType: transaction.category.type,
                transactionDate: transaction.transactionDate.toISOString(),
                amount: transaction.amount.toString(),
                walletId: transaction.walletId,
            };

            // Upsert to Supabase
            const { data, error } = await this.supabase
                .from('embeddings')
                .upsert(
                    {
                        entity_type: 'transaction' as const,
                        entity_id: transactionId,
                        user_id: transaction.userId,
                        content,
                        embedding,
                        metadata,
                    },
                    {
                        onConflict: 'entity_type,entity_id',
                    }
                )
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to store embedding: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error(`Error generating transaction embedding for ${transactionId}:`, error);
            throw error;
        }
    }

    /**
     * Generate and store embedding for a category.
     * Content format: "[EXPENSE|INCOME]: name"
     *
     * @param categoryId - UUID of the category
     * @returns The created/updated embedding record or null if service unavailable
     */
    async generateCategoryEmbedding(categoryId: string): Promise<EmbeddingRecord | null> {
        if (!this.isAvailable) {
            console.warn(`Embedding service unavailable. Skipping category ${categoryId}`);
            return null;
        }

        try {
            // Fetch category details
            const category = await prisma.category.findUnique({
                where: { id: categoryId },
            });

            if (!category) {
                throw new Error(`Category ${categoryId} not found`);
            }

            // Format content: "[EXPENSE|INCOME]: name"
            const content = `[${category.type}]: ${category.name}`;

            // Generate embedding
            const embedding = await this.generateEmbedding(content);

            // Prepare metadata
            const metadata: CategoryMetadata = {
                name: category.name,
                type: category.type,
                scope: category.scope,
                icon: category.icon,
            };

            // User ID is null for GLOBAL categories
            const userId = category.scope === 'GLOBAL' ? null : category.ownerId;

            // Upsert to Supabase
            const { data, error } = await this.supabase
                .from('embeddings')
                .upsert(
                    {
                        entity_type: 'category' as const,
                        entity_id: categoryId,
                        user_id: userId,
                        content,
                        embedding,
                        metadata,
                    },
                    {
                        onConflict: 'entity_type,entity_id',
                    }
                )
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to store embedding: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error(`Error generating category embedding for ${categoryId}:`, error);
            throw error;
        }
    }

    /**
     * Search for similar transactions using semantic similarity or hybrid search.
     *
     * @param userId - User ID to filter transactions
     * @param queryText - Natural language query
     * @param options - Optional filters and limit
     * @returns Array of similar transactions with similarity scores
     */
    async searchSimilarTransactions(
        userId: string,
        queryText: string,
        options?: {
            walletId?: string;
            categoryId?: string;
            limit?: number;
            similarityThreshold?: number;
            useHybrid?: boolean; // Enable hybrid search (default: true)
            fullTextWeight?: number; // Keyword search weight (default: 1)
            semanticWeight?: number; // Semantic search weight (default: 1)
        }
    ): Promise<SearchResult[]> {
        if (!this.isAvailable) {
            console.warn('Embedding service unavailable. Cannot perform semantic search.');
            return [];
        }

        try {
            const limit = options?.limit || 10;
            const threshold = options?.similarityThreshold || 0.7;
            const useHybrid = options?.useHybrid !== false; // Default to true
            const fullTextWeight = options?.fullTextWeight || 1;
            const semanticWeight = options?.semanticWeight || 1;

            // Generate embedding for query
            const queryEmbedding = await this.generateEmbedding(queryText);

            // Try hybrid search first if enabled
            if (useHybrid) {
                try {
                    console.log('Using hybrid search for transactions');
                    const { data, error } = await this.supabase.rpc('hybrid_search_transactions', {
                        query_text: queryText,
                        query_embedding: queryEmbedding,
                        user_id_param: userId,
                        match_count: limit,
                        full_text_weight: fullTextWeight,
                        semantic_weight: semanticWeight,
                        rrf_k: 50,
                    });

                    if (!error && data) {
                        console.log("Data received from hybrid search:", data);
                        console.log("Threshold:", threshold);
                        // Hybrid search succeeded
                        return data
                            .filter((record: any) => record.similarity >= threshold)
                            .map((record: any) => ({
                                transactionId: record.entity_id,
                                similarity: record.similarity,
                                content: record.content,
                                metadata: record.metadata as TransactionMetadata,
                                rankScore: record.rank_score,
                            }));
                    }

                    console.warn('Hybrid search not available, falling back to semantic-only:', error?.message);
                } catch (rpcError) {
                    console.warn('Hybrid search failed, trying semantic-only:', rpcError);
                }
            }

            // Try semantic-only RPC function
            try {
                const { data, error } = await this.supabase.rpc('search_similar_transactions', {
                    query_embedding: queryEmbedding,
                    user_id_param: userId,
                    similarity_threshold: threshold,
                    match_limit: limit,
                });

                if (!error && data) {
                    return data.map((record: any) => ({
                        transactionId: record.entity_id,
                        similarity: record.similarity,
                        content: record.content,
                        metadata: record.metadata as TransactionMetadata,
                    }));
                }

                console.warn('RPC function not available, falling back to client-side search:', error?.message);
            } catch (rpcError) {
                console.warn('RPC function failed, using client-side search:', rpcError);
            }

            // Fallback: Client-side similarity calculation
            const { data, error } = await this.supabase.from('embeddings').select('entity_id, content, metadata, embedding').eq('entity_type', 'transaction').eq('user_id', userId);

            if (error) {
                throw new Error(`Search failed: ${error.message}`);
            }

            if (!data) {
                return [];
            }

            // Calculate cosine similarity and filter
            const results = data
                .map((record) => {
                    try {
                        const recordEmbedding = this.parseEmbedding(record.embedding);
                        const similarity = this.cosineSimilarity(queryEmbedding, recordEmbedding);
                        return {
                            transactionId: record.entity_id,
                            similarity,
                            content: record.content,
                            metadata: record.metadata as TransactionMetadata,
                        };
                    } catch (error) {
                        console.error(`Failed to process embedding for transaction ${record.entity_id}:`, error);
                        return null;
                    }
                })
                .filter((result): result is SearchResult => result !== null && result.similarity >= threshold)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);

            return results;
        } catch (error) {
            console.error('Error searching similar transactions:', error);
            throw error;
        }
    }

    /**
     * Suggest a category for a given transaction description.
     *
     * @param description - Transaction description
     * @param type - Transaction type (INCOME or EXPENSE)
     * @param userId - Optional user ID to include user-specific categories
     * @param options - Optional hybrid search parameters
     * @returns Top category suggestion with similarity score
     */
    async suggestCategoryForDescription(
        description: string,
        type: TransactionType,
        userId?: string,
        options?: {
            useHybrid?: boolean; // Enable hybrid search (default: true)
            fullTextWeight?: number; // Keyword search weight (default: 1.5 for categories)
            semanticWeight?: number; // Semantic search weight (default: 1)
        }
    ): Promise<CategorySuggestion | null> {
        if (!this.isAvailable) {
            console.warn('Embedding service unavailable. Cannot suggest category.');
            return null;
        }

        try {
            const useHybrid = options?.useHybrid !== false; // Default to true
            const fullTextWeight = options?.fullTextWeight || 1.5; // Prefer keyword matches for categories
            const semanticWeight = options?.semanticWeight || 1;

            // Generate embedding for description
            const queryEmbedding = await this.generateEmbedding(description);

            // Try hybrid search first if enabled
            if (useHybrid) {
                try {
                    const { data, error } = await this.supabase.rpc('hybrid_search_categories', {
                        query_text: description,
                        query_embedding: queryEmbedding,
                        user_id_param: userId || null,
                        transaction_type: type,
                        match_count: 1,
                        full_text_weight: fullTextWeight,
                        semantic_weight: semanticWeight,
                        rrf_k: 50,
                    });

                    if (!error && data && data.length > 0) {
                        const record = data[0];
                        const metadata = record.metadata as CategoryMetadata;
                        return {
                            categoryId: record.entity_id,
                            categoryName: metadata.name,
                            similarity: record.similarity,
                            type: metadata.type,
                            rankScore: record.rank_score,
                        };
                    }

                    console.warn('Hybrid search not available, falling back to semantic-only:', error?.message);
                } catch (rpcError) {
                    console.warn('Hybrid search failed, trying semantic-only:', rpcError);
                }
            }

            // Try semantic-only RPC function
            try {
                const { data, error } = await this.supabase.rpc('search_similar_categories', {
                    query_embedding: queryEmbedding,
                    user_id_param: userId || null,
                    transaction_type: type,
                    similarity_threshold: 0.5,
                    match_limit: 1,
                });

                if (!error && data && data.length > 0) {
                    const record = data[0];
                    const metadata = record.metadata as CategoryMetadata;
                    return {
                        categoryId: record.entity_id,
                        categoryName: metadata.name,
                        similarity: record.similarity,
                        type: metadata.type,
                    };
                }

                console.warn('RPC function not available, falling back to client-side search:', error?.message);
            } catch (rpcError) {
                console.warn('RPC function failed, using client-side search:', rpcError);
            }

            // Fallback: Client-side similarity calculation
            let query = this.supabase.from('embeddings').select('entity_id, content, metadata, embedding').eq('entity_type', 'category');

            // Filter by user (include GLOBAL and user-specific categories)
            if (userId) {
                query = query.or(`user_id.is.null,user_id.eq.${userId}`);
            } else {
                query = query.is('user_id', null);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Category search failed: ${error.message}`);
            }

            if (!data || data.length === 0) {
                return null;
            }

            // Calculate similarity and find best match for the specified type
            const suggestions = data
                .map((record) => {
                    try {
                        const metadata = record.metadata as CategoryMetadata;
                        const recordEmbedding = this.parseEmbedding(record.embedding);
                        const similarity = this.cosineSimilarity(queryEmbedding, recordEmbedding);
                        return {
                            categoryId: record.entity_id,
                            categoryName: metadata.name,
                            similarity,
                            type: metadata.type,
                        };
                    } catch (error) {
                        console.error(`Failed to process embedding for category ${record.entity_id}:`, error);
                        return null;
                    }
                })
                .filter((suggestion): suggestion is CategorySuggestion => suggestion !== null && suggestion.type === type)
                .sort((a, b) => b.similarity - a.similarity);

            return suggestions.length > 0 ? suggestions[0] : null;
        } catch (error) {
            console.error('Error suggesting category:', error);
            throw error;
        }
    }

    /**
     * Parse embedding from Supabase (handles string or array format)
     * @private
     */
    private parseEmbedding(embedding: unknown): number[] {
        if (Array.isArray(embedding)) {
            return embedding;
        }
        if (typeof embedding === 'string') {
            try {
                return JSON.parse(embedding);
            } catch {
                throw new Error('Failed to parse embedding string');
            }
        }
        throw new Error(`Invalid embedding format: ${typeof embedding}`);
    }

    /**
     * Calculate cosine similarity between two vectors
     * @private
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            console.error(`Vector length mismatch: a=${a.length}, b=${b.length}`);
            throw new Error(`Vectors must have the same length (got ${a.length} and ${b.length})`);
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Delete embedding for an entity
     *
     * @param entityType - Type of entity (transaction or category)
     * @param entityId - UUID of the entity
     */
    async deleteEmbedding(entityType: EntityType, entityId: string): Promise<void> {
        try {
            const { error } = await this.supabase.from('embeddings').delete().eq('entity_type', entityType).eq('entity_id', entityId);

            if (error) {
                throw new Error(`Failed to delete embedding: ${error.message}`);
            }
        } catch (error) {
            console.error(`Error deleting embedding for ${entityType} ${entityId}:`, error);
            throw error;
        }
    }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService();
