# Component compatibility audit

Audit of the Solderi component catalogue, inventory, and project BOM as implemented in the app and Supabase migrations. This document records the current model and a proposed architecture for interchangeable components.

Nothing in this document is implemented. No schema, catalogue, BOM, walkthrough, wiring layout, or visual-reference asset is changed by this audit.

Examples that follow directly from existing rows, matchers, or authored pin maps are stated as current behaviour. Examples of how a future engine *should* classify a pair are marked **proposed**.

---

## 1. Current architecture

Solderi has two catalogues that are meant to share the same slug, plus several other identity spaces that are only loosely aligned.

| Layer | Where it lives | Identity |
| --- | --- | --- |
| App catalogue | `constants/component-catalogue.ts` | `id` string slug, e.g. `arduino-uno-r3` |
| Database catalogue | `public.components` | UUID primary key, plus unique `slug` |
| Inventory | `public.inventory_items.component_id` | UUID foreign key to `components.id` |
| Project BOM | `public.project_components.component_id` | UUID foreign key to `components.id` |
| Onboarding picker | `constants/onboarding.ts` | Separate ids (`arduino-uno`, `servo-sg90`) mapped to slugs |
| Walkthrough part lists | `project_steps.blocks` JSON | Catalogue slugs copied into `components` blocks, with `owned: false` |
| Wiring connections | `StepConnection` strings inside those blocks | Display names and pin labels (`"Arduino Uno"`, `"D2"`) |
| Wiring diagram geometry | `constants/wiring-diagrams/layouts/*` | Per-project slug, symbol `kind`, and name aliases |
| Visual references | `assets/visual-references/components/*` | Folder names, documented against catalogue slugs in each README |

Live project data the app can read is whatever is `is_published = true`. After the migrations in this repo, that is **Servo Pan-Tilt Camera (`slug` `18`) only**. Phase 3.2 inserts projects `1`–`22` as unpublished. `20260928220000_servo_pan_tilt_camera.sql` is the only migration that sets `is_published = true`.

Authored BOMs still exist for slugs `1`, `4`, `8`, `11`, `12`, `14`, and `18`. Authored `project_steps` exist for those same slugs. Visual wiring layouts exist only for slugs `8` and `18`.

`constants/projects-data.ts` still contains `COMPONENT_POOLS` and `getProjectComponents()`, and `constants/project-steps.ts` can synthesise category-template steps. `getProjectSteps()` is not called by any screen. The build screen loads `fetchProjectSteps()` from `public.project_steps`. Inventory matching uses `matchProjectInventory()` against `project.bom`.

---

## 2. How the current system works

### Component catalogue

#### App catalogue fields

`CatalogueComponent` in `constants/component-catalogue.ts` is:

| Field | Role |
| --- | --- |
| `id` | Stable slug. This is the app’s catalogue identity. |
| `name` | Display name, e.g. `Arduino Uno R3`. |
| `aliases` | Search strings only. Used by `searchComponentCatalogue()` and `matchCatalogueToInventoryItem()`. |
| `description` | One-line prose. |
| `category` | One of `microcontrollers`, `sensors`, `actuators`, `displays`, `power`, `modules`. |
| `type` | Free-string subtype, e.g. `development_board`, `servo`, `temperature_humidity`, `passive`. Present only in the TypeScript catalogue. |
| `image` | `ComponentIllustrationId` for the in-app SVG, not a photo. Nano, Mega, ESP8266, and Pico share `generic-board`. DHT11, DHT22, and DHT20 share `dht11`. SG90 and MG90S share `servo-sg90`. |

There are 46 entries. Featured search ids are `dht22`, `hc-sr04`, `esp32`, `arduino-uno-r3`, `sg90`, `oled-096`, `pir-sensor`, `l298n`.

#### Database catalogue fields

`public.components`, from `20260831201555_phase_2_1_database_foundation.sql` plus `slug` from `20260904200000_phase_2_2_onboarding_persistence.sql`:

| Column | Used by the app today |
| --- | --- |
| `id uuid` | Foreign key target for inventory and BOMs. |
| `name`, `category`, `description` | Selected by inventory and project queries. |
| `slug` | Lookup from onboarding and from the TypeScript catalogue. Unique. |
| `image_url` | Defined. No seed writes it. The app does not select it. |
| `manufacturer` | Defined. No seed writes it. The app does not select it. |
| `part_number` | Defined. No seed writes it. The app does not select it. |
| `created_at` | Defined. Not used for matching. |

Seeds copy `name`, `category`, `description`, and `slug` from the TypeScript catalogue. They do not copy `aliases`, `type`, or `image`.

Later migrations add rows that were not in the original full seed:

- `resistor-220` (`20260928200000_msa_content_audit.sql`), and slug `8`’s BOM resistor is repointed from `resistor` to `resistor-220`.
- `joystick` and `pan-tilt-bracket` (`20260928220000_servo_pan_tilt_camera.sql`).

#### How IDs are structured

Slugs are lowercase kebab-case part names (`arduino-uno-r3`, `hc-sr04`, `oled-096`, `resistor-220`). They are not manufacturer part numbers and not electrical specs.

The UUID is the only identity that inventory and `project_components` store. The slug is how the app finds that UUID.

Onboarding uses a third id, then maps it:

| Onboarding id | Catalogue slug |
| --- | --- |
| `arduino-uno` | `arduino-uno-r3` |
| `servo-sg90` | `sg90` |
| `oled` | `oled-096` |
| `esp32`, `hc-sr04`, `led`, `resistor`, `breadboard`, `dc-motor`, `dht11` | same string |

`ONBOARDING_COMPONENT_IDS` in `constants/component-illustrations.ts` is another list (`arduino-uno`, `servo-sg90`, …) used for SVG art. It is not the catalogue slug and not the database UUID.

#### Categories

Three taxonomies exist side by side:

- Catalogue / inventory: `microcontrollers`, `sensors`, `actuators`, `displays`, `power`, `modules`.
- Onboarding tabs: `boards`, `components`, `sensors`, `motors`, `displays`.
- Projects: `robotics`, `iot`, `sensors`, `automation`, `displays`.

A component’s category is a browsing label. `matchProjectInventory()` does not compare categories. Two parts in `microcontrollers` do not satisfy each other.

`type` is slightly more specific (`development_board`, `servo`, `buzzer`) but it is not stored in Postgres and nothing in project matching reads it.

#### Aliases

Aliases exist in three places, for three different jobs:

