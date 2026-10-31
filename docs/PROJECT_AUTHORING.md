# Project authoring

Use this when adding or revising a catalogue project. It is the checklist for ESP32, Arduino, and Raspberry Pi builds. A filled database row is not a finished project, and this document does not publish anything.

Author the project in local TypeScript first. Sync that same content into Supabase with a migration for that slug only. Leave `is_published` false until a separate publishing review.

## Research before a new project

Every new catalogue project starts here. The quality gates below still decide whether the tutorial, diagram, and firmware are complete. This section decides whether the circuit that enters those gates is documented. Revising an existing project uses the quality gates. Repeat this research only when that revision changes the parts or the circuit.

### Sources

Look these up, in this order, and open the pages:

1. Manufacturer datasheets and module documentation.
2. The microcontroller board’s own pinout and electrical limits.
3. The library documentation for the hardware configuration the sketch will use.
4. Arduino Project Hub and other documented builds of the same arrangement.
5. Other credible electronics references when the sources above do not cover a pin or a connector.

Aim for two independent implementations of the same, or substantially the same, hardware. Two sites repeating one original project count once. If a second independent build cannot be found, write that down. Do not invent a URL, an author, or a test to fill the count. A published tutorial is not evidence that anyone built it. A module that looks similar is not the same pinout. When a manufacturer page covers an electrical fact, a community tutorial does not override it.

### Evidence

- Separate a documented fact from an assumption. Name the page for the fact.
- Manufacturer documentation leads for voltage, current, logic level, pin function, and connector.
- A community tutorial can support a choice. It is not the authority when a datasheet exists.
- A different board revision or module variant is not interchangeable until its own documentation says so.
- A successful compile does not show that the circuit works.
- `npm run test:compatibility` does not replace a build on the specified hardware.
- Unknown connector gender, pitch, or mating hardware is a flagged gap, not a guess.
- An unverified supply, polarity, or current path is not described as safe.
- When sources disagree, record both and leave the conflict open until it is resolved.
- Do not fabricate a measurement, a pin name, a licence, or a physical test.

A project with an open conflict can stay in development. Do not set `hardwareTested`, and do not describe it as publication-ready, while that conflict or an untested build remains.

### Other people's work

Project Hub and other public tutorials are for understanding the circuit. Do not copy their prose, drawings, photographs, or code. Read the licence before reusing anything. Solderi’s steps, diagrams, and explanations stay original. Do not integrate circuito.io, scrape it, or add a dependency on it. A generic part in another tool is not this project’s module.

The research record stores titles, URLs, and short factual notes. It does not store copied tutorial text or diagrams.

### Sequence

1. **Research.** Investigate existing builds, official documentation, and the component specifications. Write the research record.
2. **Hardware design.** Choose the simplest practical, reliable arrangement. Prefer a part already in the catalogue when it is electrically appropriate. Do not add a breadboard, adapter, or extra wire that the circuit does not need.
3. **Circuit verification.** Write the exact connections. Check pins, supply, connector gender, and the physical module variant against the sources. An unresolved conflict stays in the research record.
4. **Firmware.** One canonical sketch. Compile it for the board and library versions the tutorial names. Excerpts stay slices of that sketch. This is the existing code and firmware gates.
5. **Tutorial authoring.** Original steps a beginner can follow. Each step is one milestone and is physically possible. Do not repeat the parts list, and do not add a lesson the build does not need.
6. **Diagram generation.** Use the existing layout and physical-scene path. The schematic and the physical view show the verified connections. Do not move a wire or a pin to improve the picture if that drawing would then be electrically wrong.
7. **Automated validation.** Run `npx tsc --noEmit`, `npm run test:compatibility`, and, when the toolchain is present, `npm run firmware:compile`. Fix a confirmed defect before continuing.
8. **Physical testing.** Build the specified parts. `hardwareTested` stays false until that build is recorded. A compile record is not that record.
9. **Publication review.** Use the publication gate below. A missing cover, a missing compile, an open electrical conflict, or an untested build keeps the project unpublished.

After stage 3, present the proposed parts, connections, conflicts, and unverified assumptions. Wait for approval before stages 4–7, unless the request already says to implement the project.

### Research record

