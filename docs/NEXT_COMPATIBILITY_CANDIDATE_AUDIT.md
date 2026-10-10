# Next compatibility candidate

Selection audit only. No requirement, review, migration, matcher, walkthrough, BOM, or catalogue change is made by this document.

Sources read for this decision:

- `docs/COMPONENT_COMPATIBILITY_AUDIT.md`
- `docs/COMPONENT_REQUIREMENTS_DESIGN.md`
- `docs/FIRST_COMPATIBILITY_CANDIDATE_AUDIT.md`
- `docs/SERVO_PAN_TILT_COMPATIBILITY_AUDIT.md`
- `lib/compatibility.ts` and `lib/compatibility.test.ts`
- `constants/component-catalogue.ts`
- `supabase/migrations/20261004210000_component_requirements_foundation.sql`
- `supabase/migrations/20261006150000_blink_resistor_direct_substitute.sql`
- Authored BOMs and steps in `20260922200000_phase_3_3_project_components.sql`, `20260928200000_msa_content_audit.sql`, `20260928220000_servo_pan_tilt_camera.sql`, and `20260922220000_phase_3_7_project_steps.sql`
- `constants/walkthroughs/motion-sensor-alarm.ts` and `constants/walkthroughs/servo-pan-tilt-camera.ts`

The recorded substitution is Blinking LED (slug `11`) generic `resistor` ×1 → `resistor-220`. This audit does not repeat it. That review belongs to slug `11` only.

---

## Recommendation

**Traffic Light Simulator (slug `12`): generic Resistor ×3 → 220 Ω resistor (`resistor-220`) ×3, as a direct substitute for that project’s resistor line only.**

It is the only remaining pair where the alternative is already a catalogue part, the project’s own steps describe the same circuit the part was approved for, and no wiring, code, or assembly change is required.

Approve it only as a new review of the slug `12` requirement. Do not reuse the slug `11` review row.

---

## Canonical part and alternative

| | Identity |
| --- | --- |
| Project | Traffic Light Simulator, slug `12`, unpublished in the project seed |
| Canonical BOM line | `resistor` (“Resistor”, “Through-hole resistor”) ×3, sort order 3 |
| Alternative | `resistor-220` (“220 Ω resistor”). Description: “Current-limiting resistor for a typical 5 V LED”. Aliases include `led resistor`. |
| Existing facts on the alternative | `function = fixed_resistor`, `resistance_ohms = 220`, written by the blink migration. Those rows describe the part. They do not approve it for slug `12`. |

The other slug `12` lines stay exact: Arduino Uno R3 ×1, LED ×3, breadboard ×1, jumper wires ×1. There is no second LED colour in the catalogue. The steps treat red, yellow, and green as positions, and they allow three LEDs of one colour.

---

## Engineering evidence

Each branch is the blink circuit, which the steps say outright: “Think of three copies of the blink circuit, each with its own GPIO.”

| Check | What the slug `12` steps say |
| --- | --- |
| Role | One series resistor per LED. Sharing one resistor across the LEDs is forbidden. |
| Wiring | D8 → resistor → red LED anode → GND. D9 and D10 are the same path for the other two LEDs. |
| Drive | `digitalWrite` HIGH or LOW. `allOff()` runs before each colour, so one LED is on at a time. |
| Board | Arduino Uno. The blink steps, which this circuit copies, describe HIGH as about 5 V. |
| Code | Pin numbers and `delay()` only. Resistance is not in the sketch. |
| Ohm value | Not named. The resistor is not given a polarity. |
| Assembly | Breadboard rows. No mechanical fit beyond a through-hole part in series. |

The same path is already built with `resistor-220` on the published motion-alarm walkthrough: Uno digital pin, series 220 Ω resistor, the same catalogue LED, cathode to GND. Slug `11` then reviewed that part as a direct substitute for one copy of this circuit. Slug `12` is three of those copies, and the sketch never turns more than one on.

No walkthrough sentence becomes false if each of those three positions holds a 220 Ω resistor.

---

## Classification

**Suitable as a direct substitute**, for this requirement, at quantity 3.

Not conditional: wiring, code, breadboard layout, and the step text can stay as written.

Not unverified: the missing LED forward voltage and current are the same gap already accepted for slug `11` and slug `8`. This audit does not invent those numbers. The decision uses the project text, the catalogue description of `resistor-220`, and the motion-alarm circuit that already uses that part with this LED.

A user with fewer than three `resistor-220` units does not satisfy the line. The matcher already subtracts the full BOM quantity and will not mix `resistor` and `resistor-220` to make 3.

---

## What this does not approve

- Slug `1`’s resistor. It is the LDR divider on A1, and the steps say it is not a DHT pull-up.
- Slug `14`’s resistor ×2. One unit is the A0 divider and one is the D9 LED resistor. They share one BOM line, so a line-level review would put 220 Ω in the divider as well. No LDR resistance is stored, so that divider result is unknown. The LED half matches blink; the line does not.
- Slug `8` in reverse. Its canonical part is already `resistor-220`. The generic resistor has no ohm value.
- Any other ohm value. The slug `12` review would name `resistor-220` only.

