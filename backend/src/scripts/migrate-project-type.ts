// Migration script to add project_type column to projects table
import { supabase } from '../config/database';

async function migrateProjectType() {
  console.log('Starting project_type migration...');

  try {
    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create the project_type enum if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_type_enum') THEN
            CREATE TYPE project_type_enum AS ENUM ('generic', 'recipe', 'journal', 'letters');
          END IF;
        END $$;

        -- Add column to projects table with default value
        ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS project_type project_type_enum DEFAULT 'generic' NOT NULL;

        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
      `
    });

    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }

    console.log('✅ Migration completed successfully!');
    console.log('Added project_type column to projects table');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateProjectType()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
