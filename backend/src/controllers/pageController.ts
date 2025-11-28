import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { storageService } from '../services/storageService';

export const getProjectPages = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all pages for this project
    const { data, error } = await supabase
      .from('pages')
      .select(`
        id,
        project_id,
        page_number,
        photo_url,
        rotation,
        extracted_text,
        edited_text,
        ai_confidence,
        ai_processed_at,
        ai_provider,
        ai_annotations,
        processing_status,
        created_at,
        review_status,
        reviewed_at
      `)
      .eq('project_id', projectId)
      .order('page_number', { ascending: true });

    if (error) {
      console.error('Error fetching project pages:', error);
      return res.status(500).json({ error: 'Failed to fetch project pages' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in getProjectPages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get the page and verify it belongs to a project owned by the user
    const { data: page, error } = await supabase
      .from('pages')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single();

    if (error || !page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error in getPage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addPage = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { photoUrl, rotation = 0 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, page_count')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      console.error('Project verification error:', projectError);
      return res.status(404).json({ error: 'Project not found', details: projectError.message });
    }

    if (!project) {
      console.error('Project not found for user:', { projectId, userId });
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get the next page number
    const pageNumber = project.page_count + 1;

    // Insert the new page
    const { data, error } = await supabase
      .from('pages')
      .insert([
        {
          project_id: projectId,
          page_number: pageNumber,
          photo_url: photoUrl,
          rotation
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding page:', error);
      return res.status(500).json({ error: 'Failed to add page', details: error.message });
    }

    // Update the project's page count
    const { error: updateError } = await supabase
      .from('projects')
      .update({ page_count: pageNumber })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project page count:', updateError);
      // Don't fail the request, just log the error
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in addPage:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { photoUrl, rotation, pageNumber } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First verify the page belongs to a project owned by the user
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single();

    if (pageError || !page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Update the page
    const updateData: any = {};
    if (photoUrl !== undefined) updateData.photo_url = photoUrl;
    if (rotation !== undefined) updateData.rotation = rotation;
    if (pageNumber !== undefined) updateData.page_number = pageNumber;

    const { data, error } = await supabase
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating page:', error);
      return res.status(500).json({ error: 'Failed to update page' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in updatePage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First verify the page belongs to a project owned by the user
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single();

    if (pageError || !page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Delete the image from storage first (if it exists)
    if (page.photo_url) {
      try {
        await storageService.deleteImage(page.photo_url);
      } catch (storageError) {
        console.error('Error deleting image from storage:', storageError);
        // Don't fail the request if storage deletion fails, but log it
      }
    }

    // Delete the page from database
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting page:', error);
      return res.status(500).json({ error: 'Failed to delete page' });
    }

    // Update page numbers for remaining pages
    const { data: remainingPages, error: fetchError } = await supabase
      .from('pages')
      .select('id, page_number')
      .eq('project_id', page.project_id)
      .gt('page_number', page.page_number)
      .order('page_number', { ascending: true });

    if (fetchError) {
      console.error('Error fetching remaining pages:', fetchError);
      // Don't fail the request, just log the error
    } else if (remainingPages && remainingPages.length > 0) {
      // Update page numbers
      for (let i = 0; i < remainingPages.length; i++) {
        const newPageNumber = page.page_number + i;
        await supabase
          .from('pages')
          .update({ page_number: newPageNumber })
          .eq('id', remainingPages[i].id);
      }
    }

    // Update project page count
    const { data: projectPages, error: countError } = await supabase
      .from('pages')
      .select('id', { count: 'exact' })
      .eq('project_id', page.project_id);

    if (!countError && projectPages) {
      await supabase
        .from('projects')
        .update({ page_count: projectPages.length })
        .eq('id', page.project_id);
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in deletePage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePageText = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { editedText } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify the page belongs to a project owned by the user
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single();

    if (pageError || !page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Update the edited text and automatically mark as reviewed
    const { data, error } = await supabase
      .from('pages')
      .update({
        edited_text: editedText,
        review_status: 'reviewed',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating page text:', error);
      return res.status(500).json({ error: 'Failed to update page text' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in updatePageText:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reorderPages = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { pageIds } = req.body; // Array of page IDs in new order
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update page numbers based on the new order
    const updates = pageIds.map((pageId: string, index: number) => ({
      id: pageId,
      page_number: index + 1
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('pages')
        .update({ page_number: update.page_number })
        .eq('id', update.id)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error reordering pages:', error);
        return res.status(500).json({ error: 'Failed to reorder pages' });
      }
    }

    res.json({ message: 'Pages reordered successfully' });
  } catch (error) {
    console.error('Error in reorderPages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update page review status
export const updatePageReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewStatus } = req.body; // 'unreviewed', 'needs_attention', 'reviewed'
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!reviewStatus || !['unreviewed', 'needs_attention', 'reviewed'].includes(reviewStatus)) {
      return res.status(400).json({ error: 'Invalid review status' });
    }

    // Verify the page belongs to a project owned by the user
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('id, project_id, projects!inner(user_id)')
      .eq('id', id)
      .single();

    if (pageError || !page || (page.projects as any).user_id !== userId) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Update review status
    const updateData: any = {
      review_status: reviewStatus,
    };

    // If marking as reviewed, set reviewed_at timestamp
    if (reviewStatus === 'reviewed') {
      updateData.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating page review status:', error);
      return res.status(500).json({ error: 'Failed to update review status' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in updatePageReviewStatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get review statistics for a project
export const getProjectReviewStats = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all pages with their review status
    const { data: pages, error } = await supabase
      .from('pages')
      .select('review_status, ai_confidence')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching pages for stats:', error);
      return res.status(500).json({ error: 'Failed to fetch review stats' });
    }

    // Calculate statistics
    const total = pages?.length || 0;
    const reviewed = pages?.filter(p => p.review_status === 'reviewed').length || 0;
    const needsAttention = pages?.filter(p => p.review_status === 'needs_attention').length || 0;
    const unreviewed = pages?.filter(p => p.review_status === 'unreviewed').length || 0;

    // Calculate average confidence
    const pagesWithConfidence = pages?.filter(p => p.ai_confidence !== null) || [];
    const avgConfidence = pagesWithConfidence.length > 0
      ? pagesWithConfidence.reduce((sum, p) => sum + (p.ai_confidence || 0), 0) / pagesWithConfidence.length
      : null;

    res.json({
      total,
      reviewed,
      needsAttention,
      unreviewed,
      percentComplete: total > 0 ? Math.round((reviewed / total) * 100) : 0,
      avgConfidence: avgConfidence ? Math.round(avgConfidence * 100) / 100 : null,
    });
  } catch (error) {
    console.error('Error in getProjectReviewStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
