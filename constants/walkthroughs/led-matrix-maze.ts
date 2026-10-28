import type { AuthoredWalkthroughStep, StepConnection, WiringNode } from '../walkthrough-content'
import type { ProjectComponent } from '../projects-data'
import { LED_MATRIX_MAZE_FIRMWARE, mazeRegion } from '../firmware/led-matrix-maze.ts'

function firmwareSlice(start: string, end: string): string {
  const from = LED_MATRIX_MAZE_FIRMWARE.indexOf(start)
  const to = LED_MATRIX_MAZE_FIRMWARE.indexOf(end, from + start.length)
  if (from < 0 || to < 0) {
    throw new Error(`Missing firmware slice starting ${start}`)
  }
  return LED_MATRIX_MAZE_FIRMWARE.slice(from, to).replace(/\s+$/, '')
}

const STAGE_UNDERSTAND = 'Understand the project'
const STAGE_CIRCUIT = 'Build the circuit'
const STAGE_SOFTWARE = 'Prepare the software'
const STAGE_GAME = 'Build the game'
const STAGE_TEST = 'Test and troubleshoot'

const COMPONENTS: ProjectComponent[] = [
  { id: 'arduino-uno-r3', name: 'Arduino Uno R3', illustrationId: 'arduino-uno', owned: false, quantity: 1 },
  { id: 'max7219', name: 'MAX7219 8×8 LED matrix', illustrationId: 'led-matrix', owned: false, quantity: 1 },
  { id: 'joystick', name: 'Analog joystick module', illustrationId: 'joystick', owned: false, quantity: 1 },
  { id: 'breadboard', name: 'Breadboard', illustrationId: 'breadboard', owned: false, quantity: 1 },
  { id: 'jumper-wires', name: 'Male-to-male jumper wires', illustrationId: 'jumper-wires', owned: false, quantity: 2 },
  { id: 'jumper-male-female', name: 'Male-to-female jumper wires', illustrationId: 'jumper-wires', owned: false, quantity: 10 },
  { id: 'usb-data-cable', name: 'USB data cable', illustrationId: 'usb-cable', owned: false, quantity: 1 },
  { id: 'usb-power-source', name: 'USB power source', illustrationId: 'generic-module', owned: false, quantity: 1 },
]

const NODE_ARDUINO: WiringNode = { id: 'arduino', name: 'Arduino Uno', illustrationId: 'arduino-uno' }
const NODE_MATRIX: WiringNode = { id: 'matrix', name: 'LED Matrix', illustrationId: 'led-matrix' }
const NODE_JOYSTICK: WiringNode = { id: 'joystick', name: 'Joystick', illustrationId: 'joystick' }

const POWER_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Arduino Uno', fromPin: '5V', toComponent: 'LED Matrix', toPin: 'VCC', signal: 'power' },
  { fromComponent: 'Arduino Uno', fromPin: 'GND', toComponent: 'LED Matrix', toPin: 'GND', signal: 'ground' },
  { fromComponent: 'Arduino Uno', fromPin: '5V', toComponent: 'Joystick', toPin: '+5V', signal: 'power' },
  { fromComponent: 'Arduino Uno', fromPin: 'GND', toComponent: 'Joystick', toPin: 'GND', signal: 'ground' },
]

const MATRIX_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Arduino Uno', fromPin: 'D13', toComponent: 'LED Matrix', toPin: 'CLK', signal: 'signal' },
  { fromComponent: 'Arduino Uno', fromPin: 'D10', toComponent: 'LED Matrix', toPin: 'CS', signal: 'signal' },
  { fromComponent: 'Arduino Uno', fromPin: 'D11', toComponent: 'LED Matrix', toPin: 'DIN', signal: 'signal' },
]

const JOYSTICK_CONNECTIONS: StepConnection[] = [
  { fromComponent: 'Arduino Uno', fromPin: 'A0', toComponent: 'Joystick', toPin: 'VRx', signal: 'signal' },
  { fromComponent: 'Arduino Uno', fromPin: 'A1', toComponent: 'Joystick', toPin: 'VRy', signal: 'signal' },
  { fromComponent: 'Arduino Uno', fromPin: 'D2', toComponent: 'Joystick', toPin: 'SW', signal: 'signal' },
]

