import { Request, Response } from 'express';
import { supabase } from '../config/database';

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
