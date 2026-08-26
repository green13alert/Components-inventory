export const AI_COPY = {
  title: 'Solderi AI',
  subtitle: 'Your engineering copilot',
  inputPlaceholder: 'Get Assistance.',
  working: 'Solderi is working…',
  newChat: 'New Chat',
  recent: 'Recent',
  openChats: 'Open chats',
  attachPhoto: 'Attach or take a photo',
  voiceInput: 'Voice input',
} as const;

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

export const PLACEHOLDER_CHATS: ChatSession[] = [
  {
    id: 'weather',
    title: 'Weather station project',
    messages: [
      {
        id: 'weather-u',
        role: 'user',
        content: 'Help me plan a weather station.',
      },
      {
        id: 'weather-a',
        role: 'assistant',
        content:
          'A first station can read temperature, humidity, and pressure. You already have a DHT-class sensor; a BMP280 and a small display would complete a compact build.',
      },
    ],
  },
  {
    id: 'led',
    title: 'LED circuit debugging',
    messages: [
      {
        id: 'led-u',
        role: 'user',
        content: 'My LED is not lighting up.',
      },
      {
        id: 'led-a',
        role: 'assistant',
        content:
          'Check polarity, series resistance around 220Ω–330Ω, and that the pin is set to OUTPUT. If it is dim, the resistor may be too large.',
      },
    ],
  },
  {
    id: 'arm',
    title: 'Robotic arm idea',
    messages: [
      {
        id: 'arm-u',
        role: 'user',
        content: 'I want to sketch a small robotic arm.',
      },
      {
        id: 'arm-a',
        role: 'assistant',
        content:
          'Start with three SG90 servos for base, shoulder, and gripper. A simple pan-tilt mount is enough to prove the kinematics before adding a fourth joint.',
      },
    ],
  },
  {
    id: 'esp32',
    title: 'ESP32 temperature sensor',
    messages: [
      {
        id: 'esp32-u',
        role: 'user',
        content: 'How should I wire a temperature sensor to an ESP32?',
      },
      {
        id: 'esp32-a',
        role: 'assistant',
        content:
          'Use 3.3V and GND from the ESP32, data on a free GPIO, and a pull-up if the sensor needs one. I can turn that into a pin map once you choose DHT22 or DS18B20.',
      },
    ],
  },
];
