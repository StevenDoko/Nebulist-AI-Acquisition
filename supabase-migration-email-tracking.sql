-- Migration: Add Email Tracking to Leads Table
-- Description: Adds email tracking fields to support email campaign monitoring
-- Based on: Playtour 2026 CRM.xlsx structure

-- Add email tracking columns
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'not_sent',
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_responded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_bounced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS target_group TEXT;

-- Add check constraint for email_status
ALTER TABLE leads
DROP CONSTRAINT IF EXISTS leads_email_status_check;

ALTER TABLE leads
ADD CONSTRAINT leads_email_status_check 
CHECK (email_status IN ('not_sent', 'email_sent', 'email_opened', 'responded', 'bounced'));

-- Create index for email status queries
CREATE INDEX IF NOT EXISTS idx_leads_email_status ON leads(email_status);
CREATE INDEX IF NOT EXISTS idx_leads_email_sent_at ON leads(email_sent_at);

-- Add comment to explain the email tracking flow
COMMENT ON COLUMN leads.email_status IS 'Email tracking status: not_sent -> email_sent -> email_opened -> responded (or bounced at any stage)';
COMMENT ON COLUMN leads.email_sent_at IS 'Timestamp when email was sent to this lead';
COMMENT ON COLUMN leads.email_opened_at IS 'Timestamp when lead opened the email';
COMMENT ON COLUMN leads.email_responded_at IS 'Timestamp when lead responded to the email';
COMMENT ON COLUMN leads.email_bounced_at IS 'Timestamp when email bounced';
COMMENT ON COLUMN leads.target_group IS 'Target group/category (Doelgroep) from Excel CRM';

-- Update existing leads to have default email_status
UPDATE leads 
SET email_status = 'not_sent' 
WHERE email_status IS NULL;
