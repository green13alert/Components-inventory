-- Optional tutorial explanations and project-specific learning objectives.
-- One statement, so the Supabase SQL Editor commits or rolls back every change together.
-- Appends explanation blocks to named steps. Does not replace other step content.
-- Removes the RGB datasheet paragraph. Replaces it with the colour explanation only
-- when that explanation is not already on the step.
-- Does not change step rows, step ids, is_published, inventory, user progress,
-- BOMs, circuits, or firmware.
-- Not applied by this repository change. Apply it to the intended database yourself.

do $migration$
declare
  missing text;
begin
  drop table if exists pg_temp.explanation_notes;

  create temporary table explanation_notes (
    project_slug text not null,
    step_title text not null,
    note jsonb not null
  ) on commit drop;

insert into explanation_notes (project_slug, step_title, note)
values
  (
    '8',
    'Connect the PIR Motion Sensor',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'How does a PIR sensor work?',
      'body', $note$A passive infrared sensor watches for a change in heat in front of its lens. It does not send out a beam. When that change is large enough, OUT goes HIGH. HIGH and LOW are the two states of a digital signal, which is all digitalRead() needs. When the scene is still, OUT sits LOW. A HIGH means motion was noticed. It does not mean a person is still standing there, and the output falls again after the pulse.$note$
    )
  ),
  (
    '8',
    'Connect the LED',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'Why does the LED need a resistor?',
      'body', $note$An LED lets current through easily once it lights. With no resistor in series, that current can be more than the LED or the Arduino pin should carry. The 220 Ω resistor sits in the path and limits the current. The pin then supplies a small amount, and the LED is not asked to take a direct connection to ground. Leaving the resistor out is what makes that path unsafe.$note$
    )
  ),
  (
    '8',
    'Connect the Buzzer',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'How does an active buzzer work?',
      'body', $note$This module already contains the oscillator that makes the tone. A HIGH on its I/O pin only turns that circuit on. The sounder takes its current from the module’s 5 V pin, so the Arduino pin is a control signal, not the power source. A passive piezo has no oscillator of its own. digitalWrite cannot make it sound, because nothing inside it creates the tone.$note$
    )
  ),
  (
    '18',
    'Control the Pan Servo',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'How does servo control work?',
      'body', $note$write(90) asks the servo for about the middle of its travel. The Arduino pin sends a short control pulse that names the angle. It does not feed the motor. The motor current comes in on the red wire from the separate 5 V supply. The brown wire has to share the Arduino’s ground, so the pulse and the motor have one common reference. If those grounds are split, the servo can jitter or ignore the angle.$note$
    )
  ),
  (
    '23',
    'Confirm the BME280 pin labels',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'How does I²C communication work?',
      'body', $note$I²C uses two signal wires. The clock line, SCK, marks when each bit is valid. The data line, SDI, carries the bits. The ESP32 selects a chip by its address. This breakout answers at 0x77 while SDO is left open. Connecting SDO to ground changes that address to 0x76. This sketch asks only for 0x77, so the other address would leave the sensor silent.$note$
    )
  ),
  (
    '23',
    'Serve the page and the JSON endpoint',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'How does the page get new readings?',
      'body', $note$The ESP32 serves a small web page on your own network. Opening the board’s address loads that page from the / route. The page is the display, not the sensor. Every two seconds it asks /readings for the latest temperature, humidity, and pressure, and the board answers with those numbers. Nothing is sent to an outside weather service.$note$
    )
  ),
  (
    '24',
    'Confirm the LED is common anode',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'Why can the colours look different?',
      'body', $note$This LED is common anode: the shared pin is positive, and each colour is switched toward ground. Red, green, and blue are separate chips. A higher forward voltage leaves less voltage across the series resistor, so less current flows and that colour looks dimmer. From a USB port near 5 V, red is often near 2.2 V and green or blue near 3.3 V. Those are typical estimates, not a measurement of your LED. PWM sets brightness by turning the switch on for a larger or smaller share of each cycle.$note$
    )
  ),
  (
    '24',
    'Know the transistors and the resistors',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'Why a transistor and two resistors?',
      'body', $note$Each transistor is a switch. The GPIO asks it to turn on and does not carry the LED current. The 220 Ω resistor is in the LED path and limits that current. The 1 kΩ resistor is in the base path and limits what the 3.3 V pin supplies. One protects the LED. The other protects the pin. From a port near 5 V, red is roughly 10 mA and green or blue only a few milliamps. Treat those figures as estimates, not measured current.$note$
    )
  ),
  (
    '25',
    'Identify the LED Matrix and Joystick',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'How does the MAX7219 light the grid?',
      'body', $note$The chip does not power all 64 LEDs at once. It lights one row at a time and scans through the grid. For that instant a row can draw much more current than the average you see. Intensity is a duty cycle from 0 to 15. This game stays at 2, so each LED is on for only a small share of the time and the average stays modest. A weak USB port can still struggle if every LED is lit at full intensity.$note$
    )
  ),
  (
    '25',
    'Read Joystick Movement',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'Why does the joystick need a deadzone?',
      'body', $note$A centred stick rarely sits on one exact number. Small electrical noise makes the reading wander around the middle. A deadzone treats that wander as no movement, so the player stays still until you push past it. Beyond the band, the sketch takes one step on the axis that moved further. A light touch does not slide the dot, and a diagonal push becomes one horizontal or vertical step.$note$
    )
  ),
  (
    '25',
    'Move and Draw the Player',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'Why does the game use millis()?',
      'body', $note$delay() would stop the whole loop, so the blink and the button would wait with it. millis() is a running clock. The sketch remembers the last move and subtracts that time from the current one. Both numbers are unsigned. When the clock wraps back through zero, the subtraction still gives the elapsed time, so the player does not freeze. The loop keeps running and can read the stick on every pass.$note$
    )
  ),
  (
    '25',
    'Add Level Completion and Timing',
    jsonb_build_object(
      'type', 'explanation',
      'title', 'Why is the button debounced?',
      'body', $note$A mechanical switch can flicker between open and closed for a few milliseconds as it shuts. If every flicker counted, one press would restart the level several times. The sketch waits until the new state has held for 40 ms, then accepts it once. Holding the button does not count again. Only the change into the pressed state does.$note$
    )
  );

