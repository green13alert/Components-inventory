-- Physical hole layouts for slugs 8, 18, 23, and 24.
-- Updates steps in place. Leaves published projects published. Keeps 23 and 24 unpublished.

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Understand the Project$physlay$,
  title = $physlay$What We're Building$physlay$,
  description = $physlay$A PIR sensor watches for movement. When it sees motion, the Arduino turns on an LED and an active buzzer together.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we're building","body":"This project is a USB-powered motion alarm. The PIR module is the input. The LED and buzzer are the outputs. There is no extra battery pack or arming switch — the board is armed once the sketch finishes its warm-up."},{"type":"image","imageKey":"motionSensor","caption":"Finished motion alarm reference. Keep this pin map: PIR on D2, LED on D8, buzzer on D9."},{"type":"text","heading":"Why this order","body":"We will understand the sensor first, then wire one subsystem at a time, then grow the sketch in the same order. That way a wiring fault and a code fault are not mixed together."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 0;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Understand the Project$physlay$,
  title = $physlay$How the Motion Sensor Works$physlay$,
  description = $physlay$A PIR module detects moving infrared sources, not “anything that exists.” Its OUT pin goes HIGH for a burst after it sees motion.$physlay$,
  tip = $physlay$Aim the PIR away from HVAC vents. Fast air-temperature changes can look like motion.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"How PIR sensing works","body":"PIR means passive infrared. The sensor does not emit a beam. It watches for a change in infrared energy in its field of view — typically a person walking past. When that change is large enough, OUT goes HIGH. When the scene is still, OUT sits LOW."},{"type":"text","heading":"Warm-up","body":"After power-up the module needs about 30 seconds to settle. During that time OUT can chatter. The sketch will wait out this period and print a message so you do not walk in front of it while it is still calibrating."},{"type":"warning","body":"Do not treat a HIGH on OUT as “someone is still in the room.” It is a motion event, then it returns LOW. The alarm lasts as long as we hold the outputs in code, not as long as a person remains visible."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 1;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Understand the Project$physlay$,
  title = $physlay$Understand the Components$physlay$,
  description = $physlay$Every part in this walkthrough is on the project BOM. Know what each one is for before you plug anything in.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What each part does","body":"The Uno is the controller. The PIR is the input. The LED is a silent visual alarm. The 220 Ω resistor limits LED current so D8 is not shorted to ground through the diode. The catalogue buzzer is an active buzzer: a HIGH on its signal pin makes it sound. The breadboard and jumpers are the wiring."},{"type":"components","items":[{"id":"arduino-uno-r3","name":"Arduino Uno R3","illustrationId":"arduino-uno","owned":false,"quantity":1},{"id":"pir-sensor","name":"PIR motion sensor","illustrationId":"pir-sensor","owned":false,"quantity":1},{"id":"buzzer","name":"Buzzer","illustrationId":"generic-module","owned":false,"quantity":1},{"id":"led","name":"LED","illustrationId":"led","owned":false,"quantity":1},{"id":"resistor-220","name":"220 Ω resistor","illustrationId":"resistor","owned":false,"quantity":1},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1}]},{"type":"expected","heading":"Check","body":"You can point to each BOM item on the desk and name its role: input, output, current limit, or interconnect. Do not substitute a passive piezo for the active buzzer unless you are ready to use tone() later — this sketch uses digitalWrite only."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 2;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Build the Circuit$physlay$,
  title = $physlay$Set Up the Arduino$physlay$,
  description = $physlay$Seat the Uno so 5V, GND, D2, D8, and D9 can reach the breadboard. Power comes from USB for this project.$physlay$,
  tip = $physlay$Use a data-capable USB cable. Charge-only cables never appear as a serial port later.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Find the breadboard power rails","body":"Along each long edge of the breadboard there is a + rail (often marked red) and a − rail (often marked blue or black). Every hole in one + rail is electrically connected to the others in that same + rail. The same is true for one − rail. + is not connected to −."},{"type":"text","heading":"What to set up","body":"Place the Uno beside the breadboard. Use male-to-male jumpers: Uno 5V into the left + rail at row 1, and Uno GND into the left − rail at row 1. Stay on rows 1–15, above a break in the coloured rail. This build uses 10 male-to-male jumpers from the pack. Leave D2, D8, and D9 empty for now."},{"type":"text","heading":"Why the rails matter","body":"Several parts need 5V and GND. Sharing rails keeps those nets common. If grounds are split, the PIR HIGH will not be a reliable HIGH relative to the Uno."},{"type":"test","body":"Plug in USB. Confirm the Uno power LED is on. Check that D2, D8, and D9 still have no wires in them."},{"type":"expected","heading":"Expected result","body":"The board is powered, the + rail is 5V, the − rail is GND, and no sensor or output is connected yet. Nothing should get hot."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 3;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Build the Circuit$physlay$,
  title = $physlay$Connect the PIR Motion Sensor$physlay$,
  description = $physlay$Most PIR modules have VCC, OUT, and GND. OUT is a digital signal the Arduino reads with digitalRead() on D2.$physlay$,
  tip = $physlay$If your module has a 3.3 V / 5 V jumper, set it to 5 V for the Uno.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What you are wiring","body":"Plug the PIR pins into c3, c4, and c5: VCC, OUT, then GND. A male-to-male jumper joins a3 to the left + rail at row 3. Another joins a5 to the left − rail at row 5. D2 goes to a4. OUT is the motion flag — that is PIR_PIN in the sketch."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"pir","name":"PIR","illustrationId":"pir-sensor"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"}]},{"type":"connections","summary":"PIR on D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Three wires only: 5V, GND, and D2. Do not connect the PIR LED jumper to an Arduino pin — that LED is on the module."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 4;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Build the Circuit$physlay$,
  title = $physlay$Connect the LED$physlay$,
  description = $physlay$The LED is the silent alarm. It needs the 220 Ω resistor in series on D8 so the pin is not shorted to ground.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Polarity and current limit","body":"The longer LED lead is the anode. Seat it in d12 and the shorter lead, by the flat, in d13. The 220 Ω resistor goes in e8 and e12, along column e so it does not cover the buzzer pins. D8 goes to a8. a13 goes to the left − rail at row 13. Use this one resistor only."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"resistor","name":"220 Ω resistor","illustrationId":"resistor"},{"id":"led","name":"LED","illustrationId":"led"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"}]},{"type":"connections","summary":"LED on D8 through the 220 Ω resistor","rows":[{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"}]},{"type":"warning","body":"Do not wire the LED from D8 straight to GND. Without the 220 Ω resistor the pin can source more current than it should."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 5;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Build the Circuit$physlay$,
  title = $physlay$Connect the Buzzer$physlay$,
  description = $physlay$The catalogue buzzer is active: HIGH on the signal pin makes it sound. You do not need tone() for this part.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Active vs two-pin buzzers","body":"Plug the three-pin module into c9, c10, and c11: VCC, I/O, then GND. a9 goes to the left + rail at row 9, D9 goes to a10, and a11 goes to the left − rail at row 11. If your buzzer has only two leads, put the + lead in the D9 row and the other lead in the GND row, and skip the extra 5V wire."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"buzzer","name":"Buzzer","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"connections","summary":"Buzzer on D9","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"warning","body":"A passive piezo will stay quiet with digitalWrite HIGH. This walkthrough assumes an active buzzer. Confirm the part matches the BOM before debugging code."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 6;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Build the Circuit$physlay$,
  title = $physlay$Check the Complete Circuit$physlay$,
  description = $physlay$Before any sketch, the pin map should be complete and unique: D2 input, D8 LED, D9 buzzer, shared 5V and GND.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What “complete” means","body":"Every net below should exist once. If two wires share a pin they should be the same net (for example several grounds), not two different signals on one GPIO."},{"type":"wiring","heading":"Complete wiring diagram","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"pir","name":"PIR","illustrationId":"pir-sensor"},{"id":"resistor","name":"220 Ω resistor","illustrationId":"resistor"},{"id":"led","name":"LED","illustrationId":"led"},{"id":"buzzer","name":"Buzzer","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"connections","heading":"Exact connections","summary":"PIR D2 · LED D8 · buzzer D9","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]},{"type":"expected","heading":"Check","body":"You can trace Arduino 5V to PIR VCC and buzzer VCC, Arduino GND to PIR, LED cathode, and buzzer GND, D2 to PIR OUT, D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 7;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Create the Arduino Program$physlay$,
  description = $physlay$Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"PIR_PIN, LED_PIN, and BUZZER_PIN match the wiring: D2, D8, D9. Serial is opened at 9600 baud so later tests can print without changing the port settings."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Named constants keep the pin map in one place. If you moved the LED to another pin, you would change LED_PIN only. setup() and loop() are empty on purpose — there is nothing to drive until the next steps configure those pins."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 8;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Read the Motion Sensor$physlay$,
  description = $physlay$Configure D2 as an input, wait through PIR warm-up, then print the raw digitalRead() value.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"pinMode(PIR_PIN, INPUT) makes D2 a digital input. digitalRead() returns HIGH or LOW. The 30-second delay runs once in setup() so loop() only sees a settled sensor."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n  Serial.println(motion);\n  delay(200);\n}"},{"type":"code_explanation","body":"We still do not touch the LED or buzzer. If Serial prints 1 when you walk past and 0 when you stay still, the PIR wiring and D2 are correct before any output code can hide a mistake."},{"type":"test","body":"Upload this sketch, open Serial Monitor at 9600 baud, wait for “Ready.”, then walk past the PIR and stand still."},{"type":"expected","heading":"Expected result","body":"After warm-up, Serial should print 0 while the room is still and 1 (HIGH) in bursts when you walk in front of the sensor."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 9;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Detect Motion$physlay$,
  description = $physlay$Turn the raw HIGH/LOW reading into a named condition you will reuse for the LED and buzzer.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"An if (motion == HIGH) branch is the alarm condition. else is the idle condition. Words in Serial are easier to confirm than 1 and 0 when you test later."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    Serial.println(\"Motion detected\");\n  } else {\n    Serial.println(\"No motion\");\n  }\n\n  delay(200);\n}"},{"type":"code_explanation","body":"HIGH means the PIR latched a motion event. This is the same boolean we will use to drive outputs. We still leave the LED and buzzer off so you can trust the condition on Serial alone."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 10;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Control the LED$physlay$,
  description = $physlay$When the motion condition is true, D8 goes HIGH. When it is false, D8 goes LOW.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"LED_PIN becomes an output. digitalWrite inside each branch follows the same if/else you already tested on Serial. setup() forces the LED LOW so it cannot sit unknown during warm-up."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n    Serial.println(\"Motion detected\");\n  } else {\n    digitalWrite(LED_PIN, LOW);\n    Serial.println(\"No motion\");\n  }\n\n  delay(200);\n}"},{"type":"code_explanation","body":"The LED is a silent check of the alarm path. If Serial says “Motion detected” and the LED stays dark, the fault is D8 wiring or polarity — not the PIR."},{"type":"test","body":"Upload, wait for “Ready.”, then walk past the PIR while watching the LED. Keep the buzzer unwired in your head: it is not driven yet."},{"type":"expected","heading":"Expected result","body":"The LED turns on with “Motion detected” and turns off with “No motion.” If it never lights, check anode → 220 Ω resistor → D8 and cathode → GND."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 11;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Control the Buzzer$physlay$,
  description = $physlay$Drive the active buzzer with the same motion condition as the LED. digitalWrite HIGH is enough — no tone().$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"BUZZER_PIN is configured as OUTPUT and follows the LED in both branches. An active buzzer has its own oscillator; a DC HIGH on the signal pin is the on switch."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  digitalWrite(BUZZER_PIN, LOW);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Ready.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n    digitalWrite(BUZZER_PIN, HIGH);\n    Serial.println(\"Motion detected\");\n  } else {\n    digitalWrite(LED_PIN, LOW);\n    digitalWrite(BUZZER_PIN, LOW);\n    Serial.println(\"No motion\");\n  }\n\n  delay(200);\n}"},{"type":"code_explanation","body":"LED and buzzer now share one condition. If the LED works and the buzzer does not, the sketch logic is fine — check D9, GND, and whether the part is actually an active buzzer."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 12;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Combine the System$physlay$,
  description = $physlay$Hold the alarm for 800 ms on each trigger so a short PIR pulse is still obvious, then return to idle.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"The PIR pulse can be brief. delay(800) inside the HIGH branch keeps the LED and buzzer on long enough to notice. Serial prints “Alarm armed.” after warm-up so you know testing can start. delay(50) at the end of loop() is a small idle pause, not a second alarm hold."},{"type":"code","language":"Arduino","filename":"motion_alarm.ino","libraries":[],"code":"const int PIR_PIN = 2;\nconst int LED_PIN = 8;\nconst int BUZZER_PIN = 9;\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  digitalWrite(BUZZER_PIN, LOW);\n  Serial.begin(9600);\n  Serial.println(\"PIR warming up. Stay still for 30 seconds.\");\n  delay(30000);\n  Serial.println(\"Alarm armed.\");\n}\n\nvoid loop() {\n  int motion = digitalRead(PIR_PIN);\n\n  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n    digitalWrite(BUZZER_PIN, HIGH);\n    Serial.println(\"Motion detected\");\n    delay(800);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n    digitalWrite(BUZZER_PIN, LOW);\n  }\n\n  delay(50);\n}"},{"type":"code_explanation","body":"This is the complete sketch. Pin map: D2 input, D8 LED, D9 buzzer. Behaviour: wait 30 s, then any HIGH on D2 turns both outputs on for 800 ms. View Code on a finished project shows this same program."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 13;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Test the Alarm$physlay$,
  title = $physlay$Upload the Program$physlay$,
  description = $physlay$Board: Arduino Uno. Serial Monitor at 9600 baud. Stay out of the PIR’s view until it prints “Alarm armed.”$physlay$,
  tip = $physlay$If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Before you upload","body":"Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in."},{"type":"text","heading":"How to upload","body":"Paste the combined sketch from the previous step. Click Upload, then open Serial Monitor at 9600 baud. Do not walk in front of the PIR until setup() finishes."},{"type":"test","body":"Upload once. Watch Serial for the warm-up line, then “Alarm armed.”"},{"type":"expected","heading":"Expected result","body":"The IDE reports Done uploading. After about 30 seconds Serial prints “Alarm armed.” The LED and buzzer should still be off if you stayed still."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"No serial port","solution":"Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port."},{"problem":"Upload error / avrdude","solution":"Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 14;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Test the Alarm$physlay$,
  title = $physlay$Test Without Motion$physlay$,
  description = $physlay$A working idle state is as important as a working alarm. Confirm both outputs stay off when the room is still.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"test","body":"After “Alarm armed.”, stay outside the PIR’s view for ten seconds. Watch the LED, listen for the buzzer, and read Serial."},{"type":"expected","heading":"Expected result","body":"LED off, buzzer silent, Serial not printing a stream of “Motion detected.” Occasional PIR glitches right after warm-up can happen; wait a few more seconds and retest."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Alarm already on with nobody in view","solution":"Finish the 30 s warm-up. Aim the PIR away from sun, heaters, and vents. Confirm OUT is on D2 and GND is shared with the Uno."},{"problem":"Serial floods with Motion detected","solution":"The PIR is stuck HIGH. Recheck VCC/GND/OUT. Cover the lens; if it stays HIGH, the module or wiring is wrong, not the if-statement."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 15;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Test the Alarm$physlay$,
  title = $physlay$Test Motion Detection$physlay$,
  description = $physlay$Walk through the PIR field of view and confirm the LED and buzzer fire together.$physlay$,
  tip = $physlay$Stand a couple of metres away and walk across the sensor, not straight at it. PIRs often see crossing motion more clearly.$physlay$,
  blocks = $physlay$[{"type":"test","body":"Walk in front of the PIR sensor. Watch the LED and listen for the buzzer. Then step out of view and wait."},{"type":"expected","heading":"Expected result","body":"The LED turns on and the buzzer sounds for about 800 ms, and Serial prints “Motion detected”. After you leave, both outputs go quiet."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Nothing happens when you walk past","solution":"Confirm PIR VCC/GND/OUT, then confirm PIR_PIN is 2 in the sketch. Open Serial: if it never prints Motion detected, the input never went HIGH."},{"problem":"Serial detects motion but outputs stay off","solution":"The condition is working. Check D8 through the 220 Ω resistor to the LED anode, and D9 to the buzzer signal pin."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 16;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Test the Alarm$physlay$,
  title = $physlay$Troubleshoot the Circuit$physlay$,
  description = $physlay$If any test failed, isolate input versus output before changing working code.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"How to isolate the fault","body":"Serial tells you whether D2 is changing. The LED tells you whether D8 can source current. The buzzer tells you whether D9 and the module are correct. Fix the layer that actually failed."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"LED never lights","solution":"Confirm anode → 220 Ω resistor → D8 and cathode → GND. Swap the LED if you still see nothing — polarity may be reversed."},{"problem":"Buzzer silent","solution":"Active buzzers need DC HIGH on the signal pin. Confirm D9 and GND. A two-pin buzzer goes D9 and GND only. A passive piezo will not sound with this sketch."},{"problem":"PIR always HIGH","solution":"Finish the 30 s warm-up. Check OUT is on D2 and that the module ground is the Uno ground. Recheck any 3.3 V / 5 V jumper."},{"problem":"PIR never HIGH","solution":"Confirm 5V on VCC. Wave closer and across the lens. Some modules have a sensitivity pot — a fully counterclockwise pot can ignore a person at the desk."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 17;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Test the Alarm$physlay$,
  title = $physlay$Final System Test$physlay$,
  description = $physlay$Run idle, then motion, then idle again. The pin map should still match the complete wiring diagram.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"image","imageKey":"motionSensor","caption":"Keep this GPIO map if you mount the PIR on a box later: D2 input, D8 LED, D9 buzzer."},{"type":"test","body":"Stay still until the alarm is quiet. Walk past once and confirm LED plus buzzer. Step away and confirm both outputs stop. Repeat once."},{"type":"expected","heading":"Expected result","body":"Idle is silent. Each crossing of the PIR fires both outputs together for about 800 ms. Serial matches what you see and hear. You have a USB-powered motion alarm with no extra switch or battery."},{"type":"connections","heading":"Pin map you built","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"PIR","toPin":"VCC","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"PIR","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"PIR","toPin":"OUT","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D8","toComponent":"220 Ω resistor","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 Ω resistor","fromPin":"leg 2","toComponent":"LED","toPin":"anode","signal":"signal"},{"fromComponent":"LED","fromPin":"cathode","toComponent":"Arduino Uno","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Buzzer","toPin":"VCC / +","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Buzzer","toPin":"I/O / S","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Buzzer","toPin":"GND","signal":"ground"}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '8')
  and sort_order = 18;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Understand the Project$physlay$,
  title = $physlay$What We're Building$physlay$,
  description = $physlay$A two-servo pan-tilt mount aims a camera plate. A joystick sets the angles. This project aims the payload — it does not capture video.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we're building","body":"You will assemble a pan-tilt bracket around two SG90 servos, power the servos from a breadboard PSU, and drive both axes from an analog joystick. Pan is left/right. Tilt is up/down. Mount a lightweight camera or webcam on the plate if you have one — or leave the plate empty while you learn the mechanism."},{"type":"image","imageKey":"servoCamera","caption":"Finished pan-tilt reference. Pin map: pan servo D9, tilt servo D10, joystick VRx A0, VRy A1, SW D2."},{"type":"text","heading":"Why this order","body":"Mechanics first, then power, then one servo at a time, then the joystick, then mapping and limits. A binding bracket, a missing ground, and a reversed axis are three different faults. Building in this order keeps them from stacking."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 0;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Understand the Project$physlay$,
  title = $physlay$How Pan-Tilt Works$physlay$,
  description = $physlay$Each servo holds an angle. Pan rotates the base. Tilt nods the camera plate. The Arduino sends a pulse-width signal; the servo’s own board does the motor work.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What a hobby servo does","body":"An SG90 is a geared motor plus a position sensor. write(90) means “go to mid-travel and hold.” The number is degrees, roughly 0 to 180. The Arduino pin only sends a control pulse. The servo draws its running current from the red VCC wire, not from that signal pin."},{"type":"text","heading":"Two axes","body":"The lower servo is pan: it yaws the whole upper assembly. The upper servo is tilt: it pitches the camera plate. They must be free to move without the bracket hitting itself. Mechanical stops are tighter than the servo’s 0–180 software range, which is why later code uses 20–160, not 0–180."},{"type":"warning","body":"Do not force a servo by hand while it is powered. If the bracket binds, remove power and ease the horn off rather than driving through the stall."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 1;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Understand the Project$physlay$,
  title = $physlay$Understand the Components$physlay$,
  description = $physlay$Every part in this walkthrough is on the project BOM. Know what each one is for before you assemble or plug anything in.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What each part does","body":"The Uno is the controller. Two SG90s are the joints. The pan-tilt bracket kit is the mechanical frame and camera plate. The analog joystick is the input (VRx, VRy, and a click switch). The breadboard PSU supplies 5V for the servos. The breadboard and jumpers are the wiring. A camera is optional payload — this sketch never talks to a camera module."},{"type":"components","items":[{"id":"arduino-uno-r3","name":"Arduino Uno R3","illustrationId":"arduino-uno","owned":false,"quantity":1},{"id":"sg90","name":"SG90 Micro Servo","illustrationId":"servo-sg90","owned":false,"quantity":2},{"id":"joystick","name":"Analog Joystick Module","illustrationId":"generic-module","owned":false,"quantity":1},{"id":"pan-tilt-bracket","name":"Pan-Tilt Bracket Kit","illustrationId":"electronics-kit","owned":false,"quantity":1},{"id":"breadboard-psu","name":"Breadboard Power Supply","illustrationId":"battery","owned":false,"quantity":1},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1}]},{"type":"expected","heading":"Check","body":"You can point to two separate SG90s, the bracket kit, the joystick, and the PSU. Do not substitute a continuous-rotation “360° servo” — this project needs position servos that hold an angle."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 2;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Understand the Project$physlay$,
  title = $physlay$Understand Power and Pin Architecture$physlay$,
  description = $physlay$Servos and the Uno do not share the Arduino 5V pin. They share ground. The pin map stays fixed for the rest of the build.$physlay$,
  tip = $physlay$A 9V snap battery is too weak for two stalling SG90s. Use the breadboard PSU with a 6–12V DC barrel-jack adapter.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Two 5V domains, one ground","body":"USB powers the Uno. Uno 5V feeds only the joystick / logic + rail. PSU 5V feeds only the servo + rail. Those two + rails must stay electrically separate — do not join them with a rail-link jumper. Tie PSU GND to Uno GND so the D9/D10 pulses are measured against the same 0V. If grounds are split, the servos jitter or ignore the signal. If the two + rails are linked, the PSU can back-feed the Uno 5V pin."},{"type":"connections","heading":"Pin map","summary":"Pan D9 · tilt D10 · joystick A0/A1/D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"warning","body":"Do not feed servo VCC from the Uno 5V header. Two SG90s can stall well above what USB 5V should supply, and the board will reset. Do not jumper PSU 5V onto Uno 5V, and do not fit a breadboard rail-link that joins the two + rails."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 3;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Mechanical Assembly$physlay$,
  title = $physlay$Prepare the Mechanical Parts$physlay$,
  description = $physlay$Lay out the pan-tilt kit: base, U-bracket, camera plate, horns, and screws. Identify pan versus tilt before any servo goes into a hole.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What you should have","body":"A typical SG90 pan-tilt kit has a round or square base (pan), a U-shaped bracket that rides on that base, a camera plate for the tilt servo, several horns, and short screws. Match each piece to the kit diagram if one is included. Keep the two servos aside until the next step — do not tighten horns yet."},{"type":"text","heading":"Orientation","body":"The pan servo will sit in the base, output shaft pointing up. The tilt servo will sit in the U-bracket, output shaft pointing sideways so the camera plate can nod. If your kit labels the parts, follow those labels. If it does not, the piece that bolts to the desk or breadboard area is the pan base."},{"type":"expected","heading":"Check","body":"You can name the base, the U-bracket, and the camera plate. Screws that go into the servo body are short — do not use a long screw that can punch into the gearbox."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 4;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Mechanical Assembly$physlay$,
  title = $physlay$Assemble the Base and Pan Servo$physlay$,
  description = $physlay$Seat the pan servo in the base with the shaft centred. Fit a horn loosely. Do not lock the horn at an extreme angle.$physlay$,
  tip = $physlay$Most kits screw through the servo lug holes into the base. Snug, not stripped.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Mount the pan servo","body":"Slide the pan SG90 into the base pocket so the brass output shaft is centred in the base opening. Route the three-wire lead out through the kit’s cable notch, not pinched under the servo body. Fit the screws through the servo mounting lugs into the base."},{"type":"text","heading":"Horn at mid-travel","body":"Push the single-arm or four-point horn onto the pan shaft so the U-bracket will sit square over the base when the servo is near mid-travel. Leave the horn screw slightly loose for now. You will command 90° in software later and reseat the horn so “90” is actually straight."},{"type":"test","body":"With power still off, rotate the horn gently. You should feel a little gearbox resistance, not a hard plastic clash against the base."},{"type":"expected","heading":"Expected result","body":"The pan servo is captive in the base, the lead is free, and the horn is on the shaft but not locked at a hard stop."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 5;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Mechanical Assembly$physlay$,
  title = $physlay$Mount the Tilt Servo and Camera Plate$physlay$,
  description = $physlay$Fit the U-bracket to the pan horn, seat the tilt servo, and attach the camera plate. Keep both joints able to move.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"U-bracket on pan","body":"Bolt the U-bracket to the pan horn so the open side of the U faces the direction your camera plate will nod. The tilt servo sits in one arm of the U, shaft toward the plate."},{"type":"text","heading":"Tilt servo and plate","body":"Seat the second SG90 in the U-bracket. Route its lead so it cannot wrap around the pan joint. Attach the camera plate to the tilt horn at a visual mid-angle — plate roughly level, not folded into the U. Screw the plate on, but leave the horn-to-shaft screw slightly loose until calibration."},{"type":"warning","body":"Fingers and cables can pinch between the U-bracket and the base when pan moves. Keep the two servo leads long enough to follow the motion, and tape a service loop so they do not taut-pull a header later."},{"type":"expected","heading":"Check","body":"You have a base that can yaw and a plate that can nod. Neither joint is already sitting on a mechanical stop."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 6;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Mechanical Assembly$physlay$,
  title = $physlay$Check Mechanical Movement$physlay$,
  description = $physlay$With power still off, confirm pan and tilt can move through a useful range without scraping or pulling wires.$physlay$,
  tip = $physlay$If a joint is stiff, loosen the horn one click rather than forcing it.$physlay$,
  blocks = $physlay$[{"type":"test","body":"Hold the base still. Ease the camera plate through tilt. Then ease the whole U-bracket through pan. Watch the two servo leads: they should follow, not stretch."},{"type":"expected","heading":"Expected result","body":"Each axis moves past centre in both directions without plastic grinding and without a lead catching on a screw. Stops should feel like bracket-on-bracket, not a servo grinding its gear teeth."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"The plate hits the U-bracket immediately","solution":"Pull the tilt horn off and rotate it one spline so the plate sits level at mid-travel. Do not move the servo body."},{"problem":"Pan scrapes the desk or the base","solution":"The pan horn is clocked too far. Lift it off the shaft and reseat it so the U-bracket is square at centre."},{"problem":"A screw will not seat","solution":"Use the short servo-lug screws. A long screw can enter the gearbox and lock the output shaft."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 7;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Electronics$physlay$,
  title = $physlay$Set Up Arduino, Breadboard, and Power$physlay$,
  description = $physlay$USB powers the Uno. The breadboard PSU will power the servos. Build the two 5V rails and the shared ground before any servo signal wire goes in.$physlay$,
  tip = $physlay$Use a data-capable USB cable. Charge-only cables never appear as a serial port later.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Find the breadboard power rails","body":"Along each long edge there is a + rail (often red) and a − rail (often blue or black). Holes in one + rail are connected to each other. + is not connected to −. Use one side as the logic + rail (Uno 5V only) and the other side as the servo + rail (PSU 5V only). Those two + rails must stay electrically separate. Some breadboards include metal clips or jumpers that join opposite + rails — remove or skip those. Tie both − rails together so ground is common."},{"type":"text","heading":"Seat the PSU and jumpers","body":"The left + rail is Uno 5V. The right + rail is PSU 5V. Do not bridge those two + rails. Bridge the − rails with one male-to-male wire from left − row 1 to right − row 1. Uno 5V goes to left + row 2. Uno GND goes to left − row 2. PSU 5V goes to right + row 3. PSU GND goes to right − row 3. All of these stay on rows 1–15. This build uses 16 male-to-male jumpers from the pack. Leave D9, D10, A0, A1, and D2 empty."},{"type":"wiring","heading":"Power only","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Breadboard PSU","illustrationId":"battery"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"}]},{"type":"connections","summary":"Logic 5V from Uno · servo 5V from PSU · common GND","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"}]},{"type":"warning","body":"Plug the PSU barrel jack into a 6–12V DC adapter. Do not connect servo VCC yet. Do not jumper PSU 5V to Uno 5V, and check that no rail-link joins the two + rails. Grounds stay common."},{"type":"test","body":"Connect USB to the Uno. Confirm the Uno power LED is on. Then apply PSU input and confirm the PSU 5V indicator (if it has one) is on. Check that the two + rails are not linked. Nothing else should be wired."},{"type":"expected","heading":"Expected result","body":"Uno powered from USB, logic + rail is Uno 5V only, servo-side + rail is PSU 5V only, the two + rails are not joined, and − rails are common with Uno GND. D9, D10, A0, A1, and D2 are still empty. Nothing is hot."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 8;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Electronics$physlay$,
  title = $physlay$Connect the Pan Servo$physlay$,
  description = $physlay$Pan is the lower SG90. Red goes to the PSU 5V rail, brown to common ground, orange to D9.$physlay$,
  tip = $physlay$If the lead has yellow instead of orange, that is still the signal wire.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What you are wiring","body":"The pan servo connector is female, so use male-to-male wires. Red goes from the right + rail at row 5 into the servo’s red pin. Brown goes from the right − rail at row 6 into the brown pin. Orange goes from Uno D9 straight into the signal pin. That orange wire does not enter a breadboard hole. Red must not touch the left + rail."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Breadboard PSU","illustrationId":"battery"},{"id":"pan","name":"Pan servo","illustrationId":"servo-sg90"}],"connections":[{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"connections","summary":"Pan servo on D9","rows":[{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Three pan wires only: PSU 5V, common GND, D9. The tilt servo is still unplugged. Do not swap red and orange — that puts 5V on a GPIO."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 9;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Electronics$physlay$,
  title = $physlay$Connect the Tilt Servo$physlay$,
  description = $physlay$Tilt is the upper SG90. Same colour code as pan, but the signal wire goes to D10.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What you are wiring","body":"The tilt connector is female too. Red goes from the right + rail at row 8. Brown goes from the right − rail at row 9. Orange goes from Uno D10 straight to the signal pin. Both servos share the right-hand 5V rail and the common − rail. Only the signal pins differ."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Breadboard PSU","illustrationId":"battery"},{"id":"tilt","name":"Tilt servo","illustrationId":"servo-sg90"}],"connections":[{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"connections","summary":"Tilt servo on D10","rows":[{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Pan remains on D9. Tilt is on D10. Both reds are on PSU 5V. Both browns are on common GND. No servo red is in the Uno 5V header."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 10;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Electronics$physlay$,
  title = $physlay$Connect the Joystick$physlay$,
  description = $physlay$The joystick is a low-current analog module. It uses the Uno 5V logic rail, not the servo PSU rail.$physlay$,
  tip = $physlay$KY-023 pins are usually labelled GND, +5V, VRx, VRy, SW in that order. Match labels, not lead colour.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What you are wiring","body":"Plug the joystick pins into c8 through c12: +5V, GND, VRx, VRy, SW. a8 goes to the left + rail at row 8, not the right + rail. a9 goes to the left − rail at row 9. A0 goes to a10, A1 to a11, and D2 to a12. The sketch later enables INPUT_PULLUP on D2, so an unpressed stick reads HIGH and a click reads LOW."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"joystick","name":"Joystick","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"connections","summary":"Joystick VRx A0 · VRy A1 · SW D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"warning","body":"Do not power the joystick from the servo PSU rail if that rail is a noisy motor supply with no 5V regulation to the module. The catalogue joystick is a 5V analog part — Uno 5V is the correct source."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 11;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Build the Electronics$physlay$,
  title = $physlay$Check the Complete Circuit$physlay$,
  description = $physlay$Before any sketch, the pin map should be complete: D9 pan, D10 tilt, A0/A1/D2 joystick, PSU 5V on servo VCC, common ground.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What “complete” means","body":"Every net below should exist once. Two browns may share the − rail. Two reds may share the servo + rail. D9 and D10 must not share a pin with each other or with SW."},{"type":"wiring","heading":"Complete wiring diagram","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Breadboard PSU","illustrationId":"battery"},{"id":"pan","name":"Pan servo","illustrationId":"servo-sg90"},{"id":"tilt","name":"Tilt servo","illustrationId":"servo-sg90"},{"id":"joystick","name":"Joystick","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"connections","heading":"Exact connections","summary":"Pan D9 · tilt D10 · joystick A0/A1/D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"expected","heading":"Check","body":"You can trace Uno 5V to the joystick, PSU 5V to both servo reds, common GND to both browns and the joystick, D9 to pan SIG, D10 to tilt SIG, A0 to VRx, A1 to VRy, and D2 to SW. There is no jumper between the logic + rail and the servo + rail."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 12;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Create the Arduino Program$physlay$,
  description = $physlay$Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"PAN_PIN, TILT_PIN, JOY_X_PIN, JOY_Y_PIN, and JOY_SW_PIN match the wiring: D9, D10, A0, A1, D2. Serial is opened at 9600 baud so later tests can print without changing the port settings."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":[],"code":"const int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Named constants keep the pin map in one place. Analog pins use A0 and A1 — that is the Uno label, not the number 0 and 1. setup() and loop() are empty on purpose until the next step attaches a servo."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 13;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Add the Servo Library$physlay$,
  description = $physlay$Servo.h is bundled with the Arduino IDE. Include it and attach the pan servo to D9. The pan servo will hold, not sweep, until the next step.$physlay$,
  tip = $physlay$You do not need Library Manager for Servo.h on an Uno.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"#include <Servo.h> brings in the driver. Servo panServo; is the object. panServo.attach(PAN_PIN) tells that object to emit the control pulse on D9. Until you call write(), attach() typically sends a default mid pulse — keep fingers clear of the bracket."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Only pan is attached. Tilt is still a named pin with no Servo object. If the pan horn jumps when you later upload, that is the servo seeking the default pulse — not a wiring short."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 14;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Control the Pan Servo$physlay$,
  description = $physlay$Command pan to 90°, then sweep 60 / 90 / 120 so you can see one axis move before tilt is in the sketch.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"write(90) is mid-travel for a typical SG90. The loop then steps to 60, 90, and 120 with a 1 s pause so you can watch the base yaw. We stay away from 0 and 180 so a slightly mis-clocked horn does not stall the gearbox."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n  panServo.write(90);\n  delay(500);\n  Serial.println(\"Pan at 90.\");\n}\n\nvoid loop() {\n  panServo.write(60);\n  Serial.println(\"Pan 60\");\n  delay(1000);\n  panServo.write(90);\n  Serial.println(\"Pan 90\");\n  delay(1000);\n  panServo.write(120);\n  Serial.println(\"Pan 120\");\n  delay(1000);\n}"},{"type":"code_explanation","body":"Serial prints the commanded angle so you can match what you see to what the sketch asked for. If Serial says Pan 120 and the base barely moves, the fault is mechanical binding or power — not this write() call."},{"type":"expected","heading":"Check","body":"This sketch attaches and writes only panServo on D9. TILT_PIN is named but unused — leave the tilt signal wire on D10 from the electronics stage. Physical pan motion is confirmed later in Calibrate and Test."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 15;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Control the Tilt Servo$physlay$,
  description = $physlay$Attach the second Servo object on D10 and sweep tilt while pan holds 90°.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"Servo tiltServo; and tiltServo.attach(TILT_PIN) claim D10. setup() parks both axes at 90°. loop() sweeps only tilt so a pan fault and a tilt fault stay separable."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(90);\n  tiltServo.write(90);\n  delay(500);\n  Serial.println(\"Both servos at 90.\");\n}\n\nvoid loop() {\n  tiltServo.write(60);\n  Serial.println(\"Tilt 60\");\n  delay(1000);\n  tiltServo.write(90);\n  Serial.println(\"Tilt 90\");\n  delay(1000);\n  tiltServo.write(120);\n  Serial.println(\"Tilt 120\");\n  delay(1000);\n}"},{"type":"code_explanation","body":"Two Servo objects can run on one Uno. Each attach() consumes a timer channel — two SG90s is well within the limit. Pan stays at 90 so you can judge whether tilt is nodding on its own."},{"type":"expected","heading":"Expected result","body":"When this sketch runs, the camera plate nods through 60 / 90 / 120 while the base stays put. If the whole assembly yaws instead, the D9/D10 leads are swapped."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 16;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Read Joystick Input$physlay$,
  description = $physlay$Print the raw analog X/Y values and the switch. Servos hold 90° so you can trust the input without chasing motion.$physlay$,
  tip = $physlay$Resting X and Y are often near 512, but many modules sit somewhat above or below that. Note your rest values. A click should print SW 0.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"analogRead returns 0–1023 on the Uno. VRx is A0, VRy is A1. INPUT_PULLUP on D2 makes the unpressed switch read HIGH (1). Pressing SW shorts to ground, so it reads LOW (0). Servos attach and park at 90 so they do not go limp during this test."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(90);\n  tiltServo.write(90);\n  Serial.begin(9600);\n  Serial.println(\"Joystick test. Servos hold 90.\");\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int sw = digitalRead(JOY_SW_PIN);\n\n  Serial.print(\"X \");\n  Serial.print(x);\n  Serial.print(\"  Y \");\n  Serial.print(y);\n  Serial.print(\"  SW \");\n  Serial.println(sw);\n\n  delay(200);\n}"},{"type":"code_explanation","body":"We still do not map the stick to angles. If X never changes when you move left/right, A0 is the fault. If Y is stuck at 0 or 1023, VRy may be sitting on 5V or GND instead of A1."},{"type":"text","heading":"Resting centre","body":"A centred stick is rarely exactly 512. Read Serial at rest and write down X and Y. In the combined sketch those numbers become JOY_X_CENTER and JOY_Y_CENTER so the deadzone sits around your module, not around an assumed midpoint."},{"type":"test","body":"When you upload this sketch later: rest the stick, move X, move Y, then click SW. Watch Serial at 9600 baud."},{"type":"expected","heading":"Expected result","body":"At rest, X and Y are often around 480–540 rather than exactly 512. Write those rest values down. Full left or right drives X toward 0 or 1023. Full up or down drives Y toward an extreme. SW prints 1 at rest and 0 while clicked."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 17;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Map Joystick Values to Servo Angles$physlay$,
  description = $physlay$Convert 0–1023 stick readings into 0–180 servo degrees so both axes follow the joystick.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"map(x, 0, 1023, 0, 180) scales the pan stick onto the servo range. The same mapping on y drives tilt. delay(20) is a short refresh so the servos are not flooded, but the stick still feels live."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int panAngle = map(x, 0, 1023, 0, 180);\n  int tiltAngle = map(y, 0, 1023, 0, 180);\n\n  panServo.write(panAngle);\n  tiltServo.write(tiltAngle);\n\n  Serial.print(\"Pan \");\n  Serial.print(panAngle);\n  Serial.print(\"  Tilt \");\n  Serial.println(tiltAngle);\n\n  delay(20);\n}"},{"type":"code_explanation","body":"This sketch has no deadzone and no mechanical limits. At rest the stick is rarely exactly 512, so the servos may creep. That is expected — the next step holds the last angle inside a deadzone around JOY_X_CENTER / JOY_Y_CENTER and clamps travel to 20–160."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 18;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Build the Program$physlay$,
  title = $physlay$Add Limits and Combine the Program$physlay$,
  description = $physlay$Clamp travel, ignore stick noise around centre, and use the joystick click to return both axes to 90°.$physlay$,
  tip = $physlay$If an axis is reversed, swap that map() pair: map(x, 0, 1023, PAN_MAX, PAN_MIN).$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What we are adding","body":"PAN_MIN/MAX and TILT_MIN/MAX keep write() inside the bracket’s free range. DEADZONE of 40 around JOY_X_CENTER and JOY_Y_CENTER means a resting stick does not update the stored angle. Start those centres at 512; if Serial at rest was different, put those numbers in instead. Clicking SW (LOW) sets both stored angles back to 90. The servos hold the last aimed position when you let the stick go — that is what you want when framing a camera."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nconst int PAN_MIN = 20;\nconst int PAN_MAX = 160;\nconst int TILT_MIN = 20;\nconst int TILT_MAX = 160;\nconst int PAN_CENTER = 90;\nconst int TILT_CENTER = 90;\nconst int JOY_X_CENTER = 512;\nconst int JOY_Y_CENTER = 512;\nconst int DEADZONE = 40;\n\nServo panServo;\nServo tiltServo;\n\nint panAngle = PAN_CENTER;\nint tiltAngle = TILT_CENTER;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(panAngle);\n  tiltServo.write(tiltAngle);\n  Serial.begin(9600);\n  Serial.println(\"Pan-tilt ready.\");\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int sw = digitalRead(JOY_SW_PIN);\n\n  if (sw == LOW) {\n    panAngle = PAN_CENTER;\n    tiltAngle = TILT_CENTER;\n  } else {\n    if (abs(x - JOY_X_CENTER) > DEADZONE) {\n      panAngle = map(x, 0, 1023, PAN_MIN, PAN_MAX);\n    }\n    if (abs(y - JOY_Y_CENTER) > DEADZONE) {\n      tiltAngle = map(y, 0, 1023, TILT_MIN, TILT_MAX);\n    }\n  }\n\n  panServo.write(panAngle);\n  tiltServo.write(tiltAngle);\n\n  Serial.print(\"Pan \");\n  Serial.print(panAngle);\n  Serial.print(\"  Tilt \");\n  Serial.println(tiltAngle);\n\n  delay(20);\n}"},{"type":"code_explanation","body":"This is the complete sketch. Pin map: D9 pan, D10 tilt, A0 VRx, A1 VRy, D2 SW. Behaviour: aim while the stick is deflected, hold when it is inside the deadzone around your joystick centres, recentre on a click. View Code on a finished project shows this same program."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 19;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Calibrate and Test$physlay$,
  title = $physlay$Upload the Program$physlay$,
  description = $physlay$Board: Arduino Uno. Serial Monitor at 9600 baud. Power the PSU before you expect the servos to hold.$physlay$,
  tip = $physlay$If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Before you upload","body":"Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in. Include Servo.h is enough — do not install a third-party servo library for this sketch."},{"type":"text","heading":"How to upload","body":"Paste the combined sketch from the previous step. Apply PSU power so the servos have 5V. Click Upload, then open Serial Monitor at 9600 baud. Keep clear of the bracket; the servos will seek 90° on attach."},{"type":"test","body":"Upload once. Watch Serial for “Pan-tilt ready.”"},{"type":"expected","heading":"Expected result","body":"The IDE reports Done uploading. Serial prints “Pan-tilt ready.” Both servos should sit near mid-travel and hold, not chatter, with the stick at rest."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"No serial port","solution":"Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port."},{"problem":"Upload error / avrdude","solution":"Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy."},{"problem":"Board resets when servos move","solution":"Servo VCC is on Uno 5V or the PSU is missing. Move both reds to the PSU 5V rail and confirm common GND."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 20;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Calibrate and Test$physlay$,
  title = $physlay$Test Individual Movements$physlay$,
  description = $physlay$Move the stick on one axis at a time. Confirm pan yaws the base and tilt nods the plate, and note if either axis is reversed.$physlay$,
  tip = $physlay$Keep the camera plate lightly loaded until direction is confirmed.$physlay$,
  blocks = $physlay$[{"type":"test","body":"Leave the stick centred, then move only left/right. Watch the base. Return to centre, then move only up/down. Watch the plate. Click SW once."},{"type":"expected","heading":"Expected result","body":"Left/right yaws pan only. Up/down nods tilt only. At rest both hold. A click returns both to about 90°. Serial angles change while the stick is deflected and freeze inside the deadzone."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Pan moves when you intend tilt","solution":"Swap the VRx and VRy wires at A0/A1, or swap JOY_X_PIN and JOY_Y_PIN in the sketch. The module axes may not match how the bracket is sitting on the desk."},{"problem":"An axis moves the wrong way","solution":"Invert that map() pair (PAN_MAX then PAN_MIN, or TILT_MAX then TILT_MIN). Do not reverse the 5V/GND leads to “fix” direction."},{"problem":"One servo is dead","solution":"Confirm that servo’s red is on PSU 5V, brown on common GND, and orange on D9 (pan) or D10 (tilt). A swapped red/orange can damage a pin — power off before you reseat."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 21;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Calibrate and Test$physlay$,
  title = $physlay$Calibrate Neutral Positions$physlay$,
  description = $physlay$Command 90°, then reseat each horn so mid-code is mid-mechanism: plate level, U-bracket square on the base.$physlay$,
  tip = $physlay$Loosen the horn screw, lift the horn off the spline, and press it back on. Do not rotate the servo shaft against a powered motor.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Why the horn comes off","body":"write(90) is a pulse, not a promise about the plastic. If you tightened the horn at an arbitrary spline, “90” can be a tilted plate. Click SW (or power up into the combined sketch) so both servos hold 90°, then power down before you pull a horn if you are not confident working around a live servo."},{"type":"test","body":"With both servos holding 90°, loosen the pan horn and reseat the U-bracket square over the base. Then loosen the tilt horn and reseat the camera plate level. Retighten the horn screws. Power up and click SW again."},{"type":"expected","heading":"Expected result","body":"After a click, the plate is level and the U-bracket is square. Small stick moves should travel evenly both ways before you hit PAN_MIN/MAX or the plastic stops."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"90° is still tilted after reseating","solution":"The horn only fits in discrete spline positions. Choose the spline closest to level, then trim TILT_CENTER (and PAN_CENTER) by a few degrees in the sketch if you need a last nudge."},{"problem":"The joint binds before 20° or 160°","solution":"Raise PAN_MIN / TILT_MIN or lower PAN_MAX / TILT_MAX until the bracket never hits itself. Limits are meant to be tighter than the servo’s full range."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 22;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Calibrate and Test$physlay$,
  title = $physlay$Test Combined Movement$physlay$,
  description = $physlay$Aim on both axes, hold, recentre, and confirm the pin map still matches the complete wiring diagram.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"image","imageKey":"servoCamera","caption":"Keep this GPIO map if you mount a camera later: pan D9, tilt D10, joystick A0 / A1 / D2."},{"type":"test","body":"Aim toward one corner, let the stick go (it should hold). Aim toward the opposite corner. Click SW to recentre. Repeat once with a lightweight camera or webcam on the plate if you have one, or leave the plate empty."},{"type":"expected","heading":"Expected result","body":"Both axes move together while the stick is deflected, hold when centred, and return to a level 90° on a click. No reset, no gearbox grind, no lead pulling tight. You have a joystick-aimed pan-tilt mount."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Servos chatter at rest","solution":"Increase DEADZONE (try 60), or set JOY_X_CENTER and JOY_Y_CENTER to the X and Y values Serial printed at rest. Confirm the joystick 5V is the Uno rail and GND is common. A floating VRx/VRy will never sit still."},{"problem":"Mechanism holds, then jumps","solution":"A weak PSU or a 9V battery is sagging under load. Use a 6–12V DC adapter on the breadboard PSU and keep servo reds off the Uno 5V pin."},{"problem":"Click does nothing","solution":"Confirm SW is on D2 and JOY_SW_PIN uses INPUT_PULLUP. SW should read 0 only while pressed. If it is always 0, the pin is shorted to GND."},{"problem":"USB disconnects when the mount moves","solution":"The Uno is supplying servo current. Recheck that both VCC (red) wires are on the PSU 5V rail and that PSU GND is tied to Uno GND."}]},{"type":"connections","heading":"Pin map you built","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Breadboard","toPin":"+ servo rail","signal":"power"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Breadboard PSU","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '18')
  and sort_order = 23;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Introduction$physlay$,
  title = $physlay$What the finished station does$physlay$,
  description = $physlay$The ESP32 reads a BME280 and serves the readings on your own Wi-Fi network.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"image","imageKey":"esp32WifiWeather","caption":"The finished station is an ESP32-DevKitC V4 and an Adafruit BME280 beside a breadboard, powered from USB. The wiring diagram is the connection reference."},{"type":"text","heading":"What you are building","body":"The finished station measures temperature in degrees Celsius, relative humidity in percent, and barometric pressure in hectopascals. The ESP32 DevKit joins a Wi-Fi network you choose and hosts a small web page. A phone or computer on that same network opens the page and sees the numbers update about every two seconds. Nothing is sent to a cloud service."},{"type":"text","heading":"Words this guide uses","body":"A GPIO is a header pin the sketch can name. IO21 is GPIO 21. I2C is a two-wire link: SDA, marked SDI on this sensor, carries data, and SCL, marked SCK, carries the clock. An SSID is the Wi-Fi network name. An IP address is the number the router gives the ESP32, such as 192.168.1.42, so the example dashboard URL is http://192.168.1.42. JSON is the text format used by /readings. It is a list of named fields, not a web page."},{"type":"expected","heading":"What done looks like","body":"The Serial Monitor prints an IP address such as 192.168.1.42, then repeating temperature, humidity, and pressure lines. A browser on the same local network opens http://192.168.1.42, using the address your board actually printed, and shows the same three readings. These are the results the sketch is written to produce. This repository has not confirmed them on a physical board."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 0;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Introduction$physlay$,
  title = $physlay$What you will learn$physlay$,
  description = $physlay$This build is about one sensor bus, one Wi-Fi connection, and one local web page.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Skills in this project","body":"You will identify the ESP32 pins 3V3, GND, IO21, and IO22, and the Adafruit BME280 pins Vin, GND, SCK, and SDI. You will install the ESP32 board package and the Adafruit BME280 library, upload a complete sketch, and read both the Serial Monitor and a browser. You will also see how a failed sensor or a failed Wi-Fi join is reported instead of being hidden."},{"type":"text","heading":"What this project does not teach","body":"It does not use a BMP280. A BMP280 can report pressure and temperature, but it has no humidity measurement, and this dashboard needs humidity. It also does not use the ESP32-CAM, an ESP8266, or a Raspberry Pi. Those boards do not share this pin map."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 1;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Introduction$physlay$,
  title = $physlay$How the hardware and software work together$physlay$,
  description = $physlay$Four wires carry power and I2C. The sketch turns those readings into a web page.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"The path of a reading","body":"USB power feeds the ESP32 DevKit. The board’s 3V3 pin feeds the BME280 Vin pin, and the two GND pins share a ground. IO21 is the I2C data line and goes to SDI. IO22 is the I2C clock and goes to SCK. The sketch asks the sensor at address 0x77 for temperature, humidity, and pressure, then stores the latest values. A browser requests the page at / and, every two seconds, the JSON document at /readings."},{"type":"text","heading":"Why the address is 0x77","body":"Adafruit’s BME280 guide says the default I2C address is 0x77 while SDO is left open. Connecting SDO to GND changes the address to 0x76. This project leaves SDO, CS, and 3Vo unconnected, so the sketch calls begin(0x77)."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 2;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Introduction$physlay$,
  title = $physlay$What a successful build should do$physlay$,
  description = $physlay$Success is a local page with live units, plus a clear error when the sensor or Wi-Fi is missing.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Check these behaviours","body":"After upload, the Serial Monitor at 115200 baud prints either “BME280 ready at 0x77.” or a not-found message. When the ESP32 joins Wi-Fi, Serial prints “Wi-Fi connected. IP address:” and the address. A browser that can open that address shows “Connected at” and the same address, with temperature in C, humidity in %, and pressure in hPa. If the sensor is missing and the page still loads, the page shows the error text and the cards show a dash. If the browser cannot reach the ESP32, the request fails: a page that was already open changes to “Dashboard not updating” and says it could not read /readings. The words “Wi-Fi disconnected” appear only after a successful /readings response whose wifi_connected field is false. A browser that has lost the ESP32 does not receive that update. No internet connection is required when the phone and the ESP32 can still reach each other on the local network."},{"type":"warning","body":"This repository has not run the sketch on a physical ESP32. Treat the Serial and browser results below as the behaviour the code is written to produce, and compare them with what your board actually prints."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 3;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Hardware preparation$physlay$,
  title = $physlay$Identify every required component$physlay$,
  description = $physlay$Every physical item in this build is on the BOM. None of these parts is optional.$physlay$,
  tip = $physlay$A phone or computer is how you view the page. It is not a wired component, so it is not a BOM line.$physlay$,
  blocks = $physlay$[{"type":"components","heading":"Required parts","items":[{"id":"esp32","name":"ESP32 DevKit","illustrationId":"esp32","owned":false,"quantity":1},{"id":"bme280","name":"Adafruit BME280","illustrationId":"bme280","owned":false,"quantity":1},{"id":"stemma-qt-cable","name":"STEMMA QT to male cable","illustrationId":"jumper-wires","owned":false,"quantity":1},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-male-female","name":"Male-to-female jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":4},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"text","heading":"What each part is for","body":"The ESP32 DevKit is the controller and the web server. This build uses an Espressif ESP32-DevKitC V4 with male pin headers. The Adafruit BME280 is the only sensor. Its STEMMA QT socket takes the cable, so you do not solder the breakout. The breadboard joins the cable pins to four male-to-female jumpers. The USB data cable is USB-A to Micro-B and must carry data. The USB power source is the computer port while you program, or a USB charger after the sketch is on the board."},{"type":"expected","heading":"Check","body":"You can point to one ESP32-DevKitC V4 with male headers, one Adafruit BME280 with a STEMMA QT socket, one STEMMA QT to male cable, one breadboard, four male-to-female jumpers, one USB-A to Micro-B data cable, and a USB port or charger. A BMP280 board is not a substitute on this bench."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 4;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Hardware preparation$physlay$,
  title = $physlay$Confirm the ESP32 DevKit labels$physlay$,
  description = $physlay$Use an Espressif ESP32-DevKitC V4 with male headers. A generic DevKit is not assumed to match it.$physlay$,
  tip = $physlay$Espressif’s ESP32-DevKitC V4 user guide lists a Micro-USB socket, a Boot button, an EN button, and either male or female headers.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What to look for","body":"Solderi’s ESP32 DevKit row is only a 3.3 V board programmed with the Arduino-ESP32 package. It does not record one outline or one connector. This project’s mechanical steps are for the Espressif ESP32-DevKitC V4 with male pin headers. Its user guide puts 3V3 on header J2 and IO22 plus IO21 on header J3, so the wires use both sides of the board. Arduino-ESP32’s generic ESP32 default I2C pins are GPIO21 for SDA and GPIO22 for SCL. The male pins are already fitted. Do not solder the DevKit."},{"type":"text","heading":"USB socket and fit","body":"The DevKitC V4 user guide names a Micro-USB port as the default power supply and says the board can be mounted on a breadboard or wired with jumpers. It also sells male-header and female-header versions, and this repository has not measured the distance between the two pin rows. Do not force the board across a breadboard’s centre gap. Place it beside the breadboard and use male-to-female jumpers: the female socket goes on a male header pin, and the male pin goes into the breadboard. Use a USB-A to Micro-B cable that carries data. A charge-only cable can light the board and still never appear as a serial port. A USB-C cable does not fit this socket."},{"type":"warning","body":"If the silkscreen does not show 3V3, GND, IO21 or GPIO21, and IO22 or GPIO22, stop. If the headers are female sockets, stop: this BOM’s jumpers will not match them. Do not move the wires onto an ESP32-CAM or another module. Espressif warns that DevKitC V4 power must come from only one of USB, the 5V pin, or the 3V3 pin."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 5;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Hardware preparation$physlay$,
  title = $physlay$Confirm the BME280 pin labels$physlay$,
  description = $physlay$Use the current Adafruit STEMMA QT breakout. Do not solder its header.$physlay$,
  tip = $physlay$Leave 3Vo, SDO, CS, and the ADDR jumper empty for this project.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Pins this project uses","body":"Adafruit’s BME280 pinout names Vin, 3Vo, GND, SCK, SDO, SDI, and CS. Vin is the power input and accepts 3–5 V. This project feeds Vin from the ESP32 3V3 pin. Adafruit says the logic level follows Vin, and the ESP32 DevKit’s GPIO is 3.3 V, so Vin must not be tied to 5 V. 3Vo is a 3.3 V output from the breakout’s regulator. Leave it unconnected. GND is the common ground."},{"type":"text","heading":"I2C pins and address","body":"SCK is the I2C clock and connects to IO22. SDI is the I2C data and connects to IO21. Adafruit’s I2C wiring uses those two signal pins plus Vin and GND, and says to leave the other pins disconnected. The default address is 0x77. A jumper from SDO to GND, or soldering the ADDR jumper on the back, changes the address to 0x76, which this sketch does not scan. Adafruit’s I2C page does not add a separate pull-up resistor, so this project does not put one on the BOM. This repository has not measured the resistor value on the PCB."},{"type":"text","heading":"How you connect it without soldering","body":"Adafruit’s current product 2652 is the STEMMA QT board. The BME280 chip is already soldered to that PCB. The loose 0.1 inch header is not soldered, and Adafruit’s assembly page tells you to solder it only if you want the holes in a breadboard. This project does not do that. Plug a STEMMA QT to male cable, such as Adafruit 4209, into either STEMMA QT socket. Adafruit’s cable colours are black for GND, red for VIN, blue for SDA, and yellow for SCL. Blue is SDI. Yellow is SCK. An older breakout with no STEMMA QT socket is not this build."},{"type":"expected","heading":"Check","body":"The board says BME280, has a STEMMA QT socket, and the cable is latched in. If the silk says BMP280, or there is no STEMMA QT socket, this wiring does not apply."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 6;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Hardware preparation$physlay$,
  title = $physlay$Seat the board and the sensor$physlay$,
  description = $physlay$Leave both boards off the breadboard holes. USB stays unplugged.$physlay$,
  tip = $physlay$A full-size breadboard often splits each coloured rail in the middle. Use one continuous half, or bridge that gap.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What to do","body":"Set the DevKitC V4 beside the breadboard. Do not press its headers into the holes, and do not push the BME280 board in either. The STEMMA QT cable’s male pins are what enter the breadboard: red in the left + rail at row 6, black in the left − rail at row 6, blue in a10, yellow in a14. Stay above a break in the rail. Leave USB unplugged until the wiring check."},{"type":"expected","heading":"What you should see","body":"The DevKit is beside the breadboard, the sensor is beside it, and four male cable pins are in the breadboard: red in the red rail, black in the blue rail, blue and yellow in their own rows. You can still read 3V3, GND, IO21, and IO22 on the DevKit."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 7;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Connect power and ground$physlay$,
  description = $physlay$3V3 and GND go to the breadboard rails, then from those rails to Vin and GND.$physlay$,
  tip = $physlay$Use the breadboard’s red rail for 3V3 and the blue rail for ground. This project’s positive rail is 3.3 V, not 5 V.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Connection sequence","body":"Use two male-to-female jumpers. DevKit 3V3 goes to the left + rail at row 9, on the same unbroken rail as the cable’s red pin at row 6. DevKit GND goes to the left − rail at row 9, with the cable’s black pin at row 6. Do not add another wire to the sensor for power. Do not connect ESP32 5V or BME280 3Vo. Leave the blue and yellow pins for the next step."},{"type":"wiring","heading":"Power and ground","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"3V3","toComponent":"Breadboard","toPin":"+ rail","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"+ rail","toComponent":"Adafruit BME280","toPin":"Vin","signal":"power"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Adafruit BME280","toPin":"GND","signal":"ground"}]},{"type":"connections","summary":"3V3 to Vin · GND to GND","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"3V3","toComponent":"Breadboard","toPin":"+ rail","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"+ rail","toComponent":"Adafruit BME280","toPin":"Vin","signal":"power"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Adafruit BME280","toPin":"GND","signal":"ground"}]},{"type":"warning","body":"Adafruit says BME280 logic follows the voltage on Vin. Five volts on Vin would present 5 V logic to IO21 and IO22. The ESP32 DevKit is a 3.3 V board. Keep Vin on 3V3."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 8;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Connect SDA and SCL$physlay$,
  description = $physlay$IO21 goes to SDI. IO22 goes to SCK. Those are the only signal wires.$physlay$,
  tip = $physlay$SDA is data. SCL is clock. On this breakout the silk says SDI and SCK, not SDA and SCL.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Connection sequence","body":"Put a male-to-female jumper on IO21 and its pin in b10, the same row as the cable’s blue SDI pin in a10. Put another on IO22 and its pin in b14, the same row as the yellow SCK pin in a14. That is four male-to-female jumpers in the whole build, plus the STEMMA QT cable. Leave SDO open so the address stays 0x77. Leave CS open and leave the ADDR jumper unsoldered."},{"type":"wiring","heading":"I2C signals","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO21","toComponent":"Adafruit BME280","toPin":"SDI","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO22","toComponent":"Adafruit BME280","toPin":"SCK","signal":"signal"}]},{"type":"connections","summary":"IO21 to SDI · IO22 to SCK","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO21","toComponent":"Adafruit BME280","toPin":"SDI","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO22","toComponent":"Adafruit BME280","toPin":"SCK","signal":"signal"}]},{"type":"expected","heading":"Check","body":"IO21 shares a row only with the blue pin, and IO22 shares a row only with the yellow pin. Neither signal row touches the red rail or the blue rail."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 9;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Read the complete wiring table$physlay$,
  description = $physlay$These six connections are the whole circuit. The sketch uses the same GPIO numbers.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"wiring","heading":"Complete wiring diagram","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"3V3","toComponent":"Breadboard","toPin":"+ rail","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"+ rail","toComponent":"Adafruit BME280","toPin":"Vin","signal":"power"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Adafruit BME280","toPin":"GND","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO21","toComponent":"Adafruit BME280","toPin":"SDI","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO22","toComponent":"Adafruit BME280","toPin":"SCK","signal":"signal"}]},{"type":"connections","heading":"Every electrical connection","summary":"IO21 SDA · IO22 SCL · 3V3 Vin · common GND · address 0x77","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"3V3","toComponent":"Breadboard","toPin":"+ rail","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"+ rail","toComponent":"Adafruit BME280","toPin":"Vin","signal":"power"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Adafruit BME280","toPin":"GND","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO21","toComponent":"Adafruit BME280","toPin":"SDI","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO22","toComponent":"Adafruit BME280","toPin":"SCK","signal":"signal"}]},{"type":"text","heading":"How this matches the sketch","body":"The firmware sets I2C_SDA to 21 and I2C_SCL to 22, then calls Wire.begin(I2C_SDA, I2C_SCL) and bme.begin(0x77). GPIO21 is the header labelled IO21. GPIO22 is the header labelled IO22. There is no other GPIO in this project. The diagram shows the STEMMA QT cable’s male pins in the breadboard and the four jumpers landing on those same rails and rows. The sensor PCB stays beside the breadboard. Blue is SDI and yellow is SCK. The + rail is 3.3 V, shown as + 3V3, not 5 V."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 10;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Check the circuit before you apply power$physlay$,
  description = $physlay$Look once more, then connect USB. Do not also feed the 5V or 3V3 header from a second supply.$physlay$,
  tip = $physlay$Espressif’s DevKitC V4 guide says USB, the 5V pin, and the 3V3 pin are mutually exclusive power inputs.$physlay$,
  blocks = $physlay$[{"type":"test","heading":"What to verify","body":"Count four male-to-female jumpers and one four-wire cable. 3V3 and the red pin share the red rail, and that rail does not touch SCK, SDI, SDO, CS, or 3Vo. GND and the black pin share the blue rail. IO21 shares a row only with the blue pin. IO22 shares a row only with the yellow pin. SDO, CS, and ADDR are untouched. The USB cable is not yet plugged in, and nothing is connected to the 5V pin."},{"type":"text","heading":"Then apply power","body":"Plug the data cable into the DevKit and into the computer USB port you will use for upload. On an ESP32-DevKitC V4, the 5V Power On LED lights when USB power is present. If you later move the board to a USB charger, unplug the computer first so only one power source is connected."},{"type":"expected","heading":"Expected result","body":"The board’s power LED is on. The sensor does not get hot. A quiet Serial Monitor is not required: the board may already contain a sketch that prints. You will replace that sketch when you upload."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 11;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Development environment$physlay$,
  title = $physlay$Install the ESP32 board package$physlay$,
  description = $physlay$The Arduino IDE needs Espressif’s ESP32 package before this board appears in the Board menu.$physlay$,
  tip = $physlay$Use the stable package URL. The development URL is a different, less settled package.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What to do","body":"Install the current Arduino IDE from arduino.cc. Open File > Preferences, or Arduino IDE > Settings. In Additional boards manager URLs, add https://espressif.github.io/arduino-esp32/package_esp32_index.json and click OK. Open Tools > Board > Boards Manager, search for esp32 by Espressif Systems, and install the esp32 platform. Restart the IDE if the new board list does not appear."},{"type":"text","heading":"Why this package","body":"WiFi.h and WebServer.h come from that ESP32 package. They are not separate Library Manager installs. The generic ESP32 I2C defaults in that package are GPIO21 and GPIO22, which is why the sketch still names those pins explicitly."},{"type":"expected","heading":"What you should see","body":"Boards Manager shows the esp32 package as installed. Tools > Board contains an ESP32 Arduino group."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 12;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Development environment$physlay$,
  title = $physlay$Select the board and the serial port$physlay$,
  description = $physlay$Choose ESP32 Dev Module, then the port that appears when the data cable is plugged in.$physlay$,
  tip = $physlay$If the port never appears, try another cable before you change any wiring.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"Board","body":"Open Tools > Board > ESP32 Arduino and choose ESP32 Dev Module. That is the generic ESP32 target for this DevKit. Do not choose ESP32-CAM or an S2, S3, or C3 board. Leave the other Tools menu flash settings at the ESP32 Dev Module defaults unless a later upload error tells you to change one."},{"type":"text","heading":"Port","body":"Plug in the data cable. Open Tools > Port and select the new port. On Windows it is a COM port. On macOS it is a /dev/cu.usbserial or /dev/cu.SLAB port. Unplug the cable and open the menu again: the correct port is the one that disappears. Select it again after you plug the cable back in."},{"type":"troubleshooting","heading":"If the port is missing","items":[{"problem":"No new port appears","solution":"The cable may be charge-only, or it may be in the wrong socket. Use a data cable that fits the DevKit. Then reopen Tools > Port."},{"problem":"Several ports are listed","solution":"Unplug the DevKit, see which port vanishes, and select that one after reconnecting."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 13;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Development environment$physlay$,
  title = $physlay$Install the BME280 libraries$physlay$,
  description = $physlay$Library Manager installs Adafruit BME280 Library together with its two dependencies.$physlay$,
  tip = $physlay$Search for the library name Adafruit BME280 Library. Do not install a BMP280-only library in its place.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What to install","body":"Open Tools > Manage Libraries. Search for Adafruit BME280 Library and install it. Its library.properties file depends on Adafruit Unified Sensor and Adafruit BusIO. Accept the prompt to install those dependencies if the IDE offers it. If it does not, install both by those names from Library Manager as well."},{"type":"text","heading":"What you do not install","body":"Do not install a separate Wi-Fi or web-server library. WiFi.h and WebServer.h are part of the ESP32 board package from the previous step. Do not install Adafruit BMP280 Library for this sketch. The include line is Adafruit_BME280.h, and begin() is the BME280 call."},{"type":"expected","heading":"Check","body":"Library Manager shows Adafruit BME280 Library, Adafruit Unified Sensor, and Adafruit BusIO as installed."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 14;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Development environment$physlay$,
  title = $physlay$Set the Serial Monitor to 115200 baud$physlay$,
  description = $physlay$The sketch calls Serial.begin(115200). A mismatched baud rate looks like garbage text, not a dead board.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What to do","body":"Open Tools > Serial Monitor. In the baud menu at the corner of the monitor, choose 115200. Leave the line ending on Newline. You will not see the weather lines until the sketch is uploaded, but setting the speed now avoids mistaking baud noise for a failed sensor."},{"type":"expected","heading":"What you should observe","body":"The monitor is open on the same port you selected for upload, and the baud value reads 115200. If you later see repeated characters that are not words, the baud setting has been changed."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 15;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Firmware$physlay$,
  title = $physlay$Create the sketch and set the Wi-Fi name$physlay$,
  description = $physlay$Replace the two placeholders with your network name and password. Do not commit a real password into a shared copy.$physlay$,
  tip = $physlay$The network must be 2.4 GHz. The ESP32 DevKit radio in this project does not join a 5 GHz-only network.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What to do","body":"Create a sketch named esp32_wifi_weather_station. Do not upload it yet. The code below is an excerpt of the finished program, not a sketch on its own. The only lines you will edit, once the complete program is pasted, are the two Wi-Fi placeholders. The SSID is your network name. Use the password for that same network. Your phone or computer must be able to join it as well."},{"type":"code","language":"Arduino","filename":"Excerpt only — not a complete sketch","libraries":["WiFi (ESP32 Arduino core)","WebServer (ESP32 Arduino core)","Wire (Arduino core)","Adafruit Unified Sensor","Adafruit BusIO","Adafruit BME280 Library"],"code":"const char *WIFI_SSID = \"YOUR_WIFI_NAME\";\nconst char *WIFI_PASSWORD = \"YOUR_WIFI_PASSWORD\";"},{"type":"code_explanation","heading":"Why these constants","body":"WIFI_SSID and WIFI_PASSWORD are ordinary C strings. YOUR_WIFI_NAME and YOUR_WIFI_PASSWORD are placeholders, not a working network. The rest of the sketch reads these two names, so you do not type the password anywhere else."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 16;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Firmware$physlay$,
  title = $physlay$Start I2C and the BME280$physlay$,
  description = $physlay$The sketch opens GPIO21 and GPIO22, then looks for address 0x77.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What this code does","body":"This is another excerpt, not a second sketch. Wire.begin(21, 22) starts the hardware I2C peripheral on the same pins as the wiring table. bme.begin(0x77) asks the Adafruit library, the version that provides begin(uint8_t addr), to initialise the sensor on that address. A true result means the chip answered. A false result is stored as an error and printed. The web server still starts, so a browser that can reach the board can show that error."},{"type":"code","language":"Arduino","filename":"Excerpt only — not a complete sketch","libraries":["Wire","Adafruit BME280 Library","Adafruit Unified Sensor","Adafruit BusIO"],"code":"Wire.begin(I2C_SDA, I2C_SCL);\n  sensorReady = bme.begin(BME280_I2C_ADDRESS);"},{"type":"code_explanation","body":"readTemperature() returns degrees Celsius, readHumidity() returns percent, and readPressure() returns pascals as a float in the current Adafruit_BME280.h. The sketch divides pascals by 100 to show hectopascals. A NaN value becomes the invalid-reading error instead of a number on the page."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 17;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Firmware$physlay$,
  title = $physlay$Serve the page and the JSON endpoint$physlay$,
  description = $physlay$The ESP32 answers / with HTML and /readings with the latest measurements.$physlay$,
  tip = $physlay$The page asks /readings every two seconds. You do not refresh the browser by hand.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What this code does","body":"This excerpt is also part of the same program. WebServer server(80) listens on the normal web port. server.on registers two GET routes. handleRoot sends the dashboard HTML. handleReadings sends JSON fields ok, temperature_c, humidity_percent, pressure_hpa, wifi_connected, ip, and error. The HTML uses fetch(\"/readings\") and setInterval(..., 2000). It does not load fonts or scripts from the internet."},{"type":"code","language":"Arduino","filename":"Excerpt only — not a complete sketch","libraries":["WebServer (ESP32 Arduino core)"],"code":"server.on(\"/\", HTTP_GET, handleRoot);\n  server.on(\"/readings\", HTTP_GET, handleReadings);\n  server.begin();"},{"type":"code_explanation","body":"loop() calls server.handleClient() every pass so a browser that can still reach the board gets an answer. Wi-Fi retries are timed with millis() and WIFI_RETRY_MS. There is no while-loop waiting forever for a network. If the ESP32 leaves Wi-Fi, Serial prints “Connecting to Wi-Fi...” on the next retry. The page’s “Wi-Fi disconnected” text is sent only inside a successful /readings response. A browser that can no longer reach the ESP32 does not get that response. It shows “Dashboard not updating” instead."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 18;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Firmware$physlay$,
  title = $physlay$Paste the complete sketch and upload it$physlay$,
  description = $physlay$This is the only program to paste and upload. The earlier code blocks were excerpts of it.$physlay$,
  tip = $physlay$If the upload times out, hold the Boot button, press and release EN, then release Boot and try again. That is the DevKitC V4 download-mode sequence.$physlay$,
  blocks = $physlay$[{"type":"code","language":"Arduino","filename":"esp32_wifi_weather_station.ino","libraries":["WiFi (ESP32 Arduino core)","WebServer (ESP32 Arduino core)","Wire (Arduino core)","Adafruit Unified Sensor","Adafruit BusIO","Adafruit BME280 Library"],"code":"/*\n * ESP32 Wi-Fi Weather Station\n * Board: ESP32 Dev Module\n * Sensor: Adafruit BME280 over I2C at 0x77\n * IO21 = SDA = BME280 SDI\n * IO22 = SCL = BME280 SCK\n * 3V3 = BME280 Vin\n * GND = BME280 GND\n */\n\n#include <WiFi.h>\n#include <WebServer.h>\n#include <Wire.h>\n#include <Adafruit_Sensor.h>\n#include <Adafruit_BME280.h>\n\nconst char *WIFI_SSID = \"YOUR_WIFI_NAME\";\nconst char *WIFI_PASSWORD = \"YOUR_WIFI_PASSWORD\";\n\nconst int I2C_SDA = 21;\nconst int I2C_SCL = 22;\nconst uint8_t BME280_I2C_ADDRESS = 0x77;\n\nconst unsigned long SENSOR_INTERVAL_MS = 2000;\nconst unsigned long WIFI_RETRY_MS = 5000;\n\nAdafruit_BME280 bme;\nWebServer server(80);\n\nbool sensorReady = false;\nString sensorError = \"Sensor has not been read yet.\";\nfloat temperatureC = NAN;\nfloat humidityPercent = NAN;\nfloat pressureHpa = NAN;\nunsigned long lastSensorReadMs = 0;\nunsigned long lastWifiAttemptMs = 0;\nbool wifiWasConnected = false;\n\nbool readingIsValid(float value) {\n  return !isnan(value);\n}\n\nvoid readSensor() {\n  if (!sensorReady) {\n    sensorError = \"BME280 was not found at address 0x77.\";\n    temperatureC = NAN;\n    humidityPercent = NAN;\n    pressureHpa = NAN;\n    return;\n  }\n\n  float nextTemperature = bme.readTemperature();\n  float nextHumidity = bme.readHumidity();\n  float nextPressurePa = bme.readPressure();\n\n  if (!readingIsValid(nextTemperature) || !readingIsValid(nextHumidity) || !readingIsValid(nextPressurePa)) {\n    sensorError = \"BME280 returned an invalid reading.\";\n    temperatureC = NAN;\n    humidityPercent = NAN;\n    pressureHpa = NAN;\n    return;\n  }\n\n  temperatureC = nextTemperature;\n  humidityPercent = nextHumidity;\n  pressureHpa = nextPressurePa / 100.0f;\n  sensorError = \"\";\n}\n\nvoid connectWifi() {\n  if (WiFi.status() == WL_CONNECTED) {\n    return;\n  }\n\n  unsigned long now = millis();\n  if (lastWifiAttemptMs != 0 && now - lastWifiAttemptMs < WIFI_RETRY_MS) {\n    return;\n  }\n\n  lastWifiAttemptMs = now;\n  Serial.println(\"Connecting to Wi-Fi...\");\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n}\n\nString jsonNumber(float value) {\n  if (!readingIsValid(value)) {\n    return \"null\";\n  }\n  return String(value, 2);\n}\n\nString readingsJson() {\n  bool wifiConnected = WiFi.status() == WL_CONNECTED;\n  String json = \"{\";\n  json += \"\\\"ok\\\":\";\n  json += sensorError.length() == 0 ? \"true\" : \"false\";\n  json += \",\\\"temperature_c\\\":\";\n  json += jsonNumber(temperatureC);\n  json += \",\\\"humidity_percent\\\":\";\n  json += jsonNumber(humidityPercent);\n  json += \",\\\"pressure_hpa\\\":\";\n  json += jsonNumber(pressureHpa);\n  json += \",\\\"wifi_connected\\\":\";\n  json += wifiConnected ? \"true\" : \"false\";\n  json += \",\\\"ip\\\":\\\"\";\n  json += wifiConnected ? WiFi.localIP().toString() : \"\";\n  json += \"\\\",\\\"error\\\":\\\"\";\n  json += sensorError;\n  json += \"\\\"}\";\n  return json;\n}\n\nconst char DASHBOARD_PAGE[] PROGMEM = R\"HTML(<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>ESP32 Weather</title>\n<style>\nbody{margin:0;background:#0f172a;color:#e2e8f0;font-family:sans-serif}\nmain{max-width:28rem;margin:0 auto;padding:1.25rem}\nh1{font-size:1.35rem}\n.grid{display:grid;gap:.75rem}\n.card{background:#1e293b;border-radius:12px;padding:1rem}\n.label{color:#94a3b8;font-size:.85rem}\n.value{font-size:2rem;margin-top:.25rem}\n.error{background:#7f1d1d;border-radius:12px;padding:.75rem 1rem}\n</style>\n</head>\n<body>\n<main>\n<h1>ESP32 Wi-Fi Weather Station</h1>\n<p id=\"status\">Waiting for readings.</p>\n<p id=\"error\" class=\"error\" hidden></p>\n<div class=\"grid\">\n<section class=\"card\"><div class=\"label\">Temperature</div><div id=\"temperature\" class=\"value\">-</div></section>\n<section class=\"card\"><div class=\"label\">Humidity</div><div id=\"humidity\" class=\"value\">-</div></section>\n<section class=\"card\"><div class=\"label\">Pressure</div><div id=\"pressure\" class=\"value\">-</div></section>\n</div>\n</main>\n<script>\nfunction show(id, text){document.getElementById(id).textContent = text;}\nasync function refresh(){\n  var status = document.getElementById(\"status\");\n  var error = document.getElementById(\"error\");\n  try {\n    var response = await fetch(\"/readings\");\n    if (!response.ok) { throw new Error(\"request failed\"); }\n    var data = await response.json();\n    status.textContent = data.wifi_connected ? \"Connected at \" + data.ip : \"Wi-Fi disconnected\";\n    if (data.ok) {\n      error.hidden = true;\n      show(\"temperature\", Number(data.temperature_c).toFixed(1) + \" C\");\n      show(\"humidity\", Number(data.humidity_percent).toFixed(1) + \" %\");\n      show(\"pressure\", Number(data.pressure_hpa).toFixed(1) + \" hPa\");\n    } else {\n      error.hidden = false;\n      error.textContent = data.error || \"Sensor reading unavailable\";\n      show(\"temperature\", \"-\");\n      show(\"humidity\", \"-\");\n      show(\"pressure\", \"-\");\n    }\n  } catch (err) {\n    status.textContent = \"Dashboard not updating\";\n    error.hidden = false;\n    error.textContent = \"This browser could not read /readings. Use the ESP32 IP on the same Wi-Fi network.\";\n  }\n}\nrefresh();\nsetInterval(refresh, 2000);\n</script>\n</body>\n</html>)HTML\";\n\nvoid handleRoot() {\n  server.send(200, \"text/html\", DASHBOARD_PAGE);\n}\n\nvoid handleReadings() {\n  server.send(200, \"application/json\", readingsJson());\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  delay(500);\n  Serial.println();\n  Serial.println(\"ESP32 Wi-Fi weather station\");\n\n  Wire.begin(I2C_SDA, I2C_SCL);\n  sensorReady = bme.begin(BME280_I2C_ADDRESS);\n  if (sensorReady) {\n    Serial.println(\"BME280 ready at 0x77.\");\n  } else {\n    sensorError = \"BME280 was not found at address 0x77.\";\n    Serial.println(sensorError);\n    Serial.println(\"Leave SDO unconnected for 0x77. A wire from SDO to GND selects 0x76, which this sketch does not use.\");\n  }\n\n  WiFi.mode(WIFI_STA);\n  connectWifi();\n\n  server.on(\"/\", HTTP_GET, handleRoot);\n  server.on(\"/readings\", HTTP_GET, handleReadings);\n  server.begin();\n  Serial.println(\"HTTP server started on port 80.\");\n}\n\nvoid loop() {\n  bool wifiConnected = WiFi.status() == WL_CONNECTED;\n  if (!wifiConnected) {\n    wifiWasConnected = false;\n    connectWifi();\n  } else if (!wifiWasConnected) {\n    wifiWasConnected = true;\n    Serial.print(\"Wi-Fi connected. IP address: \");\n    Serial.println(WiFi.localIP());\n  }\n\n  server.handleClient();\n\n  unsigned long now = millis();\n  if (now - lastSensorReadMs >= SENSOR_INTERVAL_MS) {\n    lastSensorReadMs = now;\n    readSensor();\n    if (sensorError.length() == 0) {\n      Serial.print(\"Temperature C: \");\n      Serial.print(temperatureC, 1);\n      Serial.print(\"  Humidity %: \");\n      Serial.print(humidityPercent, 1);\n      Serial.print(\"  Pressure hPa: \");\n      Serial.println(pressureHpa, 1);\n    } else {\n      Serial.println(sensorError);\n    }\n  }\n}\n"},{"type":"text","heading":"Upload","body":"Select everything already in the sketch and replace it with the complete program above. Do not append it under an excerpt. Change YOUR_WIFI_NAME and YOUR_WIFI_PASSWORD to your SSID and password. Click Upload. Wait until the IDE prints “Hard resetting via RTS pin...” or the equivalent done message. Then open the Serial Monitor at 115200 baud. Do not change IO21, IO22, or 0x77 unless you also change the wiring."},{"type":"expected","heading":"What you should observe","body":"The IDE finishes the upload without a port error. The Serial Monitor then prints “ESP32 Wi-Fi weather station” and either the sensor-ready line or the not-found line."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 19;

update public.project_steps
set
  stage_sort_order = 5,
  stage_title = $physlay$First run$physlay$,
  title = $physlay$Read the Serial Monitor$physlay$,
  description = $physlay$The first lines tell you whether the sensor answered and whether Wi-Fi has been attempted.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"What to do","body":"Leave the USB cable on the computer. Open Tools > Serial Monitor at 115200 baud. Press the EN button once if you want a clean restart. Watch the first five seconds."},{"type":"expected","heading":"A healthy start","body":"You should see “ESP32 Wi-Fi weather station”, then “BME280 ready at 0x77.”, then “Connecting to Wi-Fi...”, then “HTTP server started on port 80.” When the network accepts the board, the next line is “Wi-Fi connected. IP address:” followed by a number. After that, temperature, humidity, and pressure print about every two seconds."},{"type":"troubleshooting","heading":"If the text is wrong","items":[{"problem":"The monitor shows symbols instead of words","solution":"Set the baud rate to 115200. The sketch does not use 9600."},{"problem":"Nothing is printed","solution":"Confirm the port is the DevKit port and that the upload finished. Press EN once."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 20;

update public.project_steps
set
  stage_sort_order = 5,
  stage_title = $physlay$First run$physlay$,
  title = $physlay$Find the ESP32 IP address$physlay$,
  description = $physlay$The address is printed only after Wi-Fi connects. The dashboard uses that address.$physlay$,
  tip = $physlay$Write the address down. It can change if the router hands out a new lease later.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What to look for","body":"Find the line “Wi-Fi connected. IP address:”. The four numbers after it, such as 192.168.1.42, are the local address. The sketch also puts that address in the JSON field ip. If the monitor keeps printing “Connecting to Wi-Fi...” every five seconds, the join has not succeeded and there is no page to open yet."},{"type":"expected","heading":"Expected result","body":"One IPv4 address is printed, and it stays stable across the next sensor lines. If it is 192.168.1.42, the dashboard URL is http://192.168.1.42. Use the numbers from your own Serial Monitor."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 21;

update public.project_steps
set
  stage_sort_order = 5,
  stage_title = $physlay$First run$physlay$,
  title = $physlay$Confirm the sensor readings$physlay$,
  description = $physlay$Temperature, humidity, and pressure should be plausible for the room before you trust the web page.$physlay$,
  tip = $physlay$Breathing gently across the sensor should move humidity. Do not cover the board so tightly that it overheats.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What to do","body":"Read several Serial lines. Temperature is printed in C, humidity in %, and pressure in hPa. Compare the temperature with the room and the pressure with a local weather report. The report will not match to the last digit; it should be in the same neighbourhood, often near 1000 hPa at low altitude. Then breathe across the sensor and watch humidity."},{"type":"expected","heading":"Expected result","body":"The three numbers keep updating. Humidity moves when you breathe on the sensor. Temperature does not jump by tens of degrees. If the monitor says “BME280 returned an invalid reading.” or the not-found message, fix the sensor before opening the dashboard."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 22;

update public.project_steps
set
  stage_sort_order = 6,
  stage_title = $physlay$Dashboard$physlay$,
  title = $physlay$Open the web interface$physlay$,
  description = $physlay$Use the IP address from the Serial Monitor. Do not search for the board on the public internet.$physlay$,
  tip = $physlay$Include http:// if the browser tries to search for the numbers instead of opening them.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What to do","body":"On a phone or computer that can reach the ESP32, open http:// and the IP address from the Serial Monitor, for example http://192.168.1.42. Include http:// so the browser does not search for the numbers. The ESP32 returns the dashboard for /. Leave that tab open. The page does not need an internet connection. It does need a path across your local network. A guest network, or a router setting called client isolation or AP isolation, can put two devices on the same SSID and still block this page."},{"type":"expected","heading":"What you should see","body":"The title is “ESP32 Wi-Fi Weather Station”. A status line says “Connected at” and the IP address. Three cards show temperature, humidity, and pressure. The values change without a manual reload. If the sensor failed, a red error box shows the same message as the Serial Monitor and the cards show a dash."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 23;

update public.project_steps
set
  stage_sort_order = 6,
  stage_title = $physlay$Dashboard$physlay$,
  title = $physlay$Understand each measurement$physlay$,
  description = $physlay$The page uses the same units as the Serial Monitor.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"The three cards","body":"Temperature is degrees Celsius from readTemperature(). Humidity is relative humidity in percent from readHumidity(). Pressure is hectopascals, which is the library’s pascal reading divided by 100. The status line is the Wi-Fi state, not a weather forecast. There is no outdoor temperature, rainfall, or wind in this project."},{"type":"text","heading":"Automatic updates","body":"The page calls /readings every 2000 ms, which is the same SENSOR_INTERVAL_MS the sketch uses to take a new sample. You should see the numbers change, or the error box appear, without pressing reload. You can also open http://192.168.1.42/readings, with your own address, to see the JSON document. The status line says “Connected at” and the IP when that JSON has wifi_connected set to true."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 24;

update public.project_steps
set
  stage_sort_order = 6,
  stage_title = $physlay$Dashboard$physlay$,
  title = $physlay$Use the page on a phone and a computer$physlay$,
  description = $physlay$Any browser on the same local network can open the station. A device on mobile data cannot.$physlay$,
  tip = $physlay$If the phone is on cellular data, join the same Wi-Fi network as the ESP32 first.$physlay$,
  blocks = $physlay$[{"type":"text","heading":"What to do","body":"Open the same http:// address on a second device that is on the main Wi-Fi network, not on mobile data and not on a guest network. The page layout is a single column with large type so it fits a phone width. Both devices should show the same reading within one refresh. Leave the router running. Unplugging it does not make the open page display “Wi-Fi disconnected”; the browser loses /readings and shows “Dashboard not updating”."},{"type":"expected","heading":"Expected result","body":"Both browsers show the dashboard. The status line includes the IP address while Wi-Fi is connected. Closing the Serial Monitor does not stop the page, because the page is served by the ESP32, not by the Arduino IDE."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 25;

update public.project_steps
set
  stage_sort_order = 7,
  stage_title = $physlay$Troubleshooting$physlay$,
  title = $physlay$The ESP32 is not detected or the upload fails$physlay$,
  description = $physlay$Fix the cable, the port, and the boot button before you change the circuit.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"troubleshooting","heading":"Board and upload","items":[{"problem":"The ESP32 never appears as a port","solution":"Use a USB-A to Micro-B data cable directly into the computer, select Tools > Port again, and confirm the power LED is on. A charge-only cable can light the LED and still provide no serial port. The DevKitC V4 guide names a USB-to-UART bridge and does not name a Windows driver in that component table. Read the chip beside the USB socket. Install the Silicon Labs CP210x VCP driver when the chip says CP2102 or CP2102N. Install a WCH CH340 driver only when the chip says CH340."},{"problem":"Upload times out or cannot connect","solution":"Confirm the board is ESP32 Dev Module and the port is the one that disappears when you unplug the cable. Hold Boot, tap EN, release Boot, and upload again. That is the DevKitC V4 firmware-download sequence."},{"problem":"The IDE cannot find WiFi.h or WebServer.h","solution":"The ESP32 board package is not selected or not installed. Install the esp32 package from the stable Espressif boards URL and choose ESP32 Dev Module."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 26;

update public.project_steps
set
  stage_sort_order = 7,
  stage_title = $physlay$Troubleshooting$physlay$,
  title = $physlay$The sensor, Wi-Fi, or dashboard fails$physlay$,
  description = $physlay$The Serial line names the fault. Match it to the wiring or the network before rewriting the sketch.$physlay$,
  tip = $physlay$Adafruit notes that intermittent I2C on the original non-STEMMA BME280 can be improved by jumpering CS to Vin. Try that only after the four main wires are correct.$physlay$,
  blocks = $physlay$[{"type":"troubleshooting","heading":"Sensor, network, and page","items":[{"problem":"Serial says the BME280 was not found at 0x77","solution":"Check red on the 3V3 rail, black on GND, blue on IO21, and yellow on IO22. Leave SDO open and do not solder the ADDR jumper. Either of those selects 0x76, and this sketch only calls begin(0x77). Do not edit the address to force a match unless the wiring steps change too. Confirm the board is a BME280 with a STEMMA QT socket, not a BMP280."},{"problem":"Serial says the BME280 returned an invalid reading","solution":"Power and ground are probably present because the chip answered begin(), but a later read failed. Reseat SCK and SDI, keep the wires short, and press EN to restart."},{"problem":"The monitor repeats “Connecting to Wi-Fi...”","solution":"Check the SSID and password, including capitals. The DevKit needs a 2.4 GHz network. The computer’s serial cable does not join Wi-Fi for the board; the board joins by itself."},{"problem":"The browser cannot open the IP address","solution":"Use http:// and the address from the latest “Wi-Fi connected” line, for example http://192.168.1.42. The phone or computer must be able to reach the ESP32. Mobile data cannot. A guest network or client isolation can block it even when both devices show the same Wi-Fi name. Use the main network. Internet access is not required."},{"problem":"The page stays on “Dashboard not updating”","solution":"The HTML loaded, then a later /readings request failed. That is the browser losing contact with the ESP32, not a reading that says Wi-Fi disconnected. Reload once. If Serial has stopped printing, press EN. If Serial still prints an IP address, confirm the browser is on the same local network and is not isolated from other devices."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 27;

update public.project_steps
set
  stage_sort_order = 8,
  stage_title = $physlay$Understanding and extending the project$physlay$,
  title = $physlay$How this I2C link works$physlay$,
  description = $physlay$Two wires and one address are enough because the ESP32 is the only master.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Clock and data","body":"I2C uses SCL for the clock and SDA for the data. On this board those pins are IO22 and IO21, which the cable marks yellow and blue. The ESP32 generates the clock and talks to the address in bme.begin. The BME280 does not send readings until that address is used. Arduino-ESP32 notes that SDA and SCL need pull-ups. Adafruit’s I2C wiring for this breakout does not add a separate resistor, and this project does not add one either. The resistor value on the PCB was not measured here."},{"type":"text","heading":"Why BMP280 is a different part","body":"The BME280 measures humidity as well as pressure and temperature. A BMP280 does not provide that humidity reading, so it cannot fill this dashboard even if it shares a similar package. Solderi keeps the two parts as different catalogue rows, and this project does not approve the BMP280 as a substitute."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 28;

update public.project_steps
set
  stage_sort_order = 8,
  stage_title = $physlay$Understanding and extending the project$physlay$,
  title = $physlay$How the ESP32 hosts the page$physlay$,
  description = $physlay$The board is a small web server on your LAN. Your browser is the client.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Address and routes","body":"After WiFi.begin succeeds, the router gives the ESP32 an address. server.begin() listens on port 80. A browser request for / receives the HTML. The script inside that HTML requests /readings. handleReadings sends the latest sample as JSON. The sketch updates that sample on SENSOR_INTERVAL_MS without waiting inside a blocking Wi-Fi loop."},{"type":"text","heading":"What is deliberately absent","body":"There is no API key, no account, and no external weather service. If your internet connection drops but the ESP32 and the browser can still reach each other through the local router, the page can still load. If the ESP32 drops off Wi-Fi, connectWifi() tries again every five seconds and Serial prints “Connecting to Wi-Fi...”. The open browser then fails its next /readings request and shows “Dashboard not updating”. It does not receive a fresh status line from a board it can no longer reach."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 29;

update public.project_steps
set
  stage_sort_order = 8,
  stage_title = $physlay$Understanding and extending the project$physlay$,
  title = $physlay$Ideas that are not part of this build$physlay$,
  description = $physlay$These extensions need their own wiring or code review. They are not already supported.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Possible later work","body":"A second sensor, an outdoor enclosure, a display, or a cloud upload would change the BOM, the power budget, or the firmware. Switching SDO to ground, or closing the ADDR jumper, would require changing BME280_I2C_ADDRESS to 0x76 and saying so in the wiring steps. None of that is included here. The working station is the DevKitC V4, the STEMMA QT BME280, the six electrical connections, the sketch you uploaded, and the local dashboard."},{"type":"expected","heading":"What you have now","body":"An ESP32-DevKitC V4 reads an Adafruit BME280 at 0x77 on IO21 and IO22, joins your Wi-Fi, and shows temperature, humidity, and pressure in a browser that can reach that board."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 30;

update public.project_steps
set
  stage_sort_order = 9,
  stage_title = $physlay$Final check$physlay$,
  title = $physlay$Check the finished station$physlay$,
  description = $physlay$Use this list before you treat the build as finished. It matches the learning objectives.$physlay$,
  tip = $physlay$A ticked box means you saw that result. It does not mean this repository tested your board.$physlay$,
  blocks = $physlay$[{"type":"test","heading":"Hardware","body":"The board is an ESP32-DevKitC V4 with male headers and a Micro-USB socket. The sensor is an Adafruit BME280 with a STEMMA QT cable, and no header was soldered. Four male-to-female jumpers land on 3V3, GND, IO21, and IO22. Red and black share the 3V3 and GND rails. Blue shares IO21. Yellow shares IO22. Only one power source is connected."},{"type":"test","heading":"Firmware and Serial Monitor","body":"The uploaded file is the complete sketch, with your SSID and password in place of the placeholders. At 115200 baud, Serial prints “BME280 ready at 0x77.” and then “Wi-Fi connected. IP address:” plus an address. Temperature, humidity, and pressure follow about every two seconds. A not-found line or a repeating “Connecting to Wi-Fi...” line means that part is not finished."},{"type":"test","heading":"Dashboard","body":"On the main Wi-Fi network, http:// and that address, for example http://192.168.1.42, shows “Connected at”, temperature in C, humidity in %, and pressure in hPa. The numbers move without a manual reload. The page still loads if the wider internet is down, as long as the ESP32 and the browser can reach each other. A guest or isolated network may fail this check even though both devices joined Wi-Fi."},{"type":"expected","heading":"What this check does not prove","body":"This repository has not run the sketch on a physical ESP32, and the workbench photograph is still not in the app. Compare your Serial Monitor and browser with the lines above. If they differ, use the troubleshooting steps rather than treating the page as already verified."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '23')
  and sort_order = 31;

update public.projects set is_published = false where slug = '23';

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Introduction$physlay$,
  title = $physlay$Build a phone-controlled colour light$physlay$,
  description = $physlay$One RGB LED follows the colour and brightness a phone sends.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"image","imageKey":"esp32BleRgb","caption":"The workbench photograph is not in the app yet. The wiring diagram is the connection reference."},{"type":"text","heading":"What you are building","body":"An ESP32 DevKit, three small transistors, and one RGB LED on a breadboard. The phone is the colour picker. The board does the switching."},{"type":"text","heading":"What it will do","body":"After you upload the sketch, the LED comes on red at a low brightness and the board advertises the name Solderi RGB. From the phone you can turn that light orange, purple, white, or off, and you can make it brighter or dimmer."},{"type":"text","heading":"What you will learn","body":"How a breadboard row connects parts, why each colour needs a transistor and two resistors, and how a phone writes a colour over Bluetooth Low Energy. Bluetooth Low Energy, often called BLE, is the short-range radio this project uses. It is a different system from the classic Bluetooth link a speaker uses."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 0;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $physlay$Introduction$physlay$,
  title = $physlay$Follow one colour from the phone to the LED$physlay$,
  description = $physlay$The phone sends text. The ESP32 switches current from the 5 V pin.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Four parts, four jobs","body":"The phone writes a colour such as 255,80,0. The ESP32 receives that text and sets three PWM outputs. PWM means the pin is switching on and off very quickly. A higher duty cycle means the pin stays on for more of each cycle, so that colour looks brighter. Each output drives one PN2222A transistor. The transistor connects that colour of the LED to ground. The LED itself takes its current from the DevKit 5 V pin, through a 220 Ω resistor."},{"type":"text","heading":"Why the transistor is there","body":"This LED is common anode: the shared pin is the positive side. A 3.3 V GPIO cannot light the green or blue chip directly, because those chips need more voltage than the pin can provide. The transistor lets the 5 V pin supply the LED while the GPIO only asks the transistor to turn on."},{"type":"warning","body":"Power the DevKit from USB only. With USB plugged in, the 5 V pin is an output, about 4.7 V after the board’s diode. Do not connect another supply to 5 V or 3.3 V at the same time. Do not connect a GPIO pin to 5 V or straight to an LED cathode."},{"type":"tip","body":"Use a USB port close to 5 V. On a weak port the green and blue chips can stay dark even when the wiring is right, because their forward voltage is already about 3.3 V and can be as high as 4.0 V and 4.1 V."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 1;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Hardware preparation$physlay$,
  title = $physlay$Set the parts on the desk$physlay$,
  description = $physlay$Five male-to-female wires reach the DevKit. Four more wires reach the power rails.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"components","heading":"Required parts","items":[{"id":"esp32","name":"ESP32 DevKit","illustrationId":"esp32","owned":false,"quantity":1},{"id":"rgb-led-ca","name":"Common-anode RGB LED","illustrationId":"led","owned":false,"quantity":1},{"id":"pn2222a","name":"PN2222A transistor","illustrationId":"generic-module","owned":false,"quantity":3},{"id":"resistor-220","name":"220 Î© resistor","illustrationId":"resistor-band-220","owned":false,"quantity":3},{"id":"resistor-1k","name":"1 kÎ© resistor","illustrationId":"resistor-band-1k","owned":false,"quantity":3},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-male-female","name":"Male-to-female jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":5},{"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"text","heading":"Count the wires before you start","body":"The DevKit sits beside the board. Its pins do not plug into the breadboard. Take five male-to-female wires for 5 V, GND, GPIO25, GPIO26, and GPIO27. The jumper-wire line is one pack. Take six male-to-male wires from it: three emitters, the LED anode, and one bridge on each of the + and − rails so the left and right rails are joined. Component leads do not reach a rail and a row at the same time."},{"type":"text","body":"You also need a phone with Bluetooth Low Energy and the free app nRF Connect for Mobile, from Nordic Semiconductor. The phone is not a line on this parts list."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 2;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Hardware preparation$physlay$,
  title = $physlay$Confirm the LED is common anode$physlay$,
  description = $physlay$Pin 2 is the common anode. Pin 1 is red, pin 3 is blue, and pin 4 is green.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Find the leads","body":"Hold the Kingbright WP154A4SEJ3VBDZGW/CA with the dome up. One side of the rim has a flat. The lead nearest that flat is pin 1, the red cathode. The next lead, pin 2, is the longest and is the common anode. Pin 3 is the blue cathode. Pin 4 is the green cathode. All four leads must be spread to neighbouring breadboard rows. Make the first bend at least 3 mm below the lens."},{"type":"text","heading":"The datasheet detail","body":"Kingbright drawing DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, shows that order and shows the anode lead at least 2.5 mm longer. At 20 mA the typical forward voltage is 2.2 V red, 3.3 V blue, and 3.3 V green. The maximums are 2.8 V, 4.0 V, and 4.1 V. The absolute maximum current is 30 mA red, 30 mA blue, and 25 mA green. The leads are spaced about 1.27 mm, which is half a breadboard pitch, so they do not drop into four holes until you spread them."},{"type":"warning","body":"A common-cathode LED will not work in this circuit. The Young Sun YSL-R596AR3G4B5C-C10 joins its anodes at pin 2, but its drawing does not name the colour of each cathode, so this project does not use it."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 3;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $physlay$Hardware preparation$physlay$,
  title = $physlay$Know the transistors and the resistors$physlay$,
  description = $physlay$Each colour uses one PN2222A, one 1 kΩ resistor, and one 220 Ω resistor.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Which way the transistor faces","body":"Use an onsemi PN2222ABU. The flat face is marked PN2222A. With that flat toward you and the leads pointing down, the leads are emitter, base, collector from left to right. On this breadboard the flat faces the right edge, so the top lead is the emitter, the middle lead is the base, and the bottom lead is the collector. Spread those leads to three neighbouring rows. A metal-can 2N2222, or a part marked only 2N2222, can use a different pin order."},{"type":"text","heading":"Why each resistor is there","body":"The 220 Ω resistor sits between the transistor and one LED cathode. It limits the LED current. The 1 kΩ resistor sits between a GPIO pin and the transistor base. It limits the current the ESP32 pin has to supply. Without the 220 Ω resistor the LED can draw more current than it is rated for. Without the 1 kΩ resistor the GPIO pin can be asked for far too much base current."},{"type":"text","heading":"The numbers","body":"From a USB port near 5 V, the DevKit 5 V pin is about 4.7 V. Allow about 0.2 V across the transistor. Red at its typical 2.2 V then has about (4.7 − 2.2 − 0.2) / 220 = 10.5 mA. From a 5.0 V pin that is about 12 mA, still under the 30 mA red maximum. Blue and green at a typical 3.3 V have about 5.5 mA. A blue chip at its 4.0 V maximum has about 2.3 mA, and a green chip at 4.1 V has about 1.8 mA, so those colours can look dim. A weak USB port near 4.4 V can leave a high-forward-voltage green or blue chip dark. Each base takes about (3.3 − 0.7) / 1000 = 2.6 mA, about 8 mA for all three pins."},{"type":"tip","body":"A 220 Ω resistor reads red, red, brown, gold. A 1 kΩ resistor reads brown, black, red, gold. The parts list draws those bands. Match three of each before you insert them."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 4;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Learn the breadboard before you insert a part$physlay$,
  description = $physlay$A row connects the holes in it. A different row is a different wire.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Terminal rows","body":"The middle of the board is split by a gap. In one half, holes a, b, c, d, and e of the same row number are connected to each other. Holes f, g, h, i, and j of that row are a separate connection. The gap is not a wire. This whole build stays in columns a–e of the top half."},{"type":"text","heading":"Power rails","body":"The long red and blue strips along each edge are the power rails. Holes in one red strip connect along that strip until a break in the coloured line. The left red rail is not connected to the right red rail until you add a wire. This build uses rows 1–15, above the usual mid-board break. Rows 16 and 17 are shown so you can see that break and stay above it."},{"type":"text","heading":"Sharing a row","body":"Two leads connect when they sit in the same numbered row on the same side of the gap. They stay separate when they sit in different rows. A resistor body may pass over a row it must not join. Only the holes that hold its leads are connected."},{"type":"warning","body":"Do not put two transistor leads in one row, and do not put two LED leads in one row. That shorts those leads together."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 5;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Seat every part on these rows$physlay$,
  description = $physlay$Use rows 1–15. The physical diagram names the same holes.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"The LED","body":"Flat side toward row 1, on the right half. Spread the leads into column f: pin 1 red in f6, pin 2 anode in f7, pin 3 blue in f8, and pin 4 green in f9."},{"type":"text","heading":"Red channel, left half","body":"Transistor flat to the right: emitter c4, base c5, collector c6. The 1 kΩ leads go in b1 and b5. The 220 Ω leads go in d6 and h6. h6 shares the right-hand row with f6."},{"type":"text","heading":"Green channel, left half","body":"Emitter c13, base c14, collector c15. The 1 kΩ leads go in b10 and b14. The 220 Ω leads go in d15 and h9. h9 shares the right-hand row with f9."},{"type":"text","heading":"Blue channel, right half","body":"Emitter h13, base h14, collector h15, flat still to the right. The 1 kΩ leads go in i10 and i14. The 220 Ω leads go in i15 and j8. j8 shares row 8 with f8. The blue transistor body sits toward the centre gap, so the 220 Ω stays on columns i and j."},{"type":"wiring","heading":"Where the parts sit","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"Each transistor has its three leads in three neighbouring holes of one column, flat face to the right, emitter nearest the top. The LED leads are f6, f7, f8, and f9, with the longest lead in f7. No USB cable is plugged in yet."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 6;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Connect 5 V and ground$physlay$,
  description = $physlay$Two male-to-female wires feed the rails. Four male-to-male wires reach the parts.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"Put the DevKit beside the breadboard. With male-to-female wires, join DevKit 5 V to the left + rail at row 2, and DevKit GND to the left − rail at row 2. With male-to-male wires, bridge left + row 1 to right + row 1, and left − row 1 to right − row 1. Join j7 to the right + rail at row 7. Join a4 and a13 to the left − rail, and j13 to the right − rail. Leave USB unplugged."},{"type":"wiring","heading":"Supply and ground","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"}]},{"type":"connections","heading":"These six links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"}]},{"type":"test","heading":"Checkpoint","body":"Both rail bridges and the 5 V and GND wires are on rows 1–15, above the rail break. j7 is the only LED lead row tied to +. a4, a13, and j13 are the emitter rows tied to −. The GPIO wires are not in yet. USB is still unplugged."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 7;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Build the red channel$physlay$,
  description = $physlay$GPIO25 switches the red cathode through row 10.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"Join DevKit GPIO25 to a1 with a male-to-female wire. b1 and b5 hold the red 1 kΩ. c5 is the base. d6 and h6 hold the red 220 Ω, and f6 is LED pin 1."},{"type":"wiring","heading":"Red channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"}]},{"type":"connections","heading":"Red links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO25 is in a1, the 1 kΩ in b1 and b5, and the base in c5. The collector is c6 and the 220 Ω meets it at d6 and the LED at h6. No two of those leads share one hole."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 8;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Build the green channel$physlay$,
  description = $physlay$GPIO26 switches the green cathode through row 13.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"Join GPIO26 to a10. The green 1 kΩ is in b10 and b14, the base is c14, and the 220 Ω runs from d15 to h9 beside LED pin 4 in f9."},{"type":"wiring","heading":"Green channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"}]},{"type":"connections","heading":"Green links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO26 is in a10. The 1 kΩ lead is not in c13, c14, or c15. h9 and f9 are the only parts in the green cathode row."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 9;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Build the blue channel$physlay$,
  description = $physlay$GPIO27 switches the blue cathode through row 12.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"Join GPIO27 to j10. The blue 1 kΩ is in i10 and i14, the base is h14, and the 220 Ω runs from i15 to j8 beside LED pin 3 in f8."},{"type":"wiring","heading":"Blue channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"connections","heading":"Blue links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO27 is in j10. The 1 kΩ does not enter column h. f8 and j8 share the blue cathode row. f6, f7, f8, and f9 still hold one LED lead each."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 10;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $physlay$Wiring$physlay$,
  title = $physlay$Check the whole circuit, then plug in USB$physlay$,
  description = $physlay$This is the only full connection list. Use it once, before power.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"connections","heading":"All 18 connections","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}],"summary":"Five male-to-female wires leave the DevKit. Six male-to-male wires join rails and emitters. Every other join is two leads in the same five-hole row."},{"type":"wiring","heading":"Finished arrangement","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Before USB","body":"LED pin 2 is the only lead on the red rail. The three emitters are the only transistor leads on the blue rail. No GPIO wire touches a rail. No two LED leads share a row. Then plug the data USB cable into the DevKit and the computer. Do not add another supply."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 11;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Development environment$physlay$,
  title = $physlay$Install the ESP32 board package$physlay$,
  description = $physlay$The Arduino IDE needs the Espressif package before it can see this board.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"Install the Arduino IDE. Open File, Preferences, and add this URL to Additional boards manager URLs: https://espressif.github.io/arduino-esp32/package_esp32_index.json. Open Tools, Board, Boards Manager, search for esp32, and install the package Espressif Systems. This sketch uses Arduino-ESP32 3.x calls such as ledcAttach."},{"type":"tip","body":"If the board list has no ESP32 Dev Module after the install, close the IDE and open it again."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 12;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $physlay$Development environment$physlay$,
  title = $physlay$Select the board and the port$physlay$,
  description = $physlay$The sketch talks to the computer at 115200 baud.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"Connect the data cable. In Tools, set Board to ESP32 Dev Module. Set Port to the new serial port. Set Upload Speed to 115200. Open Serial Monitor and set its speed to 115200 as well. A charge-only cable can power the board and still leave the port missing."},{"type":"expected","heading":"If the port is missing","body":"Install the USB-to-UART driver for the chip on your DevKit, try another USB socket, and try a cable you know can carry data. The port should appear in the Tools menu while the board is plugged in."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 13;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Firmware$physlay$,
  title = $physlay$See how PWM sets the brightness$physlay$,
  description = $physlay$GPIO25, GPIO26, and GPIO27 were chosen because they can output PWM.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"Why these pins","body":"GPIO25 drives red, GPIO26 drives green, and GPIO27 drives blue. They are ordinary output pins. They are not the strapping pins 0, 2, 12, or 15, and they are not the input-only pins 34–39. A high duty cycle turns the matching transistor on for longer, so that colour gets brighter."},{"type":"text","body":"The next block is an excerpt from the sketch. It shows how brightness scales a colour. Do not upload this fragment."},{"type":"code","language":"cpp","filename":"excerpt-brightness.ino","code":"int channelDuty(int channel) {\n  return (int)(((long)channel * (long)brightnessPercent) / 100L);\n}\n\nvoid applyColour() {\n  ledcWrite(RED_PIN, channelDuty(redValue));\n  ledcWrite(GREEN_PIN, channelDuty(greenValue));\n  ledcWrite(BLUE_PIN, channelDuty(blueValue));"},{"type":"text","heading":"What that excerpt does","body":"channelDuty multiplies one colour, 0–255, by the brightness percent and divides by 100. At 30 percent, red 255 becomes duty 76. ledcWrite sends that duty to the pin. Zero is off. 255 is fully on for that colour."},{"type":"text","body":"This second excerpt is the setup that attaches those pins. Do not upload it on its own."},{"type":"code","language":"cpp","filename":"excerpt-pwm-setup.ino","code":"if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {\n    Serial.println(\"PWM setup failed.\");\n  }\n  applyColour();"},{"type":"text","heading":"What ledcAttach does","body":"ledcAttach(pin, 5000, 8) gives that pin a PWM signal at 5000 Hz with 8 bits of duty, so the duty runs from 0 to 255. The same call is made for all three pins. applyColour then writes the power-on colour, which is red at 30 percent."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 14;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Firmware$physlay$,
  title = $physlay$Watch the write 255,80,0 travel through the sketch$physlay$,
  description = $physlay$A characteristic is one value the phone can read or write.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","heading":"The path of one colour","body":"The phone sends the text 255,80,0 to the colour characteristic. The ESP32 callback copies that text, checks it, stores red 255, green 80, and blue 0, then calls applyColour. The three PWM duties change, and the LED moves toward orange. A service is the group that holds the colour characteristic and the brightness characteristic. The board advertises that service under the name Solderi RGB so the phone can find it."},{"type":"text","body":"Both blocks below are excerpts. The complete sketch is in the next step."},{"type":"code","language":"cpp","filename":"excerpt-advertise.ino","code":"BLEDevice::init(DEVICE_NAME);\n  BLEServer *server = BLEDevice::createServer();\n  server->setCallbacks(new ServerCallbacks());\n  BLEService *service = server->createService(SERVICE_UUID);\n\n  BLECharacteristic *colorCharacteristic = service->createCharacteristic(\n    COLOR_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  colorCharacteristic->setCallbacks(new ColorCallbacks());\n  colorCharacteristic->setValue(colourText());\n\n  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(\n    BRIGHTNESS_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());\n  brightnessCharacteristic->setValue(brightnessText());\n\n  service->start();\n\n  BLEAdvertising *advertising = BLEDevice::getAdvertising();\n  advertising->addServiceUUID(SERVICE_UUID);\n  advertising->setScanResponse(true);\n  BLEDevice::startAdvertising();\n  Serial.println(\"Advertising as Solderi RGB.\");"},{"type":"code","language":"cpp","filename":"excerpt-colour-write.ino","code":"class ColorCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);\n    if (!accepted) {\n      characteristic->setValue(colourText());\n      Serial.print(\"Colour rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(colourText());\n    Serial.print(\"Colour \");\n    Serial.println(colourText());"},{"type":"text","heading":"Rejected writes and a disconnect","body":"A colour must be three numbers from 0 to 255, separated by commas, with no spaces. Brightness must be a whole number from 0 to 100. Anything else, including a raw three-byte colour, is rejected. The callback writes the last accepted text back into the characteristic, because the ESP32 stack stores the incoming bytes before the callback runs. When the phone disconnects, the sketch prints a line and starts advertising again. The last colour stays on the LED."},{"type":"code","language":"cpp","filename":"excerpt-disconnect.ino","code":"void onDisconnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = false;\n    Serial.println(\"Phone disconnected. Advertising again.\");\n    BLEDevice::startAdvertising();"}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 15;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $physlay$Firmware$physlay$,
  title = $physlay$Upload the complete sketch$physlay$,
  description = $physlay$This is the program to copy. The earlier blocks were excerpts.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"Create a sketch, replace its contents with the program below, and click Upload. When it finishes, the Serial Monitor should show the power-on line and then Advertising as Solderi RGB."},{"type":"code","language":"cpp","filename":"esp32-ble-rgb-controller.ino","libraries":["BLE (ESP32 Arduino core)","LEDC (ESP32 Arduino core)"],"code":"/*\n * ESP32 Bluetooth RGB LED Controller\n * Board: ESP32 Dev Module\n * LED: Kingbright WP154A4SEJ3VBDZGW/CA, common-anode\n * Pin 1 red cathode, pin 2 common anode, pin 3 blue cathode, pin 4 green cathode\n * DevKit 5V pin -> pin 2\n * IO25 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 1 red cathode\n * IO26 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 4 green cathode\n * IO27 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 3 blue cathode\n * Emitters and DevKit GND share the ground rail\n * A higher PWM duty turns the transistor on for longer\n * Phone app: nRF Connect for Mobile\n * One write format: UTF-8 text\n * Colour: 255,80,0\n * Brightness: 0, 48, or 100\n * Arduino-ESP32 3.x: ledcAttach, BLECharacteristic::PROPERTY_WRITE\n */\n\n#include <BLEDevice.h>\n#include <BLEServer.h>\n#include <BLEUtils.h>\n\nconst int RED_PIN = 25;\nconst int GREEN_PIN = 26;\nconst int BLUE_PIN = 27;\nconst int PWM_FREQUENCY_HZ = 5000;\nconst int PWM_RESOLUTION_BITS = 8;\nconst size_t MAX_TEXT_BYTES = 16;\n\nconst char *DEVICE_NAME = \"Solderi RGB\";\nconst char *SERVICE_UUID = \"8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24\";\nconst char *COLOR_UUID = \"8c4a2e11-1b6d-4f3a-9e72-5d0c8a1b6e24\";\nconst char *BRIGHTNESS_UUID = \"8c4a2e12-1b6d-4f3a-9e72-5d0c8a1b6e24\";\n\nint redValue = 255;\nint greenValue = 0;\nint blueValue = 0;\nint brightnessPercent = 30;\n\nbool clientConnected = false;\n\nint channelDuty(int channel) {\n  return (int)(((long)channel * (long)brightnessPercent) / 100L);\n}\n\nvoid applyColour() {\n  ledcWrite(RED_PIN, channelDuty(redValue));\n  ledcWrite(GREEN_PIN, channelDuty(greenValue));\n  ledcWrite(BLUE_PIN, channelDuty(blueValue));\n}\n\nbool digitsOnly(const String &text) {\n  if (text.length() == 0) {\n    return false;\n  }\n  for (int i = 0; i < text.length(); i++) {\n    char letter = text.charAt(i);\n    if (letter < '0' || letter > '9') {\n      return false;\n    }\n  }\n  return true;\n}\n\nbool copyTextPayload(const uint8_t *data, size_t length, String &text) {\n  text = \"\";\n  if (data == nullptr || length == 0 || length > MAX_TEXT_BYTES) {\n    return false;\n  }\n  for (size_t i = 0; i < length; i++) {\n    char letter = (char)data[i];\n    bool allowed = (letter >= '0' && letter <= '9') || letter == ',' || letter == ' ';\n    if (!allowed) {\n      return false;\n    }\n    text += letter;\n  }\n  text.trim();\n  return text.length() > 0;\n}\n\nbool parseColourText(const String &text) {\n  if (text.indexOf(',') < 0) {\n    return false;\n  }\n  int first = text.indexOf(',');\n  int second = text.indexOf(',', first + 1);\n  if (first <= 0 || second <= first + 1 || text.indexOf(',', second + 1) >= 0) {\n    return false;\n  }\n\n  String redText = text.substring(0, first);\n  String greenText = text.substring(first + 1, second);\n  String blueText = text.substring(second + 1);\n  redText.trim();\n  greenText.trim();\n  blueText.trim();\n  if (!digitsOnly(redText) || !digitsOnly(greenText) || !digitsOnly(blueText)) {\n    return false;\n  }\n\n  long red = redText.toInt();\n  long green = greenText.toInt();\n  long blue = blueText.toInt();\n  if (red > 255 || green > 255 || blue > 255) {\n    return false;\n  }\n\n  redValue = (int)red;\n  greenValue = (int)green;\n  blueValue = (int)blue;\n  return true;\n}\n\nbool parseBrightnessText(const String &text) {\n  if (text.indexOf(',') >= 0 || !digitsOnly(text)) {\n    return false;\n  }\n  long value = text.toInt();\n  if (value > 100) {\n    return false;\n  }\n  brightnessPercent = (int)value;\n  return true;\n}\n\nString colourText() {\n  return String(redValue) + \",\" + String(greenValue) + \",\" + String(blueValue);\n}\n\nString brightnessText() {\n  return String(brightnessPercent);\n}\n\nclass ServerCallbacks : public BLEServerCallbacks {\n  void onConnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = true;\n    Serial.println(\"Phone connected.\");\n  }\n\n  void onDisconnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = false;\n    Serial.println(\"Phone disconnected. Advertising again.\");\n    BLEDevice::startAdvertising();\n  }\n};\n\nclass ColorCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);\n    if (!accepted) {\n      characteristic->setValue(colourText());\n      Serial.print(\"Colour rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(colourText());\n    Serial.print(\"Colour \");\n    Serial.println(colourText());\n  }\n};\n\nclass BrightnessCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseBrightnessText(text);\n    if (!accepted) {\n      characteristic->setValue(brightnessText());\n      Serial.print(\"Brightness rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(brightnessText());\n    Serial.print(\"Brightness \");\n    Serial.println(brightnessPercent);\n  }\n};\n\nvoid setup() {\n  Serial.begin(115200);\n  delay(300);\n\n  if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {\n    Serial.println(\"PWM setup failed.\");\n  }\n  applyColour();\n\n  Serial.println(\"ESP32 Bluetooth RGB LED controller\");\n  Serial.println(\"Power-on colour is red at 30 percent brightness.\");\n\n  BLEDevice::init(DEVICE_NAME);\n  BLEServer *server = BLEDevice::createServer();\n  server->setCallbacks(new ServerCallbacks());\n  BLEService *service = server->createService(SERVICE_UUID);\n\n  BLECharacteristic *colorCharacteristic = service->createCharacteristic(\n    COLOR_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  colorCharacteristic->setCallbacks(new ColorCallbacks());\n  colorCharacteristic->setValue(colourText());\n\n  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(\n    BRIGHTNESS_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());\n  brightnessCharacteristic->setValue(brightnessText());\n\n  service->start();\n\n  BLEAdvertising *advertising = BLEDevice::getAdvertising();\n  advertising->addServiceUUID(SERVICE_UUID);\n  advertising->setScanResponse(true);\n  BLEDevice::startAdvertising();\n  Serial.println(\"Advertising as Solderi RGB.\");\n}\n\nvoid loop() {\n  delay(200);\n}\n"},{"type":"expected","heading":"After a successful upload","body":"The LED is red at a low brightness. The monitor shows Advertising as Solderi RGB. If upload fails, hold the BOOT button when the IDE says Connecting, then release it."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 16;

update public.project_steps
set
  stage_sort_order = 5,
  stage_title = $physlay$Phone control$physlay$,
  title = $physlay$Find Solderi RGB in nRF Connect$physlay$,
  description = $physlay$Use the Bluetooth Low Energy scanner, not a classic Bluetooth device list.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"Install nRF Connect for Mobile. Turn on the phone’s Bluetooth. Open the app and tap the scanner. Look for the name Solderi RGB and tap Connect. A speaker pairing screen is the wrong place. This board does not appear there, because it is a BLE peripheral."},{"type":"text","heading":"The service, once","body":"After it connects, open the service whose UUID starts with 8c4a2e10. Inside it, the colour characteristic starts with 8c4a2e11 and the brightness characteristic starts with 8c4a2e12. You can match those prefixes. You do not need to retype the full UUID for each write."},{"type":"expected","heading":"When the connection works","body":"nRF Connect shows the service, and the Serial Monitor prints Phone connected. The full service UUID is 8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 17;

update public.project_steps
set
  stage_sort_order = 5,
  stage_title = $physlay$Phone control$physlay$,
  title = $physlay$Write a colour as text$physlay$,
  description = $physlay$The write format is UTF-8 text, three numbers separated by commas.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"On the colour characteristic, choose the write action and set the format to text, or UTF-8. Send 255,80,0. The LED should move from dim red toward orange: full red, some green, no blue. Then send 0,0,255 for blue and 0,255,0 for green. Read the characteristic afterward. It should show the text you sent."},{"type":"text","heading":"If the app asks for hex","body":"Some iOS write fields want the UTF-8 bytes in hexadecimal. 255,80,0 is 32 35 35 2C 38 30 2C 30. 0,0,255 is 30 2C 30 2C 32 35 35. 0,255,0 is 30 2C 32 35 35 2C 30. The characters are still the same text."},{"type":"warning","body":"Do not send the three raw bytes FF 50 00. The sketch rejects that. Send the digits and the commas."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 18;

update public.project_steps
set
  stage_sort_order = 5,
  stage_title = $physlay$Phone control$physlay$,
  title = $physlay$Change brightness, then disconnect and come back$physlay$,
  description = $physlay$Brightness is a second text value, from 0 to 100.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"On the brightness characteristic, write the text 100. The current colour should become brighter. Write 10 and it should become dim. Write 0 and it should go dark. Read the characteristic to confirm the stored number. Then disconnect in nRF Connect. The monitor should print that the phone disconnected and that the board is advertising again. The last colour remains. Connect once more and write 255,0,0 to return to red."},{"type":"text","body":"A brightness of 100 in hex text is 31 30 30. A rejected write, such as 150 or the word high, should leave the LED unchanged, and the monitor should print that the value was rejected."},{"type":"tip","body":"Compare the LED with the Serial Monitor line for the same write. The monitor is the sketch telling you which text it accepted."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 19;

update public.project_steps
set
  stage_sort_order = 6,
  stage_title = $physlay$Troubleshooting$physlay$,
  title = $physlay$Fix the light before you blame the phone$physlay$,
  description = $physlay$Match the symptom, then work down the checks.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"troubleshooting","heading":"The LED itself","items":[{"problem":"The LED stays dark after upload.","solution":"The usual causes are USB not powering the board, the anode off the red rail, or an emitter off the blue rail. Confirm the monitor prints the advertising line, then confirm row 11 is on the same red-rail half as the 5 V jumper and rows 2, 15, and 20 are on the blue rail. You should see a dim red light. If the monitor is alive and the LED is still dark, the LED is reversed or pin 2 is not the lead in row 11."},{"problem":"Only red lights. Green and blue stay off.","solution":"Either those channels are in the wrong rows, or the USB port is too weak for a high forward voltage. Send 0,255,0 and 0,0,255 and read the monitor. If the monitor accepts the colour, move the green 220 Ω lead so it shares row 13 with pin 4, and the blue 220 Ω lead so it shares row 12 with pin 3. Try a different USB port near 5 V. A port that is already sagging can leave a 4.0 V blue chip or a 4.1 V green chip dark."},{"problem":"One colour is stuck on, or two colours light together.","solution":"Two leads are probably in the same row. Check that each transistor uses three separate rows and that the 1 kΩ lead is not in the collector row. Pull that channel’s parts and seat them again. The stuck colour should follow only its own GPIO pin."},{"problem":"The LED is very hot or a resistor smells.","solution":"Unplug USB. A 220 Ω resistor is missing or a cathode is wired straight to ground. Seat the 220 Ω resistor again before you reconnect power. The part should stay cool at the currents in the resistor step."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 20;

update public.project_steps
set
  stage_sort_order = 6,
  stage_title = $physlay$Troubleshooting$physlay$,
  title = $physlay$Fix the phone connection$physlay$,
  description = $physlay$The board has to be advertising before the phone can write.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"troubleshooting","heading":"nRF Connect","items":[{"problem":"Solderi RGB never appears in the scanner.","solution":"The sketch is not running, or the phone is looking at classic Bluetooth devices. Re-upload, set the monitor to 115200, and wait for Advertising as Solderi RGB. In nRF Connect use the BLE scanner and pull to refresh. The name should appear within a few seconds."},{"problem":"The app connects, then the write does nothing.","solution":"The write is on the wrong characteristic, or it is not UTF-8 text. Open the colour characteristic that starts with 8c4a2e11 and send 255,80,0 as text. The monitor should print Colour 255,80,0 and the LED should change. If it prints Colour rejected, the text has a space, a missing comma, or a number outside 0–255."},{"problem":"Upload never finishes.","solution":"The port is wrong or the board never entered the bootloader. Select the port that appears when you plug the board in, lower the upload speed if 115200 fails, and hold BOOT when the IDE says Connecting. A finished upload returns the IDE to a done message and the monitor prints the advertising line."},{"problem":"It worked once, and the phone cannot reconnect.","solution":"Disconnect in nRF Connect, wait for the monitor line that says the board is advertising again, then scan and connect. If that line never appears, press the DevKit reset button and wait for the advertising line before you scan."}]}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 21;

update public.project_steps
set
  stage_sort_order = 7,
  stage_title = $physlay$Final check$physlay$,
  title = $physlay$Walk the finished controller$physlay$,
  description = $physlay$Do these in order and compare the LED with each line.$physlay$,
  tip = null,
  blocks = $physlay$[{"type":"text","body":"The sketch is written to do every line below. Use the troubleshooting steps for any line that does not match. A USB port well under 5 V can still leave green or blue dim or dark after the wiring is correct."},{"type":"expected","heading":"Checklist","body":"The LED flat faces the top and the longest lead is in f7. Each transistor flat faces right, with the emitter in the top lead of that transistor. The + rails feed only the anode row. The − rails meet only the three emitter jumpers. No two leads share one hole. Upload finishes and the monitor prints Advertising as Solderi RGB. nRF Connect connects to that name. 255,0,0 is red, 0,255,0 is green, and 0,0,255 is blue. Brightness 100 is brighter than 10, and 0 is dark. The text 150 is rejected and the LED stays put. Disconnecting prints the advertising line, and a new connection can write 255,80,0."}]$physlay$::jsonb
where project_id = (select id from public.projects where slug = '24')
  and sort_order = 22;

update public.projects set is_published = false where slug = '24';
