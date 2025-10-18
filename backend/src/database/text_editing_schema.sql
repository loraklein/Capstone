-- Text Editing Feature Schema Updates
-- Add fields for storing detailed AI data and edited text

-- Add columns for edited text and detailed AI annotations
ALTER TABLE pages ADD COLUMN IF NOT EXISTS edited_text TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS ai_annotations JSONB; -- Store detailed word/line data from Vision API

-- Add index for faster queries on edited text
CREATE INDEX IF NOT EXISTS idx_pages_edited_text ON pages USING gin(to_tsvector('english', COALESCE(edited_text, '')));

COMMENT ON COLUMN pages.edited_text IS 'User-edited version of extracted text';
COMMENT ON COLUMN pages.ai_annotations IS 'Detailed word-level data from AI provider (bounding boxes, coordinates)';

