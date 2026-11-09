-- Split the ambiguous USB data cable into USB-B and Micro-USB rows.
-- Clarify the motion-alarm parts, and withhold project 18 from new users.
-- Does not delete or rewrite inventory_items or user_projects.
-- Does not convert an existing usb-data-cable inventory row into either plug.
-- Does not change BOM quantities or circuit designs.
--
-- project_steps.blocks is jsonb. PostgreSQL does not keep the compact text
-- form "id":"usb-data-cable", and it does not keep object key order, so these
-- updates walk the StepBlock objects. Cable ids live on components.items.
-- The 220 ohm picture lives on that parts item (id resistor-220) and on wiring
-- nodes (id resistor, name beginning 220). The supply and mains-lead pictures
-- live on their own component ids. A wiring node id psu is included only while
-- its picture is still the battery drawing.

create or replace function pg_temp.expected_usb_slug(project_slug text)
returns text
language sql
immutable
as $$
  select case
    when project_slug in ('8', '18', '25') then 'usb-b-data-cable'
    when project_slug in ('23', '24') then 'usb-micro-b-data-cable'
  end
$$;

create or replace function pg_temp.patch_catalogue_block(block jsonb, project_slug text)
returns jsonb
language plpgsql
as $$
declare
  patched jsonb;
  key text;
  value jsonb;
  element jsonb;
  item_id text;
  item_name text;
  item_art text;
begin
  if block is null or jsonb_typeof(block) = 'null' then
    return block;
  end if;

  if jsonb_typeof(block) = 'array' then
    patched := '[]'::jsonb;
    for element in
      select entry.value
      from jsonb_array_elements(block) with ordinality as entry(value, ordinality)
      order by entry.ordinality
    loop
      patched := patched || jsonb_build_array(pg_temp.patch_catalogue_block(element, project_slug));
    end loop;
    return patched;
  end if;

  if jsonb_typeof(block) <> 'object' then
    return block;
  end if;

  patched := '{}'::jsonb;
  for key, value in select * from jsonb_each(block)
  loop
    if jsonb_typeof(value) in ('object', 'array') then
      patched := patched || jsonb_build_object(key, pg_temp.patch_catalogue_block(value, project_slug));
    else
      patched := patched || jsonb_build_object(key, value);
    end if;
  end loop;

  item_id := patched->>'id';
  item_name := patched->>'name';
  item_art := patched->>'illustrationId';

  if item_id = 'usb-data-cable' and project_slug in ('8', '18', '25') then
    patched := jsonb_set(patched, '{id}', to_jsonb('usb-b-data-cable'::text));
    if item_name = 'USB data cable' then
      patched := jsonb_set(patched, '{name}', to_jsonb('USB-B data cable'::text));
    end if;
  elsif item_id = 'usb-data-cable' and project_slug in ('23', '24') then
    patched := jsonb_set(patched, '{id}', to_jsonb('usb-micro-b-data-cable'::text));
    if item_name = 'USB data cable' then
      patched := jsonb_set(patched, '{name}', to_jsonb('Micro-USB data cable'::text));
    end if;
  elsif item_id = 'usb-b-data-cable' and project_slug in ('8', '18', '25') and item_name = 'USB data cable' then
    patched := jsonb_set(patched, '{name}', to_jsonb('USB-B data cable'::text));
  elsif item_id = 'usb-micro-b-data-cable' and project_slug in ('23', '24') and item_name = 'USB data cable' then
    patched := jsonb_set(patched, '{name}', to_jsonb('Micro-USB data cable'::text));
  end if;

  if project_slug = '8'
     and item_art = 'resistor'
     and (
       item_id = 'resistor-220'
       or (item_id = 'resistor' and item_name like '220%')
     ) then
    patched := jsonb_set(patched, '{illustrationId}', to_jsonb('resistor-band-220'::text));
  end if;

  if project_slug = '18' and item_art = 'battery' and item_id in ('gst18a05-p1j', 'psu') then
    patched := jsonb_set(patched, '{illustrationId}', to_jsonb('generic-module'::text));
  elsif project_slug = '18' and item_id = 'iec-c13-mains-lead' and item_art = 'usb-cable' then
    patched := jsonb_set(patched, '{illustrationId}', to_jsonb('generic-module'::text));
  end if;

  return patched;
end;
$$;

create or replace function pg_temp.catalogue_block_stale_count(block jsonb, project_slug text)
returns integer
language plpgsql
as $$
declare
  total integer := 0;
  child jsonb;
  item_id text;
  item_name text;
  item_art text;
