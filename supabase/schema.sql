-- Brides Beloved Wedding Workflow
-- Complete Supabase schema. Run on a new Supabase project from the SQL editor.

create extension if not exists pgcrypto;

create type public.user_role as enum ('super_admin', 'admin', 'team', 'client');
create type public.lead_status as enum ('new', 'contacted', 'consultation', 'proposal', 'won', 'lost');
create type public.project_status as enum ('planning', 'preparation', 'ready', 'event_day', 'completed', 'cancelled');
create type public.task_status as enum ('not_started', 'in_progress', 'in_review', 'revision', 'blocked', 'completed');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.guest_status as enum ('invited', 'confirmed', 'declined', 'attended');
create type public.payment_status as enum ('planned', 'pending', 'paid', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  role public.user_role not null default 'client',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  bride_name text not null,
  groom_name text not null,
  email text not null,
  phone text not null,
  whatsapp text,
  wedding_date date,
  venue text,
  guest_count integer check (guest_count is null or guest_count > 0),
  package_interest text,
  message text,
  source text not null default 'website',
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  bride_name text not null,
  groom_name text not null,
  display_name text not null,
  email text not null,
  phone text,
  whatsapp text,
  address text,
  wedding_date date,
  venue text,
  guest_count integer check (guest_count is null or guest_count > 0),
  package_name text,
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  description text,
  event_date date,
  venue text,
  start_date date,
  status public.project_status not null default 'planning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (event_date is null or start_date is null or event_date >= start_date)
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_role text not null,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  start_date date,
  due_date date,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'not_started',
  category text not null default 'Persiapan Umum',
  visible_to_client boolean not null default false,
  client_can_complete boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  completed_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date is null or start_date is null or due_date >= start_date)
);

create table public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null check (char_length(comment) between 1 and 5000),
  is_internal boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  meeting_url text,
  visible_to_client boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  currency text not null default 'IDR',
  target_amount numeric(16,2) not null default 0 check (target_amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.budget_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  category text not null,
  item_name text not null,
  vendor_name text,
  estimated_amount numeric(16,2) not null default 0 check (estimated_amount >= 0),
  actual_amount numeric(16,2) not null default 0 check (actual_amount >= 0),
  paid_amount numeric(16,2) not null default 0 check (paid_amount >= 0),
  payment_status public.payment_status not null default 'planned',
  due_date date,
  notes text,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  category text not null,
  contact_name text,
  phone text,
  email text,
  instagram text,
  contract_value numeric(16,2) check (contract_value is null or contract_value >= 0),
  status text not null default 'shortlisted' check (status in ('shortlisted', 'contacted', 'booked', 'completed', 'cancelled')),
  notes text,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  guest_group text,
  pax integer not null default 1 check (pax > 0),
  table_name text,
  invitation_code text unique default encode(gen_random_bytes(8), 'hex'),
  status public.guest_status not null default 'invited',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  name text not null,
  path text not null unique,
  type text,
  size bigint check (size is null or size >= 0),
  category text not null default 'general',
  visible_to_client boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.pricelists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_path text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_active_pricelist_idx on public.pricelists (is_active) where is_active;
create index clients_profile_idx on public.clients(profile_id);
create index projects_client_idx on public.projects(client_id);
create index projects_event_date_idx on public.projects(event_date);
create index project_members_user_idx on public.project_members(user_id);
create index tasks_project_sort_idx on public.tasks(project_id, sort_order, due_date);
create index tasks_status_due_idx on public.tasks(status, due_date);
create index task_activities_project_created_idx on public.task_activities(project_id, created_at desc);
create index meetings_project_starts_idx on public.meetings(project_id, starts_at);
create index budget_items_budget_idx on public.budget_items(budget_id);
create index vendors_project_idx on public.vendors(project_id);
create index guests_project_status_idx on public.guests(project_id, status);
create index files_project_idx on public.files(project_id);
create index leads_status_created_idx on public.leads(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, 'User'), '@', 1)),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'phone',
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.my_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$ select role from public.profiles where id = auth.uid() and is_active $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select coalesce(public.my_role() in ('super_admin', 'admin'), false) $$;

create or replace function public.is_project_member(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.project_members where project_id = pid and user_id = auth.uid()) $$;

create or replace function public.is_project_client(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = pid and c.profile_id = auth.uid()
  )
$$;

