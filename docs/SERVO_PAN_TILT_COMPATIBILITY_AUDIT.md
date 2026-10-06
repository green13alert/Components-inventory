# Servo Pan-Tilt Camera compatibility audit

Audit of project slug `18` against the compatibility architecture in `docs/COMPONENT_REQUIREMENTS_DESIGN.md` and the data created by `supabase/migrations/20261004210000_component_requirements_foundation.sql`.

This audit does not author requirements, reviews, pin rows, or substitutions. `matchProjectInventory()` is unchanged. Arduino Mega is not compatible with Arduino Uno.

Live database checks used for this document:

- Slug `18` BOM is seven lines, quantities below, and `is_published` was set by `20260928220000_servo_pan_tilt_camera.sql`.
- `project_requirements` rows for slug `18`: **0**.
- Capability rows exist for the six seeded boards only. `sg90`, `mg90s`, `joystick`, `pan-tilt-bracket`, `breadboard-psu`, `breadboard`, and `jumper-wires` have **no** capability rows.
- `pin_profile_pins` exist only on `uno_r3`: `D9` / `digital_output`, `5V` / `power`, `GND` / `ground`. Profiles `nano`, `mega2560`, `esp32_devkit`, `esp8266`, and `pico` have **no** pin rows.
- `requirement_substitution_reviews` was not seeded by the foundation migration and this audit does not insert any.

Walkthrough source is `constants/walkthroughs/servo-pan-tilt-camera.ts`. The live steps are `public.project_steps`: **24 steps, 5 stages**. The wiring layout is `constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts`, keyed by slug `18`, symbol `kind: 'arduino-uno'`.

---

## 1. Project summary

**Servo Pan-Tilt Camera**, slug `18`, is the only project these migrations mark published.

The build assembles a two-axis bracket around two SG90 servos, powers those servos from a breadboard PSU on a separate 5 V rail, and aims them from a 5 V analog joystick. The sketch is Arduino `Servo.h` on an Uno. Pin constants in every sketch stage are:

| Role | Label in the steps | Sketch constant |
| --- | --- | --- |
| Pan servo signal | D9 | `PAN_PIN = 9` |
| Tilt servo signal | D10 | `TILT_PIN = 10` |
| Joystick VRx | A0 | `JOY_X_PIN = A0` |
| Joystick VRy | A1 | `JOY_Y_PIN = A1` |
| Joystick switch | D2 | `JOY_SW_PIN = 2`, `INPUT_PULLUP` |

`analogRead` is described as 0–1023 on the Uno. `map(..., 0, 1023, ...)` scales that range. The finished sketch clamps travel to 20–160 and recentres to 90. Upload text says Tools → Board → Arduino Uno. `Servo.h` is the IDE bundle, not a third-party library.

Power text is a hard split: USB powers the Uno; Uno 5 V feeds only the logic/joystick rail; PSU 5 V feeds only servo VCC; the two + rails must not be linked; grounds are common. A 9 V snap is called too weak. The PSU input in the steps is a 6–12 V DC barrel adapter. Servo red and orange must not be swapped.

Mechanics are part of the project, not optional colour. The steps seat each SG90 in a kit pocket, use the servo lug screws, and clock horns on the spline. They forbid a continuous-rotation “360° servo”.

Canonical BOM from `project_components`:

| Sort | Slug | Quantity |
| --- | --- | --- |
| 1 | `arduino-uno-r3` | 1 |
| 2 | `sg90` | 2 |
| 3 | `joystick` | 1 |
| 4 | `pan-tilt-bracket` | 1 |
| 5 | `breadboard-psu` | 1 |
| 6 | `breadboard` | 1 |
| 7 | `jumper-wires` | 1 |

There is no requirement row, so buildability is still exact UUID matching.

---

## 2. BOM compatibility audit

### Arduino Uno R3 ×1

The walkthrough requires this board identity, not “a microcontroller”.

