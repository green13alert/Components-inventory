import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESP32_BLE_RGB_STEPS } from '../constants/walkthroughs/esp32-ble-rgb-controller.ts'
import { ESP32_WIFI_WEATHER_STEPS } from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { LED_MATRIX_MAZE_STEPS } from '../constants/walkthroughs/led-matrix-maze.ts'
import { MOTION_SENSOR_ALARM_STEPS } from '../constants/walkthroughs/motion-sensor-alarm.ts'
import { SERVO_PAN_TILT_CAMERA_STEPS } from '../constants/walkthroughs/servo-pan-tilt-camera.ts'
import { SUPPORTING_NOTES } from '../constants/walkthroughs/supporting-notes.ts'
import type { AuthoredWalkthroughStep } from '../constants/walkthrough-content.ts'

const removed = [
  'How the Motion Sensor Works',
  'How Pan-Tilt Works',
  'Understand the Components',
  'What you will learn',
  'How the hardware and software work together',
  'What a successful build should do',
  'Understand each measurement',
  'How this I2C link works',
  'How the ESP32 hosts the page',
  'Ideas that are not part of this build',
  'Learn the breadboard before you insert a part',
  'Understand the breadboard before you place a part',
]

const walks: AuthoredWalkthroughStep[][] = [
  MOTION_SENSOR_ALARM_STEPS,
  SERVO_PAN_TILT_CAMERA_STEPS,
  ESP32_WIFI_WEATHER_STEPS,
  ESP32_BLE_RGB_STEPS,
  LED_MATRIX_MAZE_STEPS,
]

test('the four walkthroughs stay contiguous and drop the standalone lessons', () => {
  for (const steps of walks) {
    steps.forEach((step, index) => {
      assert.equal(step.sortOrder, index)
      assert.equal(step.blocks.length > 0, true)
    })
    for (let index = 1; index < steps.length; index += 1) {
      assert.equal(steps[index].stageSortOrder >= steps[index - 1].stageSortOrder, true)
    }
    const titles = steps.map((step) => step.title)
    for (const title of removed) {
      assert.equal(titles.includes(title), false)
    }
  }
  assert.equal(MOTION_SENSOR_ALARM_STEPS.length, 17)
  assert.equal(SERVO_PAN_TILT_CAMERA_STEPS.length, 22)
  assert.equal(ESP32_WIFI_WEATHER_STEPS.length, 25)
  assert.equal(ESP32_BLE_RGB_STEPS.length, 22)
  assert.equal(LED_MATRIX_MAZE_STEPS.length, 13)
  assert.deepEqual(
    [...new Set(LED_MATRIX_MAZE_STEPS.map((step) => step.stageTitle))],
    ['Understand the project', 'Build the circuit', 'Prepare the software', 'Build the game', 'Test and troubleshoot'],
  )
  const mazeAssembly = LED_MATRIX_MAZE_STEPS.map((item) => {
    const block = item.blocks.find((candidate) => candidate.type === 'wiring' && candidate.assembly)
    return block?.type === 'wiring' ? block.assembly ?? null : null
  })
  assert.deepEqual(mazeAssembly[2], { parts: [], jumpers: ['uno-5v', 'uno-gnd'] })
  assert.deepEqual(mazeAssembly[3], { parts: ['matrix'], jumpers: ['matrix-gnd', 'matrix-vcc', 'matrix-clk', 'matrix-cs', 'matrix-din'] })
  assert.deepEqual(mazeAssembly[4], { parts: ['joystick'], jumpers: ['joy-gnd', 'joy-5v', 'joy-x', 'joy-y', 'joy-sw'] })
  assert.equal(mazeAssembly[5], null)
  assert.equal(LED_MATRIX_MAZE_STEPS.some((item) => item.title === 'Turn on one LED'), false)
  const mazeCode = LED_MATRIX_MAZE_STEPS.flatMap((item) => item.blocks).filter((block) => block.type === 'code')
  assert.equal(mazeCode.filter((block) => block.type === 'code' && block.code.includes('void loop()')).length, 1)
  assert.equal(mazeCode.filter((block) => block.type === 'code' && block.filename === 'Excerpt from led_matrix_maze.ino').length, 6)
  assert.equal(SERVO_PAN_TILT_CAMERA_STEPS.some((step) => step.title === 'Understand Power and Pin Architecture'), true)
  assert.equal(ESP32_BLE_RGB_STEPS.some((step) => step.title.startsWith('Seat every part')), true)
  assert.equal(ESP32_BLE_RGB_STEPS.some((step) => step.title.startsWith('Follow one colour')), true)
})

test('removed lessons stay available as supporting notes, not as walkthrough steps', () => {
  assert.equal(SUPPORTING_NOTES['8'].some((note) => note.sourceTitle === 'How the Motion Sensor Works'), true)
  assert.equal(SUPPORTING_NOTES['18'].some((note) => note.sourceTitle === 'How Pan-Tilt Works'), true)
  assert.equal(SUPPORTING_NOTES['23'].some((note) => note.sourceTitle === 'How this I2C link works'), true)
  assert.equal(SUPPORTING_NOTES['24'].some((note) => note.sourceTitle === 'Learn the breadboard before you insert a part'), true)
  assert.equal(SUPPORTING_NOTES['24'].some((note) => /10\.5 mA/.test(note.body)), true)
  assert.equal(SUPPORTING_NOTES['25'].some((note) => note.sourceTitle === 'FC-16 current and orientation' && /multiplexes/.test(note.body)), true)
  assert.equal(SUPPORTING_NOTES['25'].some((note) => note.sourceTitle === 'Button debounce and millis() rollover'), true)
  for (const notes of Object.values(SUPPORTING_NOTES)) {
    assert.equal(notes.every((note) => note.body.trim().length > 40), true)
  }
})

