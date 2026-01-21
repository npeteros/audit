-- Add check constraint to enforce scope-field consistency
-- GLOBAL categories must have ownerId = NULL
-- USER categories must have ownerId IS NOT NULL
ALTER TABLE "categories" ADD CONSTRAINT "category_scope_check" CHECK (
  (scope = 'GLOBAL' AND "ownerId" IS NULL) OR
  (scope = 'USER' AND "ownerId" IS NOT NULL)
);

-- Add partial unique indexes to prevent duplicate category names per scope
-- Global categories: unique by (name, type)
CREATE UNIQUE INDEX "categories_global_name_type_key" 
  ON "categories" (name, type) 
  WHERE scope = 'GLOBAL';

-- User categories: unique by (ownerId, name, type)
CREATE UNIQUE INDEX "categories_user_name_type_key" 
  ON "categories" ("ownerId", name, type) 
  WHERE scope = 'USER';
