# Component requirements and capabilities

Design for a requirement layer and a capability layer on top of Solderi’s current exact BOM. This document follows `docs/COMPONENT_COMPATIBILITY_AUDIT.md` and the tables, matcher, walkthroughs, and wiring layouts that exist today.

Nothing here is implemented. No migration, catalogue row, BOM row, walkthrough, wiring layout, visual-reference file, or React Native screen is changed by this document.

`project_components` stays the canonical bill of materials: the exact catalogue part the walkthrough was authored against. A new requirement row describes what that BOM line is asking for, and which substitutions that one project line will accept. Compatibility is computed for that requirement. It is not a standing claim that one catalogue part replaces another.

---

## 1. What stays as it is

| Existing object | Role after this design |
| --- | --- |
| `public.components` | One physical catalogue part. UUID primary key, unique `slug`. |
| `public.inventory_items` | What a user owns. `(user_id, component_id)` unique. `quantity` is the count. |
| `public.project_components` | Canonical BOM. One exact `component_id`, `quantity >= 1`. |
| `public.project_steps` | Canonical walkthrough, including wiring strings, code, and component lists written for that BOM. |
| `constants/wiring-diagrams/layouts/*` | Canonical diagram geometry for project slugs `8` and `18`, drawn as specific symbols (`kind: 'arduino-uno'`). |
| `matchProjectInventory()` | Exact UUID match. Remains the buildability path for every project that has no requirement rows, and for every requirement whose policy is `exact`. |
| Catalogue `category`, search `aliases`, and TypeScript `type` | Browsing and search only. The matcher does not read them. |

Authored BOMs today:

| Project | Slug | Published | Canonical controller |
| --- | --- | --- | --- |
| Smart Plant Monitor | `1` | no | `arduino-uno-r3` |
| Weather Station | `4` | no | `esp32` |
| Motion Sensor Alarm | `8` | no | `arduino-uno-r3` |
| Blinking LED | `11` | no | `arduino-uno-r3` |
| Traffic Light | `12` | no | `arduino-uno-r3` |
| Night Lamp | `14` | no | `arduino-uno-r3` |
| Servo Pan-Tilt Camera | `18` | yes | `arduino-uno-r3` |

Slug `11`’s circuit, in the authored steps, is Uno pin `D9` → resistor → LED anode, cathode → GND, HIGH described as about 5 V, upload target “Arduino Uno”. Slug `4` powers sensors from 3.3 V and calls `Wire.begin(21, 22)`. Slug `8` drives an active buzzer with `digitalWrite`. Slug `18` uses two positional SG90s on `D9`/`D10`, joystick on `A0`/`A1`/`D2`, and an external 5 V rail for servo current.

Those sentences are the constraints. Names and categories are not.

---

## 2. Two layers

```text
Project
  └─ project_components                 canonical BOM line
        Arduino Uno R3 × 1              exact part the steps name
        └─ project_requirements         what this line needs
              role: microcontroller
              policy: exact | direct | conditional
              constraints: 5 V GPIO, digital output, …
              canonical part: Arduino Uno R3
              pin role: led_output = D9 on the canonical board
```

The BOM line does not become “any microcontroller”. The requirement points at that BOM line and repeats its component as the canonical part, so the walkthrough, the diagram symbol, and the default visual still have one authored part.

A second catalogue component can satisfy the requirement only when the policy allows it, the capability rows support it, and a per-requirement review says so. Owning an Arduino Mega 2560 does not satisfy an Uno BOM line by itself.

---

## 3. Capabilities

Capabilities are facts about one catalogue component. They live in rows, not in the component name, description, alias list, `category`, or TypeScript `type`.

A missing row means unknown. Unknown does not satisfy a constraint.

Each capability below is structured. Free text is not used for matcher input. Authoring notes can sit in a separate `notes` column that the matcher ignores.

`components.category` stays the browsing column it already is (`microcontrollers`, `sensors`, `actuators`, `displays`, `power`, `modules`). It is not copied into the capability table and it is not a constraint.

### `function`

What the part actually is, finer than category.

Tokens already justified by the catalogue and the authored projects: `development_board`, `positional_servo`, `indicator_led`, `fixed_resistor`, `dht22`, `dht11`, `bmp280`, `pir_module`, `analog_joystick`, `i2c_oled_ssd1306`, `breadboard`, `breadboard_psu`. `active_buzzer` is reserved until the single `buzzer` row is split. Do not store it on today’s `buzzer` row. That row’s name is “Piezo Buzzer” and its aliases include “active buzzer”, which is too ambiguous to treat as data.

Solderi needs this because `type: 'development_board'` groups the Uno with the ESP32 and the Pico, and `type: 'servo'` groups the SG90 with the MG90S.

Used by any requirement that is allowed to substitute. Slug `11` would require `development_board`. Slug `18` would require `positional_servo` if that line ever leaves `exact`. Slug `8` cannot require `active_buzzer` until the catalogue can say it truthfully.

Required on a component before that component may satisfy a non-exact requirement. Optional on parts that stay on an `exact` policy.

Structured token. One value per component.

### `logic_level_v`

The GPIO / signal high this part uses or tolerates, in volts. Stored as a numeric token: `5` or `3.3`.

Slug `11`, `1`, `8`, `12`, `14`, and `18` are written as 5 V Uno logic. Slug `4` states that ESP32 GPIO is 3.3 V and that the BMP280 must not be powered from 5 V.

Required on boards and on sensors or actuators before they can be candidates. Optional on jumpers and on the generic breadboard.

Structured. One value in the first version. A part that is genuinely 5 V-tolerant and 3.3 V-native gets two rows only after that is written down; it is not inferred from “Arduino-compatible”.

