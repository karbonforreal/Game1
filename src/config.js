const SETTINGS_KEY = 'raycast-retro-settings';

export const defaultSettings = {
  lookSensitivity: 0.0025,
  joystickSize: 120,
  uiOpacity: 0.65,
  leftHanded: false,
  touchEnabled: false,
  dynamicResolution: 1,
  volume: 0.7
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (err) {
    console.warn('Failed to load settings', err);
    return { ...defaultSettings };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings', err);
  }
}

export const config = {
  tileSize: 1,
  moveSpeed: 3.5,
  strafeSpeed: 3,
  runSpeedMultiplier: 1.4,
  turnSpeed: 0.3,
  fov: (70 * Math.PI) / 180,
  maxRenderDistance: 20,
  floorColor: '#1e1b2f',
  ceilingColor: '#05070e',
  resolutionScaleMin: 0.6,
  resolutionScaleMax: 1.0,
  lowFPSThreshold: 50,
  resolutionStep: 0.05,
  hudHeight: 120
};
