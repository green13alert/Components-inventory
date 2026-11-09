-- First-time tutorial step completions for the Home build-activity chart.
-- One row per user, project, and step. Later visits and project resets do not remove it.
-- Does not change user_projects, projects.is_published, or existing progress rows.

-- ---------------------------------------------------------------------------
-- user_project_step_completions
-- ---------------------------------------------------------------------------

create table public.user_project_step_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  step_index integer not null,
  completed_at timestamptz not null default now(),
  constraint user_project_step_completions_step_index_check check (step_index >= 0),
  constraint user_project_step_completions_user_project_step_key unique (user_id, project_id, step_index)
);

create index user_project_step_completions_user_completed_at_idx
  on public.user_project_step_completions (user_id, completed_at desc);

comment on table public.user_project_step_completions is
  'Permanent first completion of a tutorial step. The row is not a resume position and is not removed when a project is reset.';

comment on column public.user_project_step_completions.step_index is
  '0-based walkthrough step, matching user_projects.current_step.';

comment on column public.user_project_step_completions.completed_at is
  'Database time of the first completion. Clients do not set or edit it.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.user_project_step_completions enable row level security;

create policy "Users can select their own step completions"
  on public.user_project_step_completions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own step completions"
  on public.user_project_step_completions for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Table-level INSERT would let a signed-in user supply id or completed_at.
-- Revoke it first, then grant insert on the three client columns only.
revoke all on table public.user_project_step_completions from public, anon, authenticated;
grant select on table public.user_project_step_completions to authenticated;
grant insert (user_id, project_id, step_index)
  on table public.user_project_step_completions to authenticated;
revoke insert (id, completed_at)
  on table public.user_project_step_completions from public, anon, authenticated;
revoke update, delete on table public.user_project_step_completions from public, anon, authenticated;
