-- Component requirements foundation.
-- Adds capability, pin-profile, and project-requirement tables from
-- docs/COMPONENT_REQUIREMENTS_DESIGN.md.
-- Does not create walkthrough_variants.
-- Does not insert substitution reviews.
-- Does not modify components, inventory_items, project_components rows,
-- project_steps, or project publication.
-- Slug 11's microcontroller requirement is policy exact.
-- Mega pin rows are not seeded.

-- ---------------------------------------------------------------------------
-- Fail loudly if the canonical blink BOM line is missing.
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
      ('arduino-nano'),
      ('arduino-mega'),
      ('esp32'),
      ('esp8266'),
      ('raspberry-pi-pico')
  ) as required(slug)
  where not exists (
    select 1 from public.components c where c.slug = required.slug
  );

  if missing is not null then
    raise exception 'component requirements foundation missing catalogue slugs: %', missing;
  end if;

  if not exists (
    select 1
    from public.project_components pc
    join public.projects p on p.id = pc.project_id
    join public.components c on c.id = pc.component_id
    where p.slug = '11'
      and c.slug = 'arduino-uno-r3'
      and pc.quantity = 1
  ) then
    raise exception 'slug 11 is missing an Arduino Uno R3 BOM line with quantity 1';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Integrity helpers
-- ---------------------------------------------------------------------------

create or replace function public.project_requirements_project_matches_bom()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.project_components pc
    where pc.id = new.project_component_id
      and pc.project_id = new.project_id
  ) then
    raise exception 'project_requirements.project_id must match the BOM line project';
  end if;

  return new;
end;
$$;

create or replace function public.requirement_review_is_not_canonical()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.project_requirements r
    join public.project_components pc on pc.id = r.project_component_id
    where r.id = new.requirement_id
      and pc.component_id = new.component_id
  ) then
    raise exception 'a substitution review cannot target the canonical BOM component';
  end if;

  return new;
end;
$$;

create or replace function public.component_header_profile_matches_board()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.capability = 'header_profile' and not exists (
    select 1
    from public.pin_profiles profile
    where profile.id = new.value
      and profile.component_id = new.component_id
  ) then
    raise exception 'header_profile % does not belong to this component', new.value;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- component_capabilities
-- ---------------------------------------------------------------------------

create table public.component_capabilities (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components (id) on delete cascade,
  capability text not null,
  value text not null,
  created_at timestamptz not null default now(),
  constraint component_capabilities_capability_check
    check (capability in (
      'function',
      'logic_level_v',
      'supply_v',
      'gpio',
      'interface',
      'programming_environment',
      'board_package',
      'adc_full_scale',
      'resistance_ohms',
      'servo_kind',
      'physical_form',
      'header_profile'
    )),
  constraint component_capabilities_value_check
    check (char_length(value) between 1 and 64),
  constraint component_capabilities_gpio_value_check
    check (
      capability <> 'gpio'
      or value in ('digital_input', 'digital_output', 'pwm_output', 'analog_input')
    ),
  constraint component_capabilities_component_id_capability_value_key
    unique (component_id, capability, value)
);

create index component_capabilities_component_id_idx
  on public.component_capabilities (component_id);

create trigger component_capabilities_header_profile_matches_board
before insert or update on public.component_capabilities
for each row
execute function public.component_header_profile_matches_board();

comment on table public.component_capabilities is
  'Atomic capability facts for one catalogue component. A missing row means unknown. This is not a compatibility edge.';

comment on column public.component_capabilities.capability is
  'Closed capability key. supply_rail is a project constraint, not a component capability.';

comment on column public.component_capabilities.value is
  'One atomic token or integer-as-text. Multiple rows express a set, such as gpio.';

-- ---------------------------------------------------------------------------
-- pin_profiles
-- ---------------------------------------------------------------------------

