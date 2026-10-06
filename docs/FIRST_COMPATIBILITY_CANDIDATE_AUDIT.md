# First compatibility candidate

Selection audit only. No requirement, review, migration, walkthrough, BOM, or matcher change is made by this document.

Sources read for this decision:

- `docs/COMPONENT_COMPATIBILITY_AUDIT.md`
- `docs/COMPONENT_REQUIREMENTS_DESIGN.md`
- `docs/SERVO_PAN_TILT_COMPATIBILITY_AUDIT.md`
- `lib/compatibility.ts` and `lib/compatibility.test.ts`
- `constants/component-catalogue.ts`
- Live `public.projects`, `public.project_components`, and the capability tables
- Authored steps in `supabase/migrations/20260922220000_phase_3_7_project_steps.sql`, `constants/walkthroughs/motion-sensor-alarm.ts`, and `constants/walkthroughs/servo-pan-tilt-camera.ts`

---

## 1. Purpose

Choose the one substitution Solderi can support first, or say that none is safe.

A result shown to a user has to be true for that project’s steps. A nearby catalogue part is not enough.

---

## 2. Projects inspected

Live BOMs exist for seven projects. Other catalogue projects have no `project_components` rows.

| Slug | Title | Published | Walkthrough | What a substitute would have to survive |
| --- | --- | --- | --- | --- |
| `1` | Smart Plant Monitor | no | 9 steps, sketch, wiring | Uno 5 V. DHT22 on D2, `DHTTYPE DHT22`, module pull-up, two-second reads. Soil A0. LDR divider on A1 using the only BOM resistor. OLED I2C on A4/A5 at `0x3C`. |
| `4` | Weather Station | no | 8 steps, sketch, wiring | ESP32 3.3 V. DHT22 on GPIO 4, `DHTTYPE DHT22`. BMP280 on GPIO 21/22. Steps forbid 5 V on the BMP280. |
| `8` | Motion Sensor Alarm | yes | Authored TypeScript walkthrough plus wiring layout | Uno. PIR OUT D2. LED on D8 through the **220 Ω** resistor. Active buzzer on D9 with `digitalWrite`. Passive piezo is rejected in the steps. |
| `11` | Blinking LED Starter | no | 7 steps, sketch, wiring | Uno D9, HIGH described as about 5 V. Series resistor, no polarity, no ohm value in the steps. LED anode/cathode. Board menu “Arduino Uno”. |
| `12` | Traffic Light Simulator | no | 8 steps, sketch, wiring | Three separate LED branches, D8/D9/D10, one series resistor each. Quantity 3. No ohm value. |
| `14` | Light-Activated Night Lamp | no | 8 steps, sketch, wiring | Two generic resistors on one BOM line: one LDR divider on A0, one LED series resistor on D9. `analogRead` 0–1023. Threshold is tuned in Serial because the resistor value is not fixed. |
| `18` | Servo Pan-Tilt Camera | yes | 24 steps, sketches, wiring layout | Already audited. Controller, servos, joystick, PSU, breadboard rails, and bracket stay exact. |

The only existing requirement is slug `11`’s microcontroller line, policy `exact`, canonical Arduino Uno R3. No substitution reviews exist.

Catalogue parts that show up on more than one BOM:

| Part | Projects |
| --- | --- |
| `arduino-uno-r3` | 1, 8, 11, 12, 14, 18 |
| `resistor` | 1, 11, 12, 14 |
| `resistor-220` | 8 only |
| `led` | 8, 11, 12, 14 |
| `dht22` | 1, 4 |
| `ldr` | 1, 14 |
| `breadboard`, `jumper-wires` | most authored BOMs |

`dht11`, `dht20`, `mg90s`, `arduino-nano`, `arduino-mega`, `esp8266`, `raspberry-pi-pico`, `hc-05`, `hc-06`, `lcd-16x2`, and `lm7805` are real catalogue rows and are not on any BOM. `bmp280`’s search aliases include `bme280`. That is not a second component.

No resistor, DHT, servo, LED, or display has capability rows. `resistance_ohms` exists as a capability key and is unseeded.

---

## 3. Candidate shortlist

### 1. Blinking LED — generic resistor → 220 Ω resistor

