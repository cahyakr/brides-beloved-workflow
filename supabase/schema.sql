create extension if not exists pgcrypto;

create type public.user_role as enum ('super_admin','admin','team','client');
create type public.lead_status as enum ('new','contacted','consultation','proposal','won','lost');
create type public.project_status as enum ('planning','preparation','ready','event_day','completed','cancelled');
create type public.task_status as enum ('not_started','in_progress','in_review','revision','blocked','completed');
create type public.task_priority as enum ('low','medium','high','urgent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null, email text not null, phone text, avatar_url text,
  role public.user_role not null default 'client', is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(), bride_name text not null, groom_name text not null,
  email text not null, phone text not null, whatsapp text, wedding_date date not null, venue text,
  guest_count int check (guest_count is null or guest_count > 0), package_interest text, message text,
  source text default 'website', status public.lead_status not null default 'new',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(), profile_id uuid references public.profiles(id),
  bride_name text not null, groom_name text not null, display_name text not null, email text not null,
  phone text, whatsapp text, address text, wedding_date date, venue text, guest_count int,
  package_name text, status text not null default 'active', notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  name text not null, description text, event_date date, venue text, start_date date,
  status public.project_status not null default 'planning',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, project_role text not null,
  created_at timestamptz not null default now(), unique(project_id,user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  title text not null, description text, start_date date, due_date date, priority public.task_priority not null default 'medium',
  status public.task_status not null default 'not_started', category text, visible_to_client boolean not null default false,
  created_by uuid references public.profiles(id), sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (due_date is null or start_date is null or due_date >= start_date)
);

create table public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key(task_id,user_id)
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id), comment text not null, is_internal boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(), project_id uuid references public.projects(id) on delete cascade,
  uploaded_by uuid references public.profiles(id), name text not null, path text not null, type text, size bigint,
  visible_to_client boolean not null default false, created_at timestamptz not null default now()
);

create table public.pricelists (
  id uuid primary key default gen_random_uuid(), title text not null, description text, file_path text not null,
  is_active boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index projects_client_idx on public.projects(client_id);
create index project_members_user_idx on public.project_members(user_id);
create index tasks_project_idx on public.tasks(project_id);
create index tasks_due_idx on public.tasks(due_date);
create index leads_status_idx on public.leads(status);

create or replace function public.my_role() returns public.user_role language sql stable security definer set search_path=public as $$
  select role from public.profiles where id = auth.uid()
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select coalesce(public.my_role() in ('super_admin','admin'), false)
$$;
create or replace function public.is_project_member(pid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.project_members where project_id=pid and user_id=auth.uid())
$$;
create or replace function public.is_project_client(pid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.projects p join public.clients c on c.id=p.client_id where p.id=pid and c.profile_id=auth.uid())
$$;

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_comments enable row level security;
alter table public.files enable row level security;
alter table public.pricelists enable row level security;

create policy "profile self or admin" on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
create policy "public lead intake" on public.leads for insert to anon, authenticated with check (status='new');
create policy "admins manage leads" on public.leads for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "client record access" on public.clients for select to authenticated using (profile_id=auth.uid() or public.is_admin() or exists(select 1 from public.projects p where p.client_id=clients.id and public.is_project_member(p.id)));
create policy "admins manage clients" on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "project access" on public.projects for select to authenticated using (public.is_admin() or public.is_project_member(id) or public.is_project_client(id));
create policy "admins manage projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "members view membership" on public.project_members for select to authenticated using (public.is_admin() or user_id=auth.uid() or public.is_project_client(project_id));
create policy "admins manage membership" on public.project_members for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "task access" on public.tasks for select to authenticated using (public.is_admin() or public.is_project_member(project_id) or (visible_to_client and public.is_project_client(project_id)));
create policy "admin or team update tasks" on public.tasks for all to authenticated using (public.is_admin() or public.is_project_member(project_id)) with check (public.is_admin() or public.is_project_member(project_id));
create policy "task assignee access" on public.task_assignees for select to authenticated using (public.is_admin() or user_id=auth.uid() or exists(select 1 from public.tasks t where t.id=task_assignees.task_id and public.is_project_client(t.project_id)));
create policy "admins manage assignees" on public.task_assignees for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "client-safe comments" on public.task_comments for select to authenticated using (public.is_admin() or exists(select 1 from public.tasks t where t.id=task_comments.task_id and (public.is_project_member(t.project_id) or (not task_comments.is_internal and t.visible_to_client and public.is_project_client(t.project_id)))));
create policy "team comments" on public.task_comments for insert to authenticated with check (user_id=auth.uid() and exists(select 1 from public.tasks t where t.id=task_comments.task_id and (public.is_admin() or public.is_project_member(t.project_id))));
create policy "project files access" on public.files for select to authenticated using (public.is_admin() or (project_id is not null and public.is_project_member(project_id)) or (visible_to_client and project_id is not null and public.is_project_client(project_id)));
create policy "project files write" on public.files for all to authenticated using (public.is_admin() or (project_id is not null and public.is_project_member(project_id))) with check (public.is_admin() or (project_id is not null and public.is_project_member(project_id)));
create policy "public active pricelist" on public.pricelists for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins manage pricelist" on public.pricelists for all to authenticated using (public.is_admin()) with check (public.is_admin());