1. Catalogue search aliases. `"arduino"` and `"uno"` are aliases of `arduino-uno-r3`. `"mega"` is an alias of `arduino-mega`. Search scoring picks one catalogue row; it does not mean the parts are interchangeable.
2. Wiring-layout aliases. Slug `8` and slug `18` layouts list `arduino`, `arduino uno`, and `arduino uno r3` on the Uno symbol. `findElement()` in `lib/wiring-diagram.ts` accepts a substring match when the alias is at least 3 characters. A connection label `Arduino Mega` normalises to `arduinomega`, which contains the alias `arduino`, and would bind to the Uno symbol. Current step text says `Arduino Uno`, so this path is not what the published steps render today. The matcher is still name-based, not slug-based.
3. Catalogue search conflations that are already in data:
   - `bmp280` aliases include `bme280`. A search for BME280 returns the BMP280 row. BME280 is not its own catalogue component. The weather-station sketch uses `Adafruit_BMP280`.
   - `buzzer` aliases include `active buzzer`, while the name is `Piezo Buzzer`. The Motion Sensor Alarm walkthrough requires an active buzzer.
   - `pir-sensor` aliases include `hc-sr501`. The visual-reference README treats that as the same physical sensor.

#### Electrical, physical, and compatibility data

No catalogue field stores voltage, current, logic level, pinout, protocol, resistance, or a compatibility relationship.

Electrical facts that the product already depends on are written into walkthrough prose, code, and warnings. Examples that are in the authored steps:

- Slug `11`: “HIGH is about 5 V on an Uno.” Pin `D9`. Board selection text says Arduino Uno.
- Slug `8`: PIR `OUT` → `D2`, LED through 220 Ω → `D8`, active buzzer → `D9`, VCC from Uno `5V`. The step text says a passive piezo stays quiet under `digitalWrite`.
- Slug `1`: DHT22 on `D2` at 5 V, soil `A0`, LDR divider on `A1`, OLED SDA `A4` / SCL `A5`, `DHTTYPE DHT22`, OLED address `0x3C`.
- Slug `4`: ESP32 GPIO is 3.3 V. DHT22 data is GPIO 4. BMP280 SDA/SCL are GPIO 21/22. The step text says not to power the BMP280 from 5 V. `analogRead` range is not the subject; I2C pin numbers are ESP32-specific. `Wire.begin(21, 22)` is in the sketch.
- Slug `12`: red `D8`, yellow `D9`, green `D10`.
- Slug `14`: LDR divider on `A0`, LED on `D9`, `analogRead` described as 0–1023 on an Uno.
- Slug `18`: pan servo signal `D9`, tilt `D10`, joystick `A0` / `A1` / `D2`. Servo VCC from the breadboard PSU 5 V rail. Joystick from Uno 5 V. Shared ground. The step text forbids a continuous-rotation servo and forbids tying the two 5 V rails together. `analogRead` is described as 0–1023 on the Uno. The sketch uses the Arduino `Servo` library.

Physical facts are similarly prose-only: LED anode/cathode, SG90 red/brown/orange leads, pan-tilt bracket pockets sized for the SG90 in the slug `18` copy, breadboard row connectivity, MB102-style PSU wording.

There is no compatibility table, no substitute list, and no capability table.

### Inventory

`inventory_items` columns:

- `user_id`
- `component_id` → `components.id`
- `quantity` (integer, check `>= 0`)
- `notes` (the app select list does not read it)
- unique `(user_id, component_id)`

One row per user per catalogue component. Quantity is the only variant of “how many.” A second physical variant must be a different catalogue row (`arduino-uno-r3` vs `arduino-mega`, `resistor` vs `resistor-220`, `dht11` vs `dht22`, `sg90` vs `mg90s`).

The app refuses custom components (`INVENTORY_ERRORS.customUnavailable`). Adding a part resolves the slug to a UUID and upserts on `(user_id, component_id)`. Onboarding does the same, with `quantity: 1` and `ignoreDuplicates: true`.

`mapInventoryRow()` copies the database slug into `catalogueId` and the UUID into `componentId`. It optionally copies `type` from the TypeScript catalogue when the slug exists there. Matching does not use `type`.

Variants the catalogue cannot tell apart, because they are one row:

- LED colour, size, and forward voltage (`led`)
- Resistor value on the generic `resistor` row (slug `8` is the exception: it requires `resistor-220`)
- Active vs passive buzzer (`buzzer`)
- Breadboard size and power-rail layout (`breadboard`)
- Jumper gender beyond the alias text “male to male” (`jumper-wires`)
- ESP32 module variant beyond `ESP32 DevKit` (`esp32`)
- Which BMP280 breakout address (the slug `4` sketch tries `0x76` and `0x77` in code, not in the catalogue)

### Project BOM

`project_components` is an exact bill of materials.

```text
project_id      → projects.id
component_id    → components.id     -- one exact catalogue part
quantity        ≥ 1
sort_order
unique (project_id, component_id)
```

The table comment says: “Authored bill of materials for a catalogue project. One row per component; extra units use quantity.” The column comment says identity is the catalogue UUID, not a display name. Jumper wires are documented as a pack: quantity `1` means one pack.

Seeded quantities that are not 1:

| Project slug | Part | Quantity |
| --- | --- | --- |
| `12` Traffic Light | `led` | 3 |
| `12` | `resistor` | 3 |
| `14` Night Lamp | `resistor` | 2 |
| `18` Pan-Tilt | `sg90` | 2 |

Slug `8` originally required generic `resistor` and was updated to `resistor-220` quantity 1. Slugs `1`, `11`, `12`, and `14` still require generic `resistor`.

There is no role, capability, acceptable-substitute list, or “canonical vs required” flag.

#### How buildability is determined

`matchProjectInventory()` in `lib/projects.ts`:

1. Sum inventory quantities by `componentId` (the UUID). Rows without `componentId` are ignored.
2. For each BOM line, `ownedQuantity = inventory[that UUID]`, `missingQuantity = max(required - owned, 0)`.
3. `isOwned` is `ownedQuantity >= requiredQuantity`.
4. `matchPercentage` is `owned line count / line count`, not a quantity-weighted score. Three LEDs are one line: owning 1 of 3 marks the line missing.
5. An empty BOM returns `matchPercentage: null`. The project screen shows “Components not yet defined.”

The project screen (`app/project/[id].tsx`) and the project list (`app/(tabs)/projects.tsx`) both call this function. `ProjectComponentRow` shows Owned or Missing from `isOwned`.

Home “Recommended for you” does **not** use this match. `app/(tabs)/index.tsx` takes the first three published projects that have a BOM or authored steps. With current migrations, that set is slug `18` only, and the recommendation is catalogue order, not inventory overlap.

`difficulty` is project metadata (`beginner` | `intermediate` | `advanced`). It filters and labels projects. It does not choose components. `profiles.skill_level` is the same three values and is not read by the matcher.

`toWalkthroughProject()` sets `ownedParts: 0` always. The mock `ownedParts` numbers in `constants/projects-data.ts` are not the live match.

`user_projects` stores favourite, started, current step, and completion. It does not store which physical variant the user built with.

### Walkthroughs and wiring