### `supply_v`

The supply voltage the part must be powered from. Same numeric tokens.

The blink LED’s GPIO side is covered by `logic_level_v`. `supply_v` matters for modules: DHT and PIR on Uno 5 V in slugs `1` and `8`, DHT and BMP280 on 3.3 V in slug `4`, joystick on Uno 5 V and servos on a separate 5 V rail in slug `18`.

Required before a sensor, actuator, or board can be a substitute. Optional on passives.

Structured.

### `gpio`

Atomic pin functions the part exposes: `digital_input`, `digital_output`, `pwm_output`, `analog_input`.

Several rows are allowed. Slug `11` needs `digital_output`. Slug `8` needs `digital_input` and `digital_output`. Slug `14` needs `analog_input` and `digital_output`. Slug `18` needs `pwm_output` and `analog_input`.

“Has GPIO” is not a value. An ESP32 has digital outputs and still fails a 5 V blink constraint on `logic_level_v`.

Required on development boards that are candidates. Optional on parts that are not boards.

Structured tokens, one row per function.

### `interface`

Bus or signalling style: `i2c`, `one_wire`, `spi`, `uart`.

Slug `1` uses one-wire (DHT22) and I2C (OLED on A4/A5). Slug `4` uses one-wire and I2C (GPIO 21/22). The blink project does not use this capability.

Required only when a requirement lists it. Optional otherwise. Not seeded for the blink experiment.

Structured tokens, one row per interface.

### `programming_environment` and `board_package`

`programming_environment`: `arduino_ide` in the first version. `board_package`: `arduino_avr_uno`, `arduino_avr_nano`, `arduino_avr_mega2560`, `esp32`, `esp8266`, `rp2040_pico`.

Every authored sketch is an `.ino` file, and the upload steps name the board. Slug `11` says “Select Arduino Uno”. Pico is in the catalogue and has no sketch in these projects.

Required on development boards before they can be candidates. Optional on sensors.

A different `board_package` from the canonical part is a software change. It cannot be a direct substitute while the steps still name the canonical board.

Structured tokens. One `board_package` per board.

### `adc_full_scale`

The integer range the current sketches teach for `analogRead`. Slugs `14` and `18` say 0–1023 on the Uno.

Required on a board before it can satisfy an analog requirement (slugs `14` and `18`). Optional for slug `11`, which never calls `analogRead`.

Structured integer, stored as text `1023`.

### `resistance_ohms`

Integer ohms for a specific resistor. Slug `8` already points at `resistor-220`. The generic `resistor` row used by slugs `1`, `11`, `12`, and `14` has no value. Leave it empty. Do not invent 220 Ω for that row.

Required only when a requirement names a value. Optional, and absent, on `resistor`.

Structured integer.

### `servo_kind`

`positional` or `continuous`.

Slug `18` forbids a continuous-rotation servo in the step text. `sg90` can carry `positional` only as a catalogue fact about that part. It does not mean `mg90s` fits the pan-tilt bracket. The bracket line stays `exact`.

Required on servos before a servo requirement leaves `exact`. Optional until then. Not part of the blink experiment.

Structured token.

### `physical_form`

The body or header the pictures and mechanical steps assume. Tokens: `uno_r3`, `nano`, `mega2560`, `esp32_devkit`, `sg90_body`, `through_hole_led`, `breadboard_module`.

Slug `18` seats an SG90 in a bracket pocket. Slug `8` and `18` diagrams use `kind: 'arduino-uno'`. A Mega is a different outline even when a digital pin is also labelled D9.

Required before a non-exact requirement may treat the part as a substitute. Optional while the policy is `exact`.

A different `physical_form` from the canonical part blocks `direct`. The steps and the symbol show a specific object.

Structured token.

### `header_profile`

The id of that part’s pin profile (`uno_r3`, `nano`, `mega2560`, `esp32_devkit`). This is a foreign key in practice, stored as the capability value `header_profile` = profile id, and also as `pin_profiles.component_id`. One board has one profile.

Required on boards before substitution. Optional on non-boards.

Structured id. Pin labels themselves live in `pin_profile_pins`, not in this value.

### Power and current

No milliamp column in the first model. The authored hazard in slug `18` is a project rule: servo VCC comes from the breadboard PSU, not from the Uno 5 V pin. That is a requirement constraint, `supply_rail`, not a property guessed from the name “SG90”.

`supply_rail` values, stored on the requirement: `mcu_5v`, `mcu_3v3`, `external_5v`.

Slug `11` does not need `external_5v`. The LED is a GPIO load through a resistor. Slug `18` needs `external_5v` on the servo requirement and `mcu_5v` on the joystick requirement.

### Left out on purpose

Protocol speeds, I2C addresses, PWM frequency, servo torque, pin current in milliamps, breadboard hole counts, Wi-Fi, and jumper gender. Slug `4`’s sketch does not use Wi-Fi. OLED address `0x3C` and BMP280 addresses `0x76` / `0x77` stay in the sketches until a display or sensor requirement is actually opened. Jumper wires and the breadboard stay exact BOM lines.

### How a set is stored

One table, one atomic value per row, unique `(component_id, capability, value)`.

`gpio = digital_output` and `gpio = pwm_output` are two rows. A single text blob of comma-separated functions is not used, because the matcher would have to parse prose.

| Capability | Cardinality | Example row |
| --- | --- | --- |
| `function` | one | `development_board` |
| `logic_level_v` | one, unless both voltages are explicitly authored | `5` |
| `supply_v` | one | `5` |
| `gpio` | many | `digital_output` |
| `interface` | many | `i2c` |
| `programming_environment` | one | `arduino_ide` |
| `board_package` | one | `arduino_avr_uno` |
| `adc_full_scale` | one | `1023` |
| `resistance_ohms` | one | `220` |
| `servo_kind` | one | `positional` |
| `physical_form` | one | `uno_r3` |
| `header_profile` | one | `uno_r3` |

