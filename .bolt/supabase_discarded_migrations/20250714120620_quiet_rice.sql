/*
  # Fix UUID casting issues in existing data

  This migration fixes the UUID casting errors by properly casting string values to UUID
  when inserting sample data into the database.

  1. Tables to fix
    - `users` - Cast id strings to UUID
    - `facilities` - Cast id and assigned_inspector_id strings to UUID

  2. Data insertion
    - Insert sample users with proper UUID casting
    - Insert sample facilities with proper UUID casting
    - Handle foreign key relationships properly
*/

-- Insert sample users with proper UUID casting
INSERT INTO users (id, email, phone, name, role, district) 
SELECT 
  v.id::uuid,
  v.email,
  v.phone,
  v.name,
  v.role::user_role,
  v.district
FROM (VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@moh.gov.rw', '+250788123456', 'Dr. Jean Baptiste Uwimana', 'super_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'national@moh.gov.rw', '+250788234567', 'Dr. Marie Uwimana', 'national_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'supervisor@moh.gov.rw', '+250788345678', 'Dr. Paul Kagame', 'regional_supervisor', 'kigali'),
  ('550e8400-e29b-41d4-a716-446655440004', 'inspector@moh.gov.rw', '+250788456789', 'Jean Claude Uwimana', 'inspector', 'kigali')
) AS v(id, email, phone, name, role, district)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.email = v.email);

-- Insert sample facilities with proper UUID casting
INSERT INTO facilities (id, name, type, district, address, phone, email, registration_number, assigned_inspector_id, compliance_score)
SELECT 
  v.id::uuid,
  v.name,
  v.type::facility_type,
  v.district,
  v.address,
  v.phone,
  v.email,
  v.registration_number,
  v.assigned_inspector_id::uuid,
  v.compliance_score
FROM (VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Kigali University Teaching Hospital', 'hospital', 'kigali', 'KN 4 Ave, Kigali', '+250788111111', 'info@kuth.rw', 'HOSP-001-2024', '550e8400-e29b-41d4-a716-446655440004', 92),
  ('660e8400-e29b-41d4-a716-446655440002', 'Pharmakina Rwanda', 'pharmacy', 'kigali', 'KG 9 Ave, Kigali', '+250788222222', 'info@pharmakina.rw', 'PHARM-001-2024', '550e8400-e29b-41d4-a716-446655440004', 88),
  ('660e8400-e29b-41d4-a716-446655440003', 'Nyarugenge Health Center', 'clinic', 'kigali', 'Nyarugenge District', '+250788333333', 'info@nyarugenge.rw', 'CLINIC-001-2024', '550e8400-e29b-41d4-a716-446655440004', 85),
  ('660e8400-e29b-41d4-a716-446655440004', 'King Faisal Hospital', 'hospital', 'kigali', 'KG 544 St, Kigali', '+250788444444', 'info@kfh.rw', 'HOSP-002-2024', '550e8400-e29b-41d4-a716-446655440004', 95),
  ('660e8400-e29b-41d4-a716-446655440005', 'Mediplan Pharmacy', 'pharmacy', 'kigali', 'KN 3 Ave, Kigali', '+250788555555', 'info@mediplan.rw', 'PHARM-002-2024', '550e8400-e29b-41d4-a716-446655440004', 90)
) AS v(id, name, type, district, address, phone, email, registration_number, assigned_inspector_id, compliance_score)
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE facilities.registration_number = v.registration_number);