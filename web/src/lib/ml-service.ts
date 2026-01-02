/**
 * ML Microservice Client
 *
 * Client for calling the Python FastAPI ML inference service
 */

import { logger } from './logger';
import type { MLPredictRequest, MLPredictResponse, MLServiceError } from '@/types/ml-service';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT_MS || '5000', 10);

export class MLServiceClient {
  async predict(request: MLPredictRequest): Promise<MLPredictResponse> {
    const startTime = Date.now();

    try {
      logger.info('Calling ML service', { ticket_id: request.ticket_id });

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ML_SERVICE_TIMEOUT);

      const response = await fetch(`${ML_SERVICE_URL}/api/v1/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: MLServiceError = await response.json();
        throw new Error(`ML service error: ${errorData.message}`);
      }

      const data: MLPredictResponse = await response.json();

      logger.info('ML service response received', {
        ticket_id: data.ticket_id,
        cluster: data.prediction.cluster,
        confidence: data.prediction.confidence,
        elapsed_ms: Date.now() - startTime,
      });

      return data;

    } catch (error) {
      logger.error('ML service request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        elapsed_ms: Date.now() - startTime,
      });

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('ML service timeout');
      }

      throw error;
    }
  }
}

// Export singleton instance
export const mlServiceClient = new MLServiceClient();