---

## 4. Pin profiles

A pin profile lists headers that exist on one board. It does not say that the board can replace another board.

```text
pin_profiles
  uno_r3      → component arduino-uno-r3
  mega2560    → component arduino-mega
  esp32_devkit → component esp32

pin_profile_pins
  uno_r3    D9   digital_output, pwm_output
  uno_r3    A4   analog_input, i2c_sda
  mega2560  D9   digital_output, pwm_output
  mega2560  20   i2c_sda
  esp32_devkit  GPIO21  i2c_sda
```

The requirement, not the profile, names the project’s logical role and the label the canonical steps use:

```text
slug 11 requirement pin role
  role_key: led_output
  required function: digital_output
  canonical label: D9          ← what the blink sketch and steps say
```

Evaluation against a candidate profile:

- The profile must contain at least one pin with the required function.
- If the only such pins use a different label than the canonical label, the candidate needs a pin-map change.
- If no pin has the function, the candidate is incompatible with this requirement.
- The same Mega profile can satisfy `led_output → D9` on slug `11` and fail `i2c_sda → A4` on slug `1`, because those are different requirement rows.

Slug `11` has no wiring layout today. Slugs `8` and `18` do, and those layouts are Uno-shaped. A profile match does not redraw them.

---

## 5. Requirements

A requirement is one canonical BOM line, re-described for evaluation.

| Field | Meaning |
| --- | --- |
| Project | `project_id`, and the linked `project_components` row. |
| Role | A short token: `microcontroller`, `led`, `series_resistor`, `positional_servo`. Display still uses the catalogue name. |
| Quantity | Taken from `project_components.quantity`. Not copied, so the two cannot drift. |
| Canonical component | `project_components.component_id`. The part the steps were written for. |
| Policy | How far substitution may go for this line. Section 6. |
| Constraints | Capability rows this project requires. Section 3 keys only. |
| Pin roles | Logical roles and the canonical pin labels. |
| Substitution | Allowed only inside the policy, and only after a review row for this requirement. |
| Changes | Required whenever the candidate differs in board package, header profile, physical form, logic level, supply, or pin label. Those changes live on a review, not on the requirement itself. |

First version is one requirement per BOM line. Unique on `project_component_id`. A project can have zero requirement rows; it then stays on `matchProjectInventory()`.

Slug `18` quantity 2 on `sg90` remains “two of the canonical part” while that line’s policy is `exact`. The requirement does not say “two servos of any kind”.

### Constraints

A constraint is `(capability, value)` the candidate must have as a capability row.

Slug `11` microcontroller, once the policy is opened:

| Capability | Value | Why this project |
| --- | --- | --- |
| `function` | `development_board` | The sketch is a board program, not a sensor. |
| `logic_level_v` | `5` | The steps say HIGH is about 5 V on an Uno. |
| `gpio` | `digital_output` | `digitalWrite` on the LED pin. |
| `programming_environment` | `arduino_ide` | The sketch is `.ino`. |

It does not constrain `adc_full_scale`, `interface`, or `resistance_ohms`.

Slug `4`’s controller, when that project is migrated later, constrains `logic_level_v = 3.3`, `interface = i2c`, `interface = one_wire`, and `board_package = esp32`. An Uno fails the 3.3 V and board-package constraints. That is a different requirement from slug `11`.

### Project-specific conditions that are not component facts

`supply_rail` is stored as a constraint key even though it is not a capability of the Uno:

| Project line | Constraint |
| --- | --- |
| Slug `18` servo | `supply_rail = external_5v` |
| Slug `18` joystick | `supply_rail = mcu_5v` |
| Slug `4` sensors | `supply_rail = mcu_3v3` |
| Slug `11` LED drive | no external-rail constraint |

The candidate does not “have” `external_5v`. The review for a substitute must include a `supply` change if the candidate cannot sit on the rail the canonical steps use. If the review does not mention it, the candidate is not supported.

---

## 6. Compatibility policy

Policy is stored only on the requirement. There is no table of part-to-part relationships.

Three stored values:

| Stored policy | User-facing name | What the matcher may return for a non-canonical part |
| --- | --- | --- |
| `exact` | EXACT, and NOT_ALLOWED / NONE | Nothing. Only the canonical UUID counts. |
| `direct` | DIRECT_SUBSTITUTE allowed | A direct substitute, and only when no instruction-facing attribute differs. |
| `conditional` | CONDITIONAL_SUBSTITUTE allowed | A direct substitute, or a conditional substitute that has an authored change list. |

`exact` and “no substitution” are the same control. A separate `none` value would not change quantity checks, walkthrough selection, or the Owned/Missing result. One value avoids two policies that mean “ignore every other inventory row”.

The policy is a ceiling, not a result:

- Under `exact`, a Mega in inventory is unused for this line.
- Under `direct`, a Mega that needs a different board menu entry cannot be shown as compatible. The ceiling forbids conditional results.
- Under `conditional`, a Mega can be shown only after a review for this requirement says so, and only with the change list attached.

Component-level “Mega is compatible with Uno” is not stored. A review row is `(requirement_id, component_id)`. The requirement belongs to one project line, so the same pair of parts can be reviewed differently on slug `11`, slug `1`, and slug `4`.

---

## 7. Evaluation is per requirement

```text
requirement
  → policy ceiling
  → constraints and pin roles
  → canonical component (BOM)
  → one inventory component and its capability rows
  → review for this requirement and this component, if any
  → result for this pair
```