| Need | What the steps actually say |
| --- | --- |
| Board identity | “Arduino Uno”. Diagram symbol `arduino-uno`. IDE board “Arduino Uno”. |
| Logic voltage | Uno 5 V is the logic/joystick rail. Servo signals are measured against Uno ground. |
| D9 | Pan signal. `panServo.attach(9)`. Must be a pin `Servo.h` can pulse. |
| D10 | Tilt signal. `tiltServo.attach(10)`. Same, and it must not be the same pin as D9 or D2. |
| A0 | Joystick VRx. `analogRead` on the Uno, full-scale text 0–1023. |
| A1 | Joystick VRy. Same. |
| D2 | Joystick SW. `INPUT_PULLUP`. Unpressed reads HIGH, pressed reads LOW. |
| Power | USB powers the board. The 5 V pin must not supply the two servos. |
| Programming | Arduino IDE, `Servo.h`, 9600 baud Serial. |

Authored Uno capabilities that match this at board level: `function=development_board`, `logic_level_v=5`, `supply_v=5`, `gpio` includes `digital_input`, `digital_output`, `pwm_output`, and `analog_input`, `programming_environment=arduino_ide`, `board_package=arduino_avr_uno`, `adc_full_scale=1023`, `physical_form=uno_r3`, `header_profile=uno_r3`.

Authored Uno pins do **not** match the walkthrough pin map. The profile has D9 as `digital_output` only. It does not record D9 as `pwm_output`, and it has no D10, A0, A1, or D2.

### SG90 Micro Servo ×2

| Need | What the steps actually say |
| --- | --- |
| Electrical | Two separate position servos. Each has red VCC, brown or black GND, orange or yellow signal. |
| Signal | A hobby-servo pulse from D9 and D10. `write(90)` means mid-travel and hold, about 0–180°. The signal pin does not supply motor current. |
| Power | Both reds on the PSU 5 V rail, not Uno 5 V. Shared ground with the Uno. Two stalling SG90s are described as enough to reset a USB-powered Uno. |
| Mechanical | Body fits the kit pocket and lug holes. Short lug screws only. Output spline takes the kit horn. Lead exits a cable notch. |
| Kind | Position servo. A continuous-rotation servo is explicitly rejected. |

Catalogue text is only “9g hobby servo motor”, `type: 'servo'`. The database has no `servo_kind`, `supply_v`, or `physical_form` row for `sg90`. Quantity 2 is on the BOM line. The evaluator will not add SG90 and MG90S together to make 2.

### Analog Joystick Module ×1

| Need | What the steps actually say |
| --- | --- |
| Supply | +5 V from the Uno logic rail, not the servo PSU rail. |
| Outputs | VRx and VRy are analog axes. The sketch assumes the Uno ADC range 0–1023, rest near the middle, extremes toward 0 and 1023. |
| Switch | SW to D2, active-low with `INPUT_PULLUP`. |
| Pins | Steps say KY-023 is usually GND, +5 V, VRx, VRy, SW. Match the labels. |
| Logic | 5 V module on the Uno rail. |

No capability rows and no pin profile exist for `joystick`. The catalogue description is “Two-axis analog joystick with select switch”. Aliases include `ky-023`. Aliases are not capabilities.

### Breadboard Power Supply ×1

| Need | What the steps actually say |
| --- | --- |
| Output | A 5 V rail for both servo reds. The 3.3 V jumper is turned off unless the module’s own docs say otherwise. |
| Role | External servo supply. It must not back-feed the Uno 5 V pin. |
| Input | 6–12 V DC barrel adapter. A 9 V snap is rejected as too weak under stall. |
| Form | “Clip the breadboard PSU onto the rails if it is an MB102-style module.” Catalogue aliases include `mb102`. |

No capability rows. `supply_v` in the model means the voltage a part must be powered from, not the voltage a supply produces. There is no output-voltage capability.

### Breadboard ×1

| Need | What the steps actually say |
| --- | --- |
| Form | Solderless breadboard with long-edge + and − rails. |
| Electrical | One + rail is Uno 5 V logic. The other + rail is PSU 5 V. Those + rails must stay separate. Some boards have rail-link clips that must be removed. Both − rails are tied together. |
| Mechanical | The PSU must be able to clip onto or reach those rails. |

No capability rows. One `physical_form` token cannot say “two + rails that are not tied.”

### Jumper Wires ×1

