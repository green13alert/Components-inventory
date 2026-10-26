/**
 * Write the v2 tutorial review files from a Supabase JSON read-back.
 * The step text is the database text. Local files are compared and mismatches are listed.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'docs', 'reviews', 'v2')

const FILES = {
  '8': 'motion-sensor-alarm-review.md',
  '18': 'servo-pan-tilt-camera-review.md',
  '23': 'esp32-wifi-weather-review.md',
  '24': 'esp32-ble-rgb-controller-review.md',
  '25': 'led-matrix-maze-review.md',
}

const LIMITATIONS = {
  '8': [
    'This export does not record a physical build. Compilation of the final sketch is separate from hardware testing.',
    'The catalogue buzzer is specified as a three-pin active module. It is not pinned to one manufacturer SKU.',
    'The sketch waits 30 seconds after power-up. Some PIR modules need longer before OUT is stable. That warm-up was not re-checked against a module datasheet in this pass.',
  ],
  '18': [
    'This export does not record a physical build. The screw-clamped jumper pins have not been tug-tested on a bench.',
    'Tower Pro’s SG90 sheet lists 4.8 V operation and does not publish stall current.',
    'Adafruit’s product page for 368 describes a preassembled 2.1 mm jack and screw terminals marked for a center-positive plug. That page does not publish a current rating. A 2019 Adafruit support reply gave a nominal 2 A. The GST18A05-P1J can supply 3 A, so the connector is the tighter published guidance.',
    'The GST18A05-P1J plug is 5.5×2.1 mm, center positive. Adafruit 368 is sold as the 2.1 mm jack for that plug. The product page does not print the outer diameter 5.5 mm.',
    'Servo motor current is kept off the breadboard because a solderless breadboard contact is not specified for this supply. BusBoard’s BB830 datasheet rates a board of that class at 36 V and 2 A, and BusBoard’s FAQ advises staying near 1 A. This project’s breadboard is a generic part.',
    'Mains connection is the supplied GST18A05-P1J and an IEC C13 lead. The tutorial does not describe opening the adapter or rewiring mains.',
  ],
  '23': [
    'This export does not record a physical build. Female-socket seating on the DevKitC V4 header has not been checked on a bench.',
    'A DevKit with female headers will not mate with the Adafruit 4397 female sockets.',
    'Adafruit 4397 colours used here are black GND, red VIN, blue SDA, and yellow SCL. Red goes to 3V3, blue to IO21, and yellow to IO22.',
  ],
  '24': [
    'This export does not record a physical build.',
    'The Kingbright common-anode lead order used by the layout was not re-read from the package drawing in this pass.',
    'Green and blue are expected to look dimmer than red on USB power. The circuit and firmware were not changed for this export.',
  ],
  '25': [
    'This export does not record a physical build. The FC-16 header order and the joystick silk order were taken from the MD_MAX72XX FC-16 note and the usual KY-023 silk, not from a module on the bench.',
    'USB current is argued from the MAX7219 datasheet segment current and a low display intensity. It was not measured.',
    'INVERT_Y starts true so a rising VRy reading moves toward row 0. That direction is a starting assumption.',
  ],
}

function localBundle() {
  const extracted = spawnSync(
    process.execPath,
    [
      '--experimental-strip-types',
      '--input-type=module',
      '--eval',
      `
import { MOTION_SENSOR_ALARM_STEPS, MOTION_SENSOR_ALARM_FIRMWARE } from './constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_STEPS, SERVO_PAN_TILT_CAMERA_FIRMWARE } from './constants/walkthroughs/servo-pan-tilt-camera.ts'
import { ESP32_WIFI_WEATHER_STEPS } from './constants/walkthroughs/esp32-wifi-weather-station.ts'
import { ESP32_WIFI_WEATHER_FIRMWARE } from './constants/firmware/esp32-wifi-weather-station.ts'
import { ESP32_BLE_RGB_STEPS } from './constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { ESP32_BLE_RGB_FIRMWARE } from './constants/firmware/esp32-ble-rgb-controller.ts'
import { SUPPORTING_NOTES } from './constants/walkthroughs/supporting-notes.ts'
import { MOTION_SENSOR_ALARM_LAYOUT } from './constants/wiring-diagrams/layouts/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_LAYOUT } from './constants/wiring-diagrams/layouts/servo-pan-tilt-camera.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from './constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import { ESP32_BLE_RGB_LAYOUT } from './constants/wiring-diagrams/layouts/esp32-ble-rgb-controller.ts'
import { LED_MATRIX_MAZE_STEPS } from './constants/walkthroughs/led-matrix-maze.ts'
import { LED_MATRIX_MAZE_FIRMWARE } from './constants/firmware/led-matrix-maze.ts'
import { LED_MATRIX_MAZE_LAYOUT } from './constants/wiring-diagrams/layouts/led-matrix-maze.ts'
import { FIRMWARE_COMPILE_RECORD } from './firmware/compile-record.ts'
const pack = (steps, firmware, layout) => ({
  steps: steps.map((step) => ({
    sortOrder: step.sortOrder,
    stageSortOrder: step.stageSortOrder,
    stageTitle: step.stageTitle,
    title: step.title,
    description: step.description,
    tip: step.tip,
    blocks: step.blocks,
  })),
  firmware,
  layout: {
    slug: layout.slug,
    elements: layout.elements.map((element) => ({
      id: element.id,
      kind: element.kind,
      label: element.label,
      catalogueId: element.identity?.catalogueId ?? null,
      role: element.identity?.role ?? null,
      accessory: element.accessory?.catalogueId ?? null,
      ports: element.ports.map((port) => port.label),
    })),
    jumpers: (layout.physical?.jumpers ?? []).map((jumper) => ({ id: jumper.id, gender: jumper.gender })),
    rows: layout.physical?.rows ?? null,
  },
})
process.stdout.write(JSON.stringify({
  notes: SUPPORTING_NOTES,
  compile: FIRMWARE_COMPILE_RECORD,
  projects: {
    '8': pack(MOTION_SENSOR_ALARM_STEPS, MOTION_SENSOR_ALARM_FIRMWARE, MOTION_SENSOR_ALARM_LAYOUT),
    '18': pack(SERVO_PAN_TILT_CAMERA_STEPS, SERVO_PAN_TILT_CAMERA_FIRMWARE, SERVO_PAN_TILT_CAMERA_LAYOUT),
    '23': pack(ESP32_WIFI_WEATHER_STEPS, ESP32_WIFI_WEATHER_FIRMWARE, ESP32_WIFI_WEATHER_LAYOUT),
    '24': pack(ESP32_BLE_RGB_STEPS, ESP32_BLE_RGB_FIRMWARE, ESP32_BLE_RGB_LAYOUT),
    '25': pack(LED_MATRIX_MAZE_STEPS, LED_MATRIX_MAZE_FIRMWARE, LED_MATRIX_MAZE_LAYOUT),
  },
}))
`,
    ],
    { cwd: root, encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 },
  )
  if (extracted.status !== 0) {
    process.stderr.write(extracted.stderr ?? '')
    process.exit(extracted.status ?? 1)
  }
  return JSON.parse(extracted.stdout)
}

function stable(value) {
  if (Array.isArray(value)) {
    return value.map(stable)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]))
  }
  return value
}

function canon(step) {
  return JSON.stringify(stable({
    sortOrder: step.sortOrder ?? step.sort_order,
    stageSortOrder: step.stageSortOrder ?? step.stage_sort_order,
    stageTitle: step.stageTitle ?? step.stage_title,
    title: step.title,
    description: step.description,
    tip: step.tip ?? null,
    blocks: step.blocks,
  }))
}

function renderValue(value) {
  if (value == null) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  return JSON.stringify(value, null, 2)
}

function renderBlock(block, index) {
  const lines = [`#### Block ${index + 1}: ${block.type}`, '']
  const consumed = new Set(['type'])
  const add = (label, key) => {
    if (!(key in block) || block[key] == null || block[key] === '') {
      return
    }
    consumed.add(key)
    lines.push(`**${label}**`, '', renderValue(block[key]), '')
  }
  if (block.type === 'code') {
    add('Language', 'language')
    add('Filename', 'filename')
    add('Libraries', 'libraries')
    consumed.add('code')
    const code = String(block.code ?? '')
    lines.push('**Code**', '', '```cpp', code.endsWith('\n') ? code.slice(0, -1) : code, '```', '')
  } else if (block.type === 'troubleshooting') {
    add('Heading', 'heading')
    consumed.add('items')
    for (const [itemIndex, item] of (block.items ?? []).entries()) {
      lines.push(`**Item ${itemIndex + 1}**`, '', `Problem: ${item.problem}`, '', `Solution: ${item.solution}`, '')
    }
  } else if (block.type === 'components') {
    add('Heading', 'heading')
    consumed.add('items')
    for (const item of block.items ?? []) {
      lines.push(`- ${item.name} ×${item.quantity} — catalogue id \`${item.id}\`, illustration \`${item.illustrationId}\`, owned ${item.owned}`)
    }
    lines.push('')
  } else if (block.type === 'wiring' || block.type === 'connections') {
    add('Heading', 'heading')
    add('Summary', 'summary')
    if (block.nodes) {
      consumed.add('nodes')
      lines.push('**Nodes**', '', '```json', JSON.stringify(block.nodes, null, 2), '```', '')
    }
    if (block.pair) {
      consumed.add('pair')
      lines.push('**Pair**', '', '```json', JSON.stringify(block.pair, null, 2), '```', '')
    }
    if (block.connections || block.rows) {
      const rows = block.connections ?? block.rows
      consumed.add('connections')
      consumed.add('rows')
      lines.push('**Connections**', '')
      for (const row of rows) {
        lines.push(`- ${row.fromComponent} ${row.fromPin} → ${row.toComponent} ${row.toPin}${row.signal ? ` (${row.signal})` : ''}`)
      }
      lines.push('')
    }
    if (block.assembly) {
      consumed.add('assembly')
      lines.push('**Progressive assembly**', '', `Parts: ${block.assembly.parts.join(', ') || '(none)'}`, '', `Jumpers: ${block.assembly.jumpers.join(', ') || '(none)'}`, '')
    }
  } else {
    add('Heading', 'heading')
    add('Body', 'body')
    add('Image key', 'imageKey')
    add('Caption', 'caption')
  }
  const extra = Object.keys(block).filter((key) => !consumed.has(key))
  if (extra.length > 0) {
    const rest = {}
    for (const key of extra) {
      rest[key] = block[key]
    }
    lines.push('**Remaining fields**', '', '```json', JSON.stringify(rest, null, 2), '```', '')
  }
  return lines.join('\n')
}

function renderStep(step, number) {
  const lines = [
    `## Step ${number}`,
    '',
    `- Stage order: ${step.stage_sort_order}`,
    `- Stage: ${step.stage_title}`,
    `- Title: ${step.title}`,
    '',
    '**Description**',
    '',
    step.description,
    '',
    '**Tip**',
    '',
    step.tip ?? '(none)',
    '',
  ]
  step.blocks.forEach((block, index) => {
    lines.push(renderBlock(block, index))
  })
  return lines.join('\n')
}

function mismatches(localSteps, dbSteps) {
  const found = []
  const count = Math.max(localSteps.length, dbSteps.length)
  for (let index = 0; index < count; index += 1) {
    const local = localSteps[index]
    const remote = dbSteps[index]
    if (!local || !remote) {
      found.push(`Step ${index + 1} exists on only one side.`)
      continue
    }
    if (canon(local) !== canon(remote)) {
      found.push(`Step ${index + 1} “${remote.title}” differs between the local walkthrough and Supabase.`)
    }
  }
  return found
}

const database = JSON.parse(readFileSync(join(root, 'scripts', 'review-read.json'), 'utf8'))
const projects = database[0].review.projects
const local = localBundle()
mkdirSync(outDir, { recursive: true })

for (const project of projects) {
  const source = local.projects[project.slug]
  const compile = local.compile.sketches[project.slug]
  const diffs = mismatches(source.steps, project.steps)
  const codeBlocks = project.steps.flatMap((step) => step.blocks.filter((block) => block.type === 'code'))
  const firmwareMatches = codeBlocks.filter((block) => block.code === source.firmware).length
  const lines = [
    `# ${project.title}`,
    '',
    'Review export generated from the current Supabase project record. This file is not a grade and it does not rewrite the tutorial.',
    '',
    '## How to read the claims',
    '',
    '- Tutorial sentences below are the Supabase text.',
    '- Manufacturer-stated facts are only the sentences that name a datasheet, product page, or support reply.',
    `- Firmware compilation is recorded separately. Project ${project.slug} compiled as ${compile.result} for \`${compile.fqbn}\` (${compile.board}). Checksum \`${compile.checksum}\`.`,
    '- No project in this export was run on the specified hardware. Expected behaviour is not tested behaviour.',
    '',
    '## Project record',
    '',
    `- Slug: ${project.slug}`,
    `- Title: ${project.title}`,
    `- Difficulty: ${project.difficulty}`,
    `- Published: ${project.is_published}`,
    `- Description: ${project.description}`,
    `- Steps: ${project.steps.length}`,
    '',
    '## Local and database comparison',
    '',
    diffs.length === 0
      ? 'Titles, descriptions, tips, stage names, and content blocks match the local walkthrough for every step.'
      : diffs.map((line) => `- ${line}`).join('\n'),
    '',
    firmwareMatches === 1
      ? 'The local authoritative firmware appears once, unchanged, in the Supabase code blocks.'
      : `The local authoritative firmware appears ${firmwareMatches} times in the Supabase code blocks.`,
    '',
    '## Bill of materials',
    '',
    ...project.bom.flatMap((item) => [
      `### ${item.name}`,
      '',
      `- Catalogue id: \`${item.slug}\``,
      `- Catalogue description: ${item.description}`,
      `- Category: ${item.category}`,
      `- Quantity: ${item.quantity}`,
      `- Sort order: ${item.sort_order}`,
      `- Requirement role: ${item.role}`,
      `- Substitution policy: ${item.policy}`,
      `- Constraints: ${item.constraints.length === 0 ? '(none stored)' : item.constraints.map((rule) => `${rule.capability}=${rule.value}`).join('; ')}`,
      '',
    ]),
    '## Compilation',
    '',
    `- Tool: ${local.compile.arduinoCli}`,
    ...Object.entries(local.compile.cores).map(([id, version]) => `- Core ${id}: ${version}`),
    ...Object.entries(local.compile.libraries).map(([name, version]) => `- Library ${name}: ${version}`),
    `- Result: ${compile.result}`,
    `- Board: ${compile.board}`,
    `- FQBN: \`${compile.fqbn}\``,
    `- Sketch checksum: \`${compile.checksum}\``,
    '- Hardware testing: not run. Do not treat this compile as a working build.',
    '',
    '## Authoritative firmware',
    '',
    'This is the local final sketch. The comparison above says whether the Supabase upload block is the same text.',
    '',
    '```cpp',
    source.firmware.endsWith('\n') ? source.firmware.slice(0, -1) : source.firmware,
    '```',
    '',
    '## Wiring and physical layout',
    '',
    'Diagram geometry is local source. It is not a Supabase column. These are the current layout identities.',
    '',
    `- Layout slug: ${source.layout.slug}`,
    `- Breadboard rows: ${source.layout.rows}`,
    ...source.layout.elements.map(
      (element) =>
        `- ${element.label} (\`${element.id}\`, ${element.kind}) catalogue \`${element.catalogueId ?? 'none'}\`${element.accessory ? `, accessory \`${element.accessory}\`` : ''}. Role: ${element.role ?? '(none)'} Ports: ${element.ports.join(', ')}.`,
    ),
    ...source.layout.jumpers.map((jumper) => `- Jumper \`${jumper.id}\` (${jumper.gender})`),
    '',
    '## Known technical limitations',
    '',
    'These notes are for the reviewer. They are not extra tutorial steps.',
    '',
    ...LIMITATIONS[project.slug].map((line) => `- ${line}`),
    '',
    '## Tutorial',
    '',
    ...project.steps.map((step, index) => renderStep(step, index + 1)),
    '## Supporting notes',
    '',
    'NOT CURRENTLY SHOWN TO USERS',
    '',
    'The app does not render `constants/walkthroughs/supporting-notes.ts`. The text below is that hidden source.',
    '',
    ...local.notes[project.slug].flatMap((note) => [`### ${note.sourceTitle}`, '', note.body, '']),
    '',
  ]
  writeFileSync(join(outDir, FILES[project.slug]), lines.join('\n'), 'utf8')
  console.log(`${FILES[project.slug]} steps=${project.steps.length} mismatches=${diffs.length} firmwareMatches=${firmwareMatches}`)
}