- **Project:** Blinking LED Starter, slug `11`
- **Canonical:** Resistor ×1. The steps need a series part so D9 at about 5 V does not drive the LED straight to GND. They never name an ohm value. The resistor has no polarity.
- **Substitute:** 220 Ω resistor (`resistor-220`). It is in the catalogue. Description: “Current-limiting resistor for a typical 5 V LED”.
- **Type:** potential direct substitute
- **Why it might work:** Slug `8` already wires this exact part as two breadboard legs in series with an LED on a 5 V Uno pin. Slug `11` is that same path on D9: D9 → resistor → LED anode → GND. Code does not mention resistance. The sentences stay true if the part in that position is the 220 Ω resistor.
- **What could differ:** The ohm value. Blink does not specify one, so 220 Ω does not contradict a number in the steps. Package is the same breadboard-leg use as slug `8`. No voltage, pin, protocol, or code difference.
- **Tutorial changes:** no changes

### 2. Traffic Light — generic resistor ×3 → 220 Ω resistor ×3

- **Project:** Traffic Light Simulator, slug `12`
- **Canonical:** Resistor ×3. One series resistor per LED on D8, D9, and D10.
- **Substitute:** 220 Ω resistor, quantity 3. Same catalogue row.
- **Type:** potential direct substitute
- **Why it might work:** Same 5 V LED series role as blink, three times. Steps say not to share one resistor across the LEDs. Three separate 220 Ω parts do that.
- **What could differ:** Quantity. One owned 220 Ω resistor does not cover this line. The evaluator will not mix `resistor` and `resistor-220` to make 3.
- **Tutorial changes:** no changes, once the user actually has three

### 3. Night lamp — generic resistor ×2 → 220 Ω resistor ×2

- **Project:** Light-Activated Night Lamp, slug `14`
- **Canonical:** Resistor ×2 on one line. One is the A0 divider. One is the D9 LED resistor.
- **Substitute:** 220 Ω resistor ×2
- **Type:** clearly incompatible as a line-level substitute
- **Why it might work:** Only the LED half matches the 220 Ω description.
- **What could differ:** The divider half. LDR resistance is not in the catalogue. The steps tell the builder to retune `DARK_THRESHOLD` because the resistor value changes the reading. Replacing both parts with an LED current-limiter is not the divider the step describes.
- **Tutorial changes:** new instructions for the divider, and the quantity is one line so the two roles cannot be split

### 4. Plant monitor — generic resistor → 220 Ω resistor

- **Project:** Smart Plant Monitor, slug `1`
- **Canonical:** Resistor ×1, used only as the LDR divider on A1. The steps say it is not a DHT pull-up.
- **Substitute:** 220 Ω resistor
- **Type:** clearly incompatible
- **Why it might work:** It does not. The authored role is a divider, and the 220 Ω row is described as an LED current limiter.
- **What could differ:** The A1 voltage. No LDR resistance is authored, so the result of a 220 Ω divider is unknown.
- **Tutorial changes:** a different divider chapter

### 5. Motion alarm — generic resistor in place of 220 Ω

- **Project:** Motion Sensor Alarm, slug `8`
- **Canonical:** 220 Ω resistor ×1, in series with the LED on D8
- **Substitute:** Resistor (`resistor`). Description “Through-hole resistor”. Alias text includes “10k resistor”. No `resistance_ohms` row.
- **Type:** insufficient information
- **Why it might work:** It might be a 220 Ω part that was logged on the generic row. The database cannot tell.
- **What could differ:** Any ohm value, including one low enough to ignore the current-limit warning in the slug `8` steps.
- **Tutorial changes:** none if the value really is 220 Ω, which is not knowable

### 6. Plant monitor — DHT22 → DHT11

- **Project:** Smart Plant Monitor, slug `1`
- **Canonical:** DHT22 ×1. 5 V, DATA on D2, `DHTTYPE DHT22`, onboard pull-up, two-second reads.
- **Substitute:** DHT11. Catalogue row exists. Description is the same phrase as the DHT22: “Temperature & Humidity Sensor”. No supply, logic level, or interface row.
- **Type:** insufficient information
- **Why it might work:** Same illustration and the same DHT library family in general. That is not project data.
- **What could differ:** The sketch constant, sample timing, and any voltage limit. None of those differences are capability rows.
- **Tutorial changes:** code changes, and likely new instructions. Not safe to call conditional until the electrical facts are authored.

### 7. Weather station — DHT22 → DHT11