| Need | What the steps actually say |
| --- | --- |
| Role | Interconnect for the rails and the five signal/power nets. Quantity 1 means one pack, per the BOM comment on jumper wires. |
| Form | Catalogue name is Dupont jumper wires. Aliases include “male to male”. The steps do not call out a gender, but the Uno headers, joystick pins, and PSU pins in the diagram are header pins. |

No capability rows. Connector gender is not a capability key. The design left jumper gender out of the model on purpose.

### Pan-Tilt Bracket Kit ×1

| Need | What the steps actually say |
| --- | --- |
| Form | Base (pan), U-bracket, camera plate, horns, and short screws. |
| Servo fit | Pockets and lug holes for the two SG90 bodies. Catalogue description: “Two-axis bracket kit for SG90 servos.” |
| Geometry | Pan shaft up through the base. Tilt shaft sideways to the plate. Horns clock on the servo spline. Travel limits 20–160 exist because the plastic stops before 0–180. |
| Substitution | A different bracket is a different assembly chapter. The steps are the kit. |

No capability rows. No field for pocket size, lug spacing, spline count, or travel stop angle.

---

## 3. Electrical requirements

These are the electrical facts the walkthrough depends on. They are not yet requirement constraints.

| Net or rule | Electrical content |
| --- | --- |
| Logic rail | Uno 5 V to joystick +5 V and the logic + rail. |
| Servo rail | PSU 5 V to both servo reds. Not connected to Uno 5 V. |
| Ground | PSU GND, Uno GND, both servo browns, and joystick GND are one net. |
| Pan / tilt signals | Servo control pulses on D9 and D10. Motor current stays on the red wire. |
| Joystick analogs | VRx → A0, VRy → A1. Scale used in code is 0–1023. |
| Joystick switch | SW → D2, `INPUT_PULLUP`, pressed = LOW. |
| ADC | Steps state 0–1023 on the Uno. `adc_full_scale=1023` is authored for Uno, Nano, and Mega only. |
| Servo kind | Position hold. Continuous rotation does not implement `write(90)`. |
| Joystick voltage | The module is wired as a 5 V part. |

Current and stall are prose (“two SG90s can stall well above what USB 5 V should supply”). There is no milliamp capability, and the design kept current out of the model. The representable form is the `supply_rail=external_5v` constraint on the servo requirement, which already exists as a constraint key.

---

## 4. Physical and mechanical requirements

Electrical agreement does not make these interchangeable.

| Part | Physical fact in the steps | Electrical match is not enough because |
| --- | --- | --- |
| Uno | Header positions in the slug `18` diagram. Symbol `kind: 'arduino-uno'`. | Another 5 V AVR board is a different body and a different drawing. |
| SG90 | Pocket, lug holes, spline, three-wire lead colours, cable notch. | A positional servo with the wrong body does not sit in this bracket. |
| Joystick | Labelled header, usually KY-023 order. | A 5 V two-axis stick with a different pin order changes the wiring sentences. |
| PSU | Clips to breadboard rails, 5 V and 3.3 V jumpers, barrel jack. | A bare 5 V regulator is a different construction. |
| Breadboard | Two separable + rails and a common − rail. | A board whose + rails are permanently tied contradicts the power chapter. |
| Jumpers | Pack of Dupont jumpers for these headers. | Gender is not even stored. One catalogue row is the whole class. |
| Bracket | Base, U, plate, horns, short screws, SG90 pockets. | This is the mechanical project. A different kit is a different walkthrough. |

---

## 5. Current database representation

