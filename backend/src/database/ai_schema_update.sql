-- AI Integration Schema Updates
-- Add text extraction fields to pages table

-- Add new columns to pages table for AI processing
ALTER TABLE pages ADD COLUMN IF NOT EXISTS extracted_text TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMP;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2); -- 0.00 to 1.00
ALTER TABLE pages ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50); -- 'ollama', 'google_vision', etc.
ALTER TABLE pages ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT 'pending'; -- 'pending', 'processing', 'completed', 'failed'

-- Add index for AI processing queries
CREATE INDEX IF NOT EXISTS idx_pages_processing_status ON pages(processing_status);
CREATE INDEX IF NOT EXISTS idx_pages_ai_processed_at ON pages(ai_processed_at);

-- Add a table to track AI processing jobs (optional, for better monitoring)
CREATE TABLE IF NOT EXISTS ai_processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for job tracking
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_page_id ON ai_processing_jobs(page_id);
