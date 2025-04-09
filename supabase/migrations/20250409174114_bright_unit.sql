/*
  # Initial schema setup for Legal Time Tracker

  1. New Tables
    - `cases`
      - `id` (uuid, primary key)
      - `title` (text)
      - `client_name` (text)
      - `description` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `time_logs`
      - `id` (uuid, primary key)
      - `case_id` (uuid, foreign key to cases)
      - `description` (text, optional)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for public access
    - Add triggers for updating timestamps
*/

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    client_name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create time_logs table
CREATE TABLE IF NOT EXISTS time_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
    description text,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all access to cases" ON cases;
DROP POLICY IF EXISTS "Enable all access to time_logs" ON time_logs;

-- Create new policies
CREATE POLICY "Enable all access to cases" ON cases
    FOR ALL
    TO public
    USING (true);

CREATE POLICY "Enable all access to time_logs" ON time_logs
    FOR ALL
    TO public
    USING (true);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_logs_updated_at ON time_logs;
CREATE TRIGGER update_time_logs_updated_at
    BEFORE UPDATE ON time_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();