The same inventory component is re-evaluated on every requirement.

| Candidate | Slug `11` blink, digital D9, 5 V, Arduino IDE | Slug `1` OLED on A4/A5 | Slug `4` 3.3 V ESP32 weather station |
| --- | --- | --- | --- |
| `arduino-uno-r3` | Canonical exact | Canonical exact | Fails 3.3 V and `board_package = esp32` |
| `arduino-mega` | Not established. Different `board_package` and `physical_form` from the part the steps name. See section 8. | Not established. I2C in the steps is A4/A5; a Mega profile would have to show a different label before any review. | Incompatible with the 3.3 V / ESP32 constraints |
| `esp32` | Incompatible with `logic_level_v = 5` once that capability is authored as `3.3` | Incompatible with the 5 V Uno constraints | Canonical exact |

Those Mega cells are not approvals. They are the reason the result must be computed per requirement.

### Result values

Per requirement line:

| `match_kind` | Meaning |
| --- | --- |
| `exact` | Canonical component, quantity met. |
| `direct_substitute` | Different catalogue component. All four dimensions pass. No instruction-facing difference. Review says direct. Policy is `direct` or `conditional`. |
| `conditional_substitute` | Different catalogue component. Review says conditional and lists every change. Policy is `conditional`. A variant id is present. |
| `incompatible` | A required capability is present on the candidate and disagrees (3.3 V against a 5 V constraint), or a pin function is absent, or the policy ceiling is lower than the difference requires. |
| `not_supported` | The candidate might be plausible, but a capability the constraint asks for is absent, or there is no review, or a difference exists and no variant lists it. |
| `insufficient_quantity` | The chosen component matches, and the owned count is below the BOM quantity. |

`not_supported` is the failure used when Solderi cannot prove the substitute. It is not displayed as “compatible”. It does not rewrite the walkthrough.

Project rollup, when a future UI reads the new evaluator:

| Project result | When |
| --- | --- |
| `BUILDABLE` | Every line is `exact`. |
| `BUILDABLE_WITH_SUBSTITUTION` | Every line is `exact` or `direct_substitute`, and at least one line is direct. |
| `BUILDABLE_WITH_CHANGES` | Every line is satisfied, and at least one is `conditional_substitute`. |
| `NOT_BUILDABLE` | Any line is `incompatible`, `not_supported`, or `insufficient_quantity`. |

A conditional line does not count as a full match in the percentage until the user is shown the change list. Today’s `matchPercentage` stays in place until that UI exists.

### Four checks, all required for `direct_substitute`

| Check | Pass condition |
| --- | --- |
| Functional | `function` and the required `gpio` / `interface` / `servo_kind` tokens match the constraints. |
| Electrical | `logic_level_v`, `supply_v`, and any `supply_rail` note on the review match. |
| Physical | `physical_form` equals the canonical part when the policy demands a direct fit. A differing form is not direct. |
| Software | `programming_environment` matches. `board_package` equals the canonical package for a direct result. `adc_full_scale` matches when the requirement includes it. |

Same broad function is not enough. `development_board` plus `digital_output` does not make an ESP32 a direct substitute for the blink Uno.

### Instruction-facing differences force conditional

Even if every constraint passes, the result cannot be `direct_substitute` when any of these differ from the canonical component:

- `board_package`
- `header_profile` or the label of a required pin role
- `physical_form`
- `logic_level_v`
- `supply_v`
- a `supply_rail` the canonical steps do not already describe for this part

That is how the two examples are represented, after a review exists, and only then:

**Example A.** A candidate meets every constraint, the four checks pass, and none of the instruction-facing fields differ. The review says `direct` and has zero change rows. Result: `direct_substitute`. The canonical steps stay on screen.

**Example B.** The candidate meets the electrical and functional constraints, but the pin label, voltage, board package, or wiring differs. The review says `conditional` and has one change row per difference. Result: `conditional_substitute`. The screen shows those changes and the variant instructions.

Example A is not the blink Mega. The Mega’s catalogue identity is already a different `board_package` (`arduino_avr_mega2560`) and a different `physical_form` (`mega2560`) from `arduino-uno-r3`. The blink steps say “Select Arduino Uno” and describe 5 V HIGH on an Uno. A future verified result for that pair is Example B, or `not_supported` if nobody has written the change list. It is not Example A. This document does not verify the Mega.

---

## 8. Walkthrough variants

Conditional substitution is closed until variant data exists. The first implementation does not author variants, does not rewrite steps, and does not mark the Mega buildable.

```text
Canonical project_steps  (always authored for the BOM)
        ↓
Selected inventory component for this requirement
        ↓
Review + change rows for (requirement, that component)
        ↓
Variant instructions, only where a change row points at a step
```

If the selected component is the canonical one, the app shows `project_steps` exactly as today.

If the selected component is a reviewed conditional substitute, the app shows the canonical steps with the authored replacements from the variant. It does not find-and-replace “Arduino Uno” with “Arduino Mega” inside JSON.

If the component is only `not_supported` or `incompatible`, the app keeps the canonical steps and does not pretend the user’s part is what the diagram shows.

### What a change row can target

