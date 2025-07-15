-- Create the users table and other required tables for the health inspection app
-- Run this in your Supabase SQL Editor

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
        OR (users.role = 'hospital_supervisor' AND facilities.type IN ('hospital', 'clinic'))
        OR (users.role = 'pharmacy_inspector' AND facilities.type = 'pharmacy')
        OR (users.role = 'hospital_inspector' AND facilities.type IN ('hospital', 'clinic'))
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
          SELECT 1 FROM facilities WHERE facilities.id = inspections.facility_id AND facilities.type IN ('hospital', 'clinic')
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

-- Insert real RSSB users
INSERT INTO users (id, email, phone, name, role, district, is_active) VALUES
-- Super Admin
('550e8400-e29b-41d4-a716-446655440001', 'admin@rssb.rw', '+250788000000', 'System Administrator', 'super_admin', NULL, true),

-- Administration
('550e8400-e29b-41d4-a716-446655440002', 'fedine.urubuto@rssb.rw', '+250788000001', 'Fedine Urubuto', 'admin', NULL, true),

-- Hospital Team
('550e8400-e29b-41d4-a716-446655440003', 'beatrice.ndabateze@rssb.rw', '+250788000002', 'Ndabateze Beatrice', 'hospital_supervisor', NULL, true),
('550e8400-e29b-41d4-a716-446655440004', 'sandra.uwingabire@rssb.rw', '+250788000003', 'Uwingabire Sandra', 'hospital_inspector', 'kigali', true),
('550e8400-e29b-41d4-a716-446655440005', 'innocent.kayitsinga@rssb.rw', '+250788000004', 'Kayitsinga Innocent', 'hospital_inspector', 'kigali', true),
('550e8400-e29b-41d4-a716-446655440006', 'justine.mutuyimana@rssb.rw', '+250788000005', 'Mutuyimana Justine', 'hospital_inspector', 'kigali', true),
('550e8400-e29b-41d4-a716-446655440007', 'norbert.niyongira@rssb.rw', '+250788000006', 'Niyongira Norbert', 'hospital_inspector', 'kigali', true),
('550e8400-e29b-41d4-a716-446655440008', 'bonnette.mukamugenzi@rssb.rw', '+250788000007', 'Mukamugenzi Bonnette', 'hospital_inspector', 'kigali', true),

-- Pharmacy Team
('550e8400-e29b-41d4-a716-446655440009', 'jacques.ngangura@rssb.rw', '+250788000008', 'Jean Jacques Ngangura', 'pharmacy_supervisor', NULL, true),
('550e8400-e29b-41d4-a716-446655440010', 'baptiste.ntibazilikana@rssb.rw', '+250788000009', 'Jean Baptiste Ntibazirikana', 'pharmacy_inspector', 'kigali', true),
('550e8400-e29b-41d4-a716-446655440011', 'fabiola.uwanyirigira@rssb.rw', '+250788000010', 'Fabiola Uwanyirigira', 'pharmacy_inspector', 'kigali', true),
('550e8400-e29b-41d4-a716-446655440012', 'marie.nyiransabimana@rssb.rw', '+250788000011', 'Anne Marie Nyiransabimana', 'pharmacy_inspector', 'kigali', true),
('550e8400-e29b-41d4-a716-446655440013', 'julienne.mukashema@rssb.rw', '+250788000012', 'Julienne Mukashema', 'pharmacy_inspector', 'kigali', true);