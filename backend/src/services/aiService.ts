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
  annotations?: any; // Detailed word/line data with bounding boxes
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
                     content: 'Your task is to transcribe text from this image. Do NOT describe the image or objects in it. Only transcribe the actual text content you can read. Look for any handwritten notes, typed text, printed text, or other written content. If you cannot read any text clearly, respond with "No readable text found". If you can read some text, transcribe it exactly as written. Use "[unclear]" only for individual words you cannot make out. Do not add descriptions, interpretations, or analysis. Only provide the text content. Respond in JSON format: { "text": "transcribed text here" }',
                     images: [imageBase64]
                   }
                 ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const result = await response.json() as any;
      const processingTime = Date.now() - startTime;

      // Parse the response text to extract JSON if needed
      let extractedText = result.message?.content || result.response || '';

      // Try to parse JSON response
      try {
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let jsonText = jsonMatch[0];
          
          // Try to fix common JSON issues
          // Fix missing comma between quoted strings
          jsonText = jsonText.replace(/"\s*"\s*([^,}])/g, '", "$1');
          
          const jsonResponse = JSON.parse(jsonText);
          extractedText = jsonResponse.text || extractedText;
        }
      } catch (parseError) {
        // Try to extract text content manually if JSON parsing fails
        const textMatch = extractedText.match(/"text":\s*"([^"]*(?:\\.[^"]*)*)"/);
        if (textMatch) {
          extractedText = textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
      }

      // Check if the response is a description rather than transcription
      const isDescription = extractedText.toLowerCase().includes('the image shows') || 
                           extractedText.toLowerCase().includes('the image contains') ||
                           extractedText.toLowerCase().includes('in the image') ||
                           extractedText.toLowerCase().includes('this image') ||
                           extractedText.toLowerCase().includes('overall, the image');

      if (isDescription) {
        
        // Try a more direct approach
        try {
          const alternativeResponse = await fetch(`${this.host}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: this.model,
              messages: [
                {
                  role: 'user',
                  content: 'Read the text in this image and type it out exactly. Only output the text content, nothing else.',
                  images: [imageBase64]
                }
              ],
              stream: false
            })
          });

          if (alternativeResponse.ok) {
            const altResult = await alternativeResponse.json() as any;
            const altText = altResult.message?.content || altResult.response || '';
            
            if (altText && !altText.toLowerCase().includes('the image')) {
              extractedText = altText;
            } else {
              extractedText = 'No readable text found - AI provided image description instead of text transcription';
            }
          } else {
            extractedText = 'No readable text found - AI provided image description instead of text transcription';
          }
        } catch (altError) {
          extractedText = 'No readable text found - AI provided image description instead of text transcription';
        }
      }

      // Check final result to determine confidence
      const finalIsDescription = extractedText.toLowerCase().includes('no readable text found') || 
                                extractedText.toLowerCase().includes('ai provided image description');

      return {
        text: extractedText,
        confidence: finalIsDescription ? 0.1 : 0.85,
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
      console.log('Converting image to base64:', imageUrl);
      
      // Use the storage service to get image buffer
      const imageBuffer = await storageService.getImageBuffer(imageUrl);
      
      console.log('Image buffer details:', {
        bufferSize: imageBuffer.length,
        bufferType: typeof imageBuffer,
        firstBytes: imageBuffer.slice(0, 10)
      });
      
      const base64 = imageBuffer.toString('base64');
      console.log('Base64 conversion successful, length:', base64.length);
      
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }
}

// Google Vision API Response Types
interface GoogleVisionVertex {
  x: number;
  y: number;
}

interface GoogleVisionBoundingPoly {
  vertices: GoogleVisionVertex[];
}

interface GoogleVisionTextAnnotation {
  description: string;
  boundingPoly?: GoogleVisionBoundingPoly;
  locale?: string;
}

interface GoogleVisionResponse {
  responses: Array<{
    textAnnotations?: GoogleVisionTextAnnotation[];
    fullTextAnnotation?: any;
  }>;
}

// Google Vision Provider Implementation
export class GoogleVisionProvider implements AIProvider {
  name = 'google_vision';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_CLOUD_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  Google Cloud API key not found. Set GOOGLE_CLOUD_API_KEY environment variable.');
    }
  }

  async extractText(imageUrl: string): Promise<AIResult> {
    const startTime = Date.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('Google Cloud API key not configured');
      }

      // Convert image URL to base64
      const imageBase64 = await this.convertImageToBase64(imageUrl);
      
      console.log('Sending to Google Vision API:', {
        imageBase64Length: imageBase64.length,
        imageUrl: imageUrl
      });

      // Call Google Vision API REST endpoint
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: imageBase64
                },
                features: [
                  {
                    type: 'TEXT_DETECTION', // Detects all text including handwriting
                    maxResults: 1
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Vision API error:', errorText);
        throw new Error(`Google Vision API error: ${response.statusText}`);
      }

      const result = await response.json() as GoogleVisionResponse;
      const processingTime = Date.now() - startTime;

      // Extract text from response
      // The first annotation contains all the text, subsequent ones are individual words
      const textAnnotations = result.responses?.[0]?.textAnnotations;
      
      if (!textAnnotations || textAnnotations.length === 0) {
        return {
          text: 'No text detected in image',
          confidence: 0,
          provider: this.name,
          processingTime
        };
      }

      // First annotation contains the full text
      const extractedText = textAnnotations[0].description || '';
      
      // Google Vision provides a confidence score, but it's not always available
      // We'll estimate based on whether text was found
      const confidence = extractedText.length > 0 ? 0.95 : 0;

      // Store all annotations (skipping first one which is the full text)
      // Index 0 = full text, Index 1+ = individual words with bounding boxes
      const wordAnnotations = textAnnotations.slice(1);

      return {
        text: extractedText.trim(),
        confidence,
        provider: this.name,
        processingTime,
        annotations: wordAnnotations // Store word-level data with bounding boxes
      };
    } catch (error) {
      console.error('Google Vision text extraction error:', error);
      throw new Error(`Failed to extract text with Google Vision: ${error}`);
    }
  }

  private async convertImageToBase64(imageUrl: string): Promise<string> {
    try {
      // Use the storage service to get image buffer
      const imageBuffer = await storageService.getImageBuffer(imageUrl);
      const base64 = imageBuffer.toString('base64');
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }
}

// AI Service Manager
export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider: string;

  constructor() {
    // Register providers with your actual configuration
    const ollamaHost = process.env.OLLAMA_HOST || 'http://golem:11434';
    const ollamaModel = 'llama3.2-vision:90b'; // Best accuracy for handwritten text
    
    this.providers.set('ollama', new OllamaProvider(ollamaHost, ollamaModel));
    this.providers.set('google_vision', new GoogleVisionProvider(process.env.GOOGLE_CLOUD_API_KEY));
    
    // Set default provider - Google Vision is now default for production
    this.defaultProvider = process.env.AI_PROVIDER || 'google_vision';
    
    console.log(`✅ AI Service initialized with default provider: ${this.defaultProvider}`);
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

      // Update page with extracted text and annotations
      await supabase
        .from('pages')
        .update({
          extracted_text: result.text,
          ai_confidence: result.confidence,
          ai_processed_at: new Date().toISOString(),
          processing_status: 'completed',
          ai_annotations: result.annotations || null
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