A walkthrough step is a row in `project_steps`: title, description, tip, stage, and a JSON `blocks` array. Block types include `text`, `wiring`, `connections`, `code`, `code_explanation`, `warning`, `troubleshooting`, and `components`.

`components` blocks embed `{ id, name, illustrationId, owned, quantity }`. `id` is the catalogue slug. `owned` is hardcoded `false` in the seeded JSON. The build screen does not recompute ownership inside the step.

`wiring` and `connections` blocks use `StepConnection`:

```text
fromComponent, fromPin, toComponent, toPin, signal?
```

All four main fields are strings. They are not foreign keys to `components` or to a pin table.

Diagram geometry is a second, project-specific model. `getWiringLayout(projectSlug)` returns a layout only for `'8'` and `'18'`. Each element has a `kind` (`arduino-uno`, `pir`, `servo`, …), a label, aliases, and ports with their own aliases. Wires are routed by matching connection strings to those aliases.

#### What walkthroughs currently depend on

| Dependency | Where it is fixed | What breaks if the part changes |
| --- | --- | --- |
| Exact catalogue slug in the BOM and in `components` blocks | `project_components`, step JSON | The part list and the owned/missing check name the original part. |
| Exact board name | Step prose, wiring labels, layout `kind: 'arduino-uno'` | The diagram symbol, port positions, and “select Arduino Uno” upload instructions stay on the Uno. |
| Exact pin names | `D2`, `D8`, `D9`, `D10`, `A0`, `A1`, `A4`, `A5`, `GPIO4`, `GPIO21`, `GPIO22` | Code constants and connection rows name those pins. Another header does not move the text. |
| Exact voltage | Uno 5 V vs ESP32 3.3 V; slug `18` split 5 V rails | A 3.3 V board on a 5 V sketch, or a 5 V sensor on the ESP32 project, contradicts the written circuit. |
| Exact code | `DHTTYPE DHT22`, `Adafruit_BMP280`, `Servo.h`, `analogRead` 0–1023, `Wire.begin(21, 22)` | A different sensor family or a different board package needs different source. |
| Exact electrical role | Active buzzer + `digitalWrite`; positional servo; 220 Ω on slug `8` | The sketch behaviour changes, or a pin can be overloaded. |
| Exact mechanism | Pan-tilt bracket “for SG90 servos”; two SG90s; horn at 90° | A different servo body or a continuous-rotation servo does not follow the mechanical steps. |

Slug `8` and slug `18` already tell the reader not to substitute, in prose:

- Motion Sensor Alarm: do not substitute a passive piezo unless the sketch is changed to `tone()`. The catalogue still has a single `buzzer` row.
- Pan-Tilt: do not substitute a continuous-rotation servo. The catalogue has no continuous-rotation row. `mg90s` is a separate positional metal-gear servo. The bracket copy names SG90. Whether an MG90S fits that bracket is **not** established by the current data.

Legacy category templates in `constants/walkthrough-content.ts` (`WIRING_PAIRS`, `CONNECTIONS`) still hard-code Uno/ESP32/DHT22/OLED pin pairs, but `buildStepBlocks()` is only used by the unused `getProjectSteps()`. Live steps are the SQL/JSON walkthroughs and the TypeScript sources `constants/walkthroughs/motion-sensor-alarm.ts` and `constants/walkthroughs/servo-pan-tilt-camera.ts`.

---

## 3. Where the system assumes “requirement = exact catalogue component”

The assumption is the data model, not an accidental comparison.

### Database

- `project_components.component_id` references one `components.id`.
- Unique `(project_id, component_id)` means a project cannot list the same part twice, and cannot list “one of these parts” as one requirement.
- Inventory uses the same UUID. There is no link between UUIDs.

### Matcher

`matchProjectInventory()` looks up `ownedByComponentId.get(line.componentId)`.

Current behaviour, using parts that both exist in `COMPONENT_CATALOGUE`:

```text
Slug 11 BOM line: arduino-uno-r3 × 1
User inventory:   arduino-mega × 1
Result:           that line is Missing
```

The same function treats `dht11` as not satisfying a `dht22` line, `mg90s` as not satisfying an `sg90` line, `resistor` as not satisfying `resistor-220`, and `esp32` as not satisfying `arduino-uno-r3`.

### UI

- Project detail and project list percentages are that exact-UUID result.
- `ProjectComponentRow` prints the catalogue name of the BOM line, not the name of a substitute the user owns.

### Onboarding

Onboarding writes exact slugs into inventory. It does not record “an Arduino-compatible board.” Picking Arduino Uno stores `arduino-uno-r3` only.

### Walkthrough JSON

`components` items repeat the same slugs. Wiring nodes use illustration ids (`arduino-uno`, `pir-sensor`) and display names. Code blocks contain numeric pins and library names. None of these structures have a slot for an alternate part.

### Wiring layouts

Layouts are keyed by project slug and drawn as specific symbols (`kind: 'arduino-uno'`). Port aliases are that board’s labels (`D2`, `A4` is not even on the slug `8` layout, which only defines the pins that project uses). There is no second layout for Mega or Nano.

### Recommendations

There is no component-recommendation engine. Difficulty does not rank parts. Home recommendations do not read inventory. The onboarding mock cards in `MOCK_RECOMMENDED_PROJECTS` use hardcoded `matched` / `total` and are not the live catalogue.

### Alias layer (search only)

Search aliases can collapse two real parts into one catalogue hit (`bme280` → `bmp280`). That is the opposite of a compatibility decision: the search UI presents them as the same catalogue row. Inventory still stores whichever row the user saved.

---

## 4. Substitutions that are unsafe or that require a project change

These are grounded in authored project text or in catalogue rows that already differ. They are not a compatibility matrix.

| Situation already in the product | Why a silent substitute is wrong |
| --- | --- |
| Slug `8` active buzzer vs a passive piezo | The sketch uses `digitalWrite` only. The step text says a passive piezo stays silent. The catalogue cannot represent the difference. |
| Slug `18` positional SG90 vs a continuous-rotation servo | The steps say the project needs a servo that holds an angle. `Servo.write(90)` would not mean mid-travel. |
| Slug `18` servo VCC on the Uno 5 V pin | The steps say two SG90s can reset the board, and that joining the 5 V rails can back-feed the Uno. |
| Slug `18` red/orange servo leads swapped | The troubleshooting text says that can put 5 V on a GPIO. |
| Slug `4` BMP280 on 5 V | The steps say the part is 3.3 V and the ESP32 3V3 pin is the supply. |
| Slug `4` sketch `DHTTYPE DHT22` and `Adafruit_BMP280` | A DHT11 or a BME280 is a different library call or constructor. DHT11 exists as its own row. BME280 exists only as a BMP280 search alias. |
| Slug `8` `resistor-220` vs generic `resistor` | The BOM was deliberately moved to 220 Ω so the LED current limit is a specific part. The generic row has no ohm value. |
| Slug `1` OLED on Uno `A4`/`A5` | Those labels are the Uno I2C pins in the step text. A Mega’s I2C pins are not A4/A5. The steps do not mention Mega. **Proposed:** Mega can speak I2C, but only with a different pin map and the same 5 V OLED assumption. |
| Slug `11` / `12` / `14` “select Arduino Uno” plus `analogRead` 0–1023 | **Proposed:** Nano still has D9, A0, and a 10-bit ADC, but the upload instructions and the diagram symbol are the Uno. ESP32 is 3.3 V, uses a different board package, and its ADC range in the Arduino core is not the 0–1023 text these sketches teach. Pico is a different SDK. |
| Slug `18` pan-tilt bracket | The catalogue description is “Two-axis bracket kit for SG90 servos.” **Proposed:** `mg90s` is a similar hobby servo in the catalogue, and physical fit is not data we have. It must not be marked compatible from `type: 'servo'` alone. |

