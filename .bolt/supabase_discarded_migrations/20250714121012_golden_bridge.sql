/*
  # Clean Database Setup - Handle Existing Data Safely
  
  This migration will:
  1. Check what data already exists
  2. Only add missing data
  3. Ensure the app works properly
*/

-- First, let's see what we have
DO $$
BEGIN
  RAISE NOTICE 'Current database state:';
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users);
  RAISE NOTICE 'Facilities: %', (SELECT COUNT(*) FROM facilities);
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Some tables do not exist yet';
END $$;

-- Only insert users that don't exist (check by email to avoid ID conflicts)
INSERT INTO users (email, phone, name, role, district) 
SELECT v.email, v.phone, v.name, v.role::user_role, v.district
FROM (VALUES
  ('admin@moh.gov.rw', '+250788123456', 'Dr. Jean Baptiste Uwimana', 'super_admin', NULL),
  ('national@moh.gov.rw', '+250788234567', 'Dr. Marie Uwimana', 'national_admin', NULL),
  ('supervisor@moh.gov.rw', '+250788345678', 'Dr. Paul Kagame', 'regional_supervisor', 'kigali'),
  ('inspector@moh.gov.rw', '+250788456789', 'Jean Claude Uwimana', 'inspector', 'kigali')
) AS v(email, phone, name, role, district)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.email = v.email);

-- Get the inspector ID for facility assignment
DO $$
DECLARE
  inspector_id uuid;
BEGIN
  SELECT id INTO inspector_id FROM users WHERE email = 'inspector@moh.gov.rw' LIMIT 1;
  
  -- Only insert facilities that don't exist (check by name to avoid ID conflicts)
  INSERT INTO facilities (name, type, district, address, phone, email, registration_number, assigned_inspector_id, compliance_score)
  SELECT v.name, v.type::facility_type, v.district, v.address, v.phone, v.email, v.registration_number, inspector_id, v.compliance_score
  FROM (VALUES
    ('Kigali University Teaching Hospital', 'hospital', 'kigali', 'KN 4 Ave, Kigali', '+250788111111', 'info@kuth.rw', 'HOSP-001-2024', 92),
    ('Pharmakina Rwanda', 'pharmacy', 'kigali', 'KG 9 Ave, Kigali', '+250788222222', 'info@pharmakina.rw', 'PHARM-001-2024', 88),
    ('Nyarugenge Health Center', 'clinic', 'kigali', 'Nyarugenge District', '+250788333333', 'info@nyarugenge.rw', 'CLINIC-001-2024', 85),
    ('King Faisal Hospital', 'hospital', 'kigali', 'KG 544 St, Kigali', '+250788444444', 'info@kfh.rw', 'HOSP-002-2024', 95),
    ('Mediplan Pharmacy', 'pharmacy', 'kigali', 'KN 3 Ave, Kigali', '+250788555555', 'info@mediplan.rw', 'PHARM-002-2024', 90)
  ) AS v(name, type, district, address, phone, email, registration_number, compliance_score)
  WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE facilities.name = v.name);
END $$;

-- Show final counts
DO $$
BEGIN
  RAISE NOTICE 'Final database state:';
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users);
  RAISE NOTICE 'Facilities: %', (SELECT COUNT(*) FROM facilities);
END $$;