| Project fact | Class | Why |
| --- | --- | --- |
| Canonical part and quantity, including SG90 ×2 | Representable now | `project_components` already stores them. A requirement points at that line. Policy `exact` reproduces today’s match. |
| Uno 5 V logic | Representable now | `logic_level_v=5` is authored on `arduino-uno-r3`. A constraint can require it. |
| Arduino IDE and Uno board package | Representable now | `programming_environment` and `board_package` are authored. |
| Uno ADC 0–1023 | Representable now | `adc_full_scale=1023` is authored on the Uno. |
| Board has some digital, PWM, and analog pins | Representable now | Those `gpio` values are authored on the Uno. They do not name D9, D10, A0, A1, or D2. |
| D9 is a digital output | Representable now | `uno_r3` has that pin row. |
| D9 and D10 are the servo pulse pins | Partially representable | `pwm_output` is an allowed pin function, but D9 is not stored as PWM and D10 is absent. |
| A0 and A1 are analog inputs | Partially representable | `analog_input` is an allowed pin function. Those labels are not on `uno_r3`. |
| D2 is a digital input | Partially representable | `digital_input` is allowed. D2 is not on `uno_r3`. |
| 5 V and GND pins on the Uno | Representable now | Both rows exist. |
| Servo supply must be the external 5 V rail | Representable now | `supply_rail` is a constraint key, not a component capability. |
| Servo is positional | Representable now as a key, not as data | `servo_kind` is an allowed capability. `sg90` has no row. No continuous-rotation component exists. |
| SG90 body / lug / spline | Partially representable | `physical_form` can hold a token such as `sg90_body`. It cannot store pocket, lug spacing, or spline count. |
| Joystick is a 5 V, two-axis, switched module | Partially representable | `function` and `supply_v` can be authored later. Pin order can be a pin profile, because `pin_profiles.component_id` is not limited to boards. None of that data exists. The 0–1023 range belongs on the controller’s ADC, not on the joystick. |
| PSU produces 5 V from 6–12 V and clips on | Not representable | `supply_v` is the voltage a load needs, not a supply’s output. Input range, output voltage, and clip-on jumpers have no keys. |
| Breadboard has two separable + rails | Not representable | A single `physical_form` token cannot say the rails are separable. |
| Jumper gender | Not representable | Left out of the capability list. “Male to male” is a search alias. |
| Bracket pocket, U-bracket, horn, travel stops | Not representable | No geometry fields. The accurate policy is `exact`. |
| Dual-rail wiring chapter and Uno diagram | Not representable as a capability | They are walkthrough and layout data. A conditional result needs review change rows (`supply`, `pin_map`, `board_package`, `diagram`, `code`). The variant table does not exist yet. |
| Slug 18 requirement layer | Not authored | Zero `project_requirements` rows. The evaluator is not consulted by buildability. |

`type` and `category` in the TypeScript catalogue are not evaluator inputs. `type: 'servo'` on both `sg90` and `mg90s` must not be read as compatibility.

---

## 6. Potential substitution candidates

Nothing below is approved. No review exists. Empty pin profiles mean the evaluator cannot verify D9, D10, A0, A1, or D2 on any non-Uno board.

### Controller

| Candidate | Class | Why, using authored data and the walkthrough |
| --- | --- | --- |
| `arduino-mega` | Insufficient information | Authored facts that do match a 5 V Arduino-IDE reading of this project: `logic_level_v=5`, `adc_full_scale=1023`, `gpio` includes digital input, digital output, PWM, and analog input, `programming_environment=arduino_ide`. Authored facts that block a direct result: `board_package=arduino_avr_mega2560`, `physical_form=mega2560`, `header_profile=mega2560`. The Mega pin profile has no pins, so D9, D10, A0, A1, and D2 are not known to the database. Servo.h behaviour on those Mega pins is not authored. |
| `arduino-nano` | Insufficient information | Same pattern as the Mega: 5 V, ADC 1023, the four gpio tokens, Arduino IDE, and a different package, form, and header. The Nano profile has no pins. |
| `esp32` | Clearly incompatible with a 5 V logic constraint | Authored `logic_level_v=3.3` and `supply_v=3.3`. This project’s joystick is wired to Uno 5 V and the steps teach a 5 V logic domain. `adc_full_scale` is absent, so the 0–1023 map is also unknown. No pin rows. |
| `esp8266` | Insufficient information | Voltage, ADC full scale, PWM, and analog input were left unauthored. It does have `digital_input` and `digital_output` only. That partial gpio list must not be read as “this chip has no ADC”. No pin rows. |
| `raspberry-pi-pico` | Insufficient information | No logic level, no ADC full scale, no PWM or analog gpio rows, and no `programming_environment`. The sketch is `Servo.h` in the Arduino IDE. No pin rows. |