---

## User benefit

`resistor` and `resistor-220` are different catalogue rows. Someone who owns the 220 Ω LED resistor — the only resistor in the catalogue with a value, and the resistor on the motion-alarm BOM — is still told the traffic light needs a generic resistor.

The benefit is real and narrower than the blink line. Quantity is 3, so one 220 Ω resistor from the motion alarm does not finish this project. It helps a builder who has at least three of that catalogue part.

Slug `12` is unpublished in the seed migrations. Authoring the review does not show it to users until the project is published. This audit does not publish it.

---

## Other candidates

| Candidate | Class | Why it is weaker |
| --- | --- | --- |
| Slug `11` resistor → `resistor-220` | already recorded | Not the next substitution. |
| Slug `14` both resistors → `resistor-220` ×2 | not a line-level substitute | The divider and the LED limiter are one quantity. LDR ohms are absent, so a 220 Ω divider is unverified. |
| Slug `1` divider → `resistor-220` | not this part’s job | The steps assign that resistor to the LDR divider. The 220 Ω row is an LED limiter. |
| Slug `1` DHT22 → DHT11 or DHT20 | unverified | Both alternatives share the catalogue line “Temperature & Humidity Sensor”. No supply, logic level, or interface row. The sketch is `DHTTYPE DHT22` on Uno 5 V with a two-second read. A type change is a code change, so this would be conditional only after those facts exist. |
| Slug `4` DHT22 → DHT11 | unverified | ESP32 steps power the sensor from 3V3 and forbid 5 V on the BMP280. DHT11 has no supply row. The sketch is still `DHTTYPE DHT22`. |
| Slug `4` DHT22 → DS18B20 | different circuit | One-wire probe versus the DHT data pin and DHT library. |
| Slug `18` SG90 ×2 → MG90S | unverified | Catalogue text is “9g hobby servo motor” versus “Metal-gear micro servo”. The bracket is “for SG90 servos”, and the steps seat that body in the kit pockets. No body, lug, or spline data. Quantity 2 will not combine one of each. |
| Uno → Nano, Mega, ESP32, ESP8266, or Pico | unverified or conflicting | Pin profiles other than a few Uno pins are empty. Steps name “Arduino Uno”. ESP32 capabilities are 3.3 V, which conflicts with the 5 V LED sentence. Not chosen because they are boards. |
| OLED → 16×2 LCD, MAX7219, or TM1637 | different circuit | Plant monitor is I2C 128×64 at `0x3C`. |
| BMP280 → BME280 | no second component | `bme280` is a search alias on `bmp280`. |
| PSU → LM7805, or 9 V clip | different build | Slug `18` needs a rail-clip 5 V servo supply. The steps reject a 9 V snap. `supply_v` is not an output voltage. |
| HC-05 → HC-06 | no project BOM | Neither module is on a `project_components` row. |
| Projects without a BOM | no line to review | Slugs other than 1, 4, 8, 11, 12, 14, and 18 have no component rows. |

DHT11 and MG90S would help more inventories if the electrical or mechanical facts were in the project data. They are not. Approving them from the part name would invent those facts.

---

## Implementation status

Implemented in `supabase/migrations/20261010203000_traffic_light_resistor_direct_substitute.sql`. Slug `12` now has its own `series_resistor` requirement, policy `direct`, the two constraints, and one direct review of `resistor-220` with no change rows. The slug `11` review is a separate row. Slug `12` stays unpublished.

## Smallest implementation, after approval

Implemented by the migration above. Do not extend it to other projects.

1. One migration for slug `12` only. Insert a `series_resistor` requirement on the existing generic-resistor BOM line, policy `direct`. Constrain `function = fixed_resistor` and `resistance_ohms = 220`. Insert one review of `resistor-220`, assessed `direct`, with no change rows.
2. Leave the `resistor-220` capability rows that already exist. Do not add `physical_form`, `logic_level_v`, or `supply_v` to either resistor.
3. Leave `project_components`, the steps, the slug `11` review, and every other project alone.
4. Add a matcher fixture: three owned `resistor-220` units cover this line as `direct_substitute`, and the canonical name stays Resistor. One owned unit does not. A conditional review does not.

No matcher, evaluator, or row-display change is required. Quantity and direct-only coverage already work. The detail row already shows a direct substitute by its catalogue name.

---

## Schema and evaluator

The current schema and `evaluateComponentCompatibility` / `matchProjectInventory` already support this.

A direct review is accepted only for the requirement it is attached to, only when the constraints pass, and only with no instruction-facing change rows. Conditional reviews do not count as owned. Exact canonical stock is allocated first. Substitute stock must cover the whole line quantity.

Human approval of the slug `12` requirement is still the authority. The existing 220 Ω capability rows cannot approve this project by themselves.
