-- Fix RLS Policies for NextAuth.js Integration
-- Run this in Supabase SQL Editor to fix the RLS policy issues

-- Option 1: Disable RLS temporarily (Quick fix for development)
-- This allows all operations while we're using NextAuth.js

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own menus" ON menus;
DROP POLICY IF EXISTS "Users can insert their own menus" ON menus; 
DROP POLICY IF EXISTS "Users can update their own menus" ON menus;
DROP POLICY IF EXISTS "Users can delete their own menus" ON menus;

DROP POLICY IF EXISTS "Users can view their own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can insert their own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can delete their own restaurants" ON restaurants;

-- Disable RLS for development (we'll add proper policies later)
ALTER TABLE menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON menus TO authenticated, anon;
GRANT ALL ON restaurants TO authenticated, anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Note: In production, you'll want to:
-- 1. Re-enable RLS: ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
-- 2. Create proper policies that work with your NextAuth user IDs
-- 3. Restrict anon access and only allow authenticated users
