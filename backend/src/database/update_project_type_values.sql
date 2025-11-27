-- Migration: Update project_type enum values
-- Change 'recipe' to 'recipes' and 'generic' to 'other'

-- Step 1: Convert column to TEXT (temporarily)
ALTER TABLE projects ALTER COLUMN project_type DROP DEFAULT;
ALTER TABLE projects ALTER COLUMN project_type TYPE TEXT;

-- Step 2: Migrate existing data (now that it's TEXT)
UPDATE projects SET project_type = 'other' WHERE project_type = 'generic';
UPDATE projects SET project_type = 'recipes' WHERE project_type = 'recipe';

-- Step 3: Drop old enum and create new one
DROP TYPE IF EXISTS project_type_enum;
CREATE TYPE project_type_enum AS ENUM ('other', 'recipes', 'journal', 'letters');

-- Step 4: Convert column back to enum
ALTER TABLE projects
  ALTER COLUMN project_type TYPE project_type_enum
  USING project_type::project_type_enum;

-- Step 5: Set default value
ALTER TABLE projects
  ALTER COLUMN project_type SET DEFAULT 'other'::project_type_enum;
