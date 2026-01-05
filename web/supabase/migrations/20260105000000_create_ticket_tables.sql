-- Weekly Report Feature: Database Schema
-- Creates tables for ticket results persistence and keyword extraction

-- Table 1: ticket_results
-- Main table storing all processed ticket data with ML predictions and LLM judgments
CREATE TABLE ticket_results (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request data
  ticket_id TEXT,
  ticket_text TEXT NOT NULL,
  translated_text TEXT,

  -- ML prediction results
  ml_cluster INTEGER CHECK (ml_cluster >= 0 AND ml_cluster <= 3),
  ml_urgency TEXT CHECK (ml_urgency IN ('Low', 'Medium', 'High')),
  ml_priority TEXT CHECK (ml_priority IN ('P1', 'P2', 'P3')),
  ml_confidence DECIMAL(5,4) CHECK (ml_confidence >= 0 AND ml_confidence <= 1),
  ml_auto_escalate BOOLEAN,

  -- LLM judgment results
  llm_ml_valid BOOLEAN,
  llm_confidence_assessment TEXT CHECK (llm_confidence_assessment IN ('high', 'medium', 'low')),
  llm_reasoning TEXT,
  llm_recommended_action TEXT CHECK (llm_recommended_action IN ('escalate', 'standard', 'automated')),
  llm_tone TEXT CHECK (llm_tone IN ('empathetic', 'professional', 'urgent', 'friendly')),

  -- Customer response
  customer_response TEXT,

  -- Performance metrics (milliseconds)
  translation_time_ms INTEGER,
  ml_processing_time_ms INTEGER,
  llm_processing_time_ms INTEGER,
  total_processing_time_ms INTEGER,

  -- Error handling
  error_stage TEXT CHECK (error_stage IN ('validation', 'translation', 'ml_service', 'gemini', 'processing')),
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient weekly queries
CREATE INDEX idx_ticket_results_created_at ON ticket_results(created_at DESC);
CREATE INDEX idx_ticket_results_composite ON ticket_results(created_at DESC, ml_cluster, ml_urgency, llm_ml_valid);
CREATE INDEX idx_ticket_results_ml_cluster ON ticket_results(ml_cluster);
CREATE INDEX idx_ticket_results_urgency ON ticket_results(ml_urgency);
CREATE INDEX idx_ticket_results_priority ON ticket_results(ml_priority);
CREATE INDEX idx_ticket_results_action ON ticket_results(llm_recommended_action);
CREATE INDEX idx_ticket_results_tone ON ticket_results(llm_tone);
CREATE INDEX idx_ticket_results_ticket_id ON ticket_results(ticket_id);

-- Table 2: ticket_keywords
-- Stores extracted Indonesian keywords for theme analysis
CREATE TABLE ticket_keywords (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to ticket_results
  ticket_result_id UUID NOT NULL REFERENCES ticket_results(id) ON DELETE CASCADE,

  -- Keyword data
  keyword TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient keyword queries
CREATE INDEX idx_ticket_keywords_ticket_result_id ON ticket_keywords(ticket_result_id);
CREATE INDEX idx_ticket_keywords_keyword ON ticket_keywords(keyword);
CREATE INDEX idx_ticket_keywords_created_at ON ticket_keywords(created_at DESC);
