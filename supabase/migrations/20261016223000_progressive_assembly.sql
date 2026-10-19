-- Store the physical assembly sequence on the wiring blocks the app reads.
-- Earlier parts stay visible, the current step is highlighted, and later parts stay hidden.

update public.project_steps as step
set blocks = step.blocks || '[{"type":"wiring","heading":"Empty board","connections":[]}]'::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.title = 'Learn the breadboard before you insert a part'
  and step.blocks::text not like '%"heading":"Empty board"%';

update public.project_steps as step
set blocks = step.blocks || '[{"type":"wiring","heading":"Rails only","connections":[],"assembly":{"parts":[],"jumpers":["uno-5v","uno-gnd"]}}]'::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.title = 'Set Up the Arduino'
  and step.blocks::text not like '%"heading":"Rails only"%';

update public.project_steps as step
set blocks = step.blocks || '[{"type":"wiring","heading":"Cable seated","connections":[{"fromComponent":"Breadboard","fromPin":"+ rail","toComponent":"Adafruit BME280","toPin":"Vin","signal":"power"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Adafruit BME280","toPin":"GND","signal":"ground"}],"assembly":{"parts":["bme280"],"jumpers":[]}}]'::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.title = 'Seat the board and the sensor'
  and step.blocks::text not like '%"heading":"Cable seated"%';

update public.project_steps as step
set blocks = (
  select jsonb_agg(
    case
      when item.block->>'heading' = 'Where the parts sit' then jsonb_build_object(
        'type', 'wiring',
        'heading', 'Where the parts sit',
        'connections', '[]'::jsonb,
        'assembly', '{"parts":["led","q-red","q-green","q-blue","base-red","base-green","base-blue","limit-red","limit-green","limit-blue"],"jumpers":[]}'::jsonb
      )
      when item.block->>'heading' = 'Supply and ground' then item.block || '{"assembly":{"parts":[],"jumpers":["devkit-5v","devkit-gnd","bridge-plus","bridge-minus","anode-rail","red-emitter","green-emitter","blue-emitter"]}}'::jsonb
      when item.block->>'heading' = 'Red channel' then item.block || '{"assembly":{"parts":[],"jumpers":["devkit-io25"]}}'::jsonb
      when item.block->>'heading' = 'Green channel' then item.block || '{"assembly":{"parts":[],"jumpers":["devkit-io26","green-cathode"]}}'::jsonb
      when item.block->>'heading' = 'Blue channel' then item.block || '{"assembly":{"parts":[],"jumpers":["devkit-io27","blue-cathode"]}}'::jsonb
      else item.block
    end
    order by item.ordinality
  )
  from jsonb_array_elements(step.blocks) with ordinality as item(block, ordinality)
)
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.title in (
    'Seat every part on these rows',
    'Connect 5 V and ground',
    'Build the red channel',
    'Build the green channel',
    'Build the blue channel'
  );

update public.project_steps as step
set blocks = (
  select jsonb_agg(
    case
      when item.block->>'type' = 'wiring' and step.title = 'Connect the PIR Motion Sensor'
        then item.block || '{"assembly":{"parts":["pir"],"jumpers":["pir-vcc","pir-out","pir-gnd"]}}'::jsonb
      when item.block->>'type' = 'wiring' and step.title = 'Connect the LED'
        then item.block || '{"assembly":{"parts":["resistor","led"],"jumpers":["led-signal","led-cathode"]}}'::jsonb
      when item.block->>'type' = 'wiring' and step.title = 'Connect the Buzzer'
        then item.block || '{"assembly":{"parts":["buzzer"],"jumpers":["buzzer-vcc","buzzer-sig","buzzer-gnd"]}}'::jsonb
      else item.block
    end
    order by item.ordinality
  )
  from jsonb_array_elements(step.blocks) with ordinality as item(block, ordinality)
)
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.title in ('Connect the PIR Motion Sensor', 'Connect the LED', 'Connect the Buzzer');

update public.project_steps as step
set blocks = (
  select jsonb_agg(
    case
      when item.block->>'heading' = 'Power only' then item.block || '{"assembly":{"parts":["psu"],"jumpers":["uno-5v","uno-gnd","psu-5v","psu-gnd","bridge-minus"]}}'::jsonb
      when item.block->>'type' = 'wiring' and step.title = 'Connect the Pan Servo'
        then item.block || '{"assembly":{"parts":["pan"],"jumpers":["pan-vcc","pan-gnd","pan-sig"]}}'::jsonb
      when item.block->>'type' = 'wiring' and step.title = 'Connect the Tilt Servo'
        then item.block || '{"assembly":{"parts":["tilt"],"jumpers":["tilt-vcc","tilt-gnd","tilt-sig"]}}'::jsonb
      when item.block->>'type' = 'wiring' and step.title = 'Connect the Joystick'
        then item.block || '{"assembly":{"parts":["joystick"],"jumpers":["joy-5v","joy-gnd","joy-vrx","joy-vry","joy-sw"]}}'::jsonb
      else item.block
    end
    order by item.ordinality
  )
  from jsonb_array_elements(step.blocks) with ordinality as item(block, ordinality)
)
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.title in (
    'Set Up Arduino, Breadboard, and Power',
    'Connect the Pan Servo',
    'Connect the Tilt Servo',
    'Connect the Joystick'
  );

update public.project_steps as step
set blocks = (
  select jsonb_agg(
    case
      when item.block->>'heading' = 'Power and ground' then item.block || '{"assembly":{"parts":[],"jumpers":["devkit-3v3","devkit-gnd"]}}'::jsonb
      when item.block->>'heading' = 'I2C signals' then item.block || '{"assembly":{"parts":[],"jumpers":["devkit-io21","devkit-io22"]}}'::jsonb
      else item.block
    end
    order by item.ordinality
  )
  from jsonb_array_elements(step.blocks) with ordinality as item(block, ordinality)
)
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.title in ('Connect power and ground', 'Connect SDA and SCL');
