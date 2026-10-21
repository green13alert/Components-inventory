-- Specify the four authored builds: one final alarm sketch, a named servo supply, a direct STEMMA cable, and the DevKitC V4 row.
-- Does not change is_published.

insert into public.components (name, category, description, slug)
values
  ('ESP32-DevKitC V4', 'microcontrollers', 'Espressif ESP32-DevKitC V4 with male 0.1 inch headers and a Micro-USB socket. Header J2 starts 3V3, EN, and ends 5V. Header J3 includes IO22 and IO21.', 'esp32-devkitc-v4'),
  ('STEMMA QT to female cable', 'modules', 'Adafruit 4397: JST-SH female to four 0.1 inch female sockets, about 150 mm. Black is GND, red is VIN, blue is SDA, and yellow is SCL. The sockets fit male 0.1 inch header pins.', 'stemma-qt-female'),
  ('5 V 3 A DC supply', 'power', 'MEAN WELL GST18A05-P1J. Output 5 V DC at 3 A, plug 5.5×2.1 mm, center positive. The inlet is IEC C14 and the mains lead is a separate part.', 'gst18a05-p1j'),
  ('IEC C13 mains lead', 'power', 'Mains lead with an IEC C13 connector for the GST18A05-P1J C14 inlet, and a plug for the local mains outlet.', 'iec-c13-mains-lead'),
  ('5.5×2.1 mm barrel jack', 'power', 'Female 5.5×2.1 mm barrel jack for a center-positive plug. The center contact is the positive output and the sleeve is ground.', 'barrel-jack-21')
on conflict (slug) do update
set name = excluded.name, category = excluded.category, description = excluded.description;

update public.components
set description = 'Generic ESP32 DevKit row. It does not fix header gender, USB socket, or pinout. A project that needs the Espressif DevKitC V4 uses esp32-devkitc-v4.'
where slug = 'esp32';

update public.components
set description = 'Three-pin active buzzer module: VCC, I/O, and GND. HIGH on I/O turns the sounder on. The module switches the sounder from VCC, so the GPIO is a control pin. A two-pin piezo is a different part.'
where slug = 'buzzer';

update public.components
set description = 'Data-capable USB cable. Match the plug to the board: Arduino Uno R3 uses USB-B, and Espressif ESP32-DevKitC V4 uses Micro-B. A charge-only cable can power a board and still fail upload.'
where slug = 'usb-data-cable';

update public.components
set description = 'Adafruit 4209: JST-SH female to four male pins. Black is GND, red is VIN, blue is SDA, and yellow is SCL. The male pins fit a breadboard, not a male DevKit header.'
where slug = 'stemma-qt-cable';

update public.projects
set description = 'Aim a pan-tilt plate with two SG90 servos and a joystick. The plate can hold a small camera. This project does not capture or transmit video.'
where slug = '18';

update public.projects
set
  difficulty = 'intermediate',
  description = 'Intermediate build. Mix a red, green, and blue LED from a phone over Bluetooth Low Energy, using transistor switches and PWM.'
where slug = '24';

delete from public.project_components as line
using public.projects as project
where line.project_id = project.id
  and project.slug in ('8', '18', '23', '24');

insert into public.project_components (project_id, component_id, quantity, sort_order)
select project.id, component.id, spec.quantity, spec.sort_order
from (
  values
  ('8', 'arduino-uno-r3', 1, 1, 'microcontroller'),
  ('8', 'pir-sensor', 1, 2, 'motion_sensor'),
  ('8', 'buzzer', 1, 3, 'alarm_output'),
  ('8', 'led', 1, 4, 'indicator'),
  ('8', 'resistor-220', 1, 5, 'led_limiter'),
  ('8', 'breadboard', 1, 6, 'breadboard'),
  ('8', 'jumper-wires', 10, 7, 'jumper_wires'),
  ('8', 'usb-data-cable', 1, 8, 'usb_cable'),
  ('8', 'usb-power-source', 1, 9, 'usb_power'),
  ('18', 'arduino-uno-r3', 1, 1, 'microcontroller'),
  ('18', 'sg90', 2, 2, 'servo'),
  ('18', 'joystick', 1, 3, 'input'),
  ('18', 'pan-tilt-bracket', 1, 4, 'mechanism'),
  ('18', 'breadboard', 1, 5, 'breadboard'),
  ('18', 'jumper-wires', 16, 6, 'jumper_wires'),
  ('18', 'barrel-jack-21', 1, 7, 'servo_connector'),
  ('18', 'gst18a05-p1j', 1, 8, 'servo_supply'),
  ('18', 'iec-c13-mains-lead', 1, 9, 'mains_lead'),
  ('18', 'usb-data-cable', 1, 10, 'usb_cable'),
  ('18', 'usb-power-source', 1, 11, 'usb_power'),
  ('23', 'esp32-devkitc-v4', 1, 1, 'microcontroller'),
  ('23', 'bme280', 1, 2, 'environment_sensor'),
  ('23', 'stemma-qt-female', 1, 3, 'sensor_cable'),
  ('23', 'usb-data-cable', 1, 4, 'usb_cable'),
  ('23', 'usb-power-source', 1, 5, 'usb_power'),
  ('24', 'esp32-devkitc-v4', 1, 1, 'microcontroller'),
  ('24', 'rgb-led-ca', 1, 2, 'rgb_led'),
  ('24', 'pn2222a', 3, 3, 'led_switch'),
  ('24', 'resistor-220', 3, 4, 'led_limiter'),
  ('24', 'resistor-1k', 3, 5, 'base_resistor'),
  ('24', 'breadboard', 1, 6, 'breadboard'),
  ('24', 'jumper-male-female', 5, 7, 'header_wires'),
  ('24', 'jumper-wires', 8, 8, 'jumper_wires'),
  ('24', 'usb-data-cable', 1, 9, 'usb_cable'),
  ('24', 'usb-power-source', 1, 10, 'usb_power')
) as spec(project_slug, component_slug, quantity, sort_order, role)
join public.projects as project on project.slug = spec.project_slug
join public.components as component on component.slug = spec.component_slug;

insert into public.project_requirements (project_id, project_component_id, role, substitution_policy, sort_order)
select project.id, line.id, spec.role, 'exact', spec.sort_order
from (
  values
  ('8', 'arduino-uno-r3', 1, 1, 'microcontroller'),
  ('8', 'pir-sensor', 1, 2, 'motion_sensor'),
  ('8', 'buzzer', 1, 3, 'alarm_output'),
  ('8', 'led', 1, 4, 'indicator'),
  ('8', 'resistor-220', 1, 5, 'led_limiter'),
  ('8', 'breadboard', 1, 6, 'breadboard'),
  ('8', 'jumper-wires', 10, 7, 'jumper_wires'),
  ('8', 'usb-data-cable', 1, 8, 'usb_cable'),
  ('8', 'usb-power-source', 1, 9, 'usb_power'),
  ('18', 'arduino-uno-r3', 1, 1, 'microcontroller'),
  ('18', 'sg90', 2, 2, 'servo'),
  ('18', 'joystick', 1, 3, 'input'),
  ('18', 'pan-tilt-bracket', 1, 4, 'mechanism'),
  ('18', 'breadboard', 1, 5, 'breadboard'),
  ('18', 'jumper-wires', 16, 6, 'jumper_wires'),
  ('18', 'barrel-jack-21', 1, 7, 'servo_connector'),
  ('18', 'gst18a05-p1j', 1, 8, 'servo_supply'),
  ('18', 'iec-c13-mains-lead', 1, 9, 'mains_lead'),
  ('18', 'usb-data-cable', 1, 10, 'usb_cable'),
  ('18', 'usb-power-source', 1, 11, 'usb_power'),
  ('23', 'esp32-devkitc-v4', 1, 1, 'microcontroller'),
  ('23', 'bme280', 1, 2, 'environment_sensor'),
  ('23', 'stemma-qt-female', 1, 3, 'sensor_cable'),
  ('23', 'usb-data-cable', 1, 4, 'usb_cable'),
  ('23', 'usb-power-source', 1, 5, 'usb_power'),
  ('24', 'esp32-devkitc-v4', 1, 1, 'microcontroller'),
  ('24', 'rgb-led-ca', 1, 2, 'rgb_led'),
  ('24', 'pn2222a', 3, 3, 'led_switch'),
  ('24', 'resistor-220', 3, 4, 'led_limiter'),
  ('24', 'resistor-1k', 3, 5, 'base_resistor'),
  ('24', 'breadboard', 1, 6, 'breadboard'),
  ('24', 'jumper-male-female', 5, 7, 'header_wires'),
  ('24', 'jumper-wires', 8, 8, 'jumper_wires'),
  ('24', 'usb-data-cable', 1, 9, 'usb_cable'),
  ('24', 'usb-power-source', 1, 10, 'usb_power')
) as spec(project_slug, component_slug, quantity, sort_order, role)
join public.projects as project on project.slug = spec.project_slug
join public.components as component on component.slug = spec.component_slug
join public.project_components as line
  on line.project_id = project.id
 and line.component_id = component.id
 and line.sort_order = spec.sort_order;

