-- Phase 3.2 project catalogue foundation: metadata-only projects table.
-- Does not create project_components, user_projects, BOMs, favourites, or progress.
-- Does not modify components, inventory_items, profiles, or user_preferences.

-- ---------------------------------------------------------------------------
-- projects (shared catalogue metadata)
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text not null,
  overview text,
  category text not null,
  difficulty text not null,
  duration_label text not null,
  image_key text not null,
  learning_objectives text[],
  sort_order integer not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_key unique (slug),
  constraint projects_sort_order_key unique (sort_order),
  constraint projects_category_check
    check (category in ('robotics', 'iot', 'sensors', 'automation', 'displays')),
  constraint projects_difficulty_check
    check (difficulty in ('beginner', 'intermediate', 'advanced'))
);

create index projects_is_published_sort_order_idx
  on public.projects (is_published, sort_order);

comment on table public.projects is
  'Shared Solderi project catalogue metadata. Not user-owned. BOMs and walkthroughs are not stored here yet.';

comment on column public.projects.slug is
  'Stable app/route identifier. Phase 3.2 uses numeric strings 1–22 to match existing /project/[id] routes.';

comment on column public.projects.overview is
  'Long-form project intro. Nullable; only authored where unique content already exists.';

comment on column public.projects.duration_label is
  'Display-only duration string from the existing app (e.g. 3 hrs, 30 min).';

comment on column public.projects.image_key is
  'Key into the app-bundled PROJECT_IMAGES map. Image files are not stored in Supabase.';

comment on column public.projects.learning_objectives is
  'Per-project learning bullets. Left null while the app still uses category templates.';

comment on column public.projects.is_published is
  'When false, authenticated clients cannot SELECT the row. All Phase 3.2 seeds are unpublished.';

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.projects enable row level security;

create policy "Authenticated users can read published projects"
  on public.projects for select to authenticated
  using (
    (select auth.uid()) is not null
    and is_published = true
  );

grant select on public.projects to authenticated;
revoke all on public.projects from anon;

-- ---------------------------------------------------------------------------
-- Seed: 22 metadata rows from constants/projects-data.ts
-- Does not copy status, progress, ownedParts, totalParts, or favourites.
-- Does not seed component requirements.
-- ---------------------------------------------------------------------------

