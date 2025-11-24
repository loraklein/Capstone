import { supabase } from '../config/database';

interface RawPageRecord {
  id: string;
  page_number: number;
  extracted_text?: string | null;
  edited_text?: string | null;
  photo_url?: string | null;
  ai_confidence?: number | null;
  ai_provider?: string | null;
  ai_processed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BookExportPage {
  id: string;
  pageNumber: number;
  extractedText: string | null;
  editedText: string | null;
  finalText: string;
  wordCount: number;
  photoUrl: string | null;
  ai: {
    provider: string | null;
    confidence: number | null;
    processedAt: string | null;
  };
  createdAt: string | null;
  updatedAt: string | null;
}

export interface BookFrontMatter {
  titlePage: {
    title: string;
    subtitle: string | null;
    author: string | null;
    generatedAt: string;
  };
  description: string | null;
}

export interface BookBackMatter {
  aboutAuthor?: string | null;
  notes?: string | null;
}

export interface BookExportPayload {
  project: {
    id: string;
    title: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  };
  summary: {
    pageCount: number;
    textPageCount: number;
    totalWords: number;
    hasImages: boolean;
  };
  frontMatter: BookFrontMatter;
  pages: BookExportPage[];
  backMatter: BookBackMatter;
  combinedText: string;
}

export class BookExportError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'BookExportError';
    this.status = status;
  }
}

const trimOrNull = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const countWords = (value: string): number => {
  if (!value) return 0;
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

const buildPage = (page: RawPageRecord): BookExportPage => {
  const editedText = trimOrNull(page.edited_text);
  const extractedText = trimOrNull(page.extracted_text);
  const finalText = editedText ?? extractedText ?? '';

  return {
    id: page.id,
    pageNumber: page.page_number,
    extractedText,
    editedText,
    finalText,
    wordCount: countWords(finalText),
    photoUrl: page.photo_url ?? null,
    ai: {
      provider: page.ai_provider ?? null,
      confidence: typeof page.ai_confidence === 'number' ? page.ai_confidence : null,
      processedAt: page.ai_processed_at ?? null,
    },
    createdAt: page.created_at ?? null,
    updatedAt: page.updated_at ?? null,
  };
};

export async function buildBookExport(projectId: string, userId: string): Promise<BookExportPayload> {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, description, created_at, updated_at')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (projectError || !project) {
    throw new BookExportError('Project not found', 404);
  }

  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('id, page_number, extracted_text, edited_text, photo_url, ai_confidence, ai_provider, ai_processed_at, created_at')
    .eq('project_id', projectId)
    .order('page_number', { ascending: true });

  if (pagesError) {
    console.error('Error fetching pages for book export:', pagesError);
    throw new BookExportError('Failed to fetch project pages');
  }

  const exportPages = (pages ?? []).map(buildPage);
  const totalWords = exportPages.reduce((sum, page) => sum + page.wordCount, 0);
  const textPageCount = exportPages.filter((page) => page.finalText.length > 0).length;
  const hasImages = exportPages.some((page) => Boolean(page.photoUrl));

  const title = project.name || 'Untitled Project';
  const description = trimOrNull(project.description);

  const frontMatter: BookFrontMatter = {
    titlePage: {
      title,
      subtitle: description,
      author: null,
      generatedAt: new Date().toISOString(),
    },
    description,
  };

  const backMatter: BookBackMatter = {};

  const combinedText = exportPages
    .map((page) => {
      const header = `Page ${page.pageNumber}`;
      const body = page.finalText;
      return body ? `${header}\n${body}` : header;
    })
    .join('\n\n');

  return {
    project: {
      id: project.id,
      title,
      description,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    },
    summary: {
      pageCount: exportPages.length,
      textPageCount,
      totalWords,
      hasImages,
    },
    frontMatter,
    pages: exportPages,
    backMatter,
    combinedText,
  };
}

