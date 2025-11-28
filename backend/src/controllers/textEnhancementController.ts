import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { textEnhancementService } from '../services/textEnhancementService';

// Correct text for a specific page
export const correctPageText = async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const userId = req.user?.id;
    const { provider } = req.body; // Optional: specify which provider to use

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the page and verify ownership, also fetch project_type
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*, projects!inner(user_id, project_type)')
      .eq('id', pageId)
      .single();

    if (pageError || !page || (page.projects as any).user_id !== userId) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Get the text to correct (prefer edited_text, fallback to extracted_text)
    const textToCorrect = page.edited_text || page.extracted_text;

    if (!textToCorrect || textToCorrect.trim().length === 0) {
      return res.status(400).json({ error: 'No text available to correct' });
    }

    // Get the project type from the page's project
    const projectType = (page.projects as any).project_type || 'other';

    // Correct the text using AI with project type context
    const correction = await textEnhancementService.correctPageText(
      textToCorrect,
      provider,
      projectType
    );

    // Return the correction without saving (let user review first)
    res.json({
      pageId: page.id,
      original: correction.original,
      corrected: correction.corrected,
      changes: correction.changes,
      provider: provider || 'ollama',
      projectType,
    });
  } catch (error) {
    console.error('Error in correctPageText:', error);
    res.status(500).json({
      error: 'Failed to correct text',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Apply corrected text to a page
export const applyCorrection = async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const userId = req.user?.id;
    const { correctedText } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!correctedText) {
      return res.status(400).json({ error: 'Corrected text is required' });
    }

    // Verify page ownership
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*, projects!inner(user_id)')
      .eq('id', pageId)
      .single();

    if (pageError || !page || (page.projects as any).user_id !== userId) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Update the page with corrected text
    const { data: updatedPage, error: updateError } = await supabase
      .from('pages')
      .update({ edited_text: correctedText })
      .eq('id', pageId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating page text:', updateError);
      return res.status(500).json({ error: 'Failed to update page text' });
    }

    res.json(updatedPage);
  } catch (error) {
    console.error('Error in applyCorrection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available text enhancement providers
export const getProviders = async (req: Request, res: Response) => {
  try {
    const providers = textEnhancementService.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ error: 'Failed to get providers' });
  }
};
