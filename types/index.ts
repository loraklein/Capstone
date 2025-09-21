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
  ai_processed_at?: string;
  ai_confidence?: number;
  ai_provider?: string;
  processing_status?: string;
  created_at?: string;
} 