update public.project_steps as step
set blocks = (
  select coalesce(jsonb_agg(rewritten.item order by rewritten.ordinality), '[]'::jsonb)
  from (
    select
      entry.ordinality,
      case
        when entry.item->>'type' = 'text'
         and entry.item->>'heading' = 'The datasheet detail'
         and not exists (
           select 1
           from jsonb_array_elements(step.blocks) as existing
           where existing->>'type' = 'explanation'
             and existing->>'title' = note.note->>'title'
         )
          then note.note
        when entry.item->>'type' = 'text'
         and entry.item->>'heading' = 'The datasheet detail'
          then null
        else entry.item
      end as item
    from jsonb_array_elements(step.blocks) with ordinality as entry(item, ordinality)
  ) as rewritten
  where rewritten.item is not null
)
from public.projects as project
join explanation_notes as note
  on note.project_slug = project.slug
 and note.step_title = 'Confirm the LED is common anode'
where step.project_id = project.id
  and project.slug = '24'
  and step.title = 'Confirm the LED is common anode'
  and exists (
    select 1
    from jsonb_array_elements(step.blocks) as item
    where item->>'type' = 'text'
      and item->>'heading' = 'The datasheet detail'
  );

update public.project_steps as step
set blocks = step.blocks || jsonb_build_array(note.note)
from public.projects as project
join explanation_notes as note on note.project_slug = project.slug
where step.project_id = project.id
  and step.title = note.step_title
  and not exists (
    select 1
    from jsonb_array_elements(step.blocks) as item
    where item->>'type' = 'explanation'
      and item->>'title' = note.note->>'title'
  );

update public.projects
set learning_objectives = array[
  'Read a digital motion sensor',
  'Control an LED and an active buzzer from that signal',
  'Use a current-limiting resistor on an LED',
  'Test and troubleshoot a sensor circuit'
]::text[]
where slug = '8';

update public.projects
set learning_objectives = array[
  'Read an analogue joystick',
  'Control a servo position with a pulse signal',
  'Coordinate pan and tilt on two axes',
  'Keep servo power separate from the Arduino and share one ground'
]::text[]
where slug = '18';

  select string_agg(
    note.project_slug || ': ' || (note.note->>'title') || ' (' || found.copies::text || ')',
    ', '
    order by note.project_slug, note.step_title
  )
  into missing
  from explanation_notes as note
  cross join lateral (
    select count(*)::integer as copies
    from public.project_steps as step
    join public.projects as project on project.id = step.project_id
    join lateral jsonb_array_elements(step.blocks) as item on true
    where project.slug = note.project_slug
      and step.title = note.step_title
      and item->>'type' = 'explanation'
      and item->>'title' = note.note->>'title'
  ) as found
  where found.copies <> 1
     or (select count(*) from explanation_notes) <> 12;

  if missing is not null or (select count(*) from explanation_notes) <> 12 then
    raise exception
      'Explanation notes must be present exactly once. These notes did not match: %',
      coalesce(missing, 'expected 12 notes');
  end if;

  if not exists (
    select 1
    from public.projects
    where slug = '8'
      and learning_objectives = array[
        'Read a digital motion sensor',
        'Control an LED and an active buzzer from that signal',
        'Use a current-limiting resistor on an LED',
        'Test and troubleshoot a sensor circuit'
      ]::text[]
  ) or not exists (
    select 1
    from public.projects
    where slug = '18'
      and learning_objectives = array[
        'Read an analogue joystick',
        'Control a servo position with a pulse signal',
        'Coordinate pan and tilt on two axes',
        'Keep servo power separate from the Arduino and share one ground'
      ]::text[]
  ) then
    raise exception 'Learning objectives for projects 8 and 18 were not updated.';
  end if;

  drop table if exists pg_temp.explanation_notes;
end;
$migration$;
