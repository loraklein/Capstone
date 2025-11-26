-- Chapters table for organizing pages into sections
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_page_number INTEGER NOT NULL,
  end_page_number INTEGER,
  chapter_order INTEGER NOT NULL DEFAULT 0,
  chapter_type TEXT DEFAULT 'chapter' CHECK (chapter_type IN ('chapter', 'section', 'letter', 'recipe', 'entry', 'other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chapters_project_id ON chapters(project_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(project_id, chapter_order);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chapters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on chapters
DROP TRIGGER IF EXISTS update_chapters_updated_at_trigger ON chapters;
CREATE TRIGGER update_chapters_updated_at_trigger
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_chapters_updated_at();

-- Enable Row Level Security
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapters
-- Users can only see chapters for projects they own
CREATE POLICY chapters_select_policy ON chapters
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Users can only insert chapters for projects they own
CREATE POLICY chapters_insert_policy ON chapters
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Users can only update chapters for projects they own
CREATE POLICY chapters_update_policy ON chapters
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Users can only delete chapters for projects they own
CREATE POLICY chapters_delete_policy ON chapters
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
