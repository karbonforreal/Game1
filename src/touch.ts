import { clamp, length } from './math';
import type { InputState, Settings, Vec2 } from './types';

interface PointerData {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  element: HTMLElement;
  active: boolean;
}

const DEADZONE = 0.12;

export class TouchControls {
  private container: HTMLDivElement;
  private moveOverlay: HTMLDivElement;
  private lookOverlay: HTMLDivElement;
  private joystick: HTMLDivElement;
  private joystickKnob: HTMLDivElement;
  private rightControls: HTMLDivElement;
  private buttonCluster: HTMLDivElement;
  private fireButton: HTMLButtonElement;
  private interactButton: HTMLButtonElement;
  private weaponButtons: HTMLButtonElement[] = [];
  private pauseButton: HTMLButtonElement;
  private toggleButton: HTMLButtonElement;
  private movePointer: PointerData | null = null;
  private lookPointer: PointerData | null = null;
  private lookDelta = 0;
  private settings: Settings;
  private fireHeld = false;
  private interactHeld = false;
  private weaponQueued: InputState['weaponSlot'] = null;
  private pausedRequested = false;
  private visible = false;
  private lastFrameFire = false;

  constructor(settings: Settings) {
    this.settings = settings;
    this.container = document.createElement('div');
    this.container.className = 'touch-container';
    this.container.style.cssText = `position:fixed;inset:0;pointer-events:none;font-family:inherit;`;

    this.moveOverlay = document.createElement('div');
    this.moveOverlay.className = 'touch-move-overlay';
    this.lookOverlay = document.createElement('div');
    this.lookOverlay.className = 'touch-look-overlay';

    this.joystick = document.createElement('div');
    this.joystick.className = 'touch-joystick';
    this.joystickKnob = document.createElement('div');
    this.joystickKnob.className = 'touch-joystick-knob';
    this.joystick.appendChild(this.joystickKnob);

    this.rightControls = document.createElement('div');
    this.rightControls.className = 'touch-right-controls';

    this.fireButton = this.createButton('Fire');
    this.interactButton = this.createButton('Interact');
    const weapon1 = this.createButton('1');
    const weapon2 = this.createButton('2');
    const weapon3 = this.createButton('3');
    this.weaponButtons = [weapon1, weapon2, weapon3];
    this.pauseButton = this.createButton('Pause');

    this.toggleButton = document.createElement('button');
    this.toggleButton.textContent = 'Touch Controls ON';
    this.toggleButton.className = 'touch-toggle';
    this.toggleButton.style.cssText = `position:fixed;top:12px;left:12px;font-size:12px;opacity:0.5;z-index:20;`;
    this.toggleButton.addEventListener('click', () => {
      this.setVisible(!this.visible);
      this.settings.touchEnabled = this.visible;
      localStorage.setItem('raycast-retro-touch', JSON.stringify({ enabled: this.visible }));
      this.updateToggleLabel();
    });
    if (this.isTouchDevice()) {
      this.toggleButton.style.display = 'none';
    }

    const persisted = localStorage.getItem('raycast-retro-touch');
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as { enabled?: boolean };
        if (typeof parsed.enabled === 'boolean') {
          this.settings.touchEnabled = parsed.enabled;
        }
      } catch (err) {
        console.warn('Failed to parse touch settings', err);
      }
    }

    this.container.appendChild(this.moveOverlay);
    this.container.appendChild(this.lookOverlay);
    this.container.appendChild(this.joystick);
    this.buttonCluster = document.createElement('div');
    this.buttonCluster.className = 'touch-buttons';
    this.buttonCluster.style.cssText = 'display:flex;flex-direction:column;gap:12px;pointer-events:auto;';
    const weaponRow = document.createElement('div');
    weaponRow.style.cssText = 'display:flex;gap:10px;';
    this.weaponButtons.forEach((btn, idx) => {
      btn.dataset.weapon = ['punch', 'pistol', 'knife'][idx]!;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.weaponQueued = btn.dataset.weapon as InputState['weaponSlot'];
      });
      weaponRow.appendChild(btn);
    });
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:12px;';
    actionRow.appendChild(this.interactButton);
    actionRow.appendChild(this.fireButton);
    this.buttonCluster.appendChild(weaponRow);
    this.buttonCluster.appendChild(actionRow);
    this.buttonCluster.appendChild(this.pauseButton);

    this.rightControls.appendChild(this.buttonCluster);
    this.container.appendChild(this.rightControls);

    document.body.appendChild(this.container);
    document.body.appendChild(this.toggleButton);
    this.setVisible(this.settings.touchEnabled || this.isTouchDevice());
    this.updateToggleLabel();
    this.applyStyles();
    this.attachPointerListeners();
    this.updateJoystickVisual();
  }

  private isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private updateToggleLabel() {
    this.toggleButton.textContent = `Touch Controls ${this.visible ? 'ON' : 'OFF'}`;
  }

  private createButton(label: string) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.type = 'button';
    btn.className = 'touch-button';
    btn.style.cssText = 'width:72px;height:72px;border-radius:50%;border:none;background:rgba(255,255,255,0.65);color:#111;font-weight:bold;pointer-events:auto;touch-action:none;';
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      btn.setAttribute('data-active', '1');
    });
    btn.addEventListener('pointerup', () => {
      btn.removeAttribute('data-active');
    });
    btn.addEventListener('pointercancel', () => {
      btn.removeAttribute('data-active');
    });
    return btn;
  }

  private attachPointerListeners() {
    const pointerOptions = { passive: false } as AddEventListenerOptions;
    this.moveOverlay.addEventListener('pointerdown', (e) => this.onOverlayPointerDown(e), pointerOptions);
    this.lookOverlay.addEventListener('pointerdown', (e) => this.onOverlayPointerDown(e), pointerOptions);
    window.addEventListener('pointermove', (e) => this.onPointerMove(e), pointerOptions);
    window.addEventListener('pointerup', (e) => this.endPointer(e));
    window.addEventListener('pointercancel', (e) => this.endPointer(e));

    this.fireButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.fireHeld = true;
    });
    this.fireButton.addEventListener('pointerup', () => (this.fireHeld = false));
    this.fireButton.addEventListener('pointercancel', () => (this.fireHeld = false));

    this.interactButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.interactHeld = true;
    });
    this.interactButton.addEventListener('pointerup', () => (this.interactHeld = false));
    this.interactButton.addEventListener('pointercancel', () => (this.interactHeld = false));

    this.pauseButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.pausedRequested = true;
    });
  }

  private onOverlayPointerDown(e: PointerEvent) {
    if (!this.visible) return;
    if (this.shouldIgnorePointerTarget(e.target)) return;
    e.preventDefault();
    const overlay = e.currentTarget as HTMLElement;
    const isMove = this.isMoveSide(e.clientX);
    if (isMove) {
      if (this.movePointer) return;
      this.beginMove(e, overlay);
    } else {
      if (this.lookPointer) return;
      this.beginLook(e, overlay);
    }
  }

  private shouldIgnorePointerTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    if (target === this.fireButton || target === this.interactButton) {
      return true;
    }
    if (this.buttonCluster.contains(target)) {
      return true;
    }
    return false;
  }

  private isMoveSide(clientX: number) {
    const halfWidth = window.innerWidth / 2;
    if (this.settings.leftHanded) {
      return clientX > halfWidth;
    }
    return clientX <= halfWidth;
  }

  private getPointerForEvent(e: PointerEvent): { pointer: PointerData; type: 'move' | 'look' } | null {
    const preferMove = this.isMoveSide(e.clientX);
    const primary = preferMove ? this.movePointer : this.lookPointer;
    const secondary = preferMove ? this.lookPointer : this.movePointer;
    if (primary && primary.id === e.pointerId) {
      return { pointer: primary, type: preferMove ? 'move' : 'look' };
    }
    if (secondary && secondary.id === e.pointerId) {
      return { pointer: secondary, type: preferMove ? 'look' : 'move' };
    }
    return null;
  }

  private beginMove(e: PointerEvent, element: HTMLElement) {
    if (this.movePointer) return;
    if (!this.isMoveSide(e.clientX)) return;
    this.movePointer = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      element,
      active: true
    };
    this.updateJoystickVisual();
    element.setPointerCapture(e.pointerId);
  }

  private beginLook(e: PointerEvent, element: HTMLElement) {
    if (this.lookPointer) return;
    if (this.isMoveSide(e.clientX)) return;
    this.lookPointer = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      element,
      active: true
    };
    element.setPointerCapture(e.pointerId);
  }

  private onPointerMove(e: PointerEvent) {
    if (this.shouldIgnorePointerTarget(e.target)) return;
    const match = this.getPointerForEvent(e);
    if (!match) return;
    if (match.type === 'move') {
      match.pointer.currentX = e.clientX;
      match.pointer.currentY = e.clientY;
      this.updateJoystickVisual();
    } else {
      const dx = e.clientX - match.pointer.currentX;
      match.pointer.currentX = e.clientX;
      match.pointer.currentY = e.clientY;
      this.lookDelta += dx;
    }
  }

  private endPointer(e: PointerEvent) {
    if (!this.shouldIgnorePointerTarget(e.target)) {
      const match = this.getPointerForEvent(e);
      if (match) {
        match.pointer.element.releasePointerCapture(e.pointerId);
        if (match.type === 'move') {
          this.movePointer = null;
          this.updateJoystickVisual();
        } else {
          this.lookPointer = null;
        }
      }
    }
    if (this.fireHeld && e.target === this.fireButton) {
      this.fireHeld = false;
    }
    if (this.interactHeld && e.target === this.interactButton) {
      this.interactHeld = false;
    }
  }

  private updateJoystickVisual() {
    const size = this.settings.joystickSize;
    this.joystick.style.width = `${size}px`;
    this.joystick.style.height = `${size}px`;
    const knobSize = size * 0.4;
    const move = this.getMoveVector();
    const radius = (size - knobSize) / 2;
    const offsetX = move.x * radius;
    const offsetY = move.y * radius;
    this.joystickKnob.style.width = `${knobSize}px`;
    this.joystickKnob.style.height = `${knobSize}px`;
    this.joystickKnob.style.transform = `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`;
  }

  private applyStyles() {
    const baseOpacity = this.settings.uiOpacity;
    const joystickSide = this.settings.leftHanded ? 'right' : 'left';
    const joystickOppositeSide = this.settings.leftHanded ? 'left' : 'right';
    this.joystick.style.cssText = `position:absolute;bottom:20%;${joystickSide}:6%;${joystickOppositeSide}:auto;pointer-events:none;border-radius:50%;background:rgba(40,40,60,${baseOpacity});backdrop-filter:blur(6px);touch-action:none;display:flex;align-items:center;justify-content:center;z-index:4;`;
    this.joystickKnob.style.cssText =
      'position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);background:rgba(255,255,255,0.7);border-radius:50%;transition:background 0.1s;';
    this.moveOverlay.style.cssText =
      'position:absolute;top:0;bottom:0;left:0;width:50%;background:transparent;pointer-events:auto;touch-action:none;z-index:1;';
    this.lookOverlay.style.cssText =
      'position:absolute;top:0;bottom:0;right:0;width:50%;background:transparent;pointer-events:auto;touch-action:none;z-index:1;';
    const controlsSide = this.settings.leftHanded ? 'left' : 'right';
    const controlsOppositeSide = this.settings.leftHanded ? 'right' : 'left';
    const alignItems = this.settings.leftHanded ? 'flex-start' : 'flex-end';
    this.rightControls.style.cssText = `position:absolute;bottom:18%;${controlsSide}:4%;${controlsOppositeSide}:auto;display:flex;flex-direction:column;align-items:${alignItems};gap:18px;pointer-events:auto;z-index:5;`;
    this.buttonCluster.style.alignItems = alignItems;
    this.fireButton.style.background = `rgba(255,120,80,${baseOpacity + 0.2})`;
    this.interactButton.style.background = `rgba(120,200,255,${baseOpacity + 0.2})`;
    this.pauseButton.style.cssText = 'width:64px;height:64px;border-radius:18px;border:none;background:rgba(255,255,255,0.6);font-weight:bold;';
    this.pauseButton.style.opacity = `${baseOpacity + 0.1}`;
    this.pauseButton.style.marginTop = '4px';
    this.pauseButton.style.alignSelf = 'flex-end';
    this.container.style.setProperty('--touch-opacity', `${baseOpacity}`);
    if (this.visible) {
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.touchAction = '';
    }
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    this.container.style.display = visible ? 'block' : 'none';
    if (!visible) {
      this.resetState();
    }
    this.applyStyles();
  }

  updateSettings(settings: Settings) {
    this.settings = settings;
    this.setVisible(settings.touchEnabled || this.visible);
    this.applyStyles();
    this.updateJoystickVisual();
  }

  private resetState() {
    this.movePointer = null;
    this.lookPointer = null;
    this.lookDelta = 0;
    this.fireHeld = false;
    this.interactHeld = false;
    this.weaponQueued = null;
  }

  private getMoveVector(): Vec2 {
    if (!this.movePointer) return { x: 0, y: 0 };
    const dx = this.movePointer.currentX - this.movePointer.startX;
    const dy = this.movePointer.currentY - this.movePointer.startY;
    const radius = this.settings.joystickSize * 0.5;
    const nx = clamp(dx / radius, -1, 1);
    const ny = clamp(dy / radius, -1, 1);
    const mag = length({ x: nx, y: ny });
    if (mag < DEADZONE) return { x: 0, y: 0 };
    const scale = Math.min(1, mag);
    return { x: nx * scale, y: ny * scale };
  }

  getState(): Partial<InputState> {
    if (!this.visible) {
      return { forward: 0, strafe: 0, turning: 0, fire: false, interact: false };
    }
    const move = this.getMoveVector();
    const forward = -move.y;
    const strafe = -move.x;
    const turning = clamp(this.lookDelta * 0.003, -0.45, 0.45);
    const fire = this.fireHeld;
    const interact = this.interactHeld;
    const weaponSlot = this.weaponQueued;
    this.weaponQueued = null;
    const pauseRequested = this.pausedRequested;
    this.pausedRequested = false;
    this.lookDelta = 0;
    return { forward, strafe, turning, fire, interact, weaponSlot, pauseRequested };
  }
}
