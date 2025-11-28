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

export type ProjectType = 'recipes' | 'journal' | 'letters' | 'other';

export interface TextEnhancementProvider {
  name: string;

  // Correct OCR errors, spelling, grammar
  correctText(text: string, projectType?: ProjectType): Promise<TextCorrection>;
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

  private getPromptForProjectType(text: string, projectType: ProjectType = 'other'): string {
    const baseRules = `Rules:
1. Fix obvious OCR errors (e.g., "tbe" -> "the", "wben" -> "when")
2. Correct spelling mistakes
3. Fix basic grammar errors
4. Preserve the original meaning and style
5. Do NOT change dates, names, or numbers unless clearly wrong
6. Return ONLY the corrected text, nothing else`;

    switch (projectType) {
      case 'recipes':
        return `You are a text correction assistant specialized in recipe documents. Your task is to fix OCR errors, spelling mistakes, and grammar issues while formatting the text as a structured recipe.

${baseRules}
7. Format the recipe naturally with these sections:
   - Recipe name on the first line (plain text, no special characters)
   - Blank line
   - "Ingredients:" on its own line
   - Each ingredient on a new line starting with "- " (dash and space)
   - Blank line
   - "Directions:" on its own line
   - Each step numbered (1., 2., 3., etc.) on separate lines
8. Maintain consistent formatting for measurements (e.g., "1 cup", "2 tbsp")
9. Capitalize recipe names appropriately
10. Use natural, readable formatting without markdown symbols (#, ##, etc.)

Example format:
Chocolate Chip Cookies

Ingredients:
- 2 cups flour
- 1 cup sugar
- 2 eggs

Directions:
1. Preheat oven to 350°F.
2. Mix dry ingredients together.
3. Bake for 12 minutes.

Text to correct:
${text}

Corrected and formatted recipe:`;

      case 'journal':
        return `You are a text correction assistant specialized in personal journal entries. Your task is to fix OCR errors, spelling mistakes, and grammar issues while preserving the personal and authentic voice of the writer.

${baseRules}
7. Format dates at the beginning of entries naturally (e.g., "January 15, 2024" or "Monday, 1/15/24")
8. Use blank lines to separate different entries or major thought transitions
9. Preserve the personal, conversational tone and style
10. Keep emotional expressions and personal reflections intact
11. Maintain first-person perspective and informal language
12. Do NOT make the writing overly formal or change the author's voice
13. Use natural paragraph breaks (blank lines) for readability

Example format:
January 15, 2024

Today was a good day. I woke up early and went for a walk in the park. The weather was perfect.

I've been thinking a lot about my goals for this year. I want to focus on being more present and grateful for the little things.

Text to correct:
${text}

Corrected journal entry:`;

      case 'letters':
        return `You are a text correction assistant specialized in letter documents. Your task is to fix OCR errors, spelling mistakes, and grammar issues while preserving the authentic formatting and style of correspondence.

${baseRules}
7. Preserve traditional letter formatting: date/address (if present), salutation, body paragraphs, closing, and signature
8. Maintain the formal or informal tone as originally written
9. Keep dates and addresses in their original format
10. Use blank lines to separate major sections (header, body paragraphs, closing)
11. Maintain authentic punctuation in salutations (e.g., "Dear John," or "Dear Sir:")
12. Keep closings intact (e.g., "Sincerely,", "Love,", "Best regards,")
13. Use natural paragraph breaks for readability

Example format:
December 5, 1985

Dear Mom and Dad,

I hope this letter finds you well. I wanted to tell you about my new job at the library.

Everything is going great here. The weather has been lovely.

Love,
Sarah

Text to correct:
${text}

Corrected letter:`;

      case 'other':
      default:
        return `You are a text correction assistant. Your task is to fix OCR errors, spelling mistakes, and grammar issues in the following text. The text may come from handwritten documents or scanned pages.

${baseRules}
7. Do NOT add or remove content
8. Preserve the original document structure

Text to correct:
${text}

Corrected text:`;
    }
  }

  async correctText(text: string, projectType: ProjectType = 'other'): Promise<TextCorrection> {
    if (!text || text.trim().length === 0) {
      return {
        original: text,
        corrected: text,
        changes: [],
      };
    }

    try {
      const prompt = this.getPromptForProjectType(text, projectType);

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

  async correctText(text: string, projectType: ProjectType = 'other'): Promise<TextCorrection> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // TODO: Implement Gemini text correction with project type support
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

  async correctPageText(text: string, provider?: string, projectType?: ProjectType): Promise<TextCorrection> {
    const selectedProvider = provider || this.defaultProvider;
    const enhancementProvider = this.providers.get(selectedProvider);

    if (!enhancementProvider) {
      throw new Error(`Text enhancement provider '${selectedProvider}' not found`);
    }

    return await enhancementProvider.correctText(text, projectType);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Export singleton instance
export const textEnhancementService = new TextEnhancementService();
