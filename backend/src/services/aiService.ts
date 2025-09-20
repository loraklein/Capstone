import { supabase } from '../config/database';
import { storageService } from './storageService';

// AI Provider Interface - makes it easy to switch providers
export interface AIProvider {
  name: string;
  extractText(imageUrl: string): Promise<AIResult>;
}

export interface AIResult {
  text: string;
  confidence: number;
  provider: string;
  processingTime?: number;
}

// Ollama Provider Implementation - Updated to match your setup
export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private host: string;
  private model: string;

  constructor(host: string = 'http://golem:11434', model: string = 'llava:latest') {
    this.host = host;
    this.model = model;
  }

  async extractText(imageUrl: string): Promise<AIResult> {
    const startTime = Date.now();
    
    try {
      // Convert image URL to base64
      const imageBase64 = await this.convertImageToBase64(imageUrl);
      
      // Debug: Log what we're sending to Ollama
      console.log('Sending to Ollama:', {
        host: this.host,
        model: this.model,
        imageBase64Length: imageBase64.length,
        imageBase64Preview: imageBase64.substring(0, 50) + '...'
      });

      // Try the chat API endpoint which is better for vision models
      const response = await fetch(`${this.host}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: 'please transcribe the text in this image from handwritten cursive to digital text. Please respond in JSON only--no formatting: { "text": "" }',
              images: [imageBase64]
            }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      // Parse the response text to extract JSON if needed
      let extractedText = result.message?.content || result.response || '';
      
      // Try to parse JSON response
      try {
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          extractedText = jsonResponse.text || extractedText;
        }
      } catch (parseError) {
        // If JSON parsing fails, use the raw response
        console.log('Could not parse JSON response, using raw text:', parseError);
      }

      return {
        text: extractedText,
        confidence: 0.85, // Ollama doesn't provide confidence scores, so we estimate
        provider: this.name,
        processingTime
      };
    } catch (error) {
      console.error('Ollama text extraction error:', error);
      throw new Error(`Failed to extract text with Ollama: ${error}`);
    }
  }

  private async convertImageToBase64(imageUrl: string): Promise<string> {
    try {
      // Use the storage service to get image buffer
      const imageBuffer = await storageService.getImageBuffer(imageUrl);
      return imageBuffer.toString('base64');
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }
}

// Google Vision Provider (placeholder for future implementation)
export class GoogleVisionProvider implements AIProvider {
  name = 'google_vision';

  async extractText(imageUrl: string): Promise<AIResult> {
    // TODO: Implement Google Vision API integration
    throw new Error('Google Vision provider not implemented yet');
  }
}

// AI Service Manager
export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider: string;

  constructor() {
    // Register providers with your actual configuration
    const ollamaHost = process.env.OLLAMA_HOST || 'http://golem:11434';
    const ollamaModel = 'llava:latest'; // Force use of vision model
    
    this.providers.set('ollama', new OllamaProvider(ollamaHost, ollamaModel));
    this.providers.set('google_vision', new GoogleVisionProvider());
    
    // Set default provider
    this.defaultProvider = process.env.AI_PROVIDER || 'ollama';
  }

  async extractTextFromImage(imageUrl: string, provider?: string): Promise<AIResult> {
    const selectedProvider = provider || this.defaultProvider;
    const aiProvider = this.providers.get(selectedProvider);
    
    if (!aiProvider) {
      throw new Error(`AI provider '${selectedProvider}' not found`);
    }

    return await aiProvider.extractText(imageUrl);
  }

  async processPage(pageId: string, imageUrl: string, provider?: string): Promise<void> {
    try {
      // Update page status to processing
      await supabase
        .from('pages')
        .update({ 
          processing_status: 'processing',
          ai_provider: provider || this.defaultProvider
        })
        .eq('id', pageId);

      // Extract text using AI
      const result = await this.extractTextFromImage(imageUrl, provider);

      // Update page with extracted text
      await supabase
        .from('pages')
        .update({
          extracted_text: result.text,
          ai_confidence: result.confidence,
          ai_processed_at: new Date().toISOString(),
          processing_status: 'completed'
        })
        .eq('id', pageId);

      console.log(`Successfully processed page ${pageId} with ${result.provider}`);
    } catch (error) {
      console.error(`Error processing page ${pageId}:`, error);
      
      // Update page status to failed
      await supabase
        .from('pages')
        .update({ 
          processing_status: 'failed'
        })
        .eq('id', pageId);
      
      throw error;
    }
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Export singleton instance
export const aiService = new AIService();