test('optional explanations sit on the steps they explain and stay short', () => {
  const expected: Record<string, string[]> = {
    'Connect the PIR Motion Sensor': ['How does a PIR sensor work?'],
    'Connect the LED': ['Why does the LED need a resistor?'],
    'Connect the Buzzer': ['How does an active buzzer work?'],
    'Control the Pan Servo': ['How does servo control work?'],
    'Confirm the BME280 pin labels': ['How does I²C communication work?'],
    'Serve the page and the JSON endpoint': ['How does the page get new readings?'],
    'Confirm the LED is common anode': ['Why can the colours look different?'],
    'Know the transistors and the resistors': ['Why a transistor and two resistors?'],
    'Identify the LED Matrix and Joystick': ['How does the MAX7219 light the grid?'],
    'Read Joystick Movement': ['Why does the joystick need a deadzone?'],
    'Move and Draw the Player': ['Why does the game use millis()?'],
    'Add Level Completion and Timing': ['Why is the button debounced?'],
  }
  const steps = walks.flat()
  for (const [title, explanations] of Object.entries(expected)) {
    const step = steps.find((item) => item.title === title)
    assert.ok(step, title)
    const notes = step.blocks.filter((block) => block.type === 'explanation')
    assert.equal(notes.length <= 2, true, title)
    for (const explanationTitle of explanations) {
      const note = notes.find((block) => block.type === 'explanation' && block.title === explanationTitle)
      assert.ok(note && note.type === 'explanation', explanationTitle)
      const words = note.body.trim().split(/\s+/).length
      assert.equal(words >= 40 && words <= 120, true, `${explanationTitle} has ${words} words`)
    }
  }
  const ledStep = steps.find((item) => item.title === 'Connect the LED')
  assert.equal(ledStep?.blocks.some((block) => block.type === 'warning'), true)
  const buzzerStep = steps.find((item) => item.title === 'Connect the Buzzer')
  assert.equal(buzzerStep?.blocks.some((block) => block.type === 'warning'), true)
  const servoPower = steps.find((item) => item.title === 'Understand Power and Pin Architecture')
  assert.equal(servoPower?.blocks.some((block) => block.type === 'warning'), true)
  assert.equal(servoPower?.blocks.some((block) => block.type === 'explanation'), false)
  const matrix = steps.find((item) => item.title === 'Identify the LED Matrix and Joystick')
  assert.equal(matrix?.blocks.some((block) => block.type === 'warning'), true)
  const led = steps.find((item) => item.title === 'Confirm the LED is common anode')
  assert.equal(led?.blocks.some((block) => block.type === 'text' && block.heading === 'Find the leads'), true)
  assert.equal(led?.blocks.some((block) => block.type === 'text' && block.heading === 'The datasheet detail'), false)

  const placedAfter: Record<string, { type: string; heading?: string }> = {
    'How does a PIR sensor work?': { type: 'text', heading: 'What you are wiring' },
    'Why does the LED need a resistor?': { type: 'text', heading: 'Polarity and current limit' },
    'How does an active buzzer work?': { type: 'text', heading: 'Three-pin active module' },
    'How does servo control work?': { type: 'code_explanation' },
    'How does I²C communication work?': { type: 'text', heading: 'I2C pins and address' },
    'How does the page get new readings?': { type: 'code_explanation' },
    'Why can the colours look different?': { type: 'text', heading: 'Find the leads' },
    'Why a transistor and two resistors?': { type: 'text', heading: 'Why each resistor is there' },
    'How does the MAX7219 light the grid?': { type: 'text', heading: 'FC-16 matrix' },
    'Why does the joystick need a deadzone?': { type: 'code_explanation' },
    'Why does the game use millis()?': { type: 'code' },
    'Why is the button debounced?': { type: 'code' },
  }
  for (const [explanationTitle, anchor] of Object.entries(placedAfter)) {
    const owner = steps.find((step) =>
      step.blocks.some((block) => block.type === 'explanation' && block.title === explanationTitle),
    )
    assert.ok(owner, explanationTitle)
    const index = owner.blocks.findIndex((block) => block.type === 'explanation' && block.title === explanationTitle)
    const previous = owner.blocks[index - 1]
    assert.equal(previous?.type, anchor.type, explanationTitle)
    if (anchor.heading) {
      assert.equal('heading' in previous && previous.heading, anchor.heading, explanationTitle)
    }
    const following = owner.blocks[index + 1]
    if (
      explanationTitle === 'How does a PIR sensor work?' ||
      explanationTitle === 'Why does the LED need a resistor?' ||
      explanationTitle === 'How does an active buzzer work?'
    ) {
      assert.equal(following?.type, 'wiring', explanationTitle)
    }
    if (explanationTitle === 'How does the MAX7219 light the grid?') {
      assert.equal(following?.type === 'text' && following.heading, 'KY-023 joystick')
    }
    if (explanationTitle === 'Why does the game use millis()?') {
      assert.equal(following?.type === 'text' && following.heading, 'Walls, player, and goal')
    }
  }
})
