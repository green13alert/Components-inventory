import { GRID, LEVELS, wallByte } from '../../lib/maze-game.ts'

function byteList(levelIndex: number): string {
  return Array.from({ length: GRID }, (_, y) => `0x${wallByte(LEVELS[levelIndex], y).toString(16).padStart(2, '0')}`).join(', ')
}

const wallRows = LEVELS.map((_, index) => `  { ${byteList(index)} }`).join(',\n')
const startX = LEVELS.map((level) => String(level.start.x)).join(', ')
const startY = LEVELS.map((level) => String(level.start.y)).join(', ')
const goalX = LEVELS.map((level) => String(level.goal.x)).join(', ')
const goalY = LEVELS.map((level) => String(level.goal.y)).join(', ')

/**
 * Authoritative sketch for the LED matrix maze.
 * Hardware type FC16_HW matches an FC-16 module with the input header on the right.
 * Row 0 is the top of that orientation. Column 0 is the left. Bit 0 of a wall byte is column 0.
 */
export const LED_MATRIX_MAZE_FIRMWARE = `#include <MD_MAX72xx.h>

const int DIN_PIN = 11;
const int CLK_PIN = 13;
const int CS_PIN = 10;
const int X_PIN = A0;
const int Y_PIN = A1;
const int SW_PIN = 2;

const int JOY_CENTER = 512;
const int JOY_DEADZONE = 80;
const bool INVERT_X = false;
const bool INVERT_Y = true;
const unsigned long MOVE_ARM_MS = 280;
const unsigned long MOVE_REPEAT_MS = 180;
const unsigned long BUTTON_DEBOUNCE_MS = 40;
const unsigned long SUCCESS_MS = 700;
const int GRID = 8;
const int LEVEL_COUNT = 5;

MD_MAX72XX display(MD_MAX72XX::FC16_HW, DIN_PIN, CLK_PIN, CS_PIN, 1);

const uint8_t WALLS[LEVEL_COUNT][GRID] = {
${wallRows}
};
const uint8_t START_X[LEVEL_COUNT] = { ${startX} };
const uint8_t START_Y[LEVEL_COUNT] = { ${startY} };
const uint8_t GOAL_X[LEVEL_COUNT] = { ${goalX} };
const uint8_t GOAL_Y[LEVEL_COUNT] = { ${goalY} };

int levelIndex = 0;
int playerX = 0;
int playerY = 0;
char phase = 'p';
unsigned long levelStarted = 0;
unsigned long runStarted = 0;
unsigned long successStarted = 0;
int holdX = 0;
int holdY = 0;
unsigned long holdSince = 0;
unsigned long lastMove = 0;
bool buttonDown = false;
unsigned long buttonChanged = 0;

// region: direction
int axisDirection(int raw, bool invert) {
  int offset = raw - JOY_CENTER;
  if (abs(offset) <= JOY_DEADZONE) {
    return 0;
  }
  int sign = offset > 0 ? 1 : -1;
  return invert ? -sign : sign;
}

void stickStep(int xRaw, int yRaw, int &dx, int &dy) {
  dx = axisDirection(xRaw, INVERT_X);
  dy = axisDirection(yRaw, INVERT_Y);
  if (dx != 0 && dy != 0) {
    int xMag = abs(xRaw - JOY_CENTER);
    int yMag = abs(yRaw - JOY_CENTER);
    if (xMag == yMag) {
      dx = 0;
      dy = 0;
    } else if (xMag > yMag) {
      dy = 0;
    } else {
      dx = 0;
    }
  }
}
// end: direction

bool wallAt(int index, int x, int y) {
  if (x < 0 || y < 0 || x >= GRID || y >= GRID) {
    return true;
  }
  return (WALLS[index][y] & (1 << x)) != 0;
}

// region: player
void beginLevel(int index) {
  levelIndex = index;
  playerX = START_X[index];
  playerY = START_Y[index];
  phase = 'p';
  levelStarted = millis();
  holdX = 0;
  holdY = 0;
  holdSince = levelStarted;
  lastMove = 0;
  Serial.print("Level ");
  Serial.println(index + 1);
}

bool tryStep(int dx, int dy) {
  if (dx == 0 && dy == 0) {
    return false;
  }
  int nextX = playerX + dx;
  int nextY = playerY + dy;
  if (wallAt(levelIndex, nextX, nextY)) {
    return false;
  }
  playerX = nextX;
  playerY = nextY;
  return true;
}
// end: player

bool takeMove(int dx, int dy, unsigned long now) {
  if (dx == 0 && dy == 0) {
    holdX = 0;
    holdY = 0;
    holdSince = now;
    return false;
  }
  if (dx != holdX || dy != holdY) {
    holdX = dx;
    holdY = dy;
    holdSince = now;
    lastMove = now;
    return true;
  }
  if (now - holdSince >= MOVE_ARM_MS && now - lastMove >= MOVE_REPEAT_MS) {
    lastMove = now;
    return true;
  }
  return false;
}

bool readPress(unsigned long now) {
  bool rawDown = digitalRead(SW_PIN) == LOW;
  if (rawDown == buttonDown) {
    buttonChanged = now;
    return false;
  }
  if (now - buttonChanged < BUTTON_DEBOUNCE_MS) {
    return false;
  }
  buttonDown = rawDown;
  buttonChanged = now;
  return rawDown;
}

// region: draw
void drawPlay(unsigned long now) {
  display.clear();
  for (int y = 0; y < GRID; y++) {
    for (int x = 0; x < GRID; x++) {
      bool on = wallAt(levelIndex, x, y);
      if (x == GOAL_X[levelIndex] && y == GOAL_Y[levelIndex]) {
        on = (now % 800) < 600;
      }
      if (x == playerX && y == playerY) {
        on = (now % 240) < 120;
      }
      if (on) {
        display.setPoint(y, x, true);
      }
    }
  }
  display.update();
}
// end: draw

void drawSuccess(unsigned long now) {
  display.clear();
  bool flash = (now / 100) % 2 == 0;
  if (flash) {
    display.setPoint(playerY, playerX, true);
    display.setPoint(GOAL_Y[levelIndex], GOAL_X[levelIndex], true);
  }
  display.update();
}

void drawFinished(unsigned long now) {
  display.clear();
  int step = (int)((now / 80) % 28);
  int cursor = 0;
  for (int x = 0; x < GRID; x++) {
    if (cursor == step) {
      display.setPoint(0, x, true);
    }
    cursor++;
  }
  for (int y = 1; y < GRID; y++) {
    if (cursor == step) {
      display.setPoint(y, GRID - 1, true);
    }
    cursor++;
  }
  for (int x = GRID - 2; x >= 0; x--) {
    if (cursor == step) {
      display.setPoint(GRID - 1, x, true);
    }
    cursor++;
  }
  for (int y = GRID - 2; y >= 1; y--) {
    if (cursor == step) {
      display.setPoint(y, 0, true);
    }
    cursor++;
  }
  display.update();
}

void completeLevel(unsigned long now) {
  Serial.print("Level ");
  Serial.print(levelIndex + 1);
  Serial.print(" complete in ");
  Serial.print(now - levelStarted);
  Serial.println(" ms");
  if (levelIndex >= LEVEL_COUNT - 1) {
    phase = 'f';
    Serial.print("All five levels in ");
    Serial.print(now - runStarted);
    Serial.println(" ms. Press the joystick button to play again.");
  } else {
    phase = 's';
    successStarted = now;
  }
}

void setup() {
  pinMode(SW_PIN, INPUT_PULLUP);
  Serial.begin(9600);
  display.begin();
  display.control(MD_MAX72XX::INTENSITY, 2);
  display.clear();
  // region: one-led
  display.setPoint(0, 0, true);
  display.update();
  delay(300);
  display.clear();
  display.update();
  // end: one-led
  runStarted = millis();
  buttonChanged = runStarted;
  beginLevel(0);
}

void loop() {
  unsigned long now = millis();
  if (readPress(now)) {
    if (phase == 'f') {
      runStarted = now;
      beginLevel(0);
      Serial.println("Back to level 1.");
    } else {
      beginLevel(levelIndex);
      Serial.println("Level restarted.");
    }
    return;
  }

  if (phase == 's') {
    drawSuccess(now);
    if (now - successStarted >= SUCCESS_MS) {
      beginLevel(levelIndex + 1);
    }
    return;
  }

  if (phase == 'f') {
    drawFinished(now);
    return;
  }

  int xRaw = analogRead(X_PIN);
  int yRaw = analogRead(Y_PIN);
  int dx = 0;
  int dy = 0;
  stickStep(xRaw, yRaw, dx, dy);
  if (takeMove(dx, dy, now) && tryStep(dx, dy)) {
    Serial.print("move ");
    Serial.print(dx);
    Serial.print(",");
    Serial.print(dy);
    Serial.print(" raw ");
    Serial.print(xRaw);
    Serial.print(",");
    Serial.println(yRaw);
    if (playerX == GOAL_X[levelIndex] && playerY == GOAL_Y[levelIndex]) {
      completeLevel(now);
    }
  }
  if (phase == 'p') {
    drawPlay(now);
  }
}
`

export function mazeRegion(name: string): string {
  const start = `// region: ${name}\n`
  const end = `// end: ${name}`
  const from = LED_MATRIX_MAZE_FIRMWARE.indexOf(start)
  const to = LED_MATRIX_MAZE_FIRMWARE.indexOf(end, from + start.length)
  if (from < 0 || to < 0) {
    throw new Error(`Missing firmware region ${name}`)
  }
  return LED_MATRIX_MAZE_FIRMWARE.slice(from + start.length, to).replace(/\s+$/, '')
}
