-- Migration: Add review_status to pages table
-- This allows users to track which pages they've reviewed

-- Add review_status column
ALTER TABLE pages ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) DEFAULT 'unreviewed';
-- Possible values: 'unreviewed', 'needs_attention', 'reviewed'

-- Add reviewed_at timestamp
ALTER TABLE pages ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

-- Add index for filtering by review status
CREATE INDEX IF NOT EXISTS idx_pages_review_status ON pages(review_status);

-- Set all existing pages to 'unreviewed' first (DEFAULT only works for new rows)
UPDATE pages
SET review_status = 'unreviewed'
WHERE review_status IS NULL;

-- Update existing pages based on AI confidence
-- Pages with low confidence (<0.7) automatically marked as 'needs_attention'
-- Pages with no extracted text marked as 'needs_attention'
-- Pages with good confidence remain 'unreviewed' until user checks them
UPDATE pages
SET review_status = 'needs_attention'
WHERE (ai_confidence IS NOT NULL AND ai_confidence < 0.70)
   OR (extracted_text IS NULL OR extracted_text = '')
   OR processing_status = 'failed';

-- Comment explaining the review_status values
COMMENT ON COLUMN pages.review_status IS 'Track user review status: unreviewed, needs_attention, reviewed';