What would have to be authored before any of these could become a supported variant, and still would not make them compatible today:

| Board | Wiring | Pins | Power | Code | Steps and diagram | Physical |
| --- | --- | --- | --- | --- | --- | --- |
| Mega | New connection labels. The current layout aliases include `arduino`, which will bind the word Arduino to the Uno symbol. | Pin rows for the five roles, including PWM on the two servo pins and analog on the two joystick axes. Not in the database. | Still a separate servo 5 V rail and a 5 V joystick rail. Mega `logic_level_v` is 5, so the 5 V domain is the authored part. Servo current from the Mega 5 V pin is still forbidden by the steps. | Board package `arduino_avr_mega2560`. Whether `Servo.attach` on pins 9 and 10 matches this sketch is not authored. `analogRead` 0–1023 matches the authored ADC. | IDE text, pin sentences, and a non-Uno diagram. `WiringSymbolKind` has `arduino-uno` only. | `physical_form=mega2560`. The Uno reference photo cannot be reused. |
| Nano | Same as Mega, with package `arduino_avr_nano`. | Insufficient information. | Authored logic level is 5. Servo current still must not come from the board 5 V pin. | Board menu and pin check are unauthored. | Same diagram gap. | `physical_form=nano`. |
| ESP32 | Joystick cannot stay on a 5 V instruction while the board’s authored supply is 3.3 V. | No pins authored. GPIO numbers in this sketch are Uno labels. | Would need a different joystick supply chapter. Servo rail rule remains. | `adc_full_scale` is missing, so `map(..., 0, 1023, ...)` is not known to be valid. `Servo.h` on `board_package=esp32` is not authored. | Full pin, power, and code variant. | `physical_form=esp32_devkit`. |
| ESP8266 | Do not infer a pin map or a voltage. | No pins. PWM and analog are not authored. | Voltage unknown. | Not authored. | Not authored. | No `physical_form`. |
| Pico | Do not infer a pin map or a voltage. | No pins. | Voltage unknown. | `programming_environment` is absent. This sketch is Arduino `Servo.h`. | Not authored. | No `physical_form`. |

### Other BOM lines

| Canonical part | Catalogue neighbour | Class |
| --- | --- | --- |
| `sg90` ×2 | `mg90s` | Insufficient information. Metal-gear micro servo in the catalogue, same `type: 'servo'`, same illustration id. No `servo_kind`, no `physical_form`, no lug or spline data. The bracket sentence names SG90. Quantity cannot be split across the two slugs. |
| `sg90` | `dc-motor`, `stepper-28byj` | Not substitutes. Different catalogue parts. The steps require a servo that holds an angle. Those rows have no capability data, so the evaluator cannot prove incompatibility until `function` or `servo_kind` is authored. They are not candidates. |
| `sg90` | Continuous-rotation servo | Clearly incompatible with the walkthrough. There is no catalogue row for one. |
| `joystick` | none | No second joystick row. No meaningful catalogue substitute. |
| `breadboard-psu` | `lm7805` | Not a direct substitute. The steps require a rail-clip module, a 5 V/3.3 V jumper, and a 6–12 V barrel input. `lm7805` is a linear regulator with no capability rows. Output voltage is not a capability key, so the evaluator also lacks the data. |
| `breadboard-psu` | `9v-battery-clip` | Clearly incompatible with the power chapter. The steps say a 9 V snap is too weak for two stalling SG90s. |
| `breadboard` | none | One breadboard row. |
| `jumper-wires` | none | One pack row. No meaningful substitution inside the catalogue. Gender is not stored. |
| `pan-tilt-bracket` | none that fit | No second bracket. Compatibility should not be opened for this line. The steps are the kit’s geometry. |

---

## 7. Missing information

