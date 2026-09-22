-- Phase 3.3 authored project BOMs.
-- Creates public.project_components and seeds six truthful BOMs.
-- Does not copy COMPONENT_POOLS. Does not expand the component catalogue.
-- Does not create user_projects. Does not change is_published.
-- Does not modify components, inventory_items, profiles, or user_preferences.

-- ---------------------------------------------------------------------------
-- Fail loudly if any required catalogue slug is missing.
-- ---------------------------------------------------------------------------

do $$
declare
  missing text;
begin
  select string_agg(required.slug, ', ' order by required.slug)
  into missing
  from (
    values
      ('arduino-uno-r3'),
      ('bmp280'),
      ('breadboard'),
      ('buzzer'),
      ('dht22'),
      ('esp32'),
      ('jumper-wires'),
      ('ldr'),
      ('led'),
      ('oled-096'),
      ('pir-sensor'),
      ('resistor'),
      ('soil-moisture')
  ) as required(slug)
  where not exists (
    select 1 from public.components c where c.slug = required.slug
  );

  if missing is not null then
    raise exception 'Phase 3.3 missing catalogue slugs: %', missing;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- project_components
-- ---------------------------------------------------------------------------

create table public.project_components (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  component_id uuid not null references public.components (id) on delete restrict,
  quantity integer not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_components_quantity_check check (quantity >= 1),
  constraint project_components_project_id_component_id_key unique (project_id, component_id)
);

create index project_components_project_id_idx
  on public.project_components (project_id);

create index project_components_component_id_idx
  on public.project_components (component_id);

comment on table public.project_components is
  'Authored bill of materials for a catalogue project. One row per component; extra units use quantity.';

comment on column public.project_components.component_id is
  'FK to public.components.id. Identity is the catalogue UUID, not a display name.';

comment on column public.project_components.quantity is
  'Units required of this catalogue component. jumper-wires is a pack, so quantity 1 means one pack.';

create trigger project_components_set_updated_at
before update on public.project_components
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.project_components enable row level security;

create policy "Authenticated users can read BOM rows for published projects"
  on public.project_components for select to authenticated
  using (
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.projects p
      where p.id = project_components.project_id
        and p.is_published = true
    )
  );

grant select on public.project_components to authenticated;
revoke all on public.project_components from anon;

-- ---------------------------------------------------------------------------
-- Authored BOMs for projects 1, 4, 8, 11, 12, 14.
-- component_id is resolved from public.components.slug at insert time.
-- ---------------------------------------------------------------------------

