-- Migration: Add project_type column to projects table
-- This allows users to specify the type of content they're scanning
-- which enables custom AI prompts and formatting

-- Add project_type column with enum type
DO $$
BEGIN
  -- Create the project_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_type_enum') THEN
    CREATE TYPE project_type_enum AS ENUM ('generic', 'recipe', 'journal', 'letters');
  END IF;
END $$;

-- Add column to projects table with default value
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_type project_type_enum DEFAULT 'generic' NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);

-- Update existing projects to 'generic' type (already handled by default)
-- This migration is safe to run multiple times