| `change_kind` | What it replaces | Bound today to |
| --- | --- | --- |
| `board_package` | The “select this board” sentence and the IDE target | Slug `11` “Select Arduino Uno” |
| `pin_map` | Connection rows, pin constants, code explanation, troubleshooting pin names | `D9`, `D2`, `A4`/`A5`, GPIO 21/22 |
| `code` | The `code` block and its `code_explanation` | Numeric pins, `DHTTYPE`, `Wire.begin(21, 22)`, `analogRead` range |
| `wiring` | `wiring` / `connections` blocks | `"Arduino Uno"` / `"D9"` strings |
| `diagram` | Which wiring layout to draw | Layouts keyed by project slug, symbol `kind: 'arduino-uno'` |
| `supply` | Power warnings | Slug `4` 3.3 V, slug `18` split 5 V rails |
| `troubleshooting` | Troubleshooting items that name pins or parts | “confirm D9”, “SDA→A4” |
| `visual` | Which physical reference the step image uses | Section 11 |
| `mechanical` | Assembly sentences | Slug `18` SG90 bracket pocket |

A conditional review with an empty change list is invalid. The engine treats it as `not_supported`.

A review marked `direct` that still has change rows is invalid. The engine treats it as `not_supported` rather than upgrading it to conditional on its own.

### Diagrams and code

Wiring layouts stay per canonical project until a variant names another layout id. `findElement()` in `lib/wiring-diagram.ts` matches names, and the Uno symbol’s aliases include `arduino`. That matcher must not be reused to attach a Mega label to the Uno drawing. A Mega variant either has its own layout or the diagram is omitted and the change list says the diagram is for the Uno only.

Code is not rewritten by substituting pin numbers in C++. A `code` change is an authored sketch, or an authored list of constants the user must edit, stored as data. The blink sketch’s `LED_PIN = 9` stays the canonical sketch until a variant contains a Mega-specific explanation.

### Restriction

Until `walkthrough_variants` and change rows exist for a pair:

- Policy may still be `conditional` in a test fixture.
- The user-facing result for any non-canonical part is `not_supported` or `incompatible`.
- It is never `conditional_substitute` and never `direct_substitute`.

Slug `18` stays `exact` on every line. It is the only published project, and its servo, bracket, and power split are the wrong place to learn substitution.

---

## 9. Quantity and allocation

Quantity remains `project_components.quantity`. The checker compares owned quantity with that number.

```text
Requirement: sg90 × 2          (slug 18, policy exact)
User owns:   sg90 × 1
Result:      exact match kind, insufficient_quantity
```

```text
Requirement: microcontroller × 1     (slug 11)
User owns:   arduino-uno-r3 × 1
             arduino-mega × 1
Result under policy exact:
             satisfying component = arduino-uno-r3
             match_kind = exact
             Mega is not consulted
```

Allocation rules for the first version:

1. If the canonical component’s owned quantity is at least the BOM quantity, use it. `match_kind = exact`. Stop. Do not prefer a substitute over the part the steps name.
2. Otherwise, if the policy is `exact`, the line is unmet. Canonical owned quantity is still reported so the UI can show “you have 0 of Arduino Uno R3”.
3. Otherwise consider other inventory rows whose `component_id` differs. Evaluate each separately.
4. Do not add quantities across different catalogue components. One SG90 plus one MG90S is not two of a requirement. The user owns two objects and the requirement asks for a count of one chosen part.
5. Among candidates that return `direct_substitute`, pick any one that covers the quantity. The first version has at most one such candidate in practice, because direct requires the same board package and physical form as the canonical part, which is the canonical part itself. A true direct substitute would be a second catalogue row that is the same form and package (a future second 220 Ω resistor, for example).
6. If none are direct, and the policy is `conditional`, pick a `conditional_substitute` that covers the quantity. If several exist, prefer the one whose review `sort_order` is lowest. Do not auto-pick.
7. If the best candidate matches and the quantity is short, `insufficient_quantity`.
8. If every other candidate is `incompatible` or `not_supported`, the line is unmet. The result names the canonical part and the failed or unknown candidates. It does not choose the Mega just because it is the only board on the shelf.

Slug `12` already uses quantity on one catalogue row: `led` × 3, `resistor` × 3. Those lines stay exact. Three LEDs are one line in today’s matcher; that behaviour stays.

---

## 10. Physical references

The visual chain from the audit stays:

```text
Catalogue component slug
        ↓
Explicit reference key
        ↓
assets/visual-references/components/<folder>
```

The folder is not inferred by renaming the slug. Existing READMEs already map:

| Catalogue slug | Reference folder today |
| --- | --- |
| `arduino-uno-r3` | `components/arduino-uno` |
| `pir-sensor` | `components/pir-motion-sensor` |
| `led` | `components/led` |
| `buzzer` | `components/buzzer` |
| `breadboard` | `components/breadboard` |
| `jumper-wires` | `components/jumper-wires` |

There is no Mega, Nano, or ESP32 folder. Nano and Mega share the in-app illustration `generic-board`. That illustration is not a physical reference.

Future lookup, when visuals are generated:

- The component whose reference is used is the **satisfying** component on the requirement result, after allocation.
- `exact` → canonical slug → the map above. Slug `11` with an Uno uses the Uno reference.
- `direct_substitute` or `conditional_substitute` → that other slug’s own reference key.
- `arduino-mega` maps to a future folder of its own, not to `components/arduino-uno`.
- If the map has no folder for the satisfying slug, the generator does not reuse another part’s photos. The step keeps the canonical image only for an `exact` result. A substitute without a reference does not show the Uno.

Project assembly folders (`projects/motion-sensor-alarm`) stay for assemblies. They do not absorb a second copy of a board. A variant that changes the board needs its own assembly reference later, or it ships without a generated photo.

The buzzer folder documents one catalogue row. It is not a reference for both active and passive buzzers.

No reference files are added by this design.

---

## 11. Proposed schema

Proposal only. These statements are not a migration.

Catalogue reads stay authenticated-select, same as `components` and `project_components`. No user writes. `inventory_items` is unchanged.

### `component_capabilities`