- Slug `18` has no requirement, constraint, or pin-role rows.
- Uno profile is missing D10, A0, A1, D2, and PWM on D9.
- Nano, Mega, ESP32, ESP8266, and Pico profiles have no pins.
- ESP8266 and Pico have no authored logic level. Do not fill in 3.3 V.
- ESP32 and those two boards have no `adc_full_scale`. The sketch’s 0–1023 map is Uno text plus AVR rows only.
- `sg90` has no `servo_kind` or `physical_form`.
- `mg90s` has no capabilities at all. Fit in the SG90 bracket is unknown.
- Joystick, PSU, breadboard, jumpers, and the bracket have no capabilities and no pin profiles.
- No review, no change list, and no walkthrough variant.
- The wiring symbol set cannot draw a non-Uno controller.
- Servo.h timer behaviour on Mega or Nano is not in the project data.

---

## 8. Risks of false compatibility

| Risk | What would go wrong on this project |
| --- | --- |
| Board-level gpio treated as the pin map | Uno, Mega, and Nano all have `pwm_output` and `analog_input` as board capabilities. That does not place pan on D9 and tilt on D10. |
| D9 `digital_output` treated as the servo pin | The only servo-related Uno pin row is D9 as a digital output. Servo.h needs the pulse the steps describe. D10 is absent, so tilt is invisible to the evaluator. |
| `logic_level_v=5` treated as “can power the servos” | `supply_v=5` on the Uno is the board rail. The steps forbid using it for servo VCC. |
| `development_board` plus Arduino IDE | Would group the Uno with the ESP32, whose authored logic level is 3.3 V. |
| Partial gpio rows read as incompatibility | ESP8266 and Pico only stored digital input and output so those values would not be guessed. A constraint of `gpio=analog_input` would see the `gpio` key and a different value, and today’s evaluator returns `incompatible`. That would be a false incompatibility. |
| `type: 'servo'` or the shared SG90 illustration | `mg90s` is not the SG90 body the bracket text names. |
| Search alias `servo` on `sg90` | Would collapse other servos into one catalogue hit. The evaluator does not read aliases. A future authoring pass must not copy that alias into `servo_kind`. |
| Wiring alias `arduino` | `findElement()` can attach a Mega label to the Uno symbol. A variant must not reuse this layout. |
| Joining the 5 V rails because both sides are “5 V” | The steps say that back-feeds the Uno. A compatibility result that ignores `supply_rail` would hide that. |
| Opening the bracket or the PSU to substitution | Geometry and the MB102 clip are the walkthrough. A 5 V regulator is not that module. |

---

## 9. Recommendation

Do not author substitution for slug `18` yet. It is the published project, and the risky lines are mechanical and power, not a single digital output.

When requirements are added, every current BOM line should be policy `exact`:

- The controller, until Uno pin rows exist for D9 as the servo pulse, D10, A0, A1, and D2, and until a variant exists for any other board.
- Both SG90s, until `servo_kind=positional` is authored and bracket fit is still exact.
- The joystick, the PSU, the breadboard, the jumper pack, and the bracket.

Do not insert a Mega, Nano, ESP32, ESP8266, or Pico review. Do not treat `mg90s` as half of the quantity-2 servo line.

Slug `18` is a poor first substitution project. The blink project’s single digital output was the smaller case. This one adds two servo pulses, two analog inputs, a pulled-up switch, a split 5 V power system, `Servo.h`, and a bracket.

---

## 10. Is the current architecture sufficient?

**Yes, with authored constraints and reviews**, if non-controller lines stay `exact` and the controller is not opened until the missing Uno pin rows exist.

That is data in tables that already exist: `project_requirements`, constraints, pin roles, and `pin_profile_pins`. It is not a new table. Policy `exact` is an accurate statement of this published walkthrough: the steps were written for these parts.

No schema extension is required before that exact representation.

A small extension is required only if a later phase tries to mark something other than the controller substitutable:

| Line | Smallest missing piece | Why the current keys fail |
| --- | --- | --- |
| Breadboard PSU | An output-voltage capability, separate from `supply_v` | `supply_v` means the voltage a load needs. The PSU’s job is to produce 5 V. |
| Breadboard | A way to say the two + rails can be kept separate | One `physical_form` token cannot say that. |
| Bracket | Do not extend the schema for this yet | Keep policy `exact`. Pocket and spline geometry are a different model. |

None of those extensions should be built before a real substitution is chosen. Slug `18` does not need them to stay correct under exact matching.
