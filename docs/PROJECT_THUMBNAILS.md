# Project thumbnails

Use this when creating or replacing a Solderi project cover. The cover is a photograph of the finished build. It is not a wiring diagram, a schematic, or a step illustration. Step visuals follow `docs/SOLDERI_VISUAL_SOURCE_OF_TRUTH.md`. Project authoring follows `docs/PROJECT_AUTHORING.md`.

## Visual identity

Consistency comes from the photograph, not from forcing every project into one layout. A breadboard circuit, a robot, and a lock plate can each fill the frame in the way that build actually sits.

Shared characteristics of the collection in `assets/images/projects/`:

- 1280×720 JPEG, 16:9.
- A dark, subtly scratched electronics workbench.
- A red component organiser cropped in the upper-left corner.
- A solder spool cropped along the right edge.
- A high three-quarter overhead camera angle.
- Soft, realistic overhead light and muted natural colour.
- The finished project as the subject, with bench visible around it.
- Real hardware, wires, and breadboards where the build uses them.
- No title, caption, arrow, logo overlay, decorative graphic, or artificial backdrop.

Primary references, inspected as photographs:

| File | What it shows |
| --- | --- |
| `assets/images/projects/project-door-lock.jpg` | RFID door lock on a plate: keypad, reader, and latch |
| `assets/images/projects/project-bluetooth-rc-car.jpg` | Robot car chassis with batteries, driver, and radio |
| `assets/images/projects/project-traffic-light.jpg` | Compact breadboard build on a base |
| `assets/images/projects/project-led-matrix.jpg` | Module and controller wired on a breadboard |
| `assets/images/projects/project-line-following-robot.jpg` | Robot on its track sheet, still on the same bench |

Pass those files, plus any closer match already in the folder, as image references when generating. Do not describe the style from memory alone.

A project with a different shape keeps that shape. The line-following robot includes its track sheet. The door lock sits on a mounting plate. The car is a chassis, not a bare breadboard. Add only the surface that project needs. Keep the bench, the organiser, and the spool.

## Hardware in the picture

Show the parts named in that project’s bill of materials. Use the wiring diagram to decide which connectors and wire colours are visible. Do not add an LED, resistor, display, or extra module that the BOM does not include.

Before generating, collect manufacturer photographs of the exact boards and cables. Prefer the maker’s product photos over a generic module drawing. Use those files as references for outline, connector, and the real sensor or module. Examples: Espressif’s ESP32-DevKitC V4 for a DevKitC, and Adafruit product 2652 for that BME280 breakout.

Keep proportions believable against a breadboard or a known part. A 25 mm sensor board stays small beside a full-size breadboard. A Micro-USB socket stays Micro-USB. A STEMMA QT socket stays a small JST-SH plug, not a large connector. Do not invent readable silkscreen or manufacturer marks. Blurred printing is enough.

The cover may show the finished arrangement. It does not have to trace every net. Exact connections stay in the project’s wiring diagram.

## Generation and rejection

Generate a photographic cover only. Do not substitute an SVG, a schematic, a Fritzing export, a stock photo of unrelated hardware, or another project’s file.

Reject a result that has any of these, then generate once more for that defect:

- The wrong board, sensor, or connector.
- An invented part.
- Wiring that cannot exist, such as a part plugged into the breadboard when the build says it stays beside it.
- A USB shape that does not match the board.
- Text or graphics drawn on the image.
- A style that leaves the workbench collection.

Do not keep regenerating for small cosmetic changes. If the tool still cannot reproduce the hardware, stop. Leave the cover pending, or composite the manufacturer photographs into the workbench scene. Say which details were not verified. An accepted generated image has not been built or photographed on a bench.

Review every new cover for:

1. The same bench, light, angle, organiser, and spool as the primary references.
2. The project’s own hardware, recognisable as those parts.
3. Plausible size next to the breadboard or chassis.
4. The correct connector where it is visible.
5. No extra components.
6. No obviously impossible wiring.
7. 1280×720 JPEG.
8. Registration under the project’s own image key.

## Registration

Save the file as `assets/images/projects/project-<kebab-name>.jpg`.

Add one entry to `PROJECT_IMAGES` in `constants/projects.ts`. The key is the camelCase `imageKey` already used by the project. `ProjectCover` loads that key. `getProjectImage` falls back to the blink LED photo for an unknown key, so the new key must be registered before the cover is shown.

```ts
esp32WifiWeather: require('../assets/images/projects/project-esp32-wifi-weather.jpg'),
```

Until the file exists, list the key in `PENDING_PROJECT_COVER_KEYS` in `lib/project-navigation.ts`. The app then shows the “Photo needed” placeholder instead of another project’s photograph. Remove the key from that list only after `PROJECT_IMAGES` points at the new file.

Do not change other projects’ image files. Leave a new project unpublished. Publishing is a separate review.
