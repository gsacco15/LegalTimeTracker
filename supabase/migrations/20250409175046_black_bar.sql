/*
  # Add status and activity type fields

  1. Changes
    - Add status field to cases table
    - Add activity_type field to time_logs table
    - Add notes field to time_logs table

  2. Enums
    - Create case_status enum type
    - Create activity_type enum type
*/

-- Create enums for status and activity type
CREATE TYPE case_status AS ENUM ('Active', 'Closed', 'Pending');
CREATE TYPE activity_type AS ENUM ('Consultation', 'Research', 'Court Time', 'Drafting', 'Administrative', 'Other');

-- Add status column to cases table
ALTER TABLE cases 
ADD COLUMN status case_status NOT NULL DEFAULT 'Active';

-- Add activity_type and notes to time_logs table
ALTER TABLE time_logs 
ADD COLUMN activity_type activity_type NOT NULL DEFAULT 'Other',
ADD COLUMN notes text;