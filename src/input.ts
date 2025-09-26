import type { InputState, Settings } from './types';
import { clamp } from './math';

type KeyMap = Record<string, boolean>;

export class InputManager {
  private keys: KeyMap = {};
  private mouseDelta = 0;
  private pointerLocked = false;
  private settings: Settings;
  private fireHeld = false;
  private interact = false;
  private pause = false;
  private debugToggle = false;
  private turnLeft = false;
  private turnRight = false;
  private wheelWeapon: Settings['leftHanded'];

  constructor(settings: Settings) {
    this.settings = settings;
    this.wheelWeapon = settings.leftHanded;
    this.attach();
  }

  updateSettings(settings: Settings) {
    this.settings = settings;
  }

  private attach() {
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    window.addEventListener('blur', () => this.reset());
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.fireHeld = true;
      }
      if (!this.pointerLocked && this.shouldPointerLock()) {
        const canvas = document.querySelector('canvas');
        if (canvas && typeof canvas.requestPointerLock === 'function') {
          canvas.requestPointerLock();
        }
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

  private shouldPointerLock(): boolean {
    const pointerLockAvailable =
      typeof document !== 'undefined' &&
      (typeof document.body?.requestPointerLock === 'function' ||
        typeof document.documentElement?.requestPointerLock === 'function');

    return pointerLockAvailable && !this.settings.touchEnabled;
  }

  private onKey(event: KeyboardEvent, down: boolean) {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    switch (key) {
      case 'w':
      case 'arrowup':
        if (event.key === 'ArrowUp') event.preventDefault();
        this.keys['forward'] = down;
        break;
      case 's':
      case 'arrowdown':
        if (event.key === 'ArrowDown') event.preventDefault();
        this.keys['back'] = down;
        break;
      case 'a':
        this.keys['left'] = down;
        break;
      case 'd':
        this.keys['right'] = down;
        break;
      case 'arrowleft':
        event.preventDefault();
        this.turnLeft = down;
        break;
      case 'arrowright':
        event.preventDefault();
        this.turnRight = down;
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
    this.turnLeft = false;
    this.turnRight = false;
  }

  consumeWeaponSlot(): InputState['weaponSlot'] {
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

  getState(delta: number): InputState {
    const forward = (this.keys['forward'] ? 1 : 0) - (this.keys['back'] ? 1 : 0);
    const strafe = (this.keys['right'] ? 1 : 0) - (this.keys['left'] ? 1 : 0);
    const pointerTurn = this.pointerLocked ? clamp(this.mouseDelta * this.settings.lookSensitivity, -0.2, 0.2) : 0;
    const keyboardTurn = ((this.turnRight ? 1 : 0) - (this.turnLeft ? 1 : 0)) * 0.05;
    const turning = clamp(pointerTurn + keyboardTurn, -0.3, 0.3);
    const state: InputState = {
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
