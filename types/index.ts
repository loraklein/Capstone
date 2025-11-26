export interface CapturedPage {
  id: string;
  pageNumber: number;
  timestamp: Date;
  photoUri?: string;
  rotation?: number;
  // Backend fields
  projectId?: string;
  photo_url?: string;
  extracted_text?: string;
  edited_text?: string;
  ai_annotations?: any[]; // Google Vision word-level annotations
  ai_processed_at?: string;
  ai_confidence?: number;
  ai_provider?: string;
  processing_status?: string;
  created_at?: string;
}

export interface Chapter {
  id: string;
  project_id: string;
  title: string;
  start_page_number: number;
  end_page_number?: number;
  chapter_order: number;
  chapter_type: 'chapter' | 'section' | 'letter' | 'recipe' | 'entry' | 'other';
  description?: string;
  created_at?: string;
  updated_at?: string;
} 