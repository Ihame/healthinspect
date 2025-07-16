-- Migration: Add inspection_schedules table for inspection scheduling and assignment
create table if not exists inspection_schedules (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references facilities(id),
  facility_type text not null,
  inspection_type text not null,
  scheduled_date date not null,
  scheduled_time time not null,
  assigned_inspectors jsonb not null, -- array of user IDs or objects
  status text not null default 'scheduled', -- scheduled, completed, cancelled
  notes text,
  created_by uuid references users(id),
  created_at timestamp with time zone default now()
); 