import { Project, ProjectCategory, getProjectComponents, getStepCount } from '@/constants/projects-data';
import { buildStepBlocks, type StepBlock } from '@/constants/walkthrough-content';

export type ProjectStep = {
  id: string;
  title: string;
  description: string;
  tip?: string;
  blocks: StepBlock[];
};

type StepTemplate = Omit<ProjectStep, 'id' | 'blocks'>;

const STEP_TEMPLATES: Record<ProjectCategory, StepTemplate[]> = {
  sensors: [
    {
      title: 'Gather your components',
      description:
        'Lay out all sensors, resistors, and your Arduino on a clean workspace. Check each part against the components list before you start wiring.',
      tip: 'Use a breadboard for prototyping — it makes changes easy without soldering.',
    },
    {
      title: 'Power the Arduino',
      description:
        'Connect your Arduino to your computer via USB, or use a 9V battery clip for standalone power. Verify the onboard power LED lights up.',
    },
    {
      title: 'Wire the sensor circuit',
      description:
        'Connect the sensor VCC to 5V, GND to ground, and the signal pin to an analog or digital input on the Arduino. Add a pull-up or pull-down resistor if required.',
      tip: 'Double-check polarity on electrolytic capacitors and diodes.',
    },
    {
      title: 'Connect supporting components',
      description:
        'Wire any additional modules — displays, LEDs, or buzzers — following the pin assignments in the wiring diagram. Keep wire runs short and tidy.',
    },
    {
      title: 'Upload the sketch',
      description:
        'Open the Arduino IDE, select the correct board and port, paste the provided code, and click Upload. Wait for the "Done uploading" confirmation.',
      tip: 'If upload fails, try a different USB cable — many are charge-only.',
    },
    {
      title: 'Calibrate and test readings',
      description:
        'Open the Serial Monitor at 9600 baud. Trigger the sensor and verify readings change as expected. Adjust threshold values in code if needed.',
    },
    {
      title: 'Add display or alerts',
      description:
        'Connect your output device and update the code to show live sensor data or trigger alerts when thresholds are crossed.',
    },
    {
      title: 'Final assembly and review',
      description:
        'Secure loose wires, label connections, and run a full end-to-end test. Document any custom pin assignments for future reference.',
      tip: 'Take a photo of your wiring before closing the enclosure.',
    },
    {
      title: 'Enclosure and deployment',
      description:
        'Mount components in a project box, drill cable pass-throughs, and place the sensor in its final location. Verify everything still works after assembly.',
    },
    {
      title: 'Optimize and extend',
      description:
        'Review performance, add data logging or wireless connectivity, and consider power-saving modes for battery-operated deployments.',
    },
  ],
  robotics: [
    {
      title: 'Unbox and inventory parts',
      description:
        'Verify you have the chassis kit, motors, motor driver, sensors, and all mounting hardware. Missing a single screw can delay assembly.',
    },
    {
      title: 'Assemble the chassis',
      description:
        'Follow the chassis instructions to mount motors, wheels, and the caster. Ensure wheels spin freely and the frame sits level.',
      tip: 'Tighten motor set screws onto the flat side of the motor shaft.',
    },
    {
      title: 'Mount the motor driver',
      description:
        'Secure the L298N or L293D driver to the chassis. Connect motor leads to the driver output terminals and note which side is left vs right.',
    },
    {
      title: 'Wire motors to the driver',
      description:
        'Connect each motor to the driver channels. If a motor spins backward later, swap its two wires — no code change needed.',
    },
    {
      title: 'Connect sensors',
      description:
        'Mount IR sensors, ultrasonic modules, or gyroscopes to the front of the robot. Wire signal, VCC, and GND to the Arduino pins specified in the guide.',
    },
    {
      title: 'Power distribution',
      description:
        'Connect the battery pack to the motor driver and Arduino. Use a common ground between all subsystems. Add a power switch for safety.',
      tip: 'Never connect motors directly to Arduino pins — always use a driver.',
    },
    {
      title: 'Upload motor test sketch',
      description:
        'Flash a simple test program that spins each motor forward for 2 seconds. Confirm both motors respond before uploading the full navigation code.',
    },
    {
      title: 'Calibrate sensors',
      description:
        'Run the sensor calibration routine. For line followers, adjust IR thresholds over black tape and white surfaces. For obstacle bots, test detection range.',
    },
    {
      title: 'Upload full control program',
      description:
        'Flash the complete sketch with navigation logic. Test on a practice track or open floor, keeping hands ready to lift the robot if it veers off course.',
    },
    {
      title: 'Tune and compete',
      description:
        'Adjust PID values, motor speeds, and turn delays. Add battery monitoring and fine-tune for your specific surface and lighting conditions.',
    },
  ],
  iot: [
    {
      title: 'Set up your dev environment',
      description:
        'Install the Arduino IDE and any required libraries (WiFi, HTTP, or MQTT). Confirm your board is recognized on a USB port.',
    },
    {
      title: 'Wire the sensor array',
      description:
        'Connect temperature, humidity, and pressure sensors to the I2C or SPI bus. Use 4.7kΩ pull-ups on SDA and SCL if not already on the module.',
    },
    {
      title: 'Test sensor readings locally',
      description:
        'Upload a basic read sketch and verify values in the Serial Monitor. Compare against a known reference before adding connectivity.',
    },
    {
      title: 'Connect WiFi module',
      description:
        'Wire the ESP8266 or ESP32, or enable the built-in WiFi on your board. Connect the antenna and ensure adequate 3.3V supply current.',
      tip: 'ESP modules can draw 300mA+ during transmission — use a stable power supply.',
    },
    {
      title: 'Configure network credentials',
      description:
        'Add your WiFi SSID and password to the sketch. Upload and confirm the device connects — watch for the assigned IP in Serial output.',
    },
    {
      title: 'Set up cloud endpoint',
      description:
        'Create an account on your IoT platform (ThingSpeak, Blynk, etc.) and note the API key and channel ID needed by the sketch.',
    },
    {
      title: 'Upload data logging sketch',
      description:
        'Flash the full firmware that reads sensors and POSTs data at regular intervals. Verify the first data point appears in your dashboard.',
    },
    {
      title: 'Add local display (optional)',
      description:
        'Wire an OLED or LCD to show live readings without opening the cloud dashboard. Useful for quick field checks.',
    },
    {
      title: 'Deploy and monitor',
      description:
        'Place the station in its final location, ensure WiFi signal strength is adequate, and monitor for 24 hours to catch intermittent issues.',
    },
    {
      title: 'Alerts and automation',
      description:
        'Configure threshold alerts and integrate with other smart home devices. Add OTA update support for remote firmware fixes.',
    },
  ],
  automation: [
    {
      title: 'Plan your control logic',
      description:
        'Sketch the inputs (sensors, switches) and outputs (relays, servos) your system needs. Decide which pins on the Arduino will handle each.',
    },
    {
      title: 'Wire input sensors',
      description:
        'Connect PIR sensors, reed switches, keypads, or RFID readers. Use INPUT_PULLUP for buttons and switches to avoid floating pin reads.',
    },
    {
      title: 'Connect relay modules',
      description:
        'Wire relay IN pins to Arduino digital outputs. Connect the relay COM/NO terminals to your load (lights, fans) following electrical safety guidelines.',
      tip: 'Never switch mains voltage on a breadboard — use proper enclosures.',
    },
    {
      title: 'Power the actuators',
      description:
        'Use a separate power supply for high-current loads. Tie grounds together with the Arduino. Add flyback diodes across inductive loads.',
    },
    {
      title: 'Upload basic I/O test',
      description:
        'Flash a test sketch that toggles each relay and reads each sensor. Confirm Serial output matches physical state.',
    },
    {
      title: 'Implement control logic',
      description:
        'Upload the main sketch with your automation rules — schedules, sensor triggers, or manual override via serial commands.',
    },
    {
      title: 'Add user interface',
      description:
        'Connect a keypad, RFID reader, or mobile app interface for manual control. Test each input method thoroughly.',
    },
    {
      title: 'Safety interlocks',
      description:
        'Add timeout limits, emergency stop behavior, and fail-safe defaults (relays OFF on power loss if using normally-open contacts).',
    },
    {
      title: 'Install in enclosure',
      description:
        'Mount the Arduino, relays, and power supply in a ventilated project box. Label all terminals and leave a service loop on wiring.',
    },
    {
      title: 'Commission and document',
      description:
        'Run the system through all scenarios, log any edge cases, and write down your pin map and configuration for future maintenance.',
    },
  ],
  displays: [
    {
      title: 'Prepare your workspace',
      description:
        'Gather the Arduino, display module, resistors, and jumper wires. Identify the display type (I2C OLED, SPI, or parallel LCD).',
    },
    {
      title: 'Identify display pins',
      description:
        'Look up the pinout for your display. I2C displays use SDA/SCL; parallel LCDs need 6+ data and control pins.',
      tip: 'Many OLED modules have VCC, GND, SDA, and SCL — that\'s it for I2C.',
    },
    {
      title: 'Wire the display',
      description:
        'Connect power and data lines between the display and Arduino. For I2C, add the library and run an I2C scanner to find the address.',
    },
    {
      title: 'Install display libraries',
      description:
        'In the Arduino IDE Library Manager, install the correct driver (Adafruit SSD1306, LiquidCrystal_I2C, etc.) for your display module.',
    },
    {
      title: 'Run the hello world test',
      description:
        'Upload the library example sketch to confirm text renders correctly. Adjust contrast or backlight if the display is blank.',
    },
    {
      title: 'Connect input components',
      description:
        'Wire buttons, potentiometers, or sensors that will drive what appears on screen. Use debounce logic for mechanical switches.',
    },
    {
      title: 'Build the main UI layout',
      description:
        'Structure your code with functions for each screen or animation frame. Plan buffer sizes for scrolling text or graphics.',
    },
    {
      title: 'Upload project sketch',
      description:
        'Flash the complete project code. Verify animations, scrolling text, or sensor values update smoothly without flicker.',
    },
    {
      title: 'Optimize refresh rate',
      description:
        'Tune update intervals to avoid ghosting on LCDs or reduce SPI traffic on LED matrices. Profile memory usage if animations stutter.',
    },
    {
      title: 'Final polish',
      description:
        'Add a startup splash screen, error states for disconnected sensors, and a clean enclosure cutout for the display bezel.',
    },
  ],
};

export function getProjectSteps(project: Project): ProjectStep[] {
  const templates = STEP_TEMPLATES[project.category];
  const count = getStepCount(project.difficulty);
  const selected = templates.slice(0, count);
  const components = getProjectComponents(project);

  const titled = selected.map((step, index) => ({
    ...step,
    title:
      index === 0
        ? `Introduction — ${project.title}`
        : index === count - 1
          ? `Finish — ${step.title}`
          : step.title,
    description:
      index === 0
        ? `Welcome to ${project.title}! ${step.description}`
        : step.description,
  }));

  return titled.map((step, index) => ({
    ...step,
    id: `${project.id}-step-${index}`,
    blocks: buildStepBlocks({
      project,
      step,
      index,
      steps: titled,
      components,
    }),
  }));
}

export function getStepSubtitle(
  project: Project,
  stepIndex: number,
  steps: ProjectStep[],
): string {
  const step = steps[stepIndex];
  if (!step) return '';
  return `Step ${stepIndex + 1} of ${steps.length} · ${step.title}`;
}