Breadboard and jumper wires are the closest thing to “any of this category will do,” and even those are physically specific in slug `18`: the steps tell the builder to keep two + rails separate and to remove rail-link jumpers. A breadboard whose rails are permanently joined would contradict that build. The catalogue has one `breadboard` row.

---

## 5. Future compatibility model

Compatibility is a result for one project requirement and one inventory component. It is not a global edge such as “Mega is compatible with Uno.”

Four outcomes, evaluated per requirement:

### Exact component

The inventory row is the canonical catalogue component, in sufficient quantity.

Example already in the catalogue and slug `18` BOM: `sg90` × 2. The walkthrough, bracket, lead colours, and `Servo` sketch are written for that part. The requirement’s substitution policy is exact because the mechanical steps name that body.

### Direct substitute

A different catalogue component meets every functional, electrical, physical, and software constraint of **this requirement**, and the existing instructions stay true.

**Proposed, and likely rare:** a second 220 Ω through-hole resistor row, if one were added later, against slug `8`’s LED resistor. Today there is only `resistor-220`. Do not invent a direct board substitute. Uno, Nano, and Mega already differ in header layout, upload target, and (for Mega) I2C pin numbers, and the diagrams are Uno symbols.

### Conditional substitute

The part can perform the role if the user changes something the current instructions do not say: pin, board package, library constant, voltage, or wiring.

**Proposed:**

- Slug `11` blink, inventory `arduino-nano` or `arduino-mega`: D9 exists as a digital pin on those boards in the Arduino pin naming these sketches use, the LED circuit is still a GPIO plus resistor, and the user must select a different board in the IDE. Mega on slug `1` is a larger change because the OLED text says A4/A5.
- Slug `1` or `4`, inventory `dht11` against a `dht22` requirement: the wiring is the same family, and the sketch constant must change. Accuracy and timing in the current DHT22 copy would also be wrong if left unchanged.

### Incompatible

The part cannot satisfy the requirement without a different circuit, a different sketch architecture, or an unsafe connection.

**Proposed:**

- `esp32` or `raspberry-pi-pico` against slug `11`’s authored Uno 5 V blink, until a variant walkthrough exists. The current code and “about 5 V” text would be false.
- `esp8266` against slug `18`’s `Servo` + `analogRead` 0–1023 + Uno pin map.
- Passive buzzer behaviour against slug `8`, once the catalogue can tell the two buzzers apart.
- Continuous-rotation behaviour against slug `18`.
- `arduino-uno-r3` against slug `4`, which powers sensors from 3V3 and calls `Wire.begin(21, 22)`.

A component may be exact on one project, conditional on another, and incompatible on a third. `arduino-mega` is the illustration: **proposed** conditional on slug `11` (digital D9), **proposed** conditional-with-pin-changes on slug `1` (I2C not on A4/A5), and incompatible with slug `4`’s ESP32 requirements.

---

## 6. Separate components from requirements

`project_components` should stay an exact canonical BOM. It is the part the walkthrough, diagram, and default visual were written for. Replacing it in place with loose capabilities would make current projects ambiguous and would hide the part the instructions assume.

Add a requirement layer beside it. During the period when a project has no requirement rows, behaviour stays the exact BOM match.

```text
Project
  → Component requirement          (role, quantity, policy, canonical part)
       → constraints               (what this project actually needs)
       → canonical component       (today’s project_components row)
  → Catalogue component            (what the user owns)
       → capabilities              (what that part is)
  → Compatibility result           (computed for this requirement)
```

Conceptual shape for slug `11`’s controller, **proposed** from the blink walkthrough (digital output D9, ~5 V, Arduino Uno board package, one board):

```text
Role: microcontroller
Quantity: 1
Policy: capability
Canonical component: arduino-uno-r3

Constraints taken from the current sketch, not from a generic “Arduino” idea:
- programmable in the Arduino IDE with a board package the step can name
- 5 V GPIO high
- one digital output
- the chosen output can be the pin the sketch calls D9, or the step must name the replacement pin
```

Slug `18`’s servo requirement should stay exact (`sg90`, quantity 2) until a mechanical fit is actually known. Slug `18`’s joystick can stay exact (`joystick`) because the steps assume a 5 V KY-023-style pin order. Slug `8`’s buzzer should stay exact until active vs passive is a real catalogue distinction.

Not every BOM line needs to become a capability requirement. Breadboard, jumpers, and the pan-tilt bracket can remain exact parts. The requirement table is allowed to point at one canonical component and set `substitution_policy = exact`, which reproduces today’s behaviour.

### What not to do

Do not encode “Mega satisfies Uno” as a row in a substitute table. That statement is false for slug `1`’s A4/A5 OLED wiring and false for slug `4`.

Do not infer compatibility from `category` or from `type`. `type: 'development_board'` includes Uno, ESP32, and Pico. `type: 'servo'` includes SG90 and MG90S and does not mention continuous rotation. `type: 'temperature_humidity'` includes DHT11, DHT22, and DHT20, which do not share the slug `1` / `4` constructor.

---

## 7. Component capabilities

Only fields that current authored projects already depend on. Each one is optional on parts where it does not apply. A constraint on a requirement is required only when that project’s instructions rely on it.

### `function`

What it is, finer than `category` / `type`.

Examples grounded in the catalogue: `development_board`, `positional_servo`, `active_buzzer`, `indicator_led`, `fixed_resistor`, `dht22`, `bmp280`, `pir_module`, `analog_joystick`, `i2c_oled_ssd1306`, `breadboard`, `breadboard_psu`.

Solderi needs this so `type: 'servo'` and `type: 'buzzer'` stop being treated as sufficient. Slug `18` and slug `8` already branch on this distinction in prose.

Required for any component that is allowed to satisfy a non-exact requirement. Optional on parts that are always exact (the pan-tilt bracket).

### `logic_level_v` and `supply_v`

The voltage the part drives or tolerates, and the voltage it must be powered from.

