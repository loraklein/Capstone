import { Request, Response } from 'express';
import { supabase } from '../config/database';

interface ChapterSuggestion {
  title: string;
  start_page_number: number;
  end_page_number?: number;
  chapter_type: 'entry' | 'letter' | 'recipe' | 'chapter' | 'section';
  description?: string;
  confidence: number;
}

interface ReorganizationPage {
  page_id: string;
  current_page_number: number;
  title: string;
}

interface ReorganizationCategory {
  category: string;
  chapter_type: 'entry' | 'letter' | 'recipe' | 'section';
  pages: ReorganizationPage[];
}

interface ReorganizationSuggestion {
  type: 'reorganization';
  categories: ReorganizationCategory[];
}

// Get all chapters for a project
export const getProjectChapters = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get chapters
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('project_id', projectId)
      .order('chapter_order', { ascending: true });

    if (error) {
      console.error('Error fetching chapters:', error);
      return res.status(500).json({ error: 'Failed to fetch chapters' });
    }

    res.json(chapters || []);
  } catch (error) {
    console.error('Error in getProjectChapters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new chapter
export const createChapter = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const { title, start_page_number, end_page_number, chapter_type, description } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title || start_page_number === undefined) {
      return res.status(400).json({ error: 'Title and start_page_number are required' });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get the next chapter order
    const { data: existingChapters } = await supabase
      .from('chapters')
      .select('chapter_order')
      .eq('project_id', projectId)
      .order('chapter_order', { ascending: false })
      .limit(1);

    const nextOrder = existingChapters && existingChapters.length > 0
      ? existingChapters[0].chapter_order + 1
      : 0;

    // Create chapter
    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert({
        project_id: projectId,
        title,
        start_page_number,
        end_page_number: end_page_number || null,
        chapter_type: chapter_type || 'chapter',
        description: description || null,
        chapter_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chapter:', error);
      return res.status(500).json({ error: 'Failed to create chapter' });
    }

    res.status(201).json(chapter);
  } catch (error) {
    console.error('Error in createChapter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a chapter
export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user?.id;
    const { title, start_page_number, end_page_number, chapter_type, description, chapter_order } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify chapter ownership through project
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*, projects!inner(user_id)')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapter || (chapter.projects as any).user_id !== userId) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Build update object
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (start_page_number !== undefined) updates.start_page_number = start_page_number;
    if (end_page_number !== undefined) updates.end_page_number = end_page_number;
    if (chapter_type !== undefined) updates.chapter_type = chapter_type;
    if (description !== undefined) updates.description = description;
    if (chapter_order !== undefined) updates.chapter_order = chapter_order;

    // Update chapter
    const { data: updatedChapter, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', chapterId)
      .select()
      .single();

    if (error) {
      console.error('Error updating chapter:', error);
      return res.status(500).json({ error: 'Failed to update chapter' });
    }

    res.json(updatedChapter);
  } catch (error) {
    console.error('Error in updateChapter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a chapter
export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify chapter ownership through project
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*, projects!inner(user_id)')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapter || (chapter.projects as any).user_id !== userId) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Delete chapter
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (error) {
      console.error('Error deleting chapter:', error);
      return res.status(500).json({ error: 'Failed to delete chapter' });
    }

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error in deleteChapter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete all chapters for a project
export const deleteAllChapters = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete all chapters
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('project_id', projectId);

    if (error) {
      console.error('Error deleting all chapters:', error);
      return res.status(500).json({ error: 'Failed to delete chapters' });
    }

    res.json({ message: 'All chapters deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAllChapters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reorder chapters
export const reorderChapters = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const { chapterIds } = req.body; // Array of chapter IDs in new order

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!Array.isArray(chapterIds)) {
      return res.status(400).json({ error: 'chapterIds must be an array' });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update chapter orders
    const updates = chapterIds.map((id, index) =>
      supabase
        .from('chapters')
        .update({ chapter_order: index })
        .eq('id', id)
        .eq('project_id', projectId)
    );

    await Promise.all(updates);

    // Fetch updated chapters
    const { data: chapters } = await supabase
      .from('chapters')
      .select('*')
      .eq('project_id', projectId)
      .order('chapter_order', { ascending: true });

    res.json(chapters || []);
  } catch (error) {
    console.error('Error in reorderChapters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Suggest chapters based on AI analysis
export const suggestChapters = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify project ownership and get project type
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, project_type')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all pages with text
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, page_number, edited_text, extracted_text')
      .eq('project_id', projectId)
      .order('page_number', { ascending: true });

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      return res.status(500).json({ error: 'Failed to fetch pages' });
    }

    if (!pages || pages.length === 0) {
      return res.json([]);
    }

    // Analyze and suggest chapters based on project type
    const suggestions = await analyzeAndSuggestChapters(pages, project.project_type || 'General');

    res.json(suggestions);
  } catch (error) {
    console.error('Error in suggestChapters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Execute reorganization: reorder pages and create sections
export const executeReorganization = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const reorganization: ReorganizationSuggestion = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Build page number mapping
    let newPageNumber = 1;
    const pageUpdates: { page_id: string; new_page_number: number }[] = [];

    for (const category of reorganization.categories) {
      for (const page of category.pages) {
        pageUpdates.push({
          page_id: page.page_id,
          new_page_number: newPageNumber++
        });
      }
    }

    console.log('[Reorganization] Updating page numbers for', pageUpdates.length, 'pages');

    // Update all page numbers
    for (const update of pageUpdates) {
      await supabase
        .from('pages')
        .update({ page_number: update.new_page_number })
        .eq('id', update.page_id);
    }

    console.log('[Reorganization] Creating', reorganization.categories.length, 'sections');

    // Create chapter sections
    let chapterOrder = 0;
    const createdChapters = [];

    for (const category of reorganization.categories) {
      const startPage = pageUpdates.find(u => u.page_id === category.pages[0].page_id)?.new_page_number || 1;
      const endPage = pageUpdates.find(u => u.page_id === category.pages[category.pages.length - 1].page_id)?.new_page_number || 1;

      const { data: chapter, error } = await supabase
        .from('chapters')
        .insert({
          project_id: projectId,
          title: category.category,
          start_page_number: startPage,
          end_page_number: endPage,
          chapter_type: category.chapter_type,
          description: `${category.pages.length} item${category.pages.length > 1 ? 's' : ''}`,
          chapter_order: chapterOrder++,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chapter:', error);
      } else {
        createdChapters.push(chapter);
      }
    }

    console.log('[Reorganization] Complete! Created', createdChapters.length, 'chapters');

    res.json({
      success: true,
      pages_updated: pageUpdates.length,
      chapters_created: createdChapters.length,
      chapters: createdChapters
    });
  } catch (error) {
    console.error('Error in executeReorganization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function analyzeAndSuggestChapters(pages: any[], projectType: string): Promise<ReorganizationSuggestion | ChapterSuggestion[]> {
  console.log('[AI Suggestions] Analyzing project type:', projectType);
  console.log('[AI Suggestions] Total pages:', pages.length);

  if (projectType?.toLowerCase() === 'recipe' || projectType?.toLowerCase() === 'recipes') {
    // Recipe detection: Look for recipe titles and categorize
    const recipesByCategory: { [key: string]: ReorganizationPage[] } = {
      'Appetizers': [],
      'Soups & Stews': [],
      'Salads': [],
      'Main Dishes': [],
      'Desserts': [],
      'Other Recipes': [],
    };

    pages.forEach((page, index) => {
      const text = page.edited_text || page.extracted_text || '';
      const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);

      console.log(`[Recipe Detection] Page ${page.page_number}: ${lines.length} lines`);

      if (lines.length === 0) return;

      // Find the recipe title - usually the first substantial line
      let title = '';

      // Try to find a title in first few lines
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        // Look for lines that seem like titles (not too long, not instructions/ingredients markers)
        if (line.length > 3 && line.length < 80 &&
            !line.match(/^ingredients$/i) &&
            !line.match(/^instructions$/i) &&
            !line.match(/^directions$/i) &&
            !line.match(/^servings:/i) &&
            !line.match(/^prep time:/i) &&
            !line.match(/^cook time:/i)) {
          title = line;
          break;
        }
      }

      if (title) {
        console.log(`[Recipe Detection] Found title on page ${page.page_number}: "${title}"`);

        let category = 'Other Recipes';

        // Categorize by keywords in the entire text (not just title)
        const fullText = text.toLowerCase();
        if (fullText.match(/appetizer|dip|snack|starter/i)) category = 'Appetizers';
        else if (fullText.match(/soup|stew|chili|broth/i)) category = 'Soups & Stews';
        else if (fullText.match(/salad|greens|lettuce|coleslaw/i)) category = 'Salads';
        else if (fullText.match(/chicken|beef|pork|fish|pasta|casserole|entree|entre|main dish|dinner/i)) category = 'Main Dishes';
        else if (fullText.match(/cake|cookie|pie|dessert|pudding|brownie|tart|frosting|icing|chocolate chip/i)) category = 'Desserts';

        console.log(`[Recipe Detection] Categorized as: ${category}`);

        recipesByCategory[category].push({
          page_id: page.id,
          current_page_number: page.page_number,
          title
        });
      } else {
        console.log(`[Recipe Detection] No title found on page ${page.page_number}`);
      }
    });

    // Build reorganization suggestion with categories in logical order
    const categoryOrder = ['Appetizers', 'Soups & Stews', 'Salads', 'Main Dishes', 'Desserts', 'Other Recipes'];
    const categories: ReorganizationCategory[] = [];

    categoryOrder.forEach(categoryName => {
      const pages = recipesByCategory[categoryName];
      if (pages && pages.length > 0) {
        categories.push({
          category: categoryName,
          chapter_type: 'section',
          pages
        });
      }
    });

    return {
      type: 'reorganization',
      categories
    };
  } else if (projectType?.toLowerCase() === 'letter') {
    // Letter detection: Look for dates and group by year
    const lettersByYear: { [key: string]: ReorganizationPage[] } = {};
    const datePattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+(\d{4})\b/i;

    pages.forEach((page) => {
      const text = page.edited_text || page.extracted_text || '';
      const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
      const match = text.match(datePattern);

      if (match && match[2]) {
        const year = match[2];
        const title = lines[0] || `Letter from ${match[0]}`;

        if (!lettersByYear[year]) {
          lettersByYear[year] = [];
        }
        lettersByYear[year].push({
          page_id: page.id,
          current_page_number: page.page_number,
          title
        });
      }
    });

    // Build reorganization with years in chronological order
    const years = Object.keys(lettersByYear).sort();
    const categories: ReorganizationCategory[] = years.map(year => ({
      category: `Letters from ${year}`,
      chapter_type: 'section',
      pages: lettersByYear[year]
    }));

    return {
      type: 'reorganization',
      categories
    };
  } else if (projectType?.toLowerCase() === 'journal') {
    // Journal detection: Look for date entries and group by month
    const datePattern = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December),?\s+\w+\.?\s+\d{1,2},?\s+\d{4}\b/i;
    const entriesByMonth: { [key: string]: { date: Date; pages: ReorganizationPage[] } } = {};

    pages.forEach((page) => {
      const text = page.edited_text || page.extracted_text || '';
      const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
      const match = text.match(datePattern);

      if (match) {
        const date = new Date(match[0]);
        if (!isNaN(date.getTime())) {
          const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
          const title = lines[0] || match[0];

          if (!entriesByMonth[monthYear]) {
            entriesByMonth[monthYear] = { date, pages: [] };
          }
          entriesByMonth[monthYear].pages.push({
            page_id: page.id,
            current_page_number: page.page_number,
            title
          });
        }
      }
    });

    // Build reorganization sorted chronologically by month
    const sortedMonths = Object.entries(entriesByMonth)
      .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime());

    const categories: ReorganizationCategory[] = sortedMonths.map(([monthYear, data]) => ({
      category: monthYear,
      chapter_type: 'section',
      pages: data.pages
    }));

    return {
      type: 'reorganization',
      categories
    };
  } else {
    // Generic: Suggest dividing into roughly equal sections (fallback)
    const suggestions: ChapterSuggestion[] = [];
    const pagesPerSection = Math.ceil(pages.length / 3);
    const sectionCount = Math.ceil(pages.length / pagesPerSection);

    for (let i = 0; i < sectionCount; i++) {
      const startPage = i * pagesPerSection + 1;
      const endPage = Math.min((i + 1) * pagesPerSection, pages.length);

      suggestions.push({
        title: `Section ${i + 1}`,
        start_page_number: startPage,
        end_page_number: endPage,
        chapter_type: 'section',
        confidence: 0.5,
      });
    }

    console.log('[AI Suggestions] Generic fallback - creating', suggestions.length, 'sections');
    return suggestions;
  }
}