create table public.pin_profiles (
  id text primary key,
  component_id uuid not null unique references public.components (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint pin_profiles_id_check
    check (char_length(id) between 1 and 64)
);

comment on table public.pin_profiles is
  'One header identity per development board. Not a statement that the board replaces another board.';

comment on column public.pin_profiles.component_id is
  'The catalogue board this header belongs to. One profile per component.';

-- ---------------------------------------------------------------------------
-- pin_profile_pins
-- ---------------------------------------------------------------------------

create table public.pin_profile_pins (
  id uuid primary key default gen_random_uuid(),
  pin_profile_id text not null references public.pin_profiles (id) on delete cascade,
  label text not null,
  pin_function text not null,
  constraint pin_profile_pins_label_check
    check (char_length(label) between 1 and 32),
  constraint pin_profile_pins_pin_function_check
    check (pin_function in (
      'digital_input',
      'digital_output',
      'pwm_output',
      'analog_input',
      'i2c_sda',
      'i2c_scl',
      'one_wire',
      'power',
      'ground'
    )),
  constraint pin_profile_pins_pin_profile_id_label_pin_function_key
    unique (pin_profile_id, label, pin_function)
);

create index pin_profile_pins_pin_profile_id_idx
  on public.pin_profile_pins (pin_profile_id);

comment on table public.pin_profile_pins is
  'Labels and functions that exist on one board header. Power and ground are representable. Mega pins are not seeded in this migration.';

-- ---------------------------------------------------------------------------
-- project_requirements
-- Quantity and the canonical component stay on project_components.
-- ---------------------------------------------------------------------------

create table public.project_requirements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  project_component_id uuid not null unique references public.project_components (id) on delete cascade,
  role text not null,
  substitution_policy text not null default 'exact',
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_requirements_role_check
    check (char_length(role) between 1 and 64),
  constraint project_requirements_substitution_policy_check
    check (substitution_policy in ('exact', 'direct', 'conditional')),
  constraint project_requirements_sort_order_check
    check (sort_order >= 0)
);

create index project_requirements_project_id_idx
  on public.project_requirements (project_id);

create trigger project_requirements_project_matches_bom
before insert or update on public.project_requirements
for each row
execute function public.project_requirements_project_matches_bom();

create trigger project_requirements_set_updated_at
before update on public.project_requirements
for each row
execute function public.set_updated_at();

comment on table public.project_requirements is
  'What one canonical BOM line requires. Policy exact uses only that BOM component. direct and conditional are ceilings for a later evaluator. No compatibility is granted by this table.';

comment on column public.project_requirements.project_component_id is
  'The canonical BOM line. Canonical component and quantity are project_components.component_id and project_components.quantity.';

comment on column public.project_requirements.substitution_policy is
  'exact: only the canonical component. direct: a substitute with no instruction change. conditional: a substitute only with an authored change list. Default exact.';

-- ---------------------------------------------------------------------------
-- project_requirement_constraints
-- ---------------------------------------------------------------------------

create table public.project_requirement_constraints (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.project_requirements (id) on delete cascade,
  capability text not null,
  value text not null,
  constraint project_requirement_constraints_capability_check
    check (capability in (
      'function',
      'logic_level_v',
      'supply_v',
      'gpio',
      'interface',
      'programming_environment',
      'board_package',
      'adc_full_scale',
      'resistance_ohms',
      'servo_kind',
      'physical_form',
      'header_profile',
      'supply_rail'
    )),
  constraint project_requirement_constraints_value_check
    check (char_length(value) between 1 and 64),
  constraint project_requirement_constraints_requirement_id_capability_value_key
    unique (requirement_id, capability, value)
);

create index project_requirement_constraints_requirement_id_idx
  on public.project_requirement_constraints (requirement_id);

comment on table public.project_requirement_constraints is
  'Capability values this project line requires. supply_rail is allowed here and is not a component capability.';

-- ---------------------------------------------------------------------------
-- project_requirement_pin_roles
-- ---------------------------------------------------------------------------

create table public.project_requirement_pin_roles (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.project_requirements (id) on delete cascade,
  role_key text not null,
  pin_function text not null,
  canonical_label text not null,
  constraint project_requirement_pin_roles_role_key_check
    check (char_length(role_key) between 1 and 64),
  constraint project_requirement_pin_roles_pin_function_check
    check (pin_function in (
      'digital_input',
      'digital_output',
      'pwm_output',
      'analog_input',
      'i2c_sda',
      'i2c_scl',
      'one_wire',
      'power',
      'ground'
    )),
  constraint project_requirement_pin_roles_canonical_label_check
    check (char_length(canonical_label) between 1 and 32),
  constraint project_requirement_pin_roles_requirement_id_role_key_key
    unique (requirement_id, role_key)
);

comment on table public.project_requirement_pin_roles is
  'Logical pin role for one requirement, and the label the canonical walkthrough already uses.';

