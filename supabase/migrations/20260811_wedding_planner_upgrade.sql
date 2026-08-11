-- Upgrade an existing Brides Beloved database to the wedding planner schema.
-- Safe for existing data: this migration only adds/replaces compatible objects.
-- Do NOT run supabase/schema.sql before this migration on an existing database.

create extension if not exists pgcrypto;

do $$ begin
  create type public.guest_status as enum ('invited', 'confirmed', 'declined', 'attended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('planned', 'pending', 'paid', 'cancelled');
exception when duplicate_object then null;
end $$;

alter table public.tasks
  add column if not exists client_can_complete boolean not null default false,
  add column if not exists completed_by uuid references public.profiles(id) on delete set null,
  add column if not exists completed_at timestamptz;

alter table public.task_assignees
  add column if not exists assigned_at timestamptz not null default now();

alter table public.task_comments
  add column if not exists updated_at timestamptz not null default now();

alter table public.files
  add column if not exists category text not null default 'general';

-- Existing client-visible checklist items should remain interactive after upgrade.
update public.tasks
set client_can_complete = true
where visible_to_client = true
  and client_can_complete = false;

create table if not exists public.task_activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.meetings (
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
  constraint meetings_date_order check (ends_at is null or ends_at >= starts_at)
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  currency text not null default 'IDR',
  target_amount numeric(16,2) not null default 0 check (target_amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budget_items (
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

create table if not exists public.vendors (
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

create table if not exists public.guests (
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

create index if not exists task_activities_project_created_idx on public.task_activities(project_id, created_at desc);
create index if not exists meetings_project_starts_idx on public.meetings(project_id, starts_at);
create index if not exists budget_items_budget_idx on public.budget_items(budget_id);
create index if not exists vendors_project_idx on public.vendors(project_id);
create index if not exists guests_project_status_idx on public.guests(project_id, status);
create index if not exists tasks_project_sort_idx on public.tasks(project_id, sort_order, due_date);

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

drop trigger if exists tasks_track_status on public.tasks;
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
  case
    when count(t.id) = 0 then 0
    else round(100.0 * count(t.id) filter (where t.status = 'completed') / count(t.id))::integer
  end as progress_percent,
  max(t.updated_at) as last_task_update
from public.projects p
left join public.tasks t on t.project_id = p.id
group by p.id, p.client_id;

alter table public.task_activities enable row level security;
alter table public.meetings enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_items enable row level security;
alter table public.vendors enable row level security;
alter table public.guests enable row level security;

drop policy if exists "profiles readable by related users" on public.profiles;
create policy "profiles readable by related users" on public.profiles for select to authenticated using (
  id = auth.uid() or public.is_admin()
  or exists (
    select 1 from public.project_members pm
    where pm.user_id = profiles.id
      and (public.is_project_member(pm.project_id) or public.is_project_client(pm.project_id))
  )
);

drop policy if exists "related users view activities" on public.task_activities;
create policy "related users view activities" on public.task_activities for select to authenticated using (
  public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id)
);

drop policy if exists "related users view meetings" on public.meetings;
create policy "related users view meetings" on public.meetings for select to authenticated using (
  public.is_admin() or public.is_project_member(project_id) or (visible_to_client and public.is_project_client(project_id))
);
drop policy if exists "staff manage meetings" on public.meetings;
create policy "staff manage meetings" on public.meetings for all to authenticated using (
  public.is_admin() or public.is_project_member(project_id)
) with check (
  public.is_admin() or public.is_project_member(project_id)
);

drop policy if exists "related users view budgets" on public.budgets;
create policy "related users view budgets" on public.budgets for select to authenticated using (
  public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id)
);
drop policy if exists "staff manage budgets" on public.budgets;
create policy "staff manage budgets" on public.budgets for all to authenticated using (
  public.is_admin() or public.is_project_member(project_id)
) with check (
  public.is_admin() or public.is_project_member(project_id)
);

drop policy if exists "related users view budget items" on public.budget_items;
create policy "related users view budget items" on public.budget_items for select to authenticated using (
  exists (
    select 1 from public.budgets b
    where b.id = budget_items.budget_id
      and (public.is_admin() or public.is_project_member(b.project_id) or (budget_items.visible_to_client and public.is_project_client(b.project_id)))
  )
);
drop policy if exists "staff manage budget items" on public.budget_items;
create policy "staff manage budget items" on public.budget_items for all to authenticated using (
  exists (select 1 from public.budgets b where b.id = budget_items.budget_id and (public.is_admin() or public.is_project_member(b.project_id)))
) with check (
  exists (select 1 from public.budgets b where b.id = budget_items.budget_id and (public.is_admin() or public.is_project_member(b.project_id)))
);

drop policy if exists "related users view vendors" on public.vendors;
create policy "related users view vendors" on public.vendors for select to authenticated using (
  public.is_admin() or public.is_project_member(project_id) or (visible_to_client and public.is_project_client(project_id))
);
drop policy if exists "staff manage vendors" on public.vendors;
create policy "staff manage vendors" on public.vendors for all to authenticated using (
  public.is_admin() or public.is_project_member(project_id)
) with check (
  public.is_admin() or public.is_project_member(project_id)
);

drop policy if exists "related users view guests" on public.guests;
create policy "related users view guests" on public.guests for select to authenticated using (
  public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id)
);
drop policy if exists "related users manage guests" on public.guests;
create policy "related users manage guests" on public.guests for all to authenticated using (
  public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id)
) with check (
  public.is_admin() or public.is_project_member(project_id) or public.is_project_client(project_id)
);

drop policy if exists "clients upload project files" on public.files;
create policy "clients upload project files" on public.files for insert to authenticated with check (
  uploaded_by = auth.uid()
  and project_id is not null
  and public.is_project_client(project_id)
);
drop policy if exists "clients delete own files" on public.files;
create policy "clients delete own files" on public.files for delete to authenticated using (
  uploaded_by = auth.uid()
  and project_id is not null
  and public.is_project_client(project_id)
);

grant select, insert, update, delete on public.task_activities to authenticated;
grant select, insert, update, delete on public.meetings to authenticated;
grant select, insert, update, delete on public.budgets to authenticated;
grant select, insert, update, delete on public.budget_items to authenticated;
grant select, insert, update, delete on public.vendors to authenticated;
grant select, insert, update, delete on public.guests to authenticated;
grant select on public.project_progress to authenticated;
grant execute on function public.set_task_completion(uuid, boolean) to authenticated;

drop trigger if exists task_comments_updated_at on public.task_comments;
create trigger task_comments_updated_at before update on public.task_comments for each row execute function public.set_updated_at();
drop trigger if exists meetings_updated_at on public.meetings;
create trigger meetings_updated_at before update on public.meetings for each row execute function public.set_updated_at();
drop trigger if exists budgets_updated_at on public.budgets;
create trigger budgets_updated_at before update on public.budgets for each row execute function public.set_updated_at();
drop trigger if exists budget_items_updated_at on public.budget_items;
create trigger budget_items_updated_at before update on public.budget_items for each row execute function public.set_updated_at();
drop trigger if exists vendors_updated_at on public.vendors;
create trigger vendors_updated_at before update on public.vendors for each row execute function public.set_updated_at();
drop trigger if exists guests_updated_at on public.guests;
create trigger guests_updated_at before update on public.guests for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

drop policy if exists "authenticated project file reads" on storage.objects;
create policy "authenticated project file reads" on storage.objects for select to authenticated using (
  bucket_id = 'project-files' and exists (
    select 1 from public.projects p
    where p.id::text = (storage.foldername(name))[1]
      and (public.is_admin() or public.is_project_member(p.id) or public.is_project_client(p.id))
  )
);
drop policy if exists "authenticated project file uploads" on storage.objects;
create policy "authenticated project file uploads" on storage.objects for insert to authenticated with check (
  bucket_id = 'project-files' and owner_id = auth.uid()::text and exists (
    select 1 from public.projects p
    where p.id::text = (storage.foldername(name))[1]
      and (public.is_admin() or public.is_project_member(p.id) or public.is_project_client(p.id))
  )
);
drop policy if exists "owners delete project files" on storage.objects;
create policy "owners delete project files" on storage.objects for delete to authenticated using (
  bucket_id = 'project-files' and owner_id = auth.uid()::text
);

-- Verification result: one row per project, including calculated progress.
select * from public.project_progress order by project_id;
