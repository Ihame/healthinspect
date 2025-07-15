/*
  # Fix Inspections Table Migration

  1. Tables
    - Create inspections table with proper UUID references
    - Ensure all foreign keys use compatible data types
  
  2. Security
    - Enable RLS on inspections table
    - Add policies for role-based access control
*/

-- First, ensure facilities table uses UUID (if it doesn't exist or has wrong type)
DO $$
BEGIN
  -- Check if facilities table exists and has correct id type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'facilities' AND table_schema = 'public'
  ) THEN
    -- Create facilities table with UUID id
    CREATE TABLE facilities (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      type text NOT NULL,
      district text NOT NULL,
      address text NOT NULL,
      phone text NOT NULL,
      email text,
      registration_number text NOT NULL,
      assigned_inspector_id uuid,
      last_inspection_date timestamptz,
      compliance_score integer,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
  ELSE
    -- Check if id column is integer and convert to UUID if needed
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'facilities' 
      AND column_name = 'id' 
      AND data_type = 'integer'
    ) THEN
      -- Drop existing table and recreate with UUID
      DROP TABLE IF EXISTS facilities CASCADE;
      
      CREATE TABLE facilities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        type text NOT NULL,
        district text NOT NULL,
        address text NOT NULL,
        phone text NOT NULL,
        email text,
        registration_number text NOT NULL,
        assigned_inspector_id uuid,
        last_inspection_date timestamptz,
        compliance_score integer,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );
      
      ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
    END IF;
  END IF;
END $$;

-- Ensure users table exists with UUID
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'users' AND table_schema = 'public'
  ) THEN
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      phone text,
      name text NOT NULL,
      role user_role NOT NULL DEFAULT 'inspector',
      district text,
      created_at timestamptz DEFAULT now(),
      is_active boolean DEFAULT true
    );
    
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create user_role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('inspector', 'national_admin', 'regional_supervisor', 'super_admin');
  END IF;
END $$;

-- Create inspection status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inspection_status') THEN
    CREATE TYPE inspection_status AS ENUM ('draft', 'submitted', 'reviewed', 'approved');
  END IF;
END $$;

-- Create inspections table with proper UUID references
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL,
  inspector_id uuid NOT NULL,
  inspector_name text NOT NULL,
  facility_name text NOT NULL,
  district text NOT NULL,
  start_date timestamptz NOT NULL DEFAULT now(),
  completed_date timestamptz,
  status inspection_status NOT NULL DEFAULT 'draft',
  total_score integer DEFAULT 0,
  max_possible_score integer DEFAULT 0,
  compliance_percentage decimal(5,2) DEFAULT 0,
  signature text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints after ensuring tables exist with correct types
DO $$
BEGIN
  -- Add facility foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'inspections_facility_id_fkey'
  ) THEN
    ALTER TABLE inspections 
    ADD CONSTRAINT inspections_facility_id_fkey 
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;
  END IF;
  
  -- Add user foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'inspections_inspector_id_fkey'
  ) THEN
    ALTER TABLE inspections 
    ADD CONSTRAINT inspections_inspector_id_fkey 
    FOREIGN KEY (inspector_id) REFERENCES users(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Inspectors can manage their own inspections" ON inspections;
DROP POLICY IF EXISTS "Supervisors can view district inspections" ON inspections;
DROP POLICY IF EXISTS "Admins can view all inspections" ON inspections;
DROP POLICY IF EXISTS "Supervisors and admins can update inspection status" ON inspections;

-- Create policies
CREATE POLICY "Inspectors can manage their own inspections"
  ON inspections
  FOR ALL
  TO authenticated
  USING (inspector_id::text = auth.uid()::text);

CREATE POLICY "Supervisors can view district inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'regional_supervisor'
      AND district = inspections.district
    )
  );

CREATE POLICY "Admins can view all inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('super_admin', 'national_admin')
    )
  );

CREATE POLICY "Supervisors and admins can update inspection status"
  ON inspections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('super_admin', 'national_admin', 'regional_supervisor')
    )
  );