- **Project:** Weather Station, slug `4`
- **Canonical:** DHT22 on ESP32 3V3, GPIO 4, `DHTTYPE DHT22`
- **Substitute:** DHT11
- **Type:** insufficient information
- **Why it might work:** Not from the authored text. The steps are specific about 3.3 V and about DHT22.
- **What could differ:** Supply voltage. DHT11 has no `supply_v` row. The constructor still says DHT22.
- **Tutorial changes:** code changes, and a voltage check that the catalogue cannot support yet

### 8. Pan-tilt — SG90 → MG90S

- **Project:** Servo Pan-Tilt Camera, slug `18`
- **Canonical:** SG90 ×2, pockets and splines in the bracket kit
- **Substitute:** MG90S. Catalogue row, same illustration, no capability rows.
- **Type:** insufficient information
- **Why it might work:** Both are named micro servos. The bracket text names SG90. Fit is not data.
- **What could differ:** Body, lugs, spline, and the quantity rule that will not add one SG90 and one MG90S.
- **Tutorial changes:** mechanical changes if it does not drop into the kit

### Considered and kept off the “might work” list

| Pair | Class | Why it is not a candidate |
| --- | --- | --- |
| Blink Uno → Nano or Mega | insufficient information | 5 V and Arduino IDE are authored. Pin profiles are empty, so D9 is not data. Steps say “Select Arduino Uno”. `physical_form` differs, so this cannot be direct. |
| Blink Uno → ESP32 | clearly incompatible | Authored logic level and supply are 3.3 V. The blink step says HIGH is about 5 V. |
| Blink Uno → ESP8266 or Pico | insufficient information | Voltage and D9 are unauthored. Pico has no `programming_environment`. |
| DHT22 → DHT20 | insufficient information | Sketch requires `DHTTYPE DHT22`. DHT20 has the same one-line description and no interface row. |
| OLED → 16×2 LCD | clearly incompatible | Plant monitor is I2C 128×64 at `0x3C`. The LCD is a different display and a different library. |
| HC-05 → HC-06 | no project | Neither module is on a BOM. |
| BME280 for BMP280 | no second component | `bme280` is a search alias on `bmp280`. |
| Passive piezo for slug `8` | no second component | One `buzzer` row. The steps require `digitalWrite` on an active buzzer. |
| Any board for slug `18` | rejected earlier | See `docs/SERVO_PAN_TILT_COMPATIBILITY_AUDIT.md`. |

---

## 4. Candidate scoring table

Scores are 1–5. They are a decision aid.

| Candidate | Technical confidence | Physical compatibility | Tutorial impact | User value | Data completeness | Safety | Reusability |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 11: generic resistor → 220 Ω | 4 | 5 | 5 | 4 | 4 | 5 | 4 |
| 12: generic resistor ×3 → 220 Ω ×3 | 4 | 5 | 5 | 2 | 4 | 5 | 4 |
| 14: both resistors → 220 Ω | 2 | 3 | 2 | 2 | 2 | 2 | 1 |
| 1: divider resistor → 220 Ω | 1 | 3 | 1 | 2 | 2 | 2 | 1 |
| 8: 220 Ω → generic resistor | 1 | 3 | 4 | 4 | 1 | 1 | 2 |
| 1: DHT22 → DHT11 | 2 | 3 | 2 | 4 | 1 | 2 | 3 |
| 4: DHT22 → DHT11 | 1 | 3 | 2 | 3 | 1 | 1 | 2 |
| 18: SG90 → MG90S | 2 | 1 | 2 | 2 | 1 | 2 | 1 |

Tutorial impact is high when the current steps can stay. User value for the blink line is the published motion-alarm part: a builder who owns `resistor-220` from slug `8` is currently told that slug `11` still needs a different resistor row.

---

## 5. Rejected candidates

Rejected under the strict rules:

- **Divider lines (slugs `1` and `14`).** 220 Ω is authored as an LED limiter. Those lines are dividers, and slug `14` mixes both jobs on one quantity.
- **Generic resistor for slug `8`.** Missing ohms. Guessing from the “10k” alias would be worse.
- **DHT11 and DHT20.** No supply or interface capabilities. The sketches name `DHTTYPE DHT22`. Slug `4` is 3.3 V.
- **MG90S.** Bracket fit is unknown.
- **Nano, Mega, ESP32, ESP8266, Pico.** Empty pin profiles, different bodies, and IDE text that names another board. ESP32’s 3.3 V rows contradict blink’s 5 V sentence. Not chosen just because they are development boards.
- **LCD, HC-05/HC-06, BME280-as-alias, passive buzzer.** Missing component, missing project, or a different circuit.