Copy `docs/templates/project-research-record.md` to `docs/research/<slug>.md` and fill it from pages that were opened. This file is the authoring record the quality gates refer to. It is Markdown in the repository, not a database table, a migration, or a screen in the app. Do not start a second review document for the same project. Naming a part that must not be substituted does not approve a catalogue substitute. Keep the file short enough to review with the hardware proposal.

## What to produce

- For a new project, `docs/research/<slug>.md` filled in from the template before the tutorial.
- Project title, description, difficulty, duration, and learning objectives.
- A bill of materials whose every part exists in the component catalogue, including cables, headers, and power.
- Compatibility requirements. Substitutions stay on the existing per-project review system. Do not approve a part because its general specs look similar.
- Walkthrough steps in order, with stages.
- Wiring connections and a layout under `constants/wiring-diagrams/layouts/`, when the project is wired.
- The complete program the learner uploads, plus any excerpts taken from that same program.
- A cover key. Use a 16:9 workbench photograph, or register a pending key. Do not draw a stand-in.

`lib/project-authoring.ts` checks structure and cross-references. `localAuthoredProjects` in `lib/authored-projects.ts` runs that check on every project under `constants/walkthroughs/`. A project with one firmware file must paste that file. A growing-sketch project names one authoritative final sketch. That sketch appears once, unchanged. Earlier sketches may be shorter, and any later excerpt must be taken from the final sketch. Pin constants that both sketches declare must match. `npm run test:compatibility` runs these checks. They do not prove that the hardware works, that the instructions are clear, or that the diagram looks right.

## Quality gates

### 1. Hardware completeness

The BOM must be enough to build the project: board, sensor or actuator, connectors, headers, cable, and power. Name the physical configuration when a catalogue row is generic. If a part is sold with loose headers, say whether this project solders them or uses a socket and cable. Do not add soldering as a surprise step. If a dimension or connector cannot be verified, say so and pick a configuration that does not depend on the unknown measurement.

### 2. Electrical consistency

Power voltage, GPIO numbers, interface, and signal levels must match across the BOM, the steps, the wiring list, the diagram layout, and the program. `reviewAuthoredProject` checks that every connection resolves to a diagram port and that step wiring uses the project connection list.

A breadboard project needs a `physical` layout as well as the schematic symbols. The physical layout names holes. `validatePhysicalLayout` checks that those holes exist, that one hole does not hold two leads, that a split rail does not silently join, and that the holes reproduce the connection list. A coloured line in the schematic does not prove a hole is shared. The parts list counts individual male-to-male and male-to-female wires. A direct pin-to-connector wire is drawn; it is not omitted because neither end is a breadboard hole. A project that does not use a breadboard does not get an invented one.

Keep the schematic available for the circuit, and use the physical view for placement. A project without a breadboard can place connectors and cable ends instead of pretending the parts sit in holes. Do not use the same placement drawing for every project.

### 3. Code completeness

A new single-program project needs one complete program. Excerpts must be slices of that program and must be labelled as excerpts. The upload step is the only place that pastes the whole file. An existing project that already shows a new complete sketch at each code step keeps that format. The last complete sketch is the one the upload step tells the learner to paste. Do not treat the longest code block as the firmware.

### 4. Firmware verification

When a toolchain can run here, compile the sketch with the board package and libraries the tutorial names. Record the toolchain and library versions. If it cannot be installed or invoked, say that compilation is unverified. A TypeScript check is not an Arduino compile. A failed compile is a defect. A compile does not mean the board was run.

### 5. Instruction completeness

Write for the project’s difficulty. The main path is the build: what to place, what to connect, what to upload, and what to check. Define GPIO, I2C, SSID, IP address, JSON, and any other term at the first step that needs it. Each step should say what to do next. Partial code must not look like a sketch to upload.

Do not add a standalone lesson on an elementary idea, such as how a breadboard row works, unless the build cannot continue without it. Put a short practical warning on the step that needs it. Do not repeat a parts list, a pin map, or a protocol explanation that a later step already uses. Keep essential wiring, power limits, setup, troubleshooting, and checkpoints in the step itself.

The opening should say what the person is building and what the finished project does, without repeating that same overview on later steps. A future Learn section may hold longer electronics background. Do not build that section here. There is still no expandable control in the walkthrough. When a useful explanation is not required to finish the build, keep it in `constants/walkthroughs/supporting-notes.ts` for that later system. Do not invent a one-off disclosure control for one project.