insert into public.projects (
  slug,
  title,
  description,
  overview,
  category,
  difficulty,
  duration_label,
  image_key,
  learning_objectives,
  sort_order,
  is_published
)
values
  (
    '1',
    'Smart Plant Monitor',
    'Track soil moisture and light levels for healthier plants',
    $overview$Build a smart monitoring system that tracks soil moisture, ambient light, and temperature to keep your plants healthy. You'll wire analog sensors, calibrate readings, and display live data — perfect for learning sensor interfacing and conditional logic.$overview$,
    'sensors',
    'beginner',
    '3 hrs',
    'smartPlantMonitor',
    null,
    1,
    false
  ),
  (
    '2',
    'LED Matrix Display',
    'Build a scrolling text display with an 8x8 LED matrix',
    null,
    'displays',
    'beginner',
    '2 hrs',
    'ledMatrix',
    null,
    2,
    false
  ),
  (
    '3',
    'Bluetooth RC Car',
    'Control a motorized chassis from your phone over Bluetooth',
    null,
    'robotics',
    'intermediate',
    '5 hrs',
    'bluetoothRcCar',
    null,
    3,
    false
  ),
  (
    '4',
    'Weather Station',
    'Log temperature, humidity, and pressure to the cloud',
    null,
    'iot',
    'intermediate',
    '4 hrs',
    'weatherStation',
    null,
    4,
    false
  ),
  (
    '5',
    'Home Automation Hub',
    'Centralize lights, fans, and relays in one controller',
    null,
    'automation',
    'advanced',
    '8 hrs',
    'homeAutomation',
    null,
    5,
    false
  ),
  (
    '6',
    'Line Following Robot',
    'Use IR sensors to navigate a taped track autonomously',
    null,
    'robotics',
    'beginner',
    '3 hrs',
    'lineFollowingRobot',
    null,
    6,
    false
  ),
  (
    '7',
    'Arduino Door Lock System',
    'Unlock your door with RFID or a keypad entry code',
    null,
    'automation',
    'intermediate',
    '4 hrs',
    'doorLock',
    null,
    7,
    false
  ),
  (
    '8',
    'Motion Sensor Alarm',
    'Trigger a buzzer and LED when movement is detected',
    null,
    'sensors',
    'beginner',
    '1.5 hrs',
    'motionSensor',
    null,
    8,
    false
  ),
  (
    '9',
    'Smart Thermostat',
    'Regulate room temperature with a relay and sensor loop',
    null,
    'automation',
    'advanced',
    '6 hrs',
    'smartThermostat',
    null,
    9,
    false
  ),
  (
    '10',
    'Automated Greenhouse',
    'Automate watering, fans, and grow lights on a schedule',
    null,
    'iot',
    'advanced',
    '10 hrs',
    'automatedGreenhouse',
    null,
    10,
    false
  ),
  (
    '11',
    'Blinking LED Starter',
    'Learn the basics with your first Arduino sketch and an LED',
    null,
    'displays',
    'beginner',
    '30 min',
    'blinkLed',
    null,
    11,
    false
  ),
  (
    '12',
    'Traffic Light Simulator',
    'Cycle red, yellow, and green LEDs with timed state logic',
    null,
    'displays',
    'beginner',
    '1 hr',
    'trafficLight',
    null,
    12,
    false
  ),
  (
    '13',
    'Buzzer Piano',
    'Play musical notes on a piezo buzzer with push buttons',
    null,
    'sensors',
    'beginner',
    '2 hrs',
    'pianoBuzzer',
    null,
    13,
    false
  ),
  (
    '14',
    'Light-Activated Night Lamp',
    'Turn on an LED automatically when the room gets dark',
    null,
    'automation',
    'beginner',
    '1.5 hrs',
    'nightLamp',
    null,
    14,
    false
  ),
  (
    '15',
    'Pulse Oximeter',
    'Measure heart rate and blood oxygen with an optical sensor',
    null,
    'sensors',
    'intermediate',
    '5 hrs',
    'pulseOximeter',
    null,
    15,
    false
  ),
  (
    '16',
    'Obstacle Avoidance Robot',
    'Navigate around objects using ultrasonic distance sensing',
    null,
    'robotics',
    'intermediate',
    '6 hrs',
    'obstacleRobot',
    null,
    16,
    false
  ),
  (
    '17',
    'RFID Access Logger',
    'Scan badge IDs and log entry times to an SD card',
    null,
    'iot',
    'intermediate',
    '4 hrs',
    'rfidLogger',
    null,
    17,
    false
  ),
  (
    '18',
    'Servo Pan-Tilt Camera',
    'Remotely aim a camera module with two servo motors',
    null,
    'robotics',
    'intermediate',
    '5 hrs',
    'servoCamera',
    null,
    18,
    false
  ),
  (
    '19',
    'Drone Flight Controller',
    'Stabilize a quadcopter with gyroscope and PID tuning',
    null,
    'robotics',
    'advanced',
    '12 hrs',
    'droneController',
    null,
    19,
    false
  ),
  (
    '20',
    'CNC Pen Plotter',
    'Draw vector art on paper with stepper motors and G-code',
    null,
    'robotics',
    'advanced',
    '14 hrs',
    'cncPlotter',
    null,
    20,
    false
  ),
  (
    '21',
    'Voice-Controlled Assistant',
    'Trigger actions with speech recognition and a microphone module',
    null,
    'iot',
    'advanced',
    '9 hrs',
    'voiceAssistant',
    null,
    21,
    false
  ),
  (
    '22',
    'Solar Tracker System',
    'Follow the sun with LDR sensors and a dual-axis servo rig',
    null,
    'automation',
    'advanced',
    '7 hrs',
    'solarTracker',
    null,
    22,
    false
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  overview = excluded.overview,
  category = excluded.category,
  difficulty = excluded.difficulty,
  duration_label = excluded.duration_label,
  image_key = excluded.image_key,
  learning_objectives = excluded.learning_objectives,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;