Facts about one catalogue part.

| Column | Notes |
| --- | --- |
| `id uuid` pk | |
| `component_id uuid` not null | FK → `components.id` on delete cascade |
| `capability text` not null | Closed list in a check constraint: the keys in section 3, plus `supply_rail` is **not** in this list |
| `value text` not null | Atomic token or integer-as-text |
| `created_at` | |

Unique `(component_id, capability, value)`.

Index `(component_id)`.

Check `char_length(value) between 1 and 64`.

Why: the matcher joins inventory’s `component_id` to these rows. Absence is unknown. Multiple rows per capability support `gpio` and `interface`.

### `pin_profiles`

| Column | Notes |
| --- | --- |
| `id text` pk | `uno_r3`, `mega2560`, `nano`, `esp32_devkit` |
| `component_id uuid` not null unique | FK → `components.id`. One profile per board. |
| `created_at` | |

Why: header identity is a board fact. It is not a compatibility edge.

### `pin_profile_pins`

| Column | Notes |
| --- | --- |
| `id uuid` pk | |
| `pin_profile_id text` not null | FK → `pin_profiles.id` |
| `label text` not null | `D9`, `A4`, `GPIO21`, `20` |
| `pin_function text` not null | `digital_input`, `digital_output`, `pwm_output`, `analog_input`, `i2c_sda`, `i2c_scl`, `one_wire` |

Unique `(pin_profile_id, label, pin_function)`.

Index `(pin_profile_id)`.

Why: slug `1` cares that I2C is A4/A5 on the Uno. Slug `11` cares that some pin can be a digital output and that the canonical steps call it D9. Those are pins on a profile, not a Mega↔Uno link.

### `project_requirements`

| Column | Notes |
| --- | --- |
| `id uuid` pk | |
| `project_id uuid` not null | FK → `projects.id` on delete cascade |
| `project_component_id uuid` not null unique | FK → `project_components.id` on delete cascade |
| `role text` not null | `microcontroller`, `led`, … |
| `substitution_policy text` not null | check in `exact`, `direct`, `conditional`. Default `exact`. |
| `sort_order integer` not null | Display order, copied from the BOM line when seeded |
| `created_at`, `updated_at` | |

Check that `project_components.project_id` equals `project_requirements.project_id`. A trigger or a composite foreign key `(project_component_id, project_id)` is enough; do not trust the app to keep them aligned.

Canonical component and quantity are not columns. They are `project_components.component_id` and `project_components.quantity` through `project_component_id`.

Index `(project_id)`.

Why: this is the requirement layer. Deleting a BOM line deletes its requirement. Policy default `exact` keeps today’s behaviour for every seeded row.

### `project_requirement_constraints`

| Column | Notes |
| --- | --- |
| `id uuid` pk | |
| `requirement_id uuid` not null | FK → `project_requirements.id` on delete cascade |
| `capability text` not null | Same capability check list, and also `supply_rail` |
| `value text` not null | |

Unique `(requirement_id, capability, value)`.

Index `(requirement_id)`.

Why: slug `11` can require 5 V and a digital output without saying anything about slug `4`.

### `project_requirement_pin_roles`

| Column | Notes |
| --- | --- |
| `id uuid` pk | |
| `requirement_id uuid` not null | FK → `project_requirements.id` on delete cascade |
| `role_key text` not null | `led_output`, `i2c_sda` |
| `pin_function text` not null | Function the candidate profile must offer |
| `canonical_label text` not null | Label in the current steps (`D9`, `A4`) |

Unique `(requirement_id, role_key)`.

Why: the canonical label is project-authored. The profile only says which labels exist on a board.

### `requirement_substitution_reviews`

Human verification for one requirement and one other catalogue component. This is not a global compatibility table. A row without its requirement is meaningless, and the requirement is already tied to one project line.

| Column | Notes |
| --- | --- |
| `id uuid` pk | |
| `requirement_id uuid` not null | FK → `project_requirements.id` on delete cascade |
| `component_id uuid` not null | FK → `components.id`. The candidate. |
| `assessed_result text` not null | check in `direct`, `conditional`, `incompatible` |
| `sort_order integer` not null default 0 | Tie-break when several conditional reviews exist |
| `created_at` | |

Unique `(requirement_id, component_id)`.

Check `component_id` ≠ the canonical component of that requirement. The canonical part does not need a review.

Index `(requirement_id)`.

Why: capabilities can show that a constraint fails (ESP32 at 3.3 V). They must not, by themselves, show a user a substitute. A review is the verification step. The engine still rejects a review that contradicts a constraint or that claims `direct` when an instruction-facing attribute differs.

No review row means `not_supported` for that candidate whenever the policy would otherwise consider it.

### `substitution_review_changes`

| Column | Notes |
| --- | --- |
| `id uuid` pk | |
| `review_id uuid` not null | FK → `requirement_substitution_reviews.id` on delete cascade |
| `change_kind text` not null | check in `board_package`, `pin_map`, `code`, `wiring`, `diagram`, `supply`, `troubleshooting`, `visual`, `mechanical` |
| `step_sort_order integer` null | Null means the change applies wherever that kind is mentioned. Set when one step changes. |
| `summary text` not null | The sentence shown to the user. Required. Empty summary is invalid. |
| `payload jsonb` not null default `{}` | Structured fields: `from_label`, `to_label`, `board_package`, `variant_id`. Not prose instructions. |

Index `(review_id)`.

Why: a conditional result without a user-visible summary would hide a wiring or code change.

### `walkthrough_variants`

Not in the first implementation. Included so conditional reviews have somewhere to point.

