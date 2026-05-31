-- ========================================
-- Migration: Create auth_users table
-- ========================================
-- Description: Authentication users table for Nebulist platform
-- Created: 2026-05-31
-- Database: PostgreSQL (Supabase)
-- ========================================

-- Create auth_users table
CREATE TABLE IF NOT EXISTS public.auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ========================================
-- Constraints
-- ========================================

-- Unique constraint on username
ALTER TABLE public.auth_users 
ADD CONSTRAINT auth_users_username_unique UNIQUE (username);

-- Check constraint for username format (alphanumeric and @.-_ allowed)
ALTER TABLE public.auth_users 
ADD CONSTRAINT auth_users_username_format 
CHECK (username ~ '^[a-zA-Z0-9@._-]+$');

-- Check constraint for username length
ALTER TABLE public.auth_users 
ADD CONSTRAINT auth_users_username_length 
CHECK (char_length(username) >= 3 AND char_length(username) <= 50);

-- ========================================
-- Indexes
-- ========================================

-- Index on username for fast login lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_username 
ON public.auth_users(username);

-- Index on is_active for filtering active users
CREATE INDEX IF NOT EXISTS idx_auth_users_is_active 
ON public.auth_users(is_active);

-- Index on created_at for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_auth_users_created_at 
ON public.auth_users(created_at DESC);

-- Composite index for active user lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_active_username 
ON public.auth_users(is_active, username) 
WHERE is_active = TRUE;

-- ========================================
-- Trigger: Auto-update updated_at
-- ========================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth_users
CREATE TRIGGER update_auth_users_updated_at
    BEFORE UPDATE ON public.auth_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- Row Level Security (RLS)
-- ========================================

-- Enable RLS on auth_users table
ALTER TABLE public.auth_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role has full access to auth_users"
ON public.auth_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users can read all active users
CREATE POLICY "Authenticated users can view active users"
ON public.auth_users
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Users can update their own record
CREATE POLICY "Users can update their own record"
ON public.auth_users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ========================================
-- Comments (Documentation)
-- ========================================

COMMENT ON TABLE public.auth_users IS 'Authentication users table for Nebulist platform';
COMMENT ON COLUMN public.auth_users.id IS 'Primary key, UUID v4';
COMMENT ON COLUMN public.auth_users.username IS 'Unique username for login (3-50 chars, alphanumeric + @.-_)';
COMMENT ON COLUMN public.auth_users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN public.auth_users.full_name IS 'User full name/display name';
COMMENT ON COLUMN public.auth_users.is_active IS 'Account active status (soft delete)';
COMMENT ON COLUMN public.auth_users.last_login IS 'Last successful login timestamp';
COMMENT ON COLUMN public.auth_users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN public.auth_users.updated_at IS 'Last update timestamp (auto-updated)';

-- ========================================
-- Grant Permissions
-- ========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant table permissions
GRANT SELECT ON public.auth_users TO authenticated;
GRANT ALL ON public.auth_users TO service_role;

-- ========================================
-- Verification Queries
-- ========================================

-- Verify table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'auth_users'
-- ORDER BY ordinal_position;

-- Verify indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'auth_users' AND schemaname = 'public';

-- Verify constraints
-- SELECT conname, contype, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.auth_users'::regclass;

-- ========================================
-- Migration Complete
-- ========================================
