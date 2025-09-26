import { clamp } from './math.js';

export class InputManager {
  constructor(settings) {
    this.settings = settings;
    this.keys = {};
    this.mouseDelta = 0;
    this.pointerLocked = false;
    this.fireHeld = false;
    this.interact = false;
    this.pause = false;
    this.debugToggle = false;

    this._onKey = this._onKey.bind(this);
    this._attach();
  }

  updateSettings(settings) {
    this.settings = settings;
  }

  _attach() {
    window.addEventListener('keydown', (e) => this._onKey(e, true));
    window.addEventListener('keyup', (e) => this._onKey(e, false));
    window.addEventListener('blur', () => this.reset());
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.fireHeld = true;
      }
      if (!this.pointerLocked && this._shouldPointerLock()) {
        const canvas = document.querySelector('canvas');
        canvas?.requestPointerLock?.();
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.fireHeld = false;
      }
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.mouseDelta += e.movementX;
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement !== null;
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('wheel', (e) => {
      if (e.deltaY < 0) {
        this.keys['weaponPrev'] = true;
      } else if (e.deltaY > 0) {
        this.keys['weaponNext'] = true;
      }
    });
  }

  _shouldPointerLock() {
    return !('ontouchstart' in window) && !this.settings.touchEnabled;
  }

  _onKey(event, down) {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    switch (key) {
      case 'w':
        this.keys['forward'] = down;
        break;
      case 's':
        this.keys['back'] = down;
        break;
      case 'a':
        this.keys['left'] = down;
        break;
      case 'd':
        this.keys['right'] = down;
        break;
      case ' ':
        this.fireHeld = down;
        break;
      case 'escape':
        this.pause = down;
        break;
      case 'f':
        if (down) this.debugToggle = true;
        break;
      case 'e':
        this.interact = down;
        break;
      case '1':
        if (down) this.keys['weapon1'] = true;
        break;
      case '2':
        if (down) this.keys['weapon2'] = true;
        break;
      case '3':
        if (down) this.keys['weapon3'] = true;
        break;
      default:
        break;
    }
  }

  reset() {
    this.keys = {};
    this.mouseDelta = 0;
    this.fireHeld = false;
    this.interact = false;
    this.pause = false;
    this.debugToggle = false;
  }

  consumeWeaponSlot() {
    if (this.keys['weapon1']) {
      this.keys['weapon1'] = false;
      return 'punch';
    }
    if (this.keys['weapon2']) {
      this.keys['weapon2'] = false;
      return 'pistol';
    }
    if (this.keys['weapon3']) {
      this.keys['weapon3'] = false;
      return 'knife';
    }
    if (this.keys['weaponPrev']) {
      this.keys['weaponPrev'] = false;
      return null;
    }
    if (this.keys['weaponNext']) {
      this.keys['weaponNext'] = false;
      return null;
    }
    return null;
  }

  getState(delta) {
    const forward = (this.keys['forward'] ? 1 : 0) - (this.keys['back'] ? 1 : 0);
    const strafe = (this.keys['right'] ? 1 : 0) - (this.keys['left'] ? 1 : 0);
    const turning = this.pointerLocked ? clamp(this.mouseDelta * this.settings.lookSensitivity, -0.2, 0.2) : 0;
    const state = {
      forward,
      strafe,
      turning,
      looking: 0,
      fire: this.fireHeld,
      interact: this.interact,
      weaponSlot: this.consumeWeaponSlot(),
      pauseRequested: this.pause,
      toggleDebug: this.debugToggle
    };
    this.mouseDelta = 0;
    this.interact = false;
    this.pause = false;
    this.debugToggle = false;
    return state;
  }
}
