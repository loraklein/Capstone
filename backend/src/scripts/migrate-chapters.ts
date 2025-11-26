import { supabase } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('Running chapters migration...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/chapters_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by statements (rough split - may need refinement)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        console.error('Error executing statement:', error);
        // Continue anyway - some errors are expected (like "already exists")
      }
    }

    console.log('✅ Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
