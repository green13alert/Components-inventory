-- Restore the ohm sign where its UTF-8 bytes had been stored as U+00CE U+00A9.
-- Does not change publication status, step order, or circuit content.

update public.project_steps
set
  title = replace(title, chr(206) || chr(169), chr(937)),
  description = replace(description, chr(206) || chr(169), chr(937)),
  tip = case
    when tip is null then null
    else replace(tip, chr(206) || chr(169), chr(937))
  end,
  stage_title = case
    when stage_title is null then null
    else replace(stage_title, chr(206) || chr(169), chr(937))
  end,
  blocks = replace(blocks::text, chr(206) || chr(169), chr(937))::jsonb
where strpos(title, chr(206) || chr(169)) > 0
   or strpos(description, chr(206) || chr(169)) > 0
   or strpos(coalesce(tip, ''), chr(206) || chr(169)) > 0
   or strpos(coalesce(stage_title, ''), chr(206) || chr(169)) > 0
   or strpos(blocks::text, chr(206) || chr(169)) > 0;

update public.projects
set
  title = replace(title, chr(206) || chr(169), chr(937)),
  description = replace(description, chr(206) || chr(169), chr(937)),
  overview = case
    when overview is null then null
    else replace(overview, chr(206) || chr(169), chr(937))
  end,
  learning_objectives = case
    when exists (
      select 1
      from unnest(coalesce(learning_objectives, array[]::text[])) as item
      where strpos(item, chr(206) || chr(169)) > 0
    )
    then (
      select array_agg(replaced order by ordinality)
      from (
        select replace(item, chr(206) || chr(169), chr(937)) as replaced, ordinality
        from unnest(learning_objectives) with ordinality as objective(item, ordinality)
      ) as corrected
    )
    else learning_objectives
  end
where strpos(title, chr(206) || chr(169)) > 0
   or strpos(description, chr(206) || chr(169)) > 0
   or strpos(coalesce(overview, ''), chr(206) || chr(169)) > 0
   or exists (
     select 1
     from unnest(coalesce(learning_objectives, array[]::text[])) as item
     where strpos(item, chr(206) || chr(169)) > 0
   );

update public.components
set
  name = replace(name, chr(206) || chr(169), chr(937)),
  description = case
    when description is null then null
    else replace(description, chr(206) || chr(169), chr(937))
  end
where strpos(name, chr(206) || chr(169)) > 0
   or strpos(coalesce(description, ''), chr(206) || chr(169)) > 0;
