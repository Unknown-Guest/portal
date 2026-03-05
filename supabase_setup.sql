-- ============================================================
-- SCP PORTAL — SUPABASE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ACCOUNTS (approved users)
create table if not exists accounts (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  name text not null,
  email text default '',
  password text not null,
  role text default 'student',
  initial_grade int default null,
  grade_year int default null,
  access text[] default array['Files','Console','Websites','Tutors','Messages'],
  favorite boolean default false,
  redacted boolean default false,
  hidden boolean default true,
  suspended boolean default false,
  suspend_reason text default '',
  deleted boolean default false,
  deleted_at bigint default null,
  created_at bigint default extract(epoch from now()) * 1000
);

-- PENDING REGISTRATION REQUESTS
create table if not exists pending_accounts (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  name text not null,
  email text default '',
  password text not null,
  role text default 'student',
  initial_grade int default null,
  grade_year int default null,
  requested_at bigint default extract(epoch from now()) * 1000
);

-- MESSAGES (DMs and group messages)
create table if not exists messages (
  id text primary key,
  from_user text not null,
  to_user text default null,
  group_id text default null,
  body text default '',
  file_data text default null,
  timestamp bigint not null,
  read boolean default false,
  edited boolean default false,
  deleted_msg boolean default false,
  hidden_by text[] default array[]::text[],
  reactions jsonb default '{}'::jsonb
);

-- GROUPS
create table if not exists groups (
  id text primary key,
  name text not null,
  members text[] not null,
  created_by text not null,
  created bigint not null,
  deleted boolean default false,
  permanent boolean default false
);

-- SECURITY VIOLATIONS LOG
create table if not exists violations (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  type text not null,
  detail text default '',
  timestamp bigint not null
);

-- AUDIT LOG
create table if not exists audit_log (
  id uuid default gen_random_uuid() primary key,
  admin_user text not null,
  action text not null,
  target text default '',
  detail text default '',
  timestamp bigint not null
);

-- SITE SETTINGS (teacher code, etc)
create table if not exists settings (
  key text primary key,
  value text not null
);

-- Insert default teacher code
insert into settings (key, value) values ('teacher_code', 'TEACHER2026')
on conflict (key) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY — disable for now (anon key handles auth)
-- ============================================================
alter table accounts enable row level security;
alter table pending_accounts enable row level security;
alter table messages enable row level security;
alter table groups enable row level security;
alter table violations enable row level security;
alter table audit_log enable row level security;
alter table settings enable row level security;

-- Allow anon key full access (our app handles auth logic)
create policy "anon_all" on accounts for all to anon using (true) with check (true);
create policy "anon_all" on pending_accounts for all to anon using (true) with check (true);
create policy "anon_all" on messages for all to anon using (true) with check (true);
create policy "anon_all" on groups for all to anon using (true) with check (true);
create policy "anon_all" on violations for all to anon using (true) with check (true);
create policy "anon_all" on audit_log for all to anon using (true) with check (true);
create policy "anon_all" on settings for all to anon using (true) with check (true);

-- ============================================================
-- Insert the default Restricted admin account
-- Password hash for "Restricted" — change this after setup
-- ============================================================
insert into accounts (username, name, email, password, role, initial_grade, grade_year, access, favorite, redacted, hidden, suspended, deleted)
values (
  'Restricted', 'Restricted', '', 
  '426f526558624c6659414247613957584a5a3557396e62477a7a7a665a4a4a5a57',
  'student', 7, 2017,
  array['Files','Console','Websites','Tutors','Messages','Lookup','Admin'],
  false, false, false, false, false
) on conflict (username) do nothing;