Slug `11`, `1`, `8`, `12`, `14`, and `18` are written as 5 V Uno logic. Slug `4` is written as 3.3 V ESP32, with an explicit ban on 5 V for the BMP280. Slug `18` splits “logic supply” (Uno 5 V for the joystick) from “servo supply” (PSU 5 V).

Required on boards, sensors, and actuators that a requirement may substitute. Optional on passive interconnect (jumpers).

### `gpio_capabilities`

A small set: `digital_input`, `digital_output`, `analog_input`, `pwm_output`, `i2c`, `one_wire`.

Slug `11` needs one digital output. Slug `8` needs a digital input and two digital outputs. Slug `14` needs an analog input and a digital output. Slug `1` needs analog input, one-wire, and I2C. Slug `4` needs one-wire and I2C at 3.3 V. Slug `18` needs two PWM-capable outputs and two analog inputs.

Required on development boards that participate in substitution. Optional elsewhere.

This set must stay specific. “Has GPIO” is too broad: it would mark an ESP32 as satisfying a 5 V Uno blink.

### `adc_full_scale`

The `analogRead` range the current sketches teach.

Slugs `14` and `18` say 0–1023 on the Uno. A board whose Arduino core returns a different range changes the threshold and `map()` behaviour in those sketches.

Required on boards before they can be conditional substitutes for an analog project. Optional on boards only used against digital-only requirements.

### `programming_environment`

`arduino_ide` plus a board-package id (`arduino_avr_uno`, `arduino_avr_mega`, `esp32`).

Every current sketch is Arduino (`.ino`) and the upload steps name the board. Pico is in the catalogue and has no Arduino sketch in these projects.

Required on development boards. Optional on sensors.

### `pin_profile_id`

A named header map, not a bag of loose pins. `uno_r3`, `nano`, `mega2560`, `esp32_devkit`.

Projects need this because the steps bind roles to labels (`D9`, `A4`). The same logical role lands on different labels, or the same label means a different physical pin. See section 10.

Required before any board is shown as a substitute. Optional on non-boards.

### `resistance_ohms`

Integer ohms where the part is a specific resistor.

Slug `8` already split `resistor-220` out of `resistor` because the LED step depends on 220 Ω. Slugs `11`, `12`, and `14` still use the generic row, so their requirements cannot honestly demand 220 Ω until those BOMs are updated. Do not pretend the generic row has a value.

Required only on fixed resistors that projects name by value. Optional, and empty, on `resistor`.

### `buzzer_drive`

`active_dc` or `passive_tone`.

Slug `8`’s sketch and warning depend on it. The current single `buzzer` row cannot fill this in honestly. Adding the field means splitting the catalogue row, or refusing substitution until the row is split.

Required before any buzzer substitution. Until then the requirement stays exact.

### `servo_kind`

`positional` or `continuous`.

Slug `18` depends on positional. `sg90` and `mg90s` are both described as hobby / metal-gear micro servos, which is evidence they are positional, not evidence they share a bracket.

Required on servos. Substitution of `mg90s` for `sg90` still needs a separate physical-fit fact that this audit does not have.

### `physical_form`

A short token: `uno_r3_header`, `nano_header`, `mega_header`, `sg90_body`, `through_hole_led`, `breadboard_module`.

Used so a visual and a wiring symbol can follow the real part, and so a bracket requirement can demand `sg90_body`.

Required when a requirement’s policy is anything other than exact and the instructions show a picture or a footprint. Optional for exact-only parts until a reference exists.

### Fields deliberately left out of the first model

Protocol bit rates, I2C addresses, pin current in milliamps, PWM frequency, servo torque, breadboard tie-point count, and Wi-Fi. Slug `4` does not use Wi-Fi in its current sketch even though the ESP32 has it. Slug `18` handles servo current by a project power constraint (“do not use Uno 5 V”), which is a requirement rule, not a universal servo attribute. I2C address `0x3C` / `0x76` / `0x77` already lives in the sketches.

---

## 8. Project-specific compatibility

Evaluation order:

```text
project requirement
  → constraints and substitution policy
  → canonical component (exact BOM)
  → candidate inventory component and its capabilities
  → result for this pair only
```

The engine does not read a table of part-to-part edges.

Inputs that are project-specific, not component-specific:

- Quantity.
- Substitution policy: `exact` or `capability`.
- Required capabilities (section 7).
- Power rules. Slug `18`: servo supply must be the external 5 V rail; joystick supply must be the logic rail; grounds must be common.
- Logical pin roles the sketch uses (`led_output`, `i2c_sda`), resolved through the candidate’s `pin_profile_id`.
- Code assumptions (`dht_type = DHT22`, `adc_full_scale = 1023`, `board_package`).
- Whether a walkthrough delta exists for this candidate. If the pins differ and no delta exists, the result cannot be “direct.”

`exact` policy: only the canonical UUID counts, in sufficient quantity. This is today’s matcher.

`capability` policy: a candidate is considered only if every required capability matches and every project power/pin/code constraint is satisfied or has an authored delta. Missing data is incompatible, not compatible. An empty `logic_level_v` must not pass a 5 V constraint.

Quantity stays per requirement. Slug `18` needs two positional servos. One SG90 does not satisfy quantity 2. Two MG90S would be a capability question only after physical fit exists; until then the policy stays `exact`.

The same inventory part is re-evaluated per requirement. Owning one Uno can satisfy slug `11` and slug `8` and still fail slug `4`.

---

## 9. Compatibility result

Computed, not stored as a permanent “these parts match” fact. A later UI can cache it. The first implementation only needs the shape.

```text
BUILDABLE
BUILDABLE_WITH_SUBSTITUTION
BUILDABLE_WITH_CHANGES
NOT_BUILDABLE
```

| Result | When | What the user is shown |
| --- | --- | --- |
| `BUILDABLE` | Every requirement is met by its canonical part, quantity included. | The existing BOM, all lines Owned. This is today’s full match. |
| `BUILDABLE_WITH_SUBSTITUTION` | Every requirement is met. At least one line is a different catalogue part that needs no instruction change. | Which inventory part covers which requirement, that it is a substitute, and that the written steps still apply. |
| `BUILDABLE_WITH_CHANGES` | The part can do the job only with an authored delta: pin, board package, library constant, voltage note, or wiring note. | The substitute, the requirement, each change in one list, and the warning text. The walkthrough that is shown must be the delta, not the canonical steps with the names swapped. |
| `NOT_BUILDABLE` | Some requirement has no safe candidate, or the only candidate is missing data, or the candidate would violate a voltage or code assumption that has no authored delta. | The unmet requirement, the canonical part, the inventory parts that were considered, and the specific failed constraint (“3.3 V board, this circuit is written for 5 V”). No alternate wiring is invented in the result. |

Per requirement line, the result also carries:

