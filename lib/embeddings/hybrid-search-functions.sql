-- Hybrid Search RPC Functions for Embeddings
-- These combine full-text keyword search with semantic vector search using Reciprocal Ranked Fusion (RRF)
-- 
-- Prerequisites:
-- 1. embeddings table must have 'fts' tsvector column (created in schema.sql)
-- 2. GIN index on fts column (created in schema.sql)
-- 3. Vector index on embedding column (created in schema.sql)

-- Hybrid search function for transactions
-- Combines full-text keyword search with semantic vector search
CREATE OR REPLACE FUNCTION hybrid_search_transactions(
  query_text text,
  query_embedding vector(1536),
  user_id_param uuid,
  match_count int DEFAULT 10,
  full_text_weight float DEFAULT 1,
  semantic_weight float DEFAULT 1,
  rrf_k int DEFAULT 50
)
RETURNS TABLE (
  entity_id uuid,
  content text,
  metadata jsonb,
  similarity float,
  rank_score float
)
LANGUAGE sql
AS $$
WITH full_text AS (
  SELECT
    entity_id,
    content,
    metadata,
    ROW_NUMBER() OVER(ORDER BY ts_rank_cd(fts, websearch_to_tsquery(query_text)) DESC) as rank_ix
  FROM embeddings
  WHERE 
    entity_type = 'transaction'
    AND user_id = user_id_param
    AND fts @@ websearch_to_tsquery(query_text)
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
),
semantic AS (
  SELECT
    entity_id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity,
    ROW_NUMBER() OVER(ORDER BY embedding <=> query_embedding) as rank_ix
  FROM embeddings
  WHERE 
    entity_type = 'transaction'
    AND user_id = user_id_param
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
)
SELECT
  COALESCE(full_text.entity_id, semantic.entity_id) as entity_id,
  COALESCE(full_text.content, semantic.content) as content,
  COALESCE(full_text.metadata, semantic.metadata) as metadata,
  COALESCE(semantic.similarity, 0.0) as similarity,
  (COALESCE(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
   COALESCE(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight) as rank_score
FROM full_text
FULL OUTER JOIN semantic
  ON full_text.entity_id = semantic.entity_id
ORDER BY rank_score DESC
LIMIT LEAST(match_count, 30)
$$;

-- Hybrid search function for categories
-- Combines full-text keyword search with semantic vector search
CREATE OR REPLACE FUNCTION hybrid_search_categories(
  query_text text,
  query_embedding vector(1536),
  user_id_param uuid,
  transaction_type text DEFAULT NULL,
  match_count int DEFAULT 5,
  full_text_weight float DEFAULT 1,
  semantic_weight float DEFAULT 1,
  rrf_k int DEFAULT 50
)
RETURNS TABLE (
  entity_id uuid,
  content text,
  metadata jsonb,
  similarity float,
  rank_score float
)
LANGUAGE sql
AS $$
WITH full_text AS (
  SELECT
    entity_id,
    content,
    metadata,
    ROW_NUMBER() OVER(ORDER BY ts_rank_cd(fts, websearch_to_tsquery(query_text)) DESC) as rank_ix
  FROM embeddings
  WHERE 
    entity_type = 'category'
    AND user_id = user_id_param
    AND (transaction_type IS NULL OR metadata->>'type' = transaction_type)
    AND fts @@ websearch_to_tsquery(query_text)
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
),
semantic AS (
  SELECT
    entity_id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity,
    ROW_NUMBER() OVER(ORDER BY embedding <=> query_embedding) as rank_ix
  FROM embeddings
  WHERE 
    entity_type = 'category'
    AND user_id = user_id_param
    AND (transaction_type IS NULL OR metadata->>'type' = transaction_type)
  ORDER BY rank_ix
  LIMIT LEAST(match_count, 30) * 2
)
SELECT
  COALESCE(full_text.entity_id, semantic.entity_id) as entity_id,
  COALESCE(full_text.content, semantic.content) as content,
  COALESCE(full_text.metadata, semantic.metadata) as metadata,
  COALESCE(semantic.similarity, 0.0) as similarity,
  (COALESCE(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
   COALESCE(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight) as rank_score
FROM full_text
FULL OUTER JOIN semantic
  ON full_text.entity_id = semantic.entity_id
ORDER BY rank_score DESC
LIMIT LEAST(match_count, 30)
$$;

COMMENT ON FUNCTION hybrid_search_transactions IS 'Hybrid search combining keyword and semantic search for transactions using RRF algorithm';
COMMENT ON FUNCTION hybrid_search_categories IS 'Hybrid search combining keyword and semantic search for categories using RRF algorithm';
