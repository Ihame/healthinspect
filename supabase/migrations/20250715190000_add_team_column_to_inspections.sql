-- Add a 'team' column to store inspection team members as JSON
ALTER TABLE inspections
ADD COLUMN team jsonb; 