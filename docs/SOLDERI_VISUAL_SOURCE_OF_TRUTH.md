# Solderi Visual Source of Truth

This document is the global visual source of truth for Solderi's future step-by-step physical build visuals.

Visuals for different projects and different steps must feel like they belong to the same Solderi environment. They must also accurately represent the physical build state described by the project's actual BOM, wiring data, and walkthrough step.

This file defines global visual rules only. It does not define a generation system, and it does not contain project-specific builds.

## 1. Visual Identity

The overall style is photorealistic electronics photography.

- Show real physical components and materials.
- Include natural shadows, reflections, textures, and small imperfections.
- Electronics must look physically buildable.
- The image should feel like a photograph taken at a real electronics workbench.

Do not use an obvious AI-generated look, futuristic HUDs, neon effects, sci-fi interfaces, or decorative effects.

## 2. Workbench & Environment

The default environment is a medium-dark grey electronics workbench. It is clean but realistically used.

Keep the workbench geometry consistent across visuals. The surrounding environment is neutral and dark so colourful electronics stand out naturally.

Appropriate electronics tools may appear in the background. Background objects must not distract from the current build. Avoid unnecessary branding, labels, text, screens, or unrelated objects.

The workbench and environment stay visually consistent between steps.

## 3. Camera

The default camera is a 3/4 overhead workbench view.

- Keep camera height and approximate lens perspective consistent.
- Stay close enough that wiring and component placement are clearly visible.
- Make the current physical action the visual focus.
- Use a closer view only when a small connection cannot be understood from the normal view.
- Do not change camera perspective between consecutive steps without a reason.

## 4. Lighting

Use soft overhead and side lighting with a consistent lighting direction. Shadows and reflections should look natural. Illumination must be strong enough to see wires, pins, and components clearly.

Avoid dramatic coloured lighting, neon lighting, artificial glow, excessive contrast, and any lighting that hides wiring or component details.

## 5. Hardware Appearance

Recurring components must keep a consistent physical appearance. If an Arduino Uno appears in multiple visuals, it remains recognisably the same physical board.

- Use realistic physical geometry and appropriate real-world colours.
- Preserve recognizable component shapes.
- Do not invent components.
- Do not add components that are not part of the current build.
- Do not change a component's appearance between steps unless the build itself changes it.
- Component count must match the actual project state.

Where a catalogue component has a known physical form, show that form. Do not substitute a generic unrelated part.

## 6. Build Continuity

Every visual represents a specific point in the physical build. Step N is a continuation of Step N-1.

- Previously assembled components remain assembled.
- Previously connected wires remain connected unless the walkthrough explicitly removes or changes them.
- Components do not move or change orientation unless the walkthrough requires it.
- New components appear only when the relevant step introduces them.
- Removed or repositioned components change only when the walkthrough explicitly requires it.
- The physical state must match the walkthrough's current step.

The visual is the actual current build state. It is not an independent illustration of the concept.

## 7. Physical Accuracy

The visual must match the project's real physical requirements.

Before publishing a visual, check it against:

1. Project BOM
2. Current walkthrough step
3. Previous walkthrough steps
4. Wiring and connection data
5. Component quantities
6. Component identity
7. Physical orientation where it matters

The visual must accurately show component identity, component count, physical placement, physical connections, wire presence, wire routing where it is visually important, orientation, and the current assembly state.

Never prefer a visually attractive image over physical correctness. If an image looks realistic but shows an incorrect connection, component, or build state, reject it.

## 8. Composition

The current action should be visually obvious.

Show, in this order of importance:

1. The component or action being introduced
2. The existing physical build
3. Relevant wiring
4. Supporting components
5. The background environment

Do not show every component equally prominently. Avoid cluttered scenes.

A beginner should be able to look at the visual and answer: "What am I supposed to physically have in front of me at this point?"

## 9. Hands

Hands may appear when they help demonstrate a physical action. They are optional and are not decoration.

If hands are shown:

- They look realistic.
- They interact naturally with the hardware.
- They do not obscure important connections.
- They perform only the action described by the step.
- Their position stays consistent with that action.

## 10. Branding & Logos

Physical product markings may appear when they are part of a genuine component. Their purpose is identification of the actual hardware, not promotion of the manufacturer.

Do not turn component logos into Solderi branding. Do not add Solderi logos to hardware, add Solderi watermarks, or create imagery that implies a manufacturer endorses Solderi.

## 11. Continuity Across Projects

Solderi projects share the same overall visual world.

Across projects, keep these consistent:

- Workbench
- General environment
- Camera style
- Lighting style
- Realism level
- Component photography style

Different projects may contain different hardware. Project-specific parts should look like themselves. Do not force unrelated components to look identical.

## 12. Step Visual Principle

A step visual answers: **What should the physical build look like right now?**

It is different from the wiring diagram.

- Wiring diagram: where electrical connections go.
- Step visual: what the physical build should look like.

Do not replace the wiring diagram with the step visual. Both may appear in the same walkthrough step when that is useful.

## 13. Visual State Rules

Every step visual describes a physical state:

`previous_state + current_action = current_state`

Show the result of the current physical action. Do not show an unrelated idealized final build, and do not jump ahead to the completed project.

If a step says to connect an LED:

- The Arduino remains present.
- The breadboard remains present.
- Previously connected components remain present.
- The LED is now physically installed.
- The relevant wires are now present.
- Components that have not yet been introduced remain absent.

## 14. Accuracy Priority

When visual quality conflicts with physical accuracy, use this order:

1. Physical correctness
2. Build continuity
3. Component identity
4. Clear instructional composition
5. Environmental consistency
6. Photorealism
7. Aesthetic polish

A beautiful but physically incorrect visual is unacceptable.

## 15. Future Visual Generation Inputs

Future visual generation should be based on project data, not on an independently invented physical state.

Use:

- This global visual source of truth
- Project information
- Project BOM
- Current walkthrough stage
- Current walkthrough step
- Previous build state
- Current wiring and connection state
- Canonical component references
- Relevant project-specific reference images, when they exist

## 16. Validation Before Publishing

Check every step visual before it is used in the app. Confirm all of the following:

- Every visible required component exists in the BOM.
- Component quantities are correct.
- No required component is missing when it should be visible.
- No future-step components appear early.
- Connections match the walkthrough and wiring data.
- Physical assembly matches the current step.
- Previous build state is preserved.
- Component identity is correct.
- No unexplained hardware has appeared.
- The image is understandable enough for a beginner.

If the visual fails physical validation, regenerate or reject it.

## 17. Scope

This file defines global visual rules only.

Project-specific build instructions, component lists, wiring layouts, and individual image prompts belong in project and step data, and in future visual-generation infrastructure. Do not put them here.

This document does not implement image generation, model integrations, step-visual UI, database changes, or reference-image processing. Those are separate future phases.
