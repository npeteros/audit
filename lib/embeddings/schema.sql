-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the embeddings table for storing transaction and category embeddings
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('transaction', 'category')),
    entity_id UUID NOT NULL,
    user_id UUID, -- Nullable for GLOBAL scope categories
    content TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    fts tsvector, -- Full-text search column for hybrid search (populated via trigger)
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one embedding per entity
    CONSTRAINT unique_entity_embedding UNIQUE (entity_type, entity_id)
);

-- Create index for entity lookups
CREATE INDEX IF NOT EXISTS idx_embeddings_entity 
ON embeddings (entity_type, entity_id);

-- Create index for user-specific queries
CREATE INDEX IF NOT EXISTS idx_embeddings_user_id 
ON embeddings (user_id) 
WHERE user_id IS NOT NULL;

-- Create index for vector similarity search using IVFFlat
-- Note: You may need to adjust the lists parameter based on your dataset size
-- Recommended: lists = rows / 1000 for datasets up to 1M rows
CREATE INDEX IF NOT EXISTS idx_embeddings_vector 
ON embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create GIN index for full-text search (used by hybrid search)
CREATE INDEX IF NOT EXISTS idx_embeddings_fts 
ON embeddings 
USING gin(fts);

-- Create function to automatically update fts column
CREATE OR REPLACE FUNCTION update_embeddings_fts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fts = to_tsvector('english', NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain fts column on insert/update
DROP TRIGGER IF EXISTS embeddings_fts_trigger ON embeddings;
CREATE TRIGGER embeddings_fts_trigger
BEFORE INSERT OR UPDATE OF content ON embeddings
FOR EACH ROW
EXECUTE FUNCTION update_embeddings_fts();

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the update function
CREATE TRIGGER embeddings_updated_at_trigger
BEFORE UPDATE ON embeddings
FOR EACH ROW
EXECUTE FUNCTION update_embeddings_updated_at();

-- Create index on metadata for common queries
CREATE INDEX IF NOT EXISTS idx_embeddings_metadata 
ON embeddings USING gin (metadata);

COMMENT ON TABLE embeddings IS 'Stores vector embeddings for transactions and categories for semantic search';
COMMENT ON COLUMN embeddings.entity_type IS 'Type of entity: transaction or category';
COMMENT ON COLUMN embeddings.entity_id IS 'UUID reference to the entity in Prisma PostgreSQL database';
COMMENT ON COLUMN embeddings.user_id IS 'User ID for user-scoped entities (NULL for global categories)';
COMMENT ON COLUMN embeddings.content IS 'The text content that was embedded';
COMMENT ON COLUMN embeddings.embedding IS 'Vector embedding from OpenAI (1536 dimensions for text-embedding-3-small)';
COMMENT ON COLUMN embeddings.fts IS 'Full-text search vector for hybrid search (auto-populated via trigger)';
COMMENT ON COLUMN embeddings.metadata IS 'Additional metadata (e.g., categoryName, transactionDate, amount)';
