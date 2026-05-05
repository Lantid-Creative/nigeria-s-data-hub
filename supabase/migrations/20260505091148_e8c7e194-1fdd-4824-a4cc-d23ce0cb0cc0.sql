
-- ==========================================
-- ROLES & PROFILES
-- ==========================================
create type public.app_role as enum ('ngf_staff', 'state_user', 'partner');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  title text,
  state_code text, -- nullable for ngf_staff
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  state_code text, -- which state the role applies to (state_user)
  created_at timestamptz not null default now(),
  unique (user_id, role, state_code)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.current_state_code()
returns text
language sql stable security definer set search_path = public
as $$
  select state_code from public.user_roles
  where user_id = auth.uid() and role = 'state_user'
  limit 1
$$;

-- ==========================================
-- REFERENCE: STATES, ZONES, DIMENSIONS, INDICATORS
-- ==========================================
create table public.zones (
  code text primary key,
  name text not null
);

create table public.states (
  code text primary key,                -- e.g. "KD", "LA"
  name text not null,
  zone_code text not null references public.zones(code),
  capital text,
  population_millions numeric(6,2),
  created_at timestamptz not null default now()
);

create table public.dimensions (
  code text primary key,                -- e.g. "ECON","FISC","HUMAN","CLIM","GOV","SEC","SOC"
  name text not null,
  description text,
  sort_order int not null default 0
);

create table public.indicators (
  id uuid primary key default gen_random_uuid(),
  dimension_code text not null references public.dimensions(code) on delete cascade,
  sub_component text,
  name text not null,
  source text,
  direction text not null check (direction in ('+','-')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ==========================================
-- SCORES (per state, per cycle)
-- ==========================================
create table public.reporting_cycles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,            -- e.g. "Q1-2026"
  label text not null,
  starts_on date not null,
  ends_on date not null,
  is_current boolean not null default false
);

create table public.state_scores (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references public.states(code) on delete cascade,
  cycle_id uuid not null references public.reporting_cycles(id) on delete cascade,
  resilience_index numeric(5,2) not null,
  economic numeric(5,2),
  fiscal numeric(5,2),
  human_capital numeric(5,2),
  climate numeric(5,2),
  governance numeric(5,2),
  security numeric(5,2),
  social numeric(5,2),
  created_at timestamptz not null default now(),
  unique (state_code, cycle_id)
);

-- ==========================================
-- SURVEYS
-- ==========================================
create type public.submission_status as enum ('not_started','in_progress','submitted','overdue');

create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  cycle_id uuid references public.reporting_cycles(id) on delete set null,
  sections int not null default 0,
  questions int not null default 0,
  due_date date,
  created_at timestamptz not null default now()
);

create table public.survey_submissions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  state_code text not null references public.states(code) on delete cascade,
  status submission_status not null default 'not_started',
  completion_pct int not null default 0,
  submitted_at timestamptz,
  submitted_by uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (survey_id, state_code)
);

-- ==========================================
-- CONTENT: REPORTS, RESEARCH, PILOTS, SCENARIOS, ALERTS
-- ==========================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  published_on date not null,
  pages int,
  downloads int not null default 0,
  summary text,
  file_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.research_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  lead_name text not null,
  status text not null,
  progress int not null default 0,
  summary text,
  created_at timestamptz not null default now()
);

create table public.innovation_pilots (
  id uuid primary key default gen_random_uuid(),
  state_code text references public.states(code) on delete set null,
  title text not null,
  stage text not null,
  impact text,
  summary text,
  created_at timestamptz not null default now()
);

create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  probability int not null,
  growth numeric(4,2),
  poverty numeric(4,1),
  summary text not null,
  sort_order int not null default 0
);

create type public.alert_level as enum ('info','medium','high');

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  level alert_level not null,
  title text not null,
  body text,
  state_code text references public.states(code) on delete set null,
  audience text not null default 'all',  -- 'all' | 'ngf' | 'state'
  created_at timestamptz not null default now()
);

-- ==========================================
-- TIMESTAMPS TRIGGERS
-- ==========================================
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger tg_profiles_updated before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger tg_submissions_updated before update on public.survey_submissions
  for each row execute function public.tg_set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================
-- RLS
-- ==========================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.zones enable row level security;
alter table public.states enable row level security;
alter table public.dimensions enable row level security;
alter table public.indicators enable row level security;
alter table public.reporting_cycles enable row level security;
alter table public.state_scores enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_submissions enable row level security;
alter table public.reports enable row level security;
alter table public.research_projects enable row level security;
alter table public.innovation_pilots enable row level security;
alter table public.scenarios enable row level security;
alter table public.alerts enable row level security;

-- Profiles
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
create policy "profiles ngf read" on public.profiles for select using (public.has_role(auth.uid(),'ngf_staff'));
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- user_roles: read own; ngf can read all
create policy "roles self read" on public.user_roles for select using (auth.uid() = user_id);
create policy "roles ngf read all" on public.user_roles for select using (public.has_role(auth.uid(),'ngf_staff'));

-- Public reference data (any authenticated user)
create policy "ref zones read" on public.zones for select using (auth.role() = 'authenticated');
create policy "ref states read" on public.states for select using (auth.role() = 'authenticated');
create policy "ref dims read" on public.dimensions for select using (auth.role() = 'authenticated');
create policy "ref inds read" on public.indicators for select using (auth.role() = 'authenticated');
create policy "ref cycles read" on public.reporting_cycles for select using (auth.role() = 'authenticated');
create policy "scores read" on public.state_scores for select using (auth.role() = 'authenticated');
create policy "surveys read" on public.surveys for select using (auth.role() = 'authenticated');
create policy "scenarios read" on public.scenarios for select using (auth.role() = 'authenticated');
create policy "research read" on public.research_projects for select using (auth.role() = 'authenticated');
create policy "pilots read" on public.innovation_pilots for select using (auth.role() = 'authenticated');

-- Reports: public if is_public
create policy "reports public read" on public.reports for select using (is_public or auth.role() = 'authenticated');

-- Alerts: ngf sees all; state sees own + 'all'
create policy "alerts ngf read" on public.alerts for select using (public.has_role(auth.uid(),'ngf_staff'));
create policy "alerts state read" on public.alerts for select using (
  audience = 'all' or (audience = 'state' and state_code = public.current_state_code())
);

-- Submissions: state sees only own; ngf sees all
create policy "subs state read" on public.survey_submissions for select using (
  state_code = public.current_state_code()
);
create policy "subs state upsert" on public.survey_submissions for insert with check (
  state_code = public.current_state_code()
);
create policy "subs state update" on public.survey_submissions for update using (
  state_code = public.current_state_code()
);
create policy "subs ngf read" on public.survey_submissions for select using (
  public.has_role(auth.uid(),'ngf_staff')
);

-- NGF write access on content tables
create policy "ngf write reports" on public.reports for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write research" on public.research_projects for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write pilots" on public.innovation_pilots for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write scenarios" on public.scenarios for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write alerts" on public.alerts for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write scores" on public.state_scores for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write states" on public.states for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write cycles" on public.reporting_cycles for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write surveys" on public.surveys for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write indicators" on public.indicators for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write dimensions" on public.dimensions for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
create policy "ngf write zones" on public.zones for all using (public.has_role(auth.uid(),'ngf_staff')) with check (public.has_role(auth.uid(),'ngf_staff'));
