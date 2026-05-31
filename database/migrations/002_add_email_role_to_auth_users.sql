-- ========================================
-- Migration: Add email and role columns to auth_users
-- ========================================
-- Description: Add missing email and role columns for user management
-- Created: 2026-05-31
-- Database: PostgreSQL (Supabase)
-- ========================================

-- Add email column (nullable for now, we'll update existing records)
ALTER TABLE public.auth_users 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add role column with default 'admin'
ALTER TABLE public.auth_users 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin';

-- ========================================
-- Update existing records
-- ========================================

-- Set default emails for existing users (username@nebulist.local)
UPDATE public.auth_users 
SET email = username || '@nebulist.local'
WHERE email IS NULL;

-- ========================================
-- Add constraints after data migration
-- ========================================

-- Make email NOT NULL after setting default values
ALTER TABLE public.auth_users 
ALTER COLUMN email SET NOT NULL;

-- Add unique constraint on email
ALTER TABLE public.auth_users 
ADD CONSTRAINT auth_users_email_unique UNIQUE (email);

-- Add check constraint for email format (basic validation)
ALTER TABLE public.auth_users 
ADD CONSTRAINT auth_users_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add check constraint for role values
ALTER TABLE public.auth_users 
ADD CONSTRAINT auth_users_role_check 
CHECK (role IN ('admin', 'manager', 'staff', 'acquisition', 'operations', 'creative'));

-- ========================================
-- Create index on email
-- ========================================

CREATE INDEX IF NOT EXISTS idx_auth_users_email 
ON public.auth_users(email);

-- ========================================
-- Update comments
-- ========================================

COMMENT ON COLUMN public.auth_users.email IS 'User email address (unique)';
COMMENT ON COLUMN public.auth_users.role IS 'User role: admin, manager, staff, acquisition, operations, creative';

-- ========================================
-- Verification Query
-- ========================================

-- Verify columns added
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'auth_users'
-- ORDER BY ordinal_position;

-- ========================================
-- Migration Complete
-- ========================================