const COMPLETE_CONNECTIONS: StepConnection[] = [...POWER_CONNECTIONS, ...MATRIX_CONNECTIONS, ...JOYSTICK_CONNECTIONS]
const MATRIX_WIRING: StepConnection[] = [POWER_CONNECTIONS[0], POWER_CONNECTIONS[1], ...MATRIX_CONNECTIONS]
const JOYSTICK_WIRING: StepConnection[] = [POWER_CONNECTIONS[2], POWER_CONNECTIONS[3], ...JOYSTICK_CONNECTIONS]

const LIBRARIES = ['MD_MAX72XX 3.5.1']
const EXCERPT = 'Excerpt from led_matrix_maze.ino'

function step(
  sortOrder: number,
  stageSortOrder: number,
  stageTitle: string,
  title: string,
  description: string,
  blocks: AuthoredWalkthroughStep['blocks'],
  tip: string | null = null,
): AuthoredWalkthroughStep {
  return { sortOrder, stageSortOrder, stageTitle, title, description, tip, blocks }
}

export const LED_MATRIX_MAZE_COMPONENTS = COMPONENTS
export const LED_MATRIX_MAZE_CONNECTIONS = COMPLETE_CONNECTIONS
export const LED_MATRIX_MAZE_FIRMWARE_TEXT = LED_MATRIX_MAZE_FIRMWARE

export const LED_MATRIX_MAZE_PROJECT = {
  slug: '25',
  title: 'Arduino LED Matrix Maze Game',
  description: 'Guide a glowing dot through five mazes with a joystick.',
  overview:
    'Build a miniature maze game on a grid of lights. Guide a glowing dot through five levels with a joystick, reach the finish, and see how long each level took.',
  isPublished: false,
  imageKey: 'ledMatrixMaze',
  learningObjectives: [
    'Wire an FC-16 MAX7219 matrix and a five-pin joystick to an Arduino Uno',
    'Share 5 V and ground on a breadboard while both modules stay beside it',
    'Move one dot through five fixed mazes with a deadzone and a debounced button',
    'Read a level time from millis() in the Serial Monitor',
  ],
}