-- ---------------------------------------------------------------------------
-- requirement_substitution_reviews
-- Empty in this migration. A row is a per-requirement verification, not a
-- global "part A replaces part B" edge.
-- ---------------------------------------------------------------------------

create table public.requirement_substitution_reviews (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.project_requirements (id) on delete cascade,
  component_id uuid not null references public.components (id) on delete restrict,
  assessed_result text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint requirement_substitution_reviews_assessed_result_check
    check (assessed_result in ('direct', 'conditional', 'incompatible')),
  constraint requirement_substitution_reviews_sort_order_check
    check (sort_order >= 0),
  constraint requirement_substitution_reviews_requirement_id_component_id_key
    unique (requirement_id, component_id)
);

create index requirement_substitution_reviews_requirement_id_idx
  on public.requirement_substitution_reviews (requirement_id);

create trigger requirement_substitution_reviews_not_canonical
before insert or update on public.requirement_substitution_reviews
for each row
execute function public.requirement_review_is_not_canonical();

comment on table public.requirement_substitution_reviews is
  'Verified result for one requirement and one other catalogue component. No rows are seeded. Absence means a future evaluator must not treat that component as a substitute.';

-- ---------------------------------------------------------------------------
-- substitution_review_changes
-- ---------------------------------------------------------------------------

create table public.substitution_review_changes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.requirement_substitution_reviews (id) on delete cascade,
  change_kind text not null,
  step_sort_order integer,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  constraint substitution_review_changes_change_kind_check
    check (change_kind in (
      'board_package',
      'pin_map',
      'code',
      'wiring',
      'diagram',
      'supply',
      'troubleshooting',
      'visual',
      'mechanical'
    )),
  constraint substitution_review_changes_step_sort_order_check
    check (step_sort_order is null or step_sort_order >= 0),
  constraint substitution_review_changes_summary_check
    check (char_length(btrim(summary)) >= 1)
);

create index substitution_review_changes_review_id_idx
  on public.substitution_review_changes (review_id);

comment on table public.substitution_review_changes is
  'User-visible differences for one substitution review. Empty in this migration.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Catalogue facts follow components: any authenticated user may read.
-- Requirement rows follow project_components: published projects only.
-- No client writes. Inventory is not referenced.
-- ---------------------------------------------------------------------------

alter table public.component_capabilities enable row level security;
alter table public.pin_profiles enable row level security;
alter table public.pin_profile_pins enable row level security;
alter table public.project_requirements enable row level security;
alter table public.project_requirement_constraints enable row level security;
alter table public.project_requirement_pin_roles enable row level security;
alter table public.requirement_substitution_reviews enable row level security;
alter table public.substitution_review_changes enable row level security;

create policy "Authenticated users can read component capabilities"
  on public.component_capabilities for select to authenticated
  using ((select auth.uid()) is not null);

create policy "Authenticated users can read pin profiles"
  on public.pin_profiles for select to authenticated
  using ((select auth.uid()) is not null);

create policy "Authenticated users can read pin profile pins"
  on public.pin_profile_pins for select to authenticated
  using ((select auth.uid()) is not null);

create policy "Authenticated users can read requirements for published projects"
  on public.project_requirements for select to authenticated
  using (
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.projects p
      where p.id = project_requirements.project_id
        and p.is_published = true
    )
  );

create policy "Authenticated users can read requirement constraints for published projects"
  on public.project_requirement_constraints for select to authenticated
  using (
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.project_requirements r
      join public.projects p on p.id = r.project_id
      where r.id = project_requirement_constraints.requirement_id
        and p.is_published = true
    )
  );

create policy "Authenticated users can read requirement pin roles for published projects"
  on public.project_requirement_pin_roles for select to authenticated
  using (
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.project_requirements r
      join public.projects p on p.id = r.project_id
      where r.id = project_requirement_pin_roles.requirement_id
        and p.is_published = true
    )
  );

create policy "Authenticated users can read substitution reviews for published projects"
  on public.requirement_substitution_reviews for select to authenticated
  using (
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.project_requirements r
      join public.projects p on p.id = r.project_id
      where r.id = requirement_substitution_reviews.requirement_id
        and p.is_published = true
    )
  );

