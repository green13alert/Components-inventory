# Solderi visual references

Canonical reference assets for Solderi step visuals.

These files are documentation and reference assets only. They are not wired into the app, the database, or any image-generation pipeline.

Global visual rules live in [`docs/SOLDERI_VISUAL_SOURCE_OF_TRUTH.md`](../../docs/SOLDERI_VISUAL_SOURCE_OF_TRUTH.md). That document is the authoritative specification. References here should follow it.

## Environment

`environment/` holds canonical references for the recurring Solderi visual environment.

Use these to keep step visuals in the same visual world:

- Workbench appearance
- Workbench geometry
- Lighting
- Camera perspective
- General background and environment

## Components

`components/` holds canonical references for recurring physical components.

A component reference should establish the expected:

- Physical shape
- Dimensions and proportions
- Colour
- Connectors and pins
- Recognisable markings
- Overall appearance

When the same component appears in more than one project, reuse its canonical reference. Do not add a second reference for the same component unless there is a specific reason.

Create a component folder only when a real reference asset exists for that part.

## Projects

`projects/` holds project-specific visual references.

Use it for:

- Project-specific assemblies
- Mechanical structures
- Brackets
- Unusual hardware
- Custom parts
- Project-specific physical arrangements

General reusable component references belong in `components/`, not here.

## Rules

1. These references are documentation and reference assets only.
2. Do not connect them to the React Native app yet.
3. Do not modify the database to use them.
4. Do not add image-generation code or an automated generation pipeline for them.
5. Do not build Step Visual UI from them.
6. Do not add placeholder images or invented component references.
7. Do not change existing project walkthroughs or wiring diagrams to point at this library.
8. Follow `docs/SOLDERI_VISUAL_SOURCE_OF_TRUTH.md` for visual decisions.
