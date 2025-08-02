-- Migration: Add hashed_password column to users table
-- Run this in your Supabase SQL Editor

-- Add hashed_password column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);

-- Add index for email/password lookups
CREATE INDEX IF NOT EXISTS idx_users_email_password ON users(email) WHERE hashed_password IS NOT NULL;

-- Update existing users to have a default hashed_password (for GitHub users)
-- This ensures the column exists but allows NULL for GitHub OAuth users
COMMENT ON COLUMN users.hashed_password IS 'Hashed password for email/password authentication. NULL for GitHub OAuth users.'; 