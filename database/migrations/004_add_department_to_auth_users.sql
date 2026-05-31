-- ========================================
-- Migration: Add department column to auth_users
-- ========================================
-- Description: Add department field for user organization
-- Created: 2026-05-31
-- Database: PostgreSQL (Supabase)
-- ========================================

-- Add department column (nullable)
ALTER TABLE public.auth_users 
ADD COLUMN IF NOT EXISTS department TEXT;

-- ========================================
-- Update existing records with default values
-- ========================================

-- Set default department based on role
UPDATE public.auth_users 
SET department = CASE 
    WHEN role = 'admin' THEN 'Management'
    WHEN role = 'acquisition' THEN 'Sales & Acquisition'
    WHEN role = 'operations' THEN 'Operations & Logistics'
    WHEN role = 'creative' THEN 'Creative & Design'
    ELSE 'General'
END
WHERE department IS NULL;

-- ========================================
-- Add index on department
-- ========================================

CREATE INDEX IF NOT EXISTS idx_auth_users_department 
ON public.auth_users(department);

-- ========================================
-- Update comments
-- ========================================

COMMENT ON COLUMN public.auth_users.department IS 'User department/team (e.g., Management, Sales & Acquisition, Operations & Logistics)';

-- ========================================
-- Verification Query
-- ========================================

-- Verify column added
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'auth_users' AND column_name = 'department';

-- ========================================
-- Migration Complete
-- ========================================
