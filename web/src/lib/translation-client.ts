/**
 * Translation Client
 *
 * Translates Indonesian text to English for ML model input
 * Uses Gemini for fast, reliable translation
 */

import { GoogleGenAI } from '@google/genai';
import { logger } from './logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

class TranslationClient {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
  }

  /**
   * Translate Indonesian text to English using Gemini
   */
  async translateToEnglish(
    text: string,
    ticketId?: string
  ): Promise<{ translatedText: string; processingTimeMs: number }> {
    const startTime = Date.now();

    try {
      logger.info('Translating text to English', {
        ticket_id: ticketId,
        service: 'gemini',
        input_length: text.length,
      });

      const prompt = `Translate the following Indonesian text to English. Return ONLY the English translation, no explanations or additional text.

Indonesian text: ${text}

English translation:`;

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.3, // Low temperature for accurate translation
        }
      });

      if (!result.text) {
        throw new Error('Gemini returned empty response');
      }

      const translatedText = result.text.trim();
      const processingTimeMs = Date.now() - startTime;

      logger.info('Translation completed', {
        ticket_id: ticketId,
        service: 'gemini',
        output_length: translatedText.length,
        elapsed_ms: processingTimeMs,
      });

      return { translatedText, processingTimeMs };
    } catch (error) {
      const elapsedMs = Date.now() - startTime;

      logger.error('Translation failed', {
        ticket_id: ticketId,
        service: 'gemini',
        error: error instanceof Error ? error.message : 'Unknown error',
        elapsed_ms: elapsedMs,
      });

      throw new Error(
        `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Export singleton instance
export const translationClient = new TranslationClient();
