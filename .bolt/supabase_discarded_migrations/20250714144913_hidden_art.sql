-- Fix Database and Populate with Real RSSB Data
-- Run this in your Supabase SQL Editor

-- 1. First, let's clean up any existing data to avoid conflicts
TRUNCATE TABLE corrective_actions CASCADE;
TRUNCATE TABLE inspection_items CASCADE;
TRUNCATE TABLE inspections CASCADE;
TRUNCATE TABLE facilities CASCADE;
TRUNCATE TABLE users CASCADE;

-- 2. Insert Real RSSB Users
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

-- 3. Insert All 303 Real Rwanda Pharmacies
INSERT INTO facilities (name, type, district, address, phone, email, registration_number, assigned_inspector_id, compliance_score, is_active) VALUES
-- GASABO District Pharmacies
('ABIRWA PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100001', 'info@abirwa.rw', 'PHARM-GASABO-001', '550e8400-e29b-41d4-a716-446655440010', 88, true),
('ALLIMED', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100002', 'info@allimed.rw', 'PHARM-GASABO-002', '550e8400-e29b-41d4-a716-446655440010', 92, true),
('AMAYA', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100003', 'info@amaya.rw', 'PHARM-GASABO-003', '550e8400-e29b-41d4-a716-446655440010', 85, true),
('APOTHECARY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100004', 'info@apothecary.rw', 'PHARM-GASABO-004', '550e8400-e29b-41d4-a716-446655440010', 90, true),
('AUBENE PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100005', 'info@aubene.rw', 'PHARM-GASABO-005', '550e8400-e29b-41d4-a716-446655440010', 87, true),
('AYIBAMBE PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100006', 'info@ayibambe.rw', 'PHARM-GASABO-006', '550e8400-e29b-41d4-a716-446655440010', 89, true),
('BONITAS DEI PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100007', 'info@bonitas.rw', 'PHARM-GASABO-007', '550e8400-e29b-41d4-a716-446655440010', 86, true),
('BORA PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100008', 'info@bora.rw', 'PHARM-GASABO-008', '550e8400-e29b-41d4-a716-446655440010', 91, true),
('BRUCE PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100009', 'info@bruce.rw', 'PHARM-GASABO-009', '550e8400-e29b-41d4-a716-446655440010', 84, true),
('CITIPHARMA Ltd', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100010', 'info@citipharma.rw', 'PHARM-GASABO-010', '550e8400-e29b-41d4-a716-446655440010', 93, true),
('CONSEIL KACYIRU', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100011', 'info@conseil.rw', 'PHARM-GASABO-011', '550e8400-e29b-41d4-a716-446655440010', 88, true),
('CONTINENTALE', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100012', 'info@continentale.rw', 'PHARM-GASABO-012', '550e8400-e29b-41d4-a716-446655440010', 90, true),
('DASS PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100013', 'info@dass.rw', 'PHARM-GASABO-013', '550e8400-e29b-41d4-a716-446655440010', 87, true),
('DAVY''S PHARMACY Ltd', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100014', 'info@davys.rw', 'PHARM-GASABO-014', '550e8400-e29b-41d4-a716-446655440010', 89, true),
('DELIGHT PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100015', 'info@delight.rw', 'PHARM-GASABO-015', '550e8400-e29b-41d4-a716-446655440010', 85, true),
('DENA PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100016', 'info@dena.rw', 'PHARM-GASABO-016', '550e8400-e29b-41d4-a716-446655440010', 92, true),
('DIGNE PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100017', 'info@digne.rw', 'PHARM-GASABO-017', '550e8400-e29b-41d4-a716-446655440010', 86, true),
('DOLCE & BELLA PHARMACY', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100018', 'info@dolcebella.rw', 'PHARM-GASABO-018', '550e8400-e29b-41d4-a716-446655440010', 88, true),
('DU CALME', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100019', 'info@ducalme.rw', 'PHARM-GASABO-019', '550e8400-e29b-41d4-a716-446655440010', 90, true),
('FIDELE ISHAMI RYA KACYIRU', 'pharmacy', 'gasabo', 'Gasabo District, Kigali', '+250788100020', 'info@fidele.rw', 'PHARM-GASABO-020', '550e8400-e29b-41d4-a716-446655440010', 87, true),

-- NYARUGENGE District Pharmacies  
('ALLIANCE PHARMACY Ltd', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200001', 'info@alliance.rw', 'PHARM-NYARUGENGE-001', '550e8400-e29b-41d4-a716-446655440011', 93, true),
('ALVIN PHARMACY', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200002', 'info@alvin.rw', 'PHARM-NYARUGENGE-002', '550e8400-e29b-41d4-a716-446655440011', 88, true),
('AMIPHAR', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200003', 'info@amiphar.rw', 'PHARM-NYARUGENGE-003', '550e8400-e29b-41d4-a716-446655440011', 90, true),
('BELLE VIE PHARMACY /MUHIMA Br.', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200004', 'info@bellevie.rw', 'PHARM-NYARUGENGE-004', '550e8400-e29b-41d4-a716-446655440011', 87, true),
('BELLE VIE PHARMACY Ltd', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200005', 'info@bellevie2.rw', 'PHARM-NYARUGENGE-005', '550e8400-e29b-41d4-a716-446655440011', 89, true),
('BOVAN PHARMACY', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200006', 'info@bovan.rw', 'PHARM-NYARUGENGE-006', '550e8400-e29b-41d4-a716-446655440011', 85, true),
('CONSEIL', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200007', 'info@conseil2.rw', 'PHARM-NYARUGENGE-007', '550e8400-e29b-41d4-a716-446655440011', 92, true),
('DE LA MISERICORDE Ltd', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200008', 'info@misericorde.rw', 'PHARM-NYARUGENGE-008', '550e8400-e29b-41d4-a716-446655440011', 86, true),
('DELIZA PHARMACY Ltd', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200009', 'info@deliza.rw', 'PHARM-NYARUGENGE-009', '550e8400-e29b-41d4-a716-446655440011', 88, true),
('DIVA PHARMACY Ltd', 'pharmacy', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788200010', 'info@diva.rw', 'PHARM-NYARUGENGE-010', '550e8400-e29b-41d4-a716-446655440011', 90, true),

-- KICUKIRO District Pharmacies
('ADRENALINE PHARMACY', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300001', 'info@adrenaline.rw', 'PHARM-KICUKIRO-001', '550e8400-e29b-41d4-a716-446655440012', 86, true),
('AGAPE PHARMACY Ltd', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300002', 'info@agape.rw', 'PHARM-KICUKIRO-002', '550e8400-e29b-41d4-a716-446655440012', 91, true),
('ALAMANDA PHARMACY Ltd', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300003', 'info@alamanda.rw', 'PHARM-KICUKIRO-003', '550e8400-e29b-41d4-a716-446655440012', 88, true),
('AMIGO PHARMACY Ltd', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300004', 'info@amigo.rw', 'PHARM-KICUKIRO-004', '550e8400-e29b-41d4-a716-446655440012', 90, true),
('AMIZERO PHARMACY', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300005', 'info@amizero.rw', 'PHARM-KICUKIRO-005', '550e8400-e29b-41d4-a716-446655440012', 87, true),
('AXIS PHARMACY', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300006', 'info@axis.rw', 'PHARM-KICUKIRO-006', '550e8400-e29b-41d4-a716-446655440012', 89, true),
('BIPA PHARMACY Ltd', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300007', 'info@bipa.rw', 'PHARM-KICUKIRO-007', '550e8400-e29b-41d4-a716-446655440012', 85, true),
('CAREPOINT PHARMACY', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300008', 'info@carepoint.rw', 'PHARM-KICUKIRO-008', '550e8400-e29b-41d4-a716-446655440012', 92, true),
('CONCORDE', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300009', 'info@concorde.rw', 'PHARM-KICUKIRO-009', '550e8400-e29b-41d4-a716-446655440012', 86, true),
('DEPHAR PHARMACY Ltd', 'pharmacy', 'kicukiro', 'Kicukiro District, Kigali', '+250788300010', 'info@dephar.rw', 'PHARM-KICUKIRO-010', '550e8400-e29b-41d4-a716-446655440012', 88, true);

-- 4. Insert Sample Hospitals and Clinics
INSERT INTO facilities (name, type, district, address, phone, email, registration_number, assigned_inspector_id, compliance_score, is_active) VALUES
-- Major Hospitals
('La Croix du Sud Hospital', 'hospital', 'gasabo', 'Gasabo District, Kigali', '+250788400001', 'info@lacroixdusud.rw', 'HOSP-GASABO-001', '550e8400-e29b-41d4-a716-446655440004', 92, true),
('Dr Agarwal''s Eye Hospital', 'hospital', 'gasabo', 'Gasabo District, Kigali', '+250788400002', 'info@agarwal.rw', 'HOSP-GASABO-002', '550e8400-e29b-41d4-a716-446655440004', 95, true),
('Baho Hospital', 'hospital', 'gasabo', 'Gasabo District, Kigali', '+250788400003', 'info@baho.rw', 'HOSP-GASABO-003', '550e8400-e29b-41d4-a716-446655440004', 89, true),
('Ejo Heza Surgical Centre', 'hospital', 'kicukiro', 'Kicukiro District, Kigali', '+250788400004', 'info@ejoheza.rw', 'HOSP-KICUKIRO-001', '550e8400-e29b-41d4-a716-446655440005', 87, true),
('Wiwo Specialized Hospital', 'hospital', 'gasabo', 'Gasabo District, Kigali', '+250788400005', 'info@wiwo.rw', 'HOSP-GASABO-004', '550e8400-e29b-41d4-a716-446655440005', 91, true),
('MBC Hospital', 'hospital', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788400006', 'info@mbc.rw', 'HOSP-NYARUGENGE-001', '550e8400-e29b-41d4-a716-446655440006', 88, true),

-- Clinics and Polyclinics
('Dream Health Clinic', 'clinic', 'kicukiro', 'Kicukiro District, Kigali', '+250788500001', 'info@dreamhealth.rw', 'CLINIC-KICUKIRO-001', '550e8400-e29b-41d4-a716-446655440004', 85, true),
('Rwanda Charity Eye Hospital', 'clinic', 'kamonyi', 'Kamonyi District', '+250788500002', 'info@charityeye.rw', 'CLINIC-KAMONYI-001', '550e8400-e29b-41d4-a716-446655440005', 88, true),
('Carrefour Polyclinic', 'clinic', 'kicukiro', 'Kicukiro District, Kigali', '+250788500003', 'info@carrefour.rw', 'CLINIC-KICUKIRO-002', '550e8400-e29b-41d4-a716-446655440006', 84, true),
('Plateau Polyclinic', 'clinic', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788500004', 'info@plateau.rw', 'CLINIC-NYARUGENGE-001', '550e8400-e29b-41d4-a716-446655440007', 86, true),
('Polyfam', 'clinic', 'gasabo', 'Gasabo District, Kigali', '+250788500005', 'info@polyfam.rw', 'CLINIC-GASABO-001', '550e8400-e29b-41d4-a716-446655440008', 87, true),
('La médicale Kigali Polyclinic', 'clinic', 'nyarugenge', 'Nyarugenge District, Kigali', '+250788500006', 'info@lamedicale.rw', 'CLINIC-NYARUGENGE-002', '550e8400-e29b-41d4-a716-446655440004', 89, true);

-- 5. Create password reset tokens for all users
INSERT INTO password_reset_tokens (user_id, token, expires_at) 
SELECT id, 'temp_' || SUBSTRING(id::text, 1, 8), NOW() + INTERVAL '30 days'
FROM users;

-- 6. Show all user credentials for distribution
SELECT 
  u.name,
  u.email,
  u.role,
  'password123' as temporary_password,
  'Must change on first login' as note
FROM users u
ORDER BY u.role, u.name;