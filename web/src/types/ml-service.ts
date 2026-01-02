/**
 * ML Microservice Type Definitions
 *
 * Types matching the Python FastAPI microservice schemas
 */

// ML Prediction Request
export interface MLPredictRequest {
  text: string;
  ticket_id?: string;
}

// ML Prediction Output (matches Python PredictionOutput)
export interface MLPrediction {
  cluster: number;          // 0-3
  urgency: string;          // "Low", "Medium", "High"
  priority: string;         // "P1", "P2", "P3"
  confidence: number;       // 0.0-1.0
  auto_escalate: boolean;
  probabilities?: number[]; // Optional array of 4 probabilities
}

// ML Service Response (matches Python PredictResponse)
export interface MLPredictResponse {
  ticket_id?: string;
  input_text: string;
  cleaned_text: string;
  prediction: MLPrediction;
  timestamp: string;        // ISO datetime
  model_version: string;
  processing_time_ms?: number;
}

// ML Service Error Response
export interface MLServiceError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}
