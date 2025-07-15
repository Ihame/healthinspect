/*
  # Fresh Database Setup for HealthInspect Rwanda
  
  This migration sets up a clean database with:
  1. User roles and authentication
  2. Health facilities (pharmacies, hospitals, clinics)
  3. Inspection system
  4. Real Rwanda data population
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Role-based access policies
  - Secure data access patterns
*/

-- Create custom types
CREATE TYPE user_role AS ENUM (
  'super_admin', 
  'admin', 
  'pharmacy_supervisor', 
  'hospital_supervisor', 
  'pharmacy_inspector', 
  'hospital_inspector'
);

CREATE TYPE facility_type AS ENUM ('pharmacy', 'hospital', 'clinic');
CREATE TYPE inspection_status AS ENUM ('draft', 'submitted', 'reviewed', 'approved');
CREATE TYPE item_response AS ENUM ('yes', 'no', 'na');
CREATE TYPE action_status AS ENUM ('pending', 'in_progress', 'resolved');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'pharmacy_inspector',
  district text,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type facility_type NOT NULL,
  district text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text,
  registration_number text UNIQUE NOT NULL,
  assigned_inspector_id uuid REFERENCES users(id),
  last_inspection_date timestamptz,
  compliance_score integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  inspector_id uuid NOT NULL REFERENCES users(id),
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

-- Inspection items table
CREATE TABLE IF NOT EXISTS inspection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  question text NOT NULL,
  category text NOT NULL,
  max_score integer NOT NULL DEFAULT 0,
  response item_response,
  actual_score integer DEFAULT 0,
  comments text,
  images jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Corrective actions table
CREATE TABLE IF NOT EXISTS corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  item text NOT NULL,
  description text NOT NULL,
  deadline date NOT NULL,
  status action_status NOT NULL DEFAULT 'pending',
  assigned_to text,
  resolved_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text 
    AND role IN ('super_admin', 'admin')
  ));

CREATE POLICY "Super admins can manage users" ON users
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text 
    AND role = 'super_admin'
  ));

-- Facilities policies
CREATE POLICY "Users can view facilities based on role" ON facilities
  FOR SELECT TO authenticated
  USING (
    assigned_inspector_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND (
        users.role IN ('super_admin', 'admin')
        OR (users.role = 'pharmacy_supervisor' AND facilities.type = 'pharmacy')
        OR (users.role = 'hospital_supervisor' AND facilities.type = 'hospital')
        OR (users.role = 'pharmacy_inspector' AND facilities.type = 'pharmacy')
        OR (users.role = 'hospital_inspector' AND facilities.type = 'hospital')
      )
    )
  );

CREATE POLICY "Admins and supervisors can manage facilities" ON facilities
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id::text = auth.uid()::text 
    AND users.role IN ('super_admin', 'admin', 'pharmacy_supervisor', 'hospital_supervisor')
  ));

-- Inspections policies
CREATE POLICY "Users can view inspections based on role" ON inspections
  FOR SELECT TO authenticated
  USING (
    inspector_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND (
        users.role IN ('super_admin', 'admin')
        OR (users.role = 'pharmacy_supervisor' AND EXISTS (
          SELECT 1 FROM facilities WHERE facilities.id = inspections.facility_id AND facilities.type = 'pharmacy'
        ))
        OR (users.role = 'hospital_supervisor' AND EXISTS (
          SELECT 1 FROM facilities WHERE facilities.id = inspections.facility_id AND facilities.type = 'hospital'
        ))
      )
    )
  );

CREATE POLICY "Inspectors can manage their inspections" ON inspections
  FOR ALL TO authenticated
  USING (inspector_id::text = auth.uid()::text);

-- Inspection items policies
CREATE POLICY "Users can access inspection items through inspections" ON inspection_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_items.inspection_id
    AND (
      inspections.inspector_id::text = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id::text = auth.uid()::text 
        AND users.role IN ('super_admin', 'admin', 'pharmacy_supervisor', 'hospital_supervisor')
      )
    )
  ));

-- Corrective actions policies
CREATE POLICY "Users can view corrective actions for accessible facilities" ON corrective_actions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM facilities 
    WHERE facilities.id = corrective_actions.facility_id
    AND (
      facilities.assigned_inspector_id::text = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id::text = auth.uid()::text 
        AND users.role IN ('super_admin', 'admin', 'pharmacy_supervisor', 'hospital_supervisor')
      )
    )
  ));

-- Insert system users
INSERT INTO users (id, email, phone, name, role, district) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@moh.gov.rw', '+250788123456', 'Dr. Jean Baptiste Uwimana', 'super_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'general.admin@moh.gov.rw', '+250788678901', 'Dr. Emmanuel Nzeyimana', 'admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'pharmacy.supervisor@moh.gov.rw', '+250788234567', 'Dr. Paul Kagame', 'pharmacy_supervisor', NULL),
  ('550e8400-e29b-41d4-a716-446655440004', 'hospital.supervisor@moh.gov.rw', '+250788567890', 'Dr. Alice Uwimana', 'hospital_supervisor', NULL),
  ('550e8400-e29b-41d4-a716-446655440005', 'pharmacy.inspector@moh.gov.rw', '+250788456789', 'Jean Claude Uwimana', 'pharmacy_inspector', 'kigali'),
  ('550e8400-e29b-41d4-a716-446655440006', 'hospital.inspector@moh.gov.rw', '+250788345678', 'Dr. Marie Mukamana', 'hospital_inspector', 'kigali');