-- Check if facilities table has data
SELECT COUNT(*) as total_facilities FROM facilities;

-- Check the structure of facilities table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'facilities' 
AND table_schema = 'public';

-- Check a few sample facilities
SELECT id, name, type, district, is_active 
FROM facilities 
LIMIT 10;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'facilities';