---

## 6. Recommended first substitution

**Recommended first substitution: Blinking LED Starter (slug `11`) generic Resistor → 220 Ω resistor (`resistor-220`), quantity 1, as a direct substitute.**

---

## 7. Why it wins

The blink steps need a series resistor on a 5 V LED and do not name a value. The 220 Ω row is the catalogue’s 5 V LED current limiter, and slug `8` already builds that circuit with it on a breadboard. Wiring, code, pin, and pictures do not change.

It also helps a real inventory split. Slug `8` is published and its BOM is `resistor-220`. Slug `11` still asks for `resistor`. Those are different UUIDs today, so the motion-alarm resistor does not count.

The other high scores wait:

- **Traffic light** is the same electrical pattern, but the line quantity is 3. Do that second, after one review exists.
- **DHT11** would rescue a common sensor and still needs voltage data plus a sketch change. That is not a first direct substitute.
- **Boards** need pin rows and a board-menu change. They are conditional at best, and the pin data is absent.
- **Slug `18`** stays out, as already audited.

---

## 8. Required data

The schema can represent this. No new capability key.

Author, later, not in this audit:

| Row | Content |
| --- | --- |
| `resistor-220` capabilities | `function = fixed_resistor`, `resistance_ohms = 220` |
| Slug `11` resistor requirement | Role `series_resistor`, policy `direct`, linked to the existing BOM line |
| Constraint | `function = fixed_resistor` only |
| Review | `resistor-220`, assessed `direct`, no change rows |

Do not constrain `resistance_ohms = 220` on the requirement. The steps do not require 220 Ω. The review is what approves this one part. A later resistor with a different value does not pass unless it gets its own review.

Do not set `physical_form`, `logic_level_v`, or `supply_v` on only one of the two resistor rows. The evaluator treats a one-sided instruction-facing capability as an unknown difference and will refuse a direct review.

Leave the generic `resistor` row without `resistance_ohms`. Do not copy 220 Ω or the “10k” alias onto it.

The slug `11` microcontroller requirement stays `exact`.

---

## 9. Required walkthrough changes

None.

These sentences stay true: the resistor has no polarity; it sits between D9 and the LED anode; the LED cathode goes to GND; the sketch is unchanged.

Do not rewrite the steps to say “220 Ω” as the only acceptable part. Other values are simply not approved.

---

## 10. Required wiring and code changes

None.

No new diagram. Slug `11` has no wiring-layout file. The connection list stays D9 → resistor → LED anode, cathode → GND.

---

## 11. Risks

| Risk | Limit |
| --- | --- |
| Treating every generic resistor line as a 220 Ω line | Slugs `1` and `14` are dividers. Slug `14` cannot split the two roles. |
| Letting the generic row satisfy slug `8` | Ohms are unknown. Policy on that line stays exact. |
| A future 1 Ω part with `function = fixed_resistor` | It still needs its own review. Constraints alone do not approve it. |
| Calling this direct and then adding `physical_form` to one row | That makes the direct review invalid. Keep those capabilities off both rows until both are authored the same. |
| User value before slug `11` is published | The data can be authored now. Buildability does not change until a later task connects the evaluator, and the project is still unpublished. |

---

## 12. Implementation plan

Do not do this in the current task.

1. One migration that inserts the two capability rows, the slug `11` resistor requirement, the `fixed_resistor` constraint, and one direct review with no change rows.
2. A unit-test fixture that runs that input through `evaluateComponentCompatibility` and expects `direct_substitute`.
3. A second fixture that expects `not_supported` or `incompatible` if someone points the generic resistor at slug `8`, and that slug `1` is not given this review.
4. Leave `matchProjectInventory()`, the UI, the steps, and the slug `11` Uno requirement alone.
5. After that direct result is proven, consider the same review pattern for slug `12` at quantity 3. Not before.

---

## 13. Explicit decision

**Recommended first substitution: Blinking LED Starter (slug `11`) Resistor → 220 Ω resistor.**

The current schema is sufficient for that substitution. No other shortlisted pair is safe to show a user yet.