insert into public.project_components (project_id, component_id, quantity, sort_order)
values
  -- 1 Smart Plant Monitor: soil + light + temperature with a local display
  (
    (select id from public.projects where slug = '1'),
    (select id from public.components where slug = 'arduino-uno-r3'),
    1,
    1
  ),
  (
    (select id from public.projects where slug = '1'),
    (select id from public.components where slug = 'soil-moisture'),
    1,
    2
  ),
  (
    (select id from public.projects where slug = '1'),
    (select id from public.components where slug = 'dht22'),
    1,
    3
  ),
  (
    (select id from public.projects where slug = '1'),
    (select id from public.components where slug = 'ldr'),
    1,
    4
  ),
  (
    (select id from public.projects where slug = '1'),
    (select id from public.components where slug = 'resistor'),
    1,
    5
  ),
  (
    (select id from public.projects where slug = '1'),
    (select id from public.components where slug = 'oled-096'),
    1,
    6
  ),
  (
    (select id from public.projects where slug = '1'),
    (select id from public.components where slug = 'breadboard'),
    1,
    7
  ),
  (
    (select id from public.projects where slug = '1'),
    (select id from public.components where slug = 'jumper-wires'),
    1,
    8
  ),

  -- 4 Weather Station: cloud temp/humidity/pressure on ESP32
  (
    (select id from public.projects where slug = '4'),
    (select id from public.components where slug = 'esp32'),
    1,
    1
  ),
  (
    (select id from public.projects where slug = '4'),
    (select id from public.components where slug = 'dht22'),
    1,
    2
  ),
  (
    (select id from public.projects where slug = '4'),
    (select id from public.components where slug = 'bmp280'),
    1,
    3
  ),
  (
    (select id from public.projects where slug = '4'),
    (select id from public.components where slug = 'breadboard'),
    1,
    4
  ),
  (
    (select id from public.projects where slug = '4'),
    (select id from public.components where slug = 'jumper-wires'),
    1,
    5
  ),

  -- 8 Motion Sensor Alarm: PIR triggers buzzer and LED
  (
    (select id from public.projects where slug = '8'),
    (select id from public.components where slug = 'arduino-uno-r3'),
    1,
    1
  ),
  (
    (select id from public.projects where slug = '8'),
    (select id from public.components where slug = 'pir-sensor'),
    1,
    2
  ),
  (
    (select id from public.projects where slug = '8'),
    (select id from public.components where slug = 'buzzer'),
    1,
    3
  ),
  (
    (select id from public.projects where slug = '8'),
    (select id from public.components where slug = 'led'),
    1,
    4
  ),
  (
    (select id from public.projects where slug = '8'),
    (select id from public.components where slug = 'resistor'),
    1,
    5
  ),
  (
    (select id from public.projects where slug = '8'),
    (select id from public.components where slug = 'breadboard'),
    1,
    6
  ),
  (
    (select id from public.projects where slug = '8'),
    (select id from public.components where slug = 'jumper-wires'),
    1,
    7
  ),

  -- 11 Blinking LED Starter
  (
    (select id from public.projects where slug = '11'),
    (select id from public.components where slug = 'arduino-uno-r3'),
    1,
    1
  ),
  (
    (select id from public.projects where slug = '11'),
    (select id from public.components where slug = 'led'),
    1,
    2
  ),
  (
    (select id from public.projects where slug = '11'),
    (select id from public.components where slug = 'resistor'),
    1,
    3
  ),
  (
    (select id from public.projects where slug = '11'),
    (select id from public.components where slug = 'breadboard'),
    1,
    4
  ),
  (
    (select id from public.projects where slug = '11'),
    (select id from public.components where slug = 'jumper-wires'),
    1,
    5
  ),

  -- 12 Traffic Light Simulator: three discrete LEDs
  (
    (select id from public.projects where slug = '12'),
    (select id from public.components where slug = 'arduino-uno-r3'),
    1,
    1
  ),
  (
    (select id from public.projects where slug = '12'),
    (select id from public.components where slug = 'led'),
    3,
    2
  ),
  (
    (select id from public.projects where slug = '12'),
    (select id from public.components where slug = 'resistor'),
    3,
    3
  ),
  (
    (select id from public.projects where slug = '12'),
    (select id from public.components where slug = 'breadboard'),
    1,
    4
  ),
  (
    (select id from public.projects where slug = '12'),
    (select id from public.components where slug = 'jumper-wires'),
    1,
    5
  ),

  -- 14 Light-Activated Night Lamp: LDR divider drives an LED
  (
    (select id from public.projects where slug = '14'),
    (select id from public.components where slug = 'arduino-uno-r3'),
    1,
    1
  ),
  (
    (select id from public.projects where slug = '14'),
    (select id from public.components where slug = 'ldr'),
    1,
    2
  ),
  (
    (select id from public.projects where slug = '14'),
    (select id from public.components where slug = 'led'),
    1,
    3
  ),
  (
    (select id from public.projects where slug = '14'),
    (select id from public.components where slug = 'resistor'),
    2,
    4
  ),
  (
    (select id from public.projects where slug = '14'),
    (select id from public.components where slug = 'breadboard'),
    1,
    5
  ),
  (
    (select id from public.projects where slug = '14'),
    (select id from public.components where slug = 'jumper-wires'),
    1,
    6
  )
on conflict (project_id, component_id) do update
set
  quantity = excluded.quantity,
  sort_order = excluded.sort_order;