begin
  if block is null or jsonb_typeof(block) not in ('object', 'array') then
    return 0;
  end if;

  if jsonb_typeof(block) = 'array' then
    for child in select entry.value from jsonb_array_elements(block) as entry(value)
    loop
      total := total + pg_temp.catalogue_block_stale_count(child, project_slug);
    end loop;
    return total;
  end if;

  item_id := block->>'id';
  item_name := block->>'name';
  item_art := block->>'illustrationId';

  if item_id = 'usb-data-cable' and project_slug in ('8', '18', '23', '24', '25') then
    total := total + 1;
  elsif item_name = 'USB data cable'
        and (
          (item_id = 'usb-b-data-cable' and project_slug in ('8', '18', '25'))
          or (item_id = 'usb-micro-b-data-cable' and project_slug in ('23', '24'))
        ) then
    total := total + 1;
  end if;

  if project_slug = '8'
     and item_art = 'resistor'
     and (
       item_id = 'resistor-220'
       or (item_id = 'resistor' and item_name like '220%')
     ) then
    total := total + 1;
  end if;

  if project_slug = '18' and item_art = 'battery' and item_id in ('gst18a05-p1j', 'psu') then
    total := total + 1;
  elsif project_slug = '18' and item_id = 'iec-c13-mains-lead' and item_art = 'usb-cable' then
    total := total + 1;
  end if;

  for child in
    select field.value
    from jsonb_each(block) as field(key, value)
    where jsonb_typeof(field.value) in ('object', 'array')
  loop
    total := total + pg_temp.catalogue_block_stale_count(child, project_slug);
  end loop;

  return total;
end;
$$;

drop table if exists pg_temp.catalogue_correction_guard;
create temporary table catalogue_correction_guard as
select
  (select count(*) from public.inventory_items) as inventory_count,
  (select coalesce(sum(quantity), 0) from public.inventory_items) as inventory_quantity,
  (
    select count(*)
    from public.inventory_items as item
    join public.components as component on component.id = item.component_id
    where component.slug = 'usb-data-cable'
  ) as legacy_inventory_count,
  (select count(*) from public.user_projects) as user_projects_count,
  (
    select count(*)
    from public.user_projects as progress
    join public.projects as project on project.id = progress.project_id
    where project.slug = '18'
  ) as project_18_progress_count;

drop table if exists pg_temp.catalogue_cable_lines;
create temporary table catalogue_cable_lines as
select
  project.slug as project_slug,
  line.id as line_id,
  line.quantity,
  component.slug as component_slug
from public.project_components as line
join public.projects as project on project.id = line.project_id
join public.components as component on component.id = line.component_id
where project.slug in ('8', '18', '23', '24', '25')
  and component.slug in ('usb-data-cable', 'usb-b-data-cable', 'usb-micro-b-data-cable');

do $$
declare
  missing_projects text;
  cable_problem text;
begin
  select string_agg(expected.slug, ', ' order by expected.slug)
  into missing_projects
  from (values ('8'), ('18'), ('23'), ('24'), ('25')) as expected(slug)
  where not exists (
    select 1 from public.projects as project where project.slug = expected.slug
  );

  if missing_projects is not null then
    raise exception 'USB cable migration missing projects: %', missing_projects;
  end if;

  select string_agg(
    line.project_slug || ' (' || line.component_slug || ' x' || line.row_count || ')',
    ', ' order by line.project_slug
  )
  into cable_problem
  from (
    select
      expected.slug as project_slug,
      coalesce(string_agg(distinct cable.component_slug, '+'), 'none') as component_slug,
      count(cable.line_id) as row_count
    from (values ('8'), ('18'), ('23'), ('24'), ('25')) as expected(slug)
    left join pg_temp.catalogue_cable_lines as cable on cable.project_slug = expected.slug
    group by expected.slug
  ) as line
  where line.row_count <> 1
     or line.component_slug not in (
       'usb-data-cable',
       pg_temp.expected_usb_slug(line.project_slug)
     );

  if cable_problem is not null then
    raise exception
      'Each of projects 8, 18, 23, 24, and 25 needs exactly one USB cable line, either the legacy cable or its replacement: %',
      cable_problem;
  end if;
end;
$$;

insert into public.components (name, category, description, slug)
values
  (
    'USB-B data cable',
    'modules',
    'USB-A to USB-B cable that carries data. Fits the Arduino Uno R3 USB-B socket. A phone-sized plug does not fit this socket, and a charge-only cable can power the board and still fail upload.',
    'usb-b-data-cable'
  ),
  (
    'Micro-USB data cable',
    'modules',
    'USB-A to Micro-USB cable that carries data. Fits the Espressif ESP32-DevKitC V4 Micro-USB socket. A USB-B cable does not fit this socket, and a USB-C cable does not fit it either.',
    'usb-micro-b-data-cable'
  )
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description;

update public.components
set
  name = 'USB data cable',
  description = 'A data-capable USB cable whose plug was not recorded. It does not count as a USB-B cable or a Micro-USB cable. Add the cable whose plug you can see.'
where slug = 'usb-data-cable';

update public.components
set description = 'HC-SR501-style module with a 2.54 mm male header. With the header along the bottom and the two trimmers along the top, the usual silk is VCC, OUT, GND. OUT is a 3.3 V digital signal and VCC is 5 V into the module regulator. Some boards print the opposite order, so match the silk and do not swap VCC and GND.'
where slug = 'pir-sensor';

