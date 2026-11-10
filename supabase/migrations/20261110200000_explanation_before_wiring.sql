-- Move the three Project 8 component explanations to sit after the
-- introductory text and before the wiring diagram.
-- The other nine explanations already follow the concept they teach.
-- Moves the existing JSON objects. Does not add copies or edit their text.
-- One statement, so the Supabase SQL Editor commits or rolls the reorder together.
-- Does not change step rows, step ids, is_published, inventory, user progress,
-- learning objectives, BOMs, circuits, or firmware.
-- Not applied by this repository change. Apply it to the intended database yourself.

do $migration$
declare
  placement record;
  step_id uuid;
  original jsonb;
  cleaned jsonb;
  result jsonb;
  note jsonb;
  element jsonb;
  note_count integer;
  anchor integer;
  seen integer;
  index integer;
  step_count integer;
  explanation_index integer;
  previous jsonb;
  following jsonb;
  matches integer;
begin
  drop table if exists pg_temp.explanation_placements;

  create temporary table explanation_placements (
    project_slug text not null,
    step_title text not null,
    explanation_title text not null,
    anchor_type text not null,
    anchor_heading text not null,
    following_type text not null
  ) on commit drop;

  insert into explanation_placements (
    project_slug,
    step_title,
    explanation_title,
    anchor_type,
    anchor_heading,
    following_type
  )
  values
    ('8', 'Connect the PIR Motion Sensor', 'How does a PIR sensor work?', 'text', 'What you are wiring', 'wiring'),
    ('8', 'Connect the LED', 'Why does the LED need a resistor?', 'text', 'Polarity and current limit', 'wiring'),
    ('8', 'Connect the Buzzer', 'How does an active buzzer work?', 'text', 'Three-pin active module', 'wiring');

  if (select count(*) from explanation_placements) <> 3 then
    raise exception 'Expected 3 explanation placements.';
  end if;

  for placement in
    select * from explanation_placements order by step_title
  loop
    select count(*)
    into step_count
    from public.project_steps as step
    join public.projects as project on project.id = step.project_id
    where project.slug = placement.project_slug
      and step.title = placement.step_title;

    if step_count <> 1 then
      raise exception
        'Explanation step was not found once: % / % (% rows)',
        placement.project_slug,
        placement.step_title,
        step_count;
    end if;

    select step.id, step.blocks
    into step_id, original
    from public.project_steps as step
    join public.projects as project on project.id = step.project_id
    where project.slug = placement.project_slug
      and step.title = placement.step_title;

    note := null;
    note_count := 0;
    cleaned := '[]'::jsonb;

    for element in
      select value from jsonb_array_elements(original) as block(value)
    loop
      if element->>'type' = 'explanation' and element->>'title' = placement.explanation_title then
        note := element;
        note_count := note_count + 1;
      else
        cleaned := cleaned || jsonb_build_array(element);
      end if;
    end loop;

    if note_count <> 1 or note is null then
      raise exception
        'Expected one explanation "%" on % / %, found %',
        placement.explanation_title,
        placement.project_slug,
        placement.step_title,
        note_count;
    end if;

    anchor := null;
    seen := 0;

    for index in 0 .. jsonb_array_length(cleaned) - 1 loop
      element := cleaned -> index;
      if element->>'type' = placement.anchor_type
         and element->>'heading' = placement.anchor_heading then
        seen := seen + 1;
        if seen = 1 then
          anchor := index;
          exit;
        end if;
      end if;
    end loop;

    if anchor is null then
      raise exception
        'Anchor for "%" was not found on % / %',
        placement.explanation_title,
        placement.project_slug,
        placement.step_title;
    end if;

    result := '[]'::jsonb;
    for index in 0 .. jsonb_array_length(cleaned) - 1 loop
      result := result || jsonb_build_array(cleaned -> index);
      if index = anchor then
        result := result || jsonb_build_array(note);
      end if;
    end loop;

    if jsonb_array_length(result) <> jsonb_array_length(original) then
      raise exception 'Reordering "%" changed the block count.', placement.explanation_title;
    end if;

    update public.project_steps
    set blocks = result
    where id = step_id;
  end loop;

  for placement in
    select * from explanation_placements order by step_title
  loop
    select step.blocks
    into original
    from public.project_steps as step
    join public.projects as project on project.id = step.project_id
    where project.slug = placement.project_slug
      and step.title = placement.step_title;

    select count(*)
    into matches
    from jsonb_array_elements(original) as block(value)
    where value->>'type' = 'explanation'
      and value->>'title' = placement.explanation_title;

    if matches <> 1 then
      raise exception
        'Explanation "%" is present % times after reordering.',
        placement.explanation_title,
        matches;
    end if;

    explanation_index := null;
    for index in 0 .. jsonb_array_length(original) - 1 loop
      element := original -> index;
      if element->>'type' = 'explanation' and element->>'title' = placement.explanation_title then
        explanation_index := index;
        exit;
      end if;
    end loop;

    if explanation_index is null or explanation_index = 0
       or explanation_index >= jsonb_array_length(original) - 1 then
      raise exception 'Explanation "%" is not between its introduction and its diagram.', placement.explanation_title;
    end if;

    previous := original -> (explanation_index - 1);
    following := original -> (explanation_index + 1);
    if previous->>'type' is distinct from placement.anchor_type
       or previous->>'heading' is distinct from placement.anchor_heading
       or following->>'type' is distinct from placement.following_type then
      raise exception
        'Explanation "%" is not immediately after "%" and before the % block.',
        placement.explanation_title,
        placement.anchor_heading,
        placement.following_type;
    end if;
  end loop;

  drop table if exists pg_temp.explanation_placements;
end;
$migration$;
