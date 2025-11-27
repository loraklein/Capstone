// Text Enhancement Service - AI-powered text correction and improvement

export interface TextCorrection {
  original: string;
  corrected: string;
  changes: Array<{
    type: 'spelling' | 'grammar' | 'ocr' | 'formatting';
    original: string;
    corrected: string;
    position: number;
    reason?: string;
  }>;
}

export interface TextEnhancementProvider {
  name: string;

  // Correct OCR errors, spelling, grammar
  correctText(text: string): Promise<TextCorrection>;
}

// Ollama Provider for Text Enhancement
export class OllamaTextEnhancementProvider implements TextEnhancementProvider {
  name = 'ollama';
  private host: string;
  private model: string;

  constructor(
    host: string = process.env.OLLAMA_HOST || 'http://localhost:11434',
    model: string = process.env.OLLAMA_CORRECTION_MODEL || 'llama3.1:8b'
  ) {
    this.host = host;
    this.model = model;
  }

  async correctText(text: string): Promise<TextCorrection> {
    if (!text || text.trim().length === 0) {
      return {
        original: text,
        corrected: text,
        changes: [],
      };
    }

    try {
      const prompt = `You are a text correction assistant. Your task is to fix OCR errors, spelling mistakes, and grammar issues in the following text. The text may come from handwritten documents or scanned pages.

Rules:
1. Fix obvious OCR errors (e.g., "tbe" -> "the", "wben" -> "when")
2. Correct spelling mistakes
3. Fix basic grammar errors
4. Preserve the original meaning and style
5. Do NOT change dates, names, or numbers unless clearly wrong
6. Do NOT add or remove content
7. Return ONLY the corrected text, nothing else

Text to correct:
${text}

Corrected text:`;

      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3, // Lower temperature for more conservative corrections
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const result = await response.json();
      let correctedText = result.response?.trim() || text;

      // Remove <think>...</think> tags from reasoning models like DeepSeek-R1
      // Use global flag to remove all occurrences
      while (correctedText.includes('<think>')) {
        correctedText = correctedText.replace(/<think>[\s\S]*?<\/think>/i, '');
      }
      correctedText = correctedText.trim();

      // For now, return simple correction
      // In the future, we could add change tracking
      return {
        original: text,
        corrected: correctedText,
        changes: [], // TODO: Implement change tracking
      };
    } catch (error) {
      console.error('Ollama text correction error:', error);
      throw new Error(`Failed to correct text with Ollama: ${error}`);
    }
  }
}

// Gemini Provider (placeholder for future)
export class GeminiTextEnhancementProvider implements TextEnhancementProvider {
  name = 'gemini';
  private apiKey: string;
  private model: string;

  constructor(
    apiKey?: string,
    model: string = 'gemini-1.5-flash'
  ) {
    this.apiKey = apiKey || process.env.GOOGLE_AI_API_KEY || '';
    this.model = model;

    if (!this.apiKey) {
      console.warn('⚠️  Google AI API key not found for Gemini text enhancement');
    }
  }

  async correctText(text: string): Promise<TextCorrection> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // TODO: Implement Gemini text correction
    // This will be similar to Ollama but using Gemini API
    throw new Error('Gemini text correction not yet implemented');
  }
}

// Text Enhancement Service Manager
export class TextEnhancementService {
  private providers: Map<string, TextEnhancementProvider> = new Map();
  private defaultProvider: string;

  constructor() {
    // Register providers
    this.providers.set('ollama', new OllamaTextEnhancementProvider());
    this.providers.set('gemini', new GeminiTextEnhancementProvider());

    // Default to Ollama for development, can switch via env var
    this.defaultProvider = process.env.TEXT_ENHANCEMENT_PROVIDER || 'ollama';

    console.log(`✅ Text Enhancement Service initialized with provider: ${this.defaultProvider}`);
  }

  async correctPageText(text: string, provider?: string): Promise<TextCorrection> {
    const selectedProvider = provider || this.defaultProvider;
    const enhancementProvider = this.providers.get(selectedProvider);

    if (!enhancementProvider) {
      throw new Error(`Text enhancement provider '${selectedProvider}' not found`);
    }

    return await enhancementProvider.correctText(text);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Export singleton instance
export const textEnhancementService = new TextEnhancementService();
