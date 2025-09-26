import { clamp, length } from './math.js';

const DEADZONE = 0.12;

export class TouchControls {
  constructor(settings) {
    this.settings = settings;
    this.container = document.createElement('div');
    this.container.className = 'touch-container';
    this.container.style.cssText = 'position:fixed;inset:0;pointer-events:none;font-family:inherit;';

    this.joystick = document.createElement('div');
    this.joystick.className = 'touch-joystick';
    this.joystickKnob = document.createElement('div');
    this.joystickKnob.className = 'touch-joystick-knob';
    this.joystick.appendChild(this.joystickKnob);

    this.lookPad = document.createElement('div');
    this.lookPad.className = 'touch-lookpad';

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
    this.toggleButton.style.cssText = 'position:fixed;top:12px;left:12px;font-size:12px;opacity:0.5;z-index:20;';

    this.toggleButton.addEventListener('click', () => {
      this.setVisible(!this.visible);
      this.settings.touchEnabled = this.visible;
      localStorage.setItem('raycast-retro-touch', JSON.stringify({ enabled: this.visible }));
      this.updateToggleLabel();
    });

    this.movePointer = null;
    this.lookPointer = null;
    this.lookDelta = 0;
    this.fireHeld = false;
    this.interactHeld = false;
    this.weaponQueued = null;
    this.pausedRequested = false;
    this.visible = false;

    if (this.isTouchDevice()) {
      this.toggleButton.style.display = 'none';
    }

    const persisted = localStorage.getItem('raycast-retro-touch');
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        if (parsed && typeof parsed.enabled === 'boolean') {
          this.settings.touchEnabled = parsed.enabled;
        }
      } catch (err) {
        console.warn('Failed to parse touch settings', err);
      }
    }

    this.container.appendChild(this.joystick);
    this.container.appendChild(this.lookPad);
    const buttonCluster = document.createElement('div');
    buttonCluster.className = 'touch-buttons';
    buttonCluster.style.cssText = 'position:absolute;right:4%;bottom:18%;display:flex;flex-direction:column;align-items:flex-end;gap:12px;pointer-events:auto;';
    const weaponRow = document.createElement('div');
    weaponRow.style.cssText = 'display:flex;gap:10px;';
    const weaponIds = ['punch', 'pistol', 'knife'];
    this.weaponButtons.forEach((btn, idx) => {
      const weaponId = weaponIds[idx];
      if (weaponId) {
        btn.dataset.weapon = weaponId;
      }
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.weaponQueued = btn.dataset.weapon || null;
      });
      weaponRow.appendChild(btn);
    });
    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:12px;';
    actionRow.appendChild(this.interactButton);
    actionRow.appendChild(this.fireButton);
    buttonCluster.appendChild(weaponRow);
    buttonCluster.appendChild(actionRow);
    buttonCluster.appendChild(this.pauseButton);
    this.container.appendChild(buttonCluster);

    document.body.appendChild(this.container);
    document.body.appendChild(this.toggleButton);
    this.setVisible(this.settings.touchEnabled || this.isTouchDevice());
    this.updateToggleLabel();
    this.applyStyles();
    this.attachPointerListeners();
    this.updateJoystickVisual();
  }

  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  updateToggleLabel() {
    this.toggleButton.textContent = `Touch Controls ${this.visible ? 'ON' : 'OFF'}`;
  }

  createButton(label) {
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

  attachPointerListeners() {
    const pointerOptions = { passive: false };
    this.joystick.addEventListener('pointerdown', (e) => this.beginMove(e), pointerOptions);
    this.lookPad.addEventListener('pointerdown', (e) => this.beginLook(e), pointerOptions);
    window.addEventListener('pointermove', (e) => this.onPointerMove(e), pointerOptions);
    window.addEventListener('pointerup', (e) => this.endPointer(e));
    window.addEventListener('pointercancel', (e) => this.endPointer(e));

    this.fireButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.fireHeld = true;
    });
    this.fireButton.addEventListener('pointerup', () => {
      this.fireHeld = false;
    });
    this.fireButton.addEventListener('pointercancel', () => {
      this.fireHeld = false;
    });

    this.interactButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.interactHeld = true;
    });
    this.interactButton.addEventListener('pointerup', () => {
      this.interactHeld = false;
    });
    this.interactButton.addEventListener('pointercancel', () => {
      this.interactHeld = false;
    });

    this.pauseButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.pausedRequested = true;
    });
  }

  beginMove(e) {
    if (this.movePointer) return;
    this.movePointer = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      active: true
    };
    this.updateJoystickVisual();
    this.joystick.setPointerCapture(e.pointerId);
  }

  beginLook(e) {
    if (this.lookPointer) return;
    this.lookPointer = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      active: true
    };
    this.lookPad.setPointerCapture(e.pointerId);
  }

  onPointerMove(e) {
    if (this.movePointer && this.movePointer.id === e.pointerId) {
      this.movePointer.currentX = e.clientX;
      this.movePointer.currentY = e.clientY;
      this.updateJoystickVisual();
    }
    if (this.lookPointer && this.lookPointer.id === e.pointerId) {
      const dx = e.clientX - this.lookPointer.currentX;
      this.lookPointer.currentX = e.clientX;
      this.lookPointer.currentY = e.clientY;
      this.lookDelta += dx;
    }
  }

  endPointer(e) {
    if (this.movePointer && this.movePointer.id === e.pointerId) {
      this.joystick.releasePointerCapture(e.pointerId);
      this.movePointer = null;
      this.updateJoystickVisual();
    }
    if (this.lookPointer && this.lookPointer.id === e.pointerId) {
      this.lookPad.releasePointerCapture(e.pointerId);
      this.lookPointer = null;
    }
    if (this.fireHeld && e.target === this.fireButton) {
      this.fireHeld = false;
    }
    if (this.interactHeld && e.target === this.interactButton) {
      this.interactHeld = false;
    }
  }

  updateJoystickVisual() {
    const size = this.settings.joystickSize;
    this.joystick.style.width = `${size}px`;
    this.joystick.style.height = `${size}px`;
    this.joystickKnob.style.width = `${size * 0.4}px`;
    this.joystickKnob.style.height = `${size * 0.4}px`;
    const move = this.getMoveVector();
    const knobWidth = this.joystickKnob.offsetWidth || size * 0.4;
    const knobHeight = this.joystickKnob.offsetHeight || size * 0.4;
    const radius = (size - knobWidth) / 2;
    const knobX = size / 2 - knobWidth / 2 + move.x * radius;
    const knobY = size / 2 - knobHeight / 2 + move.y * radius;
    this.joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
  }

  applyStyles() {
    const baseOpacity = this.settings.uiOpacity;
    this.joystick.style.cssText = `position:absolute;bottom:20%;${this.settings.leftHanded ? 'right:6%;' : 'left:6%;'}pointer-events:auto;border-radius:50%;background:rgba(40,40,60,${baseOpacity});backdrop-filter:blur(6px);touch-action:none;display:flex;align-items:center;justify-content:center;`;
    this.joystickKnob.style.cssText = 'background:rgba(255,255,255,0.7);border-radius:50%;transition:background 0.1s;';
    this.lookPad.style.cssText = `position:absolute;bottom:22%;${this.settings.leftHanded ? 'left:6%;' : 'right:6%;'}width:${this.settings.joystickSize * 1.1}px;height:${this.settings.joystickSize * 1.1}px;border-radius:18px;background:rgba(40,40,60,${baseOpacity});pointer-events:auto;touch-action:none;`;
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

  setVisible(visible) {
    this.visible = visible;
    this.container.style.display = visible ? 'block' : 'none';
    if (!visible) {
      this.resetState();
    }
    this.applyStyles();
  }

  updateSettings(settings) {
    this.settings = settings;
    this.setVisible(settings.touchEnabled || this.visible);
    this.applyStyles();
    this.updateJoystickVisual();
  }

  resetState() {
    this.movePointer = null;
    this.lookPointer = null;
    this.lookDelta = 0;
    this.fireHeld = false;
    this.interactHeld = false;
    this.weaponQueued = null;
  }

  getMoveVector() {
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

  getState() {
    if (!this.visible) {
      return { forward: 0, strafe: 0, turning: 0, fire: false, interact: false };
    }
    const move = this.getMoveVector();
    const forward = -move.y;
    const strafe = move.x;
    const turning = clamp(this.lookDelta * this.settings.lookSensitivity * 0.2, -0.2, 0.2);
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
