-- Development preview of unpublished projects for explicitly listed accounts.
-- Does not change is_published. Does not grant draft access to ordinary users.
-- The service role is not used by the app.

create table public.draft_previewers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.draft_previewers enable row level security;

revoke all on public.draft_previewers from anon, authenticated;

comment on table public.draft_previewers is
  'Accounts allowed to read unpublished catalogue projects. Rows are added by a database owner, not by the app.';

create or replace function public.can_preview_unpublished_projects()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.draft_previewers
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.can_preview_unpublished_projects() from public, anon;
grant execute on function public.can_preview_unpublished_projects() to authenticated;

comment on function public.can_preview_unpublished_projects() is
  'True only when the signed-in user is listed in draft_previewers.';

-- A project with a single profile is this app's only account. Grant that account.
-- More than one profile grants nobody automatically.
insert into public.draft_previewers (user_id)
select p.id
from public.profiles p
where (select count(*) from public.profiles) = 1
on conflict (user_id) do nothing;

create policy "Draft previewers can read unpublished projects"
  on public.projects for select to authenticated
  using (
    is_published = false
    and (select public.can_preview_unpublished_projects())
  );

create policy "Draft previewers can read unpublished project components"
  on public.project_components for select to authenticated
  using (
    (select public.can_preview_unpublished_projects())
    and exists (
      select 1
      from public.projects p
      where p.id = project_components.project_id
        and p.is_published = false
    )
  );

create policy "Draft previewers can read unpublished project steps"
  on public.project_steps for select to authenticated
  using (
    (select public.can_preview_unpublished_projects())
    and exists (
      select 1
      from public.projects p
      where p.id = project_steps.project_id
        and p.is_published = false
    )
  );

create policy "Draft previewers can read unpublished project requirements"
  on public.project_requirements for select to authenticated
  using (
    (select public.can_preview_unpublished_projects())
    and exists (
      select 1
      from public.projects p
      where p.id = project_requirements.project_id
        and p.is_published = false
    )
  );

create policy "Draft previewers can read unpublished requirement constraints"
  on public.project_requirement_constraints for select to authenticated
  using (
    (select public.can_preview_unpublished_projects())
    and exists (
      select 1
      from public.project_requirements r
      join public.projects p on p.id = r.project_id
      where r.id = project_requirement_constraints.requirement_id
        and p.is_published = false
    )
  );

create policy "Draft previewers can read unpublished requirement pin roles"
  on public.project_requirement_pin_roles for select to authenticated
  using (
    (select public.can_preview_unpublished_projects())
    and exists (
      select 1
      from public.project_requirements r
      join public.projects p on p.id = r.project_id
      where r.id = project_requirement_pin_roles.requirement_id
        and p.is_published = false
    )
  );

create policy "Draft previewers can read unpublished substitution reviews"
  on public.requirement_substitution_reviews for select to authenticated
  using (
    (select public.can_preview_unpublished_projects())
    and exists (
      select 1
      from public.project_requirements r
      join public.projects p on p.id = r.project_id
      where r.id = requirement_substitution_reviews.requirement_id
        and p.is_published = false
    )
  );

create policy "Draft previewers can read unpublished substitution changes"
  on public.substitution_review_changes for select to authenticated
  using (
    (select public.can_preview_unpublished_projects())
    and exists (
      select 1
      from public.requirement_substitution_reviews review
      join public.project_requirements r on r.id = review.requirement_id
      join public.projects p on p.id = r.project_id
      where review.id = substitution_review_changes.review_id
        and p.is_published = false
    )
  );