A breadboard project shows a layout a person can copy: which leads share a row, which rows stay separate, and where the supply rails are. Count every jumper the layout actually uses, including male-to-male links from a terminal strip to a rail. Wire in stages, with a checkpoint after each stage, and keep one complete connection list. Do not paste that full list on every wiring step.

Keep voltage, current, and protocol detail only where the person needs it to wire, power, or check the build. Longer background belongs in the supporting notes, not in an extra step.

One tutorial step is one meaningful milestone, not one tiny action or one isolated code excerpt. Positioning a board does not normally need its own step apart from connecting that board’s power. Connecting a five-pin module is usually one step, including its power and signal wires. A circuit check after the wiring is a real milestone. Installing the programming environment can be its own step. A code excerpt that cannot compile and upload on its own belongs inside a concept step, and that step says it is an excerpt of the finished program. A concept such as movement, collision, or level timing can be its own step when the learner needs it before the upload. A complex build, such as a robotic arm, can have many more steps than a small game. Do not force every project to the same count.

A code excerpt is a slice of the uploadable program, and the step says so. The complete program stays in one copyable step. Phone or app steps name the taps, the write format, and what should change. Buttons and dialogs in the walkthrough do something useful. Do not leave a control that only announces unfinished work.

These are the bar for a new tutorial’s steps. They are not a fixed outline of walkthrough stages. A sensor project and a radio project will not share the same outline. The research-to-publication sequence above is fixed. The steps inside the tutorial are not.

### 6. Expected behaviour

Describe what the program is written to do. Say in the authoring record whether that result has been seen on hardware. Do not put repository status, migration notes, or “this has not been tested” into the learner’s steps. A learner-facing warning can still name a real limit, such as a supply that is too weak for a colour.

Do not describe a status the code cannot deliver. In particular, a browser that has lost the board cannot show a status that only arrives in the board’s HTTP response. Software checks and a compile are not a hardware test.

### 7. Troubleshooting

Include the failures this circuit and this program actually produce: missing serial port and USB-UART driver, wrong I2C address, failed Wi-Fi join, and a local network that isolates clients. Each entry names the symptom, the likely cause, the checks in order, and what the learner should see when the check passes. “Check the wiring” is not an entry. The last checklist is something a person can do one line at a time.

### 8. Visual quality

Covers follow `docs/PROJECT_THUMBNAILS.md`: 16:9 workbench photographs, with the finished build and space around it. A cover is not a wiring diagram or a schematic. If the photograph does not exist, register the image key in `PENDING_PROJECT_COVER_KEYS` and keep the placeholder. Do not reuse another project’s photograph.

The wiring diagram is a separate layout keyed by slug. Its legend must name this project’s voltages, not another board’s. The physical view is the placement guide. Parts should be recognisable: a body, leads in the holes the layout names, and off-board boards or cables with the documented pin order. Jumper colours separate power, ground, and signals, and a crossing is not a junction.

A multi-step breadboard build declares an assembly sequence on its wiring blocks. Each `assembly` object names the part ids and jumper ids introduced on that step. Progressive assembly is automatic: parts already installed stay visible, the new parts and wires are highlighted, and later parts stay hidden. There is no Current step or Complete build switch. A step after the last assembly introduction, such as a power-on check, shows the finished assembly. Introduce a part on the step where the learner needs it, in an order that is physically practical and leaves the circuit unpowered until the safety check. A tutorial that is not a multi-step hardware build does not need this sequence. Look at the inline preview and the enlarged viewer at a phone width, including a partial step and the finished build. A passing layout test is not electrical proof, and neither is a visual check a hardware test.

Each physical part has a stable element id and an `identity` that points at a catalogue row, with a role in this build and any placement the catalogue does not already state. The component list uses that identity and the shared component illustration, not a generic rectangle. Repeated copies of the same catalogue row are one parent row, with the quantity and one illustration. Opening that row lists each instance by its label and role. A single part has no dropdown. Set `identity.keyLabel` when the list name should differ from the netlist label. Do not group different values, such as 220 Ω and 1 kΩ, just because both are resistors. The list can name a part before its step, and selecting an uninstalled instance does not draw it. Tapping a child, or the part on the board, shows that part's name, role, and orientation inside the diagram card, under the drawing. Opening a repeated group can highlight the copies that are already installed. Components and Connections stay collapsed until the learner opens them. Do not add another permanent diagram button. Connections are separate rows from the step netlist, limited to wires already introduced, and opening them does not reset zoom or the walkthrough step.

