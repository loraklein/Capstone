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
        return `You are a text correction assistant specialized in recipe documents. Your task is to fix OCR errors, spelling mistakes, and grammar issues while intelligently organizing the content into a proper recipe format.

${baseRules}
7. Use natural language understanding to identify what sections are present in the text:
   - Ingredient lists (even if not labeled) should be formatted under "Ingredients:"
   - Instructions/steps (even if not labeled) should be formatted under "Directions:"
   - Recipe name should be on the first line (if present)
8. Format each section properly:
   - Each ingredient on a new line with "- " prefix
   - Number each instruction step (1., 2., 3., etc.)
   - Use blank lines to separate sections
9. Maintain consistent formatting for measurements (e.g., "1 cup", "2 tbsp")
10. Do NOT invent or add content that doesn't exist in the source text
11. If a section is clearly missing (e.g., ONLY ingredients listed with no instructions anywhere), do not make up content for the missing section
12. Use natural, readable formatting without markdown symbols (#, ##, etc.)

Example - if text has both ingredients and unlabeled instructions, format both:
Input: "2 cups flour, 1 cup sugar. Mix together. Bake 350 degrees."
Output:
Ingredients:
- 2 cups flour
- 1 cup sugar

Directions:
1. Mix together.
2. Bake at 350 degrees.

Text to correct:
${text}

Corrected and formatted recipe:`;

      case 'journal':
        return `You are a text correction assistant specialized in handwritten personal journal entries. Your task is to fix OCR errors, spelling mistakes, and formatting issues while preserving the authentic voice and content of the writer.

${baseRules}
7. Fix common OCR issues:
   - Remove random single letters or fragments (e.g., "L", "u", "ше", "JOURN")
   - Reconnect words split across line breaks (e.g., "com\ning" → "coming")
   - Fix obvious OCR mistakes (e.g., "namp" → "nap", "cuz" → "cuz" is OK in informal writing)
8. Format dialogue naturally:
   - Use quotation marks for spoken words
   - Keep the conversational, informal tone intact
9. Clean up formatting:
   - Format dates naturally (e.g., "March 12, 2002" or "Tuesday, March 12, 2002")
   - Use paragraph breaks for natural thought transitions
   - Remove excessive or awkward line breaks within sentences
10. Preserve the author's authentic voice:
   - Keep informal language (e.g., "cuz", "gonna", "wanna")
   - Maintain emotional expressions and exclamations
   - Don't make it overly formal or change the personal style
   - Keep first-person perspective
11. Do NOT add content that isn't in the original text
12. Do NOT remove meaningful content, only fix OCR errors

Example:
Input: "march 12 2002\nToday was\ngood. I\nwent to the\npark and\nL\nsaid 'wow' it\nwas\namazing"

Output:
March 12, 2002

Today was good. I went to the park and said "wow" it was amazing.

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

      const result = await response.json() as { response?: string };
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
