/*
  # Add attorneys management

  1. New Tables
    - `attorneys`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `title` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `is_active` (boolean)

  2. Changes
    - Add attorney_id to cases table
    - Add attorney_id to time_logs table
*/

-- Create attorneys table
CREATE TABLE IF NOT EXISTS attorneys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text,
    title text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true
);

-- Add attorney_id to cases
ALTER TABLE cases ADD COLUMN attorney_id uuid REFERENCES attorneys(id) ON DELETE SET NULL;

-- Add attorney_id to time_logs
ALTER TABLE time_logs ADD COLUMN attorney_id uuid REFERENCES attorneys(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE attorneys ENABLE ROW LEVEL SECURITY;

-- Create policies for attorneys
CREATE POLICY "Enable read access for all users" ON attorneys
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON attorneys
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON attorneys
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON attorneys
    FOR DELETE USING (true);

-- Create trigger for updating attorneys.updated_at
CREATE TRIGGER update_attorneys_updated_at
    BEFORE UPDATE ON attorneys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();