update public.components
set description = 'Three-pin active buzzer module with a 2.54 mm male header. The usual order is VCC, I/O, GND, and it runs from 5 V. HIGH on I/O turns the sounder on. The module takes sounder current from VCC, so the GPIO is only the control pin. Match the silk if a board prints another order. A two-pin sounder is a different part.'
where slug = 'buzzer';

update public.components
set description = 'onsemi PN2222ABU, the bulk TO-92 formerly listed by Fairchild. Top mark PN2222A. The PN2222A Rev. 1.1.0 package sketch labels the leads E, B, C: flat face toward you and leads down, left to right is emitter, base, collector. A metal-can transistor with a similar marking, and some other TO-92 parts, use a different lead order. Absolute maximum collector current is 1 A. Used as a low-side switch.'
where slug = 'pn2222a';

do $$
declare
  clash text;
begin
  select string_agg(project.slug, ', ' order by project.slug)
  into clash
  from public.project_components as line
  join public.projects as project on project.id = line.project_id
  join public.components as current_part on current_part.id = line.component_id
  join public.components as replacement
    on replacement.slug = pg_temp.expected_usb_slug(project.slug)
  where current_part.slug = 'usb-data-cable'
    and project.slug in ('8', '18', '23', '24', '25')
    and exists (
      select 1
      from public.project_components as other
      where other.project_id = line.project_id
        and other.component_id = replacement.id
        and other.id <> line.id
    );

  if clash is not null then
    raise exception
      'Repointing the USB cable would duplicate project_components (project_id, component_id) for project %',
      clash;
  end if;
end;
$$;

update public.project_components as line
set component_id = replacement.id
from public.projects as project,
     public.components as current_part,
     public.components as replacement
where line.project_id = project.id
  and line.component_id = current_part.id
  and current_part.slug = 'usb-data-cable'
  and project.slug in ('8', '18', '23', '24', '25')
  and replacement.slug = pg_temp.expected_usb_slug(project.slug);

update public.project_steps as step
set blocks = pg_temp.patch_catalogue_block(step.blocks, project.slug)
from public.projects as project
where step.project_id = project.id
  and project.slug in ('8', '18', '23', '24', '25')
  and pg_temp.catalogue_block_stale_count(step.blocks, project.slug) > 0;

update public.projects
set is_published = false
where slug = '18'
  and is_published is distinct from false;

do $$
declare
  guard pg_temp.catalogue_correction_guard%rowtype;
  problem text;
  stale integer;
begin
  select * into guard from pg_temp.catalogue_correction_guard;

  if (
    select count(*) from public.inventory_items
  ) is distinct from guard.inventory_count
  or (
    select coalesce(sum(quantity), 0) from public.inventory_items
  ) is distinct from guard.inventory_quantity
  or (
    select count(*)
    from public.inventory_items as item
    join public.components as component on component.id = item.component_id
    where component.slug = 'usb-data-cable'
  ) is distinct from guard.legacy_inventory_count
  or (select count(*) from public.user_projects) is distinct from guard.user_projects_count
  or (
    select count(*)
    from public.user_projects as progress
    join public.projects as project on project.id = progress.project_id
    where project.slug = '18'
  ) is distinct from guard.project_18_progress_count then
    raise exception 'USB cable migration changed inventory_items or user_projects';
  end if;

  select string_agg(
    cable.project_slug || ' quantity ' || line.quantity || ' -> ' || component.slug,
    ', ' order by cable.project_slug
  )
  into problem
  from pg_temp.catalogue_cable_lines as cable
  join public.project_components as line on line.id = cable.line_id
  join public.components as component on component.id = line.component_id
  where line.quantity is distinct from cable.quantity
     or component.slug is distinct from pg_temp.expected_usb_slug(cable.project_slug);

  if problem is not null then
    raise exception 'USB cable lines were not repointed at the same quantity: %', problem;
  end if;

  select coalesce(sum(pg_temp.catalogue_block_stale_count(step.blocks, project.slug)), 0)
  into stale
  from public.project_steps as step
  join public.projects as project on project.id = step.project_id
  where project.slug in ('8', '18', '23', '24', '25');

  if stale <> 0 then
    raise exception 'Tutorial blocks still contain % stale USB or illustration references', stale;
  end if;

  if exists (
    select 1 from public.projects where slug = '18' and is_published is distinct from false
  ) then
    raise exception 'Project 18 is still published';
  end if;

  if (
    select count(*)
    from public.components
    where slug in ('usb-b-data-cable', 'usb-micro-b-data-cable')
  ) <> 2 then
    raise exception 'USB-B and Micro-USB catalogue rows were not both present';
  end if;
end;
$$;

drop function pg_temp.patch_catalogue_block(jsonb, text);
drop function pg_temp.catalogue_block_stale_count(jsonb, text);
drop function pg_temp.expected_usb_slug(text);
