# Project authoring

Use this when adding or revising a catalogue project. It is the checklist for ESP32, Arduino, and Raspberry Pi builds. A filled database row is not a finished project, and this document does not publish anything.

Author the project in local TypeScript first. Sync that same content into Supabase with a migration for that slug only. Leave `is_published` false until a separate publishing review.

## What to produce

- Project title, description, difficulty, duration, and learning objectives.
- A bill of materials whose every part exists in the component catalogue, including cables, headers, and power.
- Compatibility requirements. Substitutions stay on the existing per-project review system. Do not approve a part because its general specs look similar.
- Walkthrough steps in order, with stages.
- Wiring connections and a layout under `constants/wiring-diagrams/layouts/`, when the project is wired.
- The complete program the learner uploads, plus any excerpts taken from that same program.
- A cover key. Use a 16:9 workbench photograph, or register a pending key. Do not draw a stand-in.

`lib/project-authoring.ts` checks structure and cross-references. `localAuthoredProjects` in `lib/authored-projects.ts` runs that check on every project under `constants/walkthroughs/`. A project with one firmware file must paste that file. A project whose code steps are separate growing sketches is checked for step order, catalogue parts, and wiring, and is not required to match one firmware string. `npm run test:compatibility` runs these checks. They do not prove that the hardware works, that the instructions are clear, or that the diagram looks right.

## Quality gates

### 1. Hardware completeness

The BOM must be enough to build the project: board, sensor or actuator, connectors, headers, cable, and power. Name the physical configuration when a catalogue row is generic. If a part is sold with loose headers, say whether this project solders them or uses a socket and cable. Do not add soldering as a surprise step. If a dimension or connector cannot be verified, say so and pick a configuration that does not depend on the unknown measurement.

### 2. Electrical consistency

Power voltage, GPIO numbers, interface, and signal levels must match across the BOM, the steps, the wiring list, the diagram layout, and the program. `reviewAuthoredProject` checks that every connection resolves to a diagram port and that step wiring uses the project connection list.

### 3. Code completeness

A new single-program project needs one complete program. Excerpts must be slices of that program and must be labelled as excerpts. The upload step is the only place that pastes the whole file. An existing project that already shows a new complete sketch at each code step keeps that format.

### 4. Firmware verification

When a toolchain can run here, compile the sketch with the board package and libraries the tutorial names. Record the toolchain and library versions. If it cannot be installed or invoked, say that compilation is unverified. A TypeScript check is not an Arduino compile. A failed compile is a defect. A compile does not mean the board was run.

### 5. Instruction completeness

Write for the project’s difficulty. Define GPIO, I2C, SSID, IP address, JSON, and any other term at the first step that needs it. Each step should say what to do next. Partial code must not look like a sketch to upload.

The opening should say what the person is building, what the finished project does, and what they will learn, without repeating that same overview on later steps. Introduce a term when the step needs it.

A breadboard project shows a layout a person can copy: which leads share a row, which rows stay separate, and where the supply rails are. Count every jumper the layout actually uses, including male-to-male links from a terminal strip to a rail. Wire in stages, with a checkpoint after each stage, and keep one complete connection list. Do not paste that full list on every wiring step.

Keep the main explanation short. Put voltage, current, and protocol detail in a separate block for someone who wants it. There is no expandable control in the walkthrough, so a headed text block is the separation.

A code excerpt is a slice of the uploadable program, and the step says so. The complete program stays in one copyable step. Phone or app steps name the taps, the write format, and what should change. Buttons and dialogs in the walkthrough do something useful. Do not leave a control that only announces unfinished work.

These are the bar for a new tutorial. They are not a fixed sequence of stages. A sensor project and a radio project will not share the same outline.

### 6. Expected behaviour

Describe what the program is written to do. Say in the authoring record whether that result has been seen on hardware. Do not put repository status, migration notes, or “this has not been tested” into the learner’s steps. A learner-facing warning can still name a real limit, such as a supply that is too weak for a colour.

Do not describe a status the code cannot deliver. In particular, a browser that has lost the board cannot show a status that only arrives in the board’s HTTP response. Software checks and a compile are not a hardware test.

### 7. Troubleshooting

Include the failures this circuit and this program actually produce: missing serial port and USB-UART driver, wrong I2C address, failed Wi-Fi join, and a local network that isolates clients. Each entry names the symptom, the likely cause, the checks in order, and what the learner should see when the check passes. “Check the wiring” is not an entry. The last checklist is something a person can do one line at a time.

### 8. Visual quality

Covers follow `docs/PROJECT_THUMBNAILS.md`: 16:9 workbench photographs, with the finished build and space around it. A cover is not a wiring diagram or a schematic. If the photograph does not exist, register the image key in `PENDING_PROJECT_COVER_KEYS` and keep the placeholder. Do not reuse another project’s photograph.

The wiring diagram is a separate layout keyed by slug. Its legend must name this project’s voltages, not another board’s. A person still has to look at the rendered diagram. The structural check only proves the ports resolve.

Step visuals, when they exist, follow `docs/SOLDERI_VISUAL_SOURCE_OF_TRUTH.md`.

### 9. Compatibility

Requirements use the existing exact, direct, or conditional policies. An exact part has no approved substitute. A direct or conditional substitute needs a stored human review for that requirement. Absence of a review means the part is not a substitute. Do not invent pin-role rows or reviews to make a search look complete.

### 10. Publication readiness

Do not publish because the fields are filled, the structural check passed, or draft preview works. Publishing is a separate decision. Before that decision, the photographic cover exists, firmware compilation has been recorded, the specified hardware has been built, and the expected behaviour has been compared with the board. Until then the project stays unpublished.

## Walkthrough route

Project details **Start Building** opens `/project/build/[slug]`.

- If the project has steps, show those steps. Do not add a second Start Building confirmation.
- Keep Previous and Next in a footer under the step content, above the safe area. The Next button in that row must use flex grow. flex grow 0 with flex basis 0 collapses it to zero width. Do not disable Next because the step is long.
- Starting a build uses the project UUID already loaded on the detail screen. That includes an unpublished draft the signed-in user is allowed to read. A slug resolves only when it is in the published catalogue.
- If the project has no steps, stay on **Walkthrough coming soon**.
- A completed project opens the completion summary. Step review and code review stay behind that summary.

`resolveBuildDestination` and `resolveCatalogueProjectId` in `lib/project-navigation.ts` are the shared rules. Do not change them for one project’s copy.

## Database

Keep the local walkthrough, BOM, requirements, and firmware in agreement with Supabase. Update one slug in a new migration. The slug 23 quality migration was rendered from `constants/walkthroughs/esp32-wifi-weather-station.ts`; change that file and the migration together. Preserve `user_projects.current_step`, which stores a step index, by updating steps in place on `sort_order` and appending new steps. Do not change other projects, draft-preview access, or `is_published`.

## Before the project is called complete

Run `npx tsc --noEmit` and `npm run test:compatibility`. Fix structural errors. Read every step as a learner. Look at the wiring diagram in the app. Attempt the firmware compile. Write down what was not run on hardware and which assets are still missing. Leave the project unpublished.
