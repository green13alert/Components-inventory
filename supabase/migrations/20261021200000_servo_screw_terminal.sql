-- Point project 18 at the Adafruit 368 screw terminal and the 14-jumper layout.
-- Does not change is_published or user_projects.current_step.

insert into public.components (name, category, description, slug)
values (
  '2.1 mm jack to screw terminal',
  'power',
  'Adafruit 368. Preassembled 2.1 mm jack to a screw terminal block. The terminals are marked positive and negative for a center-positive plug. Wires clamp under the screws. No soldering.',
  'adafruit-368'
)
on conflict (slug) do update
set name = excluded.name, category = excluded.category, description = excluded.description;

update public.project_components as line
set component_id = next.id
from public.projects as project, public.components as previous, public.components as next
where line.project_id = project.id
  and project.slug = '18'
  and line.component_id = previous.id
  and previous.slug = 'barrel-jack-21'
  and next.slug = 'adafruit-368';

update public.project_components as line
set quantity = 14
from public.projects as project, public.components as component
where line.project_id = project.id
  and project.slug = '18'
  and line.component_id = component.id
  and component.slug = 'jumper-wires';

insert into public.project_requirement_constraints (requirement_id, capability, value)
select requirement.id, 'physical_form', 'screw_terminal_jack'
from public.projects as project
join public.project_components as line on line.project_id = project.id
join public.components as component on component.id = line.component_id
join public.project_requirements as requirement on requirement.project_component_id = line.id
where project.slug = '18'
  and component.slug = 'adafruit-368'
  and not exists (
    select 1
    from public.project_requirement_constraints as existing
    where existing.requirement_id = requirement.id
      and existing.capability = 'physical_form'
  );

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $s18p0stage$Understand the Project$s18p0stage$,
  title = $s18p0title$What We're Building$s18p0title$,
  description = $s18p0desc$A two-servo pan-tilt mount aims a camera plate. A joystick sets the angles. This project aims the payload — it does not capture video.$s18p0desc$,
  tip = null,
  blocks = $s18p0blocks$[{"type":"text","heading":"What we're building","body":"You will assemble a pan-tilt bracket around two SG90 servos, power the servos from an Adafruit 368 screw-terminal jack, and drive both axes from an analog joystick. Pan is left/right. Tilt is up/down. Mount a lightweight camera or webcam on the plate if you have one — or leave the plate empty while you learn the mechanism."},{"type":"image","imageKey":"servoCamera","caption":"Finished pan-tilt reference. Pin map: pan servo D9, tilt servo D10, joystick VRx A0, VRy A1, SW D2."},{"type":"components","items":[{"id":"arduino-uno-r3","name":"Arduino Uno R3","illustrationId":"arduino-uno","owned":false,"quantity":1},{"id":"sg90","name":"SG90 Micro Servo","illustrationId":"servo-sg90","owned":false,"quantity":2},{"id":"joystick","name":"Analog Joystick Module","illustrationId":"generic-module","owned":false,"quantity":1},{"id":"pan-tilt-bracket","name":"Pan-Tilt Bracket Kit","illustrationId":"electronics-kit","owned":false,"quantity":1},{"id":"breadboard","name":"Breadboard","illustrationId":"breadboard","owned":false,"quantity":1},{"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":14},{"id":"adafruit-368","name":"2.1 mm jack to screw terminal","illustrationId":"generic-module","owned":false,"quantity":1},{"id":"gst18a05-p1j","name":"5 V 3 A DC supply","illustrationId":"battery","owned":false,"quantity":1},{"id":"iec-c13-mains-lead","name":"IEC C13 mains lead","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-data-cable","name":"USB data cable","illustrationId":"usb-cable","owned":false,"quantity":1},{"id":"usb-power-source","name":"USB power source","illustrationId":"generic-module","owned":false,"quantity":1}]},{"type":"warning","body":"Use position SG90 servos that hold an angle. A continuous-rotation servo will not stop at the angle this sketch writes."}]$s18p0blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 0;

