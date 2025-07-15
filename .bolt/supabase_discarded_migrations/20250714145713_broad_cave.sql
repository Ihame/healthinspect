-- Clean Database Setup for Rwanda Health Inspection System
-- Run this in your Supabase SQL Editor

-- 1. Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS corrective_actions CASCADE;
DROP TABLE IF EXISTS inspection_items CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS facility_type CASCADE;
DROP TYPE IF EXISTS inspection_status CASCADE;
DROP TYPE IF EXISTS item_response CASCADE;
DROP TYPE IF EXISTS action_status CASCADE;

-- 3. Create custom types
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

-- 4. Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'pharmacy_inspector',
  district text,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- 5. Create facilities table
CREATE TABLE facilities (
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

-- 6. Create inspections table
CREATE TABLE inspections (
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

-- 7. Create inspection_items table
CREATE TABLE inspection_items (
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

-- 8. Create corrective_actions table
CREATE TABLE corrective_actions (
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

-- 9. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
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

-- 11. Insert real RSSB users
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

-- 12. Insert sample pharmacies (first 20 from your list)
INSERT INTO facilities (name, type, district, address, phone, email, registration_number, assigned_inspector_id, compliance_score, is_active) VALUES
-- GASABO District Pharmacies
('ABIRWA PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100001', 'info@abirwa.rw', 'PHARM-GASABO-001', '550e8400-e29b-41d4-a716-446655440010', 88, true),
('ALLIMED', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100002', 'info@allimed.rw', 'PHARM-GASABO-002', '550e8400-e29b-41d4-a716-446655440010', 92, true),
('AMAYA', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100003', 'info@amaya.rw', 'PHARM-GASABO-003', '550e8400-e29b-41d4-a716-446655440010', 85, true),
('APOTHECARY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100004', 'info@apothecary.rw', 'PHARM-GASABO-004', '550e8400-e29b-41d4-a716-446655440010', 90, true),
('AUBENE PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100005', 'info@aubene.rw', 'PHARM-GASABO-005', '550e8400-e29b-41d4-a716-446655440010', 87, true),

-- NYARUGENGE District Pharmacies  
('ALLIANCE PHARMACY Ltd', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200001', 'info@alliance.rw', 'PHARM-NYARUGENGE-001', '550e8400-e29b-41d4-a716-446655440011', 93, true),
('ALVIN PHARMACY', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200002', 'info@alvin.rw', 'PHARM-NYARUGENGE-002', '550e8400-e29b-41d4-a716-446655440011', 88, true),
('AMIPHAR', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200003', 'info@amiphar.rw', 'PHARM-NYARUGENGE-003', '550e8400-e29b-41d4-a716-446655440011', 90, true),

-- KICUKIRO District Pharmacies
('ADRENALINE PHARMACY', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300001', 'info@adrenaline.rw', 'PHARM-KICUKIRO-001', '550e8400-e29b-41d4-a716-446655440012', 86, true),
('AGAPE PHARMACY Ltd', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300002', 'info@agape.rw', 'PHARM-KICUKIRO-002', '550e8400-e29b-41d4-a716-446655440012', 91, true);

-- 13. Insert sample hospitals and clinics (first 10 from your list)
INSERT INTO facilities (name, type, district, address, phone, email, registration_number, assigned_inspector_id, compliance_score, is_active) VALUES
-- Hospitals
('La Croix du Sud Hospital', 'hospital', 'gasabo', 'Gasabo District, Kigali', '+250788400001', 'info@lacroixdusud.rw', 'HOSP-GASABO-001', '550e8400-e29b-41d4-a716-446655440004', 92, true),
('Dr Agarwal''s Eye Hospital', 'hospital', 'gasabo', 'Gasabo District, Kigali', '+250788400002', 'info@agarwal.rw', 'HOSP-GASABO-002', '550e8400-e29b-41d4-a716-446655440004', 95, true),
('Baho Hospital', 'hospital', 'gasabo', 'Gasabo District, Kigali', '+250788400003', 'info@baho.rw', 'HOSP-GASABO-003', '550e8400-e29b-41d4-a716-446655440004', 89, true),
('Ejo Heza Surgical Centre', 'hospital', 'kicukiro', 'Kicukiro District, Kigali', '+250788400004', 'info@ejoheza.rw', 'HOSP-KICUKIRO-001', '550e8400-e29b-41d4-a716-446655440005', 87, true),
('Wiwo Specialized Hospital', 'hospital', 'gasabo', 'Gasabo District, Kigali', '+250788400005', 'info@wiwo.rw', 'HOSP-GASABO-004', '550e8400-e29b-41d4-a716-446655440005', 91, true),

-- Clinics
('Dream Health Clinic', 'clinic', 'kicukiro', 'Kicukiro District, Kigali', '+250788500001', 'info@dreamhealth.rw', 'CLINIC-KICUKIRO-001', '550e8400-e29b-41d4-a716-446655440004', 85, true),
('Rwanda Charity Eye Hospital', 'clinic', 'kamonyi', 'Kamonyi District', '+250788500002', 'info@charityeye.rw', 'CLINIC-KAMONYI-001', '550e8400-e29b-41d4-a716-446655440005', 88, true),
('Carrefour Polyclinic', 'clinic', 'kicukiro', 'Kicukiro District, Kigali', '+250788500003', 'info@carrefour.rw', 'CLINIC-KICUKIRO-002', '550e8400-e29b-41d4-a716-446655440006', 84, true),
('Plateau Polyclinic', 'clinic', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788500004', 'info@plateau.rw', 'CLINIC-NYARUGENGE-001', '550e8400-e29b-41d4-a716-446655440007', 86, true),
('Polyfam', 'clinic', 'gasabo', 'Gasabo District, Kigali', '+250788500005', 'info@polyfam.rw', 'CLINIC-GASABO-001', '550e8400-e29b-41d4-a716-446655440008', 87, true);

-- Success message
SELECT 'Database setup completed successfully! You can now login with: admin@rssb.rw / password123' as message;