create or replace function public.track_task_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'completed' then
      new.completed_at = coalesce(new.completed_at, now());
      new.completed_by = coalesce(new.completed_by, auth.uid());
    else
      new.completed_at = null;
      new.completed_by = null;
    end if;

    insert into public.task_activities (project_id, task_id, actor_id, action, metadata)
    values (
      new.project_id,
      new.id,
      auth.uid(),
      case when new.status = 'completed' then 'completed' else 'status_changed' end,
      jsonb_build_object('task_title', new.title, 'from', old.status, 'to', new.status)
    );
  end if;
  return new;
end;
$$;

create trigger tasks_track_status
before update of status on public.tasks
for each row execute function public.track_task_status();

create or replace function public.set_task_completion(task_id uuid, is_completed boolean)
returns public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.tasks;
begin
  select * into target from public.tasks where id = task_id;
  if target.id is null then raise exception 'Task not found'; end if;

  if not (
    public.is_admin()
    or public.is_project_member(target.project_id)
    or (target.visible_to_client and target.client_can_complete and public.is_project_client(target.project_id))
  ) then
    raise exception 'Not authorized to update this task';
  end if;

  update public.tasks
  set status = case when is_completed then 'completed'::public.task_status else 'not_started'::public.task_status end
  where id = task_id
  returning * into target;
  return target;
end;
$$;

create or replace view public.project_progress
with (security_invoker = true)
as
select
  p.id as project_id,
  p.client_id,
  count(t.id)::integer as total_tasks,
  count(t.id) filter (where t.status = 'completed')::integer as completed_tasks,
  count(t.id) filter (where t.status = 'in_progress')::integer as in_progress_tasks,
  count(t.id) filter (where t.status = 'blocked')::integer as blocked_tasks,
  case when count(t.id) = 0 then 0 else round(100.0 * count(t.id) filter (where t.status = 'completed') / count(t.id))::integer end as progress_percent,
  max(t.updated_at) as last_task_update
from public.projects p
left join public.tasks t on t.project_id = p.id
group by p.id, p.client_id;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','leads','clients','projects','project_members','tasks','task_assignees','task_comments','task_activities','meetings','budgets','budget_items','vendors','guests','files','pricelists']
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

create policy "profiles readable by related users" on public.profiles for select to authenticated using (
  id = auth.uid() or public.is_admin()
  or exists (select 1 from public.project_members pm where pm.user_id = profiles.id and (public.is_project_member(pm.project_id) or public.is_project_client(pm.project_id)))
);
create policy "users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public lead intake" on public.leads for insert to anon, authenticated with check (status = 'new');
create policy "admins manage leads" on public.leads for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "related users view clients" on public.clients for select to authenticated using (
  profile_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.projects p where p.client_id = clients.id and public.is_project_member(p.id))
);
create policy "admins manage clients" on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "related users view projects" on public.projects for select to authenticated using (public.is_admin() or public.is_project_member(id) or public.is_project_client(id));
create policy "admins manage projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "related users view project members" on public.project_members for select to authenticated using (public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id));
create policy "admins manage project members" on public.project_members for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "related users view tasks" on public.tasks for select to authenticated using (
  public.is_admin() or public.is_project_member(project_id) or (visible_to_client and public.is_project_client(project_id))
);
create policy "staff manage tasks" on public.tasks for all to authenticated using (public.is_admin() or public.is_project_member(project_id)) with check (public.is_admin() or public.is_project_member(project_id));

create policy "related users view assignees" on public.task_assignees for select to authenticated using (
  public.is_admin() or exists (select 1 from public.tasks t where t.id = task_assignees.task_id and (public.is_project_member(t.project_id) or (t.visible_to_client and public.is_project_client(t.project_id))))
);
create policy "staff manage assignees" on public.task_assignees for all to authenticated using (
  public.is_admin() or exists (select 1 from public.tasks t where t.id = task_assignees.task_id and public.is_project_member(t.project_id))
) with check (
  public.is_admin() or exists (select 1 from public.tasks t where t.id = task_assignees.task_id and public.is_project_member(t.project_id))
);

create policy "related users view comments" on public.task_comments for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.tasks t where t.id = task_comments.task_id
    and (public.is_project_member(t.project_id) or (not task_comments.is_internal and t.visible_to_client and public.is_project_client(t.project_id)))
  )
);
create policy "related users create comments" on public.task_comments for insert to authenticated with check (
  user_id = auth.uid() and exists (
    select 1 from public.tasks t where t.id = task_comments.task_id
    and (public.is_admin() or public.is_project_member(t.project_id) or (not task_comments.is_internal and t.visible_to_client and public.is_project_client(t.project_id)))
  )
);
create policy "authors update comments" on public.task_comments for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "related users view activities" on public.task_activities for select to authenticated using (public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id));

