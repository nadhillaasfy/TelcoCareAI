-- Add issue_category column to ticket_results table
-- This field categorizes customer tickets into telco business categories

ALTER TABLE ticket_results
ADD COLUMN llm_issue_category TEXT CHECK (
  llm_issue_category IN (
    'Billing & Payment',
    'Network & Connectivity',
    'Technical Support',
    'Account & Service Management',
    'General Inquiry & Feedback'
  )
);

-- Add index for category-based queries
CREATE INDEX idx_ticket_results_issue_category ON ticket_results(llm_issue_category);

-- Add comment for documentation
COMMENT ON COLUMN ticket_results.llm_issue_category IS
'LLM-generated category for the ticket, limited to 5 telco business areas';
