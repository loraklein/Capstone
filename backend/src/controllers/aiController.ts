import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { supabase } from '../config/database';

export const processPageWithAI = async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const { provider } = req.body;
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
      .eq('id', pageId)
      .eq('projects.user_id', userId)
      .single();

    if (pageError || !page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    if (!page.photo_url) {
      return res.status(400).json({ error: 'Page has no image to process' });
    }

    // Process the page with AI
    await aiService.processPage(pageId, page.photo_url, provider);

    // Fetch the updated page
    const { data: updatedPage, error: fetchError } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated page:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch updated page' });
    }

    res.json({
      message: 'Page processed successfully',
      page: updatedPage
    });
  } catch (error) {
    console.error('Error in processPageWithAI:', error);
    res.status(500).json({ 
      error: 'Failed to process page with AI',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPageText = async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
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
      .eq('id', pageId)
      .eq('projects.user_id', userId)
      .single();

    if (pageError || !page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({
      pageId: page.id,
      extractedText: page.extracted_text,
      confidence: page.ai_confidence,
      provider: page.ai_provider,
      processedAt: page.ai_processed_at,
      status: page.processing_status
    });
  } catch (error) {
    console.error('Error in getPageText:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAvailableAIProviders = async (req: Request, res: Response) => {
  try {
    const providers = aiService.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    console.error('Error in getAvailableAIProviders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadTestImage = async (req: Request, res: Response) => {
  try {
    const { imageBase64, fileName } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Base64 image is required' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    // Upload to Supabase Storage (use test user ID)
    const { storageService } = await import('../services/storageService');
    const testUserId = '39fcd9b8-7c1b-41b1-8980-931a616ead82';
    const imageUrl = await storageService.uploadImage(imageBuffer, fileName || 'test-image.jpg', testUserId);

    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
      fileName: fileName || 'test-image.jpg'
    });
  } catch (error) {
    console.error('Error uploading test image:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const testAIProcessing = async (req: Request, res: Response) => {
  try {
    const { imageBase64, testImage } = req.body;

    let imageToProcess: string;

    if (testImage === 'simple') {
      // Use a simple test image - a 1x1 pixel base64 encoded image
      imageToProcess = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    } else if (imageBase64) {
      imageToProcess = `data:image/jpeg;base64,${imageBase64}`;
    } else {
      return res.status(400).json({ error: 'Either imageBase64 or testImage=simple is required' });
    }

    // Create a temporary AI service instance
    const { aiService } = await import('../services/aiService');
    
    // Test the AI processing directly with base64
    const result = await aiService.extractTextFromImage(imageToProcess);

    res.json({
      message: 'AI processing test successful',
      result
    });
  } catch (error) {
    console.error('Error in testAIProcessing:', error);
    res.status(500).json({ 
      error: 'Failed to test AI processing',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const batchProcessProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { provider } = req.body;
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

    // Get all pages for this project that haven't been processed
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .not('processing_status', 'eq', 'completed')
      .not('photo_url', 'is', null);

    if (pagesError) {
      console.error('Error fetching project pages:', pagesError);
      return res.status(500).json({ error: 'Failed to fetch project pages' });
    }

    if (!pages || pages.length === 0) {
      return res.json({ 
        message: 'No pages to process',
        processedCount: 0
      });
    }

    console.log(`Starting batch processing for ${pages.length} pages in project ${projectId}`);

    // Process pages in parallel (be careful with rate limits)
    const processingPromises = pages.map(async (page, index) => {
      try {
        console.log(`Processing page ${index + 1}/${pages.length}: ${page.id}`);
        await aiService.processPage(page.id, page.photo_url, provider);
        console.log(`Successfully processed page ${page.id}`);
      } catch (error) {
        console.error(`Error processing page ${page.id}:`, error);
        throw error;
      }
    });

    await Promise.all(processingPromises);

    console.log(`Batch processing completed for project ${projectId}`);

    res.json({
      message: 'Project processed successfully',
      processedCount: pages.length
    });
  } catch (error) {
    console.error('Error in batchProcessProject:', error);
    res.status(500).json({ 
      error: 'Failed to process project',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
