/*
  # Fix existing database state - Handle already created types and tables

  This migration handles the case where some database objects already exist
  and ensures all required tables and data are properly set up.

  1. Check and create missing tables only if they don't exist
  2. Insert sample data safely
  3. Ensure all policies are in place
*/

-- Check if users table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
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
  END IF;
END $$;

-- Check if facilities table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'facilities') THEN
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
    
    ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view facilities based on role"
      ON facilities
      FOR SELECT
      TO authenticated
      USING (
        assigned_inspector_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users 
          WHERE users.id::text = auth.uid()::text 
          AND (
            users.role IN ('super_admin', 'national_admin')
            OR (users.role = 'regional_supervisor' AND users.district = facilities.district)
          )
        )
      );

    CREATE POLICY "Admins can manage facilities"
      ON facilities
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id::text = auth.uid()::text 
          AND users.role IN ('super_admin', 'national_admin')
        )
      );
  END IF;
END $$;

-- Insert sample users if they don't exist
INSERT INTO users (id, email, phone, name, role, district) 
SELECT * FROM (VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@moh.gov.rw', '+250788123456', 'Dr. Jean Baptiste Uwimana', 'super_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'national@moh.gov.rw', '+250788234567', 'Dr. Marie Uwimana', 'national_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'supervisor@moh.gov.rw', '+250788345678', 'Dr. Paul Kagame', 'regional_supervisor', 'kigali'),
  ('550e8400-e29b-41d4-a716-446655440004', 'inspector@moh.gov.rw', '+250788456789', 'Jean Claude Uwimana', 'inspector', 'kigali')
) AS v(id, email, phone, name, role, district)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.email = v.email);

-- Insert sample facilities if they don't exist
INSERT INTO facilities (id, name, type, district, address, phone, email, registration_number, assigned_inspector_id, compliance_score)
SELECT * FROM (VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Kigali University Teaching Hospital', 'hospital', 'kigali', 'KN 4 Ave, Kigali', '+250788111111', 'info@kuth.rw', 'HOSP-001-2024', '550e8400-e29b-41d4-a716-446655440004', 92),
  ('660e8400-e29b-41d4-a716-446655440002', 'Pharmakina Rwanda', 'pharmacy', 'kigali', 'KG 9 Ave, Kigali', '+250788222222', 'info@pharmakina.rw', 'PHARM-001-2024', '550e8400-e29b-41d4-a716-446655440004', 88),
  ('660e8400-e29b-41d4-a716-446655440003', 'Nyarugenge Health Center', 'clinic', 'kigali', 'Nyarugenge District', '+250788333333', 'info@nyarugenge.rw', 'CLINIC-001-2024', '550e8400-e29b-41d4-a716-446655440004', 85),
  ('660e8400-e29b-41d4-a716-446655440004', 'King Faisal Hospital', 'hospital', 'kigali', 'KG 544 St, Kigali', '+250788444444', 'info@kfh.rw', 'HOSP-002-2024', '550e8400-e29b-41d4-a716-446655440004', 95),
  ('660e8400-e29b-41d4-a716-446655440005', 'Mediplan Pharmacy', 'pharmacy', 'kigali', 'KN 3 Ave, Kigali', '+250788555555', 'info@mediplan.rw', 'PHARM-002-2024', '550e8400-e29b-41d4-a716-446655440004', 90)
) AS v(id, name, type, district, address, phone, email, registration_number, assigned_inspector_id, compliance_score)
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE facilities.registration_number = v.registration_number);