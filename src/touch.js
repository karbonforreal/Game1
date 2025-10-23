import { clamp, length } from './math.js';

const DEADZONE = 0.12;

export class TouchControls {
  constructor(settings) {
    this.settings = settings;
    this.container = document.createElement('div');
    this.container.className = 'touch-container';
    this.container.style.cssText = 'position:fixed;inset:0;pointer-events:none;font-family:inherit;';

    this.moveArea = document.createElement('div');
    this.moveArea.className = 'touch-move-area';

    this.lookArea = document.createElement('div');
    this.lookArea.className = 'touch-look-area';

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

    this.container.appendChild(this.moveArea);
    this.container.appendChild(this.lookArea);
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

    this.rightControls.appendChild(this.buttonCluster);
    this.container.appendChild(this.rightControls);

    document.body.appendChild(this.container);
    document.body.appendChild(this.toggleButton);
    this.setVisible(this.settings.touchEnabled || this.isTouchDevice());
    this.updateToggleLabel();
    this.applyStyles();
    this.attachPointerListeners();
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
    this.moveArea.addEventListener('pointerdown', (e) => this.beginMove(e), pointerOptions);
    this.lookArea.addEventListener('pointerdown', (e) => this.beginLook(e), pointerOptions);
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
    this.moveArea.setPointerCapture(e.pointerId);
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
    this.lookArea.setPointerCapture(e.pointerId);
  }

  onPointerMove(e) {
    if (this.movePointer && this.movePointer.id === e.pointerId) {
      this.movePointer.currentX = e.clientX;
      this.movePointer.currentY = e.clientY;
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
      this.moveArea.releasePointerCapture(e.pointerId);
      this.movePointer = null;
    }
    if (this.lookPointer && this.lookPointer.id === e.pointerId) {
      this.lookArea.releasePointerCapture(e.pointerId);
      this.lookPointer = null;
    }
    if (this.fireHeld && e.target === this.fireButton) {
      this.fireHeld = false;
    }
    if (this.interactHeld && e.target === this.interactButton) {
      this.interactHeld = false;
    }
  }

  applyStyles() {
    const baseOpacity = this.settings.uiOpacity;
    const moveSide = this.settings.leftHanded ? 'right' : 'left';
    const lookSide = this.settings.leftHanded ? 'left' : 'right';
    this.moveArea.style.cssText = `position:absolute;top:0;bottom:0;${moveSide}:0;width:50%;pointer-events:auto;touch-action:none;background:transparent;z-index:1;`;
    this.lookArea.style.cssText = `position:absolute;top:0;bottom:0;${lookSide}:0;width:50%;pointer-events:auto;touch-action:none;background:transparent;z-index:1;`;
    const controlsSide = this.settings.leftHanded ? 'left' : 'right';
    const controlsOppositeSide = this.settings.leftHanded ? 'right' : 'left';
    const alignItems = this.settings.leftHanded ? 'flex-start' : 'flex-end';
    this.rightControls.style.cssText = `position:absolute;bottom:18%;${controlsSide}:4%;${controlsOppositeSide}:auto;display:flex;flex-direction:column;align-items:${alignItems};gap:18px;pointer-events:auto;z-index:2;`;
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
  }

  reset() {
    this.resetState();
  }

  resetState() {
    this.movePointer = null;
    this.lookPointer = null;
    this.lookDelta = 0;
    this.fireHeld = false;
    this.interactHeld = false;
    this.weaponQueued = null;
    this.pausedRequested = false;
    this.fireButton.removeAttribute('data-active');
    this.interactButton.removeAttribute('data-active');
    this.weaponButtons.forEach((btn) => btn.removeAttribute('data-active'));
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
