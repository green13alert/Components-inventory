-- Beginner walkthrough for slug 24: numbered breadboard rows, four rail jumpers, and the phone steps.
-- Updates steps in place. Deletes the two leftover sort orders. Leaves the project unpublished.

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $rgbwalk$Introduction$rgbwalk$,
  title = $rgbwalk$Build a phone-controlled colour light$rgbwalk$,
  description = $rgbwalk$One RGB LED follows the colour and brightness a phone sends.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"image","imageKey":"esp32BleRgb","caption":"The workbench photograph is not in the app yet. The wiring diagram is the connection reference."},{"type":"text","heading":"What you are building","body":"An ESP32 DevKit, three small transistors, and one RGB LED on a breadboard. The phone is the colour picker. The board does the switching."},{"type":"text","heading":"What it will do","body":"After you upload the sketch, the LED comes on red at a low brightness and the board advertises the name Solderi RGB. From the phone you can turn that light orange, purple, white, or off, and you can make it brighter or dimmer."},{"type":"text","heading":"What you will learn","body":"How a breadboard row connects parts, why each colour needs a transistor and two resistors, and how a phone writes a colour over Bluetooth Low Energy. Bluetooth Low Energy, often called BLE, is the short-range radio this project uses. It is a different system from the classic Bluetooth link a speaker uses."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 0;

update public.project_steps
set
  stage_sort_order = 0,
  stage_title = $rgbwalk$Introduction$rgbwalk$,
  title = $rgbwalk$Follow one colour from the phone to the LED$rgbwalk$,
  description = $rgbwalk$The phone sends text. The ESP32 switches current from the 5 V pin.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","heading":"Four parts, four jobs","body":"The phone writes a colour such as 255,80,0. The ESP32 receives that text and sets three PWM outputs. PWM means the pin is switching on and off very quickly. A higher duty cycle means the pin stays on for more of each cycle, so that colour looks brighter. Each output drives one PN2222A transistor. The transistor connects that colour of the LED to ground. The LED itself takes its current from the DevKit 5 V pin, through a 220 Ω resistor."},{"type":"text","heading":"Why the transistor is there","body":"This LED is common anode: the shared pin is the positive side. A 3.3 V GPIO cannot light the green or blue chip directly, because those chips need more voltage than the pin can provide. The transistor lets the 5 V pin supply the LED while the GPIO only asks the transistor to turn on."},{"type":"warning","body":"Power the DevKit from USB only. With USB plugged in, the 5 V pin is an output, about 4.7 V after the board’s diode. Do not connect another supply to 5 V or 3.3 V at the same time. Do not connect a GPIO pin to 5 V or straight to an LED cathode."},{"type":"tip","body":"Use a USB port close to 5 V. On a weak port the green and blue chips can stay dark even when the wiring is right, because their forward voltage is already about 3.3 V and can be as high as 4.0 V and 4.1 V."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 1;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $rgbwalk$Hardware preparation$rgbwalk$,
  title = $rgbwalk$Set the parts on the desk$rgbwalk$,
  description = $rgbwalk$Five male-to-female wires reach the DevKit. Four more wires reach the power rails.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"components","heading":"Required parts","items":[{"id":"esp32","name":"ESP32 DevKit","illustrationId":"esp32","owned":false,"quantity":1},{"id":"rgb-led-ca","name":"Common-anode RGB LED","illustrationId":"led","owned":false,"quantity":1},{"id":"pn2222a","name":"PN2222A transistor","illustrationId":"generic-module","owned":false,"quantity":3},{"id":"resistor-220","name":"220 Î© resistor","illustrationId":"resistor-band-220","owned":false,"quantity":3},{"id":"resistor-1k","name":"1 kÎ© resistor","illustrationId":"resistor-band-1k","owned":false,"quantity":3},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-male-female","name":"Male-to-female jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":5},{"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"text","heading":"Count the wires before you start","body":"The five male-to-female wires join the DevKit headers to the breadboard: 5 V, GND, GPIO25, GPIO26, and GPIO27. The DevKit sits beside the board. Its pins do not plug into the breadboard. The jumper-wire line is one pack. Take four male-to-male wires from that pack. Those four join the LED anode and the three transistor emitters to the power rails. Component leads cannot reach the rails as well as their own rows."},{"type":"text","body":"You also need a phone with Bluetooth Low Energy and the free app nRF Connect for Mobile, from Nordic Semiconductor. The phone is not a line on this parts list."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 2;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $rgbwalk$Hardware preparation$rgbwalk$,
  title = $rgbwalk$Confirm the LED is common anode$rgbwalk$,
  description = $rgbwalk$Pin 2 is the common anode. Pin 1 is red, pin 3 is blue, and pin 4 is green.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","heading":"Find the leads","body":"Hold the Kingbright WP154A4SEJ3VBDZGW/CA with the dome up. One side of the rim has a flat. The lead nearest that flat is pin 1, the red cathode. The next lead, pin 2, is the longest and is the common anode. Pin 3 is the blue cathode. Pin 4 is the green cathode. All four leads must be spread to neighbouring breadboard rows. Make the first bend at least 3 mm below the lens."},{"type":"text","heading":"The datasheet detail","body":"Kingbright drawing DSAN1168 / 1101031384, Rev V.7A, dated 11/02/2024, shows that order and shows the anode lead at least 2.5 mm longer. At 20 mA the typical forward voltage is 2.2 V red, 3.3 V blue, and 3.3 V green. The maximums are 2.8 V, 4.0 V, and 4.1 V. The absolute maximum current is 30 mA red, 30 mA blue, and 25 mA green. The leads are spaced about 1.27 mm, which is half a breadboard pitch, so they do not drop into four holes until you spread them."},{"type":"warning","body":"A common-cathode LED will not work in this circuit. The Young Sun YSL-R596AR3G4B5C-C10 joins its anodes at pin 2, but its drawing does not name the colour of each cathode, so this project does not use it."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 3;

update public.project_steps
set
  stage_sort_order = 1,
  stage_title = $rgbwalk$Hardware preparation$rgbwalk$,
  title = $rgbwalk$Know the transistors and the resistors$rgbwalk$,
  description = $rgbwalk$Each colour uses one PN2222A, one 1 kΩ resistor, and one 220 Ω resistor.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","heading":"Which way the transistor faces","body":"Use an onsemi PN2222ABU. The flat face is marked PN2222A. With that flat toward you and the leads pointing down, the leads are emitter, base, collector from left to right. On this breadboard the flat faces the right edge, so the top lead is the emitter, the middle lead is the base, and the bottom lead is the collector. Spread those leads to three neighbouring rows. A metal-can 2N2222, or a part marked only 2N2222, can use a different pin order."},{"type":"text","heading":"Why each resistor is there","body":"The 220 Ω resistor sits between the transistor and one LED cathode. It limits the LED current. The 1 kΩ resistor sits between a GPIO pin and the transistor base. It limits the current the ESP32 pin has to supply. Without the 220 Ω resistor the LED can draw more current than it is rated for. Without the 1 kΩ resistor the GPIO pin can be asked for far too much base current."},{"type":"text","heading":"The numbers","body":"From a USB port near 5 V, the DevKit 5 V pin is about 4.7 V. Allow about 0.2 V across the transistor. Red at its typical 2.2 V then has about (4.7 − 2.2 − 0.2) / 220 = 10.5 mA. From a 5.0 V pin that is about 12 mA, still under the 30 mA red maximum. Blue and green at a typical 3.3 V have about 5.5 mA. A blue chip at its 4.0 V maximum has about 2.3 mA, and a green chip at 4.1 V has about 1.8 mA, so those colours can look dim. A weak USB port near 4.4 V can leave a high-forward-voltage green or blue chip dark. Each base takes about (3.3 − 0.7) / 1000 = 2.6 mA, about 8 mA for all three pins."},{"type":"tip","body":"A 220 Ω resistor reads red, red, brown, gold. A 1 kΩ resistor reads brown, black, red, gold. The parts list draws those bands. Match three of each before you insert them."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 4;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $rgbwalk$Wiring$rgbwalk$,
  title = $rgbwalk$Learn the breadboard before you insert a part$rgbwalk$,
  description = $rgbwalk$A row connects the holes in it. A different row is a different wire.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","heading":"Terminal rows","body":"The middle of the board is split by a gap. In one half, holes a, b, c, d, and e of the same row number are connected to each other. Holes f, g, h, i, and j of that row are a separate connection. The gap is not a wire. This whole build stays in columns a–e of the top half."},{"type":"text","heading":"Power rails","body":"The long red and blue strips along the edge are the power rails. Holes in the red strip connect along the strip. Holes in the blue strip connect along the strip. A rail is not connected to the numbered rows until you add a wire. Many full-size boards break each rail in the middle. Both ends of a rail jumper in this build must sit in the top half, on the same side of that break. Rows 1–23 do not need a wire across the break."},{"type":"text","heading":"Sharing a row","body":"Two leads connect when they sit in the same numbered row on the same side of the gap. They stay separate when they sit in different rows. A resistor body may pass over a row it must not join. Only the holes that hold its leads are connected."},{"type":"warning","body":"Do not put two transistor leads in one row, and do not put two LED leads in one row. That shorts those leads together."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 5;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $rgbwalk$Wiring$rgbwalk$,
  title = $rgbwalk$Seat every part on these rows$rgbwalk$,
  description = $rgbwalk$Use the top half, columns a–e. The diagram names the same rows.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","heading":"The LED","body":"Flat side toward row 1. Spread the leads and seat pin 1 red in row 10, pin 2 anode in row 11, pin 3 blue in row 12, and pin 4 green in row 13."},{"type":"text","heading":"Red channel, above the LED","body":"Transistor flat to the right: emitter in row 2, base in row 3, collector in row 4. The 1 kΩ leads go in row 1 and row 3. Its body crosses row 2 and must not enter row 2. The 220 Ω leads go in row 4 and row 10."},{"type":"text","heading":"Green channel, below the LED","body":"Emitter in row 15, base in row 16, collector in row 17. The 1 kΩ leads go in row 16 and row 18, crossing row 17 without entering it. The 220 Ω leads go in row 17 and row 13."},{"type":"text","heading":"Blue channel","body":"Emitter in row 20, base in row 21, collector in row 22. The 1 kΩ leads go in row 21 and row 23, crossing row 22 without entering it. The 220 Ω leads go in row 22 and row 12. Rows 5–9, 14, and 19 stay empty so neighbouring parts cannot share a row by accident."},{"type":"wiring","heading":"Where the parts sit","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"Each transistor has its three leads in three different rows, flat face to the right, emitter nearest the top. The LED has four leads in rows 10–13, flat toward the top, longest lead in row 11. No USB cable is plugged in yet."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 6;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $rgbwalk$Wiring$rgbwalk$,
  title = $rgbwalk$Connect 5 V and ground$rgbwalk$,
  description = $rgbwalk$Two male-to-female wires feed the rails. Four male-to-male wires reach the parts.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"Put the DevKit beside the breadboard. With a male-to-female wire, join the DevKit 5 V pin to the top-half red rail. Join DevKit GND to the top-half blue rail. With male-to-male wires, join row 11 to the red rail, and join rows 2, 15, and 20 to the blue rail. Leave USB unplugged."},{"type":"wiring","heading":"Supply and ground","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"}]},{"type":"connections","heading":"These six links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"}]},{"type":"test","heading":"Checkpoint","body":"The 5 V jumper and the row 11 jumper are on the same half of the red rail. The GND jumper and the three emitter jumpers are on the same half of the blue rail. The GPIO wires are not in yet. USB is still unplugged."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 7;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $rgbwalk$Wiring$rgbwalk$,
  title = $rgbwalk$Build the red channel$rgbwalk$,
  description = $rgbwalk$GPIO25 switches the red cathode through row 10.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"Join DevKit GPIO25 to row 1 with a male-to-female wire. That row already holds one leg of the red 1 kΩ resistor. The other leg is in row 3 with the red transistor base. The collector in row 4 already meets the red 220 Ω resistor, and that resistor’s other leg is in row 10 with LED pin 1."},{"type":"wiring","heading":"Red channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"}]},{"type":"connections","heading":"Red links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO25 meets the 1 kΩ in row 1. The 1 kΩ and the base share row 3 only. The collector and the 220 Ω share row 4, and the 220 Ω meets pin 1 in row 10. The 1 kΩ lead is not in row 2 or row 4."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 8;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $rgbwalk$Wiring$rgbwalk$,
  title = $rgbwalk$Build the green channel$rgbwalk$,
  description = $rgbwalk$GPIO26 switches the green cathode through row 13.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"Join GPIO26 to row 18. The green 1 kΩ already joins row 18 to the base in row 16. The collector in row 17 meets the green 220 Ω resistor, and that resistor’s other leg is in row 13 with LED pin 4."},{"type":"wiring","heading":"Green channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"}]},{"type":"connections","heading":"Green links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO26 is in row 18. The 1 kΩ crosses row 17 without a lead in row 17. Row 13 holds LED pin 4 and the green 220 Ω lead, and nothing else."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 9;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $rgbwalk$Wiring$rgbwalk$,
  title = $rgbwalk$Build the blue channel$rgbwalk$,
  description = $rgbwalk$GPIO27 switches the blue cathode through row 12.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"Join GPIO27 to row 23. The blue 1 kΩ already joins row 23 to the base in row 21. The collector in row 22 meets the blue 220 Ω resistor, and that resistor’s other leg is in row 12 with LED pin 3."},{"type":"wiring","heading":"Blue channel","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"connections","heading":"Blue links","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Checkpoint","body":"GPIO27 is in row 23. The 1 kΩ does not enter row 22. Row 12 holds LED pin 3 and the blue 220 Ω lead. Rows 10, 11, 12, and 13 still hold one LED lead each."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 10;

update public.project_steps
set
  stage_sort_order = 2,
  stage_title = $rgbwalk$Wiring$rgbwalk$,
  title = $rgbwalk$Check the whole circuit, then plug in USB$rgbwalk$,
  description = $rgbwalk$This is the only full connection list. Use it once, before power.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"connections","heading":"All 18 connections","rows":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}],"summary":"Five male-to-female wires leave the DevKit. Four male-to-male wires leave the rails. Every other join is two leads in the same row."},{"type":"wiring","heading":"Finished arrangement","connections":[{"fromComponent":"ESP32 DevKit","fromPin":"5V","toComponent":"Breadboard","toPin":"5V rail","signal":"power"},{"fromComponent":"Breadboard","fromPin":"5V rail","toComponent":"RGB LED","toPin":"Anode","signal":"power"},{"fromComponent":"ESP32 DevKit","fromPin":"GND","toComponent":"Breadboard","toPin":"GND rail","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q red","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q green","toPin":"Emitter","signal":"ground"},{"fromComponent":"Breadboard","fromPin":"GND rail","toComponent":"Q blue","toPin":"Emitter","signal":"ground"},{"fromComponent":"ESP32 DevKit","fromPin":"IO25","toComponent":"1k red","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k red","fromPin":"leg 2","toComponent":"Q red","toPin":"Base","signal":"signal"},{"fromComponent":"Q red","fromPin":"Collector","toComponent":"220 red","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 red","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Red","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO26","toComponent":"1k green","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k green","fromPin":"leg 2","toComponent":"Q green","toPin":"Base","signal":"signal"},{"fromComponent":"Q green","fromPin":"Collector","toComponent":"220 green","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 green","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Green","signal":"signal"},{"fromComponent":"ESP32 DevKit","fromPin":"IO27","toComponent":"1k blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"1k blue","fromPin":"leg 2","toComponent":"Q blue","toPin":"Base","signal":"signal"},{"fromComponent":"Q blue","fromPin":"Collector","toComponent":"220 blue","toPin":"leg 1","signal":"signal"},{"fromComponent":"220 blue","fromPin":"leg 2","toComponent":"RGB LED","toPin":"Blue","signal":"signal"}]},{"type":"test","heading":"Before USB","body":"LED pin 2 is the only lead on the red rail. The three emitters are the only transistor leads on the blue rail. No GPIO wire touches a rail. No two LED leads share a row. Then plug the data USB cable into the DevKit and the computer. Do not add another supply."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 11;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $rgbwalk$Development environment$rgbwalk$,
  title = $rgbwalk$Install the ESP32 board package$rgbwalk$,
  description = $rgbwalk$The Arduino IDE needs the Espressif package before it can see this board.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"Install the Arduino IDE. Open File, Preferences, and add this URL to Additional boards manager URLs: https://espressif.github.io/arduino-esp32/package_esp32_index.json. Open Tools, Board, Boards Manager, search for esp32, and install the package Espressif Systems. This sketch uses Arduino-ESP32 3.x calls such as ledcAttach."},{"type":"tip","body":"If the board list has no ESP32 Dev Module after the install, close the IDE and open it again."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 12;

update public.project_steps
set
  stage_sort_order = 3,
  stage_title = $rgbwalk$Development environment$rgbwalk$,
  title = $rgbwalk$Select the board and the port$rgbwalk$,
  description = $rgbwalk$The sketch talks to the computer at 115200 baud.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"Connect the data cable. In Tools, set Board to ESP32 Dev Module. Set Port to the new serial port. Set Upload Speed to 115200. Open Serial Monitor and set its speed to 115200 as well. A charge-only cable can power the board and still leave the port missing."},{"type":"expected","heading":"If the port is missing","body":"Install the USB-to-UART driver for the chip on your DevKit, try another USB socket, and try a cable you know can carry data. The port should appear in the Tools menu while the board is plugged in."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 13;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $rgbwalk$Firmware$rgbwalk$,
  title = $rgbwalk$See how PWM sets the brightness$rgbwalk$,
  description = $rgbwalk$GPIO25, GPIO26, and GPIO27 were chosen because they can output PWM.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","heading":"Why these pins","body":"GPIO25 drives red, GPIO26 drives green, and GPIO27 drives blue. They are ordinary output pins. They are not the strapping pins 0, 2, 12, or 15, and they are not the input-only pins 34–39. A high duty cycle turns the matching transistor on for longer, so that colour gets brighter."},{"type":"text","body":"The next block is an excerpt from the sketch. It shows how brightness scales a colour. Do not upload this fragment."},{"type":"code","language":"cpp","filename":"excerpt-brightness.ino","code":"int channelDuty(int channel) {\n  return (int)(((long)channel * (long)brightnessPercent) / 100L);\n}\n\nvoid applyColour() {\n  ledcWrite(RED_PIN, channelDuty(redValue));\n  ledcWrite(GREEN_PIN, channelDuty(greenValue));\n  ledcWrite(BLUE_PIN, channelDuty(blueValue));"},{"type":"text","heading":"What that excerpt does","body":"channelDuty multiplies one colour, 0–255, by the brightness percent and divides by 100. At 30 percent, red 255 becomes duty 76. ledcWrite sends that duty to the pin. Zero is off. 255 is fully on for that colour."},{"type":"text","body":"This second excerpt is the setup that attaches those pins. Do not upload it on its own."},{"type":"code","language":"cpp","filename":"excerpt-pwm-setup.ino","code":"if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {\n    Serial.println(\"PWM setup failed.\");\n  }\n  applyColour();"},{"type":"text","heading":"What ledcAttach does","body":"ledcAttach(pin, 5000, 8) gives that pin a PWM signal at 5000 Hz with 8 bits of duty, so the duty runs from 0 to 255. The same call is made for all three pins. applyColour then writes the power-on colour, which is red at 30 percent."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 14;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $rgbwalk$Firmware$rgbwalk$,
  title = $rgbwalk$Watch the write 255,80,0 travel through the sketch$rgbwalk$,
  description = $rgbwalk$A characteristic is one value the phone can read or write.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","heading":"The path of one colour","body":"The phone sends the text 255,80,0 to the colour characteristic. The ESP32 callback copies that text, checks it, stores red 255, green 80, and blue 0, then calls applyColour. The three PWM duties change, and the LED moves toward orange. A service is the group that holds the colour characteristic and the brightness characteristic. The board advertises that service under the name Solderi RGB so the phone can find it."},{"type":"text","body":"Both blocks below are excerpts. The complete sketch is in the next step."},{"type":"code","language":"cpp","filename":"excerpt-advertise.ino","code":"BLEDevice::init(DEVICE_NAME);\n  BLEServer *server = BLEDevice::createServer();\n  server->setCallbacks(new ServerCallbacks());\n  BLEService *service = server->createService(SERVICE_UUID);\n\n  BLECharacteristic *colorCharacteristic = service->createCharacteristic(\n    COLOR_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  colorCharacteristic->setCallbacks(new ColorCallbacks());\n  colorCharacteristic->setValue(colourText());\n\n  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(\n    BRIGHTNESS_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());\n  brightnessCharacteristic->setValue(brightnessText());\n\n  service->start();\n\n  BLEAdvertising *advertising = BLEDevice::getAdvertising();\n  advertising->addServiceUUID(SERVICE_UUID);\n  advertising->setScanResponse(true);\n  BLEDevice::startAdvertising();\n  Serial.println(\"Advertising as Solderi RGB.\");"},{"type":"code","language":"cpp","filename":"excerpt-colour-write.ino","code":"class ColorCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);\n    if (!accepted) {\n      characteristic->setValue(colourText());\n      Serial.print(\"Colour rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(colourText());\n    Serial.print(\"Colour \");\n    Serial.println(colourText());"},{"type":"text","heading":"Rejected writes and a disconnect","body":"A colour must be three numbers from 0 to 255, separated by commas, with no spaces. Brightness must be a whole number from 0 to 100. Anything else, including a raw three-byte colour, is rejected. The callback writes the last accepted text back into the characteristic, because the ESP32 stack stores the incoming bytes before the callback runs. When the phone disconnects, the sketch prints a line and starts advertising again. The last colour stays on the LED."},{"type":"code","language":"cpp","filename":"excerpt-disconnect.ino","code":"void onDisconnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = false;\n    Serial.println(\"Phone disconnected. Advertising again.\");\n    BLEDevice::startAdvertising();"}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 15;

update public.project_steps
set
  stage_sort_order = 4,
  stage_title = $rgbwalk$Firmware$rgbwalk$,
  title = $rgbwalk$Upload the complete sketch$rgbwalk$,
  description = $rgbwalk$This is the program to copy. The earlier blocks were excerpts.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"Create a sketch, replace its contents with the program below, and click Upload. When it finishes, the Serial Monitor should show the power-on line and then Advertising as Solderi RGB."},{"type":"code","language":"cpp","filename":"esp32-ble-rgb-controller.ino","libraries":["BLE (ESP32 Arduino core)","LEDC (ESP32 Arduino core)"],"code":"/*\n * ESP32 Bluetooth RGB LED Controller\n * Board: ESP32 Dev Module\n * LED: Kingbright WP154A4SEJ3VBDZGW/CA, common-anode\n * Pin 1 red cathode, pin 2 common anode, pin 3 blue cathode, pin 4 green cathode\n * DevKit 5V pin -> pin 2\n * IO25 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 1 red cathode\n * IO26 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 4 green cathode\n * IO27 -> 1k -> onsemi PN2222ABU base; collector -> 220 ohm -> pin 3 blue cathode\n * Emitters and DevKit GND share the ground rail\n * A higher PWM duty turns the transistor on for longer\n * Phone app: nRF Connect for Mobile\n * One write format: UTF-8 text\n * Colour: 255,80,0\n * Brightness: 0, 48, or 100\n * Arduino-ESP32 3.x: ledcAttach, BLECharacteristic::PROPERTY_WRITE\n */\n\n#include <BLEDevice.h>\n#include <BLEServer.h>\n#include <BLEUtils.h>\n\nconst int RED_PIN = 25;\nconst int GREEN_PIN = 26;\nconst int BLUE_PIN = 27;\nconst int PWM_FREQUENCY_HZ = 5000;\nconst int PWM_RESOLUTION_BITS = 8;\nconst size_t MAX_TEXT_BYTES = 16;\n\nconst char *DEVICE_NAME = \"Solderi RGB\";\nconst char *SERVICE_UUID = \"8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24\";\nconst char *COLOR_UUID = \"8c4a2e11-1b6d-4f3a-9e72-5d0c8a1b6e24\";\nconst char *BRIGHTNESS_UUID = \"8c4a2e12-1b6d-4f3a-9e72-5d0c8a1b6e24\";\n\nint redValue = 255;\nint greenValue = 0;\nint blueValue = 0;\nint brightnessPercent = 30;\n\nbool clientConnected = false;\n\nint channelDuty(int channel) {\n  return (int)(((long)channel * (long)brightnessPercent) / 100L);\n}\n\nvoid applyColour() {\n  ledcWrite(RED_PIN, channelDuty(redValue));\n  ledcWrite(GREEN_PIN, channelDuty(greenValue));\n  ledcWrite(BLUE_PIN, channelDuty(blueValue));\n}\n\nbool digitsOnly(const String &text) {\n  if (text.length() == 0) {\n    return false;\n  }\n  for (int i = 0; i < text.length(); i++) {\n    char letter = text.charAt(i);\n    if (letter < '0' || letter > '9') {\n      return false;\n    }\n  }\n  return true;\n}\n\nbool copyTextPayload(const uint8_t *data, size_t length, String &text) {\n  text = \"\";\n  if (data == nullptr || length == 0 || length > MAX_TEXT_BYTES) {\n    return false;\n  }\n  for (size_t i = 0; i < length; i++) {\n    char letter = (char)data[i];\n    bool allowed = (letter >= '0' && letter <= '9') || letter == ',' || letter == ' ';\n    if (!allowed) {\n      return false;\n    }\n    text += letter;\n  }\n  text.trim();\n  return text.length() > 0;\n}\n\nbool parseColourText(const String &text) {\n  if (text.indexOf(',') < 0) {\n    return false;\n  }\n  int first = text.indexOf(',');\n  int second = text.indexOf(',', first + 1);\n  if (first <= 0 || second <= first + 1 || text.indexOf(',', second + 1) >= 0) {\n    return false;\n  }\n\n  String redText = text.substring(0, first);\n  String greenText = text.substring(first + 1, second);\n  String blueText = text.substring(second + 1);\n  redText.trim();\n  greenText.trim();\n  blueText.trim();\n  if (!digitsOnly(redText) || !digitsOnly(greenText) || !digitsOnly(blueText)) {\n    return false;\n  }\n\n  long red = redText.toInt();\n  long green = greenText.toInt();\n  long blue = blueText.toInt();\n  if (red > 255 || green > 255 || blue > 255) {\n    return false;\n  }\n\n  redValue = (int)red;\n  greenValue = (int)green;\n  blueValue = (int)blue;\n  return true;\n}\n\nbool parseBrightnessText(const String &text) {\n  if (text.indexOf(',') >= 0 || !digitsOnly(text)) {\n    return false;\n  }\n  long value = text.toInt();\n  if (value > 100) {\n    return false;\n  }\n  brightnessPercent = (int)value;\n  return true;\n}\n\nString colourText() {\n  return String(redValue) + \",\" + String(greenValue) + \",\" + String(blueValue);\n}\n\nString brightnessText() {\n  return String(brightnessPercent);\n}\n\nclass ServerCallbacks : public BLEServerCallbacks {\n  void onConnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = true;\n    Serial.println(\"Phone connected.\");\n  }\n\n  void onDisconnect(BLEServer *server) override {\n    (void)server;\n    clientConnected = false;\n    Serial.println(\"Phone disconnected. Advertising again.\");\n    BLEDevice::startAdvertising();\n  }\n};\n\nclass ColorCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseColourText(text);\n    if (!accepted) {\n      characteristic->setValue(colourText());\n      Serial.print(\"Colour rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(colourText());\n    Serial.print(\"Colour \");\n    Serial.println(colourText());\n  }\n};\n\nclass BrightnessCallbacks : public BLECharacteristicCallbacks {\n  void onWrite(BLECharacteristic *characteristic) override {\n    String text;\n    bool accepted = copyTextPayload(characteristic->getData(), characteristic->getLength(), text) && parseBrightnessText(text);\n    if (!accepted) {\n      characteristic->setValue(brightnessText());\n      Serial.print(\"Brightness rejected: \");\n      Serial.println(text);\n      return;\n    }\n\n    applyColour();\n    characteristic->setValue(brightnessText());\n    Serial.print(\"Brightness \");\n    Serial.println(brightnessPercent);\n  }\n};\n\nvoid setup() {\n  Serial.begin(115200);\n  delay(300);\n\n  if (!ledcAttach(RED_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(GREEN_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS) ||\n      !ledcAttach(BLUE_PIN, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS)) {\n    Serial.println(\"PWM setup failed.\");\n  }\n  applyColour();\n\n  Serial.println(\"ESP32 Bluetooth RGB LED controller\");\n  Serial.println(\"Power-on colour is red at 30 percent brightness.\");\n\n  BLEDevice::init(DEVICE_NAME);\n  BLEServer *server = BLEDevice::createServer();\n  server->setCallbacks(new ServerCallbacks());\n  BLEService *service = server->createService(SERVICE_UUID);\n\n  BLECharacteristic *colorCharacteristic = service->createCharacteristic(\n    COLOR_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  colorCharacteristic->setCallbacks(new ColorCallbacks());\n  colorCharacteristic->setValue(colourText());\n\n  BLECharacteristic *brightnessCharacteristic = service->createCharacteristic(\n    BRIGHTNESS_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR\n  );\n  brightnessCharacteristic->setCallbacks(new BrightnessCallbacks());\n  brightnessCharacteristic->setValue(brightnessText());\n\n  service->start();\n\n  BLEAdvertising *advertising = BLEDevice::getAdvertising();\n  advertising->addServiceUUID(SERVICE_UUID);\n  advertising->setScanResponse(true);\n  BLEDevice::startAdvertising();\n  Serial.println(\"Advertising as Solderi RGB.\");\n}\n\nvoid loop() {\n  delay(200);\n}\n"},{"type":"expected","heading":"After a successful upload","body":"The LED is red at a low brightness. The monitor shows Advertising as Solderi RGB. If upload fails, hold the BOOT button when the IDE says Connecting, then release it."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 16;

update public.project_steps
set
  stage_sort_order = 5,
  stage_title = $rgbwalk$Phone control$rgbwalk$,
  title = $rgbwalk$Find Solderi RGB in nRF Connect$rgbwalk$,
  description = $rgbwalk$Use the Bluetooth Low Energy scanner, not a classic Bluetooth device list.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"Install nRF Connect for Mobile. Turn on the phone’s Bluetooth. Open the app and tap the scanner. Look for the name Solderi RGB and tap Connect. A speaker pairing screen is the wrong place. This board does not appear there, because it is a BLE peripheral."},{"type":"text","heading":"The service, once","body":"After it connects, open the service whose UUID starts with 8c4a2e10. Inside it, the colour characteristic starts with 8c4a2e11 and the brightness characteristic starts with 8c4a2e12. You can match those prefixes. You do not need to retype the full UUID for each write."},{"type":"expected","heading":"When the connection works","body":"nRF Connect shows the service, and the Serial Monitor prints Phone connected. The full service UUID is 8c4a2e10-1b6d-4f3a-9e72-5d0c8a1b6e24."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 17;

update public.project_steps
set
  stage_sort_order = 5,
  stage_title = $rgbwalk$Phone control$rgbwalk$,
  title = $rgbwalk$Write a colour as text$rgbwalk$,
  description = $rgbwalk$The write format is UTF-8 text, three numbers separated by commas.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"On the colour characteristic, choose the write action and set the format to text, or UTF-8. Send 255,80,0. The LED should move from dim red toward orange: full red, some green, no blue. Then send 0,0,255 for blue and 0,255,0 for green. Read the characteristic afterward. It should show the text you sent."},{"type":"text","heading":"If the app asks for hex","body":"Some iOS write fields want the UTF-8 bytes in hexadecimal. 255,80,0 is 32 35 35 2C 38 30 2C 30. 0,0,255 is 30 2C 30 2C 32 35 35. 0,255,0 is 30 2C 32 35 35 2C 30. The characters are still the same text."},{"type":"warning","body":"Do not send the three raw bytes FF 50 00. The sketch rejects that. Send the digits and the commas."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 18;

update public.project_steps
set
  stage_sort_order = 5,
  stage_title = $rgbwalk$Phone control$rgbwalk$,
  title = $rgbwalk$Change brightness, then disconnect and come back$rgbwalk$,
  description = $rgbwalk$Brightness is a second text value, from 0 to 100.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"On the brightness characteristic, write the text 100. The current colour should become brighter. Write 10 and it should become dim. Write 0 and it should go dark. Read the characteristic to confirm the stored number. Then disconnect in nRF Connect. The monitor should print that the phone disconnected and that the board is advertising again. The last colour remains. Connect once more and write 255,0,0 to return to red."},{"type":"text","body":"A brightness of 100 in hex text is 31 30 30. A rejected write, such as 150 or the word high, should leave the LED unchanged, and the monitor should print that the value was rejected."},{"type":"tip","body":"Compare the LED with the Serial Monitor line for the same write. The monitor is the sketch telling you which text it accepted."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 19;

update public.project_steps
set
  stage_sort_order = 6,
  stage_title = $rgbwalk$Troubleshooting$rgbwalk$,
  title = $rgbwalk$Fix the light before you blame the phone$rgbwalk$,
  description = $rgbwalk$Match the symptom, then work down the checks.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"troubleshooting","heading":"The LED itself","items":[{"problem":"The LED stays dark after upload.","solution":"The usual causes are USB not powering the board, the anode off the red rail, or an emitter off the blue rail. Confirm the monitor prints the advertising line, then confirm row 11 is on the same red-rail half as the 5 V jumper and rows 2, 15, and 20 are on the blue rail. You should see a dim red light. If the monitor is alive and the LED is still dark, the LED is reversed or pin 2 is not the lead in row 11."},{"problem":"Only red lights. Green and blue stay off.","solution":"Either those channels are in the wrong rows, or the USB port is too weak for a high forward voltage. Send 0,255,0 and 0,0,255 and read the monitor. If the monitor accepts the colour, move the green 220 Ω lead so it shares row 13 with pin 4, and the blue 220 Ω lead so it shares row 12 with pin 3. Try a different USB port near 5 V. A port that is already sagging can leave a 4.0 V blue chip or a 4.1 V green chip dark."},{"problem":"One colour is stuck on, or two colours light together.","solution":"Two leads are probably in the same row. Check that each transistor uses three separate rows and that the 1 kΩ lead is not in the collector row. Pull that channel’s parts and seat them again. The stuck colour should follow only its own GPIO pin."},{"problem":"The LED is very hot or a resistor smells.","solution":"Unplug USB. A 220 Ω resistor is missing or a cathode is wired straight to ground. Seat the 220 Ω resistor again before you reconnect power. The part should stay cool at the currents in the resistor step."}]}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 20;

update public.project_steps
set
  stage_sort_order = 6,
  stage_title = $rgbwalk$Troubleshooting$rgbwalk$,
  title = $rgbwalk$Fix the phone connection$rgbwalk$,
  description = $rgbwalk$The board has to be advertising before the phone can write.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"troubleshooting","heading":"nRF Connect","items":[{"problem":"Solderi RGB never appears in the scanner.","solution":"The sketch is not running, or the phone is looking at classic Bluetooth devices. Re-upload, set the monitor to 115200, and wait for Advertising as Solderi RGB. In nRF Connect use the BLE scanner and pull to refresh. The name should appear within a few seconds."},{"problem":"The app connects, then the write does nothing.","solution":"The write is on the wrong characteristic, or it is not UTF-8 text. Open the colour characteristic that starts with 8c4a2e11 and send 255,80,0 as text. The monitor should print Colour 255,80,0 and the LED should change. If it prints Colour rejected, the text has a space, a missing comma, or a number outside 0–255."},{"problem":"Upload never finishes.","solution":"The port is wrong or the board never entered the bootloader. Select the port that appears when you plug the board in, lower the upload speed if 115200 fails, and hold BOOT when the IDE says Connecting. A finished upload returns the IDE to a done message and the monitor prints the advertising line."},{"problem":"It worked once, and the phone cannot reconnect.","solution":"Disconnect in nRF Connect, wait for the monitor line that says the board is advertising again, then scan and connect. If that line never appears, press the DevKit reset button and wait for the advertising line before you scan."}]}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 21;

update public.project_steps
set
  stage_sort_order = 7,
  stage_title = $rgbwalk$Final check$rgbwalk$,
  title = $rgbwalk$Walk the finished controller$rgbwalk$,
  description = $rgbwalk$Do these in order and compare the LED with each line.$rgbwalk$,
  tip = null,
  blocks = $rgbwalk$[{"type":"text","body":"The sketch is written to do every line below. Use the troubleshooting steps for any line that does not match. A USB port well under 5 V can still leave green or blue dim or dark after the wiring is correct."},{"type":"expected","heading":"Checklist","body":"The LED flat faces the top and the longest lead is in row 11. Each transistor flat faces right, with the emitter in the top lead of that transistor. The red rail feeds only pin 2, and the blue rail meets only the three emitters. No two component leads share a row unless this guide named that row. Upload finishes and the monitor prints Advertising as Solderi RGB. nRF Connect connects to that name. 255,0,0 is red, 0,255,0 is green, and 0,0,255 is blue. Brightness 100 is brighter than 10, and 0 is dark. The text 150 is rejected and the LED stays put. Disconnecting prints the advertising line, and a new connection can write 255,80,0."}]$rgbwalk$::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order = 22;

delete from public.project_steps
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and sort_order >= 23;

insert into public.project_components (project_id, component_id, quantity, sort_order)
select p.id, c.id, 1, 10
from public.projects p
join public.components c on c.slug = 'jumper-wires'
where p.slug = '24'
  and p.title = 'ESP32 Bluetooth RGB LED Controller'
  and not exists (
    select 1
    from public.project_components existing
    where existing.project_id = p.id
      and existing.component_id = c.id
  );

insert into public.project_requirements (
  project_id, project_component_id, role, substitution_policy, sort_order
)
select pc.project_id, pc.id, 'rail_jumpers', 'exact', pc.sort_order
from public.project_components pc
join public.projects p on p.id = pc.project_id
join public.components c on c.id = pc.component_id
where p.slug = '24'
  and p.title = 'ESP32 Bluetooth RGB LED Controller'
  and c.slug = 'jumper-wires'
  and not exists (
    select 1 from public.project_requirements existing
    where existing.project_component_id = pc.id
  );

update public.projects
set
  overview = $rgbwalk$Build a breadboard RGB light that a phone sets over Bluetooth Low Energy. The LED takes current from the DevKit 5 V pin. Three PN2222A transistors switch the colours, and PWM sets the mix.$rgbwalk$,
  is_published = false
where slug = '24'
  and title = 'ESP32 Bluetooth RGB LED Controller';
