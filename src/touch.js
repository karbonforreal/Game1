import { clamp } from './math.js';
import {
  initVirtualJoysticks,
  getLeftVector,
  getRightVector,
  resetVirtualJoysticks
} from './controls/virtualJoysticks.js';
import { turnSpeed, pitchSpeed, invertLookY } from './config/controls.js';

function formatStickValue(label, value) {
  return `${label}:${value.toFixed(2)}`;
}

export class TouchControls {
  constructor(settings) {
    this.settings = settings;
    this.container = document.createElement('div');
    this.container.className = 'touch-container';
    this.container.style.cssText = 'position:fixed;inset:0;pointer-events:none;font-family:inherit;';

    this.leftStick = document.createElement('div');
    this.leftStick.id = 'joy-left';

    this.rightStick = document.createElement('div');
    this.rightStick.id = 'joy-right';

    this.rightControls = document.createElement('div');
    this.rightControls.className = 'touch-right-controls';

    this.fireHeld = false;
    this.interactHeld = false;
    this.weaponQueued = null;
    this.pausedRequested = false;
    this.visible = false;

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

    this.debugReadout = document.createElement('div');
    this.debugReadout.className = 'touch-debug';
    this.debugReadout.style.cssText =
      'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);font-size:12px;color:#fff;pointer-events:none;opacity:0.75;text-shadow:0 1px 2px rgba(0,0,0,0.8);font-family:monospace;';
    this.debugReadout.textContent = 'LX:0.00 LY:0.00 RX:0.00 RY:0.00';

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
        const parsed = JSON.parse(persisted);
        if (parsed && typeof parsed.enabled === 'boolean') {
          this.settings.touchEnabled = parsed.enabled;
        }
      } catch (err) {
        console.warn('Failed to parse touch settings', err);
      }
    }

    this.container.appendChild(this.leftStick);
    this.buttonCluster = document.createElement('div');
    this.buttonCluster.className = 'touch-buttons';
    this.buttonCluster.style.cssText = 'display:flex;flex-direction:column;gap:12px;pointer-events:auto;';
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
    this.buttonCluster.appendChild(weaponRow);
    this.buttonCluster.appendChild(actionRow);
    this.buttonCluster.appendChild(this.pauseButton);

    this.rightControls.appendChild(this.rightStick);
    this.rightControls.appendChild(this.buttonCluster);
    this.container.appendChild(this.rightControls);

    document.body.appendChild(this.container);
    document.body.appendChild(this.toggleButton);
    document.body.appendChild(this.debugReadout);

    initVirtualJoysticks({ leftEl: this.leftStick, rightEl: this.rightStick });

    this.setVisible(this.settings.touchEnabled || this.isTouchDevice());
    this.updateToggleLabel();
    this.applyStyles();
    this.attachPointerListeners();
    this.updateDebugReadout({ x: 0, y: 0 }, { x: 0, y: 0 });
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
    btn.style.cssText =
      'width:72px;height:72px;border-radius:50%;border:none;background:rgba(255,255,255,0.65);color:#111;font-weight:bold;pointer-events:auto;touch-action:none;';
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

    this.fireButton.addEventListener(
      'pointerdown',
      (e) => {
        e.preventDefault();
        this.fireHeld = true;
      },
      pointerOptions
    );
    this.fireButton.addEventListener('pointerup', () => (this.fireHeld = false));
    this.fireButton.addEventListener('pointercancel', () => (this.fireHeld = false));

    this.interactButton.addEventListener(
      'pointerdown',
      (e) => {
        e.preventDefault();
        this.interactHeld = true;
      },
      pointerOptions
    );
    this.interactButton.addEventListener('pointerup', () => (this.interactHeld = false));
    this.interactButton.addEventListener('pointercancel', () => (this.interactHeld = false));

    this.pauseButton.addEventListener(
      'pointerdown',
      (e) => {
        e.preventDefault();
        this.pausedRequested = true;
      },
      pointerOptions
    );
  }

  applyStyles() {
    const baseOpacity = this.settings.uiOpacity;
    const joystickSize = this.settings.joystickSize;
    const joystickSide = this.settings.leftHanded ? 'right' : 'left';
    const joystickOppositeSide = this.settings.leftHanded ? 'left' : 'right';

    const stickStyle =
      `position:absolute;bottom:18%;${joystickSide}:6%;${joystickOppositeSide}:auto;width:${joystickSize}px;height:${joystickSize}px;` +
      `pointer-events:auto;border-radius:50%;background:rgba(40,40,60,${baseOpacity});backdrop-filter:blur(6px);outline:1px solid rgba(255,255,255,${baseOpacity * 0.3});display:flex;align-items:center;justify-content:center;`;
    this.leftStick.style.cssText = stickStyle;

    const rightStickSize = joystickSize * 1.05;
    const controlsSide = this.settings.leftHanded ? 'left' : 'right';
    const controlsOppositeSide = this.settings.leftHanded ? 'right' : 'left';
    const alignItems = this.settings.leftHanded ? 'flex-start' : 'flex-end';

    this.rightStick.style.cssText =
      `width:${rightStickSize}px;height:${rightStickSize}px;border-radius:18px;background:rgba(40,40,60,${baseOpacity});pointer-events:auto;touch-action:none;position:relative;`;

    this.rightControls.style.cssText =
      `position:absolute;bottom:16%;${controlsSide}:4%;${controlsOppositeSide}:auto;display:flex;flex-direction:column;align-items:${alignItems};gap:18px;pointer-events:auto;`;

    this.buttonCluster.style.alignItems = alignItems;
    this.fireButton.style.background = `rgba(255,120,80,${baseOpacity + 0.2})`;
    this.interactButton.style.background = `rgba(120,200,255,${baseOpacity + 0.2})`;
    this.pauseButton.style.cssText =
      'width:64px;height:64px;border-radius:18px;border:none;background:rgba(255,255,255,0.6);font-weight:bold;touch-action:none;';
    this.pauseButton.style.opacity = `${baseOpacity + 0.1}`;
    this.pauseButton.style.marginTop = '4px';
    this.pauseButton.style.alignSelf = 'flex-end';

    document.body.style.touchAction = this.visible ? 'none' : '';

    const leftNub = this.leftStick.querySelector('.nub');
    const rightNub = this.rightStick.querySelector('.nub');
    const leftNubSize = joystickSize * 0.35;
    const rightNubSize = rightStickSize * 0.22;
    if (leftNub) {
      leftNub.style.cssText =
        `position:absolute;top:50%;left:50%;width:${leftNubSize}px;height:${leftNubSize}px;border-radius:50%;transform:translate(-50%, -50%);` +
        `background:rgba(255,255,255,0.18);box-shadow:0 2px 6px rgba(0,0,0,0.4);transition:background 0.1s;`;
    }
    if (rightNub) {
      rightNub.style.cssText =
        `position:absolute;top:50%;left:50%;width:${rightNubSize}px;height:${rightNubSize}px;border-radius:50%;transform:translate(-50%, -50%);` +
        `background:rgba(255,255,255,0.18);box-shadow:0 2px 6px rgba(0,0,0,0.4);transition:background 0.1s;`;
    }
  }

  setVisible(visible) {
    this.visible = visible;
    this.container.style.display = visible ? 'block' : 'none';
    this.debugReadout.style.display = visible ? 'block' : 'none';
    if (!visible) {
      this.resetState();
    }
    this.applyStyles();
  }

  updateSettings(settings) {
    this.settings = settings;
    this.setVisible(settings.touchEnabled || this.visible);
    this.applyStyles();
    this.updateToggleLabel();
  }

  resetState() {
    this.fireHeld = false;
    this.interactHeld = false;
    this.weaponQueued = null;
    this.pausedRequested = false;
    resetVirtualJoysticks();
  }

  updateDebugReadout(left = getLeftVector(), right = getRightVector()) {
    this.debugReadout.textContent = `${formatStickValue('LX', left.x)} ${formatStickValue('LY', left.y)} ${formatStickValue('RX', right.x)} ${formatStickValue('RY', right.y)}`;
  }

  getState() {
    if (!this.visible) {
      this.updateDebugReadout({ x: 0, y: 0 }, { x: 0, y: 0 });
      return { forward: 0, strafe: 0, turning: 0, looking: 0, fire: false, interact: false };
    }

    const left = getLeftVector();
    const rightRaw = getRightVector();
    const right = { x: rightRaw.x, y: invertLookY ? -rightRaw.y : rightRaw.y };

    const forward = clamp(-left.y, -1, 1);
    const strafe = clamp(left.x, -1, 1);

    const lookScale = this.settings.lookSensitivity * 600 || 1;
    const turnMultiplier = turnSpeed / lookScale;
    const turning = clamp(right.x * turnMultiplier, -turnMultiplier, turnMultiplier);

    const looking = clamp(-right.y * pitchSpeed, -pitchSpeed, pitchSpeed);

    const fire = this.fireHeld;
    const interact = this.interactHeld;
    const weaponSlot = this.weaponQueued;
    this.weaponQueued = null;

    const pauseRequested = this.pausedRequested;
    this.pausedRequested = false;
    if (pauseRequested) {
      resetVirtualJoysticks();
    }

    this.updateDebugReadout(left, rightRaw);

    return { forward, strafe, turning, looking, fire, interact, weaponSlot, pauseRequested };
  }
}