- `requirement_id` and role
- `canonical_component` slug and name
- `satisfying_component` slug and name, when one exists
- `match_kind`: `exact` | `substitute` | `substitute_with_changes` | `none`
- `quantity_required`, `quantity_applied`
- `warnings[]`
- `changes[]` with a stable code: `board_package`, `pin_map`, `library_constant`, `supply`, `wiring`, `mechanical`
- `walkthrough_variant_id`, when a delta exists

Project-level status is the worst line: any `NOT_BUILDABLE` line makes the project `NOT_BUILDABLE`. A changes line with no worse line makes the project `BUILDABLE_WITH_CHANGES`. Substitution without changes makes `BUILDABLE_WITH_SUBSTITUTION`. All exact makes `BUILDABLE`.

`matchPercentage` today counts exact lines. A future percentage must not count a conditional substitute as a full line until the user has accepted the changes. Otherwise the project list will show “100% ready” for a build whose diagram is still the Uno.

---

## 10. Physical, electrical, functional, and software compatibility

A part is fully compatible only when all four pass for that requirement.

| Kind | Question | Failure in the current projects |
| --- | --- | --- |
| Functional | Does it perform the role the sketch uses? | Continuous-rotation servo does not hold an angle. Passive buzzer does not sound on `digitalWrite`. DHT11 is a humidity sensor and still is not `DHTTYPE DHT22`. |
| Electrical | Can it sit on this project’s voltages and pin currents? | BMP280 on the slug `4` 3.3 V rail vs a 5 V board. Servo current on Uno 5 V in slug `18`. LED without the 220 Ω part on slug `8`. |
| Physical | Can the user install it as the steps and the picture show? | Mega header is not the Uno symbol in the slug `8` and `18` layouts. Pan-tilt steps seat an SG90 in a bracket pocket. Nano is a different module shape. |
| Software | Do the board package, libraries, and numeric assumptions hold? | “Select Arduino Uno.” `Wire.begin(21, 22)`. `analogRead` 0–1023. `Servo.h`. `DHTTYPE`. |

Functional similarity is the check that currently looks tempting and is the wrong one. `category: 'microcontrollers'` and `type: 'development_board'` are functional buckets. They include boards that fail the other three checks on every authored 5 V Uno project.

---

## 11. Impact on walkthroughs and wiring diagrams

The canonical walkthrough remains the instructions for the canonical BOM. A substitute does not reuse those strings with the names find-and-replaced.

### What must be able to differ

| Artifact | Bound to the canonical part today | Needed for a substitute |
| --- | --- | --- |
| Step prose and warnings | “Arduino Uno”, “about 5 V”, “select Arduino Uno” | A variant paragraph only where the sentence becomes false. |
| `components` blocks | Slug and illustration of the canonical part | The slug and illustration of the part actually used. |
| Connection rows | `"Arduino Uno"` / `"D9"` | Logical roles resolved through the candidate pin profile. |
| Wiring layout | `kind: 'arduino-uno'` and Uno port coordinates, keyed only by project slug | A layout id per pin profile, or a refusal to draw a diagram when the profile has no layout. |
| Code blocks | Numeric pins, `DHTTYPE`, `Wire.begin` arguments | An authored code variant. The app must not rewrite C++ by substituting pin numbers automatically in the first phases. |
| Code explanation | Restates those pins | The same variant as the code. |
| Troubleshooting | “confirm D9”, “SDA→A4” | The variant’s pin names. |
| Step visuals | Must match the BOM part | The physical reference of the part in use. Section 12. |
| BOM display | Catalogue name of the requirement’s canonical part | Canonical name, plus the inventory part that satisfied it, plus match kind. |

### Logical pins vs physical pins

Projects should name roles. The pin profile names headers.

```text
Slug 8 roles, taken from the current sketch:
  motion_input  → canonical uno_r3.D2
  led_output    → canonical uno_r3.D8
  buzzer_output → canonical uno_r3.D9

Slug 1 roles:
  dht_data → uno_r3.D2
  soil     → uno_r3.A0
  ldr      → uno_r3.A1
  i2c_sda  → uno_r3.A4
  i2c_scl  → uno_r3.A5
```

A Mega profile that maps `i2c_sda` to pin 20 is a different profile. Showing the Uno’s A4 sentence beside a Mega is a wrong diagram. If that profile has no authored step delta and no layout, the result is `NOT_BUILDABLE` or at most `BUILDABLE_WITH_CHANGES` with an explicit “diagram not available for this board” state. It is not a silent redraw.

Slug `4` roles (`dht_data` = GPIO 4, `i2c_sda` = GPIO 21, `i2c_scl` = GPIO 22) belong to `esp32_devkit`. They are not a permutation of the Uno map.

### Code

The first phases do not generate sketches. A conditional result may display a change list (“choose Arduino Nano in the board menu”) only when that sentence has been written. Automatic pin substitution inside `.ino` source is a later, separate authoring task, and only for projects that opt in.

---

## 12. Impact on visual references

The visual system is specified in `docs/SOLDERI_VISUAL_SOURCE_OF_TRUTH.md` and `assets/visual-references/README.md`. References are not wired into the app. This audit does not change them.

The intended chain stays:

```text
Catalogue component  →  physical reference folder  →  step visual
```

Current folders and the slugs their READMEs name:

| Folder | Catalogue slug |
| --- | --- |
| `components/arduino-uno` | `arduino-uno-r3` |
| `components/pir-motion-sensor` | `pir-sensor` |
| `components/led` | `led` |
| `components/buzzer` | `buzzer` |
| `components/breadboard` | `breadboard` |
| `components/jumper-wires` | `jumper-wires` |
| `projects/motion-sensor-alarm` | project slug `8` (project-specific assemblies only) |

There is no Mega, Nano, ESP32, servo, or resistor reference folder. Nano and Mega already share the generic board illustration in the app, which is a separate problem from photography: a generated photo still has to use a canonical reference per catalogue component.

Rules for the future compatibility system:

- `arduino-uno-r3` and `arduino-mega` get separate physical references. Sharing `components/arduino-uno` for both would violate the visual source of truth (“do not substitute a generic unrelated part”, “component identity”).
- A step visual is generated for the component variant that satisfied the requirement, not always for the canonical BOM, once a substitute is actually selected.
- Until a reference folder exists for that variant, the visual pipeline should keep the canonical image only when the result is `BUILDABLE` (exact). A substitute without a reference does not reuse the Uno photo.
- Project folders (`projects/motion-sensor-alarm`) stay for assemblies. They should not grow a second copy of the Uno. A Mega build of the same project would need its own assembly references if the silhouettes differ.
- Wiring `kind: 'arduino-uno'` is the diagram symbol, not the photo reference. Both must change together when the board changes. Leaving the Uno symbol in the diagram and a Mega photo in the step visual is an inconsistent build.

The buzzer README already records the tension: the catalogue name is Piezo Buzzer, and the Motion Sensor Alarm text requires an active buzzer. One reference folder matches one catalogue row. Splitting active and passive buzzers means splitting the reference, not pointing both behaviours at `components/buzzer`.

