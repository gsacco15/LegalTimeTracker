/*
  # Update RLS policies for public access

  1. Changes
    - Drop existing RLS policies
    - Create new policies allowing public access
    - Enable RLS but with public access policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own cases" ON cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON cases;
DROP POLICY IF EXISTS "Users can view own time logs" ON time_logs;
DROP POLICY IF EXISTS "Users can insert own time logs" ON time_logs;
DROP POLICY IF EXISTS "Users can update own time logs" ON time_logs;
DROP POLICY IF EXISTS "Users can delete own time logs" ON time_logs;

-- Create new public access policies for cases
CREATE POLICY "Enable read access for all users" ON cases
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON cases
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON cases
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON cases
    FOR DELETE USING (true);

-- Create new public access policies for time_logs
CREATE POLICY "Enable read access for all users" ON time_logs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON time_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON time_logs
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON time_logs
    FOR DELETE USING (true);

-- Make user_id columns nullable since we're not using auth
ALTER TABLE cases ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE time_logs ALTER COLUMN user_id DROP NOT NULL;