-- ========================================
-- Rollback Migration: Drop auth_users table
-- ========================================
-- Description: Rollback script for auth_users table
-- Created: 2026-05-31
-- Database: PostgreSQL (Supabase)
-- WARNING: This will delete all data in auth_users table
-- ========================================

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can update their own record" ON public.auth_users;
DROP POLICY IF EXISTS "Authenticated users can view active users" ON public.auth_users;
DROP POLICY IF EXISTS "Service role has full access to auth_users" ON public.auth_users;

-- Drop trigger
DROP TRIGGER IF EXISTS update_auth_users_updated_at ON public.auth_users;

-- Drop function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS public.idx_auth_users_active_username;
DROP INDEX IF EXISTS public.idx_auth_users_created_at;
DROP INDEX IF EXISTS public.idx_auth_users_is_active;
DROP INDEX IF EXISTS public.idx_auth_users_username;

-- Drop table (CASCADE will drop all dependent objects)
DROP TABLE IF EXISTS public.auth_users CASCADE;

-- ========================================
-- Rollback Complete
-- ========================================
-- All auth_users related objects have been removed