The enlarged diagram is a fixed viewport, not a page that grows. Opening it fits the whole diagram. Closing and opening it again does the same. Pinch follows the fingers, including pinching back out, and one-finger drag pans only while zoomed. The minimum zoom fits the whole diagram, and the drawing cannot be panned completely off screen. Close stays inside the safe area, including a notch or Dynamic Island. There is no Reset button. Switching Physical and Schematic still fits the drawing for that view, and closing returns to the same walkthrough step. A project with only one drawing does not show a broken Physical/Schematic switch. Treat the viewer as unfinished until those gestures and the return path have been tried on a phone.

If a walkthrough step is removed or merged, keep the remaining steps numbered from 0 with no gaps, and keep each assembly introduction on the step that still tells the learner to place those parts. A new migration updates that slug only. Do not edit an applied migration.

A published project must appear in the Projects list for a signed-in user when the view and difficulty filters allow it. Development drafts stay in their own section and do not hide the published list. Confirm `is_published`, the category, the difficulty, and that the project can be opened. Do not publish a draft to make it easier to find.

Step visuals, when they exist, follow `docs/SOLDERI_VISUAL_SOURCE_OF_TRUTH.md`.

### 9. Compatibility

Requirements use the existing exact, direct, or conditional policies. An exact part has no approved substitute. A direct or conditional substitute needs a stored human review for that requirement. Absence of a review means the part is not a substitute. Do not invent pin-role rows or reviews to make a search look complete.

### 10. Publication readiness

Do not publish because the fields are filled, the structural check passed, or draft preview works. Publishing is a separate decision. Before that decision, the photographic cover exists, firmware compilation has been recorded, the specified hardware has been built, and the expected behaviour has been compared with the board. The research record, when this project has one, agrees: no open electrical conflict, and the hardware-test line is not “not done”. Until then the project stays unpublished.

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

## Hardware review that stays manual

These are not wording checks. Record the source when a claim depends on a datasheet.

- The external supply, its connector, polarity, and any mains lead are named parts, not a tip. The structural check rejects an external servo supply whose positive path uses a breadboard rail, or whose jack is missing from the BOM. A Dupont pin clamped under a screw is a review finding, not a signed-off connection. Current ratings, stall current, and a replacement connector stay manual until a manufacturer page states the rating and the mating parts.
- Joystick aiming is either relative (deflection sets speed and a centred stick holds) or absolute (the stick sets the angle, with no deadzone that skips the update). The upload sketch and the tutorial must describe the same one. A deadzone wrapped around `map()` is an authoring error.
- Jumper quantities come from the drawn physical jumpers. `jumper-wires` counts male-to-male wires. `jumper-male-female` counts male-to-female wires.
- Every required part is a catalogue slug. Capability rows and project requirement constraints use those slugs. A migration that joins a missing slug inserts nothing; read the rows back. Do not treat a matching BOM count as proof that constraints exist.
- `firmware/compile-record.ts` stores the toolchain versions and a checksum of each compiled sketch. A mismatch means that sketch changed after the last compile. The record is not a hardware test. `hardwareTested` stays false until a physical build is recorded.
- Connector genders mate: female sockets on male headers, and the plug size matches the jack.
- A generic catalogue row is not used when the build needs one board outline, header gender, or USB socket.
- The upload sketch, the diagram pins, and the netlist name the same GPIO.
- Progressive assembly introduces each physical part and jumper once, on the step that asks for it.
- Publication still requires a recorded compile and a recorded build on the specified hardware. Do not mark either as done from a structural test.

## Before the project is called complete

Run `npx tsc --noEmit` and `npm run test:compatibility`. Fix structural errors. Read every step as a learner. Look at the wiring diagram in the app. Attempt the firmware compile. Write down what was not run on hardware and which assets are still missing. For a new project, keep `docs/research/<slug>.md` in agreement with those limits. Leave the project unpublished.