insert into public.project_requirement_constraints (requirement_id, capability, value)
select requirement.id, spec.capability, spec.value
from (
  values
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined'),
  ('undefined', 'undefined', 'undefined')
) as spec(component_slug, capability, value)
join public.components as component on component.slug = spec.component_slug
join public.project_components as line on line.component_id = component.id
join public.projects as project on project.id = line.project_id
join public.project_requirements as requirement on requirement.project_component_id = line.id
where project.slug in ('8', '18', '23', '24');

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $s8o0stage$Understand the Project$s8o0stage$,
  title = $s8o0title$What We're Building$s8o0title$,
  description = $s8o0desc$A PIR sensor watches for movement. When it sees motion, the Arduino turns on an LED and an active buzzer together.$s8o0desc$,
  tip = null,
  blocks = $s8o0blocks$[{"type":"text","heading":"What we're building","body":"This project is a USB-powered motion alarm. The PIR module is the input. The LED and buzzer are the outputs. There is no extra battery pack or arming switch — the board is armed once the sketch finishes its warm-up."},{"type":"image","imageKey":"motionSensor","caption":"Finished motion alarm reference. Keep this pin map: PIR on D2, LED on D8, buzzer on D9."},{"type":"components","items":[{"id":"arduino-uno-r3","name":"Arduino Uno R3","illustrationId":"arduino-uno","owned":false,"quantity":1},{"id":"pir-sensor","name":"PIR motion sensor","illustrationId":"pir-sensor","owned":false,"quantity":1},{"id":"buzzer","name":"Active buzzer module","illustrationId":"generic-module","owned":false,"quantity":1},{"id":"led","name":"LED","illustrationId":"led","owned":false,"quantity":1},{"id":"resistor-220","name":"220 Ω resistor","illustrationId":"resistor","owned":false,"quantity":1},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":10},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"warning","body":"Use the active buzzer from the parts list. A passive piezo will not sound with digitalWrite, and this sketch does not call tone()."}]$s8o0blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 0;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s8o1stage$Build the Circuit$s8o1stage$,
  title = $s8o1title$Set Up the Arduino$s8o1title$,
  description = $s8o1desc$Seat the Uno so 5V, GND, D2, D8, and D9 can reach the breadboard. Power comes from USB for this project.$s8o1desc$,
  tip = $s8o1tip$Use a data-capable USB cable. Charge-only cables never appear as a serial port later.$s8o1tip$,
  blocks = $s8o1blocks$[{"type":"text","heading":"What to set up","body":"Place the Uno beside the breadboard. Use the USB-B data cable from the parts list when you upload; the computer USB port is the power source for this build. Use male-to-male jumpers: Uno 5V into the left + rail at row 1, and Uno GND into the left − rail at row 1. The + rail is 5 V and the − rail is ground. They are not connected to each other. Stay on rows 1–15, above a break in the coloured rail. This build uses 10 male-to-male jumpers from the pack. Leave D2, D8, and D9 empty for now."},{"type":"wiring","heading":"Rails only","connections":[],"assembly":{"parts":[],"jumpers":["uno-5v","uno-gnd"]}},{"type":"test","body":"Plug in USB. Confirm the Uno power LED is on. Check that D2, D8, and D9 still have no wires in them."},{"type":"expected","heading":"Expected result","body":"The board is powered, the + rail is 5V, the − rail is GND, and no sensor or output is connected yet. Nothing should get hot."}]$s8o1blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 1;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s8o2stage$Build the Circuit$s8o2stage$,
  title = $s8o2title$Connect the PIR Motion Sensor$s8o2title$,
  description = $s8o2desc$Most PIR modules have VCC, OUT, and GND. OUT is a digital signal the Arduino reads with digitalRead() on D2.$s8o2desc$,
  tip = $s8o2tip$If your module has a 3.3 V / 5 V jumper, set it to 5 V for the Uno.$s8o2tip$,
  blocks = $s8o2blocks$[{"type":"text","heading":"What you are wiring","body":"Plug the PIR pins into c3, c4, and c5: VCC, OUT, then GND. A male-to-male jumper joins a3 to the left + rail at row 3. Another joins a5 to the left − rail at row 5. D2 goes to a4. OUT is the motion flag — that is PIR_PIN in the sketch. After power-up, give the module about 30 seconds. OUT can chatter during that time. A HIGH is one motion pulse, then it returns LOW. It does not stay HIGH for as long as a person remains in view. Aim the lens away from heaters and vents."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"pir","name":"PIR","illustrationId":"pir-sensor"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"}],"assembly":{"parts":["pir"],"jumpers":["pir-vcc","pir-out","pir-gnd"]}},{"type":"connections","summary":"PIR on D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Three wires only: 5V, GND, and D2. Do not connect the PIR LED jumper to an Arduino pin — that LED is on the module."}]$s8o2blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 2;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s8o3stage$Build the Circuit$s8o3stage$,
  title = $s8o3title$Connect the LED$s8o3title$,
  description = $s8o3desc$The LED is the silent alarm. It needs the 220 Ω resistor in series on D8 so the pin is not shorted to ground.$s8o3desc$,
  tip = null,
  blocks = $s8o3blocks$[{"type":"text","heading":"Polarity and current limit","body":"The longer LED lead is the anode. Seat it in d12 and the shorter lead, by the flat, in d13. The 220 Ω resistor goes in e8 and e12, along column e so it does not cover the buzzer pins. D8 goes to a8. a13 goes to the left − rail at row 13. Use this one resistor only."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"resistor","name":"220 Ω resistor","illustrationId":"resistor"},{"id":"led","name":"LED","illustrationId":"led"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"}],"assembly":{"parts":["resistor","led"],"jumpers":["led-signal","led-cathode"]}},{"type":"connections","summary":"LED on D8 through the 220 Ω resistor","rows":[{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"}]},{"type":"warning","body":"Do not wire the LED from D8 straight to GND. Without the 220 Ω resistor the pin can source more current than it should."}]$s8o3blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 3;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s8o4stage$Build the Circuit$s8o4stage$,
  title = $s8o4title$Connect the Buzzer$s8o4title$,
  description = $s8o4desc$The catalogue buzzer is active: HIGH on the signal pin makes it sound. You do not need tone() for this part.$s8o4desc$,
  tip = null,
  blocks = $s8o4blocks$[{"type":"text","heading":"Three-pin active module","body":"Use the three-pin active module from the parts list. Plug it into c9, c10, and c11: VCC, I/O, then GND. a9 goes to the left + rail at row 9, D9 goes to a10, and a11 goes to the left − rail at row 11. The GPIO drives I/O only. The module takes sounder current from the 5 V rail. A two-pin piezo is not this part, and this sketch will not sound one."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"buzzer","name":"Buzzer","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}],"assembly":{"parts":["buzzer"],"jumpers":["buzzer-vcc","buzzer-sig","buzzer-gnd"]}},{"type":"connections","summary":"Buzzer on D9","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"warning","body":"A passive piezo will stay quiet with digitalWrite HIGH. This walkthrough assumes an active buzzer. Confirm the part matches the BOM before debugging code."}]$s8o4blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 4;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s8o5stage$Build the Circuit$s8o5stage$,
  title = $s8o5title$Check the Complete Circuit$s8o5title$,
  description = $s8o5desc$Before any sketch, the pin map should be complete and unique: D2 input, D8 LED, D9 buzzer, shared 5V and GND.$s8o5desc$,
  tip = null,
  blocks = $s8o5blocks$[{"type":"text","heading":"What “complete” means","body":"Every net below should exist once. If two wires share a pin they should be the same net (for example several grounds), not two different signals on one GPIO."},{"type":"wiring","heading":"Complete wiring diagram","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"pir","name":"PIR","illustrationId":"pir-sensor"},{"id":"resistor","name":"220 Ω resistor","illustrationId":"resistor"},{"id":"led","name":"LED","illustrationId":"led"},{"id":"buzzer","name":"Buzzer","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"connections","heading":"Exact connections","summary":"PIR D2 · LED D8 · buzzer D9","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"expected","heading":"Check","body":"You can trace Arduino 5V to PIR VCC and buzzer VCC, Arduino GND to PIR, LED cathode, and buzzer GND, D2 to PIR OUT, D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin."}]$s8o5blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 5;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s8o6stage$Build the Program$s8o6stage$,
  title = $s8o6title$Create the Arduino Program$s8o6title$,
  description = $s8o6desc$Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.$s8o6desc$,
  tip = null,
  blocks = $s8o6blocks$[{"type":"text","heading":"What we are adding","body":"PIR_PIN, LED_PIN, and BUZZER_PIN match the wiring: D2, D8, D9. Serial is opened at 9600 baud so later tests can print without changing the port settings."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Named constants keep the pin map in one place. If you moved the LED to another pin, you would change LED_PIN only. setup() and loop() are empty on purpose — there is nothing to drive until the next steps configure those pins."}]$s8o6blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 6;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s8o7stage$Build the Program$s8o7stage$,
  title = $s8o7title$Read the Motion Sensor$s8o7title$,
  description = $s8o7desc$Configure D2 as an input, wait through PIR warm-up, then print the raw digitalRead() value.$s8o7desc$,
  tip = null,
  blocks = $s8o7blocks$[{"type":"text","heading":"What we are adding","body":"pinMode(PIR_PIN, INPUT) makes D2 a digital input. digitalRead() returns HIGH or LOW. The 30-second delay runs once in setup() so loop() only sees a settled sensor."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n  Serial.println(motion);\n  delay(200);\n}"},{"type":"code_explanation","body":"We still do not touch the LED or buzzer. If Serial prints 1 when you walk past and 0 when you stay still, the PIR wiring and D2 are correct before any output code can hide a mistake."},{"type":"test","body":"Upload this sketch, open Serial Monitor at 9600 baud, wait for “Ready.”, then walk past the PIR and stand still."},{"type":"expected","heading":"Expected result","body":"After warm-up, Serial should print 0 while the room is still and 1 (HIGH) in bursts when you walk in front of the sensor."}]$s8o7blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 7;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s8o8stage$Build the Program$s8o8stage$,
  title = $s8o8title$Detect Motion$s8o8title$,
  description = $s8o8desc$Turn the raw HIGH/LOW reading into a named condition you will reuse for the LED and buzzer.$s8o8desc$,
  tip = null,
  blocks = $s8o8blocks$[{"type":"text","heading":"What we are adding","body":"An if (motion == HIGH) branch is the alarm condition. else is the idle condition. Words in Serial are easier to confirm than 1 and 0 when you test later."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    Serial.println(\"Motion detected\");\n  } else {\n    Serial.println(\"No motion\");\n  }\n\n  delay(200);\n}"},{"type":"code_explanation","body":"HIGH means the PIR latched a motion event. This is the same boolean we will use to drive outputs. We still leave the LED and buzzer off so you can trust the condition on Serial alone."}]$s8o8blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 8;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s8o9stage$Build the Program$s8o9stage$,
  title = $s8o9title$Control the LED$s8o9title$,
  description = $s8o9desc$When the motion condition is true, D8 goes HIGH. When it is false, D8 goes LOW.$s8o9desc$,
  tip = null,
  blocks = $s8o9blocks$[{"type":"text","heading":"What we are adding","body":"LED_PIN becomes an output. digitalWrite inside each branch follows the same if/else you already tested on Serial. setup() forces the LED LOW so it cannot sit unknown during warm-up."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n    Serial.println(\"Motion detected\");\n  } else {\n    digitalWrite(LED_PIN, LOW);\n    Serial.println(\"No motion\");\n  }\n\n  delay(200);\n}"},{"type":"code_explanation","body":"The LED is a silent check of the alarm path. If Serial says “Motion detected” and the LED stays dark, the fault is D8 wiring or polarity — not the PIR."},{"type":"test","body":"Upload, wait for “Ready.”, then walk past the PIR while watching the LED. Keep the buzzer unwired in your head: it is not driven yet."},{"type":"expected","heading":"Expected result","body":"The LED turns on with “Motion detected” and turns off with “No motion.” If it never lights, check anode → 220 Ω resistor → D8 and cathode → GND."}]$s8o9blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 9;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s8o10stage$Build the Program$s8o10stage$,
  title = $s8o10title$Control the Buzzer$s8o10title$,
  description = $s8o10desc$Drive the active buzzer with the same motion condition as the LED. digitalWrite HIGH is enough — no tone().$s8o10desc$,
  tip = null,
  blocks = $s8o10blocks$[{"type":"text","heading":"What we are adding","body":"BUZZER_PIN is configured as OUTPUT and follows the LED in both branches. An active buzzer has its own oscillator; a DC HIGH on the signal pin is the on switch."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  digitalWrite(BUZZER_PIN, LOW);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n    digitalWrite(BUZZER_PIN, HIGH);\n    Serial.println(\"Motion detected\");\n  } else {\n    digitalWrite(LED_PIN, LOW);\n    digitalWrite(BUZZER_PIN, LOW);\n    Serial.println(\"No motion\");\n  }\n\n  delay(200);\n}"},{"type":"code_explanation","body":"LED and buzzer now share one condition. This sketch still prints on every sample, including “No motion”, so you can see the pin change. It is not the sketch you upload. The next step holds the alarm and changes the ready line to “Alarm armed.” If the LED works and the buzzer does not, check D9, the module GND, and that the part is the three-pin active module."}]$s8o10blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 10;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s8o11stage$Build the Program$s8o11stage$,
  title = $s8o11title$Combine the System$s8o11title$,
  description = $s8o11desc$Hold the alarm for 800 ms on each trigger so a short PIR pulse is still obvious, then return to idle.$s8o11desc$,
  tip = null,
  blocks = $s8o11blocks$[{"type":"text","heading":"What we are adding","body":"The PIR pulse can be brief. delay(800) inside the HIGH branch keeps the LED and buzzer on long enough to notice. Serial prints “Alarm armed.” after warm-up so you know testing can start. delay(50) at the end of loop() is a small idle pause, not a second alarm hold. While the PIR output stays HIGH, the outputs stay on and “Motion detected” prints about once a second. It does not print “No motion” on every idle pass."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  digitalWrite(BUZZER_PIN, LOW);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Alarm armed.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n    digitalWrite(BUZZER_PIN, HIGH);\n    Serial.println(\"Motion detected\");\n    delay(800);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n    digitalWrite(BUZZER_PIN, LOW);\n  }\n\n  delay(50);\n}"},{"type":"code_explanation","body":"This is the complete sketch. Pin map: D2 input, D8 LED, D9 buzzer. Behaviour: wait 30 s, then any HIGH on D2 turns both outputs on for 800 ms. View Code on a finished project shows this same program."}]$s8o11blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 11;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s8o12stage$Test the Alarm$s8o12stage$,
  title = $s8o12title$Upload the Program$s8o12title$,
  description = $s8o12desc$Board: Arduino Uno. Serial Monitor at 9600 baud. Stay out of the PIR’s view until it prints “Alarm armed.”$s8o12desc$,
  tip = $s8o12tip$If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.$s8o12tip$,
  blocks = $s8o12blocks$[{"type":"text","heading":"Before you upload","body":"Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in."},{"type":"text","heading":"How to upload","body":"Paste the combined sketch from the previous step. Click Upload, then open Serial Monitor at 9600 baud. Do not walk in front of the PIR until setup() finishes."},{"type":"test","body":"Upload once. Watch Serial for the warm-up line, then “Alarm armed.”"},{"type":"expected","heading":"Expected result","body":"The IDE reports Done uploading. After about 30 seconds Serial prints “Alarm armed.” The LED and buzzer should still be off if you stayed still."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"No serial port","solution":"Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port."},{"problem":"Upload error / avrdude","solution":"Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy."}]}]$s8o12blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 12;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s8o13stage$Test the Alarm$s8o13stage$,
  title = $s8o13title$Test Without Motion$s8o13title$,
  description = $s8o13desc$A working idle state is as important as a working alarm. Confirm both outputs stay off when the room is still.$s8o13desc$,
  tip = null,
  blocks = $s8o13blocks$[{"type":"test","body":"After “Alarm armed.”, stay outside the PIR’s view for ten seconds. Watch the LED, listen for the buzzer, and read Serial."},{"type":"expected","heading":"Expected result","body":"LED off, buzzer silent, Serial not printing a stream of “Motion detected.” Occasional PIR glitches right after warm-up can happen; wait a few more seconds and retest."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Alarm already on with nobody in view","solution":"Finish the 30 s warm-up. Aim the PIR away from sun, heaters, and vents. Confirm OUT is on D2 and GND is shared with the Uno."},{"problem":"Serial floods with Motion detected","solution":"The PIR is stuck HIGH. Recheck VCC/GND/OUT. Cover the lens; if it stays HIGH, the module or wiring is wrong, not the if-statement."}]}]$s8o13blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 13;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s8o14stage$Test the Alarm$s8o14stage$,
  title = $s8o14title$Test Motion Detection$s8o14title$,
  description = $s8o14desc$Walk through the PIR field of view and confirm the LED and buzzer fire together.$s8o14desc$,
  tip = $s8o14tip$Stand a couple of metres away and walk across the sensor, not straight at it. PIRs often see crossing motion more clearly.$s8o14tip$,
  blocks = $s8o14blocks$[{"type":"test","body":"Walk in front of the PIR sensor. Watch the LED and listen for the buzzer. Then step out of view and wait."},{"type":"expected","heading":"Expected result","body":"The LED turns on and the buzzer sounds for about 800 ms, and Serial prints “Motion detected”. After you leave, both outputs go quiet."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Nothing happens when you walk past","solution":"Confirm PIR VCC/GND/OUT, then confirm PIR_PIN is 2 in the sketch. Open Serial: if it never prints Motion detected, the input never went HIGH."},{"problem":"Serial detects motion but outputs stay off","solution":"The condition is working. Check D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin."}]}]$s8o14blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 14;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s8o15stage$Test the Alarm$s8o15stage$,
  title = $s8o15title$Troubleshoot the Circuit$s8o15title$,
  description = $s8o15desc$If any test failed, isolate input versus output before changing working code.$s8o15desc$,
  tip = null,
  blocks = $s8o15blocks$[{"type":"text","heading":"How to isolate the fault","body":"Serial tells you whether D2 is changing. The LED tells you whether D8 can source current. The buzzer tells you whether D9 and the module are correct. Fix the layer that actually failed."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"LED never lights","solution":"Confirm anode → 220 Ω resistor → D8 and cathode → GND. Swap the LED if you still see nothing — polarity may be reversed."},{"problem":"Buzzer silent","solution":"This build uses the three-pin active module. Confirm VCC on the 5 V rail, I/O on D9, and GND on the ground rail. A passive piezo will not sound with digitalWrite."},{"problem":"PIR always HIGH","solution":"Finish the 30 s warm-up. Check OUT is on D2 and that the module ground is the Uno ground. Recheck any 3.3 V / 5 V jumper."},{"problem":"PIR never HIGH","solution":"Confirm 5V on VCC. Wave closer and across the lens. Some modules have a sensitivity pot — a fully counterclockwise pot can ignore a person at the desk."}]}]$s8o15blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 15;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s8o16stage$Test the Alarm$s8o16stage$,
  title = $s8o16title$Final System Test$s8o16title$,
  description = $s8o16desc$Run idle, then motion, then idle again. The pin map should still match the complete wiring diagram.$s8o16desc$,
  tip = null,
  blocks = $s8o16blocks$[{"type":"image","imageKey":"motionSensor","caption":"Keep this GPIO map if you mount the PIR on a box later: D2 input, D8 LED, D9 buzzer."},{"type":"test","body":"Stay still until the alarm is quiet. Walk past once and confirm LED plus buzzer. Step away and confirm both outputs stop. Repeat once."},{"type":"expected","heading":"Expected result","body":"Idle is silent. Each crossing of the PIR fires both outputs together for about 800 ms. Serial matches what you see and hear. You have a USB-powered motion alarm with no extra switch or battery."},{"type":"connections","heading":"Pin map you built","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]}]$s8o16blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 16;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $s18o0stage$Understand the Project$s18o0stage$,
  title = $s18o0title$What We're Building$s18o0title$,
  description = $s18o0desc$A two-servo pan-tilt mount aims a camera plate. A joystick sets the angles. This project aims the payload — it does not capture video.$s18o0desc$,
  tip = null,
  blocks = $s18o0blocks$[{"type":"text","heading":"What we're building","body":"You will assemble a pan-tilt bracket around two SG90 servos, power the servos from a 5 V jack, and drive both axes from an analog joystick. Pan is left/right. Tilt is up/down. Mount a lightweight camera or webcam on the plate if you have one — or leave the plate empty while you learn the mechanism."},{"type":"image","imageKey":"servoCamera","caption":"Finished pan-tilt reference. Pin map: pan servo D9, tilt servo D10, joystick VRx A0, VRy A1, SW D2."},{"type":"components","items":[{"id":"arduino-uno-r3","name":"Arduino Uno R3","illustrationId":"arduino-uno","owned":false,"quantity":1},{"id":"sg90","name":"SG90 Micro Servo","illustrationId":"servo-sg90","owned":false,"quantity":2},{"id":"joystick","name":"Analog Joystick Module","illustrationId":"generic-module","owned":false,"quantity":1},{"id":"pan-tilt-bracket","name":"Pan-Tilt Bracket Kit","illustrationId":"electronics-kit","owned":false,"quantity":1},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":16},{"id":"barrel-jack-21","name":"5.5×2.1 mm barrel jack","illustrationId":"generic-module","owned":false,"quantity":1},{"id":"gst18a05-p1j","name":"5 V 3 A DC supply","illustrationId":"battery","owned":false,"quantity":1},{"id":"iec-c13-mains-lead","name":"IEC C13 mains lead","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"warning","body":"Use position SG90 servos that hold an angle. A continuous-rotation servo will not stop at the angle this sketch writes."}]$s18o0blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 0;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $s18o1stage$Understand the Project$s18o1stage$,
  title = $s18o1title$Understand Power and Pin Architecture$s18o1title$,
  description = $s18o1desc$Servos and the Uno do not share the Arduino 5V pin. They share ground. The pin map stays fixed for the rest of the build.$s18o1desc$,
  tip = $s18o1tip$The servo supply is a MEAN WELL GST18A05-P1J: 5 V, 3 A, 5.5×2.1 mm, center positive. It needs the IEC C13 mains lead. A 9V snap is not the servo supply.$s18o1tip$,
  blocks = $s18o1blocks$[{"type":"text","heading":"Two 5V domains, one ground","body":"USB powers the Uno. Uno 5V feeds only the joystick and the logic + rail. The GST18A05-P1J feeds only the servo + rail, through the barrel jack. Those two + rails must stay electrically separate. Do not join them with a rail-link jumper. Tie the jack sleeve to Uno GND so the D9 and D10 pulses share one 0 V. If the grounds are split, the servos jitter or ignore the signal. If the two + rails are linked, the servo supply can back-feed the Uno 5V pin. Tower Pro’s SG90 sheet lists 4.8 V operation and does not publish stall current, so this build uses a 3 A regulated 5 V supply rather than a small linear breadboard regulator."},{"type":"connections","heading":"Pin map","summary":"Pan D9 · tilt D10 · joystick A0/A1/D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"warning","body":"Do not feed servo VCC from the Uno 5V header. Two SG90s can stall well above what USB 5V should supply, and the board will reset. Do not jumper the servo 5 V rail onto Uno 5V, and do not fit a breadboard rail-link that joins the two + rails."}]$s18o1blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 1;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s18o2stage$Mechanical Assembly$s18o2stage$,
  title = $s18o2title$Prepare the Mechanical Parts$s18o2title$,
  description = $s18o2desc$Lay out the pan-tilt kit: base, U-bracket, camera plate, horns, and screws. Identify pan versus tilt before any servo goes into a hole.$s18o2desc$,
  tip = null,
  blocks = $s18o2blocks$[{"type":"text","heading":"What you should have","body":"A typical SG90 pan-tilt kit has a round or square base (pan), a U-shaped bracket that rides on that base, a camera plate for the tilt servo, several horns, and short screws. Match each piece to the kit diagram if one is included. Keep the two servos aside until the next step — do not tighten horns yet."},{"type":"text","heading":"Orientation","body":"The pan servo will sit in the base, output shaft pointing up. The tilt servo will sit in the U-bracket, output shaft pointing sideways so the camera plate can nod. If your kit labels the parts, follow those labels. If it does not, the piece that bolts to the desk or breadboard area is the pan base."},{"type":"expected","heading":"Check","body":"You can name the base, the U-bracket, and the camera plate. Screws that go into the servo body are short — do not use a long screw that can punch into the gearbox."}]$s18o2blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 2;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s18o3stage$Mechanical Assembly$s18o3stage$,
  title = $s18o3title$Assemble the Base and Pan Servo$s18o3title$,
  description = $s18o3desc$Seat the pan servo in the base with the shaft centred. Fit a horn loosely. Do not lock the horn at an extreme angle.$s18o3desc$,
  tip = $s18o3tip$Most kits screw through the servo lug holes into the base. Snug, not stripped.$s18o3tip$,
  blocks = $s18o3blocks$[{"type":"text","heading":"Mount the pan servo","body":"Slide the pan SG90 into the base pocket so the brass output shaft is centred in the base opening. Route the three-wire lead out through the kit’s cable notch, not pinched under the servo body. Fit the screws through the servo mounting lugs into the base."},{"type":"text","heading":"Horn at mid-travel","body":"Push the single-arm or four-point horn onto the pan shaft so the U-bracket will sit square over the base when the servo is near mid-travel. Leave the horn screw slightly loose for now. You will command 90° in software later and reseat the horn so “90” is actually straight."},{"type":"test","body":"With power still off, rotate the horn gently. You should feel a little gearbox resistance, not a hard plastic clash against the base."},{"type":"expected","heading":"Expected result","body":"The pan servo is captive in the base, the lead is free, and the horn is on the shaft but not locked at a hard stop."}]$s18o3blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 3;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s18o4stage$Mechanical Assembly$s18o4stage$,
  title = $s18o4title$Mount the Tilt Servo and Camera Plate$s18o4title$,
  description = $s18o4desc$Fit the U-bracket to the pan horn, seat the tilt servo, and attach the camera plate. Keep both joints able to move.$s18o4desc$,
  tip = null,
  blocks = $s18o4blocks$[{"type":"text","heading":"U-bracket on pan","body":"Bolt the U-bracket to the pan horn so the open side of the U faces the direction your camera plate will nod. The tilt servo sits in one arm of the U, shaft toward the plate."},{"type":"text","heading":"Tilt servo and plate","body":"Seat the second SG90 in the U-bracket. Route its lead so it cannot wrap around the pan joint. Attach the camera plate to the tilt horn at a visual mid-angle — plate roughly level, not folded into the U. Screw the plate on, but leave the horn-to-shaft screw slightly loose until calibration."},{"type":"warning","body":"Fingers and cables can pinch between the U-bracket and the base when pan moves. Keep the two servo leads long enough to follow the motion, and tape a service loop so they do not taut-pull a header later."},{"type":"expected","heading":"Check","body":"You have a base that can yaw and a plate that can nod. Neither joint is already sitting on a mechanical stop."}]$s18o4blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 4;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s18o5stage$Mechanical Assembly$s18o5stage$,
  title = $s18o5title$Check Mechanical Movement$s18o5title$,
  description = $s18o5desc$With power still off, confirm pan and tilt can move through a useful range without scraping or pulling wires.$s18o5desc$,
  tip = $s18o5tip$If a joint is stiff, loosen the horn one click rather than forcing it.$s18o5tip$,
  blocks = $s18o5blocks$[{"type":"test","body":"Hold the base still. Ease the camera plate through tilt. Then ease the whole U-bracket through pan. Watch the two servo leads: they should follow, not stretch. Power is still off. Once the servos are powered, do not force a horn by hand. If a joint binds, remove power and ease the horn off."},{"type":"expected","heading":"Expected result","body":"Each axis moves past centre in both directions without plastic grinding and without a lead catching on a screw. Stops should feel like bracket-on-bracket, not a servo grinding its gear teeth."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"The plate hits the U-bracket immediately","solution":"Pull the tilt horn off and rotate it one spline so the plate sits level at mid-travel. Do not move the servo body."},{"problem":"Pan scrapes the desk or the base","solution":"The pan horn is clocked too far. Lift it off the shaft and reseat it so the U-bracket is square at centre."},{"problem":"A screw will not seat","solution":"Use the short servo-lug screws. A long screw can enter the gearbox and lock the output shaft."}]}]$s18o5blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 5;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18o6stage$Build the Electronics$s18o6stage$,
  title = $s18o6title$Set Up Arduino, Breadboard, and Power$s18o6title$,
  description = $s18o6desc$USB powers the Uno. The 5 V jack will power the servos. Build the two 5V rails and the shared ground before any servo signal wire goes in.$s18o6desc$,
  tip = $s18o6tip$Use a data-capable USB cable. Charge-only cables never appear as a serial port later.$s18o6tip$,
  blocks = $s18o6blocks$[{"type":"text","heading":"Find the breadboard power rails","body":"Along each long edge there is a + rail (often red) and a − rail (often blue or black). Holes in one + rail are connected to each other. + is not connected to −. Use one side as the logic + rail (Uno 5V only) and the other side as the servo + rail (servo 5 V only). Those two + rails must stay electrically separate. Some breadboards include metal clips or jumpers that join opposite + rails — remove or skip those. Tie both − rails together so ground is common."},{"type":"text","heading":"Seat the jack and jumpers","body":"The left + rail is Uno 5V. The right + rail is the servo supply. Do not bridge those two + rails. Bridge the − rails with one male-to-male wire from left − row 1 to right − row 1. Uno 5V goes to left + row 2. Uno GND goes to left − row 2. The jack’s center contact goes to right + row 3. The jack’s sleeve goes to right − row 3. All of these stay on rows 1–15. This build uses 16 male-to-male jumpers from the pack. Leave D9, D10, A0, A1, and D2 empty."},{"type":"wiring","heading":"Power only","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"5 V jack","illustrationId":"battery"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"}],"assembly":{"parts":["psu"],"jumpers":["uno-5v","uno-gnd","psu-5v","psu-gnd","bridge-minus"]}},{"type":"connections","summary":"Logic 5V from Uno · servo 5V from supply · common GND","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"}]},{"type":"warning","body":"Plug the GST18A05-P1J into the jack. The plug is center positive. Do not connect servo VCC yet. Do not jumper the servo rail to Uno 5V, and check that no rail-link joins the two + rails. Grounds stay common."},{"type":"test","body":"Connect USB to the Uno. Confirm the Uno power LED is on. Then apply supply input and confirm the servo 5 V indicator (if it has one) is on. Check that the two + rails are not linked. Nothing else should be wired."},{"type":"expected","heading":"Expected result","body":"Uno powered from USB, logic + rail is Uno 5V only, servo-side + rail is servo 5 V only, the two + rails are not joined, and − rails are common with Uno GND. D9, D10, A0, A1, and D2 are still empty. Nothing is hot."}]$s18o6blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 6;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18o7stage$Build the Electronics$s18o7stage$,
  title = $s18o7title$Connect the Pan Servo$s18o7title$,
  description = $s18o7desc$Pan is the lower SG90. Red goes to the servo 5 V rail, brown to common ground, orange to D9.$s18o7desc$,
  tip = $s18o7tip$If the lead has yellow instead of orange, that is still the signal wire.$s18o7tip$,
  blocks = $s18o7blocks$[{"type":"text","heading":"What you are wiring","body":"The pan servo connector is female, so use male-to-male wires. Red goes from the right + rail at row 5 into the servo’s red pin. Brown goes from the right − rail at row 6 into the brown pin. Orange goes from Uno D9 straight into the signal pin. That orange wire does not enter a breadboard hole. Red must not touch the left + rail."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"5 V jack","illustrationId":"battery"},{"id":"pan","name":"Pan servo","illustrationId":"servo-sg90"}],"connections":[{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"}],"assembly":{"parts":["pan"],"jumpers":["pan-vcc","pan-gnd","pan-sig"]}},{"type":"connections","summary":"Pan servo on D9","rows":[{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Three pan wires only: servo 5 V, common GND, D9. The tilt servo is still unplugged. Do not swap red and orange — that puts 5V on a GPIO."}]$s18o7blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 7;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18o8stage$Build the Electronics$s18o8stage$,
  title = $s18o8title$Connect the Tilt Servo$s18o8title$,
  description = $s18o8desc$Tilt is the upper SG90. Same colour code as pan, but the signal wire goes to D10.$s18o8desc$,
  tip = null,
  blocks = $s18o8blocks$[{"type":"text","heading":"What you are wiring","body":"The tilt connector is female too. Red goes from the right + rail at row 8. Brown goes from the right − rail at row 9. Orange goes from Uno D10 straight to the signal pin. Both servos share the right-hand 5V rail and the common − rail. Only the signal pins differ."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"5 V jack","illustrationId":"battery"},{"id":"tilt","name":"Tilt servo","illustrationId":"servo-sg90"}],"connections":[{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"}],"assembly":{"parts":["tilt"],"jumpers":["tilt-vcc","tilt-gnd","tilt-sig"]}},{"type":"connections","summary":"Tilt servo on D10","rows":[{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Pan remains on D9. Tilt is on D10. Both reds are on servo 5 V. Both browns are on common GND. No servo red is in the Uno 5V header."}]$s18o8blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 8;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18o9stage$Build the Electronics$s18o9stage$,
  title = $s18o9title$Connect the Joystick$s18o9title$,
  description = $s18o9desc$The joystick is a low-current analog module. It uses the Uno 5V logic rail, not the servo supply rail.$s18o9desc$,
  tip = $s18o9tip$KY-023 pins are usually labelled GND, +5V, VRx, VRy, SW in that order. Match labels, not lead colour.$s18o9tip$,
  blocks = $s18o9blocks$[{"type":"text","heading":"What you are wiring","body":"Plug the joystick pins into c8 through c12: +5V, GND, VRx, VRy, SW. a8 goes to the left + rail at row 8, not the right + rail. a9 goes to the left − rail at row 9. A0 goes to a10, A1 to a11, and D2 to a12. The sketch later enables INPUT_PULLUP on D2, so an unpressed stick reads HIGH and a click reads LOW."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"joystick","name":"Joystick","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}],"assembly":{"parts":["joystick"],"jumpers":["joy-5v","joy-gnd","joy-vrx","joy-vry","joy-sw"]}},{"type":"connections","summary":"Joystick VRx A0 · VRy A1 · SW D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"warning","body":"Do not power the joystick from the servo supply rail if that rail is a noisy motor supply with no 5V regulation to the module. The catalogue joystick is a 5V analog part — Uno 5V is the correct source."}]$s18o9blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 9;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18o10stage$Build the Electronics$s18o10stage$,
  title = $s18o10title$Check the Complete Circuit$s18o10title$,
  description = $s18o10desc$Before any sketch, the pin map should be complete: D9 pan, D10 tilt, A0/A1/D2 joystick, servo 5 V on servo VCC, common ground.$s18o10desc$,
  tip = null,
  blocks = $s18o10blocks$[{"type":"text","heading":"What “complete” means","body":"Every net below should exist once. Two browns may share the − rail. Two reds may share the servo + rail. D9 and D10 must not share a pin with each other or with SW."},{"type":"wiring","heading":"Complete wiring diagram","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"5 V jack","illustrationId":"battery"},{"id":"pan","name":"Pan servo","illustrationId":"servo-sg90"},{"id":"tilt","name":"Tilt servo","illustrationId":"servo-sg90"},{"id":"joystick","name":"Joystick","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"connections","heading":"Exact connections","summary":"Pan D9 · tilt D10 · joystick A0/A1/D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"expected","heading":"Check","body":"You can trace Uno 5V to the joystick, servo 5 V to both servo reds, common GND to both browns and the joystick, D9 to pan SIG, D10 to tilt SIG, A0 to VRx, A1 to VRy, and D2 to SW. There is no jumper between the logic + rail and the servo + rail."}]$s18o10blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 10;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18o11stage$Build the Program$s18o11stage$,
  title = $s18o11title$Create the Arduino Program$s18o11title$,
  description = $s18o11desc$Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.$s18o11desc$,
  tip = null,
  blocks = $s18o11blocks$[{"type":"text","heading":"What we are adding","body":"PAN_PIN, TILT_PIN, JOY_X_PIN, JOY_Y_PIN, and JOY_SW_PIN match the wiring: D9, D10, A0, A1, D2. Serial is opened at 9600 baud so later tests can print without changing the port settings."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":[],"code":"const int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Named constants keep the pin map in one place. Analog pins use A0 and A1 — that is the Uno label, not the number 0 and 1. setup() and loop() are empty on purpose until the next step attaches a servo."}]$s18o11blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 11;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18o12stage$Build the Program$s18o12stage$,
  title = $s18o12title$Add the Servo Library$s18o12title$,
  description = $s18o12desc$Servo.h is bundled with the Arduino IDE. Include it and attach the pan servo to D9. The pan servo will hold, not sweep, until the next step.$s18o12desc$,
  tip = $s18o12tip$You do not need Library Manager for Servo.h on an Uno.$s18o12tip$,
  blocks = $s18o12blocks$[{"type":"text","heading":"What we are adding","body":"#include <Servo.h> brings in the driver. Servo panServo; is the object. panServo.attach(PAN_PIN) tells that object to emit the control pulse on D9. Until you call write(), attach() typically sends a default mid pulse — keep fingers clear of the bracket."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Only pan is attached. Tilt is still a named pin with no Servo object. If the pan horn jumps when you later upload, that is the servo seeking the default pulse, not a wiring short. Leave the horn screw loose. After the servo settles, remove power, reseat the horn so the bracket is square, then tighten the screw."}]$s18o12blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 12;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18o13stage$Build the Program$s18o13stage$,
  title = $s18o13title$Control the Pan Servo$s18o13title$,
  description = $s18o13desc$Command pan to 90°, then sweep 60 / 90 / 120 so you can see one axis move before tilt is in the sketch.$s18o13desc$,
  tip = null,
  blocks = $s18o13blocks$[{"type":"text","heading":"What we are adding","body":"write(90) is mid-travel for a typical SG90. The loop then steps to 60, 90, and 120 with a 1 s pause so you can watch the base yaw. We stay away from 0 and 180 so a slightly mis-clocked horn does not stall the gearbox."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n  panServo.write(90);\n  delay(500);\n  Serial.println(\"Pan at 90.\");\n}\n\nvoid loop() {\n  panServo.write(60);\n  Serial.println(\"Pan 60\");\n  delay(1000);\n  panServo.write(90);\n  Serial.println(\"Pan 90\");\n  delay(1000);\n  panServo.write(120);\n  Serial.println(\"Pan 120\");\n  delay(1000);\n}"},{"type":"code_explanation","body":"Serial prints the commanded angle so you can match what you see to what the sketch asked for. If Serial says Pan 120 and the base barely moves, the fault is mechanical binding or power — not this write() call."},{"type":"expected","heading":"Check","body":"This sketch attaches and writes only panServo on D9. TILT_PIN is named but unused — leave the tilt signal wire on D10 from the electronics stage. Physical pan motion is confirmed later in Calibrate and Test."}]$s18o13blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 13;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18o14stage$Build the Program$s18o14stage$,
  title = $s18o14title$Control the Tilt Servo$s18o14title$,
  description = $s18o14desc$Attach the second Servo object on D10 and sweep tilt while pan holds 90°.$s18o14desc$,
  tip = null,
  blocks = $s18o14blocks$[{"type":"text","heading":"What we are adding","body":"Servo tiltServo; and tiltServo.attach(TILT_PIN) claim D10. setup() parks both axes at 90°. loop() sweeps only tilt so a pan fault and a tilt fault stay separable."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(90);\n  tiltServo.write(90);\n  delay(500);\n  Serial.println(\"Both servos at 90.\");\n}\n\nvoid loop() {\n  tiltServo.write(60);\n  Serial.println(\"Tilt 60\");\n  delay(1000);\n  tiltServo.write(90);\n  Serial.println(\"Tilt 90\");\n  delay(1000);\n  tiltServo.write(120);\n  Serial.println(\"Tilt 120\");\n  delay(1000);\n}"},{"type":"code_explanation","body":"Two Servo objects can run on one Uno. Each attach() consumes a timer channel — two SG90s is well within the limit. Pan stays at 90 so you can judge whether tilt is nodding on its own."},{"type":"expected","heading":"Expected result","body":"When this sketch runs, the camera plate nods through 60 / 90 / 120 while the base stays put. If the whole assembly yaws instead, the D9/D10 leads are swapped."}]$s18o14blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 14;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18o15stage$Build the Program$s18o15stage$,
  title = $s18o15title$Read Joystick Input$s18o15title$,
  description = $s18o15desc$Print the raw analog X/Y values and the switch. Servos hold 90° so you can trust the input without chasing motion.$s18o15desc$,
  tip = $s18o15tip$Resting X and Y are often near 512, but many modules sit somewhat above or below that. Note your rest values. A click should print SW 0.$s18o15tip$,
  blocks = $s18o15blocks$[{"type":"text","heading":"What we are adding","body":"analogRead returns 0–1023 on the Uno. VRx is A0, VRy is A1. INPUT_PULLUP on D2 makes the unpressed switch read HIGH (1). Pressing SW shorts to ground, so it reads LOW (0). Servos attach and park at 90 so they do not go limp during this test."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(90);\n  tiltServo.write(90);\n  Serial.begin(9600);\n  Serial.println(\"Joystick test. Servos hold 90.\");\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int sw = digitalRead(JOY_SW_PIN);\n\n  Serial.print(\"X \");\n  Serial.print(x);\n  Serial.print(\"  Y \");\n  Serial.print(y);\n  Serial.print(\"  SW \");\n  Serial.println(sw);\n\n  delay(200);\n}"},{"type":"code_explanation","body":"We still do not map the stick to angles. If X never changes when you move left/right, A0 is the fault. If Y is stuck at 0 or 1023, VRy may be sitting on 5V or GND instead of A1."},{"type":"text","heading":"Resting centre","body":"A centred stick is rarely exactly 512. Read Serial at rest and write down X and Y. In the combined sketch those numbers become JOY_X_CENTER and JOY_Y_CENTER so the deadzone sits around your module, not around an assumed midpoint."},{"type":"test","body":"When you upload this sketch later: rest the stick, move X, move Y, then click SW. Watch Serial at 9600 baud."},{"type":"expected","heading":"Expected result","body":"At rest, X and Y are often around 480–540 rather than exactly 512. Write those rest values down. Full left or right drives X toward 0 or 1023. Full up or down drives Y toward an extreme. SW prints 1 at rest and 0 while clicked."}]$s18o15blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 15;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18o16stage$Build the Program$s18o16stage$,
  title = $s18o16title$Map Joystick Values to Servo Angles$s18o16title$,
  description = $s18o16desc$Convert 0–1023 stick readings into 0–180 servo degrees so both axes follow the joystick.$s18o16desc$,
  tip = null,
  blocks = $s18o16blocks$[{"type":"text","heading":"What we are adding","body":"map(x, 0, 1023, 0, 180) scales the pan stick onto the servo range. The same mapping on y drives tilt. delay(20) is a short refresh so the servos are not flooded, but the stick still feels live."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int panAngle = map(x, 0, 1023, 0, 180);\n  int tiltAngle = map(y, 0, 1023, 0, 180);\n\n  panServo.write(panAngle);\n  tiltServo.write(tiltAngle);\n\n  Serial.print(\"Pan \");\n  Serial.print(panAngle);\n  Serial.print(\"  Tilt \");\n  Serial.println(tiltAngle);\n\n  delay(20);\n}"},{"type":"code_explanation","body":"This sketch has no deadzone and no mechanical limits. At rest the stick is rarely exactly 512, so the servos may creep. That is expected — the next step holds the last angle inside a deadzone around JOY_X_CENTER / JOY_Y_CENTER and clamps travel to 20–160."}]$s18o16blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 16;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18o17stage$Build the Program$s18o17stage$,
  title = $s18o17title$Add Limits and Combine the Program$s18o17title$,
  description = $s18o17desc$Clamp travel, ignore stick noise around centre, and use the joystick click to return both axes to 90°.$s18o17desc$,
  tip = $s18o17tip$If an axis is reversed, swap that map() pair: map(x, 0, 1023, PAN_MAX, PAN_MIN).$s18o17tip$,
  blocks = $s18o17blocks$[{"type":"text","heading":"What we are adding","body":"PAN_MIN/MAX and TILT_MIN/MAX keep write() inside the bracket’s free range. DEADZONE of 40 around JOY_X_CENTER and JOY_Y_CENTER means a resting stick does not update the stored angle. Start those centres at 512; if Serial at rest was different, put those numbers in instead. Clicking SW (LOW) sets both stored angles back to 90. The servos hold the last aimed position when you let the stick go — that is what you want when framing a camera."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nconst int PAN_MIN = 20;\nconst int PAN_MAX = 160;\nconst int TILT_MIN = 20;\nconst int TILT_MAX = 160;\nconst int PAN_CENTER = 90;\nconst int TILT_CENTER = 90;\nconst int JOY_X_CENTER = 512;\nconst int JOY_Y_CENTER = 512;\nconst int DEADZONE = 40;\n\nServo panServo;\nServo tiltServo;\n\nint panAngle = PAN_CENTER;\nint tiltAngle = TILT_CENTER;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(panAngle);\n  tiltServo.write(tiltAngle);\n  Serial.begin(9600);\n  Serial.println(\"Pan-tilt ready.\");\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int sw = digitalRead(JOY_SW_PIN);\n\n  if (sw == LOW) {\n    panAngle = PAN_CENTER;\n    tiltAngle = TILT_CENTER;\n  } else {\n    if (abs(x - JOY_X_CENTER) > DEADZONE) {\n      panAngle = map(x, 0, 1023, PAN_MIN, PAN_MAX);\n    }\n    if (abs(y - JOY_Y_CENTER) > DEADZONE) {\n      tiltAngle = map(y, 0, 1023, TILT_MIN, TILT_MAX);\n    }\n  }\n\n  panServo.write(panAngle);\n  tiltServo.write(tiltAngle);\n\n  Serial.print(\"Pan \");\n  Serial.print(panAngle);\n  Serial.print(\"  Tilt \");\n  Serial.println(tiltAngle);\n\n  delay(20);\n}"},{"type":"code_explanation","body":"This is the complete sketch. Pin map: D9 pan, D10 tilt, A0 VRx, A1 VRy, D2 SW. Behaviour: aim while the stick is deflected, hold when it is inside the deadzone around your joystick centres, recentre on a click. View Code on a finished project shows this same program."}]$s18o17blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 17;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s18o18stage$Calibrate and Test$s18o18stage$,
  title = $s18o18title$Upload the Program$s18o18title$,
  description = $s18o18desc$Board: Arduino Uno. Serial Monitor at 9600 baud. Power the supply before you expect the servos to hold.$s18o18desc$,
  tip = $s18o18tip$If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.$s18o18tip$,
  blocks = $s18o18blocks$[{"type":"text","heading":"Before you upload","body":"Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in. Include Servo.h is enough — do not install a third-party servo library for this sketch."},{"type":"text","heading":"How to upload","body":"Paste the combined sketch from the previous step. Apply supply power so the servos have 5V. Click Upload, then open Serial Monitor at 9600 baud. Keep clear of the bracket; the servos will seek 90° on attach."},{"type":"test","body":"Upload once. Watch Serial for “Pan-tilt ready.”"},{"type":"expected","heading":"Expected result","body":"The IDE reports Done uploading. Serial prints “Pan-tilt ready.” Both servos should sit near mid-travel and hold, not chatter, with the stick at rest."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"No serial port","solution":"Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port."},{"problem":"Upload error / avrdude","solution":"Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy."},{"problem":"Board resets when servos move","solution":"Servo VCC is on Uno 5V or the supply is missing. Move both reds to the servo 5 V rail and confirm common GND."}]}]$s18o18blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 18;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s18o19stage$Calibrate and Test$s18o19stage$,
  title = $s18o19title$Test Individual Movements$s18o19title$,
  description = $s18o19desc$Move the stick on one axis at a time. Confirm pan yaws the base and tilt nods the plate, and note if either axis is reversed.$s18o19desc$,
  tip = $s18o19tip$Keep the camera plate lightly loaded until direction is confirmed.$s18o19tip$,
  blocks = $s18o19blocks$[{"type":"test","body":"Leave the stick centred, then move only left/right. Watch the base. Return to centre, then move only up/down. Watch the plate. Click SW once."},{"type":"expected","heading":"Expected result","body":"Left/right yaws pan only. Up/down nods tilt only. At rest both hold. A click returns both to about 90°. Serial angles change while the stick is deflected and freeze inside the deadzone."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Pan moves when you intend tilt","solution":"Swap the VRx and VRy wires at A0/A1, or swap JOY_X_PIN and JOY_Y_PIN in the sketch. The module axes may not match how the bracket is sitting on the desk."},{"problem":"An axis moves the wrong way","solution":"Invert that map() pair (PAN_MAX then PAN_MIN, or TILT_MAX then TILT_MIN). Do not reverse the 5V/GND leads to “fix” direction."},{"problem":"One servo is dead","solution":"Confirm that servo’s red is on servo 5 V, brown on common GND, and orange on D9 (pan) or D10 (tilt). A swapped red/orange can damage a pin — power off before you reseat."}]}]$s18o19blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 19;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s18o20stage$Calibrate and Test$s18o20stage$,
  title = $s18o20title$Calibrate Neutral Positions$s18o20title$,
  description = $s18o20desc$Command 90°, then reseat each horn so mid-code is mid-mechanism: plate level, U-bracket square on the base.$s18o20desc$,
  tip = $s18o20tip$Loosen the horn screw, lift the horn off the spline, and press it back on. Do not rotate the servo shaft against a powered motor.$s18o20tip$,
  blocks = $s18o20blocks$[{"type":"text","heading":"Why the horn comes off","body":"write(90) is a pulse, not a promise about the plastic. If you tightened the horn at an arbitrary spline, “90” can be a tilted plate. Click SW (or power up into the combined sketch) so both servos hold 90°, then power down before you pull a horn if you are not confident working around a live servo."},{"type":"test","body":"With both servos holding 90°, loosen the pan horn and reseat the U-bracket square over the base. Then loosen the tilt horn and reseat the camera plate level. Retighten the horn screws. Power up and click SW again."},{"type":"expected","heading":"Expected result","body":"After a click, the plate is level and the U-bracket is square. Small stick moves should travel evenly both ways before you hit PAN_MIN/MAX or the plastic stops."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"90° is still tilted after reseating","solution":"The horn only fits in discrete spline positions. Choose the spline closest to level, then trim TILT_CENTER (and PAN_CENTER) by a few degrees in the sketch if you need a last nudge."},{"problem":"The joint binds before 20° or 160°","solution":"Raise PAN_MIN / TILT_MIN or lower PAN_MAX / TILT_MAX until the bracket never hits itself. Limits are meant to be tighter than the servo’s full range."}]}]$s18o20blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 20;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s18o21stage$Calibrate and Test$s18o21stage$,
  title = $s18o21title$Test Combined Movement$s18o21title$,
  description = $s18o21desc$Aim on both axes, hold, recentre, and confirm the pin map still matches the complete wiring diagram.$s18o21desc$,
  tip = null,
  blocks = $s18o21blocks$[{"type":"image","imageKey":"servoCamera","caption":"Keep this GPIO map if you mount a camera later: pan D9, tilt D10, joystick A0 / A1 / D2."},{"type":"test","body":"Aim toward one corner, let the stick go (it should hold). Aim toward the opposite corner. Click SW to recentre. Repeat once with a lightweight camera or webcam on the plate if you have one, or leave the plate empty."},{"type":"expected","heading":"Expected result","body":"Both axes move together while the stick is deflected, hold when centred, and return to a level 90° on a click. No reset, no gearbox grind, no lead pulling tight. You have a joystick-aimed pan-tilt mount."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Servos chatter at rest","solution":"Increase DEADZONE (try 60), or set JOY_X_CENTER and JOY_Y_CENTER to the X and Y values Serial printed at rest. Confirm the joystick 5V is the Uno rail and GND is common. A floating VRx/VRy will never sit still."},{"problem":"Mechanism holds, then jumps","solution":"The servo rail is sagging. Use the GST18A05-P1J on the jack, center positive, and keep both servo reds off the Uno 5V pin."},{"problem":"Click does nothing","solution":"Confirm SW is on D2 and JOY_SW_PIN uses INPUT_PULLUP. SW should read 0 only while pressed. If it is always 0, the pin is shorted to GND."},{"problem":"USB disconnects when the mount moves","solution":"The Uno is supplying servo current. Recheck that both VCC (red) wires are on the servo 5 V rail and that supply GND is tied to Uno GND."}]},{"type":"connections","heading":"Pin map you built","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"5 V jack","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]}]$s18o21blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 21;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $s23o0stage$Introduction$s23o0stage$,
  title = $s23o0title$What the finished station does$s23o0title$,
  description = $s23o0desc$The ESP32 reads a BME280 and serves the readings on your own Wi-Fi network.$s23o0desc$,
  tip = null,
  blocks = $s23o0blocks$[{"type":"image","imageKey":"esp32WifiWeather","caption":"The finished station is an ESP32-DevKitC V4 and an Adafruit BME280 joined by one STEMMA QT cable, powered from USB. The wiring diagram is the connection reference."},{"type":"text","heading":"What you are building","body":"The finished station measures temperature in degrees Celsius, relative humidity in percent, and barometric pressure in hectopascals. The ESP32 DevKit joins a Wi-Fi network you choose and hosts a small web page. A phone or computer on that same network opens the page and sees the numbers update about every two seconds. Nothing is sent to a cloud service."},{"type":"expected","heading":"What done looks like","body":"The Serial Monitor prints an IP address such as 192.168.1.42, then repeating temperature, humidity, and pressure lines. A browser on the same local network opens that address and shows the same three readings."}]$s23o0blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 0;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s23o1stage$Hardware preparation$s23o1stage$,
  title = $s23o1title$Identify every required component$s23o1title$,
  description = $s23o1desc$Every physical item in this build is on the BOM. None of these parts is optional.$s23o1desc$,
  tip = $s23o1tip$A phone or computer is how you view the page. It is not a wired component, so it is not a BOM line.$s23o1tip$,
  blocks = $s23o1blocks$[{"type":"components","heading":"Required parts","items":[{"id":"esp32-devkitc-v4","name":"ESP32-DevKitC V4","illustrationId":"esp32","owned":false,"quantity":1},{"id":"bme280","name":"Adafruit BME280","illustrationId":"bme280","owned":false,"quantity":1},{"id":"stemma-qt-female","name":"STEMMA QT to female cable","illustrationId":"stemma-qt","owned":false,"quantity":1},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"text","heading":"What each part is for","body":"The ESP32 DevKit is the controller and the web server. This build uses an Espressif ESP32-DevKitC V4 with male pin headers. The Adafruit BME280 is the only sensor. Its STEMMA QT socket takes one cable, so you do not solder the breakout and you do not need a breadboard. The cable is Adafruit 4397: JST-SH on the sensor and four female sockets on the DevKit. The USB data cable is USB-A to Micro-B and must carry data. The USB power source is the computer port while you program, or a USB charger after the sketch is on the board."},{"type":"expected","heading":"Check","body":"You can point to one ESP32-DevKitC V4 with male headers, one Adafruit BME280 with a STEMMA QT socket, one Adafruit 4397 cable, one USB-A to Micro-B data cable, and a USB port or charger. A BMP280 board is not a substitute on this bench."}]$s23o1blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 1;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s23o2stage$Hardware preparation$s23o2stage$,
  title = $s23o2title$Confirm the ESP32 DevKit labels$s23o2title$,
  description = $s23o2desc$Use an Espressif ESP32-DevKitC V4 with male headers. A generic DevKit is not assumed to match it.$s23o2desc$,
  tip = $s23o2tip$Espressif’s ESP32-DevKitC V4 user guide lists a Micro-USB socket, a Boot button, an EN button, and either male or female headers.$s23o2tip$,
  blocks = $s23o2blocks$[{"type":"text","heading":"What to look for","body":"Solderi’s ESP32 DevKit row is only a 3.3 V board programmed with the Arduino-ESP32 package. It does not record one outline or one connector. This project’s mechanical steps are for the Espressif ESP32-DevKitC V4 with male pin headers. Its user guide puts 3V3 on header J2 and IO22 plus IO21 on header J3, so the wires use both sides of the board. Arduino-ESP32’s generic ESP32 default I2C pins are GPIO21 for SDA and GPIO22 for SCL. The male pins are already fitted. Do not solder the DevKit."},{"type":"text","heading":"USB socket and fit","body":"The DevKitC V4 user guide names a Micro-USB port as the default power supply and sells male-header and female-header versions. This build uses the male-header board. The four female sockets on the STEMMA QT cable push onto those pins, so the board does not have to straddle a breadboard. Use a USB-A to Micro-B cable that carries data. A charge-only cable can light the board and still never appear as a serial port. A USB-C cable does not fit this socket."},{"type":"warning","body":"If the silkscreen does not show 3V3, GND, IO21 or GPIO21, and IO22 or GPIO22, stop. If the headers are female sockets, stop: the cable’s female sockets will not mate with them. Do not move the wires onto an ESP32-CAM or another module. Espressif warns that DevKitC V4 power must come from only one of USB, the 5V pin, or the 3V3 pin."}]$s23o2blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 2;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s23o3stage$Hardware preparation$s23o3stage$,
  title = $s23o3title$Confirm the BME280 pin labels$s23o3title$,
  description = $s23o3desc$Use the current Adafruit STEMMA QT breakout. Do not solder its header.$s23o3desc$,
  tip = $s23o3tip$Leave 3Vo, SDO, CS, and the ADDR jumper empty for this project.$s23o3tip$,
  blocks = $s23o3blocks$[{"type":"text","heading":"Pins this project uses","body":"Adafruit’s BME280 pinout names Vin, 3Vo, GND, SCK, SDO, SDI, and CS. Vin is the power input and accepts 3–5 V. This project feeds Vin from the ESP32 3V3 pin. Adafruit says the logic level follows Vin, and the ESP32 DevKit’s GPIO is 3.3 V, so Vin must not be tied to 5 V. 3Vo is a 3.3 V output from the breakout’s regulator. Leave it unconnected. GND is the common ground."},{"type":"text","heading":"I2C pins and address","body":"SCK is the I2C clock and connects to IO22. SDI is the I2C data and connects to IO21. Adafruit’s I2C wiring uses those two signal pins plus Vin and GND, and says to leave the other pins disconnected. The default address is 0x77. A jumper from SDO to GND, or soldering the ADDR jumper on the back, changes the address to 0x76, which this sketch does not scan. Adafruit’s I2C page does not add a separate pull-up resistor, so this project does not put one on the BOM."},{"type":"text","heading":"How you connect it without soldering","body":"Adafruit’s current product 2652 is the STEMMA QT board. The BME280 chip is already soldered to that PCB. The loose 0.1 inch header is not soldered, and this project does not solder it. Plug an Adafruit 4397 cable into either STEMMA QT socket. That cable is JST-SH to four female sockets, about 150 mm. Adafruit’s colours are black for GND, red for VIN, blue for SDA, and yellow for SCL. Blue is SDI. Yellow is SCK. An older breakout with no STEMMA QT socket is not this build."},{"type":"expected","heading":"Check","body":"The board says BME280, has a STEMMA QT socket, and the cable is latched in. If the silk says BMP280, or there is no STEMMA QT socket, this wiring does not apply."}]$s23o3blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 3;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s23o4stage$Hardware preparation$s23o4stage$,
  title = $s23o4title$Seat the board and the sensor$s23o4title$,
  description = $s23o4desc$Latch the cable into the sensor. Leave the female sockets off the DevKit until the next steps. USB stays unplugged.$s23o4desc$,
  tip = $s23o4tip$The JST-SH plug latches. Do not force a male-ended STEMMA cable onto these male headers.$s23o4tip$,
  blocks = $s23o4blocks$[{"type":"text","heading":"What to do","body":"Set the DevKitC V4 and the BME280 beside each other. Latch the Adafruit 4397 cable into either STEMMA QT socket. Leave the four female sockets free. You should still be able to read 3V3, GND, IO21, and IO22 on the DevKit. Leave USB unplugged until the wiring check."},{"type":"wiring","heading":"Cable seated","connections":[],"assembly":{"parts":["bme280"],"jumpers":[]}},{"type":"expected","heading":"What you should see","body":"The sensor is beside the DevKit, the JST plug is latched, and the four female sockets are not on a header yet. Red, black, blue, and yellow are still free."}]$s23o4blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 4;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s23o5stage$Wiring$s23o5stage$,
  title = $s23o5title$Connect power and ground$s23o5title$,
  description = $s23o5desc$The red socket goes on 3V3. The black socket goes on GND.$s23o5desc$,
  tip = $s23o5tip$Red is VIN. Black is GND. This cable’s red wire is 3.3 V on this board, not 5 V.$s23o5tip$,
  blocks = $s23o5blocks$[{"type":"text","heading":"Connection sequence","body":"Push the red female socket onto the DevKit pin labelled 3V3. Push the black socket onto a GND pin. Adafruit’s colour order is black, red, blue, yellow, and the sockets are separate, so they can land on pins that are not next to each other. Do not connect ESP32 5V or BME280 3Vo. Leave blue and yellow for the next step."},{"type":"wiring","heading":"Power and ground","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"3V3","toComponent":"Adafruit BME280","toPin":"Vin","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Adafruit BME280","toPin":"GND","signal":"ground"}],"assembly":{"parts":[],"jumpers":["cable-vin","cable-gnd"]}},{"type":"connections","summary":"3V3 to Vin · GND to GND","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"3V3","toComponent":"Adafruit BME280","toPin":"Vin","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Adafruit BME280","toPin":"GND","signal":"ground"}]},{"type":"warning","body":"Adafruit says BME280 logic follows the voltage on Vin. Five volts on Vin would present 5 V logic to IO21 and IO22. The ESP32 DevKit is a 3.3 V board. Keep Vin on 3V3."}]$s23o5blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 5;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s23o6stage$Wiring$s23o6stage$,
  title = $s23o6title$Connect SDA and SCL$s23o6title$,
  description = $s23o6desc$IO21 goes to SDI. IO22 goes to SCK. Those are the only signal wires.$s23o6desc$,
  tip = $s23o6tip$SDA is data. SCL is clock. On this breakout the silk says SDI and SCK, not SDA and SCL.$s23o6tip$,
  blocks = $s23o6blocks$[{"type":"text","heading":"Connection sequence","body":"Push the blue socket onto IO21. That is SDI. Push the yellow socket onto IO22. That is SCK. Those two pins are on header J3, not next to 3V3. Leave SDO open so the address stays 0x77. Leave CS open and leave the ADDR jumper unsoldered."},{"type":"wiring","heading":"I2C signals","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO21","toComponent":"Adafruit BME280","toPin":"SDI","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO22","toComponent":"Adafruit BME280","toPin":"SCK","signal":"signal"}],"assembly":{"parts":[],"jumpers":["cable-sdi","cable-sck"]}},{"type":"connections","summary":"IO21 to SDI · IO22 to SCK","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO21","toComponent":"Adafruit BME280","toPin":"SDI","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO22","toComponent":"Adafruit BME280","toPin":"SCK","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Blue is on IO21 only. Yellow is on IO22 only. Red is on 3V3 only. Black is on GND only. No socket is on 5V, 3Vo, SDO, or CS."}]$s23o6blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 6;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s23o7stage$Wiring$s23o7stage$,
  title = $s23o7title$Read the complete wiring table$s23o7title$,
  description = $s23o7desc$These four cable wires are the whole circuit. The sketch uses the same GPIO numbers.$s23o7desc$,
  tip = null,
  blocks = $s23o7blocks$[{"type":"wiring","heading":"Complete wiring diagram","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"3V3","toComponent":"Adafruit BME280","toPin":"Vin","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Adafruit BME280","toPin":"GND","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO21","toComponent":"Adafruit BME280","toPin":"SDI","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO22","toComponent":"Adafruit BME280","toPin":"SCK","signal":"signal"}]},{"type":"connections","heading":"Every electrical connection","summary":"IO21 SDA · IO22 SCL · 3V3 Vin · common GND · address 0x77","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"3V3","toComponent":"Adafruit BME280","toPin":"Vin","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Adafruit BME280","toPin":"GND","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO21","toComponent":"Adafruit BME280","toPin":"SDI","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO22","toComponent":"Adafruit BME280","toPin":"SCK","signal":"signal"}]},{"type":"text","heading":"How this matches the sketch","body":"The firmware sets I2C_SDA to 21 and I2C_SCL to 22, then calls Wire.begin(I2C_SDA, I2C_SCL) and bme.begin(0x77). GPIO21 is the header labelled IO21. GPIO22 is the header labelled IO22. There is no other GPIO in this project. The diagram shows the four cable sockets on those pins. Blue is SDI and yellow is SCK. Red is 3V3, not 5 V."}]$s23o7blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 7;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s23o8stage$Wiring$s23o8stage$,
  title = $s23o8title$Check the circuit before you apply power$s23o8title$,
  description = $s23o8desc$Look once more, then connect USB. Do not also feed the 5V or 3V3 header from a second supply.$s23o8desc$,
  tip = $s23o8tip$Espressif’s DevKitC V4 guide says USB, the 5V pin, and the 3V3 pin are mutually exclusive power inputs.$s23o8tip$,
  blocks = $s23o8blocks$[{"type":"test","heading":"What to verify","body":"Count one four-wire cable. Red is on 3V3 only. Black is on GND only. Blue is on IO21 only. Yellow is on IO22 only. SDO, CS, and ADDR are untouched. The USB cable is not yet plugged in, and nothing is connected to the 5V pin."},{"type":"text","heading":"Then apply power","body":"Plug the data cable into the DevKit and into the computer USB port you will use for upload. On an ESP32-DevKitC V4, the 5V Power On LED lights when USB power is present. If you later move the board to a USB charger, unplug the computer first so only one power source is connected."},{"type":"expected","heading":"Expected result","body":"The board’s power LED is on. The sensor does not get hot. A quiet Serial Monitor is not required: the board may already contain a sketch that prints. You will replace that sketch when you upload."}]$s23o8blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 8;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s23o9stage$Development environment$s23o9stage$,
  title = $s23o9title$Install the ESP32 board package$s23o9title$,
  description = $s23o9desc$The Arduino IDE needs Espressif’s ESP32 package before this board appears in the Board menu.$s23o9desc$,
  tip = $s23o9tip$Use the stable package URL. The development URL is a different, less settled package.$s23o9tip$,
  blocks = $s23o9blocks$[{"type":"text","heading":"What to do","body":"Install the current Arduino IDE from arduino.cc. Open File > Preferences, or Arduino IDE > Settings. In Additional boards manager URLs, add https://espressif.github.io/arduino-esp32/package_esp32_index.json and click OK. Open Tools > Board > Boards Manager, search for esp32 by Espressif Systems, and install the esp32 platform. Restart the IDE if the new board list does not appear."},{"type":"text","heading":"Why this package","body":"WiFi.h and WebServer.h come from that ESP32 package. They are not separate Library Manager installs. The generic ESP32 I2C defaults in that package are GPIO21 and GPIO22, which is why the sketch still names those pins explicitly."},{"type":"expected","heading":"What you should see","body":"Boards Manager shows the esp32 package as installed. Tools > Board contains an ESP32 Arduino group."}]$s23o9blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 9;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s23o10stage$Development environment$s23o10stage$,
  title = $s23o10title$Select the board and the serial port$s23o10title$,
  description = $s23o10desc$Choose ESP32 Dev Module, then the port that appears when the data cable is plugged in.$s23o10desc$,
  tip = $s23o10tip$If the port never appears, try another cable before you change any wiring.$s23o10tip$,
  blocks = $s23o10blocks$[{"type":"text","heading":"Board","body":"Open Tools > Board > ESP32 Arduino and choose ESP32 Dev Module. That is the generic ESP32 target for this DevKit. Do not choose ESP32-CAM or an S2, S3, or C3 board. Leave the other Tools menu flash settings at the ESP32 Dev Module defaults unless a later upload error tells you to change one."},{"type":"text","heading":"Port","body":"Plug in the data cable. Open Tools > Port and select the new port. On Windows it is a COM port. On macOS it is a /dev/cu.usbserial or /dev/cu.SLAB port. Unplug the cable and open the menu again: the correct port is the one that disappears. Select it again after you plug the cable back in."},{"type":"troubleshooting","heading":"If the port is missing","items":[{"problem":"No new port appears","solution":"The cable may be charge-only, or it may be in the wrong socket. Use a data cable that fits the DevKit. Then reopen Tools > Port."},{"problem":"Several ports are listed","solution":"Unplug the DevKit, see which port vanishes, and select that one after reconnecting."}]}]$s23o10blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 10;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s23o11stage$Development environment$s23o11stage$,
  title = $s23o11title$Install the BME280 libraries$s23o11title$,
  description = $s23o11desc$Library Manager installs Adafruit BME280 Library together with its two dependencies.$s23o11desc$,
  tip = $s23o11tip$Search for the library name Adafruit BME280 Library. Do not install a BMP280-only library in its place.$s23o11tip$,
  blocks = $s23o11blocks$[{"type":"text","heading":"What to install","body":"Open Tools > Manage Libraries. Search for Adafruit BME280 Library and install it. Its library.properties file depends on Adafruit Unified Sensor and Adafruit BusIO. Accept the prompt to install those dependencies if the IDE offers it. If it does not, install both by those names from Library Manager as well."},{"type":"text","heading":"What you do not install","body":"Do not install a separate Wi-Fi or web-server library. WiFi.h and WebServer.h are part of the ESP32 board package from the previous step. Do not install Adafruit BMP280 Library for this sketch. The include line is Adafruit_BME280.h, and begin() is the BME280 call."},{"type":"expected","heading":"Check","body":"Library Manager shows Adafruit BME280 Library, Adafruit Unified Sensor, and Adafruit BusIO as installed."}]$s23o11blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 11;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s23o12stage$Development environment$s23o12stage$,
  title = $s23o12title$Set the Serial Monitor to 115200 baud$s23o12title$,
  description = $s23o12desc$The sketch calls Serial.begin(115200). A mismatched baud rate looks like garbage text, not a dead board.$s23o12desc$,
  tip = null,
  blocks = $s23o12blocks$[{"type":"text","heading":"What to do","body":"Open Tools > Serial Monitor. In the baud menu at the corner of the monitor, choose 115200. Leave the line ending on Newline. You will not see the weather lines until the sketch is uploaded, but setting the speed now avoids mistaking baud noise for a failed sensor."},{"type":"expected","heading":"What you should observe","body":"The monitor is open on the same port you selected for upload, and the baud value reads 115200. If you later see repeated characters that are not words, the baud setting has been changed."}]$s23o12blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 12;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s23o13stage$Firmware$s23o13stage$,
  title = $s23o13title$Create the sketch and set the Wi-Fi name$s23o13title$,
  description = $s23o13desc$Replace the two placeholders with your network name and password. Do not commit a real password into a shared copy.$s23o13desc$,
  tip = $s23o13tip$The network must be 2.4 GHz. The ESP32 DevKit radio in this project does not join a 5 GHz-only network.$s23o13tip$,
  blocks = $s23o13blocks$[{"type":"text","heading":"What to do","body":"Create a sketch named esp32_wifi_weather_station. Do not upload it yet. The code below is an excerpt of the finished program, not a sketch on its own. The only lines you will edit, once the complete program is pasted, are the two Wi-Fi placeholders. The SSID is your network name. Use the password for that same network. Your phone or computer must be able to join it as well."},{"type":"code","language":"Arduino","filename":"Excerpt only — not a complete sketch","libraries":["WiFi (ESP32 Arduino core)","WebServer (ESP32 Arduino core)","Wire (Arduino core)","Adafruit Unified Sensor","Adafruit BusIO","Adafruit BME280 Library"],"code":"const char *WIFI_SSID = \"YOUR_WIFI_NAME\";\nconst char *WIFI_PASSWORD = \"YOUR_WIFI_PASSWORD\";"},{"type":"code_explanation","heading":"Why these constants","body":"WIFI_SSID and WIFI_PASSWORD are ordinary C strings. YOUR_WIFI_NAME and YOUR_WIFI_PASSWORD are placeholders, not a working network. The rest of the sketch reads these two names, so you do not type the password anywhere else."}]$s23o13blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 13;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s23o14stage$Firmware$s23o14stage$,
  title = $s23o14title$Start I2C and the BME280$s23o14title$,
  description = $s23o14desc$The sketch opens GPIO21 and GPIO22, then looks for address 0x77.$s23o14desc$,
  tip = null,
  blocks = $s23o14blocks$[{"type":"text","heading":"What this code does","body":"This is another excerpt, not a second sketch. Wire.begin(21, 22) starts the hardware I2C peripheral on the same pins as the wiring table. bme.begin(0x77) asks the Adafruit library, the version that provides begin(uint8_t addr), to initialise the sensor on that address. A true result means the chip answered. A false result is stored as an error and printed. The web server still starts, so a browser that can reach the board can show that error."},{"type":"code","language":"Arduino","filename":"Excerpt only — not a complete sketch","libraries":["Wire","Adafruit BME280 Library","Adafruit Unified Sensor","Adafruit BusIO"],"code":"Wire.begin(I2C_SDA, I2C_SCL);\n  sensorReady = bme.begin(BME280_I2C_ADDRESS);"},{"type":"code_explanation","body":"readTemperature() returns degrees Celsius, readHumidity() returns percent, and readPressure() returns pascals as a float in the current Adafruit_BME280.h. The sketch divides pascals by 100 to show hectopascals. A NaN value becomes the invalid-reading error instead of a number on the page."}]$s23o14blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 14;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s23o15stage$Firmware$s23o15stage$,
  title = $s23o15title$Serve the page and the JSON endpoint$s23o15title$,
  description = $s23o15desc$The ESP32 answers / with HTML and /readings with the latest measurements.$s23o15desc$,
  tip = $s23o15tip$The page asks /readings every two seconds. You do not refresh the browser by hand.$s23o15tip$,
  blocks = $s23o15blocks$[{"type":"text","heading":"What this code does","body":"This excerpt is also part of the same program. WebServer server(80) listens on the normal web port. server.on registers two GET routes. handleRoot sends the dashboard HTML. handleReadings sends JSON fields ok, temperature_c, humidity_percent, pressure_hpa, wifi_connected, ip, and error. The HTML uses fetch(\"/readings\") and setInterval(..., 2000). It does not load fonts or scripts from the internet."},{"type":"code","language":"Arduino","filename":"Excerpt only — not a complete sketch","libraries":["WebServer (ESP32 Arduino core)"],"code":"server.on(\"/\", HTTP_GET, handleRoot);\n  server.on(\"/readings\", HTTP_GET, handleReadings);\n  server.begin();"},{"type":"code_explanation","body":"loop() calls server.handleClient() every pass so a browser that can still reach the board gets an answer. Wi-Fi retries are timed with millis() and WIFI_RETRY_MS. There is no while-loop waiting forever for a network. If the ESP32 leaves Wi-Fi, Serial prints “Connecting to Wi-Fi...” on the next retry. The page’s “Wi-Fi disconnected” text is sent only inside a successful /readings response. A browser that can no longer reach the ESP32 does not get that response. It shows “Dashboard not updating” instead."}]$s23o15blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 15;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s23o16stage$Firmware$s23o16stage$,
  title = $s23o16title$Paste the complete sketch and upload it$s23o16title$,
  description = $s23o16desc$This is the only program to paste and upload. The earlier code blocks were excerpts of it.$s23o16desc$,
  tip = $s23o16tip$If the upload times out, hold the Boot button, press and release EN, then release Boot and try again. That is the DevKitC V4 download-mode sequence.$s23o16tip$,
  blocks = $s23o16blocks$[{"type":"code","language":"Arduino","filename":"esp32_wifi_weather_station.ino","libraries":["WiFi (ESP32 Arduino core)","WebServer (ESP32 Arduino core)","Wire (Arduino core)","Adafruit Unified Sensor","Adafruit BusIO","Adafruit BME280 Library"],"code":"/*\n * ESP32 Wi-Fi Weather Station\n * Board: ESP32 Dev Module\n * Sensor: Adafruit BME280 over I2C at 0x77\n * IO21 = SDA = BME280 SDI\n * IO22 = SCL = BME280 SCK\n * 3V3 = BME280 Vin\n * GND = BME280 GND\n */\n\n#include <WiFi.h>\n#include <WebServer.h>\n#include <Wire.h>\n#include <Adafruit_Sensor.h>\n#include <Adafruit_BME280.h>\n\nconst char *WIFI_SSID = \"YOUR_WIFI_NAME\";\nconst char *WIFI_PASSWORD = \"YOUR_WIFI_PASSWORD\";\n\nconst int I2C_SDA = 21;\nconst int I2C_SCL = 22;\nconst uint8_t BME280_I2C_ADDRESS = 0x77;\n\nconst unsigned long SENSOR_INTERVAL_MS = 2000;\nconst unsigned long WIFI_RETRY_MS = 5000;\n\nAdafruit_BME280 bme;\nWebServer server(80);\n\nbool sensorReady = false;\nString sensorError = \"Sensor has not been read yet.\";\nfloat temperatureC = NAN;\nfloat humidityPercent = NAN;\nfloat pressureHpa = NAN;\nunsigned long lastSensorReadMs = 0;\nunsigned long lastWifiAttemptMs = 0;\nbool wifiWasConnected = false;\n\nbool readingIsValid(float value) {\n  return !isnan(value);\n}\n\nvoid readSensor() {\n  if (!sensorReady) {\n    sensorError = \"BME280 was not found at address 0x77.\";\n    temperatureC = NAN;\n    humidityPercent = NAN;\n    pressureHpa = NAN;\n    return;\n  }\n\n  float nextTemperature = bme.readTemperature();\n  float nextHumidity = bme.readHumidity();\n  float nextPressurePa = bme.readPressure();\n\n  if (!readingIsValid(nextTemperature) || !readingIsValid(nextHumidity) || !readingIsValid(nextPressurePa)) {\n    sensorError = \"BME280 returned an invalid reading.\";\n    temperatureC = NAN;\n    humidityPercent = NAN;\n    pressureHpa = NAN;\n    return;\n  }\n\n  temperatureC = nextTemperature;\n  humidityPercent = nextHumidity;\n  pressureHpa = nextPressurePa / 100.0f;\n  sensorError = \"\";\n}\n\nvoid connectWifi() {\n  if (WiFi.status() == WL_CONNECTED) {\n    return;\n  }\n\n  unsigned long now = millis();\n  if (lastWifiAttemptMs != 0 && now - lastWifiAttemptMs < WIFI_RETRY_MS) {\n    return;\n  }\n\n  lastWifiAttemptMs = now;\n  Serial.println(\"Connecting to Wi-Fi...\");\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n}\n\nString jsonNumber(float value) {\n  if (!readingIsValid(value)) {\n    return \"null\";\n  }\n  return String(value, 2);\n}\n\nString readingsJson() {\n  bool wifiConnected = WiFi.status() == WL_CONNECTED;\n  String json = \"{\";\n  json += \"\\\"ok\\\":\";\n  json += sensorError.length() == 0 ? \"true\" : \"false\";\n  json += \",\\\"temperature_c\\\":\";\n  json += jsonNumber(temperatureC);\n  json += \",\\\"humidity_percent\\\":\";\n  json += jsonNumber(humidityPercent);\n  json += \",\\\"pressure_hpa\\\":\";\n  json += jsonNumber(pressureHpa);\n  json += \",\\\"wifi_connected\\\":\";\n  json += wifiConnected ? \"true\" : \"false\";\n  json += \",\\\"ip\\\":\\\"\";\n  json += wifiConnected ? WiFi.localIP().toString() : \"\";\n  json += \"\\\",\\\"error\\\":\\\"\";\n  json += sensorError;\n  json += \"\\\"}\";\n  return json;\n}\n\nconst char DASHBOARD_PAGE[] PROGMEM = R\"HTML(<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>ESP32 Weather</title>\n<style>\nbody{margin:0;background:#0f172a;color:#e2e8f0;font-family:sans-serif}\nmain{max-width:28rem;margin:0 auto;padding:1.25rem}\nh1{font-size:1.35rem}\n.grid{display:grid;gap:.75rem}\n.card{background:#1e293b;border-radius:12px;padding:1rem}\n.label{color:#94a3b8;font-size:.85rem}\n.value{font-size:2rem;margin-top:.25rem}\n.error{background:#7f1d1d;border-radius:12px;padding:.75rem 1rem}\n</style>\n</head>\n<body>\n<main>\n<h1>ESP32 Wi-Fi Weather Station</h1>\n<p id=\"status\">Waiting for readings.</p>\n<p id=\"error\" class=\"error\" hidden></p>\n<div class=\"grid\">\n<section class=\"card\"><div class=\"label\">Temperature</div><div id=\"temperature\" class=\"value\">-</div></section>\n<section class=\"card\"><div class=\"label\">Humidity</div><div id=\"humidity\" class=\"value\">-</div></section>\n<section class=\"card\"><div class=\"label\">Pressure</div><div id=\"pressure\" class=\"value\">-</div></section>\n</div>\n</main>\n<script>\nfunction show(id, text){document.getElementById(id).textContent = text;}\nasync function refresh(){\n  var status = document.getElementById(\"status\");\n  var error = document.getElementById(\"error\");\n  try {\n    var response = await fetch(\"/readings\");\n    if (!response.ok) { throw new Error(\"request failed\"); }\n    var data = await response.json();\n    status.textContent = data.wifi_connected ? \"Connected at \" + data.ip : \"Wi-Fi disconnected\";\n    if (data.ok) {\n      error.hidden = true;\n      show(\"temperature\", Number(data.temperature_c).toFixed(1) + \" C\");\n      show(\"humidity\", Number(data.humidity_percent).toFixed(1) + \" %\");\n      show(\"pressure\", Number(data.pressure_hpa).toFixed(1) + \" hPa\");\n    } else {\n      error.hidden = false;\n      error.textContent = data.error || \"Sensor reading unavailable\";\n      show(\"temperature\", \"-\");\n      show(\"humidity\", \"-\");\n      show(\"pressure\", \"-\");\n    }\n  } catch (err) {\n    status.textContent = \"Dashboard not updating\";\n    error.hidden = false;\n    error.textContent = \"This browser could not read /readings. Use the ESP32 IP on the same Wi-Fi network.\";\n  }\n}\nrefresh();\nsetInterval(refresh, 2000);\n</script>\n</body>\n</html>)HTML\";\n\nvoid handleRoot() {\n  server.send(200, \"text/html\", DASHBOARD_PAGE);\n}\n\nvoid handleReadings() {\n  server.send(200, \"application/json\", readingsJson());\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  delay(500);\n  Serial.println();\n  Serial.println(\"ESP32 Wi-Fi weather station\");\n\n  Wire.begin(I2C_SDA, I2C_SCL);\n  sensorReady = bme.begin(BME280_I2C_ADDRESS);\n  if (sensorReady) {\n    Serial.println(\"BME280 ready at 0x77.\");\n  } else {\n    sensorError = \"BME280 was not found at address 0x77.\";\n    Serial.println(sensorError);\n    Serial.println(\"Leave SDO unconnected for 0x77. A wire from SDO to GND selects 0x76, which this sketch does not use.\");\n  }\n\n  WiFi.mode(WIFI_STA);\n  connectWifi();\n\n  server.on(\"/\", HTTP_GET, handleRoot);\n  server.on(\"/readings\", HTTP_GET, handleReadings);\n  server.begin();\n  Serial.println(\"HTTP server started on port 80.\");\n}\n\nvoid loop() {\n  bool wifiConnected = WiFi.status() == WL_CONNECTED;\n  if (!wifiConnected) {\n    wifiWasConnected = false;\n    connectWifi();\n  } else if (!wifiWasConnected) {\n    wifiWasConnected = true;\n    Serial.print(\"Wi-Fi connected. IP address: \");\n    Serial.println(WiFi.localIP());\n  }\n\n  server.handleClient();\n\n  unsigned long now = millis();\n  if (now - lastSensorReadMs >= SENSOR_INTERVAL_MS) {\n    lastSensorReadMs = now;\n    readSensor();\n    if (sensorError.length() == 0) {\n      Serial.print(\"Temperature C: \");\n      Serial.print(temperatureC, 1);\n      Serial.print(\"  Humidity %: \");\n      Serial.print(humidityPercent, 1);\n      Serial.print(\"  Pressure hPa: \");\n      Serial.println(pressureHpa, 1);\n    } else {\n      Serial.println(sensorError);\n    }\n  }\n}\n"},{"type":"text","heading":"Upload","body":"Select everything already in the sketch and replace it with the complete program above. Do not append it under an excerpt. Change YOUR_WIFI_NAME and YOUR_WIFI_PASSWORD to your SSID and password. Click Upload. Wait until the IDE prints “Hard resetting via RTS pin...” or the equivalent done message. Then open the Serial Monitor at 115200 baud. Do not change IO21, IO22, or 0x77 unless you also change the wiring."},{"type":"expected","heading":"What you should observe","body":"The IDE finishes the upload without a port error. The Serial Monitor then prints “ESP32 Wi-Fi weather station” and either the sensor-ready line or the not-found line."}]$s23o16blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 16;

update public.project_steps as step
set
  stage_sort_order = 5,
  stage_title = $s23o17stage$First run$s23o17stage$,
  title = $s23o17title$Read the Serial Monitor$s23o17title$,
  description = $s23o17desc$The first lines tell you whether the sensor answered and whether Wi-Fi has been attempted.$s23o17desc$,
  tip = null,
  blocks = $s23o17blocks$[{"type":"text","heading":"What to do","body":"Leave the USB cable on the computer. Open Tools > Serial Monitor at 115200 baud. Press the EN button once if you want a clean restart. Watch the first five seconds."},{"type":"expected","heading":"A healthy start","body":"You should see “ESP32 Wi-Fi weather station”, then “BME280 ready at 0x77.”, then “Connecting to Wi-Fi...”, then “HTTP server started on port 80.” When the network accepts the board, the next line is “Wi-Fi connected. IP address:” followed by a number. After that, temperature, humidity, and pressure print about every two seconds."},{"type":"troubleshooting","heading":"If the text is wrong","items":[{"problem":"The monitor shows symbols instead of words","solution":"Set the baud rate to 115200. The sketch does not use 9600."},{"problem":"Nothing is printed","solution":"Confirm the port is the DevKit port and that the upload finished. Press EN once."}]}]$s23o17blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 17;

update public.project_steps as step
set
  stage_sort_order = 5,
  stage_title = $s23o18stage$First run$s23o18stage$,
  title = $s23o18title$Find the ESP32 IP address$s23o18title$,
  description = $s23o18desc$The address is printed only after Wi-Fi connects. The dashboard uses that address.$s23o18desc$,
  tip = $s23o18tip$Write the address down. It can change if the router hands out a new lease later.$s23o18tip$,
  blocks = $s23o18blocks$[{"type":"text","heading":"What to look for","body":"Find the line “Wi-Fi connected. IP address:”. The four numbers after it, such as 192.168.1.42, are the local address. The sketch also puts that address in the JSON field ip. If the monitor keeps printing “Connecting to Wi-Fi...” every five seconds, the join has not succeeded and there is no page to open yet."},{"type":"expected","heading":"Expected result","body":"One IPv4 address is printed, and it stays stable across the next sensor lines. If it is 192.168.1.42, the dashboard URL is http://192.168.1.42. Use the numbers from your own Serial Monitor."}]$s23o18blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 18;

update public.project_steps as step
set
  stage_sort_order = 5,
  stage_title = $s23o19stage$First run$s23o19stage$,
  title = $s23o19title$Confirm the sensor readings$s23o19title$,
  description = $s23o19desc$Temperature, humidity, and pressure should be plausible for the room before you trust the web page.$s23o19desc$,
  tip = $s23o19tip$Breathing gently across the sensor should move humidity. Do not cover the board so tightly that it overheats.$s23o19tip$,
  blocks = $s23o19blocks$[{"type":"text","heading":"What to do","body":"Read several Serial lines. Temperature is printed in C, humidity in %, and pressure in hPa. Compare the temperature with the room and the pressure with a local weather report. The report will not match to the last digit; it should be in the same neighbourhood, often near 1000 hPa at low altitude. Then breathe across the sensor and watch humidity."},{"type":"expected","heading":"Expected result","body":"The three numbers keep updating. Humidity moves when you breathe on the sensor. Temperature does not jump by tens of degrees. If the monitor says “BME280 returned an invalid reading.” or the not-found message, fix the sensor before opening the dashboard."}]$s23o19blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 19;

update public.project_steps as step
set
  stage_sort_order = 6,
  stage_title = $s23o20stage$Dashboard$s23o20stage$,
  title = $s23o20title$Open the web interface$s23o20title$,
  description = $s23o20desc$Use the IP address from the Serial Monitor. Do not search for the board on the public internet.$s23o20desc$,
  tip = $s23o20tip$Include http:// if the browser tries to search for the numbers instead of opening them.$s23o20tip$,
  blocks = $s23o20blocks$[{"type":"text","heading":"What to do","body":"On a phone or computer that can reach the ESP32, open http:// and the IP address from the Serial Monitor, for example http://192.168.1.42. Include http:// so the browser does not search for the numbers. The ESP32 returns the dashboard for /. Leave that tab open. The page does not need an internet connection. It does need a path across your local network. A guest network, or a router setting called client isolation or AP isolation, can put two devices on the same SSID and still block this page."},{"type":"expected","heading":"What you should see","body":"The title is “ESP32 Wi-Fi Weather Station”. A status line says “Connected at” and the IP address. Three cards show temperature, humidity, and pressure. The values change without a manual reload. If the sensor failed, a red error box shows the same message as the Serial Monitor and the cards show a dash."}]$s23o20blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 20;

update public.project_steps as step
set
  stage_sort_order = 6,
  stage_title = $s23o21stage$Dashboard$s23o21stage$,
  title = $s23o21title$Use the page on a phone and a computer$s23o21title$,
  description = $s23o21desc$Any browser on the same local network can open the station. A device on mobile data cannot.$s23o21desc$,
  tip = $s23o21tip$If the phone is on cellular data, join the same Wi-Fi network as the ESP32 first.$s23o21tip$,
  blocks = $s23o21blocks$[{"type":"text","heading":"What to do","body":"Open the same http:// address on a second device that is on the main Wi-Fi network, not on mobile data and not on a guest network. The page layout is a single column with large type so it fits a phone width. Both devices should show the same reading within one refresh. Leave the router running. Unplugging it does not make the open page display “Wi-Fi disconnected”; the browser loses /readings and shows “Dashboard not updating”."},{"type":"expected","heading":"Expected result","body":"Both browsers show the dashboard. The status line includes the IP address while Wi-Fi is connected. Closing the Serial Monitor does not stop the page, because the page is served by the ESP32, not by the Arduino IDE."}]$s23o21blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 21;

update public.project_steps as step
set
  stage_sort_order = 7,
  stage_title = $s23o22stage$Troubleshooting$s23o22stage$,
  title = $s23o22title$The ESP32 is not detected or the upload fails$s23o22title$,
  description = $s23o22desc$Fix the cable, the port, and the boot button before you change the circuit.$s23o22desc$,
  tip = null,
  blocks = $s23o22blocks$[{"type":"troubleshooting","heading":"Board and upload","items":[{"problem":"The ESP32 never appears as a port","solution":"Use a USB-A to Micro-B data cable directly into the computer, select Tools > Port again, and confirm the power LED is on. A charge-only cable can light the LED and still provide no serial port. The DevKitC V4 guide names a USB-to-UART bridge and does not name a Windows driver in that component table. Read the chip beside the USB socket. Install the Silicon Labs CP210x VCP driver when the chip says CP2102 or CP2102N. Install a WCH CH340 driver only when the chip says CH340."},{"problem":"Upload times out or cannot connect","solution":"Confirm the board is ESP32 Dev Module and the port is the one that disappears when you unplug the cable. Hold Boot, tap EN, release Boot, and upload again. That is the DevKitC V4 firmware-download sequence."},{"problem":"The IDE cannot find WiFi.h or WebServer.h","solution":"The ESP32 board package is not selected or not installed. Install the esp32 package from the stable Espressif boards URL and choose ESP32 Dev Module."}]}]$s23o22blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 22;

update public.project_steps as step
set
  stage_sort_order = 7,
  stage_title = $s23o23stage$Troubleshooting$s23o23stage$,
  title = $s23o23title$The sensor, Wi-Fi, or dashboard fails$s23o23title$,
  description = $s23o23desc$The Serial line names the fault. Match it to the wiring or the network before rewriting the sketch.$s23o23desc$,
  tip = $s23o23tip$Adafruit notes that intermittent I2C on the original non-STEMMA BME280 can be improved by jumpering CS to Vin. Try that only after the four main wires are correct.$s23o23tip$,
  blocks = $s23o23blocks$[{"type":"troubleshooting","heading":"Sensor, network, and page","items":[{"problem":"Serial says the BME280 was not found at 0x77","solution":"Check red on 3V3, black on GND, blue on IO21, and yellow on IO22. Leave SDO open and do not solder the ADDR jumper. Either of those selects 0x76, and this sketch only calls begin(0x77). Do not edit the address to force a match unless the wiring steps change too. Confirm the board is a BME280 with a STEMMA QT socket, not a BMP280."},{"problem":"Serial says the BME280 returned an invalid reading","solution":"Power and ground are probably present because the chip answered begin(), but a later read failed. Reseat SCK and SDI, keep the wires short, and press EN to restart."},{"problem":"The monitor repeats “Connecting to Wi-Fi...”","solution":"Check the SSID and password, including capitals. The DevKit needs a 2.4 GHz network. The computer’s serial cable does not join Wi-Fi for the board; the board joins by itself."},{"problem":"The browser cannot open the IP address","solution":"Use http:// and the address from the latest “Wi-Fi connected” line, for example http://192.168.1.42. The phone or computer must be able to reach the ESP32. Mobile data cannot. A guest network or client isolation can block it even when both devices show the same Wi-Fi name. Use the main network. Internet access is not required."},{"problem":"The page stays on “Dashboard not updating”","solution":"The HTML loaded, then a later /readings request failed. That is the browser losing contact with the ESP32, not a reading that says Wi-Fi disconnected. Reload once. If Serial has stopped printing, press EN. If Serial still prints an IP address, confirm the browser is on the same local network and is not isolated from other devices."}]}]$s23o23blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 23;

update public.project_steps as step
set
  stage_sort_order = 9,
  stage_title = $s23o24stage$Final check$s23o24stage$,
  title = $s23o24title$Check the finished station$s23o24title$,
  description = $s23o24desc$Use this list before you treat the build as finished. It matches the learning objectives.$s23o24desc$,
  tip = $s23o24tip$A ticked box means you saw that result on your own board.$s23o24tip$,
  blocks = $s23o24blocks$[{"type":"test","heading":"Hardware","body":"The board is an ESP32-DevKitC V4 with male headers and a Micro-USB socket. The sensor is an Adafruit BME280 with an Adafruit 4397 cable, and no header was soldered. Red is on 3V3, black is on GND, blue is on IO21, and yellow is on IO22. Only one power source is connected."},{"type":"test","heading":"Firmware and Serial Monitor","body":"The uploaded file is the complete sketch, with your SSID and password in place of the placeholders. At 115200 baud, Serial prints “BME280 ready at 0x77.” and then “Wi-Fi connected. IP address:” plus an address. Temperature, humidity, and pressure follow about every two seconds. A not-found line or a repeating “Connecting to Wi-Fi...” line means that part is not finished."},{"type":"test","heading":"Dashboard","body":"On the main Wi-Fi network, http:// and that address, for example http://192.168.1.42, shows “Connected at”, temperature in C, humidity in %, and pressure in hPa. The numbers move without a manual reload. The page still loads if the wider internet is down, as long as the ESP32 and the browser can reach each other. A guest or isolated network may fail this check even though both devices joined Wi-Fi."},{"type":"expected","heading":"What this check does not prove","body":"Compare your Serial Monitor and browser with the lines above. If they differ, use the troubleshooting steps."}]$s23o24blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 24;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $s24o0stage$Introduction$s24o0stage$,
  title = $s24o0title$Build a phone-controlled colour light$s24o0title$,
  description = $s24o0desc$One RGB LED follows the colour and brightness a phone sends.$s24o0desc$,
  tip = null,
  blocks = $s24o0blocks$[{"type":"image","imageKey":"esp32BleRgb","caption":"The workbench photograph is not in the app yet. The wiring diagram is the connection reference."},{"type":"text","heading":"What you are building","body":"An ESP32 DevKit, three small transistors, and one RGB LED on a breadboard. The phone is the colour picker. The board does the switching."},{"type":"text","heading":"What it will do","body":"After you upload the sketch, the LED comes on red at a low brightness and the board advertises the name Solderi RGB. From the phone you can turn that light orange, purple, white, or off, and you can make it brighter or dimmer."}]$s24o0blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 0;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $s24o1stage$Introduction$s24o1stage$,
  title = $s24o1title$Follow one colour from the phone to the LED$s24o1title$,
  description = $s24o1desc$The phone sends text. The ESP32 switches current from the 5 V pin.$s24o1desc$,
  tip = null,
  blocks = $s24o1blocks$[{"type":"text","heading":"Four parts, four jobs","body":"The phone writes a colour such as 255,80,0. The ESP32 receives that text and sets three PWM outputs. PWM means the pin is switching on and off very quickly. A higher duty cycle means the pin stays on for more of each cycle, so that colour looks brighter. Each output drives one PN2222A transistor. The transistor connects that colour of the LED to ground. The LED itself takes its current from the DevKit 5 V pin, through a 220 Ω resistor."},{"type":"text","heading":"Why the transistor is there","body":"This LED is common anode: the shared pin is the positive side. A 3.3 V GPIO cannot light the green or blue chip directly, because those chips need more voltage than the pin can provide. The transistor lets the 5 V pin supply the LED while the GPIO only asks the transistor to turn on."},{"type":"warning","body":"Power the DevKit from USB only. With USB plugged in, the 5 V pin is an output, about 4.7 V after the board’s diode. Do not connect another supply to 5 V or 3.3 V at the same time. Do not connect a GPIO pin to 5 V or straight to an LED cathode."},{"type":"tip","body":"Use a USB port close to 5 V. On a weak port the green and blue chips can stay dark even when the wiring is right, because their forward voltage is already about 3.3 V and can be as high as 4.0 V and 4.1 V."}]$s24o1blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 1;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s24o2stage$Hardware preparation$s24o2stage$,
  title = $s24o2title$Set the parts on the desk$s24o2title$,
  description = $s24o2desc$Five male-to-female wires reach the DevKit. Eight male-to-male wires finish the board.$s24o2desc$,
  tip = null,
  blocks = $s24o2blocks$[{"type":"components","heading":"Required parts","items":[{"id":"esp32-devkitc-v4","name":"ESP32-DevKitC V4","illustrationId":"esp32","owned":false,"quantity":1},{"id":"rgb-led-ca","name":"Common-anode RGB LED","illustrationId":"led","owned":false,"quantity":1},{"id":"pn2222a","name":"PN2222A transistor","illustrationId":"generic-module","owned":false,"quantity":3},{"id":"resistor-220","name":"220 Ω resistor","illustrationId":"resistor-band-220","owned":false,"quantity":3},{"id":"resistor-1k","name":"1 kΩ resistor","illustrationId":"resistor-band-1k","owned":false,"quantity":3},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-male-female","name":"Male-to-female jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":5},{"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":8},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"text","heading":"Count the wires before you start","body":"The DevKit sits beside the board. Its pins do not plug into the breadboard. Take five male-to-female wires for 5 V, GND, GPIO25, GPIO26, and GPIO27. The parts list counts eight male-to-male wires: three emitters, the LED anode, one bridge on each of the + and − rails, the green link from b15 to j9, and the blue link from j12 to j8. A wire that arches over the board enters only the two holes named for it."},{"type":"text","body":"You also need a phone with Bluetooth Low Energy and the free app nRF Connect for Mobile, from Nordic Semiconductor. The phone is not a line on this parts list."}]$s24o2blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 2;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s24o3stage$Hardware preparation$s24o3stage$,
  title = $s24o3title$Confirm the LED is common anode$s24o3title$,
  description = $s24o3desc$Pin 2 is the common anode. Pin 1 is red, pin 3 is blue, and pin 4 is green.$s24o3desc$,
  tip = null,
  blocks = $s24o3blocks$[{"type":"text","heading":"Find the leads","body":"Hold the Kingbright WP154A4SEJ3VBDZGW/CA with the dome up. One side of the rim has a flat. The lead nearest that flat is pin 1, the red cathode. The next lead, pin 2, is the longest and is the common anode. Pin 3 is the blue cathode. Pin 4 is the green cathode. All four leads must be spread to neighbouring breadboard rows. Make the first bend at least 3 mm below the lens."},{"type":"text","heading":"The datasheet detail","body":"Kingbright drawing DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, shows that order and shows the anode lead at least 2.5 mm longer. At 20 mA the typical forward voltage is 2.2 V red, 3.3 V blue, and 3.3 V green. The maximums are 2.8 V, 4.0 V, and 4.1 V. The absolute maximum current is 30 mA red, 30 mA blue, and 25 mA green. The leads are spaced about 1.27 mm, which is half a breadboard pitch, so they do not drop into four holes until you spread them."},{"type":"warning","body":"A common-cathode LED will not work in this circuit. The Young Sun YSL-R596AR3G4B5C-C10 joins its anodes at pin 2, but its drawing does not name the colour of each cathode, so this project does not use it."}]$s24o3blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 3;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s24o4stage$Hardware preparation$s24o4stage$,
  title = $s24o4title$Know the transistors and the resistors$s24o4title$,
  description = $s24o4desc$Each colour uses one PN2222A, one 1 kΩ resistor, and one 220 Ω resistor.$s24o4desc$,
  tip = null,
  blocks = $s24o4blocks$[{"type":"text","heading":"Which way the transistor faces","body":"Use an onsemi PN2222ABU. The flat face is marked PN2222A. With that flat toward you and the leads pointing down, the leads are emitter, base, collector from left to right. On this breadboard the flat faces the right edge, so the top lead is the emitter, the middle lead is the base, and the bottom lead is the collector. Spread those leads to three neighbouring rows. A metal-can 2N2222, or a part marked only 2N2222, can use a different pin order."},{"type":"text","heading":"Why each resistor is there","body":"The 220 Ω resistor sits between the transistor and one LED cathode. It limits the LED current. The 1 kΩ resistor sits between a GPIO pin and the transistor base. It limits the current the ESP32 pin has to supply. Without the 220 Ω resistor the LED can draw more current than it is rated for. Without the 1 kΩ resistor the GPIO pin can be asked for far too much base current. On USB power, green and blue look dimmer than red because those chips have a higher forward voltage."},{"type":"tip","body":"A 220 Ω resistor reads red, red, brown, gold. A 1 kΩ resistor reads brown, black, red, gold. The parts list draws those bands. Match three of each before you insert them."}]$s24o4blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 4;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s24o5stage$Wiring$s24o5stage$,
  title = $s24o5title$Seat every part on these rows$s24o5title$,
  description = $s24o5desc$Use rows 1–15. The physical diagram names the same holes.$s24o5desc$,
  tip = null,
  blocks = $s24o5blocks$[{"type":"warning","body":"Holes a–e in one numbered row are joined. Holes f–j with the same number are a separate connection. Do not put two transistor leads in one row, or two LED leads in one row."},{"type":"text","heading":"The LED","body":"Flat side toward row 1, on the right half. Spread the leads into column f: pin 1 red in f6, pin 2 anode in f7, pin 3 blue in f8, and pin 4 green in f9."},{"type":"text","heading":"Red channel, left half","body":"Transistor flat to the right: emitter c1, base c2, collector c3. The 1 kΩ leads go in e2 and i2. The 220 Ω leads go in e3 and h6. h6 shares the right-hand row with f6. The resistor body sits above the gap and does not enter f6."},{"type":"text","heading":"Green channel, left half","body":"Emitter c10, base c11, collector c12, flat to the right. The 1 kΩ leads go in e11 and i11. The 220 Ω leads go in a12 and d15, on the left half. A male-to-male wire from b15 to j9 carries that node to f9. The wire arches over the board and enters only those two holes."},{"type":"text","heading":"Blue channel, right half","body":"Emitter h13, base h14, collector h15, flat to the right. The 1 kΩ leads go in e14 and g14. The 220 Ω leads go in j15 and g12. A male-to-male wire from j12 to j8 carries that node to f8. It stays in column j, arches over j9, and does not enter j9."},{"type":"wiring","heading":"Where the parts sit","connections":[],"assembly":{"parts":["led","q-red","q-green","q-blue","base-red","base-green","base-blue","limit-red","limit-green","limit-blue"],"jumpers":[]}},{"type":"test","heading":"Checkpoint","body":"Each transistor has its three leads in three neighbouring holes of one column, flat face to the right, emitter nearest the top. The LED leads are f6, f7, f8, and f9, with the longest lead in f7. No USB cable is plugged in yet."}]$s24o5blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 5;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s24o6stage$Wiring$s24o6stage$,
  title = $s24o6title$Connect 5 V and ground$s24o6title$,
  description = $s24o6desc$Two male-to-female wires feed the rails. Four male-to-male wires reach the parts.$s24o6desc$,
  tip = null,
  blocks = $s24o6blocks$[{"type":"text","body":"Put the DevKit beside the breadboard. With male-to-female wires, join DevKit 5 V to the left + rail at row 2, and DevKit GND to the left − rail at row 2. With male-to-male wires, bridge left + row 1 to right + row 1, and left − row 1 to right − row 1. Join j7 to the right + rail at row 7. Join a1 to the left − rail at row 3, a10 to the left − rail at row 10, and j13 to the right − rail at row 13. Leave USB unplugged."},{"type":"wiring","heading":"Supply and ground","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"}],"assembly":{"parts":[],"jumpers":["devkit-5v","devkit-gnd","bridge-plus","bridge-minus","anode-rail","red-emitter","green-emitter","blue-emitter"]}},{"type":"connections","heading":"These six links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"}]},{"type":"test","heading":"Checkpoint","body":"Both rail bridges and the 5 V and GND wires are on rows 1–15, above the rail break. j7 is the only LED lead row tied to +. a1, a10, and j13 are the emitter rows tied to −. The GPIO wires are not in yet. USB is still unplugged."}]$s24o6blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 6;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s24o7stage$Wiring$s24o7stage$,
  title = $s24o7title$Build the red channel$s24o7title$,
  description = $s24o7desc$GPIO25 switches the red cathode through j2 and f6.$s24o7desc$,
  tip = null,
  blocks = $s24o7blocks$[{"type":"text","body":"Join DevKit GPIO25 to j2 with a male-to-female wire. e2 and i2 hold the red 1 kΩ. c2 is the base. e3 and h6 hold the red 220 Ω, and f6 is LED pin 1."},{"type":"wiring","heading":"Red channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"}],"assembly":{"parts":[],"jumpers":["devkit-io25"]}},{"type":"connections","heading":"Red links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO25 is in j2, the 1 kΩ in e2 and i2, and the base in c2. The collector is c3 and the 220 Ω meets it at e3 and the LED at h6. No two of those leads share one hole."}]$s24o7blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 7;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s24o8stage$Wiring$s24o8stage$,
  title = $s24o8title$Build the green channel$s24o8title$,
  description = $s24o8desc$GPIO26 switches the green cathode through j11, b15, and f9.$s24o8desc$,
  tip = null,
  blocks = $s24o8blocks$[{"type":"text","body":"Join GPIO26 to j11. The green 1 kΩ is in e11 and i11, the base is c11, and the 220 Ω runs from a12 to d15. Add the male-to-male wire from b15 to j9. j9 shares the row with LED pin 4 in f9."},{"type":"wiring","heading":"Green channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"}],"assembly":{"parts":[],"jumpers":["devkit-io26","green-cathode"]}},{"type":"connections","heading":"Green links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO26 is in j11. The 1 kΩ lead is not in c10, c11, or c12. The b15 to j9 wire is the only extra lead in the green cathode row. f9 still holds the LED lead."}]$s24o8blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 8;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s24o9stage$Wiring$s24o9stage$,
  title = $s24o9title$Build the blue channel$s24o9title$,
  description = $s24o9desc$GPIO27 switches the blue cathode through a14, j12, and f8.$s24o9desc$,
  tip = null,
  blocks = $s24o9blocks$[{"type":"text","body":"Join GPIO27 to a14. The blue 1 kΩ is in e14 and g14, the base is h14, and the 220 Ω runs from j15 to g12. Add the male-to-male wire from j12 to j8. j8 shares the row with LED pin 3 in f8. The wire arches over j9 and does not enter it."},{"type":"wiring","heading":"Blue channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}],"assembly":{"parts":[],"jumpers":["devkit-io27","blue-cathode"]}},{"type":"connections","heading":"Blue links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO27 is in a14. f8 and j8 share the blue cathode row. f6, f7, f8, and f9 still hold one LED lead each. j9 is only the green link."}]$s24o9blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 9;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s24o10stage$Wiring$s24o10stage$,
  title = $s24o10title$Check the whole circuit, then plug in USB$s24o10title$,
  description = $s24o10desc$This is the only full connection list. Use it once, before power.$s24o10desc$,
  tip = null,
  blocks = $s24o10blocks$[{"type":"connections","heading":"All 18 connections","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}],"summary":"Five male-to-female wires leave the DevKit. Eight male-to-male wires join the rails, the emitters, and the green and blue cathode links. Every other join is two leads in the same five-hole row."},{"type":"wiring","heading":"Finished arrangement","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Before USB","body":"LED pin 2 is the only lead on the red rail. The three emitters are the only transistor leads on the blue rail. No GPIO wire touches a rail. No two LED leads share a row. Then plug the data USB cable into the DevKit and the computer. Do not add another supply."}]$s24o10blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 10;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s24o11stage$Development environment$s24o11stage$,
  title = $s24o11title$Install the ESP32 board package$s24o11title$,
  description = $s24o11desc$The Arduino IDE needs the Espressif package before it can see this board.$s24o11desc$,
  tip = null,
  blocks = $s24o11blocks$[{"type":"text","body":"Install the Arduino IDE. Open File, Preferences, and add this URL to Additional boards manager URLs: https://espressif.github.io/arduino-esp32/package_esp32_index.json. Open Tools, Board, Boards Manager, search for esp32, and install the package Espressif Systems. This sketch uses Arduino-ESP32 3.x calls such as ledcAttach."},{"type":"tip","body":"If the board list has no ESP32 Dev Module after the install, close the IDE and open it again."}]$s24o11blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 11;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s24o12stage$Development environment$s24o12stage$,
  title = $s24o12title$Select the board and the port$s24o12title$,
  description = $s24o12desc$The sketch talks to the computer at 115200 baud.$s24o12desc$,
  tip = null,
  blocks = $s24o12blocks$[{"type":"text","body":"Connect the data cable. In Tools, set Board to ESP32 Dev Module. Set Port to the new serial port. Set Upload Speed to 115200. Open Serial Monitor and set its speed to 115200 as well. A charge-only cable can power the board and still leave the port missing."},{"type":"expected","heading":"If the port is missing","body":"Install the USB-to-UART driver for the chip on your DevKit, try another USB socket, and try a cable you know can carry data. The port should appear in the Tools menu while the board is plugged in."}]$s24o12blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 12;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s24o13stage$Firmware$s24o13stage$,
  title = $s24o13title$See how PWM sets the brightness$s24o13title$,
  description = $s24o13desc$GPIO25, GPIO26, and GPIO27 were chosen because they can output PWM.$s24o13desc$,
  tip = null,
  blocks = $s24o13blocks$[{"type":"text","heading":"Why these pins","body":"GPIO25 drives red, GPIO26 drives green, and GPIO27 drives blue. They are ordinary output pins. They are not the strapping pins 0, 2, 12, or 15, and they are not the input-only pins 34–39. A high duty cycle turns the matching transistor on for longer, so that colour gets brighter."},{"type":"text","body":"The next block is an excerpt from the sketch. It shows how brightness scales a colour. Do not upload this fragment."},{"type":"code","language":"cpp","filename":"excerpt-brightness.ino","code":"int channelDuty(int channel) {\n  return (int)(((long)channel * (long)brightnessPercent) / 100L);\n}\n\nvoid applyColour() {\n  ledcWrite(RED_PIN, channelDuty(redValue));\n  ledcWrite(GREEN_PIN, channelDuty(greenValue));\n  ledcWrite(BLUE_PIN, channelDuty(blueValue));"},{"type":"text","heading":"What that excerpt does","body":"channelDuty multiplies one colour, 0–255, by the brightness percent and divides by 100. At 30 percent, red 255 becomes duty 76. ledcWrite sends that duty to the pin. Zero is off. 255 is fully on for that colour."},{"type":"text","body":"This second excerpt is the setup that attaches those pins. Do not upload it on its own."},{"type":"code","language":"cpp","filename":"excerpt-pwm-setup.ino","code":"if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {\n    Serial.println(\"PWM setup failed.\");\n  }\n  applyColour();"},{"type":"text","heading":"What ledcAttach does","body":"ledcAttach(pin, 5000, 8) gives that pin a PWM signal at 5000 Hz with 8 bits of duty, so the duty runs from 0 to 255. The same call is made for all three pins. applyColour then writes the power-on colour, which is red at 30 percent."}]$s24o13blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 13;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s24o14stage$Firmware$s24o14stage$,
  title = $s24o14title$Watch the write 255,80,0 travel through the sketch$s24o14title$,
  description = $s24o14desc$A characteristic is one value the phone can read or write.$s24o14desc$,
  tip = null,
  blocks = $s24o14blocks$[{"type":"text","heading":"The path of one colour","body":"The phone sends the text 255,80,0 to the colour characteristic. The ESP32 callback copies that text, checks it, stores red 255, green 80, and blue 0, then calls applyColour. The three PWM duties change, and the LED moves toward orange. A service is the group that holds the colour characteristic and the brightness characteristic. The board advertises that service under the name Solderi RGB so the phone can find it."},{"type":"text","body":"Both blocks below are excerpts. The complete sketch is in the next step."},{"type":"code","language":"cpp","filename":"excerpt-advertise.ino","code":"BLEDevice::init(DEVICE_NAME);\n  BLEServer *server = BLEDevice::createServer();\n  server->setCallbacks(new ServerCallbacks());\n  BLEService *service = server->createService(SERVICE_UUID);\n\n  BLECharacteristic *colorCharacteristic = service->createCharacteristic(\n    COLOR_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  colorCharacteristic->setCallbacks(new ColorCallbacks());\n  colorCharacteristic->setValue(colourText());\n\n  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(\n    BRIGHTNESS_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());\n  brightnessCharacteristic->setValue(brightnessText());\n\n  service->start();\n\n  BLEAdvertising *advertising = BLEDevice::getAdvertising();\n  advertising->addServiceUUID(SERVICE_UUID);\n  advertising->setScanResponse(true);\n  BLEDevice::startAdvertising();\n  Serial.println(\"Advertising as Solderi RGB.\");"},{"type":"code","language":"cpp","filename":"excerpt-colour-write.ino","code":"class ColorCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);\n    if (!accepted) {\n      characteristic->setValue(colourText());\n      Serial.print(\"Colour rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(colourText());\n    Serial.print(\"Colour \");\n    Serial.println(colourText());"},{"type":"text","heading":"Rejected writes and a disconnect","body":"A colour must be three numbers from 0 to 255, separated by commas, with no spaces. Brightness must be a whole number from 0 to 100. Anything else, including a raw three-byte colour, is rejected. The callback writes the last accepted text back into the characteristic, because the ESP32 stack stores the incoming bytes before the callback runs. When the phone disconnects, the sketch prints a line and starts advertising again. The last colour stays on the LED."},{"type":"code","language":"cpp","filename":"excerpt-disconnect.ino","code":"void onDisconnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = false;\n    Serial.println(\"Phone disconnected. Advertising again.\");\n    BLEDevice::startAdvertising();"}]$s24o14blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 14;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s24o15stage$Firmware$s24o15stage$,
  title = $s24o15title$Upload the complete sketch$s24o15title$,
  description = $s24o15desc$This is the program to copy. The earlier blocks were excerpts.$s24o15desc$,
  tip = null,
  blocks = $s24o15blocks$[{"type":"text","body":"Create a sketch, replace its contents with the program below, and click Upload. When it finishes, the Serial Monitor should show the power-on line and then Advertising as Solderi RGB."},{"type":"code","language":"cpp","filename":"esp32-ble-rgb-controller.ino","libraries":["BLE (ESP32 Arduino core)","LEDC (ESP32 Arduino core)"],"code":"/*\n * ESP32 Bluetooth RGB LED Controller\n * Board: ESP32 Dev Module\n * LED: Kingbright WP154A4SEJ3VBDZGW/CA, common-anode\n * Pin 1 red cathode, pin 2 common anode, pin 3 blue cathode, pin 4 green cathode\n * DevKit 5V pin -> pin 2\n * IO25 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 1 red cathode\n * IO26 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 4 green cathode\n * IO27 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 3 blue cathode\n * Emitters and DevKit GND share the ground rail\n * A higher PWM duty turns the transistor on for longer\n * Phone app: nRF Connect for Mobile\n * One write format: UTF-8 text\n * Colour: 255,80,0\n * Brightness: 0, 48, or 100\n * Arduino-ESP32 3.x: ledcAttach, BLECharacteristic::PROPERTY_WRITE\n */\n\n#include <BLEDevice.h>\n#include <BLEServer.h>\n#include <BLEUtils.h>\n\nconst int RED_PIN = 25;\nconst int GREEN_PIN = 26;\nconst int BLUE_PIN = 27;\nconst int PWM_FREQUENCY_HZ = 5000;\nconst int PWM_RESOLUTION_BITS = 8;\nconst size_t MAX_TEXT_BYTES = 16;\n\nconst char *DEVICE_NAME = \"Solderi RGB\";\nconst char *SERVICE_UUID = \"8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24\";\nconst char *COLOR_UUID = \"8c4a2e11-1b6d-4f3a-9e72-5d0c8a1b6e24\";\nconst char *BRIGHTNESS_UUID = \"8c4a2e12-1b6d-4f3a-9e72-5d0c8a1b6e24\";\n\nint redValue = 255;\nint greenValue = 0;\nint blueValue = 0;\nint brightnessPercent = 30;\n\nbool clientConnected = false;\n\nint channelDuty(int channel) {\n  return (int)(((long)channel * (long)brightnessPercent) / 100L);\n}\n\nvoid applyColour() {\n  ledcWrite(RED_PIN, channelDuty(redValue));\n  ledcWrite(GREEN_PIN, channelDuty(greenValue));\n  ledcWrite(BLUE_PIN, channelDuty(blueValue));\n}\n\nbool digitsOnly(const String &text) {\n  if (text.length() == 0) {\n    return false;\n  }\n  for (int i = 0; i < text.length(); i++) {\n    char letter = text.charAt(i);\n    if (letter < '0' || letter > '9') {\n      return false;\n    }\n  }\n  return true;\n}\n\nbool copyTextPayload(const uint8_t *data, size_t length, String &text) {\n  text = \"\";\n  if (data == nullptr || length == 0 || length > MAX_TEXT_BYTES) {\n    return false;\n  }\n  for (size_t i = 0; i < length; i++) {\n    char letter = (char)data[i];\n    bool allowed = (letter >= '0' && letter <= '9') || letter == ',' || letter == ' ';\n    if (!allowed) {\n      return false;\n    }\n    text += letter;\n  }\n  text.trim();\n  return text.length() > 0;\n}\n\nbool parseColourText(const String &text) {\n  if (text.indexOf(',') < 0) {\n    return false;\n  }\n  int first = text.indexOf(',');\n  int second = text.indexOf(',', first + 1);\n  if (first <= 0 || second <= first + 1 || text.indexOf(',', second + 1) >= 0) {\n    return false;\n  }\n\n  String redText = text.substring(0, first);\n  String greenText = text.substring(first + 1, second);\n  String blueText = text.substring(second + 1);\n  redText.trim();\n  greenText.trim();\n  blueText.trim();\n  if (!digitsOnly(redText) || !digitsOnly(greenText) || !digitsOnly(blueText)) {\n    return false;\n  }\n\n  long red = redText.toInt();\n  long green = greenText.toInt();\n  long blue = blueText.toInt();\n  if (red > 255 || green > 255 || blue > 255) {\n    return false;\n  }\n\n  redValue = (int)red;\n  greenValue = (int)green;\n  blueValue = (int)blue;\n  return true;\n}\n\nbool parseBrightnessText(const String &text) {\n  if (text.indexOf(',') >= 0 || !digitsOnly(text)) {\n    return false;\n  }\n  long value = text.toInt();\n  if (value > 100) {\n    return false;\n  }\n  brightnessPercent = (int)value;\n  return true;\n}\n\nString colourText() {\n  return String(redValue) + \",\" + String(greenValue) + \",\" + String(blueValue);\n}\n\nString brightnessText() {\n  return String(brightnessPercent);\n}\n\nclass ServerCallbacks : public BLEServerCallbacks {\n  void onConnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = true;\n    Serial.println(\"Phone connected.\");\n  }\n\n  void onDisconnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = false;\n    Serial.println(\"Phone disconnected. Advertising again.\");\n    BLEDevice::startAdvertising();\n  }\n};\n\nclass ColorCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);\n    if (!accepted) {\n      characteristic->setValue(colourText());\n      Serial.print(\"Colour rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(colourText());\n    Serial.print(\"Colour \");\n    Serial.println(colourText());\n  }\n};\n\nclass BrightnessCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseBrightnessText(text);\n    if (!accepted) {\n      characteristic->setValue(brightnessText());\n      Serial.print(\"Brightness rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(brightnessText());\n    Serial.print(\"Brightness \");\n    Serial.println(brightnessPercent);\n  }\n};\n\nvoid setup() {\n  Serial.begin(115200);\n  delay(300);\n\n  if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {\n    Serial.println(\"PWM setup failed.\");\n  }\n  applyColour();\n\n  Serial.println(\"ESP32 Bluetooth RGB LED controller\");\n  Serial.println(\"Power-on colour is red at 30 percent brightness.\");\n\n  BLEDevice::init(DEVICE_NAME);\n  BLEServer *server = BLEDevice::createServer();\n  server->setCallbacks(new ServerCallbacks());\n  BLEService *service = server->createService(SERVICE_UUID);\n\n  BLECharacteristic *colorCharacteristic = service->createCharacteristic(\n    COLOR_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  colorCharacteristic->setCallbacks(new ColorCallbacks());\n  colorCharacteristic->setValue(colourText());\n\n  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(\n    BRIGHTNESS_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());\n  brightnessCharacteristic->setValue(brightnessText());\n\n  service->start();\n\n  BLEAdvertising *advertising = BLEDevice::getAdvertising();\n  advertising->addServiceUUID(SERVICE_UUID);\n  advertising->setScanResponse(true);\n  BLEDevice::startAdvertising();\n  Serial.println(\"Advertising as Solderi RGB.\");\n}\n\nvoid loop() {\n  delay(200);\n}\n"},{"type":"expected","heading":"After a successful upload","body":"The LED is red at a low brightness. The monitor shows Advertising as Solderi RGB. If upload fails, hold the BOOT button when the IDE says Connecting, then release it."}]$s24o15blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 15;

update public.project_steps as step
set
  stage_sort_order = 5,
  stage_title = $s24o16stage$Phone control$s24o16stage$,
  title = $s24o16title$Find Solderi RGB in nRF Connect$s24o16title$,
  description = $s24o16desc$Use the Bluetooth Low Energy scanner, not a classic Bluetooth device list.$s24o16desc$,
  tip = null,
  blocks = $s24o16blocks$[{"type":"text","body":"Install nRF Connect for Mobile. Turn on the phone’s Bluetooth. Open the app and tap the scanner. Look for the name Solderi RGB and tap Connect. A speaker pairing screen is the wrong place. This board does not appear there, because it is a BLE peripheral."},{"type":"text","heading":"The service, once","body":"After it connects, open the service whose UUID starts with 8c4a2e10. Inside it, the colour characteristic starts with 8c4a2e11 and the brightness characteristic starts with 8c4a2e12. You can match those prefixes. You do not need to retype the full UUID for each write."},{"type":"expected","heading":"When the connection works","body":"nRF Connect shows the service, and the Serial Monitor prints Phone connected. The full service UUID is 8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24."}]$s24o16blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 16;

update public.project_steps as step
set
  stage_sort_order = 5,
  stage_title = $s24o17stage$Phone control$s24o17stage$,
  title = $s24o17title$Write a colour as text$s24o17title$,
  description = $s24o17desc$The write format is UTF-8 text, three numbers separated by commas.$s24o17desc$,
  tip = null,
  blocks = $s24o17blocks$[{"type":"text","body":"On the colour characteristic, choose the write action and set the format to text, or UTF-8. Send 255,80,0. The LED should move from dim red toward orange: full red, some green, no blue. Then send 0,0,255 for blue and 0,255,0 for green. Read the characteristic afterward. It should show the text you sent."},{"type":"text","heading":"If the app asks for hex","body":"Some iOS write fields want the UTF-8 bytes in hexadecimal. 255,80,0 is 32 35 35 2C 38 30 2C 30. 0,0,255 is 30 2C 30 2C 32 35 35. 0,255,0 is 30 2C 32 35 35 2C 30. The characters are still the same text."},{"type":"warning","body":"Do not send the three raw bytes FF 50 00. The sketch rejects that. Send the digits and the commas."}]$s24o17blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 17;

update public.project_steps as step
set
  stage_sort_order = 5,
  stage_title = $s24o18stage$Phone control$s24o18stage$,
  title = $s24o18title$Change brightness, then disconnect and come back$s24o18title$,
  description = $s24o18desc$Brightness is a second text value, from 0 to 100.$s24o18desc$,
  tip = null,
  blocks = $s24o18blocks$[{"type":"text","body":"On the brightness characteristic, write the text 100. The current colour should become brighter. Write 10 and it should become dim. Write 0 and it should go dark. Read the characteristic to confirm the stored number. Then disconnect in nRF Connect. The monitor should print that the phone disconnected and that the board is advertising again. The last colour remains. Connect once more and write 255,0,0 to return to red."},{"type":"text","body":"A brightness of 100 in hex text is 31 30 30. A rejected write, such as 150 or the word high, should leave the LED unchanged, and the monitor should print that the value was rejected."},{"type":"tip","body":"Compare the LED with the Serial Monitor line for the same write. The monitor is the sketch telling you which text it accepted."}]$s24o18blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 18;

update public.project_steps as step
set
  stage_sort_order = 6,
  stage_title = $s24o19stage$Troubleshooting$s24o19stage$,
  title = $s24o19title$Fix the light before you blame the phone$s24o19title$,
  description = $s24o19desc$Match the symptom, then work down the checks.$s24o19desc$,
  tip = null,
  blocks = $s24o19blocks$[{"type":"troubleshooting","heading":"The LED itself","items":[{"problem":"The LED stays dark after upload.","solution":"The usual causes are USB not powering the board, the anode off the + rail, or an emitter off the − rail. Confirm the monitor prints the advertising line. The anode jumper is j7 on the right + rail, and the two + rails are bridged on row 1. Emitters are a1 and a10 on the left − rail and j13 on the right − rail, with the − rails bridged on row 1. Those rows are above the rail break. You should see a dim red light. If the monitor is alive and the LED is still dark, the LED is reversed: pin 2, the anode, is the lead in f7."},{"problem":"Only red lights. Green and blue stay off.","solution":"Either those links are in the wrong holes, or the USB port is too weak for a high forward voltage. Send 0,255,0 and 0,0,255 and read the monitor. If the monitor accepts the colour, confirm the green wire is in b15 and j9, and the blue wire is in j12 and j8. j9 shares the row with LED pin 4 in f9. j8 shares the row with LED pin 3 in f8. Try a different USB port near 5 V. A port that is already sagging can leave a 4.0 V blue chip or a 4.1 V green chip dark."},{"problem":"One colour is stuck on, or two colours light together.","solution":"Two leads are probably in the same row. Check that each transistor uses three separate rows and that the 1 kΩ lead is not in the collector row. Pull that channel’s parts and seat them again. The stuck colour should follow only its own GPIO pin."},{"problem":"The LED is very hot or a resistor smells.","solution":"Unplug USB. A 220 Ω resistor is missing or a cathode is wired straight to ground. Seat the 220 Ω resistor again before you reconnect power. The part should stay cool at the currents in the resistor step."}]}]$s24o19blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 19;

update public.project_steps as step
set
  stage_sort_order = 6,
  stage_title = $s24o20stage$Troubleshooting$s24o20stage$,
  title = $s24o20title$Fix the phone connection$s24o20title$,
  description = $s24o20desc$The board has to be advertising before the phone can write.$s24o20desc$,
  tip = null,
  blocks = $s24o20blocks$[{"type":"troubleshooting","heading":"nRF Connect","items":[{"problem":"Solderi RGB never appears in the scanner.","solution":"The sketch is not running, or the phone is looking at classic Bluetooth devices. Re-upload, set the monitor to 115200, and wait for Advertising as Solderi RGB. In nRF Connect use the BLE scanner and pull to refresh. The name should appear within a few seconds."},{"problem":"The app connects, then the write does nothing.","solution":"The write is on the wrong characteristic, or it is not UTF-8 text. Open the colour characteristic that starts with 8c4a2e11 and send 255,80,0 as text. The monitor should print Colour 255,80,0 and the LED should change. If it prints Colour rejected, the text has a space, a missing comma, or a number outside 0–255."},{"problem":"Upload never finishes.","solution":"The port is wrong or the board never entered the bootloader. Select the port that appears when you plug the board in, lower the upload speed if 115200 fails, and hold BOOT when the IDE says Connecting. A finished upload returns the IDE to a done message and the monitor prints the advertising line."},{"problem":"It worked once, and the phone cannot reconnect.","solution":"Disconnect in nRF Connect, wait for the monitor line that says the board is advertising again, then scan and connect. If that line never appears, press the DevKit reset button and wait for the advertising line before you scan."}]}]$s24o20blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 20;

update public.project_steps as step
set
  stage_sort_order = 7,
  stage_title = $s24o21stage$Final check$s24o21stage$,
  title = $s24o21title$Walk the finished controller$s24o21title$,
  description = $s24o21desc$Do these in order and compare the LED with each line.$s24o21desc$,
  tip = null,
  blocks = $s24o21blocks$[{"type":"text","body":"The sketch is written to do every line below. Use the troubleshooting steps for any line that does not match. A USB port well under 5 V can still leave green or blue dim or dark after the wiring is correct."},{"type":"expected","heading":"Checklist","body":"The LED flat faces the top and the longest lead is in f7. Each transistor flat faces right, with the emitter in the top lead of that transistor. The + rails feed only the anode row. The − rails meet only the three emitter jumpers. No two leads share one hole. Upload finishes and the monitor prints Advertising as Solderi RGB. nRF Connect connects to that name. 255,0,0 is red, 0,255,0 is green, and 0,0,255 is blue. Brightness 100 is brighter than 10, and 0 is dark. The text 150 is rejected and the LED stays put. Disconnecting prints the advertising line, and a new connection can write 255,80,0."}]$s24o21blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 21;
