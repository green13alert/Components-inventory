-- Phase 2.2 onboarding persistence: catalogue slugs, seed onboarding components,
-- and user_preferences for preferred topics (and future preference keys).
-- Does not replace Phase 2.1 tables. Does not store passwords, OTPs, or tokens.

-- ---------------------------------------------------------------------------
-- components.slug: stable lookup from onboarding/catalogue IDs to UUID PKs
-- ---------------------------------------------------------------------------

alter table public.components
  add column if not exists slug text;

alter table public.components
  add constraint components_slug_key unique (slug);

comment on column public.components.slug is
  'Stable catalogue identifier used by the app. Distinct from the UUID primary key.';

-- Seed only the catalogue rows referenced by onboarding component picks.
-- Idempotent on slug so completing db push twice does not duplicate rows.
insert into public.components (name, category, description, slug)
values
  ('Arduino Uno R3', 'microcontrollers', 'ATmega328P development board', 'arduino-uno-r3'),
  ('ESP32 DevKit', 'microcontrollers', 'Wi-Fi & Bluetooth microcontroller', 'esp32'),
  ('SG90 Micro Servo', 'actuators', '9g hobby servo motor', 'sg90'),
  ('HC-SR04', 'sensors', 'Ultrasonic distance sensor', 'hc-sr04'),
  ('0.96" OLED', 'displays', '128×64 I2C OLED screen', 'oled-096'),
  ('LED', 'modules', 'Standard indicator LED', 'led'),
  ('Resistor', 'modules', 'Through-hole resistor', 'resistor'),
  ('Breadboard', 'modules', 'Solderless prototyping board', 'breadboard'),
  ('DC Motor', 'actuators', 'Brushed DC gear motor', 'dc-motor'),
  ('DHT11', 'sensors', 'Temperature & Humidity Sensor', 'dht11')
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description;

-- ---------------------------------------------------------------------------
-- user_preferences: one row per preference value (topics now; other keys later)
-- ---------------------------------------------------------------------------

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_key_check check (char_length(key) between 1 and 64),
  constraint user_preferences_value_check check (char_length(value) between 1 and 128),
  constraint user_preferences_user_id_key_value_key unique (user_id, key, value)
);

create index if not exists user_preferences_user_id_key_idx
  on public.user_preferences (user_id, key);

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

comment on table public.user_preferences is
  'Extensible per-user preferences. Onboarding topics use key=topic and value=<interest id>. Additional keys can be added without schema changes.';

alter table public.user_preferences enable row level security;

create policy "Users can select their own preferences"
  on public.user_preferences for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own preferences"
  on public.user_preferences for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own preferences"
  on public.user_preferences for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own preferences"
  on public.user_preferences for delete to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.user_preferences to authenticated;
revoke all on public.user_preferences from anon;
