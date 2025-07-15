/*
  # Create users table for HealthInspect Rwanda

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `phone` (text, optional)
      - `name` (text)
      - `role` (enum: super_admin, national_admin, regional_supervisor, inspector)
      - `district` (text, optional - for regional supervisors and inspectors)
      - `created_at` (timestamp)
      - `is_active` (boolean, default true)

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
    - Add policy for admins to manage users
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('super_admin', 'national_admin', 'regional_supervisor', 'inspector');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'inspector',
  district text,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text OR role IN ('super_admin', 'national_admin'));

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('super_admin', 'national_admin')
    )
  );

-- Insert sample users
INSERT INTO users (id, email, phone, name, role, district) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@moh.gov.rw', '+250788123456', 'Dr. Jean Baptiste Uwimana', 'super_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'national@moh.gov.rw', '+250788234567', 'Dr. Marie Uwimana', 'national_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'supervisor@moh.gov.rw', '+250788345678', 'Dr. Paul Kagame', 'regional_supervisor', 'kigali'),
  ('550e8400-e29b-41d4-a716-446655440004', 'inspector@moh.gov.rw', '+250788456789', 'Jean Claude Uwimana', 'inspector', 'kigali');