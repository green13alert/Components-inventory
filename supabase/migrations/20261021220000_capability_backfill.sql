-- Backfill verified capabilities and sync tutorial steps for projects 8, 18, and 24.
-- Does not change is_published or user_projects.current_step.

-- Backfill component capabilities and project requirement constraints.
-- Joins real catalogue slugs. A missing slug inserts nothing.
-- Does not change is_published or user_projects.current_step.

insert into public.component_capabilities (component_id, capability, value)
select component.id, spec.capability, spec.value
from (
  values
  ('esp32-devkitc-v4', 'function', 'development_board'),
  ('esp32-devkitc-v4', 'logic_level_v', '3.3'),
  ('esp32-devkitc-v4', 'programming_environment', 'arduino_ide'),
  ('esp32-devkitc-v4', 'board_package', 'esp32'),
  ('esp32-devkitc-v4', 'physical_form', 'male_header'),
  ('bme280', 'function', 'bme280'),
  ('bme280', 'interface', 'i2c'),
  ('bme280', 'interface', 'spi'),
  ('stemma-qt-female', 'physical_form', 'female_socket'),
  ('stemma-qt-cable', 'physical_form', 'male_pin'),
  ('pir-sensor', 'function', 'pir'),
  ('buzzer', 'function', 'buzzer'),
  ('buzzer', 'physical_form', 'three_pin_module'),
  ('sg90', 'function', 'servo'),
  ('sg90', 'servo_kind', 'position'),
  ('joystick', 'function', 'joystick'),
  ('gst18a05-p1j', 'function', 'power_supply'),
  ('gst18a05-p1j', 'supply_v', '5'),
  ('adafruit-368', 'physical_form', 'screw_terminal_jack'),
  ('jumper-wires', 'physical_form', 'male_male'),
  ('jumper-male-female', 'physical_form', 'male_female'),
  ('rgb-led-ca', 'function', 'rgb_led'),
  ('rgb-led-ca', 'physical_form', 'common_anode'),
  ('rgb-led-cc', 'function', 'rgb_led'),
  ('rgb-led-cc', 'physical_form', 'common_cathode'),
  ('pn2222a', 'function', 'npn_transistor'),
  ('pn2222a', 'physical_form', 'to-92'),
  ('pn2222a', 'physical_form', 'ebc'),
  ('resistor-220', 'function', 'fixed_resistor'),
  ('resistor-220', 'resistance_ohms', '220'),
  ('resistor-1k', 'function', 'fixed_resistor'),
  ('resistor-1k', 'resistance_ohms', '1000')
) as spec(slug, capability, value)
join public.components as component on component.slug = spec.slug
on conflict (component_id, capability, value) do nothing;

insert into public.project_requirement_constraints (requirement_id, capability, value)
select requirement.id, spec.capability, spec.value
from (
  values
  ('8', 'arduino-uno-r3', 'function', 'development_board'),
  ('8', 'arduino-uno-r3', 'logic_level_v', '5'),
  ('8', 'arduino-uno-r3', 'header_profile', 'uno_r3'),
  ('8', 'pir-sensor', 'function', 'pir'),
  ('8', 'buzzer', 'function', 'buzzer'),
  ('8', 'buzzer', 'physical_form', 'three_pin_module'),
  ('8', 'resistor-220', 'resistance_ohms', '220'),
  ('8', 'jumper-wires', 'physical_form', 'male_male'),
  ('18', 'arduino-uno-r3', 'function', 'development_board'),
  ('18', 'arduino-uno-r3', 'logic_level_v', '5'),
  ('18', 'arduino-uno-r3', 'header_profile', 'uno_r3'),
  ('18', 'sg90', 'function', 'servo'),
  ('18', 'sg90', 'servo_kind', 'position'),
  ('18', 'joystick', 'function', 'joystick'),
  ('18', 'adafruit-368', 'physical_form', 'screw_terminal_jack'),
  ('18', 'gst18a05-p1j', 'function', 'power_supply'),
  ('18', 'gst18a05-p1j', 'supply_v', '5'),
  ('18', 'jumper-wires', 'physical_form', 'male_male'),
  ('23', 'esp32-devkitc-v4', 'function', 'development_board'),
  ('23', 'esp32-devkitc-v4', 'logic_level_v', '3.3'),
  ('23', 'esp32-devkitc-v4', 'board_package', 'esp32'),
  ('23', 'esp32-devkitc-v4', 'physical_form', 'male_header'),
  ('23', 'bme280', 'function', 'bme280'),
  ('23', 'bme280', 'interface', 'i2c'),
  ('23', 'stemma-qt-female', 'physical_form', 'female_socket'),
  ('24', 'esp32-devkitc-v4', 'function', 'development_board'),
  ('24', 'esp32-devkitc-v4', 'logic_level_v', '3.3'),
  ('24', 'esp32-devkitc-v4', 'board_package', 'esp32'),
  ('24', 'esp32-devkitc-v4', 'physical_form', 'male_header'),
  ('24', 'rgb-led-ca', 'function', 'rgb_led'),
  ('24', 'rgb-led-ca', 'physical_form', 'common_anode'),
  ('24', 'pn2222a', 'function', 'npn_transistor'),
  ('24', 'pn2222a', 'physical_form', 'to-92'),
  ('24', 'pn2222a', 'physical_form', 'ebc'),
  ('24', 'resistor-220', 'resistance_ohms', '220'),
  ('24', 'resistor-1k', 'resistance_ohms', '1000'),
  ('24', 'jumper-wires', 'physical_form', 'male_male'),
  ('24', 'jumper-male-female', 'physical_form', 'male_female')
) as spec(project_slug, component_slug, capability, value)
join public.projects as project on project.slug = spec.project_slug
join public.components as component on component.slug = spec.component_slug
join public.project_components as line
  on line.project_id = project.id
  and line.component_id = component.id
