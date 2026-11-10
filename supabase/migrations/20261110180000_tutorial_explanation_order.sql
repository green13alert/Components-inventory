-- Move each optional explanation to sit after the block it explains.
-- The notes already exist. This does not append copies or edit their text.
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
  matches integer;
begin
  drop table if exists pg_temp.explanation_placements;

  create temporary table explanation_placements (
    project_slug text not null,
    step_title text not null,
    explanation_title text not null,
    anchor_type text not null,
    anchor_heading text,
    anchor_occurrence integer not null
  ) on commit drop;

  insert into explanation_placements (
    project_slug,
    step_title,
    explanation_title,
    anchor_type,
    anchor_heading,
    anchor_occurrence
  )
  values
    ('8', 'Connect the PIR Motion Sensor', 'How does a PIR sensor work?', 'connections', null, 1),
    ('8', 'Connect the LED', 'Why does the LED need a resistor?', 'connections', null, 1),
    ('8', 'Connect the Buzzer', 'How does an active buzzer work?', 'connections', null, 1),
    ('18', 'Control the Pan Servo', 'How does servo control work?', 'code_explanation', null, 1),
    ('23', 'Confirm the BME280 pin labels', 'How does I²C communication work?', 'text', 'I2C pins and address', 1),
    ('23', 'Serve the page and the JSON endpoint', 'How does the page get new readings?', 'code_explanation', null, 1),
    ('24', 'Confirm the LED is common anode', 'Why can the colours look different?', 'text', 'Find the leads', 1),
    ('24', 'Know the transistors and the resistors', 'Why a transistor and two resistors?', 'text', 'Why each resistor is there', 1),
    ('25', 'Identify the LED Matrix and Joystick', 'How does the MAX7219 light the grid?', 'text', 'FC-16 matrix', 1),
    ('25', 'Read Joystick Movement', 'Why does the joystick need a deadzone?', 'code_explanation', null, 1),
    ('25', 'Move and Draw the Player', 'Why does the game use millis()?', 'code', null, 1),
    ('25', 'Add Level Completion and Timing', 'Why is the button debounced?', 'code', null, 2);

  if (select count(*) from explanation_placements) <> 12 then
    raise exception 'Expected 12 explanation placements.';
  end if;

  for placement in
    select * from explanation_placements order by project_slug, step_title
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
         and (placement.anchor_heading is null or element->>'heading' = placement.anchor_heading) then
        seen := seen + 1;
        if seen = placement.anchor_occurrence then
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
    select * from explanation_placements order by project_slug, step_title
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

    if explanation_index is null or explanation_index = 0 then
      raise exception 'Explanation "%" has no block before it.', placement.explanation_title;
    end if;

    previous := original -> (explanation_index - 1);
    if previous->>'type' is distinct from placement.anchor_type
       or (
         placement.anchor_heading is not null
         and previous->>'heading' is distinct from placement.anchor_heading
       ) then
      raise exception
        'Explanation "%" is not immediately after its anchor.',
        placement.explanation_title;
    end if;

    seen := 0;
    for index in 0 .. explanation_index - 1 loop
      element := original -> index;
      if element->>'type' = placement.anchor_type
         and (placement.anchor_heading is null or element->>'heading' = placement.anchor_heading) then
        seen := seen + 1;
      end if;
    end loop;

    if seen <> placement.anchor_occurrence then
      raise exception
        'Explanation "%" is not after anchor occurrence %.',
        placement.explanation_title,
        placement.anchor_occurrence;
    end if;
  end loop;

  drop table if exists pg_temp.explanation_placements;
end;
$migration$;