---

## 13. Migration strategy

Each phase keeps the previous phase’s user-visible behaviour until that phase explicitly switches a project over.

### Phase A — Keep exact matching

No schema change. `project_components` and `matchProjectInventory()` remain the buildability path. New capability data, if present, is ignored by the matcher.

This is the current system. It stays the default for every project that has no requirement rows.

### Phase B — Add capabilities

Add capability records for a closed set of existing catalogue rows (section 14). Prefer a normalised table or a typed JSON document keyed by `components.id`, seeded from slugs so the UUID can change between environments.

Do not infer capabilities from `category`, `type`, description, or aliases. Leave `buzzer_drive` empty on `buzzer` until the row is split. Leave `resistance_ohms` empty on generic `resistor`.

The app matcher still uses UUIDs.

### Phase C — Add project requirements

Add requirement rows for one project first. Each row points at the existing canonical `project_components` component and copies its quantity. Policy starts as `exact`, which must produce the same Owned/Missing result as today.

Only after that parity check: set policy to `capability` on the single requirement chosen in section 14.

Do not delete `project_components`. The canonical BOM remains the authoring source for the default walkthrough.

### Phase D — Evaluate compatibility

Implement the result type in the app, pure function, for projects that have requirement rows. Projects without requirement rows keep `matchProjectInventory()`.

Missing capability data fails the constraint. The function does not call out to an LLM and does not rewrite step JSON.

### Phase E — Recommendations and buildability UI

Point the project list and project detail at the new result for opted-in projects. Show substitute and change lines. Keep the percentage from counting unaccepted conditional matches as complete.

Home recommendations can then prefer `BUILDABLE` and `BUILDABLE_WITH_SUBSTITUTION` over catalogue order. That change waits until more than one project is published; today only slug `18` is published, and its interesting parts should stay `exact`.

### Phase F — Conditional substitutions and variant instructions

Author pin profiles and step deltas only where a real project needs them. First candidate is a digital-only board delta, not the pan-tilt mechanism and not the ESP32 weather station.

A project with no delta for a candidate stays `NOT_BUILDABLE` for that candidate even if the high-level role matches.

Wiring layouts gain a profile key. The slug `8` and `18` Uno layouts remain the canonical profile `uno_r3`.

---

## 14. Initial scope

Smallest useful first implementation: **prove one digital-output board requirement on an unpublished but fully authored project, without changing slug `18` and without rendering a second walkthrough.**

### Project

**Blinking LED, slug `11`.**

The BOM is Uno, LED, generic resistor, breadboard, jumpers. The circuit is D9 → resistor → LED anode, cathode → GND. The sketch is `digitalWrite` on pin 9. There is no I2C, no analog read, no servo current, and no mechanical bracket. It is the smallest authored project whose controller line is an exact UUID today.

Slug `11` is unpublished. That is an advantage: the experiment does not change the only published build (slug `18`).

### Requirement to introduce

One requirement: role `microcontroller`, quantity 1, canonical `arduino-uno-r3`, policy `capability`.

Every other slug `11` line stays `exact` (`led`, `resistor`, `breadboard`, `jumper-wires`).

### Catalogue rows in the first capability set

Boards that already exist:

| Slug | First-pass capabilities that the blink sketch actually needs | Proposed result on slug `11` only |
| --- | --- | --- |
| `arduino-uno-r3` | 5 V GPIO, digital output, Arduino IDE `arduino_avr_uno`, pin profile `uno_r3` with `led_output = D9` | `BUILDABLE` exact |
| `arduino-nano` | 5 V GPIO, digital output, Arduino IDE, pin profile `nano` with a D9 digital pin | `BUILDABLE_WITH_CHANGES` only after a written delta that says to select Nano. Until that sentence exists, `NOT_BUILDABLE`. |
| `arduino-mega` | 5 V GPIO, digital output, Arduino IDE, pin profile `mega2560` with a D9 digital pin | Same rule as Nano. Do not mark it a direct substitute. The diagram kind is still `arduino-uno`, and slug `11` has no visual layout yet, but the step text still says Arduino Uno. |
| `esp32` | 3.3 V GPIO, different board package | `NOT_BUILDABLE` on slug `11` until a 3.3 V variant exists. |
| `esp8266`, `raspberry-pi-pico` | Different packages / SDK | `NOT_BUILDABLE` on slug `11`. |

Negative controls, still no matcher change required to *document* them, and they must stay exact in the first implementation:

| Case | Why it is in the first test list |
| --- | --- |
| Slug `8` `buzzer` | The walkthrough already forbids a passive piezo. The capability field stays empty so the engine cannot “pass” it. |
| Slug `18` `sg90` × 2 and `pan-tilt-bracket` | Published project. Policy remains `exact`. `mg90s` must not satisfy it. |
| Slug `4` `esp32` + 3.3 V sensors | A Uno must not satisfy it. Guards the engine against a symmetric “all development boards match” bug. |
| Slug `8` `resistor-220` vs inventory `resistor` | Value is unspecified on the generic row, so it stays missing. |

DHT11 vs DHT22 is the second project to convert, not the first. It needs a library-constant delta (`DHTTYPE`) and the plant-monitor and weather-station sketches both hard-code DHT22. That is Phase F, after the blink board result is boring and correct.

### What the first implementation does not include

- No change to slug `18` matching, steps, or diagrams.
- No generated sketches.
- No second wiring layout.
- No visual-reference files for Mega or Nano.
- No home-recommendation ranking.
- No use of search aliases as capabilities.
- No claim that Nano or Mega is ready to build from the existing Uno sentences.

---

## 15. Final recommendation

### Recommended architecture

Keep three layers:

1. **Catalogue component** — one physical part the user can own. UUID in the database, slug in the app. Capabilities hang off this row.
2. **Project requirement** — the role a project needs, with quantity, a substitution policy, constraints, and a canonical component. The canonical component remains the current `project_components` row.
3. **Compatibility result** — computed per requirement against one inventory component. Never stored as “part A replaces part B” globally.

`project_components` stays the canonical BOM so existing walkthroughs, diagrams, and visuals keep a single part they were written for. Requirements sit beside that BOM. `exact` policy reproduces today’s UUID match. `capability` policy is opt-in per requirement.

This is preferable to a substitute-edge table because the same Mega is a different answer on the blink project, the plant monitor, and the weather station. It is preferable to overloading `project_components.component_id` because that column is already the exact part inside step JSON, layouts, and the owned/missing UI.

### Required schema changes

Not created by this audit.

- `component_capabilities`
  - `component_id` → `components.id`
  - `capability` text (the field names in section 7)
  - `value` text
  - unique `(component_id, capability)`
  - absent row means unknown, which fails a requirement that asks for that capability