| Column | Notes |
| --- | --- |
| `id uuid` pk | |
| `project_id uuid` not null | FK → `projects.id` |
| `review_id uuid` not null unique | FK → `requirement_substitution_reviews.id`. One variant per reviewed pair. |
| `blocks_by_step jsonb` null | Optional full replacement of specific step blocks, keyed by `sort_order`. |
| `diagram_layout_id text` null | A future layout id. Null means “do not draw the canonical Uno diagram for this substitute”. |

Why it waits: authoring a Mega blink variant is a content task. The schema above can represent `not_supported` without it. A `conditional` review whose payload has no `variant_id`, and whose change list is empty, does not become a result.

### Relationships

```text
components
  ├─< inventory_items.component_id
  ├─< project_components.component_id          canonical BOM
  ├─< component_capabilities.component_id
  ├─< pin_profiles.component_id
  │     └─< pin_profile_pins
  └─< requirement_substitution_reviews.component_id

projects
  └─< project_components
        └─< project_requirements               one per BOM line
              ├─< project_requirement_constraints
              ├─< project_requirement_pin_roles
              └─< requirement_substitution_reviews
                    ├─< substitution_review_changes
                    └─< walkthrough_variants    later
```

`inventory_items` gains no column. A new physical variant is a new `components` row. `user_projects` gains no column until the product stores which reviewed substitute the user accepted. That is out of scope.

### Evaluator rules that the schema relies on

These rules are part of the design even though the function is not written yet.

1. Policy `exact`: compare inventory quantity of the canonical UUID with BOM quantity. Same outcome as `matchProjectInventory()` for that line.
2. A candidate with no capability row for a constrained key is `not_supported`, not incompatible and not compatible.
3. A candidate with that key and a different value is `incompatible`.
4. A candidate that passes constraints and still differs in an instruction-facing attribute is not direct.
5. Without a review row, a non-canonical candidate is `not_supported` even if constraints pass.
6. A review cannot override rule 3 or rule 4.
7. `conditional_substitute` requires policy `conditional`, review `conditional`, at least one change row with a non-empty summary, and a variant id once variants exist. Until variants exist, stop at `not_supported`.
8. Do not read `components.category`, catalogue aliases, or wiring-layout aliases.

---

## 12. First version

Smallest useful slice: slug `11`, one requirement, no substitute marked compatible.

### Data

1. Capability rows and pin profiles for six boards that already exist: `arduino-uno-r3`, `arduino-nano`, `arduino-mega`, `esp32`, `esp8266`, `raspberry-pi-pico`.
   Keys: `function`, `logic_level_v`, `supply_v`, `gpio`, `programming_environment`, `board_package`, `adc_full_scale`, `physical_form`, `header_profile`.
   `adc_full_scale` is stored only where the Arduino core range is already what the Uno sketches teach (`1023` on the AVR boards). It is left absent on ESP32 and Pico rather than guessed.
   `logic_level_v` for `esp32` is `3.3`, because slug `4`’s steps say ESP32 GPIO is 3.3 V. That authored sentence is the source. It is not a guess from the name.
2. One `project_requirements` row for slug `11`’s `arduino-uno-r3` BOM line.
   - role `microcontroller`
   - policy `exact`
   - constraints listed in section 5, stored even while the policy is `exact` so they are ready for the test
   - pin role `led_output`, function `digital_output`, canonical label `D9`
3. No review rows. No variants. No changes to the LED, resistor, breadboard, or jumper lines.

### Test that must pass before any policy change

Run the evaluator beside `matchProjectInventory()`, not instead of it.

| Inventory | Expected |
| --- | --- |
| `arduino-uno-r3` × 1, other BOM parts as today | Same Owned/Missing as the current matcher. Line result `exact`. |
| `arduino-mega` × 1, no Uno | Line unmet. Mega is not a satisfying component. Policy is `exact`. |
| Policy flipped to `conditional` only inside a test, Mega capabilities present, no review | `not_supported`. Not `direct_substitute`. Not `conditional_substitute`. |
| Same test, `esp32` with `logic_level_v = 3.3` | `incompatible` with the 5 V constraint. |
| `arduino-uno-r3` × 1 and `arduino-mega` × 1 | Satisfying component is the Uno. `exact`. |

The app’s project screen keeps calling `matchProjectInventory()` until that parity holds. Slug `11` is unpublished, so this slice does not change the published pan-tilt project.

### Families to add later, not in this slice

| Family | Why it waits |
| --- | --- |
| DHT11 / DHT22 / DHT20 | Slugs `1` and `4` hard-code `DHTTYPE DHT22`. Needs a `code` variant. |
| `resistor` vs `resistor-220` | Slug `8` is already exact on `resistor-220`. The generic row has no ohms. |
| Buzzer | One catalogue row covers an active-buzzer walkthrough. Split the row before any capability is stored. |
| SG90 / MG90S / pan-tilt bracket | Slug `18` is published. Policy stays `exact`. Physical fit is not in the data. |
| OLED and BMP280 pin/address changes | Real conditional content, after blink’s `not_supported` path is proven. |
| Nano as well as Mega | Same blink requirement, same rule: no review, so `not_supported`. Not a second experiment. |

---

## 13. Migration

Existing projects keep today’s behaviour for as long as their requirement policy is `exact` or they have no requirement rows.

```text
Current exact BOM and matchProjectInventory()
        ↓
Add the empty tables. Default policy exact. Matcher unchanged.
        ↓
Seed capabilities for the six boards only.
        ↓
Add one exact requirement for slug 11’s microcontroller, plus its constraints.
        ↓
Parity-test the evaluator against matchProjectInventory().
        ↓
In a test only, open policy to conditional and confirm Mega is not_supported
    and ESP32 is incompatible.
        ↓
Leave the stored policy at exact.
        ↓
Later, and only with a written variant: a review row, change summaries,
    and a policy of conditional for that one line.
        ↓
Other projects, one BOM line at a time, still defaulting to exact.
```

