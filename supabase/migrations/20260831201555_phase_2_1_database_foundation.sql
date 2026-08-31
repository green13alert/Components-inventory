-- Phase 2.1 database foundation: profiles, component catalogue, inventory, scan records.
-- Does not create projects, chat, notifications, or auth UI.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  skill_level text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_skill_level_check
    check (skill_level in ('beginner', 'intermediate', 'advanced'))
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

comment on table public.profiles is
  'Solderi-specific data for an authenticated user. Identity fields live in auth.users.';

-- ---------------------------------------------------------------------------
-- 2. components (shared catalogue)
-- ---------------------------------------------------------------------------

create table public.components (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  image_url text,
  manufacturer text,
  part_number text,
  created_at timestamptz not null default now()
);

create index components_category_idx on public.components (category);
create index components_name_idx on public.components (name);

comment on table public.components is
  'Master catalogue of electronic components. Shared Solderi data, not user-owned.';

-- ---------------------------------------------------------------------------
-- 3. inventory_items
-- ---------------------------------------------------------------------------

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  component_id uuid not null references public.components (id) on delete restrict,
  quantity integer not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_items_quantity_check check (quantity >= 0),
  constraint inventory_items_user_id_component_id_key unique (user_id, component_id)
);

create index inventory_items_component_id_idx on public.inventory_items (component_id);

create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row
execute function public.set_updated_at();

comment on table public.inventory_items is
  'Components owned by a specific user, with quantity.';

-- ---------------------------------------------------------------------------
-- 4. inventory_scans
-- ---------------------------------------------------------------------------

create table public.inventory_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  status text not null default 'processing',
  created_at timestamptz not null default now(),
  constraint inventory_scans_status_check
    check (status in ('processing', 'completed', 'failed'))
);

create index inventory_scans_user_id_created_at_idx
  on public.inventory_scans (user_id, created_at desc);
create index inventory_scans_status_idx
  on public.inventory_scans (status);

comment on table public.inventory_scans is
  'User photo scans of component collections. AI recognition is not implemented yet.';

-- ---------------------------------------------------------------------------
-- 5. inventory_scan_results
-- ---------------------------------------------------------------------------

create table public.inventory_scan_results (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.inventory_scans (id) on delete cascade,
  component_id uuid not null references public.components (id) on delete restrict,
  quantity integer not null,
  confidence numeric not null,
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint inventory_scan_results_quantity_check check (quantity >= 0),
  constraint inventory_scan_results_confidence_check
    check (confidence >= 0 and confidence <= 1)
);

create index inventory_scan_results_scan_id_idx
  on public.inventory_scan_results (scan_id);
create index inventory_scan_results_component_id_idx
  on public.inventory_scan_results (component_id);

comment on table public.inventory_scan_results is
  'Components identified on an inventory scan. Data structure only; no AI pipeline yet.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.components enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_scans enable row level security;
alter table public.inventory_scan_results enable row level security;

-- profiles: owner-only
create policy "Users can select their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users can delete their own profile"
  on public.profiles for delete to authenticated
  using (id = (select auth.uid()));

-- components: authenticated read-only (writes via service role / dashboard only)
create policy "Authenticated users can read components"
  on public.components for select to authenticated
  using (true);

-- inventory_items: owner-only
create policy "Users can select their own inventory items"
  on public.inventory_items for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own inventory items"
  on public.inventory_items for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own inventory items"
  on public.inventory_items for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own inventory items"
  on public.inventory_items for delete to authenticated
  using (user_id = (select auth.uid()));

-- inventory_scans: owner-only
create policy "Users can select their own inventory scans"
  on public.inventory_scans for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own inventory scans"
  on public.inventory_scans for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own inventory scans"
  on public.inventory_scans for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own inventory scans"
  on public.inventory_scans for delete to authenticated
  using (user_id = (select auth.uid()));

-- inventory_scan_results: only via owning scan (no extra user_id column)
create policy "Users can select results of their own scans"
  on public.inventory_scan_results for select to authenticated
  using (
    exists (
      select 1
      from public.inventory_scans s
      where s.id = inventory_scan_results.scan_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "Users can insert results on their own scans"
  on public.inventory_scan_results for insert to authenticated
  with check (
    exists (
      select 1
      from public.inventory_scans s
      where s.id = inventory_scan_results.scan_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "Users can update results of their own scans"
  on public.inventory_scan_results for update to authenticated
  using (
    exists (
      select 1
      from public.inventory_scans s
      where s.id = inventory_scan_results.scan_id
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.inventory_scans s
      where s.id = inventory_scan_results.scan_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "Users can delete results of their own scans"
  on public.inventory_scan_results for delete to authenticated
  using (
    exists (
      select 1
      from public.inventory_scans s
      where s.id = inventory_scan_results.scan_id
        and s.user_id = (select auth.uid())
    )
  );

-- Privileges: authenticated gets only what RLS allows; anon gets nothing.
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.components to authenticated;
grant select, insert, update, delete on public.inventory_items to authenticated;
grant select, insert, update, delete on public.inventory_scans to authenticated;
grant select, insert, update, delete on public.inventory_scan_results to authenticated;

revoke all on public.profiles from anon;
revoke all on public.components from anon;
revoke all on public.inventory_items from anon;
revoke all on public.inventory_scans from anon;
revoke all on public.inventory_scan_results from anon;