update public.project_steps as step
set
  stage_sort_order = 0,
  stage_title = $s18p1stage$Understand the Project$s18p1stage$,
  title = $s18p1title$Understand Power and Pin Architecture$s18p1title$,
  description = $s18p1desc$Servos and the Uno do not share the Arduino 5V pin. They share ground. The pin map stays fixed for the rest of the build.$s18p1desc$,
  tip = $s18p1tip$The servo supply is a MEAN WELL GST18A05-P1J: 5 V, 3 A, 5.5×2.1 mm, center positive. It needs the IEC C13 mains lead, fitted as supplied. Do not open the adapter or change the mains plug. A 9V snap is not the servo supply.$s18p1tip$,
  blocks = $s18p1blocks$[{"type":"text","heading":"Two 5V domains, one ground","body":"USB powers the Uno. Uno 5V feeds only the joystick, through the left + rail. Servo current does not enter the breadboard. The GST18A05-P1J plugs into an Adafruit 368, a preassembled 2.1 mm jack whose screws are marked + and − for a center-positive plug. Both servo red wires clamp under the + screw. Both brown wires, and one ground jumper to the left − rail, clamp under the − screw. Do not connect the + screw to Uno 5V. If the grounds are split, the servos jitter or ignore the signal. If the + screw reaches Uno 5V, the servo supply can back-feed the Uno. Tower Pro’s SG90 sheet lists 4.8 V operation and does not publish stall current, so this build uses a 3 A regulated 5 V supply rather than a small linear breadboard regulator. Adafruit’s page for product 368 does not publish a current rating. A 2019 Adafruit support reply gave that adapter a nominal 2 A."},{"type":"connections","heading":"Pin map","summary":"Pan D9 · tilt D10 · joystick A0/A1/D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"warning","body":"Do not feed servo VCC from the Uno 5V header. Two SG90s can stall well above what USB 5V should supply, and the board will reset. Do not connect the adapter + screw to Uno 5V or to a breadboard + rail."}]$s18p1blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 1;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s18p2stage$Mechanical Assembly$s18p2stage$,
  title = $s18p2title$Prepare the Mechanical Parts$s18p2title$,
  description = $s18p2desc$Lay out the pan-tilt kit: base, U-bracket, camera plate, horns, and screws. Identify pan versus tilt before any servo goes into a hole.$s18p2desc$,
  tip = null,
  blocks = $s18p2blocks$[{"type":"text","heading":"What you should have","body":"A typical SG90 pan-tilt kit has a round or square base (pan), a U-shaped bracket that rides on that base, a camera plate for the tilt servo, several horns, and short screws. Match each piece to the kit diagram if one is included. Keep the two servos aside until the next step — do not tighten horns yet."},{"type":"text","heading":"Orientation","body":"The pan servo will sit in the base, output shaft pointing up. The tilt servo will sit in the U-bracket, output shaft pointing sideways so the camera plate can nod. If your kit labels the parts, follow those labels. If it does not, the piece that bolts to the desk or breadboard area is the pan base."},{"type":"expected","heading":"Check","body":"You can name the base, the U-bracket, and the camera plate. Screws that go into the servo body are short — do not use a long screw that can punch into the gearbox."}]$s18p2blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 2;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s18p3stage$Mechanical Assembly$s18p3stage$,
  title = $s18p3title$Assemble the Base and Pan Servo$s18p3title$,
  description = $s18p3desc$Seat the pan servo in the base with the shaft centred. Fit a horn loosely. Do not lock the horn at an extreme angle.$s18p3desc$,
  tip = $s18p3tip$Most kits screw through the servo lug holes into the base. Snug, not stripped.$s18p3tip$,
  blocks = $s18p3blocks$[{"type":"text","heading":"Mount the pan servo","body":"Slide the pan SG90 into the base pocket so the brass output shaft is centred in the base opening. Route the three-wire lead out through the kit’s cable notch, not pinched under the servo body. Fit the screws through the servo mounting lugs into the base."},{"type":"text","heading":"Horn at mid-travel","body":"Push the single-arm or four-point horn onto the pan shaft so the U-bracket will sit square over the base when the servo is near mid-travel. Leave the horn screw slightly loose for now. You will command 90° in software later and reseat the horn so “90” is actually straight."},{"type":"test","body":"With power still off, rotate the horn gently. You should feel a little gearbox resistance, not a hard plastic clash against the base."},{"type":"expected","heading":"Expected result","body":"The pan servo is captive in the base, the lead is free, and the horn is on the shaft but not locked at a hard stop."}]$s18p3blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 3;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s18p4stage$Mechanical Assembly$s18p4stage$,
  title = $s18p4title$Mount the Tilt Servo and Camera Plate$s18p4title$,
  description = $s18p4desc$Fit the U-bracket to the pan horn, seat the tilt servo, and attach the camera plate. Keep both joints able to move.$s18p4desc$,
  tip = null,
  blocks = $s18p4blocks$[{"type":"text","heading":"U-bracket on pan","body":"Bolt the U-bracket to the pan horn so the open side of the U faces the direction your camera plate will nod. The tilt servo sits in one arm of the U, shaft toward the plate."},{"type":"text","heading":"Tilt servo and plate","body":"Seat the second SG90 in the U-bracket. Route its lead so it cannot wrap around the pan joint. Attach the camera plate to the tilt horn at a visual mid-angle — plate roughly level, not folded into the U. Screw the plate on, but leave the horn-to-shaft screw slightly loose until calibration."},{"type":"warning","body":"Fingers and cables can pinch between the U-bracket and the base when pan moves. Keep the two servo leads long enough to follow the motion, and tape a service loop so they do not taut-pull a header later."},{"type":"expected","heading":"Check","body":"You have a base that can yaw and a plate that can nod. Neither joint is already sitting on a mechanical stop."}]$s18p4blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 4;

update public.project_steps as step
set
  stage_sort_order = 1,
  stage_title = $s18p5stage$Mechanical Assembly$s18p5stage$,
  title = $s18p5title$Check Mechanical Movement$s18p5title$,
  description = $s18p5desc$With power still off, confirm pan and tilt can move through a useful range without scraping or pulling wires.$s18p5desc$,
  tip = $s18p5tip$If a joint is stiff, loosen the horn one click rather than forcing it.$s18p5tip$,
  blocks = $s18p5blocks$[{"type":"test","body":"Hold the base still. Ease the camera plate through tilt. Then ease the whole U-bracket through pan. Watch the two servo leads: they should follow, not stretch. Power is still off. Once the servos are powered, do not force a horn by hand. If a joint binds, remove power and ease the horn off."},{"type":"expected","heading":"Expected result","body":"Each axis moves past centre in both directions without plastic grinding and without a lead catching on a screw. Stops should feel like bracket-on-bracket, not a servo grinding its gear teeth."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"The plate hits the U-bracket immediately","solution":"Pull the tilt horn off and rotate it one spline so the plate sits level at mid-travel. Do not move the servo body."},{"problem":"Pan scrapes the desk or the base","solution":"The pan horn is clocked too far. Lift it off the shaft and reseat it so the U-bracket is square at centre."},{"problem":"A screw will not seat","solution":"Use the short servo-lug screws. A long screw can enter the gearbox and lock the output shaft."}]}]$s18p5blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 5;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18p6stage$Build the Electronics$s18p6stage$,
  title = $s18p6title$Set Up Arduino, Breadboard, and Power$s18p6title$,
  description = $s18p6desc$USB powers the Uno. The Adafruit 368 will power the servos. Connect Uno 5V, Uno GND, and the adapter ground before any servo signal wire goes in.$s18p6desc$,
  tip = $s18p6tip$Use a data-capable USB cable. Charge-only cables never appear as a serial port later.$s18p6tip$,
  blocks = $s18p6blocks$[{"type":"text","heading":"Find the breadboard power rails","body":"Along each long edge there is a + rail (often red) and a − rail (often blue or black). Holes in one + rail are connected to each other. + is not connected to −. This build uses the left + rail for Uno 5V and the left − rail for ground. Servo positive does not use a breadboard rail. Some breadboards include metal clips that join opposite + rails — remove or skip those. Leave the right-hand rails empty."},{"type":"text","heading":"Seat the adapter and jumpers","body":"Place the Adafruit 368 beside the breadboard. Its screws are marked + and − for a center-positive plug. Uno 5V goes to left + row 2. Uno GND goes to left − row 2. One male-to-male jumper goes from left − row 4 to the − screw: slide the plastic housing back on that end and tighten the screw on the metal pin until a gentle tug does not pull it out. Do not put a wire on the + screw yet. Do not connect the + screw to either breadboard + rail. This build uses 14 male-to-male jumpers. Leave D9, D10, A0, A1, and D2 empty."},{"type":"wiring","heading":"Power only","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Adafruit 368","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"}],"assembly":{"parts":["psu"],"jumpers":["uno-5v","uno-gnd","psu-gnd"]}},{"type":"connections","summary":"Logic 5V from Uno · adapter ground tied to Uno GND","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"}]},{"type":"warning","body":"Plug the GST18A05-P1J into the Adafruit 368 until the plug seats. The plug is 5.5×2.1 mm and center positive, and this jack is Adafruit’s 2.1 mm jack for that plug. Do not connect servo VCC yet. Do not join the + screw to Uno 5V. The − screw stays tied to Uno GND."},{"type":"test","body":"Connect USB to the Uno. Confirm the Uno power LED is on. Then plug in the GST18A05-P1J. The adapter + screw must not touch a breadboard + rail. Nothing else should be wired."},{"type":"expected","heading":"Expected result","body":"Uno powered from USB. The left + rail is Uno 5V only. The adapter + screw is the servo supply and is not tied to that rail. Left − row 2 and left − row 4 share ground with the adapter − screw. D9, D10, A0, A1, and D2 are still empty. The adapter body is not hot."}]$s18p6blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 6;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18p7stage$Build the Electronics$s18p7stage$,
  title = $s18p7title$Connect the Pan Servo$s18p7title$,
  description = $s18p7desc$Pan is the lower SG90. Red clamps under the adapter + screw, brown under the − screw, orange to D9.$s18p7desc$,
  tip = $s18p7tip$If the lead has yellow instead of orange, that is still the signal wire.$s18p7tip$,
  blocks = $s18p7blocks$[{"type":"text","heading":"What you are wiring","body":"The pan servo connector is female, so use male-to-male wires. Slide the housing back on the adapter end of the red and brown wires and clamp the metal pins under the screws: red under +, brown under −, sharing the − screw with the ground jumper already there. The other ends plug into the servo’s red and brown sockets. Tighten each screw until a gentle tug does not pull the pin out. Orange goes from Uno D9 straight into the signal pin. That orange wire does not enter a breadboard hole and does not go under a screw. Red must not touch the left + rail."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Adafruit 368","illustrationId":"generic-module"},{"id":"pan","name":"Pan servo","illustrationId":"servo-sg90"}],"connections":[{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"}],"assembly":{"parts":["pan"],"jumpers":["pan-vcc","pan-gnd","pan-sig"]}},{"type":"connections","summary":"Pan servo on D9","rows":[{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Three pan wires only: servo 5 V, common GND, D9. The tilt servo is still unplugged. Do not swap red and orange — that puts 5V on a GPIO."}]$s18p7blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 7;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18p8stage$Build the Electronics$s18p8stage$,
  title = $s18p8title$Connect the Tilt Servo$s18p8title$,
  description = $s18p8desc$Tilt is the upper SG90. Same colour code as pan, but the signal wire goes to D10.$s18p8desc$,
  tip = null,
  blocks = $s18p8blocks$[{"type":"text","heading":"What you are wiring","body":"The tilt connector is female too. Clamp its red pin under the same + screw and its brown pin under the same − screw. Orange goes from Uno D10 straight to the signal pin. Both servos share the adapter screws. Only the signal pins differ."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Adafruit 368","illustrationId":"generic-module"},{"id":"tilt","name":"Tilt servo","illustrationId":"servo-sg90"}],"connections":[{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"}],"assembly":{"parts":["tilt"],"jumpers":["tilt-vcc","tilt-gnd","tilt-sig"]}},{"type":"connections","summary":"Tilt servo on D10","rows":[{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"}]},{"type":"expected","heading":"Check","body":"Pan remains on D9. Tilt is on D10. Both reds are under the adapter + screw. Both browns are under the adapter − screw. No servo red is in the Uno 5V header."}]$s18p8blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 8;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18p9stage$Build the Electronics$s18p9stage$,
  title = $s18p9title$Connect the Joystick$s18p9title$,
  description = $s18p9desc$The joystick is a low-current analog module. It uses the Uno 5V rail, not the adapter + screw.$s18p9desc$,
  tip = $s18p9tip$KY-023 pins are usually labelled GND, +5V, VRx, VRy, SW in that order. Match labels, not lead colour.$s18p9tip$,
  blocks = $s18p9blocks$[{"type":"text","heading":"What you are wiring","body":"Plug the joystick pins into c8 through c12: +5V, GND, VRx, VRy, SW. a8 goes to the left + rail at row 8. a9 goes to the left − rail at row 9. A0 goes to a10, A1 to a11, and D2 to a12. The sketch later enables INPUT_PULLUP on D2, so an unpressed stick reads HIGH and a click reads LOW."},{"type":"wiring","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"joystick","name":"Joystick","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}],"assembly":{"parts":["joystick"],"jumpers":["joy-5v","joy-gnd","joy-vrx","joy-vry","joy-sw"]}},{"type":"connections","summary":"Joystick VRx A0 · VRy A1 · SW D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"warning","body":"Do not power the joystick from the adapter + screw. The catalogue joystick is a 5V analog part — Uno 5V is the correct source."}]$s18p9blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 9;

update public.project_steps as step
set
  stage_sort_order = 2,
  stage_title = $s18p10stage$Build the Electronics$s18p10stage$,
  title = $s18p10title$Check the Complete Circuit$s18p10title$,
  description = $s18p10desc$Before any sketch, the pin map should be complete: D9 pan, D10 tilt, A0/A1/D2 joystick, servo 5 V on servo VCC, common ground.$s18p10desc$,
  tip = null,
  blocks = $s18p10blocks$[{"type":"text","heading":"What “complete” means","body":"Every net below should exist once. Two browns may share the adapter − screw. Two reds may share the adapter + screw. D9 and D10 must not share a pin with each other or with SW."},{"type":"wiring","heading":"Complete wiring diagram","nodes":[{"id":"arduino","name":"Arduino Uno","illustrationId":"arduino-uno"},{"id":"psu","name":"Adafruit 368","illustrationId":"generic-module"},{"id":"pan","name":"Pan servo","illustrationId":"servo-sg90"},{"id":"tilt","name":"Tilt servo","illustrationId":"servo-sg90"},{"id":"joystick","name":"Joystick","illustrationId":"generic-module"}],"connections":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"connections","heading":"Exact connections","summary":"Pan D9 · tilt D10 · joystick A0/A1/D2","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]},{"type":"expected","heading":"Check","body":"You can trace Uno 5V to the joystick, the adapter + screw to both servo reds, the adapter − screw to both browns and to Uno GND, D9 to pan SIG, D10 to tilt SIG, A0 to VRx, A1 to VRy, and D2 to SW. There is no wire from the adapter + screw to Uno 5V."}]$s18p10blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 10;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18p11stage$Build the Program$s18p11stage$,
  title = $s18p11title$Create the Arduino Program$s18p11title$,
  description = $s18p11desc$Start with named pin constants and empty setup/loop. Later steps add behaviour without renaming pins.$s18p11desc$,
  tip = null,
  blocks = $s18p11blocks$[{"type":"text","heading":"What we are adding","body":"PAN_PIN, TILT_PIN, JOY_X_PIN, JOY_Y_PIN, and JOY_SW_PIN match the wiring: D9, D10, A0, A1, D2. Serial is opened at 9600 baud so later tests can print without changing the port settings."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":[],"code":"const int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Named constants keep the pin map in one place. Analog pins use A0 and A1 — that is the Uno label, not the number 0 and 1. setup() and loop() are empty on purpose until the next step attaches a servo."}]$s18p11blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 11;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18p12stage$Build the Program$s18p12stage$,
  title = $s18p12title$Add the Servo Library$s18p12title$,
  description = $s18p12desc$Servo.h is bundled with the Arduino IDE. Include it and attach the pan servo to D9. The pan servo will hold, not sweep, until the next step.$s18p12desc$,
  tip = $s18p12tip$You do not need Library Manager for Servo.h on an Uno.$s18p12tip$,
  blocks = $s18p12blocks$[{"type":"text","heading":"What we are adding","body":"#include <Servo.h> brings in the driver. Servo panServo; is the object. panServo.attach(PAN_PIN) tells that object to emit the control pulse on D9. Until you call write(), attach() typically sends a default mid pulse — keep fingers clear of the bracket."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n}\n\nvoid loop() {\n}"},{"type":"code_explanation","body":"Only pan is attached. Tilt is still a named pin with no Servo object. If the pan horn jumps when you later upload, that is the servo seeking the default pulse, not a wiring short. Leave the horn screw loose. After the servo settles, remove power, reseat the horn so the bracket is square, then tighten the screw."}]$s18p12blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 12;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18p13stage$Build the Program$s18p13stage$,
  title = $s18p13title$Control the Pan Servo$s18p13title$,
  description = $s18p13desc$Command pan to 90°, then sweep 60 / 90 / 120 so you can see one axis move before tilt is in the sketch.$s18p13desc$,
  tip = null,
  blocks = $s18p13blocks$[{"type":"text","heading":"What we are adding","body":"write(90) is mid-travel for a typical SG90. The loop then steps to 60, 90, and 120 with a 1 s pause so you can watch the base yaw. We stay away from 0 and 180 so a slightly mis-clocked horn does not stall the gearbox."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n  panServo.write(90);\n  delay(500);\n  Serial.println(\"Pan at 90.\");\n}\n\nvoid loop() {\n  panServo.write(60);\n  Serial.println(\"Pan 60\");\n  delay(1000);\n  panServo.write(90);\n  Serial.println(\"Pan 90\");\n  delay(1000);\n  panServo.write(120);\n  Serial.println(\"Pan 120\");\n  delay(1000);\n}"},{"type":"code_explanation","body":"Serial prints the commanded angle so you can match what you see to what the sketch asked for. If Serial says Pan 120 and the base barely moves, the fault is mechanical binding or power — not this write() call."},{"type":"expected","heading":"Check","body":"This sketch attaches and writes only panServo on D9. TILT_PIN is named but unused — leave the tilt signal wire on D10 from the electronics stage. Physical pan motion is confirmed later in Calibrate and Test."}]$s18p13blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 13;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18p14stage$Build the Program$s18p14stage$,
  title = $s18p14title$Control the Tilt Servo$s18p14title$,
  description = $s18p14desc$Attach the second Servo object on D10 and sweep tilt while pan holds 90°.$s18p14desc$,
  tip = null,
  blocks = $s18p14blocks$[{"type":"text","heading":"What we are adding","body":"Servo tiltServo; and tiltServo.attach(TILT_PIN) claim D10. setup() parks both axes at 90°. loop() sweeps only tilt so a pan fault and a tilt fault stay separable."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  Serial.begin(9600);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(90);\n  tiltServo.write(90);\n  delay(500);\n  Serial.println(\"Both servos at 90.\");\n}\n\nvoid loop() {\n  tiltServo.write(60);\n  Serial.println(\"Tilt 60\");\n  delay(1000);\n  tiltServo.write(90);\n  Serial.println(\"Tilt 90\");\n  delay(1000);\n  tiltServo.write(120);\n  Serial.println(\"Tilt 120\");\n  delay(1000);\n}"},{"type":"code_explanation","body":"Two Servo objects can run on one Uno. Each attach() consumes a timer channel — two SG90s is well within the limit. Pan stays at 90 so you can judge whether tilt is nodding on its own."},{"type":"expected","heading":"Expected result","body":"When this sketch runs, the camera plate nods through 60 / 90 / 120 while the base stays put. If the whole assembly yaws instead, the D9/D10 leads are swapped."}]$s18p14blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 14;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18p15stage$Build the Program$s18p15stage$,
  title = $s18p15title$Read Joystick Input$s18p15title$,
  description = $s18p15desc$Print the raw analog X/Y values and the switch. Servos hold 90° so you can trust the input without chasing motion.$s18p15desc$,
  tip = $s18p15tip$Resting X and Y are often near 512, but many modules sit somewhat above or below that. Note your rest values. A click should print SW 0.$s18p15tip$,
  blocks = $s18p15blocks$[{"type":"text","heading":"What we are adding","body":"analogRead returns 0–1023 on the Uno. VRx is A0, VRy is A1. INPUT_PULLUP on D2 makes the unpressed switch read HIGH (1). Pressing SW shorts to ground, so it reads LOW (0). Servos attach and park at 90 so they do not go limp during this test."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(90);\n  tiltServo.write(90);\n  Serial.begin(9600);\n  Serial.println(\"Joystick test. Servos hold 90.\");\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int sw = digitalRead(JOY_SW_PIN);\n\n  Serial.print(\"X \");\n  Serial.print(x);\n  Serial.print(\"  Y \");\n  Serial.print(y);\n  Serial.print(\"  SW \");\n  Serial.println(sw);\n\n  delay(200);\n}"},{"type":"code_explanation","body":"We still do not map the stick to angles. If X never changes when you move left/right, A0 is the fault. If Y is stuck at 0 or 1023, VRy may be sitting on 5V or GND instead of A1."},{"type":"text","heading":"Resting centre","body":"A centred stick is rarely exactly 512. Read Serial at rest and write down X and Y. In the combined sketch those numbers become JOY_X_CENTER and JOY_Y_CENTER so the deadzone sits around your module, not around an assumed midpoint."},{"type":"test","body":"When you upload this sketch later: rest the stick, move X, move Y, then click SW. Watch Serial at 9600 baud."},{"type":"expected","heading":"Expected result","body":"At rest, X and Y are often around 480–540 rather than exactly 512. Write those rest values down. Full left or right drives X toward 0 or 1023. Full up or down drives Y toward an extreme. SW prints 1 at rest and 0 while clicked."}]$s18p15blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 15;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18p16stage$Build the Program$s18p16stage$,
  title = $s18p16title$Map Joystick Values to Servo Angles$s18p16title$,
  description = $s18p16desc$Convert 0–1023 stick readings into 0–180 servo degrees so both axes follow the joystick.$s18p16desc$,
  tip = null,
  blocks = $s18p16blocks$[{"type":"text","heading":"What we are adding","body":"map(x, 0, 1023, 0, 180) scales the pan stick onto the servo range. The same mapping on y drives tilt. delay(20) is a short refresh so the servos are not flooded, but the stick still feels live."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nServo panServo;\nServo tiltServo;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int panAngle = map(x, 0, 1023, 0, 180);\n  int tiltAngle = map(y, 0, 1023, 0, 180);\n\n  panServo.write(panAngle);\n  tiltServo.write(tiltAngle);\n\n  Serial.print(\"Pan \");\n  Serial.print(panAngle);\n  Serial.print(\"  Tilt \");\n  Serial.println(tiltAngle);\n\n  delay(20);\n}"},{"type":"code_explanation","body":"This sketch has no deadzone and no mechanical limits. At rest the stick is rarely exactly 512, so the servos may creep. That is expected — the next step holds the last angle inside a deadzone around JOY_X_CENTER / JOY_Y_CENTER and clamps travel to 20–160."}]$s18p16blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 16;

update public.project_steps as step
set
  stage_sort_order = 3,
  stage_title = $s18p17stage$Build the Program$s18p17stage$,
  title = $s18p17title$Add Limits and Combine the Program$s18p17title$,
  description = $s18p17desc$Clamp travel, ignore stick noise around centre, and use the joystick click to return both axes to 90°.$s18p17desc$,
  tip = $s18p17tip$If an axis is reversed, swap that map() pair: map(x, 0, 1023, PAN_MAX, PAN_MIN).$s18p17tip$,
  blocks = $s18p17blocks$[{"type":"text","heading":"What we are adding","body":"PAN_MIN/MAX and TILT_MIN/MAX keep write() inside the bracket’s free range. DEADZONE of 40 around JOY_X_CENTER and JOY_Y_CENTER means a resting stick does not update the stored angle. Start those centres at 512; if Serial at rest was different, put those numbers in instead. Clicking SW (LOW) sets both stored angles back to 90. The servos hold the last aimed position when you let the stick go — that is what you want when framing a camera."},{"type":"code","language":"Arduino","filename":"pan_tilt.ino","libraries":["Servo"],"code":"#include <Servo.h>\n\nconst int PAN_PIN = 9;\nconst int TILT_PIN = 10;\nconst int JOY_X_PIN = A0;\nconst int JOY_Y_PIN = A1;\nconst int JOY_SW_PIN = 2;\n\nconst int PAN_MIN = 20;\nconst int PAN_MAX = 160;\nconst int TILT_MIN = 20;\nconst int TILT_MAX = 160;\nconst int PAN_CENTER = 90;\nconst int TILT_CENTER = 90;\nconst int JOY_X_CENTER = 512;\nconst int JOY_Y_CENTER = 512;\nconst int DEADZONE = 40;\n\nServo panServo;\nServo tiltServo;\n\nint panAngle = PAN_CENTER;\nint tiltAngle = TILT_CENTER;\n\nvoid setup() {\n  pinMode(JOY_SW_PIN, INPUT_PULLUP);\n  panServo.attach(PAN_PIN);\n  tiltServo.attach(TILT_PIN);\n  panServo.write(panAngle);\n  tiltServo.write(tiltAngle);\n  Serial.begin(9600);\n  Serial.println(\"Pan-tilt ready.\");\n}\n\nvoid loop() {\n  int x = analogRead(JOY_X_PIN);\n  int y = analogRead(JOY_Y_PIN);\n  int sw = digitalRead(JOY_SW_PIN);\n\n  if (sw == LOW) {\n    panAngle = PAN_CENTER;\n    tiltAngle = TILT_CENTER;\n  } else {\n    if (abs(x - JOY_X_CENTER) > DEADZONE) {\n      panAngle = map(x, 0, 1023, PAN_MIN, PAN_MAX);\n    }\n    if (abs(y - JOY_Y_CENTER) > DEADZONE) {\n      tiltAngle = map(y, 0, 1023, TILT_MIN, TILT_MAX);\n    }\n  }\n\n  panServo.write(panAngle);\n  tiltServo.write(tiltAngle);\n\n  Serial.print(\"Pan \");\n  Serial.print(panAngle);\n  Serial.print(\"  Tilt \");\n  Serial.println(tiltAngle);\n\n  delay(20);\n}"},{"type":"code_explanation","body":"This is the complete sketch. Pin map: D9 pan, D10 tilt, A0 VRx, A1 VRy, D2 SW. Behaviour: aim while the stick is deflected, hold when it is inside the deadzone around your joystick centres, recentre on a click. View Code on a finished project shows this same program."}]$s18p17blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 17;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s18p18stage$Calibrate and Test$s18p18stage$,
  title = $s18p18title$Upload the Program$s18p18title$,
  description = $s18p18desc$Board: Arduino Uno. Serial Monitor at 9600 baud. Plug in the GST18A05-P1J before you expect the servos to hold.$s18p18desc$,
  tip = $s18p18tip$If upload fails, try a data-capable USB cable and confirm Tools → Board is Arduino Uno.$s18p18tip$,
  blocks = $s18p18blocks$[{"type":"text","heading":"Before you upload","body":"Install the Arduino IDE if you do not already have it. Connect the Uno with a data-capable USB cable. In the IDE, set Tools → Board to Arduino Uno and Tools → Port to the COM/serial port that appeared when you plugged the board in. Include Servo.h is enough — do not install a third-party servo library for this sketch."},{"type":"text","heading":"How to upload","body":"Paste the combined sketch from the previous step. Plug in the GST18A05-P1J so the servos have 5 V. Click Upload, then open Serial Monitor at 9600 baud. Keep clear of the bracket; the servos will seek 90° on attach."},{"type":"test","body":"Upload once. Watch Serial for “Pan-tilt ready.”"},{"type":"expected","heading":"Expected result","body":"The IDE reports Done uploading. Serial prints “Pan-tilt ready.” Both servos should sit near mid-travel and hold, not chatter, with the stick at rest."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"No serial port","solution":"Use a data-capable USB cable. Install the Uno/CH340 driver if the OS never lists a port."},{"problem":"Upload error / avrdude","solution":"Close Serial Monitor, reselect the port, and confirm the board is Arduino Uno. Press reset once if the port was busy."},{"problem":"Board resets when servos move","solution":"Servo VCC is on Uno 5V or the supply is missing. Move both reds under the adapter + screw and confirm the − screw reaches Uno GND."}]}]$s18p18blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 18;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s18p19stage$Calibrate and Test$s18p19stage$,
  title = $s18p19title$Test Individual Movements$s18p19title$,
  description = $s18p19desc$Move the stick on one axis at a time. Confirm pan yaws the base and tilt nods the plate, and note if either axis is reversed.$s18p19desc$,
  tip = $s18p19tip$Keep the camera plate lightly loaded until direction is confirmed.$s18p19tip$,
  blocks = $s18p19blocks$[{"type":"test","body":"Leave the stick centred, then move only left/right. Watch the base. Return to centre, then move only up/down. Watch the plate. Click SW once."},{"type":"expected","heading":"Expected result","body":"Left/right yaws pan only. Up/down nods tilt only. At rest both hold. A click returns both to about 90°. Serial angles change while the stick is deflected and freeze inside the deadzone."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Pan moves when you intend tilt","solution":"Swap the VRx and VRy wires at A0/A1, or swap JOY_X_PIN and JOY_Y_PIN in the sketch. The module axes may not match how the bracket is sitting on the desk."},{"problem":"An axis moves the wrong way","solution":"Invert that map() pair (PAN_MAX then PAN_MIN, or TILT_MAX then TILT_MIN). Do not reverse the 5V/GND leads to “fix” direction."},{"problem":"One servo is dead","solution":"Confirm that servo’s red is on servo 5 V, brown on common GND, and orange on D9 (pan) or D10 (tilt). A swapped red/orange can damage a pin — power off before you reseat."}]}]$s18p19blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 19;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s18p20stage$Calibrate and Test$s18p20stage$,
  title = $s18p20title$Calibrate Neutral Positions$s18p20title$,
  description = $s18p20desc$Command 90°, then reseat each horn so mid-code is mid-mechanism: plate level, U-bracket square on the base.$s18p20desc$,
  tip = $s18p20tip$Loosen the horn screw, lift the horn off the spline, and press it back on. Do not rotate the servo shaft against a powered motor.$s18p20tip$,
  blocks = $s18p20blocks$[{"type":"text","heading":"Why the horn comes off","body":"write(90) is a pulse, not a promise about the plastic. If you tightened the horn at an arbitrary spline, “90” can be a tilted plate. Click SW (or power up into the combined sketch) so both servos hold 90°, then power down before you pull a horn if you are not confident working around a live servo."},{"type":"test","body":"With both servos holding 90°, loosen the pan horn and reseat the U-bracket square over the base. Then loosen the tilt horn and reseat the camera plate level. Retighten the horn screws. Power up and click SW again."},{"type":"expected","heading":"Expected result","body":"After a click, the plate is level and the U-bracket is square. Small stick moves should travel evenly both ways before you hit PAN_MIN/MAX or the plastic stops."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"90° is still tilted after reseating","solution":"The horn only fits in discrete spline positions. Choose the spline closest to level, then trim TILT_CENTER (and PAN_CENTER) by a few degrees in the sketch if you need a last nudge."},{"problem":"The joint binds before 20° or 160°","solution":"Raise PAN_MIN / TILT_MIN or lower PAN_MAX / TILT_MAX until the bracket never hits itself. Limits are meant to be tighter than the servo’s full range."}]}]$s18p20blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 20;

update public.project_steps as step
set
  stage_sort_order = 4,
  stage_title = $s18p21stage$Calibrate and Test$s18p21stage$,
  title = $s18p21title$Test Combined Movement$s18p21title$,
  description = $s18p21desc$Aim on both axes, hold, recentre, and confirm the pin map still matches the complete wiring diagram.$s18p21desc$,
  tip = null,
  blocks = $s18p21blocks$[{"type":"image","imageKey":"servoCamera","caption":"Keep this GPIO map if you mount a camera later: pan D9, tilt D10, joystick A0 / A1 / D2."},{"type":"test","body":"Aim toward one corner, let the stick go (it should hold). Aim toward the opposite corner. Click SW to recentre. Repeat once with a lightweight camera or webcam on the plate if you have one, or leave the plate empty."},{"type":"expected","heading":"Expected result","body":"Both axes move together while the stick is deflected, hold when centred, and return to a level 90° on a click. No reset, no gearbox grind, no lead pulling tight. You have a joystick-aimed pan-tilt mount."},{"type":"troubleshooting","heading":"If it doesn't work","items":[{"problem":"Servos chatter at rest","solution":"Increase DEADZONE (try 60), or set JOY_X_CENTER and JOY_Y_CENTER to the X and Y values Serial printed at rest. Confirm the joystick 5V is the Uno rail and GND is common. A floating VRx/VRy will never sit still."},{"problem":"Mechanism holds, then jumps","solution":"The servo supply is sagging or the plug is not seated. Use the GST18A05-P1J in the Adafruit 368, center positive, and keep both servo reds off the Uno 5V pin."},{"problem":"Click does nothing","solution":"Confirm SW is on D2 and JOY_SW_PIN uses INPUT_PULLUP. SW should read 0 only while pressed. If it is always 0, the pin is shorted to GND."},{"problem":"USB disconnects when the mount moves","solution":"The Uno is supplying servo current. Recheck that both VCC (red) wires are under the adapter + screw and that the − screw is tied to Uno GND."}]},{"type":"connections","heading":"Pin map you built","rows":[{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Breadboard","toPin":"+ logic rail","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"GND","toComponent":"Breadboard","toPin":"− rail","signal":"ground"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Pan servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Pan servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D9","toComponent":"Pan servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Adafruit 368","fromPin":"5V","toComponent":"Tilt servo","toPin":"VCC (red)","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Tilt servo","toPin":"GND (brown)","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"D10","toComponent":"Tilt servo","toPin":"SIG (orange)","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"5V","toComponent":"Joystick","toPin":"+5V","signal":"power"},{"fromComponent":"Arduino Uno","fromPin":"GND","toComponent":"Joystick","toPin":"GND","signal":"ground"},{"fromComponent":"Arduino Uno","fromPin":"A0","toComponent":"Joystick","toPin":"VRx","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"A1","toComponent":"Joystick","toPin":"VRy","signal":"signal"},{"fromComponent":"Arduino Uno","fromPin":"D2","toComponent":"Joystick","toPin":"SW","signal":"signal"}]}]$s18p21blocks$::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 21;
