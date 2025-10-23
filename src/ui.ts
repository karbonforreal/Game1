import { defaultSettings, saveSettings } from './config';
import type { Settings } from './types';

const SENSITIVITY_DISPLAY_SCALE = 10000;

interface UIHooks {
  onResume: () => void;
  onSettingsChanged: (settings: Settings) => void;
}

export class UIManager {
  private pauseOverlay: HTMLDivElement;
  private optionsOverlay: HTMLDivElement;
  private settings: Settings;
  private hooks: UIHooks;

  constructor(settings: Settings, hooks: UIHooks) {
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
    this.optionsOverlay.addEventListener('change', (event) => this.onOptionsInput(event));

    this.hideAll();
  }

  private buildOptionsHTML() {
    const s = this.settings;
    return `
      <div class="panel">
        <h1>Options</h1>
        <label>Sensitivity <input type="number" min="0" max="100" step="1" name="lookSensitivity" value="${this.toSensitivityInput(s.lookSensitivity)}" inputmode="numeric"></label>
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

  private hideAll() {
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

  private resetSettings() {
    this.settings = { ...defaultSettings };
    this.refreshOptions();
    saveSettings(this.settings);
    this.hooks.onSettingsChanged(this.settings);
  }

  private refreshOptions() {
    this.optionsOverlay.innerHTML = this.buildOptionsHTML();
    this.optionsOverlay.querySelector('[data-action="close"]')?.addEventListener('click', () => this.closeOptions());
    this.optionsOverlay.querySelector('[data-action="reset"]')?.addEventListener('click', () => this.resetSettings());
  }

  private onOptionsInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.name) return;
    switch (target.type) {
      case 'range':
        if (target.name === 'lookSensitivity' || target.name === 'uiOpacity' || target.name === 'volume') {
          this.settings = { ...this.settings, [target.name]: Number(target.value) };
        } else if (target.name === 'joystickSize') {
          this.settings = { ...this.settings, joystickSize: Number(target.value) };
        }
        break;
      case 'number':
        if (target.name === 'lookSensitivity') {
          const numericValue = this.parseSensitivityInput(target.value);
          target.value = String(numericValue);
          this.settings = {
            ...this.settings,
            lookSensitivity: numericValue / SENSITIVITY_DISPLAY_SCALE
          };
        }
        break;
      case 'checkbox':
        this.settings = { ...this.settings, [target.name]: target.checked } as Settings;
        break;
    }
    saveSettings(this.settings);
    this.hooks.onSettingsChanged(this.settings);
  }

  getSettings() {
    return this.settings;
  }

  private toSensitivityInput(value: number) {
    return Math.round(value * SENSITIVITY_DISPLAY_SCALE);
  }

  private parseSensitivityInput(raw: string) {
    const numeric = Math.round(Number(raw) || 0);
    return Math.min(100, Math.max(0, numeric));
  }
}
