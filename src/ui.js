import { defaultSettings, saveSettings } from './config.js';

export class UIManager {
  constructor(settings, hooks) {
    this.settings = settings;
    this.hooks = hooks;
    this.pauseOverlay = document.createElement('div');
    this.pauseOverlay.className = 'ui-overlay pause';
    this.pauseOverlay.innerHTML = `
      <div class="panel">
        <h1>Paused</h1>
        <button data-action="resume">Resume</button>
        <button data-action="options">Options</button>
      </div>
    `;

    this.optionsOverlay = document.createElement('div');
    this.optionsOverlay.className = 'ui-overlay options';
    this.optionsOverlay.innerHTML = this.buildOptionsHTML();

    document.body.appendChild(this.pauseOverlay);
    document.body.appendChild(this.optionsOverlay);

    this.pauseOverlay.querySelector('[data-action="resume"]')?.addEventListener('click', () => this.resume());
    this.pauseOverlay.querySelector('[data-action="options"]')?.addEventListener('click', () => this.openOptions());
    this.optionsOverlay.querySelector('[data-action="close"]')?.addEventListener('click', () => this.closeOptions());
    this.optionsOverlay.querySelector('[data-action="reset"]')?.addEventListener('click', () => this.resetSettings());
    this.optionsOverlay.addEventListener('input', (event) => this.onOptionsInput(event));

    this.hideAll();
  }

  buildOptionsHTML() {
    const s = this.settings;
    return `
      <div class="panel">
        <h1>Options</h1>
        <label>Sensitivity <input type="range" min="0.001" max="0.008" step="0.0005" name="lookSensitivity" value="${s.lookSensitivity}"></label>
        <label>Joystick Size <input type="range" min="100" max="180" step="5" name="joystickSize" value="${s.joystickSize}"></label>
        <label>UI Opacity <input type="range" min="0.4" max="1" step="0.05" name="uiOpacity" value="${s.uiOpacity}"></label>
        <label>Volume <input type="range" min="0" max="1" step="0.05" name="volume" value="${s.volume}"></label>
        <label class="toggle"><input type="checkbox" name="leftHanded" ${s.leftHanded ? 'checked' : ''}> Left-handed layout</label>
        <label class="toggle"><input type="checkbox" name="touchEnabled" ${s.touchEnabled ? 'checked' : ''}> Enable touch</label>
        <div class="actions">
          <button data-action="reset">Reset</button>
          <button data-action="close">Close</button>
        </div>
      </div>
    `;
  }

  hideAll() {
    this.pauseOverlay.style.display = 'none';
    this.optionsOverlay.style.display = 'none';
  }

  showPause() {
    this.pauseOverlay.style.display = 'flex';
  }

  resume() {
    this.hideAll();
    this.hooks.onResume();
  }

  openOptions() {
    this.pauseOverlay.style.display = 'none';
    this.optionsOverlay.style.display = 'flex';
  }

  closeOptions() {
    this.optionsOverlay.style.display = 'none';
    this.pauseOverlay.style.display = 'flex';
  }

  resetSettings() {
    this.settings = { ...defaultSettings };
    this.refreshOptions();
    saveSettings(this.settings);
    this.hooks.onSettingsChanged(this.settings);
  }

  refreshOptions() {
    this.optionsOverlay.innerHTML = this.buildOptionsHTML();
    this.optionsOverlay.querySelector('[data-action="close"]')?.addEventListener('click', () => this.closeOptions());
    this.optionsOverlay.querySelector('[data-action="reset"]')?.addEventListener('click', () => this.resetSettings());
  }

  onOptionsInput(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.name) return;
    switch (target.type) {
      case 'range':
        if (target.name === 'lookSensitivity' || target.name === 'uiOpacity' || target.name === 'volume') {
          this.settings = { ...this.settings, [target.name]: Number(target.value) };
        } else if (target.name === 'joystickSize') {
          this.settings = { ...this.settings, joystickSize: Number(target.value) };
        }
        break;
      case 'checkbox':
        this.settings = { ...this.settings, [target.name]: target.checked };
        break;
      default:
        break;
    }
    saveSettings(this.settings);
    this.hooks.onSettingsChanged(this.settings);
  }

  getSettings() {
    return this.settings;
  }
}