export const LED_MATRIX_MAZE_STEPS: AuthoredWalkthroughStep[] = [
  step(0, 0, STAGE_UNDERSTAND, "What You're Building", 'A joystick moves a glowing dot through five mazes on a grid of lights.', [
    {
      type: 'text',
      heading: 'The game',
      body: 'You guide one light through five mazes. Each maze is the same every time you play it. Walls stay lit, your dot blinks, and the finish winks more slowly. Push the stick to move one square. A wall or the edge of the grid blocks the move. Reaching the finish loads the next maze. The joystick button restarts the level you are on. After level 5, a light runs around the border, and the button starts again at level 1. The Serial Monitor shows how long each level took, and the total when you finish level 5. You will set the board beside the breadboard, connect the display and the joystick, and upload one sketch.',
    },
    {
      type: 'expected',
      heading: 'What done looks like',
      body: 'All five mazes can be finished with the stick, and the Serial Monitor shows each level time and the total.',
    },
  ]),
  step(1, 0, STAGE_UNDERSTAND, 'Identify the LED Matrix and Joystick', 'Both modules are already assembled. Match the silk labels, and do not solder a header.', [
    {
      type: 'text',
      heading: 'FC-16 matrix',
      body: 'Use an assembled FC-16 MAX7219 module with the 8×8 matrix seated and a 5-pin male input header already soldered on. Some listings are a kit with a loose header. If the header is not soldered, stop. This guide does not include soldering. A bare MAX7219 chip, or a board with a different header, is not this part. Lay the board flat, LED face up, with the input header on the right. From the top that header is CLK, CS, DIN, GND, and VCC. With the header on the right, row 0 is the top of the grid and column 0 is the left. The library call setPoint(row, column) uses that order. PCB text may look upside down. That is the FC-16 mounting MD_MAX72XX expects. The header is not inserted into the breadboard. The module runs from 5 V. Do not power it from the Uno 3.3 V pin. Each pin takes the female socket of a male-to-female jumper, and the male pin goes to the Uno or to a breadboard rail. Leave the sketch intensity at 2.',
    },
    {
      type: 'text',
      heading: 'KY-023 joystick',
      body: 'Use a preassembled two-axis module with five male pins, sold as KY-023 or a PS2-style stick. It also runs from 5 V. The usual silk order is GND, +5V, VRx, VRy, and SW. If your silk prints a different order, follow the silk. VRx and VRy rest near the middle of the 0 to 1023 analog range. SW connects to GND when pressed. The sketch uses INPUT_PULLUP, so an unpressed button reads HIGH. Each pin takes a female socket. The male end goes to the Uno or to a rail. Do not plug this header into the breadboard.',
    },
    {
      type: 'warning',
      body: 'Do not turn the matrix intensity up to 15, and do not light all 64 LEDs at full brightness from a weak USB port. This game keeps intensity at 2.',
    },
  ]),
  step(2, 1, STAGE_CIRCUIT, 'Set Up the Arduino and Power Rails', 'The Uno and the breadboard share 5 V and ground. Both modules stay beside the breadboard.', [
    {
      type: 'text',
      heading: 'Placement and rails',
      body: 'Put the Uno on the left with the USB socket toward you and the digital header facing the breadboard. Put the breadboard on the right. Leave USB unplugged. Leave both modules off the breadboard. Do not twist two jumpers into one header pin. The Uno has one 5 V pin, and both modules need 5 V and ground, so the left breadboard rails distribute that supply. Use two male-to-male jumpers. One end of each sits in the Uno female header. The other end sits in the rail. Connect Uno 5 V to the left red rail, row 1. Connect the Uno GND pin beside it to the left blue rail, row 1. The red rail is Uno 5 V. The blue rail is Uno ground. They are separate. Do not connect them to each other, and do not use the Uno 3.3 V pin.',
    },
    {
      type: 'wiring',
      heading: 'Uno power rails',
      nodes: [NODE_ARDUINO],
      connections: [],
      assembly: { parts: [], jumpers: ['uno-5v', 'uno-gnd'] },
    },
    {
      type: 'expected',
      heading: 'Check',
      body: 'The Uno and breadboard are side by side, USB is unplugged, neither module header is in the breadboard, 5 V is on the red rail, and GND is on the blue rail.',
    },
  ], 'Both rail jumpers are male-to-male.'),
  step(3, 1, STAGE_CIRCUIT, 'Connect the LED Matrix', 'The FC-16 stays off the breadboard. Five male-to-female jumpers connect its header.', [
    {
      type: 'text',
      heading: 'Five wires',
      body: 'Lay the FC-16 flat beyond the far end of the breadboard, LED face up, with a clear gap so the board does not touch the breadboard. Keep the input header on the right. From the top that header is CLK, CS, DIN, GND, and VCC. Do not plug the five-pin header into the breadboard. Each wire is male-to-female. The female socket goes on the module pin, and the male pin goes to the rail or the Uno. A 20 cm jumper is long enough for this span. Connect VCC to the left red rail and GND to the left blue rail. Connect CLK to D13, CS to D10, and DIN to D11. D13 is the clock, D10 is chip select, also labelled LOAD or CS on some boards, and D11 is the data pin the library calls DIN. The signal wires do not enter the breadboard.',
    },
    {
      type: 'wiring',
      heading: 'Matrix',
      nodes: [NODE_ARDUINO, NODE_MATRIX],
      connections: MATRIX_WIRING,
      assembly: { parts: ['matrix'], jumpers: ['matrix-gnd', 'matrix-vcc', 'matrix-clk', 'matrix-cs', 'matrix-din'] },
    },
    {
      type: 'expected',
      heading: 'Check',
      body: 'Five male-to-female jumpers are fitted, the header is still off the breadboard, and the diagram matches the board in front of you.',
    },
  ], 'If the silk names the pins in another order, follow the silk. The female socket still goes on the module pin.'),
  step(4, 1, STAGE_CIRCUIT, 'Connect the Joystick', 'The joystick stays beside the breadboard, where your hand does not cover the display.', [
    {
      type: 'text',
      heading: 'Five wires',
      body: 'Lay the joystick flat beyond the near end of the breadboard, on the same side as the USB socket, with a clear gap so it does not touch the breadboard or the matrix. Your hand then stays off the display. Do not plug the header into the breadboard. The usual header order is GND, +5V, VRx, VRy, and SW. Fit a female socket on each pin. Connect GND to the left blue rail and +5V to the left red rail, so the stick shares the Uno 5 V and ground with the matrix. Connect VRx to A0, VRy to A1, and SW to D2. Those three wires do not enter the breadboard. Leave the stick centred while you fit the sockets so you do not bend the header.',
    },
    {
      type: 'wiring',
      heading: 'Joystick',
      nodes: [NODE_ARDUINO, NODE_JOYSTICK],
      connections: JOYSTICK_WIRING,
      assembly: { parts: ['joystick'], jumpers: ['joy-gnd', 'joy-5v', 'joy-x', 'joy-y', 'joy-sw'] },
    },
    {
      type: 'expected',
      heading: 'Check',
      body: 'The stick is clear of the matrix, five female sockets are on its header, and the diagram matches those pins.',
    },
  ], 'If the silk order differs, follow the silk and move these five sockets with it.'),
  step(5, 1, STAGE_CIRCUIT, 'Check the Complete Circuit', 'Count 2 male-to-male jumpers and 10 male-to-female jumpers before you plug in USB.', [
    {
      type: 'wiring',
      heading: 'Complete circuit',
      nodes: [NODE_ARDUINO, NODE_MATRIX, NODE_JOYSTICK],
      connections: COMPLETE_CONNECTIONS,
    },
    {
      type: 'test',
      heading: 'What to verify',
      body: 'Count 2 male-to-male jumpers and 10 male-to-female jumpers. The female socket is on the module, and the male pin is in the Uno or in a rail. Uno 5 V feeds the red rail, and Uno GND feeds the blue rail. The red and blue rails are not joined. No jumper is in the Uno 3.3 V pin. Matrix CLK, CS, and DIN are D13, D10, and D11. Joystick VRx, VRy, and SW are A0, A1, and D2. Both headers are off the breadboard, and the matrix header reads CLK, CS, DIN, GND, VCC from the top. USB is still unplugged. Open Connections on the diagram to read each pair.',
    },
  ]),
  step(6, 2, STAGE_SOFTWARE, 'Set Up Arduino IDE', 'The sketch targets an Arduino Uno and MD_MAX72XX 3.5.1.', [
    {
      type: 'text',
      heading: 'Board and port',
      body: 'Install the Arduino IDE from arduino.cc. Open Tools, Board, Arduino AVR Boards, and choose Arduino Uno. Plug the USB data cable into the Uno and the computer. Open Tools, Port, and select the port that appears. Unplug the cable once: the correct port is the one that disappears. A charge-only cable can light the power LED and still never show a port.',
    },
    {
      type: 'text',
      heading: 'Library',
      body: 'Open Tools, Manage Libraries, search for MD_MAX72XX by MajicDesigns, and install version 3.5.1. The finished sketch includes MD_MAX72xx.h and constructs the display as FC16_HW with data on pin 11, clock on pin 13, and chip select on pin 10. Do not install a different MAX7219 library and expect this sketch to compile.',
    },
    {
      type: 'expected',
      heading: 'Check',
      body: 'The board menu says Arduino Uno, a serial port is selected, and Library Manager shows MD_MAX72XX 3.5.1 installed.',
    },
  ]),
  step(7, 3, STAGE_GAME, 'Read Joystick Movement', 'This excerpt is how the finished sketch turns a stick position into one grid step. Do not upload it on its own.', [
    {
      type: 'text',
      heading: 'Centre, deadzone, and direction',
      body: 'Each axis is an analog reading from 0 to 1023. A centred stick rests near 512. Anything within 80 counts of 512 is the centre, so small noise does not move the player. Past that band, the sign of the reading becomes one grid step, either -1 or +1. INVERT_Y starts true, so a rising VRy reading moves toward row 0, the top of the matrix. INVERT_X starts false. If your module faces the other way, you change those two booleans in the finished sketch and upload that whole program again. Leave the pin numbers alone. If both axes leave the deadzone, the sketch keeps the axis farther from 512 and clears the other. If the two distances are equal, it moves neither axis. One push is one horizontal or vertical step, not a diagonal.',
    },
    {
      type: 'code',
      language: 'Arduino',
      filename: EXCERPT,
      code: mazeRegion('direction'),
    },
    {
      type: 'code_explanation',
      body: 'axisDirection and stickStep belong to the finished sketch. They fill dx and dy, which the movement step uses for one square. This fragment has no setup or loop, so it will not compile on its own.',
    },
  ]),
  step(8, 3, STAGE_GAME, 'Create the Maze and Player', 'This excerpt stores one maze and refuses a move onto a wall or off the grid. Do not upload it on its own.', [
    {
      type: 'text',
      heading: 'Grid, walls, and coordinates',
      body: 'The display is an 8 by 8 grid. WALLS holds five mazes. Each maze is eight bytes, one per row. Bit 0 of a byte is column 0, the left column, and a set bit is a wall. START_X and START_Y are the open square where the player appears. GOAL_X and GOAL_Y are the open square to reach. beginLevel copies that start into playerX and playerY and prints the level number. wallAt treats a coordinate outside 0 to 7 as a wall. tryStep refuses a move that would leave the grid or land on a wall.',
    },
    {
      type: 'code',
      language: 'Arduino',
      filename: EXCERPT,
      code: firmwareSlice('bool wallAt', '\nbool takeMove'),
    },
    {
      type: 'code_explanation',
      body: 'The joystick button calls beginLevel again for the maze you are already on, which puts the player back on the start square. Each maze has a route from its start to its goal. This excerpt is part of the finished sketch, not a program of its own.',
    },
  ]),
  step(9, 3, STAGE_GAME, 'Move and Draw the Player', 'These excerpts are the move timing and the three kinds of LED in the finished sketch. Do not upload them on their own.', [
    {
      type: 'text',
      heading: 'One square at a time',
      body: 'The first time the stick leaves centre, the player moves one square. Holding the same direction waits 280 ms, then repeats every 180 ms. Releasing the stick clears that hold, so the next push moves immediately. The timing subtracts unsigned millis() values, so a rollover does not freeze the player. loop does not call delay, so the button and the blink stay responsive while you hold the stick.',
    },
    {
      type: 'code',
      language: 'Arduino',
      filename: EXCERPT,
      code: firmwareSlice('bool takeMove', '\nbool readPress'),
    },
    {
      type: 'text',
      heading: 'Walls, player, and goal',
      body: 'drawPlay clears the matrix and visits every square. A wall stays on. The goal is on for 600 ms of each 800 ms. The player is on for 120 ms of each 240 ms, and that fast blink replaces the goal when both occupy the same square. setPoint takes the row first and the column second, matching the FC-16 with its header on the right. update sends that buffer to the chip.',
    },
    {
      type: 'code',
      language: 'Arduino',
      filename: EXCERPT,
      code: mazeRegion('draw'),
    },
  ]),
  step(10, 3, STAGE_GAME, 'Add Level Completion and Timing', 'These excerpts record the time and accept one button press. They are part of the finished sketch, not programs to upload.', [
    {
      type: 'text',
      heading: 'Goal and timer',
      body: 'When a move lands on the goal, completeLevel prints the level number and the milliseconds since that level started. The player is already on the goal square, so the 700 ms success flash is that one square. Levels 1 to 4 then load the next maze. Level 5 prints the total milliseconds since the run started and starts the border chase. The success pause is inside the total and outside the next level’s own timer. The Serial Monitor at 9600 baud is the only clock.',
    },
    {
      type: 'code',
      language: 'Arduino',
      filename: EXCERPT,
      code: firmwareSlice('void completeLevel', '\nvoid setup'),
    },
    {
      type: 'text',
      heading: 'Restart button',
      body: 'SW uses the internal pull-up, so LOW means pressed. readPress accepts a press only after it has stayed down for 40 ms, and holding the button does not repeat it. During a level, that press restarts the level. During the success flash, the next maze is not loaded yet, so the same press restarts the level you just finished. During the final chase, the press returns to level 1 and starts the total time again.',
    },
    {
      type: 'code',
      language: 'Arduino',
      filename: EXCERPT,
      code: firmwareSlice('bool readPress', '\n// region: draw'),
    },
    {
      type: 'tip',
      body: 'Open the Serial Monitor after upload. A centred stick prints nothing. An accepted step prints move, the direction, and the raw analog pair.',
    },
  ]),
  step(11, 3, STAGE_GAME, 'Upload the Complete Game', 'This is the only program to paste. The earlier code blocks were excerpts of it.', [
    {
      type: 'code',
      language: 'Arduino',
      filename: 'led_matrix_maze.ino',
      libraries: LIBRARIES,
      code: LED_MATRIX_MAZE_FIRMWARE,
    },
    {
      type: 'text',
      heading: 'Upload',
      body: 'Create a sketch named led_matrix_maze and replace its contents with the program above. Do not paste an earlier excerpt underneath it. Board is Arduino Uno. Port is the Uno port. Click Upload. When the IDE finishes, open the Serial Monitor and set it to 9600 baud. Inside setup, intensity is set to 2, then setPoint(0, 0, true) and update() light row 0, column 0. That is the top-left LED when the FC-16 input header is on the right. After a short pause the same LED turns off and level 1 is drawn. That corner flash is the matrix check inside this sketch. If it never lights, the usual causes are intensity left at 0, CLK and DIN swapped, or the input header on the left. The last step lists those checks.',
    },
    {
      type: 'expected',
      heading: 'What you should observe',
      body: 'One LED flashes in the top-left corner, then the first maze appears. Walls stay lit. One dot blinks quickly on the start square. Another square blinks slowly. That slow square is the goal.',
    },
  ]),
  step(12, 4, STAGE_TEST, 'Play and Test All Five Levels', 'Finish each maze, then use the button and the two invert lines if a control feels backwards.', [
    {
      type: 'test',
      heading: 'Play',
      body: 'Move to the slow square on each maze. The monitor prints a time in milliseconds when a level completes. After level 5, one LED runs around the border and the monitor prints the total. Press the stick button to return to level 1. During an earlier level, the same button puts you back on that level’s start square. If a wire looks doubtful, go back to Check the Complete Circuit and use that diagram.',
    },
    {
      type: 'troubleshooting',
      heading: 'If something is wrong',
      items: [
        {
          problem: 'The matrix stays dark',
          solution: 'Confirm MD_MAX72XX 3.5.1, FC16_HW, DIN on D11, CLK on D13, and CS on D10. The female socket is on the matrix pin and the male pin is in the Uno. VCC must come from the red rail and GND from the blue rail. Intensity stays at 2. Compare the wires with the completed diagram on Check the Complete Circuit. A charge-only USB cable can power the Uno LED and still fail to upload.',
        },
        {
          problem: 'The maze is rotated or mirrored',
          solution: 'Turn the module so the LED face is up and the input header is on the right, top to bottom CLK, CS, DIN, GND, VCC. Row 0 is then the top. If the silk order differs, move the jumpers to match the silk. Do not push the header into the breadboard.',
        },
        {
          problem: 'The stick moves the wrong way',
          solution: 'Change INVERT_X or INVERT_Y in the finished sketch and upload that whole program again. Leave the pin numbers alone. A centred stick should print nothing and should not move the player.',
        },
        {
          problem: 'The player jitters or runs away',
          solution: 'Leave the deadzone at 80 and the repeat at 280 ms then 180 ms. A noisy module that never rests near 512 needs a larger JOY_DEADZONE, not a deleted check. Do not add delay() inside loop.',
        },
        {
          problem: 'The button restarts more than once',
          solution: 'SW must go to D2 and the pin mode must stay INPUT_PULLUP. The press is accepted only after 40 ms and only on the change to pressed. Holding the button should produce one restart.',
        },
      ],
    },
    {
      type: 'expected',
      heading: 'Finished',
      body: 'You can complete all five mazes, read each level time and the final total in the Serial Monitor, and start a new run with the joystick button.',
    },
  ]),
]