create policy "related users view meetings" on public.meetings for select to authenticated using (public.is_admin() or public.is_project_member(project_id) or (visible_to_client and public.is_project_client(project_id)));
create policy "staff manage meetings" on public.meetings for all to authenticated using (public.is_admin() or public.is_project_member(project_id)) with check (public.is_admin() or public.is_project_member(project_id));

create policy "related users view budgets" on public.budgets for select to authenticated using (public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id));
create policy "staff manage budgets" on public.budgets for all to authenticated using (public.is_admin() or public.is_project_member(project_id)) with check (public.is_admin() or public.is_project_member(project_id));

create policy "related users view budget items" on public.budget_items for select to authenticated using (
  exists (select 1 from public.budgets b where b.id = budget_items.budget_id and (public.is_admin() or public.is_project_member(b.project_id) or (budget_items.visible_to_client and public.is_project_client(b.project_id))))
);
create policy "staff manage budget items" on public.budget_items for all to authenticated using (
  exists (select 1 from public.budgets b where b.id = budget_items.budget_id and (public.is_admin() or public.is_project_member(b.project_id)))
) with check (
  exists (select 1 from public.budgets b where b.id = budget_items.budget_id and (public.is_admin() or public.is_project_member(b.project_id)))
);

create policy "related users view vendors" on public.vendors for select to authenticated using (public.is_admin() or public.is_project_member(project_id) or (visible_to_client and public.is_project_client(project_id)));
create policy "staff manage vendors" on public.vendors for all to authenticated using (public.is_admin() or public.is_project_member(project_id)) with check (public.is_admin() or public.is_project_member(project_id));

create policy "related users view guests" on public.guests for select to authenticated using (public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id));
create policy "related users manage guests" on public.guests for all to authenticated using (public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id)) with check (public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id));

create policy "related users view files" on public.files for select to authenticated using (
  public.is_admin() or (project_id is not null and public.is_project_member(project_id)) or (visible_to_client and project_id is not null and public.is_project_client(project_id))
);
create policy "related users upload files" on public.files for insert to authenticated with check (
  uploaded_by = auth.uid() and project_id is not null and (public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id))
);
create policy "staff manage files" on public.files for update to authenticated using (public.is_admin() or (project_id is not null and public.is_project_member(project_id))) with check (public.is_admin() or (project_id is not null and public.is_project_member(project_id)));
create policy "staff delete files" on public.files for delete to authenticated using (public.is_admin() or (project_id is not null and public.is_project_member(project_id)));

create policy "public views active pricelist" on public.pricelists for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins manage pricelist" on public.pricelists for all to authenticated using (public.is_admin()) with check (public.is_admin());

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','leads','clients','projects','project_members','tasks','task_assignees','task_comments','task_activities','meetings','budgets','budget_items','vendors','guests','files','pricelists']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
  end loop;
end $$;
grant insert on public.leads to anon;
grant select on public.pricelists to anon;
grant select on public.project_progress to authenticated;
grant execute on function public.set_task_completion(uuid, boolean) to authenticated;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger leads_updated_at before update on public.leads for each row execute function public.set_updated_at();
create trigger clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger task_comments_updated_at before update on public.task_comments for each row execute function public.set_updated_at();
create trigger meetings_updated_at before update on public.meetings for each row execute function public.set_updated_at();
create trigger budgets_updated_at before update on public.budgets for each row execute function public.set_updated_at();
create trigger budget_items_updated_at before update on public.budget_items for each row execute function public.set_updated_at();
create trigger vendors_updated_at before update on public.vendors for each row execute function public.set_updated_at();
create trigger guests_updated_at before update on public.guests for each row execute function public.set_updated_at();
create trigger pricelists_updated_at before update on public.pricelists for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('project-files', 'project-files', false), ('pricelists', 'pricelists', true)
on conflict (id) do nothing;

create policy "public avatar and pricelist reads" on storage.objects for select to anon, authenticated using (bucket_id in ('avatars', 'pricelists'));
create policy "authenticated project file reads" on storage.objects for select to authenticated using (bucket_id = 'project-files');
create policy "authenticated project file uploads" on storage.objects for insert to authenticated with check (bucket_id = 'project-files' and owner_id = auth.uid()::text);
create policy "owners update project files" on storage.objects for update to authenticated using (bucket_id = 'project-files' and owner_id = auth.uid()::text);
create policy "owners delete project files" on storage.objects for delete to authenticated using (bucket_id = 'project-files' and owner_id = auth.uid()::text);