create policy "Authenticated users can read substitution changes for published projects"
  on public.substitution_review_changes for select to authenticated
  using (
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.requirement_substitution_reviews review
      join public.project_requirements r on r.id = review.requirement_id
      join public.projects p on p.id = r.project_id
      where review.id = substitution_review_changes.review_id
        and p.is_published = true
    )
  );

grant select on public.component_capabilities to authenticated;
grant select on public.pin_profiles to authenticated;
grant select on public.pin_profile_pins to authenticated;
grant select on public.project_requirements to authenticated;
grant select on public.project_requirement_constraints to authenticated;
grant select on public.project_requirement_pin_roles to authenticated;
grant select on public.requirement_substitution_reviews to authenticated;
grant select on public.substitution_review_changes to authenticated;

revoke all on public.component_capabilities from anon;
revoke all on public.pin_profiles from anon;
revoke all on public.pin_profile_pins from anon;
revoke all on public.project_requirements from anon;
revoke all on public.project_requirement_constraints from anon;
revoke all on public.project_requirement_pin_roles from anon;
revoke all on public.requirement_substitution_reviews from anon;
revoke all on public.substitution_review_changes from anon;

-- ---------------------------------------------------------------------------
-- Pin profile identities for the six boards in the first design slice.
-- Pin rows are seeded only for the canonical Uno label the blink steps use,
-- plus that board's 5V and GND so power and ground can be stored.
-- No Mega, Nano, ESP32, ESP8266, or Pico pin rows.
-- ---------------------------------------------------------------------------

insert into public.pin_profiles (id, component_id)
select v.profile_id, c.id
from (
  values
    ('uno_r3', 'arduino-uno-r3'),
    ('nano', 'arduino-nano'),
    ('mega2560', 'arduino-mega'),
    ('esp32_devkit', 'esp32'),
    ('esp8266', 'esp8266'),
    ('pico', 'raspberry-pi-pico')
) as v(profile_id, slug)
join public.components c on c.slug = v.slug
on conflict (id) do update
set component_id = excluded.component_id;

insert into public.pin_profile_pins (pin_profile_id, label, pin_function)
values
  ('uno_r3', 'D9', 'digital_output'),
  ('uno_r3', '5V', 'power'),
  ('uno_r3', 'GND', 'ground')
on conflict (pin_profile_id, label, pin_function) do nothing;

-- ---------------------------------------------------------------------------
-- Capability facts. These do not approve any substitute.
-- adc_full_scale is stored only for the AVR boards.
-- logic_level_v and supply_v for esp8266 and Pico are left absent.
-- physical_form is left absent where the design names no token.
-- programming_environment is left absent on Pico: no authored Arduino sketch.
-- ---------------------------------------------------------------------------