join public.project_requirements as requirement on requirement.project_component_id = line.id
on conflict (requirement_id, capability, value) do nothing;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $p8s0stage$Understand the Project$p8s0stage$,
  title = $p8s0title$What We're Building$p8s0title$,
  description = $p8s0desc$A PIR sensor watches for movement. When it sees motion, the Arduino turns on an LED and an active buzzer together.$p8s0desc$,
  tip = null,
  blocks = $p8s0blocks$[{"type":"text","heading":"What we're building","body":"This project is a USB-powered motion alarm. The PIR module is the input. The LED and buzzer are the outputs. There is no extra battery pack or arming switch — the board is armed once the sketch finishes its warm-up."},{"type":"image","imageKey":"motionSensor","caption":"Finished motion alarm reference. Keep this pin map: PIR on D2, LED on D8, buzzer on D9."},{"type":"components","items":[{"id":"arduino-uno-r3","name":"Arduino Uno R3","illustrationId":"arduino-uno","owned":false,"quantity":1},{"id":"pir-sensor","name":"PIR motion sensor","illustrationId":"pir-sensor","owned":false,"quantity":1},{"id":"buzzer","name":"Active buzzer module","illustrationId":"buzzer","owned":false,"quantity":1},{"id":"led","name":"LED","illustrationId":"led","owned":false,"quantity":1},{"id":"resistor-220","name":"220 Ω resistor","illustrationId":"resistor","owned":false,"quantity":1},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":10},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"warning","body":"Use the active buzzer from the parts list. A passive piezo will not sound with digitalWrite, and this sketch does not call tone()."}]$p8s0blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 0;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p8s1stage$Build the Circuit$p8s1stage$,
  title = $p8s1title$Set Up the Arduino$p8s1title$,
  description = $p8s1desc$Seat the Uno so 5V, GND, D2, D8, and D9 can reach the breadboard. Power comes from USB for this project.$p8s1desc$,
  tip = $p8s1tip$Use a data-capable USB cable. Charge-only cables never appear as a serial port later.$p8s1tip$,
  blocks = $p8s1blocks$[{"type":"text","heading":"What to set up","body":"Place the Uno beside the breadboard. Use the USB-B data cable from the parts list when you upload; the computer USB port is the power source for this build. Use male-to-male jumpers: Uno 5V into the left + rail at row 1, and Uno GND into the left − rail at row 1. The + rail is 5 V and the − rail is ground. They are not connected to each other. Stay on rows 1–15, above a break in the coloured rail. This build uses 10 male-to-male jumpers from the pack. Leave D2, D8, and D9 empty for now."},{"type":"wiring","heading":"Rails only","connections":[],"assembly":{"parts":[],"jumpers":["uno-5v","uno-gnd"]}},{"type":"test","body":"Plug in USB. Confirm the Uno power LED is on. Check that D2, D8, and D9 still have no wires in them."},{"type":"expected","heading":"Expected result","body":"The board is powered, the + rail is 5V, the − rail is GND, and no sensor or output is connected yet. Nothing should get hot."}]$p8s1blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 1;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p8s2stage$Build the Circuit$p8s2stage$,
  title = $p8s2title$Connect the PIR Motion Sensor$p8s2title$,
  description = $p8s2desc$Most PIR modules have VCC, OUT, and GND. OUT is a digital signal the Arduino reads with digitalRead() on D2.$p8s2desc$,
  tip = $p8s2tip$If your module has a 3.3 V / 5 V jumper, set it to 5 V for the Uno.$p8s2tip$,
  blocks = $p8s2blocks$[{"type":"text","heading":"What you are wiring","body":"Plug the PIR pins into c3, c4, and c5: VCC, OUT, then GND. A male-to-male jumper joins a3 to the left + rail at row 3. Another joins a5 to the left − rail at row 5. D2 goes to a4. OUT is the motion flag — that is PIR_PIN in the sketch. After power-up, give the module about 30 seconds. OUT can chatter during that time. A HIGH is one motion pulse, then it returns LOW. It does not stay HIGH for as long as a person remains in view. Aim the lens away from heaters and vents."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"pir","name":"PIR","illustrationId":"pir-sensor"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"}],"assembly":{"parts":["pir"],"jumpers":["pir-vcc","pir-out","pir-gnd"]}},{"type":"connections","summary":"PIR on D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Three wires only: 5V, GND, and D2. Do not connect the PIR LED jumper to an Arduino pin — that LED is on the module."}]$p8s2blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 2;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p8s3stage$Build the Circuit$p8s3stage$,
  title = $p8s3title$Connect the LED$p8s3title$,
  description = $p8s3desc$The LED is the silent alarm. It needs the 220 Ω resistor in series on D8 so the pin is not shorted to ground.$p8s3desc$,
  tip = null,
  blocks = $p8s3blocks$[{"type":"text","heading":"Polarity and current limit","body":"The longer LED lead is the anode. Seat it in d12 and the shorter lead, by the flat, in d13. The 220 Ω resistor goes in e8 and e12, along column e so it does not cover the buzzer pins. D8 goes to a8. a13 goes to the left − rail at row 13. Use this one resistor only."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"resistor","name":"220 Ω resistor","illustrationId":"resistor"},{"id":"led","name":"LED","illustrationId":"led"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"}],"assembly":{"parts":["resistor","led"],"jumpers":["led-signal","led-cathode"]}},{"type":"connections","summary":"LED on D8 through the 220 Ω resistor","rows":[{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"}]},{"type":"warning","body":"Do not wire the LED from D8 straight to GND. Without the 220 Ω resistor the pin can source more current than it should."}]$p8s3blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 3;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p8s4stage$Build the Circuit$p8s4stage$,
  title = $p8s4title$Connect the Buzzer$p8s4title$,
  description = $p8s4desc$The catalogue buzzer is active: HIGH on the signal pin makes it sound. You do not need tone() for this part.$p8s4desc$,
  tip = null,
  blocks = $p8s4blocks$[{"type":"text","heading":"Three-pin active module","body":"Use the three-pin active module from the parts list. Plug it into c9, c10, and c11: VCC, I/O, then GND. a9 goes to the left + rail at row 9, D9 goes to a10, and a11 goes to the left − rail at row 11. The GPIO drives I/O only. The module takes sounder current from the 5 V rail. A two-pin piezo is not this part, and this sketch will not sound one."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"buzzer","name":"Buzzer","illustrationId":"buzzer"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}],"assembly":{"parts":["buzzer"],"jumpers":["buzzer-vcc","buzzer-sig","buzzer-gnd"]}},{"type":"connections","summary":"Buzzer on D9","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"warning","body":"A passive piezo will stay quiet with digitalWrite HIGH. This walkthrough assumes an active buzzer. Confirm the part matches the BOM before debugging code."}]$p8s4blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 4;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p8s5stage$Build the Circuit$p8s5stage$,
  title = $p8s5title$Check the Complete Circuit$p8s5title$,
  description = $p8s5desc$Before any sketch, the pin map should be complete and unique: D2 input, D8 LED, D9 buzzer, shared 5V and GND.$p8s5desc$,
  tip = null,
  blocks = $p8s5blocks$[{"type":"text","heading":"What “complete” means","body":"Every net below should exist once. If two wires share a pin they should be the same net (for example several grounds), not two different signals on one GPIO."},{"type":"wiring","heading":"Complete wiring diagram","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"pir","name":"PIR","illustrationId":"pir-sensor"},{"id":"resistor","name":"220 Ω resistor","illustrationId":"resistor"},{"id":"led","name":"LED","illustrationId":"led"},{"id":"buzzer","name":"Buzzer","illustrationId":"buzzer"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"connections","heading":"Exact connections","summary":"PIR D2 · LED D8 · buzzer D9","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"expected","heading":"Check","body":"You can trace Arduino 5V to PIR VCC and buzzer VCC, Arduino GND to PIR, LED cathode, and buzzer GND, D2 to PIR OUT, D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin."}]$p8s5blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 5;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p8s6stage$Build the Program$p8s6stage$,
  title = $p8s6title$Create the Arduino Program$p8s6title$,
  description = $p8s6desc$Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.$p8s6desc$,
  tip = null,
  blocks = $p8s6blocks$[{"type":"text","heading":"What we are adding","body":"PIR_PIN, LED_PIN, and BUZZER_PIN match the wiring: D2, D8, D9. Serial is opened at 9600 baud so later tests can print without changing the port settings."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Named constants keep the pin map in one place. If you moved the LED to another pin, you would change LED_PIN only. setup() and loop() are empty on purpose — there is nothing to drive until the next steps configure those pins."}]$p8s6blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 6;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p8s7stage$Build the Program$p8s7stage$,
  title = $p8s7title$Read the Motion Sensor$p8s7title$,
  description = $p8s7desc$Configure D2 as an input, wait through PIR warm-up, then print the raw digitalRead() value.$p8s7desc$,
  tip = null,
  blocks = $p8s7blocks$[{"type":"text","heading":"What we are adding","body":"pinMode(PIR_PIN, INPUT) makes D2 a digital input. digitalRead() returns HIGH or LOW. The 30-second delay runs once in setup() so loop() only sees a settled sensor."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n  Serial.println(motion);\n  delay(200);\n}"},{"type":"code_explanation","body":"We still do not touch the LED or buzzer. If Serial prints 1 when you walk past and 0 when you stay still, the PIR wiring and D2 are correct before any output code can hide a mistake."},{"type":"test","body":"Upload this sketch, open Serial Monitor at 9600 baud, wait for “Ready.”, then walk past the PIR and stand still."},{"type":"expected","heading":"Expected result","body":"After warm-up, Serial should print 0 while the room is still and 1 (HIGH) in bursts when you walk in front of the sensor."}]$p8s7blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 7;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p8s8stage$Build the Program$p8s8stage$,
  title = $p8s8title$Detect Motion$p8s8title$,
  description = $p8s8desc$Turn the raw HIGH/LOW reading into a named condition you will reuse for the LED and buzzer.$p8s8desc$,
  tip = null,
  blocks = $p8s8blocks$[{"type":"text","heading":"What we are adding","body":"An if (motion == HIGH) branch is the alarm condition. else is the idle condition. Words in Serial are easier to confirm than 1 and 0 when you test later."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    Serial.println(\"Motion detected\");\n  } else {\n    Serial.println(\"No motion\");\n  }\n\n  delay(200);\n}"},{"type":"code_explanation","body":"HIGH means the PIR latched a motion event. This is the same boolean we will use to drive outputs. We still leave the LED and buzzer off so you can trust the condition on Serial alone."}]$p8s8blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 8;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p8s9stage$Build the Program$p8s9stage$,
  title = $p8s9title$Control the LED$p8s9title$,
  description = $p8s9desc$When the motion condition is true, D8 goes HIGH. When it is false, D8 goes LOW.$p8s9desc$,
  tip = null,
  blocks = $p8s9blocks$[{"type":"text","heading":"What we are adding","body":"LED_PIN becomes an output. digitalWrite inside each branch follows the same if/else you already tested on Serial. setup() forces the LED LOW so it cannot sit unknown during warm-up."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n    Serial.println(\"Motion detected\");\n  } else {\n    digitalWrite(LED_PIN, LOW);\n    Serial.println(\"No motion\");\n  }\n\n  delay(200);\n}"},{"type":"code_explanation","body":"The LED is a silent check of the alarm path. If Serial says “Motion detected” and the LED stays dark, the fault is D8 wiring or polarity — not the PIR."},{"type":"test","body":"Upload, wait for “Ready.”, then walk past the PIR while watching the LED. Keep the buzzer unwired in your head: it is not driven yet."},{"type":"expected","heading":"Expected result","body":"The LED turns on with “Motion detected” and turns off with “No motion.” If it never lights, check anode → 220 Ω resistor → D8 and cathode → GND."}]$p8s9blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 9;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p8s10stage$Build the Program$p8s10stage$,
  title = $p8s10title$Control the Buzzer$p8s10title$,
  description = $p8s10desc$Drive the active buzzer with the same motion condition as the LED. digitalWrite HIGH is enough — no tone().$p8s10desc$,
  tip = null,
  blocks = $p8s10blocks$[{"type":"text","heading":"What we are adding","body":"BUZZER_PIN is configured as OUTPUT and follows the LED in both branches. An active buzzer has its own oscillator; a DC HIGH on the signal pin is the on switch."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  digitalWrite(BUZZER_PIN, LOW);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n    digitalWrite(BUZZER_PIN, HIGH);\n    Serial.println(\"Motion detected\");\n  } else {\n    digitalWrite(LED_PIN, LOW);\n    digitalWrite(BUZZER_PIN, LOW);\n    Serial.println(\"No motion\");\n  }\n\n  delay(200);\n}"},{"type":"code_explanation","body":"LED and buzzer now share one condition. This sketch still prints on every sample, including “No motion”, so you can see the pin change. It is not the sketch you upload. The next step holds the alarm and changes the ready line to “Alarm armed.” If the LED works and the buzzer does not, check D9, the module GND, and that the part is the three-pin active module."}]$p8s10blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 10;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p8s11stage$Build the Program$p8s11stage$,
  title = $p8s11title$Combine the System$p8s11title$,
  description = $p8s11desc$Hold the alarm for 800 ms on each trigger so a short PIR pulse is still obvious, then return to idle.$p8s11desc$,
  tip = null,
  blocks = $p8s11blocks$[{"type":"text","heading":"What we are adding","body":"The PIR pulse can be brief. delay(800) inside the HIGH branch keeps the LED and buzzer on long enough to notice. Serial prints “Alarm armed.” after warm-up so you know testing can start. delay(50) at the end of loop() is a small idle pause, not a second alarm hold. While the PIR output stays HIGH, the outputs stay on and “Motion detected” prints about once a second. It does not print “No motion” on every idle pass."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  digitalWrite(BUZZER_PIN, LOW);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Alarm armed.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n    digitalWrite(BUZZER_PIN, HIGH);\n    Serial.println(\"Motion detected\");\n    delay(800);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n    digitalWrite(BUZZER_PIN, LOW);\n  }\n\n  delay(50);\n}"},{"type":"code_explanation","body":"This is the complete sketch. Pin map: D2 input, D8 LED, D9 buzzer. Behaviour: wait 30 s, then any HIGH on D2 turns both outputs on for 800 ms. View Code on a finished project shows this same program."}]$p8s11blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 11;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p8s12stage$Test the Alarm$p8s12stage$,
  title = $p8s12title$Upload the Program$p8s12title$,
  description = $p8s12desc$Board: Arduino Uno. Serial Monitor at 9600 baud. Stay out of the PIR’s view until it prints “Alarm armed.”$p8s12desc$,
  tip = $p8s12tip$If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.$p8s12tip$,
  blocks = $p8s12blocks$[{"type":"text","heading":"Before you upload","body":"Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in."},{"type":"text","heading":"How to upload","body":"Paste the combined sketch from the previous step. Click Upload, then open Serial Monitor at 9600 baud. Do not walk in front of the PIR until setup() finishes."},{"type":"test","body":"Upload once. Watch Serial for the warm-up line, then “Alarm armed.”"},{"type":"expected","heading":"Expected result","body":"The IDE reports Done uploading. After about 30 seconds Serial prints “Alarm armed.” The LED and buzzer should still be off if you stayed still."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"No serial port","solution":"Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port."},{"problem":"Upload error / avrdude","solution":"Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy."}]}]$p8s12blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 12;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p8s13stage$Test the Alarm$p8s13stage$,
  title = $p8s13title$Test Without Motion$p8s13title$,
  description = $p8s13desc$A working idle state is as important as a working alarm. Confirm both outputs stay off when the room is still.$p8s13desc$,
  tip = null,
  blocks = $p8s13blocks$[{"type":"test","body":"After “Alarm armed.”, stay outside the PIR’s view for ten seconds. Watch the LED, listen for the buzzer, and read Serial."},{"type":"expected","heading":"Expected result","body":"LED off, buzzer silent, Serial not printing a stream of “Motion detected.” Occasional PIR glitches right after warm-up can happen; wait a few more seconds and retest."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Alarm already on with nobody in view","solution":"Finish the 30 s warm-up. Aim the PIR away from sun, heaters, and vents. Confirm OUT is on D2 and GND is shared with the Uno."},{"problem":"Serial floods with Motion detected","solution":"The PIR is stuck HIGH. Recheck VCC/GND/OUT. Cover the lens; if it stays HIGH, the module or wiring is wrong, not the if-statement."}]}]$p8s13blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 13;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p8s14stage$Test the Alarm$p8s14stage$,
  title = $p8s14title$Test Motion Detection$p8s14title$,
  description = $p8s14desc$Walk through the PIR field of view and confirm the LED and buzzer fire together.$p8s14desc$,
  tip = $p8s14tip$Stand a couple of metres away and walk across the sensor, not straight at it. PIRs often see crossing motion more clearly.$p8s14tip$,
  blocks = $p8s14blocks$[{"type":"test","body":"Walk in front of the PIR sensor. Watch the LED and listen for the buzzer. Then step out of view and wait."},{"type":"expected","heading":"Expected result","body":"The LED turns on and the buzzer sounds for about 800 ms, and Serial prints “Motion detected”. After you leave, both outputs go quiet."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Nothing happens when you walk past","solution":"Confirm PIR VCC/GND/OUT, then confirm PIR_PIN is 2 in the sketch. Open Serial: if it never prints Motion detected, the input never went HIGH."},{"problem":"Serial detects motion but outputs stay off","solution":"The condition is working. Check D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin."}]}]$p8s14blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 14;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p8s15stage$Test the Alarm$p8s15stage$,
  title = $p8s15title$Troubleshoot the Circuit$p8s15title$,
  description = $p8s15desc$If any test failed, isolate input versus output before changing working code.$p8s15desc$,
  tip = null,
  blocks = $p8s15blocks$[{"type":"text","heading":"How to isolate the fault","body":"Serial tells you whether D2 is changing. The LED tells you whether D8 can source current. The buzzer tells you whether D9 and the module are correct. Fix the layer that actually failed."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"LED never lights","solution":"Confirm anode → 220 Ω resistor → D8 and cathode → GND. Swap the LED if you still see nothing — polarity may be reversed."},{"problem":"Buzzer silent","solution":"This build uses the three-pin active module. Confirm VCC on the 5 V rail, I/O on D9, and GND on the ground rail. A passive piezo will not sound with digitalWrite."},{"problem":"PIR always HIGH","solution":"Finish the 30 s warm-up. Check OUT is on D2 and that the module ground is the Uno ground. Recheck any 3.3 V / 5 V jumper."},{"problem":"PIR never HIGH","solution":"Confirm 5V on VCC. Wave closer and across the lens. Some modules have a sensitivity pot — a fully counterclockwise pot can ignore a person at the desk."}]}]$p8s15blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 15;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p8s16stage$Test the Alarm$p8s16stage$,
  title = $p8s16title$Final System Test$p8s16title$,
  description = $p8s16desc$Run idle, then motion, then idle again. The pin map should still match the complete wiring diagram.$p8s16desc$,
  tip = null,
  blocks = $p8s16blocks$[{"type":"image","imageKey":"motionSensor","caption":"Keep this GPIO map if you mount the PIR on a box later: D2 input, D8 LED, D9 buzzer."},{"type":"test","body":"Stay still until the alarm is quiet. Walk past once and confirm LED plus buzzer. Step away and confirm both outputs stop. Repeat once."},{"type":"expected","heading":"Expected result","body":"Idle is silent. Each crossing of the PIR fires both outputs together for about 800 ms. Serial matches what you see and hear. You have a USB-powered motion alarm with no extra switch or battery."},{"type":"connections","heading":"Pin map you built","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]}]$p8s16blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 16;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $p18s0stage$Understand the Project$p18s0stage$,
  title = $p18s0title$What We're Building$p18s0title$,
  description = $p18s0desc$A two-servo pan-tilt mount aims a camera plate. The joystick sets speed and direction, and releasing it holds the aim. This project aims the payload — it does not capture video.$p18s0desc$,
  tip = null,
  blocks = $p18s0blocks$[{"type":"text","heading":"What we're building","body":"You will assemble a pan-tilt bracket around two SG90 servos, power the servos from an Adafruit 368 screw-terminal jack, and drive both axes from an analog joystick. Pan is left/right. Tilt is up/down. Mount a lightweight camera or webcam on the plate if you have one — or leave the plate empty while you learn the mechanism."},{"type":"image","imageKey":"servoCamera","caption":"Finished pan-tilt reference. Pin map: pan servo D9, tilt servo D10, joystick VRx A0, VRy A1, SW D2."},{"type":"components","items":[{"id":"arduino-uno-r3","name":"Arduino Uno R3","illustrationId":"arduino-uno","owned":false,"quantity":1},{"id":"sg90","name":"SG90 Micro Servo","illustrationId":"servo-sg90","owned":false,"quantity":2},{"id":"joystick","name":"Analog Joystick Module","illustrationId":"joystick","owned":false,"quantity":1},{"id":"pan-tilt-bracket","name":"Pan-Tilt Bracket Kit","illustrationId":"electronics-kit","owned":false,"quantity":1},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":14},{"id":"adafruit-368","name":"2.1 mm jack to screw terminal","illustrationId":"generic-module","owned":false,"quantity":1},{"id":"gst18a05-p1j","name":"5 V 3 A DC supply","illustrationId":"battery","owned":false,"quantity":1},{"id":"iec-c13-mains-lead","name":"IEC C13 mains lead","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"warning","body":"Use position SG90 servos that hold an angle. A continuous-rotation servo will not stop at the angle this sketch writes."}]$p18s0blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 0;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $p18s1stage$Understand the Project$p18s1stage$,
  title = $p18s1title$Understand Power and Pin Architecture$p18s1title$,
  description = $p18s1desc$Servos and the Uno do not share the Arduino 5V pin. They share ground. The pin map stays fixed for the rest of the build.$p18s1desc$,
  tip = $p18s1tip$The servo supply is a MEAN WELL GST18A05-P1J: 5 V, 3 A, 5.5×2.1 mm, center positive. It needs the IEC C13 mains lead, fitted as supplied. Do not open the adapter or change the mains plug. A 9V snap is not the servo supply.$p18s1tip$,
  blocks = $p18s1blocks$[{"type":"text","heading":"Two 5V domains, one ground","body":"USB powers the Uno. Uno 5V feeds only the joystick, through the left + rail. Servo current does not enter the breadboard. The GST18A05-P1J plugs into an Adafruit 368, a preassembled 2.1 mm jack whose screws are marked + and − for a center-positive plug. Both servo red wires clamp under the + screw. Both brown wires, and one ground jumper to the left − rail, clamp under the − screw. Do not connect the + screw to Uno 5V. If the grounds are split, the servos jitter or ignore the signal. If the + screw reaches Uno 5V, the servo supply can back-feed the Uno. Tower Pro’s SG90 sheet lists 4.8 V operation and does not publish stall current, so this build uses a 3 A regulated 5 V supply rather than a small linear breadboard regulator. Adafruit’s page for product 368 does not publish a current rating. A 2019 Adafruit support reply gave that adapter a nominal 2 A."},{"type":"connections","heading":"Pin map","summary":"Pan D9 · tilt D10 · joystick A0/A1/D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"warning","body":"Do not feed servo VCC from the Uno 5V header. Two SG90s can stall well above what USB 5V should supply, and the board will reset. Do not connect the adapter + screw to Uno 5V or to a breadboard + rail. Clamping a Dupont pin under the Adafruit 368 screw is not a rated connection: product 368 publishes no current rating, and this tutorial has no replacement connector yet."}]$p18s1blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 1;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p18s2stage$Mechanical Assembly$p18s2stage$,
  title = $p18s2title$Prepare the Mechanical Parts$p18s2title$,
  description = $p18s2desc$Lay out the pan-tilt kit: base, U-bracket, camera plate, horns, and screws. Identify pan versus tilt before any servo goes into a hole.$p18s2desc$,
  tip = null,
  blocks = $p18s2blocks$[{"type":"text","heading":"What you should have","body":"A typical SG90 pan-tilt kit has a round or square base (pan), a U-shaped bracket that rides on that base, a camera plate for the tilt servo, several horns, and short screws. Match each piece to the kit diagram if one is included. Keep the two servos aside until the next step — do not tighten horns yet."},{"type":"text","heading":"Orientation","body":"The pan servo will sit in the base, output shaft pointing up. The tilt servo will sit in the U-bracket, output shaft pointing sideways so the camera plate can nod. If your kit labels the parts, follow those labels. If it does not, the piece that bolts to the desk or breadboard area is the pan base."},{"type":"expected","heading":"Check","body":"You can name the base, the U-bracket, and the camera plate. Screws that go into the servo body are short — do not use a long screw that can punch into the gearbox."}]$p18s2blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 2;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p18s3stage$Mechanical Assembly$p18s3stage$,
  title = $p18s3title$Assemble the Base and Pan Servo$p18s3title$,
  description = $p18s3desc$Seat the pan servo in the base with the shaft centred. Fit a horn loosely. Do not lock the horn at an extreme angle.$p18s3desc$,
  tip = $p18s3tip$Most kits screw through the servo lug holes into the base. Snug, not stripped.$p18s3tip$,
  blocks = $p18s3blocks$[{"type":"text","heading":"Mount the pan servo","body":"Slide the pan SG90 into the base pocket so the brass output shaft is centred in the base opening. Route the three-wire lead out through the kit’s cable notch, not pinched under the servo body. Fit the screws through the servo mounting lugs into the base."},{"type":"text","heading":"Horn at mid-travel","body":"Push the single-arm or four-point horn onto the pan shaft so the U-bracket will sit square over the base when the servo is near mid-travel. Leave the horn screw slightly loose for now. You will command 90° in software later and reseat the horn so “90” is actually straight."},{"type":"test","body":"With power still off, rotate the horn gently. You should feel a little gearbox resistance, not a hard plastic clash against the base."},{"type":"expected","heading":"Expected result","body":"The pan servo is captive in the base, the lead is free, and the horn is on the shaft but not locked at a hard stop."}]$p18s3blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 3;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p18s4stage$Mechanical Assembly$p18s4stage$,
  title = $p18s4title$Mount the Tilt Servo and Camera Plate$p18s4title$,
  description = $p18s4desc$Fit the U-bracket to the pan horn, seat the tilt servo, and attach the camera plate. Keep both joints able to move.$p18s4desc$,
  tip = null,
  blocks = $p18s4blocks$[{"type":"text","heading":"U-bracket on pan","body":"Bolt the U-bracket to the pan horn so the open side of the U faces the direction your camera plate will nod. The tilt servo sits in one arm of the U, shaft toward the plate."},{"type":"text","heading":"Tilt servo and plate","body":"Seat the second SG90 in the U-bracket. Route its lead so it cannot wrap around the pan joint. Attach the camera plate to the tilt horn at a visual mid-angle — plate roughly level, not folded into the U. Screw the plate on, but leave the horn-to-shaft screw slightly loose until calibration."},{"type":"warning","body":"Fingers and cables can pinch between the U-bracket and the base when pan moves. Keep the two servo leads long enough to follow the motion, and tape a service loop so they do not taut-pull a header later."},{"type":"expected","heading":"Check","body":"You have a base that can yaw and a plate that can nod. Neither joint is already sitting on a mechanical stop."}]$p18s4blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 4;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p18s5stage$Mechanical Assembly$p18s5stage$,
  title = $p18s5title$Check Mechanical Movement$p18s5title$,
  description = $p18s5desc$With power still off, confirm pan and tilt can move through a useful range without scraping or pulling wires.$p18s5desc$,
  tip = $p18s5tip$If a joint is stiff, loosen the horn one click rather than forcing it.$p18s5tip$,
  blocks = $p18s5blocks$[{"type":"test","body":"Hold the base still. Ease the camera plate through tilt. Then ease the whole U-bracket through pan. Watch the two servo leads: they should follow, not stretch. Power is still off. Once the servos are powered, do not force a horn by hand. If a joint binds, remove power and ease the horn off."},{"type":"expected","heading":"Expected result","body":"Each axis moves past centre in both directions without plastic grinding and without a lead catching on a screw. Stops should feel like bracket-on-bracket, not a servo grinding its gear teeth."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"The plate hits the U-bracket immediately","solution":"Pull the tilt horn off and rotate it one spline so the plate sits level at mid-travel. Do not move the servo body."},{"problem":"Pan scrapes the desk or the base","solution":"The pan horn is clocked too far. Lift it off the shaft and reseat it so the U-bracket is square at centre."},{"problem":"A screw will not seat","solution":"Use the short servo-lug screws. A long screw can enter the gearbox and lock the output shaft."}]}]$p18s5blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 5;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p18s6stage$Build the Electronics$p18s6stage$,
  title = $p18s6title$Set Up Arduino, Breadboard, and Power$p18s6title$,
  description = $p18s6desc$USB powers the Uno. The Adafruit 368 will power the servos. Connect Uno 5V, Uno GND, and the adapter ground before any servo signal wire goes in.$p18s6desc$,
  tip = $p18s6tip$Use a data-capable USB cable. Charge-only cables never appear as a serial port later.$p18s6tip$,
  blocks = $p18s6blocks$[{"type":"text","heading":"Find the breadboard power rails","body":"Along each long edge there is a + rail (often red) and a − rail (often blue or black). Holes in one + rail are connected to each other. + is not connected to −. This build uses the left + rail for Uno 5V and the left − rail for ground. Servo positive does not use a breadboard rail. Some breadboards include metal clips that join opposite + rails — remove or skip those. Leave the right-hand rails empty."},{"type":"text","heading":"Seat the adapter and jumpers","body":"Place the Adafruit 368 beside the breadboard. Its screws are marked + and − for a center-positive plug. Uno 5V goes to left + row 2. Uno GND goes to left − row 2. One male-to-male jumper goes from left − row 4 to the − screw: slide the plastic housing back on that end and tighten the screw on the metal pin until a gentle tug does not pull it out. Do not put a wire on the + screw yet. Do not connect the + screw to either breadboard + rail. This build uses 14 male-to-male jumpers. Leave D9, D10, A0, A1, and D2 empty."},{"type":"wiring","heading":"Power only","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Adafruit 368","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"}],"assembly":{"parts":["psu"],"jumpers":["uno-5v","uno-gnd","psu-gnd"]}},{"type":"connections","summary":"Logic 5V from Uno · adapter ground tied to Uno GND","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"}]},{"type":"warning","body":"Plug the GST18A05-P1J into the Adafruit 368 until the plug seats. The plug is 5.5×2.1 mm and center positive, and this jack is Adafruit’s 2.1 mm jack for that plug. Do not connect servo VCC yet. Do not join the + screw to Uno 5V. The − screw stays tied to Uno GND. The Dupont pin under the screw is not a rated power joint."},{"type":"test","body":"Connect USB to the Uno. Confirm the Uno power LED is on. Then plug in the GST18A05-P1J. The adapter + screw must not touch a breadboard + rail. Nothing else should be wired."},{"type":"expected","heading":"Expected result","body":"Uno powered from USB. The left + rail is Uno 5V only. The adapter + screw is the servo supply and is not tied to that rail. Left − row 2 and left − row 4 share ground with the adapter − screw. D9, D10, A0, A1, and D2 are still empty. The adapter body is not hot."}]$p18s6blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 6;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p18s7stage$Build the Electronics$p18s7stage$,
  title = $p18s7title$Connect the Pan Servo$p18s7title$,
  description = $p18s7desc$Pan is the lower SG90. Red clamps under the adapter + screw, brown under the − screw, orange to D9.$p18s7desc$,
  tip = $p18s7tip$If the lead has yellow instead of orange, that is still the signal wire.$p18s7tip$,
  blocks = $p18s7blocks$[{"type":"text","heading":"What you are wiring","body":"The pan servo connector is female, so use male-to-male wires. Slide the housing back on the adapter end of the red and brown wires and clamp the metal pins under the screws: red under +, brown under −, sharing the − screw with the ground jumper already there. The other ends plug into the servo’s red and brown sockets. Tighten each screw until a gentle tug does not pull the pin out. Orange goes from Uno D9 straight into the signal pin. That orange wire does not enter a breadboard hole and does not go under a screw. Red must not touch the left + rail."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Adafruit 368","illustrationId":"generic-module"},{"id":"pan","name":"Pan servo","illustrationId":"servo-sg90"}],"connections":[{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"}],"assembly":{"parts":["pan"],"jumpers":["pan-vcc","pan-gnd","pan-sig"]}},{"type":"connections","summary":"Pan servo on D9","rows":[{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Three pan wires only: servo 5 V, common GND, D9. The tilt servo is still unplugged. Do not swap red and orange — that puts 5V on a GPIO."}]$p18s7blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 7;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p18s8stage$Build the Electronics$p18s8stage$,
  title = $p18s8title$Connect the Tilt Servo$p18s8title$,
  description = $p18s8desc$Tilt is the upper SG90. Same colour code as pan, but the signal wire goes to D10.$p18s8desc$,
  tip = null,
  blocks = $p18s8blocks$[{"type":"text","heading":"What you are wiring","body":"The tilt connector is female too. Clamp its red pin under the same + screw and its brown pin under the same − screw. Orange goes from Uno D10 straight to the signal pin. Both servos share the adapter screws. Only the signal pins differ."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Adafruit 368","illustrationId":"generic-module"},{"id":"tilt","name":"Tilt servo","illustrationId":"servo-sg90"}],"connections":[{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"}],"assembly":{"parts":["tilt"],"jumpers":["tilt-vcc","tilt-gnd","tilt-sig"]}},{"type":"connections","summary":"Tilt servo on D10","rows":[{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Pan remains on D9. Tilt is on D10. Both reds are under the adapter + screw. Both browns are under the adapter − screw. No servo red is in the Uno 5V header."}]$p18s8blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 8;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p18s9stage$Build the Electronics$p18s9stage$,
  title = $p18s9title$Connect the Joystick$p18s9title$,
  description = $p18s9desc$The joystick is a low-current analog module. It uses the Uno 5V rail, not the adapter + screw.$p18s9desc$,
  tip = $p18s9tip$KY-023 pins are usually labelled GND, +5V, VRx, VRy, SW in that order. Match labels, not lead colour.$p18s9tip$,
  blocks = $p18s9blocks$[{"type":"text","heading":"What you are wiring","body":"Plug the joystick pins into c8 through c12: +5V, GND, VRx, VRy, SW. a8 goes to the left + rail at row 8. a9 goes to the left − rail at row 9. A0 goes to a10, A1 to a11, and D2 to a12. The sketch later enables INPUT_PULLUP on D2, so an unpressed stick reads HIGH and a click reads LOW."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"joystick","name":"Joystick","illustrationId":"joystick"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}],"assembly":{"parts":["joystick"],"jumpers":["joy-5v","joy-gnd","joy-vrx","joy-vry","joy-sw"]}},{"type":"connections","summary":"Joystick VRx A0 · VRy A1 · SW D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"warning","body":"Do not power the joystick from the adapter + screw. The catalogue joystick is a 5V analog part — Uno 5V is the correct source."}]$p18s9blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 9;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p18s10stage$Build the Electronics$p18s10stage$,
  title = $p18s10title$Check the Complete Circuit$p18s10title$,
  description = $p18s10desc$Before any sketch, the pin map should be complete: D9 pan, D10 tilt, A0/A1/D2 joystick, servo 5 V on servo VCC, common ground.$p18s10desc$,
  tip = null,
  blocks = $p18s10blocks$[{"type":"text","heading":"What “complete” means","body":"Every net below should exist once. Two browns may share the adapter − screw. Two reds may share the adapter + screw. D9 and D10 must not share a pin with each other or with SW."},{"type":"wiring","heading":"Complete wiring diagram","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Adafruit 368","illustrationId":"generic-module"},{"id":"pan","name":"Pan servo","illustrationId":"servo-sg90"},{"id":"tilt","name":"Tilt servo","illustrationId":"servo-sg90"},{"id":"joystick","name":"Joystick","illustrationId":"joystick"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"connections","heading":"Exact connections","summary":"Pan D9 · tilt D10 · joystick A0/A1/D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"expected","heading":"Check","body":"You can trace Uno 5V to the joystick, the adapter + screw to both servo reds, the adapter − screw to both browns and to Uno GND, D9 to pan SIG, D10 to tilt SIG, A0 to VRx, A1 to VRy, and D2 to SW. There is no wire from the adapter + screw to Uno 5V."}]$p18s10blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 10;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p18s11stage$Build the Program$p18s11stage$,
  title = $p18s11title$Create the Arduino Program$p18s11title$,
  description = $p18s11desc$Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.$p18s11desc$,
  tip = null,
  blocks = $p18s11blocks$[{"type":"text","heading":"What we are adding","body":"PAN_PIN, TILT_PIN, JOY_X_PIN, JOY_Y_PIN, and JOY_SW_PIN match the wiring: D9, D10, A0, A1, D2. Serial is opened at 9600 baud so later tests can print without changing the port settings."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":[],"code":"const int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Named constants keep the pin map in one place. Analog pins use A0 and A1 — that is the Uno label, not the number 0 and 1. setup() and loop() are empty on purpose until the next step attaches a servo."}]$p18s11blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 11;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p18s12stage$Build the Program$p18s12stage$,
  title = $p18s12title$Add the Servo Library$p18s12title$,
  description = $p18s12desc$Servo.h is bundled with the Arduino IDE. Include it and attach the pan servo to D9. The pan servo will hold, not sweep, until the next step.$p18s12desc$,
  tip = $p18s12tip$You do not need Library Manager for Servo.h on an Uno.$p18s12tip$,
  blocks = $p18s12blocks$[{"type":"text","heading":"What we are adding","body":"#include <Servo.h> brings in the driver. Servo panServo; is the object. panServo.attach(PAN_PIN) tells that object to emit the control pulse on D9. Until you call write(), attach() typically sends a default mid pulse — keep fingers clear of the bracket."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Only pan is attached. Tilt is still a named pin with no Servo object. If the pan horn jumps when you later upload, that is the servo seeking the default pulse, not a wiring short. Leave the horn screw loose. After the servo settles, remove power, reseat the horn so the bracket is square, then tighten the screw."}]$p18s12blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 12;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p18s13stage$Build the Program$p18s13stage$,
  title = $p18s13title$Control the Pan Servo$p18s13title$,
  description = $p18s13desc$Command pan to 90°, then sweep 60 / 90 / 120 so you can see one axis move before tilt is in the sketch.$p18s13desc$,
  tip = null,
  blocks = $p18s13blocks$[{"type":"text","heading":"What we are adding","body":"write(90) is mid-travel for a typical SG90. The loop then steps to 60, 90, and 120 with a 1 s pause so you can watch the base yaw. We stay away from 0 and 180 so a slightly mis-clocked horn does not stall the gearbox."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n  panServo.write(90);\n  delay(500);\n  Serial.println(\"Pan at 90.\");\n}\n\nvoid loop() {\n  panServo.write(60);\n  Serial.println(\"Pan 60\");\n  delay(1000);\n  panServo.write(90);\n  Serial.println(\"Pan 90\");\n  delay(1000);\n  panServo.write(120);\n  Serial.println(\"Pan 120\");\n  delay(1000);\n}"},{"type":"code_explanation","body":"Serial prints the commanded angle so you can match what you see to what the sketch asked for. If Serial says Pan 120 and the base barely moves, the fault is mechanical binding or power — not this write() call."},{"type":"expected","heading":"Check","body":"This sketch attaches and writes only panServo on D9. TILT_PIN is named but unused — leave the tilt signal wire on D10 from the electronics stage. Physical pan motion is confirmed later in Calibrate and Test."}]$p18s13blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 13;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p18s14stage$Build the Program$p18s14stage$,
  title = $p18s14title$Control the Tilt Servo$p18s14title$,
  description = $p18s14desc$Attach the second Servo object on D10 and sweep tilt while pan holds 90°.$p18s14desc$,
  tip = null,
  blocks = $p18s14blocks$[{"type":"text","heading":"What we are adding","body":"Servo tiltServo; and tiltServo.attach(TILT_PIN) claim D10. setup() parks both axes at 90°. loop() sweeps only tilt so a pan fault and a tilt fault stay separable."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(90);\n  tiltServo.write(90);\n  delay(500);\n  Serial.println(\"Both servos at 90.\");\n}\n\nvoid loop() {\n  tiltServo.write(60);\n  Serial.println(\"Tilt 60\");\n  delay(1000);\n  tiltServo.write(90);\n  Serial.println(\"Tilt 90\");\n  delay(1000);\n  tiltServo.write(120);\n  Serial.println(\"Tilt 120\");\n  delay(1000);\n}"},{"type":"code_explanation","body":"Two Servo objects can run on one Uno. Each attach() consumes a timer channel — two SG90s is well within the limit. Pan stays at 90 so you can judge whether tilt is nodding on its own."},{"type":"expected","heading":"Expected result","body":"When this sketch runs, the camera plate nods through 60 / 90 / 120 while the base stays put. If the whole assembly yaws instead, the D9/D10 leads are swapped."}]$p18s14blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 14;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p18s15stage$Build the Program$p18s15stage$,
  title = $p18s15title$Read Joystick Input$p18s15title$,
  description = $p18s15desc$Print the raw analog X/Y values and the switch. Servos hold 90° so you can trust the input without chasing motion.$p18s15desc$,
  tip = $p18s15tip$Resting X and Y are often near 512, but many modules sit somewhat above or below that. Note your rest values. A click should print SW 0.$p18s15tip$,
  blocks = $p18s15blocks$[{"type":"text","heading":"What we are adding","body":"analogRead returns 0–1023 on the Uno. VRx is A0, VRy is A1. INPUT_PULLUP on D2 makes the unpressed switch read HIGH (1). Pressing SW shorts to ground, so it reads LOW (0). Servos attach and park at 90 so they do not go limp during this test."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(90);\n  tiltServo.write(90);\n  Serial.begin(9600);\n  Serial.println(\"Joystick test. Servos hold 90.\");\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int sw = digitalRead(JOY_SW_PIN);\n\n  Serial.print(\"X \");\n  Serial.print(x);\n  Serial.print(\"  Y \");\n  Serial.print(y);\n  Serial.print(\"  SW \");\n  Serial.println(sw);\n\n  delay(200);\n}"},{"type":"code_explanation","body":"We still do not map the stick to angles. If X never changes when you move left/right, A0 is the fault. If Y is stuck at 0 or 1023, VRy may be sitting on 5V or GND instead of A1."},{"type":"text","heading":"Resting centre","body":"A centred stick is rarely exactly 512. Read Serial at rest and write down X and Y. In the combined sketch those numbers become JOY_X_CENTER and JOY_Y_CENTER so the deadzone sits around your module, not around an assumed midpoint."},{"type":"test","body":"When you upload this sketch later: rest the stick, move X, move Y, then click SW. Watch Serial at 9600 baud."},{"type":"expected","heading":"Expected result","body":"At rest, X and Y are often around 480–540 rather than exactly 512. Write those rest values down. Full left or right drives X toward 0 or 1023. Full up or down drives Y toward an extreme. SW prints 1 at rest and 0 while clicked."}]$p18s15blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 15;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p18s16stage$Build the Program$p18s16stage$,
  title = $p18s16title$Move the Servos from the Joystick$p18s16title$,
  description = $p18s16desc$The stick sets direction and speed. It does not set an absolute angle. Releasing it holds the last aim.$p18s16desc$,
  tip = null,
  blocks = $p18s16blocks$[{"type":"text","heading":"What we are adding","body":"axisRate() turns stick deflection into degrees per second. Inside the deadzone the rate is 0, so the stored angle does not change. Just outside the deadzone the rate is small. Full deflection reaches MAX_DEG_PER_SEC, 90 degrees per second. The loop multiplies that rate by the seconds since the last pass, then keeps the result between PAN_MIN and PAN_MAX. The angle is a float, so a slow rate can move less than one degree per pass. Servo.write() receives the rounded degree."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nconst int PAN_MIN = 20;\nconst int PAN_MAX = 160;\nconst int TILT_MIN = 20;\nconst int TILT_MAX = 160;\nconst int PAN_CENTER = 90;\nconst int TILT_CENTER = 90;\nconst int JOY_X_CENTER = 512;\nconst int JOY_Y_CENTER = 512;\nconst int DEADZONE = 40;\nconst float MAX_DEG_PER_SEC = 90;\n\nServo panServo;\nServo tiltServo;\n\nfloat panAngle = PAN_CENTER;\nfloat tiltAngle = TILT_CENTER;\nunsigned long lastMs = 0;\n\n// Relative joystick control: deflection outside the deadzone sets degrees per second.\nfloat axisRate(int raw, int center, bool invert) {\n  int delta = raw - center;\n  if (invert) {\n    delta = -delta;\n  }\n  if (abs(delta) <= DEADZONE) {\n    return 0;\n  }\n  int span = delta > 0 ? (1023 - center - DEADZONE) : (center - DEADZONE);\n  if (span < 1) {\n    span = 1;\n  }\n  float magnitude = (abs(delta) - DEADZONE) / (float)span;\n  if (magnitude > 1) {\n    magnitude = 1;\n  }\n  float sign = delta > 0 ? 1 : -1;\n  return sign * magnitude * MAX_DEG_PER_SEC;\n}\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write((int)(panAngle + 0.5));\n  tiltServo.write((int)(tiltAngle + 0.5));\n  Serial.begin(9600);\n  lastMs = millis();\n}\n\nvoid loop() {\n  unsigned long now = millis();\n  float dt = (now - lastMs) / 1000.0;\n  lastMs = now;\n  if (dt < 0) {\n    dt = 0;\n  }\n  if (dt > 0.2) {\n    dt = 0.2;\n  }\n\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n\n  panAngle += axisRate(x, JOY_X_CENTER, false) * dt;\n  tiltAngle += axisRate(y, JOY_Y_CENTER, false) * dt;\n  if (panAngle < PAN_MIN) panAngle = PAN_MIN;\n  if (panAngle > PAN_MAX) panAngle = PAN_MAX;\n  if (tiltAngle < TILT_MIN) tiltAngle = TILT_MIN;\n  if (tiltAngle > TILT_MAX) tiltAngle = TILT_MAX;\n\n  panServo.write((int)(panAngle + 0.5));\n  tiltServo.write((int)(tiltAngle + 0.5));\n\n  Serial.print(\"Pan \");\n  Serial.print((int)(panAngle + 0.5));\n  Serial.print(\"  Tilt \");\n  Serial.println((int)(tiltAngle + 0.5));\n\n  delay(20);\n}"},{"type":"code_explanation","body":"This sketch already holds position when the stick is centred. It does not recentre when you click SW. The next step adds that click. To reverse one axis later, change that axisRate() call’s third argument from false to true."}]$p18s16blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 16;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p18s17stage$Build the Program$p18s17stage$,
  title = $p18s17title$Add the Centre Button$p18s17title$,
  description = $p18s17desc$Clicking the joystick returns both axes to their centre angles. Travel stays inside the 20–160 limits.$p18s17desc$,
  tip = $p18s17tip$If an axis is reversed, change that axisRate() call from false to true. Do not swap the servo power leads.$p18s17tip$,
  blocks = $p18s17blocks$[{"type":"text","heading":"What we are adding","body":"PAN_MIN and PAN_MAX, and the same pair for tilt, are conservative starting limits. Tighten them if your bracket hits the plastic sooner. DEADZONE of 40 around JOY_X_CENTER and JOY_Y_CENTER ignores rest noise. Start those centres at 512; if Serial at rest was different, put those numbers in instead. Clicking SW (LOW) sets both stored angles to PAN_CENTER and TILT_CENTER. Letting the stick go leaves the mount where it is."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nconst int PAN_MIN = 20;\nconst int PAN_MAX = 160;\nconst int TILT_MIN = 20;\nconst int TILT_MAX = 160;\nconst int PAN_CENTER = 90;\nconst int TILT_CENTER = 90;\nconst int JOY_X_CENTER = 512;\nconst int JOY_Y_CENTER = 512;\nconst int DEADZONE = 40;\nconst float MAX_DEG_PER_SEC = 90;\n\nServo panServo;\nServo tiltServo;\n\nfloat panAngle = PAN_CENTER;\nfloat tiltAngle = TILT_CENTER;\nunsigned long lastMs = 0;\n\n// Relative joystick control: deflection outside the deadzone sets degrees per second.\nfloat axisRate(int raw, int center, bool invert) {\n  int delta = raw - center;\n  if (invert) {\n    delta = -delta;\n  }\n  if (abs(delta) <= DEADZONE) {\n    return 0;\n  }\n  int span = delta > 0 ? (1023 - center - DEADZONE) : (center - DEADZONE);\n  if (span < 1) {\n    span = 1;\n  }\n  float magnitude = (abs(delta) - DEADZONE) / (float)span;\n  if (magnitude > 1) {\n    magnitude = 1;\n  }\n  float sign = delta > 0 ? 1 : -1;\n  return sign * magnitude * MAX_DEG_PER_SEC;\n}\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write((int)(panAngle + 0.5));\n  tiltServo.write((int)(tiltAngle + 0.5));\n  Serial.begin(9600);\n  Serial.println(\"Pan-tilt ready.\");\n  lastMs = millis();\n}\n\nvoid loop() {\n  unsigned long now = millis();\n  float dt = (now - lastMs) / 1000.0;\n  lastMs = now;\n  if (dt < 0) {\n    dt = 0;\n  }\n  if (dt > 0.2) {\n    dt = 0.2;\n  }\n\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int sw = digitalRead(JOY_SW_PIN);\n\n  if (sw == LOW) {\n    panAngle = PAN_CENTER;\n    tiltAngle = TILT_CENTER;\n  } else {\n    panAngle += axisRate(x, JOY_X_CENTER, false) * dt;\n    tiltAngle += axisRate(y, JOY_Y_CENTER, false) * dt;\n    if (panAngle < PAN_MIN) panAngle = PAN_MIN;\n    if (panAngle > PAN_MAX) panAngle = PAN_MAX;\n    if (tiltAngle < TILT_MIN) tiltAngle = TILT_MIN;\n    if (tiltAngle > TILT_MAX) tiltAngle = TILT_MAX;\n  }\n\n  panServo.write((int)(panAngle + 0.5));\n  tiltServo.write((int)(tiltAngle + 0.5));\n\n  Serial.print(\"Pan \");\n  Serial.print((int)(panAngle + 0.5));\n  Serial.print(\"  Tilt \");\n  Serial.println((int)(tiltAngle + 0.5));\n\n  delay(20);\n}"},{"type":"code_explanation","body":"This is the complete sketch. Pin map: D9 pan, D10 tilt, A0 VRx, A1 VRy, D2 SW. A centred stick holds. A larger deflection moves faster. A click returns both axes to centre. View Code on a finished project shows this same program."}]$p18s17blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 17;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $p18s18stage$Calibrate and Test$p18s18stage$,
  title = $p18s18title$Upload the Program$p18s18title$,
  description = $p18s18desc$Board: Arduino Uno. Serial Monitor at 9600 baud. Plug in the GST18A05-P1J before you expect the servos to hold.$p18s18desc$,
  tip = $p18s18tip$If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.$p18s18tip$,
  blocks = $p18s18blocks$[{"type":"text","heading":"Before you upload","body":"Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in. Include Servo.h is enough — do not install a third-party servo library for this sketch."},{"type":"text","heading":"How to upload","body":"Paste the combined sketch from the previous step. Plug in the GST18A05-P1J so the servos have 5 V. Click Upload, then open Serial Monitor at 9600 baud. Keep clear of the bracket; the servos will seek 90° on attach."},{"type":"test","body":"Upload once. Watch Serial for “Pan-tilt ready.”"},{"type":"expected","heading":"Expected result","body":"The IDE reports Done uploading. Serial prints “Pan-tilt ready.” Both servos should sit near mid-travel and hold, not chatter, with the stick at rest."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"No serial port","solution":"Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port."},{"problem":"Upload error / avrdude","solution":"Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy."},{"problem":"Board resets when servos move","solution":"Servo VCC is on Uno 5V or the supply is missing. Move both reds under the adapter + screw and confirm the − screw reaches Uno GND."}]}]$p18s18blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 18;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $p18s19stage$Calibrate and Test$p18s19stage$,
  title = $p18s19title$Test Individual Movements$p18s19title$,
  description = $p18s19desc$Move the stick on one axis at a time. Confirm pan yaws the base and tilt nods the plate, and note if either axis is reversed.$p18s19desc$,
  tip = $p18s19tip$Keep the camera plate lightly loaded until direction is confirmed.$p18s19tip$,
  blocks = $p18s19blocks$[{"type":"test","body":"Leave the stick centred, then move only left/right. Watch the base. Return to centre, then move only up/down. Watch the plate. Click SW once."},{"type":"expected","heading":"Expected result","body":"Left/right yaws pan only, and a small deflection moves it slowly. Up/down nods tilt only. Letting the stick go holds the new aim. A click returns both to about 90°."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Pan moves when you intend tilt","solution":"Swap the VRx and VRy wires at A0/A1, or swap JOY_X_PIN and JOY_Y_PIN in the sketch. The module axes may not match how the bracket is sitting on the desk."},{"problem":"An axis moves the wrong way","solution":"Change that axis’s axisRate() third argument from false to true. Do not reverse the 5V/GND leads to “fix” direction."},{"problem":"One servo is dead","solution":"Confirm that servo’s red is on servo 5 V, brown on common GND, and orange on D9 (pan) or D10 (tilt). A swapped red/orange can damage a pin — power off before you reseat."}]}]$p18s19blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 19;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $p18s20stage$Calibrate and Test$p18s20stage$,
  title = $p18s20title$Calibrate Neutral Positions$p18s20title$,
  description = $p18s20desc$Command 90°, then reseat each horn so mid-code is mid-mechanism: plate level, U-bracket square on the base.$p18s20desc$,
  tip = $p18s20tip$Loosen the horn screw, lift the horn off the spline, and press it back on. Do not rotate the servo shaft against a powered motor.$p18s20tip$,
  blocks = $p18s20blocks$[{"type":"text","heading":"Why the horn comes off","body":"write(90) is a pulse, not a promise about the plastic. If you tightened the horn at an arbitrary spline, 90° can be a tilted plate. Click SW so both servos hold the electronic centre. Then unplug the GST18A05-P1J and the Uno USB before you loosen a horn screw or lift a horn. Do not turn the shaft or the bracket while a servo is powered."},{"type":"test","body":"Click SW and confirm both axes sit at centre. Unplug the servo supply and the Uno USB. Loosen the pan horn and reseat the U-bracket square over the base. Loosen the tilt horn and reseat the camera plate level. Retighten the horn screws. Plug the supply and USB back in, then click SW again."},{"type":"expected","heading":"Expected result","body":"After a click, the plate is level and the U-bracket is square. Small stick moves should travel evenly both ways before you hit PAN_MIN/MAX or the plastic stops."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"90° is still tilted after reseating","solution":"The horn only fits in discrete spline positions. Choose the spline closest to level, then trim TILT_CENTER (and PAN_CENTER) by a few degrees in the sketch if you need a last nudge."},{"problem":"The joint binds before 20° or 160°","solution":"Raise PAN_MIN / TILT_MIN or lower PAN_MAX / TILT_MAX until the bracket never hits itself. Limits are meant to be tighter than the servo’s full range."}]}]$p18s20blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 20;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $p18s21stage$Calibrate and Test$p18s21stage$,
  title = $p18s21title$Test Combined Movement$p18s21title$,
  description = $p18s21desc$Aim on both axes, hold, recentre, and confirm the pin map still matches the complete wiring diagram.$p18s21desc$,
  tip = null,
  blocks = $p18s21blocks$[{"type":"image","imageKey":"servoCamera","caption":"Keep this GPIO map if you mount a camera later: pan D9, tilt D10, joystick A0 / A1 / D2."},{"type":"test","body":"Aim toward one corner, let the stick go (it should hold). Aim toward the opposite corner. Click SW to recentre. Repeat once with a lightweight camera or webcam on the plate if you have one, or leave the plate empty."},{"type":"expected","heading":"Expected result","body":"Both axes move together while the stick is deflected, hold when centred, and return to a level 90° on a click. No reset, no gearbox grind, no lead pulling tight. You have a joystick-aimed pan-tilt mount."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Servos chatter at rest","solution":"Increase DEADZONE (try 60), or set JOY_X_CENTER and JOY_Y_CENTER to the X and Y values Serial printed at rest. Confirm the joystick 5V is the Uno rail and GND is common. A floating VRx/VRy will never sit still."},{"problem":"A small stick move throws the mount toward the centre","solution":"The uploaded sketch is still mapping the stick to an absolute angle. Upload the combined sketch. A centred stick must hold, and a small deflection must only creep from that angle."},{"problem":"Mechanism holds, then jumps when the supply sags","solution":"The servo supply is sagging or the plug is not seated. Use the GST18A05-P1J in the Adafruit 368, center positive, and keep both servo reds off the Uno 5V pin."},{"problem":"Click does nothing","solution":"Confirm SW is on D2 and JOY_SW_PIN uses INPUT_PULLUP. SW should read 0 only while pressed. If it is always 0, the pin is shorted to GND."},{"problem":"USB disconnects when the mount moves","solution":"The Uno is supplying servo current. Recheck that both VCC (red) wires are under the adapter + screw and that the − screw is tied to Uno GND."}]},{"type":"connections","heading":"Pin map you built","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]}]$p18s21blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 21;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $p24s0stage$Introduction$p24s0stage$,
  title = $p24s0title$Build a phone-controlled colour light$p24s0title$,
  description = $p24s0desc$One RGB LED follows the colour and brightness a phone sends.$p24s0desc$,
  tip = null,
  blocks = $p24s0blocks$[{"type":"image","imageKey":"esp32BleRgb","caption":"The workbench photograph is not in the app yet. The wiring diagram is the connection reference."},{"type":"text","heading":"What you are building","body":"An ESP32 DevKit, three small transistors, and one RGB LED on a breadboard. The phone is the colour picker. The board does the switching."},{"type":"text","heading":"What it will do","body":"After you upload the sketch, the LED comes on red at a low brightness and the board advertises the name Solderi RGB. From the phone you can turn that light orange, purple, white, or off, and you can make it brighter or dimmer."}]$p24s0blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 0;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $p24s1stage$Introduction$p24s1stage$,
  title = $p24s1title$Follow one colour from the phone to the LED$p24s1title$,
  description = $p24s1desc$The phone sends text. The ESP32 switches current from the 5 V pin.$p24s1desc$,
  tip = null,
  blocks = $p24s1blocks$[{"type":"text","heading":"Four parts, four jobs","body":"The phone writes a colour such as 255,80,0. The ESP32 receives that text and sets three PWM outputs. PWM means the pin is switching on and off very quickly. A higher duty cycle means the pin stays on for more of each cycle, so that colour looks brighter. Each output drives one PN2222A transistor. The transistor connects that colour of the LED to ground. The LED itself takes its current from the DevKit 5 V pin, through a 220 Ω resistor."},{"type":"text","heading":"Why the transistor is there","body":"This LED is common anode: the shared pin is the positive side. A 3.3 V GPIO cannot light the green or blue chip directly, because those chips need more voltage than the pin can provide. The transistor lets the 5 V pin supply the LED while the GPIO only asks the transistor to turn on."},{"type":"warning","body":"Power the DevKit from USB only. With USB plugged in, the 5 V pin is an output, about 4.7 V after the board’s diode. Do not connect another supply to 5 V or 3.3 V at the same time. Do not connect a GPIO pin to 5 V or straight to an LED cathode."},{"type":"tip","body":"Use a USB port close to 5 V. On a weak port the green and blue chips can stay dark even when the wiring is right, because their forward voltage is already about 3.3 V and can be as high as 4.0 V and 4.1 V."}]$p24s1blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 1;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p24s2stage$Hardware preparation$p24s2stage$,
  title = $p24s2title$Set the parts on the desk$p24s2title$,
  description = $p24s2desc$Five male-to-female wires reach the DevKit. Eight male-to-male wires finish the board.$p24s2desc$,
  tip = null,
  blocks = $p24s2blocks$[{"type":"components","heading":"Required parts","items":[{"id":"esp32-devkitc-v4","name":"ESP32-DevKitC V4","illustrationId":"esp32","owned":false,"quantity":1},{"id":"rgb-led-ca","name":"Common-anode RGB LED","illustrationId":"rgb-led","owned":false,"quantity":1},{"id":"pn2222a","name":"PN2222A transistor","illustrationId":"transistor","owned":false,"quantity":3},{"id":"resistor-220","name":"220 Ω resistor","illustrationId":"resistor-band-220","owned":false,"quantity":3},{"id":"resistor-1k","name":"1 kΩ resistor","illustrationId":"resistor-band-1k","owned":false,"quantity":3},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-male-female","name":"Male-to-female jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":5},{"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":8},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"text","heading":"Count the wires before you start","body":"The DevKit sits beside the board. Its pins do not plug into the breadboard. Take five male-to-female wires for 5 V, GND, GPIO25, GPIO26, and GPIO27. The parts list counts eight male-to-male wires: three emitters, the LED anode, one bridge on each of the + and − rails, the green link from b15 to j9, and the blue link from j12 to j8. A wire that arches over the board enters only the two holes named for it."},{"type":"text","body":"You also need a phone with Bluetooth Low Energy and the free app nRF Connect for Mobile, from Nordic Semiconductor. The phone is not a line on this parts list."}]$p24s2blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 2;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p24s3stage$Hardware preparation$p24s3stage$,
  title = $p24s3title$Confirm the LED is common anode$p24s3title$,
  description = $p24s3desc$Pin 2 is the common anode. Pin 1 is red, pin 3 is blue, and pin 4 is green.$p24s3desc$,
  tip = null,
  blocks = $p24s3blocks$[{"type":"text","heading":"Find the leads","body":"Hold the Kingbright WP154A4SEJ3VBDZGW/CA with the dome up. One side of the rim has a flat. The lead nearest that flat is pin 1, the red cathode. The next lead, pin 2, is the longest and is the common anode. Pin 3 is the blue cathode. Pin 4 is the green cathode. All four leads must be spread to neighbouring breadboard rows. Make the first bend at least 3 mm below the lens."},{"type":"text","heading":"The datasheet detail","body":"Kingbright drawing DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, shows that order and shows the anode lead at least 2.5 mm longer. At 20 mA the typical forward voltage is 2.2 V red, 3.3 V blue, and 3.3 V green. The maximums are 2.8 V, 4.0 V, and 4.1 V. The absolute maximum current is 30 mA red, 30 mA blue, and 25 mA green. The leads are spaced about 1.27 mm, which is half a breadboard pitch, so they do not drop into four holes until you spread them."},{"type":"warning","body":"A common-cathode LED will not work in this circuit. The Young Sun YSL-R596AR3G4B5C-C10 joins its anodes at pin 2, but its drawing does not name the colour of each cathode, so this project does not use it."}]$p24s3blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 3;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $p24s4stage$Hardware preparation$p24s4stage$,
  title = $p24s4title$Know the transistors and the resistors$p24s4title$,
  description = $p24s4desc$Each colour uses one PN2222A, one 1 kΩ resistor, and one 220 Ω resistor.$p24s4desc$,
  tip = null,
  blocks = $p24s4blocks$[{"type":"text","heading":"Which way the transistor faces","body":"Use an onsemi PN2222ABU. The flat face is marked PN2222A. With that flat toward you and the leads pointing down, the leads are emitter, base, collector from left to right. On this breadboard the flat faces the right edge, so the top lead is the emitter, the middle lead is the base, and the bottom lead is the collector. Spread those leads to three neighbouring rows. A metal-can 2N2222, or a part marked only 2N2222, can use a different pin order."},{"type":"text","heading":"Why each resistor is there","body":"The 220 Ω resistor sits between the transistor and one LED cathode. It limits the LED current. The 1 kΩ resistor sits between a GPIO pin and the transistor base. It limits the current the ESP32 pin has to supply. Without the 220 Ω resistor the LED can draw more current than it is rated for. Without the 1 kΩ resistor the GPIO pin can be asked for far too much base current. On USB power, green and blue look dimmer than red because those chips have a higher forward voltage."},{"type":"tip","body":"A 220 Ω resistor reads red, red, brown, gold. A 1 kΩ resistor reads brown, black, red, gold. The parts list draws those bands. Match three of each before you insert them."}]$p24s4blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 4;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p24s5stage$Wiring$p24s5stage$,
  title = $p24s5title$Seat every part on these rows$p24s5title$,
  description = $p24s5desc$Use rows 1–15. The physical diagram names the same holes.$p24s5desc$,
  tip = null,
  blocks = $p24s5blocks$[{"type":"warning","body":"Holes a–e in one numbered row are joined. Holes f–j with the same number are a separate connection. Do not put two transistor leads in one row, or two LED leads in one row."},{"type":"text","heading":"The LED","body":"Flat side toward row 1, on the right half. Spread the leads into column f: pin 1 red in f6, pin 2 anode in f7, pin 3 blue in f8, and pin 4 green in f9."},{"type":"text","heading":"Red channel, left half","body":"Transistor flat to the right: emitter c1, base c2, collector c3. The 1 kΩ leads go in e2 and i2. The 220 Ω leads go in e3 and h6. h6 shares the right-hand row with f6. The resistor body sits above the gap and does not enter f6."},{"type":"text","heading":"Green channel, left half","body":"Emitter c10, base c11, collector c12, flat to the right. The 1 kΩ leads go in e11 and i11. The 220 Ω leads go in a12 and d15, on the left half. A male-to-male wire from b15 to j9 carries that node to f9. The wire arches over the board and enters only those two holes."},{"type":"text","heading":"Blue channel, right half","body":"Emitter h13, base h14, collector h15, flat to the right. The 1 kΩ leads go in e14 and g14. The 220 Ω leads go in j15 and g12. A male-to-male wire from j12 to j8 carries that node to f8. It stays in column j, arches over j9, and does not enter j9."},{"type":"wiring","heading":"Where the parts sit","connections":[],"assembly":{"parts":["led","q-red","q-green","q-blue","base-red","base-green","base-blue","limit-red","limit-green","limit-blue"],"jumpers":[]}},{"type":"test","heading":"Checkpoint","body":"Each transistor has its three leads in three neighbouring holes of one column, flat face to the right, emitter nearest the top. The LED leads are f6, f7, f8, and f9, with the longest lead in f7. No USB cable is plugged in yet."}]$p24s5blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 5;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p24s6stage$Wiring$p24s6stage$,
  title = $p24s6title$Connect 5 V and ground$p24s6title$,
  description = $p24s6desc$Two male-to-female wires feed the rails. Four male-to-male wires reach the parts.$p24s6desc$,
  tip = null,
  blocks = $p24s6blocks$[{"type":"text","body":"Put the DevKit beside the breadboard. With male-to-female wires, join DevKit 5 V to the left + rail at row 2, and DevKit GND to the left − rail at row 2. With male-to-male wires, bridge left + row 1 to right + row 1, and left − row 1 to right − row 1. Join j7 to the right + rail at row 7. Join a1 to the left − rail at row 3, a10 to the left − rail at row 10, and j13 to the right − rail at row 13. Leave USB unplugged."},{"type":"wiring","heading":"Supply and ground","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"}],"assembly":{"parts":[],"jumpers":["devkit-5v","devkit-gnd","bridge-plus","bridge-minus","anode-rail","red-emitter","green-emitter","blue-emitter"]}},{"type":"connections","heading":"These six links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"}]},{"type":"test","heading":"Checkpoint","body":"Both rail bridges and the 5 V and GND wires are on rows 1–15, above the rail break. j7 is the only LED lead row tied to +. a1, a10, and j13 are the emitter rows tied to −. The GPIO wires are not in yet. USB is still unplugged."}]$p24s6blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 6;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p24s7stage$Wiring$p24s7stage$,
  title = $p24s7title$Build the red channel$p24s7title$,
  description = $p24s7desc$GPIO25 switches the red cathode through j2 and f6.$p24s7desc$,
  tip = null,
  blocks = $p24s7blocks$[{"type":"text","body":"Join DevKit GPIO25 to j2 with a male-to-female wire. e2 and i2 hold the red 1 kΩ. c2 is the base. e3 and h6 hold the red 220 Ω, and f6 is LED pin 1."},{"type":"wiring","heading":"Red channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"}],"assembly":{"parts":[],"jumpers":["devkit-io25"]}},{"type":"connections","heading":"Red links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO25 is in j2, the 1 kΩ in e2 and i2, and the base in c2. The collector is c3 and the 220 Ω meets it at e3 and the LED at h6. No two of those leads share one hole."}]$p24s7blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 7;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p24s8stage$Wiring$p24s8stage$,
  title = $p24s8title$Build the green channel$p24s8title$,
  description = $p24s8desc$GPIO26 switches the green cathode through j11, b15, and f9.$p24s8desc$,
  tip = null,
  blocks = $p24s8blocks$[{"type":"text","body":"Join GPIO26 to j11. The green 1 kΩ is in e11 and i11, the base is c11, and the 220 Ω runs from a12 to d15. Add the male-to-male wire from b15 to j9. j9 shares the row with LED pin 4 in f9."},{"type":"wiring","heading":"Green channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"}],"assembly":{"parts":[],"jumpers":["devkit-io26","green-cathode"]}},{"type":"connections","heading":"Green links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO26 is in j11. The 1 kΩ lead is not in c10, c11, or c12. The b15 to j9 wire is the only extra lead in the green cathode row. f9 still holds the LED lead."}]$p24s8blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 8;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p24s9stage$Wiring$p24s9stage$,
  title = $p24s9title$Build the blue channel$p24s9title$,
  description = $p24s9desc$GPIO27 switches the blue cathode through a14, j12, and f8.$p24s9desc$,
  tip = null,
  blocks = $p24s9blocks$[{"type":"text","body":"Join GPIO27 to a14. The blue 1 kΩ is in e14 and g14, the base is h14, and the 220 Ω runs from j15 to g12. Add the male-to-male wire from j12 to j8. j8 shares the row with LED pin 3 in f8. The wire arches over j9 and does not enter it."},{"type":"wiring","heading":"Blue channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}],"assembly":{"parts":[],"jumpers":["devkit-io27","blue-cathode"]}},{"type":"connections","heading":"Blue links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO27 is in a14. f8 and j8 share the blue cathode row. f6, f7, f8, and f9 still hold one LED lead each. j9 is only the green link."}]$p24s9blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 9;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $p24s10stage$Wiring$p24s10stage$,
  title = $p24s10title$Check the whole circuit, then plug in USB$p24s10title$,
  description = $p24s10desc$This is the only full connection list. Use it once, before power.$p24s10desc$,
  tip = null,
  blocks = $p24s10blocks$[{"type":"connections","heading":"All 18 connections","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}],"summary":"Five male-to-female wires leave the DevKit. Eight male-to-male wires join the rails, the emitters, and the green and blue cathode links. Every other join is two leads in the same five-hole row."},{"type":"wiring","heading":"Finished arrangement","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Before USB","body":"LED pin 2 is the only lead on the red rail. The three emitters are the only transistor leads on the blue rail. No GPIO wire touches a rail. No two LED leads share a row. Then plug the data USB cable into the DevKit and the computer. Do not add another supply."}]$p24s10blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 10;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p24s11stage$Development environment$p24s11stage$,
  title = $p24s11title$Install the ESP32 board package$p24s11title$,
  description = $p24s11desc$The Arduino IDE needs the Espressif package before it can see this board.$p24s11desc$,
  tip = null,
  blocks = $p24s11blocks$[{"type":"text","body":"Install the Arduino IDE. Open File, Preferences, and add this URL to Additional boards manager URLs: https://espressif.github.io/arduino-esp32/package_esp32_index.json. Open Tools, Board, Boards Manager, search for esp32, and install the package Espressif Systems. This sketch uses Arduino-ESP32 3.x calls such as ledcAttach."},{"type":"tip","body":"If the board list has no ESP32 Dev Module after the install, close the IDE and open it again."}]$p24s11blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 11;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $p24s12stage$Development environment$p24s12stage$,
  title = $p24s12title$Select the board and the port$p24s12title$,
  description = $p24s12desc$The sketch talks to the computer at 115200 baud.$p24s12desc$,
  tip = null,
  blocks = $p24s12blocks$[{"type":"text","body":"Connect the data cable. In Tools, set Board to ESP32 Dev Module. Set Port to the new serial port. Set Upload Speed to 115200. Open Serial Monitor and set its speed to 115200 as well. A charge-only cable can power the board and still leave the port missing."},{"type":"expected","heading":"If the port is missing","body":"Install the USB-to-UART driver for the chip on your DevKit, try another USB socket, and try a cable you know can carry data. The port should appear in the Tools menu while the board is plugged in."}]$p24s12blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 12;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $p24s13stage$Firmware$p24s13stage$,
  title = $p24s13title$See how PWM sets the brightness$p24s13title$,
  description = $p24s13desc$GPIO25, GPIO26, and GPIO27 were chosen because they can output PWM.$p24s13desc$,
  tip = null,
  blocks = $p24s13blocks$[{"type":"text","heading":"Why these pins","body":"GPIO25 drives red, GPIO26 drives green, and GPIO27 drives blue. They are ordinary output pins. They are not the strapping pins 0, 2, 12, or 15, and they are not the input-only pins 34–39. A high duty cycle turns the matching transistor on for longer, so that colour gets brighter."},{"type":"text","body":"The next block is an excerpt from the sketch. It shows how brightness scales a colour. Do not upload this fragment."},{"type":"code","language":"cpp","filename":"excerpt-brightness.ino","code":"int channelDuty(int channel) {\n  return (int)(((long)channel * (long)brightnessPercent) / 100L);\n}\n\nvoid applyColour() {\n  ledcWrite(RED_PIN, channelDuty(redValue));\n  ledcWrite(GREEN_PIN, channelDuty(greenValue));\n  ledcWrite(BLUE_PIN, channelDuty(blueValue));"},{"type":"text","heading":"What that excerpt does","body":"channelDuty multiplies one colour, 0–255, by the brightness percent and divides by 100. At 30 percent, red 255 becomes duty 76. ledcWrite sends that duty to the pin. Zero is off. 255 is fully on for that colour."},{"type":"text","body":"This second excerpt is the setup that attaches those pins. Do not upload it on its own."},{"type":"code","language":"cpp","filename":"excerpt-pwm-setup.ino","code":"if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {\n    Serial.println(\"PWM setup failed.\");\n  }\n  applyColour();"},{"type":"text","heading":"What ledcAttach does","body":"ledcAttach(pin, 5000, 8) gives that pin a PWM signal at 5000 Hz with 8 bits of duty, so the duty runs from 0 to 255. The same call is made for all three pins. applyColour then writes the power-on colour, which is red at 30 percent."}]$p24s13blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 13;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $p24s14stage$Firmware$p24s14stage$,
  title = $p24s14title$Watch the write 255,80,0 travel through the sketch$p24s14title$,
  description = $p24s14desc$A characteristic is one value the phone can read or write.$p24s14desc$,
  tip = null,
  blocks = $p24s14blocks$[{"type":"text","heading":"The path of one colour","body":"The phone sends the text 255,80,0 to the colour characteristic. The ESP32 callback copies that text, checks it, stores red 255, green 80, and blue 0, then calls applyColour. The three PWM duties change, and the LED moves toward orange. A service is the group that holds the colour characteristic and the brightness characteristic. The board advertises that service under the name Solderi RGB so the phone can find it."},{"type":"text","body":"Both blocks below are excerpts. The complete sketch is in the next step."},{"type":"code","language":"cpp","filename":"excerpt-advertise.ino","code":"BLEDevice::init(DEVICE_NAME);\n  BLEServer *server = BLEDevice::createServer();\n  server->setCallbacks(new ServerCallbacks());\n  BLEService *service = server->createService(SERVICE_UUID);\n\n  BLECharacteristic *colorCharacteristic = service->createCharacteristic(\n    COLOR_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  colorCharacteristic->setCallbacks(new ColorCallbacks());\n  colorCharacteristic->setValue(colourText());\n\n  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(\n    BRIGHTNESS_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());\n  brightnessCharacteristic->setValue(brightnessText());\n\n  service->start();\n\n  BLEAdvertising *advertising = BLEDevice::getAdvertising();\n  advertising->addServiceUUID(SERVICE_UUID);\n  advertising->setScanResponse(true);\n  BLEDevice::startAdvertising();\n  Serial.println(\"Advertising as Solderi RGB.\");"},{"type":"code","language":"cpp","filename":"excerpt-colour-write.ino","code":"class ColorCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);\n    if (!accepted) {\n      characteristic->setValue(colourText());\n      Serial.print(\"Colour rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(colourText());\n    Serial.print(\"Colour \");\n    Serial.println(colourText());"},{"type":"text","heading":"Rejected writes and a disconnect","body":"A colour must be three numbers from 0 to 255, separated by commas, with no spaces. Brightness must be a whole number from 0 to 100. Anything else, including a raw three-byte colour, is rejected. The callback writes the last accepted text back into the characteristic, because the ESP32 stack stores the incoming bytes before the callback runs. When the phone disconnects, the sketch prints a line and starts advertising again. The last colour stays on the LED."},{"type":"code","language":"cpp","filename":"excerpt-disconnect.ino","code":"void onDisconnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = false;\n    Serial.println(\"Phone disconnected. Advertising again.\");\n    BLEDevice::startAdvertising();"}]$p24s14blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 14;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $p24s15stage$Firmware$p24s15stage$,
  title = $p24s15title$Upload the complete sketch$p24s15title$,
  description = $p24s15desc$This is the program to copy. The earlier blocks were excerpts.$p24s15desc$,
  tip = null,
  blocks = $p24s15blocks$[{"type":"text","body":"Create a sketch, replace its contents with the program below, and click Upload. When it finishes, the Serial Monitor should show the power-on line and then Advertising as Solderi RGB."},{"type":"code","language":"cpp","filename":"esp32-ble-rgb-controller.ino","libraries":["BLE (ESP32 Arduino core)","LEDC (ESP32 Arduino core)"],"code":"/*\n * ESP32 Bluetooth RGB LED Controller\n * Board: ESP32 Dev Module\n * LED: Kingbright WP154A4SEJ3VBDZGW/CA, common-anode\n * Pin 1 red cathode, pin 2 common anode, pin 3 blue cathode, pin 4 green cathode\n * DevKit 5V pin -> pin 2\n * IO25 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 1 red cathode\n * IO26 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 4 green cathode\n * IO27 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 3 blue cathode\n * Emitters and DevKit GND share the ground rail\n * A higher PWM duty turns the transistor on for longer\n * Phone app: nRF Connect for Mobile\n * One write format: UTF-8 text\n * Colour: 255,80,0\n * Brightness: 0, 48, or 100\n * Arduino-ESP32 3.x: ledcAttach, BLECharacteristic::PROPERTY_WRITE\n */\n\n#include <BLEDevice.h>\n#include <BLEServer.h>\n#include <BLEUtils.h>\n\nconst int RED_PIN = 25;\nconst int GREEN_PIN = 26;\nconst int BLUE_PIN = 27;\nconst int PWM_FREQUENCY_HZ = 5000;\nconst int PWM_RESOLUTION_BITS = 8;\nconst size_t MAX_TEXT_BYTES = 16;\n\nconst char *DEVICE_NAME = \"Solderi RGB\";\nconst char *SERVICE_UUID = \"8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24\";\nconst char *COLOR_UUID = \"8c4a2e11-1b6d-4f3a-9e72-5d0c8a1b6e24\";\nconst char *BRIGHTNESS_UUID = \"8c4a2e12-1b6d-4f3a-9e72-5d0c8a1b6e24\";\n\nint redValue = 255;\nint greenValue = 0;\nint blueValue = 0;\nint brightnessPercent = 30;\n\nbool clientConnected = false;\n\nint channelDuty(int channel) {\n  return (int)(((long)channel * (long)brightnessPercent) / 100L);\n}\n\nvoid applyColour() {\n  ledcWrite(RED_PIN, channelDuty(redValue));\n  ledcWrite(GREEN_PIN, channelDuty(greenValue));\n  ledcWrite(BLUE_PIN, channelDuty(blueValue));\n}\n\nbool digitsOnly(const String &text) {\n  if (text.length() == 0) {\n    return false;\n  }\n  for (int i = 0; i < text.length(); i++) {\n    char letter = text.charAt(i);\n    if (letter < '0' || letter > '9') {\n      return false;\n    }\n  }\n  return true;\n}\n\nbool copyTextPayload(const uint8_t *data, size_t length, String &text) {\n  text = \"\";\n  if (data == nullptr || length == 0 || length > MAX_TEXT_BYTES) {\n    return false;\n  }\n  for (size_t i = 0; i < length; i++) {\n    char letter = (char)data[i];\n    bool allowed = (letter >= '0' && letter <= '9') || letter == ',' || letter == ' ';\n    if (!allowed) {\n      return false;\n    }\n    text += letter;\n  }\n  text.trim();\n  return text.length() > 0;\n}\n\nbool parseColourText(const String &text) {\n  if (text.indexOf(',') < 0) {\n    return false;\n  }\n  int first = text.indexOf(',');\n  int second = text.indexOf(',', first + 1);\n  if (first <= 0 || second <= first + 1 || text.indexOf(',', second + 1) >= 0) {\n    return false;\n  }\n\n  String redText = text.substring(0, first);\n  String greenText = text.substring(first + 1, second);\n  String blueText = text.substring(second + 1);\n  redText.trim();\n  greenText.trim();\n  blueText.trim();\n  if (!digitsOnly(redText) || !digitsOnly(greenText) || !digitsOnly(blueText)) {\n    return false;\n  }\n\n  long red = redText.toInt();\n  long green = greenText.toInt();\n  long blue = blueText.toInt();\n  if (red > 255 || green > 255 || blue > 255) {\n    return false;\n  }\n\n  redValue = (int)red;\n  greenValue = (int)green;\n  blueValue = (int)blue;\n  return true;\n}\n\nbool parseBrightnessText(const String &text) {\n  if (text.indexOf(',') >= 0 || !digitsOnly(text)) {\n    return false;\n  }\n  long value = text.toInt();\n  if (value > 100) {\n    return false;\n  }\n  brightnessPercent = (int)value;\n  return true;\n}\n\nString colourText() {\n  return String(redValue) + \",\" + String(greenValue) + \",\" + String(blueValue);\n}\n\nString brightnessText() {\n  return String(brightnessPercent);\n}\n\nclass ServerCallbacks : public BLEServerCallbacks {\n  void onConnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = true;\n    Serial.println(\"Phone connected.\");\n  }\n\n  void onDisconnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = false;\n    Serial.println(\"Phone disconnected. Advertising again.\");\n    BLEDevice::startAdvertising();\n  }\n};\n\nclass ColorCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);\n    if (!accepted) {\n      characteristic->setValue(colourText());\n      Serial.print(\"Colour rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(colourText());\n    Serial.print(\"Colour \");\n    Serial.println(colourText());\n  }\n};\n\nclass BrightnessCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseBrightnessText(text);\n    if (!accepted) {\n      characteristic->setValue(brightnessText());\n      Serial.print(\"Brightness rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(brightnessText());\n    Serial.print(\"Brightness \");\n    Serial.println(brightnessPercent);\n  }\n};\n\nvoid setup() {\n  Serial.begin(115200);\n  delay(300);\n\n  if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {\n    Serial.println(\"PWM setup failed.\");\n  }\n  applyColour();\n\n  Serial.println(\"ESP32 Bluetooth RGB LED controller\");\n  Serial.println(\"Power-on colour is red at 30 percent brightness.\");\n\n  BLEDevice::init(DEVICE_NAME);\n  BLEServer *server = BLEDevice::createServer();\n  server->setCallbacks(new ServerCallbacks());\n  BLEService *service = server->createService(SERVICE_UUID);\n\n  BLECharacteristic *colorCharacteristic = service->createCharacteristic(\n    COLOR_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  colorCharacteristic->setCallbacks(new ColorCallbacks());\n  colorCharacteristic->setValue(colourText());\n\n  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(\n    BRIGHTNESS_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());\n  brightnessCharacteristic->setValue(brightnessText());\n\n  service->start();\n\n  BLEAdvertising *advertising = BLEDevice::getAdvertising();\n  advertising->addServiceUUID(SERVICE_UUID);\n  advertising->setScanResponse(true);\n  BLEDevice::startAdvertising();\n  Serial.println(\"Advertising as Solderi RGB.\");\n}\n\nvoid loop() {\n  delay(200);\n}\n"},{"type":"expected","heading":"After a successful upload","body":"The LED is red at a low brightness. The monitor shows Advertising as Solderi RGB. If upload fails, hold the BOOT button when the IDE says Connecting, then release it."}]$p24s15blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 15;

update public.project_steps as step
set
  stage_sort_order = 5,
  stage_title = $p24s16stage$Phone control$p24s16stage$,
  title = $p24s16title$Find Solderi RGB in nRF Connect$p24s16title$,
  description = $p24s16desc$Use the Bluetooth Low Energy scanner, not a classic Bluetooth device list.$p24s16desc$,
  tip = null,
  blocks = $p24s16blocks$[{"type":"text","body":"Install nRF Connect for Mobile. Turn on the phone’s Bluetooth. Open the app and tap the scanner. Look for the name Solderi RGB and tap Connect. A speaker pairing screen is the wrong place. This board does not appear there, because it is a BLE peripheral."},{"type":"text","heading":"The service, once","body":"After it connects, open the service whose UUID starts with 8c4a2e10. Inside it, the colour characteristic starts with 8c4a2e11 and the brightness characteristic starts with 8c4a2e12. You can match those prefixes. You do not need to retype the full UUID for each write."},{"type":"expected","heading":"When the connection works","body":"nRF Connect shows the service, and the Serial Monitor prints Phone connected. The full service UUID is 8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24."}]$p24s16blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 16;

update public.project_steps as step
set
  stage_sort_order = 5,
  stage_title = $p24s17stage$Phone control$p24s17stage$,
  title = $p24s17title$Write a colour as text$p24s17title$,
  description = $p24s17desc$The write format is UTF-8 text, three numbers separated by commas.$p24s17desc$,
  tip = null,
  blocks = $p24s17blocks$[{"type":"text","body":"On the colour characteristic, choose the write action and set the format to text, or UTF-8. Send 255,80,0. The LED should move from dim red toward orange: full red, some green, no blue. Then send 0,0,255 for blue and 0,255,0 for green. Read the characteristic afterward. It should show the text you sent."},{"type":"text","heading":"If the app asks for hex","body":"Some iOS write fields want the UTF-8 bytes in hexadecimal. 255,80,0 is 32 35 35 2C 38 30 2C 30. 0,0,255 is 30 2C 30 2C 32 35 35. 0,255,0 is 30 2C 32 35 35 2C 30. The characters are still the same text."},{"type":"warning","body":"Do not send the three raw bytes FF 50 00. The sketch rejects that. Send the digits and the commas."}]$p24s17blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 17;

update public.project_steps as step
set
  stage_sort_order = 5,
  stage_title = $p24s18stage$Phone control$p24s18stage$,
  title = $p24s18title$Change brightness, then disconnect and come back$p24s18title$,
  description = $p24s18desc$Brightness is a second text value, from 0 to 100.$p24s18desc$,
  tip = null,
  blocks = $p24s18blocks$[{"type":"text","body":"On the brightness characteristic, write the text 100. The current colour should become brighter. Write 10 and it should become dim. Write 0 and it should go dark. Read the characteristic to confirm the stored number. Then disconnect in nRF Connect. The monitor should print that the phone disconnected and that the board is advertising again. The last colour remains. Connect once more and write 255,0,0 to return to red."},{"type":"text","body":"A brightness of 100 in hex text is 31 30 30. A rejected write, such as 150 or the word high, should leave the LED unchanged, and the monitor should print that the value was rejected."},{"type":"tip","body":"Compare the LED with the Serial Monitor line for the same write. The monitor is the sketch telling you which text it accepted."}]$p24s18blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 18;

update public.project_steps as step
set
  stage_sort_order = 6,
  stage_title = $p24s19stage$Troubleshooting$p24s19stage$,
  title = $p24s19title$Fix the light before you blame the phone$p24s19title$,
  description = $p24s19desc$Match the symptom, then work down the checks.$p24s19desc$,
  tip = null,
  blocks = $p24s19blocks$[{"type":"troubleshooting","heading":"The LED itself","items":[{"problem":"The LED stays dark after upload.","solution":"The usual causes are USB not powering the board, the anode off the + rail, or an emitter off the − rail. Confirm the monitor prints the advertising line. The anode jumper is j7 on the right + rail, and the two + rails are bridged on row 1. Emitters are a1 and a10 on the left − rail and j13 on the right − rail, with the − rails bridged on row 1. Those rows are above the rail break. You should see a dim red light. If the monitor is alive and the LED is still dark, the LED is reversed: pin 2, the anode, is the lead in f7."},{"problem":"Only red lights. Green and blue stay off.","solution":"Either those links are in the wrong holes, or the USB port is too weak for a high forward voltage. Send 0,255,0 and 0,0,255 and read the monitor. If the monitor accepts the colour, confirm the green wire is in b15 and j9, and the blue wire is in j12 and j8. j9 shares the row with LED pin 4 in f9. j8 shares the row with LED pin 3 in f8. Try a different USB port near 5 V. A port that is already sagging can leave a 4.0 V blue chip or a 4.1 V green chip dark."},{"problem":"One colour is stuck on, or two colours light together.","solution":"Two leads are probably in the same row. Check that each transistor uses three separate rows and that the 1 kΩ lead is not in the collector row. Pull that channel’s parts and seat them again. The stuck colour should follow only its own GPIO pin."},{"problem":"The LED is very hot or a resistor smells.","solution":"Unplug USB. A 220 Ω resistor is missing or a cathode is wired straight to ground. Seat the 220 Ω resistor again before you reconnect power. The part should stay cool at the currents in the resistor step."}]}]$p24s19blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 19;

update public.project_steps as step
set
  stage_sort_order = 6,
  stage_title = $p24s20stage$Troubleshooting$p24s20stage$,
  title = $p24s20title$Fix the phone connection$p24s20title$,
  description = $p24s20desc$The board has to be advertising before the phone can write.$p24s20desc$,
  tip = null,
  blocks = $p24s20blocks$[{"type":"troubleshooting","heading":"nRF Connect","items":[{"problem":"Solderi RGB never appears in the scanner.","solution":"The sketch is not running, or the phone is looking at classic Bluetooth devices. Re-upload, set the monitor to 115200, and wait for Advertising as Solderi RGB. In nRF Connect use the BLE scanner and pull to refresh. The name should appear within a few seconds."},{"problem":"The app connects, then the write does nothing.","solution":"The write is on the wrong characteristic, or it is not UTF-8 text. Open the colour characteristic that starts with 8c4a2e11 and send 255,80,0 as text. The monitor should print Colour 255,80,0 and the LED should change. If it prints Colour rejected, the text has a space, a missing comma, or a number outside 0–255."},{"problem":"Upload never finishes.","solution":"The port is wrong or the board never entered the bootloader. Select the port that appears when you plug the board in, lower the upload speed if 115200 fails, and hold BOOT when the IDE says Connecting. A finished upload returns the IDE to a done message and the monitor prints the advertising line."},{"problem":"It worked once, and the phone cannot reconnect.","solution":"Disconnect in nRF Connect, wait for the monitor line that says the board is advertising again, then scan and connect. If that line never appears, press the DevKit reset button and wait for the advertising line before you scan."}]}]$p24s20blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 20;

update public.project_steps as step
set
  stage_sort_order = 7,
  stage_title = $p24s21stage$Final check$p24s21stage$,
  title = $p24s21title$Walk the finished controller$p24s21title$,
  description = $p24s21desc$Do these in order and compare the LED with each line.$p24s21desc$,
  tip = null,
  blocks = $p24s21blocks$[{"type":"text","body":"The sketch is written to do every line below. Use the troubleshooting steps for any line that does not match. A USB port well under 5 V can still leave green or blue dim or dark after the wiring is correct."},{"type":"expected","heading":"Checklist","body":"The LED flat faces the top and the longest lead is in f7. Each transistor flat faces right, with the emitter in the top lead of that transistor. The + rails feed only the anode row. The − rails meet only the three emitter jumpers. No two leads share one hole. Upload finishes and the monitor prints Advertising as Solderi RGB. nRF Connect connects to that name. 255,0,0 is red, 0,255,0 is green, and 0,0,255 is blue. Brightness 100 is brighter than 10, and 0 is dark. The text 150 is rejected and the LED stays put. Disconnecting prints the advertising line, and a new connection can write 255,80,0."}]$p24s21blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 21;