Not every catalogue row needs capabilities. A component with no capability rows simply cannot pass a non-exact requirement. Exact BOM matching does not read the capability table.

Not every project needs requirement rows. Slugs `2`, `3`, `5`–`7`, `9`, `10`, `13`, `15`–`17`, and `19`–`22` have no BOM. They stay “components not yet defined”.

Seeds are keyed by `components.slug`, then resolved to UUID at insert time, same as the existing BOM seeds. The TypeScript catalogue can be the authoring list. The database is the runtime source once the tables exist. Aliases stay in the TypeScript catalogue for search.

---

## 14. Safety rules

The evaluator and any future UI follow these rules. They are product rules, not optional polish.

1. Do not infer electrical compatibility from `name`, `description`, `category`, `type`, or search aliases. `bme280` as an alias of `bmp280` is a search bug to avoid copying, not a capability.
2. Do not treat equal `function` as equal voltage. `development_board` does not imply 5 V.
3. Do not treat equal pin labels as interchangeable across profiles. D9 on a Mega profile is still a different board package, a different body, and a different diagram.
4. Do not mark a result `direct_substitute` when `board_package`, `physical_form`, `header_profile`, logic level, supply, or a pin label differs from the canonical part.
5. Do not mark `conditional_substitute` without a non-empty user-visible change summary for every difference.
6. Do not rewrite `project_steps`, wiring JSON, or sketches because a substitute was selected. Show an authored variant or show the canonical steps unchanged.
7. Do not let a review override a failed constraint. A review that says the ESP32 is a direct substitute for slug `11` is ignored; the 3.3 V row wins with `incompatible`.
8. If a constrained capability is missing, return `not_supported`. Do not fill it in.
9. If the policy is `exact`, do not consult other inventory rows.
10. Do not sum quantities across different catalogue components.
11. Do not show another part’s visual reference for a substitute.
12. Do not bind a non-Uno name to the Uno wiring symbol through the alias `arduino`.

---

## 15. Final recommendation

### Recommended architecture

Keep the canonical BOM. Add a 1:1 requirement that points at `project_components` and stores a substitution ceiling: `exact`, `direct`, or `conditional`. Store atomic capability rows on catalogue components, and pin-function rows on a per-board profile. Evaluate one inventory component against one requirement. Return `exact`, `direct_substitute`, `conditional_substitute`, `incompatible`, `not_supported`, or `insufficient_quantity`.

A non-canonical part becomes `direct_substitute` or `conditional_substitute` only when a review row for that requirement says so, the capability constraints agree, and instruction-facing differences are either absent (direct) or listed in authored change rows (conditional). Until those change rows and a walkthrough variant exist, the result is `not_supported`.

`exact` is the default and covers “substitution not allowed”. There is no part-to-part compatibility table.

### Proposed tables

| Table | Purpose |
| --- | --- |
| `component_capabilities` | Atomic facts about one catalogue component. |
| `pin_profiles` | One header map per board, keyed to `components`. |
| `pin_profile_pins` | Labels and functions on that header. |
| `project_requirements` | One requirement per canonical BOM line. Policy ceiling. Role. |
| `project_requirement_constraints` | What this project line requires. |
| `project_requirement_pin_roles` | Logical pin role and the label the current steps use. |
| `requirement_substitution_reviews` | Verified result for one requirement and one other component. |
| `substitution_review_changes` | User-visible, structured differences. Required for conditional. |
| `walkthrough_variants` | Later. Authored step and diagram overrides for one review. |

`project_components`, `inventory_items`, and `components` keep their current columns.

### Proposed relationships

```text
inventory_items ──component_id──► components ◄──component_id── project_components
                                      │                              │
                                      │                              │ project_component_id
                                      ▼                              ▼
                           component_capabilities            project_requirements
                           pin_profiles                               │
                                │                                     ├─ constraints
                                ▼                                     ├─ pin roles
                           pin_profile_pins                           └─ reviews ──► components
                                                                              │
                                                                              ├─ changes
                                                                              └─ variants (later)
```

### First implementation

When implementation starts, and not before:

1. Add the tables except `walkthrough_variants`.
2. Seed capabilities and pin profiles for the six boards in section 12.
3. Add the slug `11` microcontroller requirement with policy `exact`, the 5 V / digital-output / Arduino IDE constraints, and pin role `led_output = D9`.
4. Implement the evaluator as a pure function. Keep `matchProjectInventory()` on the project screen.
5. Prove parity for the Uno, and prove that a test-only `conditional` policy returns `not_supported` for the Mega and `incompatible` for the ESP32.
6. Do not insert a review for `arduino-mega`. Do not set the stored policy to anything but `exact`.

### What should not be implemented yet

- Marking the Mega, the Nano, or any other board as a substitute for the blink project.
- Walkthrough variants, diagram layouts for other boards, and code rewriting.
- Switching the project screen, project list, or home recommendations off `matchProjectInventory()`.
- Requirement rows for slug `18` or any published behaviour change.
- Splitting the buzzer, filling ohms on the generic resistor, or DHT / OLED / servo substitution.
- Visual-reference folders for the Mega.
- A global “compatible with” relationship.
- Using catalogue aliases or wiring aliases as capabilities.

### Open decisions

None that block the first implementation. Policy defaults to `exact`, conditional results wait for authored variants, and the Mega is unverified. Whether a later content pass should write a Mega blink variant is a backlog choice after the `not_supported` test is in place, not a schema choice.