- `pin_profiles`
  - `id` slug (`uno_r3`, `nano`, `mega2560`, `esp32_devkit`)
  - `component_id` → the board that uses it
- `pin_profile_bindings`
  - `pin_profile_id`, `logical_pin`, `physical_label`
  - example: `uno_r3`, `led_output`, `D9` for a project that binds the role on the requirement, not on the profile globally
- `project_requirements`
  - `project_id`, `role`, `quantity`, `substitution_policy` (`exact` | `capability`), `canonical_component_id`, `sort_order`
  - unique `(project_id, role)` for the first version, while each role appears once
- `project_requirement_constraints`
  - `requirement_id`, `capability`, `value`
- `project_requirement_pin_roles`
  - `requirement_id`, `logical_pin`, `canonical_physical_label`
  - the canonical label is what today’s steps already say
- `walkthrough_variants` (Phase F, not part of the first implementation)
  - `project_id`, `pin_profile_id`, `step_sort_order`, replacement blocks or a structured change list
  - only rows that truly differ

`inventory_items` does not need a variant column. A new physical variant is a new `components` row. `user_projects` does not need a variant column until the app stores which substitute the user accepted (Phase F).

`components.slug`, `aliases` in TypeScript, and onboarding ids stay as they are. Aliases remain search text.

### Required application changes

When those phases are built, these call sites are the ones that encode the exact-UUID assumption or the exact-name assumption:

| Area | Change |
| --- | --- |
| `lib/projects.ts` `matchProjectInventory()` | Keep for projects with no requirements. Add a second function for requirement evaluation. |
| `app/project/[id].tsx`, `components/projects/ProjectComponentRow.tsx`, `components/projects/ProjectListCard.tsx` | Show match kind, substitute name, and warnings. |
| `app/(tabs)/index.tsx` | Recommendation ranking only in Phase E. |
| `constants/component-catalogue.ts` | Authoring source for capability seeds. Not the runtime source of truth once the table exists. |
| `lib/inventory.ts`, `lib/onboarding-persistence.ts` | Still write exact catalogue UUIDs. No change in the first implementation. |
| `constants/walkthrough-content.ts` `StepConnection` | Later, optional logical pin ids beside the display strings. |
| `constants/wiring-diagrams/*`, `lib/wiring-diagram.ts` | Layouts keyed by pin profile. Alias matcher must not bind “Arduino Mega” to the Uno symbol via the alias `arduino`. |
| `app/project/build/[id].tsx` | Select canonical steps or an authored variant. Do not string-replace component names. |
| Visual reference pipeline (not built yet) | Resolve the catalogue slug that satisfied the requirement, then that slug’s reference folder. |
| `constants/projects-data.ts` `COMPONENT_POOLS` | Leave unused. Do not extend it into the compatibility model. |

### First implementation phase

**Phase B, then a Phase C parity check on slug `11` only.**

1. Add capability data for `arduino-uno-r3`, `arduino-nano`, `arduino-mega`, `esp32`, `esp8266`, and `raspberry-pi-pico`, limited to `function`, `logic_level_v`, `supply_v`, `gpio_capabilities`, `adc_full_scale`, `programming_environment`, and `pin_profile_id`.
2. Add one `project_requirements` row for slug `11`’s microcontroller, policy `exact`, canonical `arduino-uno-r3`.
3. Run it beside `matchProjectInventory()` and require the same Owned/Missing result.
4. Do not flip that row to `capability`, and do not mark Nano or Mega buildable, until a written board-menu delta exists (that flip is the start of Phase D/F, not this first slice).
5. Leave slug `18`, slug `8`’s buzzer, and slug `4` on the exact BOM path as negative controls.

### Risks

| Risk | What it looks like here |
| --- | --- |
| Incorrect compatibility | `type: 'development_board'` or the wiring alias `arduino` treats Mega, ESP32, and Uno as the same object. The alias `bme280` on `bmp280` already collapses two sensors in search. |
| Unsafe substitution | Passive buzzer on slug `8`, servo current on Uno 5 V, BMP280 on 5 V, servo red/orange swap. An engine that only checks “has a signal pin” will recommend these. |
| Over-broad capabilities | “Microcontroller”, “sensor”, and “5 V tolerant” are each too coarse for the projects that already name a protocol, a library, and a pin. |
| Pin differences | Uno A4/A5 I2C vs Mega I2C pins, vs ESP32 GPIO 21/22. The plant-monitor and weather-station steps are wrong if the board changes and the text does not. |
| Code differences | `DHTTYPE`, `Wire.begin(21, 22)`, `analogRead` 0–1023, `Servo.h`, board package. Substituting the part without substituting the sketch teaches a circuit that will not compile or will not read correctly. |
| Physical differences | Uno vs Mega vs Nano silhouettes, SG90 bracket pockets, one shared buzzer photo for two electrical behaviours. |
| Rule explosion | A full cross-product of 46 parts by 22 projects, or a hand-written substitute edge for every pair. The constraint evaluator plus `exact` as the default avoids that. Author deltas only for slug `11`’s digital output first. |
| Dual catalogues drifting | Capabilities added only in TypeScript will not affect SQL-backed matching; capabilities added only in SQL will not affect search. Seeds must be generated from one authoring list keyed by slug. |
| Percentage lies | Counting a conditional Mega as a satisfied Uno line will show the blink project as ready while every sentence still says Arduino Uno. |

---

## Appendix — authored BOM slugs

| Project | Slug | Published in migrations | Canonical parts |
| --- | --- | --- | --- |
| Smart Plant Monitor | `1` | no | `arduino-uno-r3`, `soil-moisture`, `dht22`, `ldr`, `resistor`, `oled-096`, `breadboard`, `jumper-wires` |
| Weather Station | `4` | no | `esp32`, `dht22`, `bmp280`, `breadboard`, `jumper-wires` |
| Motion Sensor Alarm | `8` | no | `arduino-uno-r3`, `pir-sensor`, `buzzer`, `led`, `resistor-220`, `breadboard`, `jumper-wires` |
| Blinking LED | `11` | no | `arduino-uno-r3`, `led`, `resistor`, `breadboard`, `jumper-wires` |
| Traffic Light | `12` | no | `arduino-uno-r3`, `led` ×3, `resistor` ×3, `breadboard`, `jumper-wires` |
| Night Lamp | `14` | no | `arduino-uno-r3`, `ldr`, `led`, `resistor` ×2, `breadboard`, `jumper-wires` |
| Servo Pan-Tilt Camera | `18` | yes | `arduino-uno-r3`, `sg90` ×2, `joystick`, `pan-tilt-bracket`, `breadboard-psu`, `breadboard`, `jumper-wires` |

Projects `2`, `3`, `5`–`7`, `9`, `10`, `13`, `15`–`17`, and `19`–`22` have metadata only. They have no `project_components` rows in these migrations. An empty BOM already yields `matchPercentage: null`.