insert into public.component_capabilities (component_id, capability, value)
select c.id, v.capability, v.value
from (
  values
    ('arduino-uno-r3', 'function', 'development_board'),
    ('arduino-uno-r3', 'logic_level_v', '5'),
    ('arduino-uno-r3', 'supply_v', '5'),
    ('arduino-uno-r3', 'gpio', 'digital_input'),
    ('arduino-uno-r3', 'gpio', 'digital_output'),
    ('arduino-uno-r3', 'gpio', 'pwm_output'),
    ('arduino-uno-r3', 'gpio', 'analog_input'),
    ('arduino-uno-r3', 'programming_environment', 'arduino_ide'),
    ('arduino-uno-r3', 'board_package', 'arduino_avr_uno'),
    ('arduino-uno-r3', 'adc_full_scale', '1023'),
    ('arduino-uno-r3', 'physical_form', 'uno_r3'),
    ('arduino-uno-r3', 'header_profile', 'uno_r3'),

    ('arduino-nano', 'function', 'development_board'),
    ('arduino-nano', 'logic_level_v', '5'),
    ('arduino-nano', 'supply_v', '5'),
    ('arduino-nano', 'gpio', 'digital_input'),
    ('arduino-nano', 'gpio', 'digital_output'),
    ('arduino-nano', 'gpio', 'pwm_output'),
    ('arduino-nano', 'gpio', 'analog_input'),
    ('arduino-nano', 'programming_environment', 'arduino_ide'),
    ('arduino-nano', 'board_package', 'arduino_avr_nano'),
    ('arduino-nano', 'adc_full_scale', '1023'),
    ('arduino-nano', 'physical_form', 'nano'),
    ('arduino-nano', 'header_profile', 'nano'),

    ('arduino-mega', 'function', 'development_board'),
    ('arduino-mega', 'logic_level_v', '5'),
    ('arduino-mega', 'supply_v', '5'),
    ('arduino-mega', 'gpio', 'digital_input'),
    ('arduino-mega', 'gpio', 'digital_output'),
    ('arduino-mega', 'gpio', 'pwm_output'),
    ('arduino-mega', 'gpio', 'analog_input'),
    ('arduino-mega', 'programming_environment', 'arduino_ide'),
    ('arduino-mega', 'board_package', 'arduino_avr_mega2560'),
    ('arduino-mega', 'adc_full_scale', '1023'),
    ('arduino-mega', 'physical_form', 'mega2560'),
    ('arduino-mega', 'header_profile', 'mega2560'),

    ('esp32', 'function', 'development_board'),
    ('esp32', 'logic_level_v', '3.3'),
    ('esp32', 'supply_v', '3.3'),
    ('esp32', 'gpio', 'digital_input'),
    ('esp32', 'gpio', 'digital_output'),
    ('esp32', 'gpio', 'pwm_output'),
    ('esp32', 'gpio', 'analog_input'),
    ('esp32', 'programming_environment', 'arduino_ide'),
    ('esp32', 'board_package', 'esp32'),
    ('esp32', 'physical_form', 'esp32_devkit'),
    ('esp32', 'header_profile', 'esp32_devkit'),

    ('esp8266', 'function', 'development_board'),
    ('esp8266', 'gpio', 'digital_input'),
    ('esp8266', 'gpio', 'digital_output'),
    ('esp8266', 'programming_environment', 'arduino_ide'),
    ('esp8266', 'board_package', 'esp8266'),
    ('esp8266', 'header_profile', 'esp8266'),

    ('raspberry-pi-pico', 'function', 'development_board'),
    ('raspberry-pi-pico', 'gpio', 'digital_input'),
    ('raspberry-pi-pico', 'gpio', 'digital_output'),
    ('raspberry-pi-pico', 'board_package', 'rp2040_pico'),
    ('raspberry-pi-pico', 'header_profile', 'pico')
) as v(slug, capability, value)
join public.components c on c.slug = v.slug
on conflict (component_id, capability, value) do update
set value = excluded.value;

-- ---------------------------------------------------------------------------
-- Blinking LED (slug 11): one exact microcontroller requirement.
-- Canonical part and quantity remain the existing Uno BOM line.
-- ---------------------------------------------------------------------------

insert into public.project_requirements (
  project_id,
  project_component_id,
  role,
  substitution_policy,
  sort_order
)
select
  p.id,
  pc.id,
  'microcontroller',
  'exact',
  pc.sort_order
from public.projects p
join public.project_components pc on pc.project_id = p.id
join public.components c on c.id = pc.component_id
where p.slug = '11'
  and c.slug = 'arduino-uno-r3'
on conflict (project_component_id) do update
set
  role = excluded.role,
  substitution_policy = excluded.substitution_policy,
  sort_order = excluded.sort_order;

insert into public.project_requirement_constraints (requirement_id, capability, value)
select r.id, v.capability, v.value
from public.project_requirements r
join public.project_components pc on pc.id = r.project_component_id
join public.projects p on p.id = r.project_id
join public.components c on c.id = pc.component_id
cross join (
  values
    ('function', 'development_board'),
    ('logic_level_v', '5'),
    ('gpio', 'digital_output'),
    ('programming_environment', 'arduino_ide')
) as v(capability, value)
where p.slug = '11'
  and c.slug = 'arduino-uno-r3'
  and r.role = 'microcontroller'
on conflict (requirement_id, capability, value) do nothing;

insert into public.project_requirement_pin_roles (
  requirement_id,
  role_key,
  pin_function,
  canonical_label
)
select r.id, 'led_output', 'digital_output', 'D9'
from public.project_requirements r
join public.project_components pc on pc.id = r.project_component_id
join public.projects p on p.id = r.project_id
join public.components c on c.id = pc.component_id
where p.slug = '11'
  and c.slug = 'arduino-uno-r3'
  and r.role = 'microcontroller'
on conflict (requirement_id, role_key) do update
set
  pin_function = excluded.pin_function,
  canonical_label = excluded.canonical_label;
