-- Phase 3.6 persistent user project state.
-- Creates public.user_projects for favourites, start/continue, current step, and completion.
-- Does not create project_steps. Does not migrate walkthrough content.
-- Does not modify projects, project_components, components, inventory_items, or their RLS.

-- ---------------------------------------------------------------------------
-- user_projects
-- ---------------------------------------------------------------------------

create table public.user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  is_favourite boolean not null default false,
  started_at timestamptz null,
  current_step integer not null default 0,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_projects_user_id_project_id_key unique (user_id, project_id),
  constraint user_projects_current_step_check check (current_step >= 0)
);

create index user_projects_user_id_updated_at_idx
  on public.user_projects (user_id, updated_at desc);

create index user_projects_project_id_idx
  on public.user_projects (project_id);

create trigger user_projects_set_updated_at
before update on public.user_projects
for each row
execute function public.set_updated_at();

comment on table public.user_projects is
  'Per-user project state: favourites, started/continued builds, walkthrough step, and completion. One row per user per project.';

comment on column public.user_projects.is_favourite is
  'User bookmark. Favouriting does not start the project.';

comment on column public.user_projects.started_at is
  'When the user first started building. Null if the row exists only as a favourite.';

comment on column public.user_projects.current_step is
  '0-based walkthrough step the user should resume at. Progress percent is derived in the app.';

comment on column public.user_projects.completed_at is
  'Completion timestamp. A project is completed when this is not null. There is no separate completed boolean.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.user_projects enable row level security;

create policy "Users can select their own project state"
  on public.user_projects for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own project state"
  on public.user_projects for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own project state"
  on public.user_projects for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own project state"
  on public.user_projects for delete to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.user_projects to authenticated;
revoke all on public.user_projects from anon;
