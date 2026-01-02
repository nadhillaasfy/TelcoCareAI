/**
 * Google Gemini Client
 *
 * Client for calling Gemini API with judge + response in single call
 * Uses structured output with Zod schemas following @google/genai cookbook
 */

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { logger } from './logger';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { MLPrediction } from '@/types/ml-service';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_TEMPERATURE = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7');

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

// Initialize GoogleGenAI client
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

/**
 * Zod schema for LLM judgment response
 * Following Gemini cookbook pattern with specific types and enums
 * This will be converted to JSON Schema using zodToJsonSchema()
 */
const llmJudgmentSchema = z.object({
  ml_valid: z.boolean().describe(
    "Whether the ML prediction is valid and makes sense given the ticket content"
  ),
  ml_confidence_assessment: z.enum(["high", "medium", "low"]).describe(
    "Assessment of the ML model's confidence level: high (>0.85), medium (0.60-0.85), or low (<0.60)"
  ),
  reasoning: z.string().describe(
    "Brief explanation of why the ML prediction is valid or invalid (1-2 sentences)"
  ),
  customer_response: z.string().describe(
    "Generated response text for the customer that addresses their issue (2-4 sentences)"
  ),
  recommended_action: z.enum(["escalate", "standard", "automated"]).describe(
    "Recommended action: escalate for high urgency, standard for medium, automated for low"
  ),
  tone: z.enum(["empathetic", "professional", "urgent", "friendly"]).describe(
    "Tone of the customer response based on urgency: empathetic/urgent for high, professional for medium, friendly for low"
  ),
});

// Export the type inferred from schema
export type LLMJudgmentResponse = z.infer<typeof llmJudgmentSchema>;

/**
 * System instruction that does BOTH judge AND response in one call
 *
 * This is the key innovation - single prompt for dual tasks
 */
const SYSTEM_INSTRUCTION = `You are an AI assistant for TelcoCare, a telecommunications company.

Your task is to:
1. Evaluate ML predictions for customer support tickets
2. Generate appropriate customer responses

You will receive:
- Customer ticket text
- ML prediction: cluster, urgency, priority, confidence

EVALUATION CRITERIA:
- High confidence (>0.85): Usually valid, but check if prediction matches ticket sentiment
- Medium confidence (0.60-0.85): Validate carefully, look for context clues
- Low confidence (<0.60): Likely invalid, rely on ticket text only

URGENCY MAPPING (for reference):
- Cluster 3: High urgency (service outages, complete failures)
- Cluster 2: Medium urgency (follow-ups, data submissions)
- Clusters 0, 1: Low urgency (thanks, questions, general inquiries)

RESPONSE GUIDELINES:
- If ML valid: Use urgency/priority context to tailor response tone
- If ML invalid: Ignore ML, respond based solely on ticket content
- High urgency: Empathetic, urgent tone; indicate immediate escalation
- Medium urgency: Professional, solution-focused
- Low urgency: Friendly, informative

Always respond with structured JSON matching the provided schema.`;

/**
 * Build complete prompt with system instruction and user input
 */
const buildPrompt = (ticketText: string, mlPrediction: MLPrediction): string => {
  return `${SYSTEM_INSTRUCTION}

CUSTOMER TICKET:
"${ticketText}"

ML PREDICTION:
- Cluster: ${mlPrediction.cluster}
- Urgency: ${mlPrediction.urgency}
- Priority: ${mlPrediction.priority}
- Confidence: ${(mlPrediction.confidence * 100).toFixed(1)}%
- Auto-escalate: ${mlPrediction.auto_escalate}

Evaluate this prediction and generate a customer response.`;
};

export class GeminiClient {
  async judgeAndRespond(
    ticketText: string,
    mlPrediction: MLPrediction,
    ticketId?: string
  ): Promise<{ judgment: LLMJudgmentResponse; processingTimeMs: number }> {
    const startTime = Date.now();

    try {
      logger.info('Calling Gemini', {
        ticket_id: ticketId,
        model: GEMINI_MODEL,
      });

      const prompt = buildPrompt(ticketText, mlPrediction);

      // Convert Zod schema to JSON Schema
      const jsonSchema = zodToJsonSchema(llmJudgmentSchema as any);

      // Debug logging
      logger.info('Generated JSON Schema', {
        ticket_id: ticketId,
        schema: JSON.stringify(jsonSchema, null, 2)
      });

      // Generate content with structured output following cookbook pattern
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: GEMINI_TEMPERATURE,
          responseMimeType: "application/json",
          // Type assertion needed due to Zod v4 compatibility with zod-to-json-schema
          responseJsonSchema: jsonSchema,
        },
      });

      const processingTimeMs = Date.now() - startTime;

      const responseText = response.text;

      // Debug logging
      logger.info('Gemini raw response', {
        ticket_id: ticketId,
        response_text: responseText,
        response_type: typeof responseText
      });

      if (!responseText) {
        throw new Error('No content in Gemini response');
      }

      // Parse and validate response with Zod schema
      const parsedResponse = JSON.parse(responseText);

      // Debug logging
      logger.info('Parsed JSON', {
        ticket_id: ticketId,
        parsed: parsedResponse
      });

      const judgment = llmJudgmentSchema.parse(parsedResponse);

      logger.info('Gemini response received', {
        ticket_id: ticketId,
        ml_valid: judgment.ml_valid,
        recommended_action: judgment.recommended_action,
        elapsed_ms: processingTimeMs,
      });

      return { judgment, processingTimeMs };

    } catch (error) {
      logger.error('Gemini request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        elapsed_ms: Date.now() - startTime,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();
