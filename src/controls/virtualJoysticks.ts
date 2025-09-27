import { deadzone } from '../config/controls';

type StickState = {
  id: string;
  el: HTMLDivElement | null;
  knob: HTMLDivElement | null;
  pointerId: number | null;
  target: { x: number; y: number };
  visual: { x: number; y: number };
  smoothed: { x: number; y: number };
};

const sticks: Record<'left' | 'right', StickState> = {
  left: createStickState('joy-left'),
  right: createStickState('joy-right')
};

let initialized = false;
const listeners: Array<{ type: string; target: EventTarget; handler: EventListenerOrEventListenerObject }> = [];

function createStickState(id: string): StickState {
  return {
    id,
    el: null,
    knob: null,
    pointerId: null,
    target: { x: 0, y: 0 },
    visual: { x: 0, y: 0 },
    smoothed: { x: 0, y: 0 }
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function applyDeadzone(vx: number, vy: number, dz = deadzone) {
  const mag = Math.hypot(vx, vy);
  if (mag === 0 || mag < dz) {
    return { x: 0, y: 0 };
  }
  const scaled = Math.min(1, (mag - dz) / (1 - dz));
  const nx = (vx / mag) * scaled;
  const ny = (vy / mag) * scaled;
  return { x: nx, y: ny };
}

function clampVector(vx: number, vy: number) {
  const mag = Math.hypot(vx, vy);
  if (mag > 1) {
    return { x: vx / mag, y: vy / mag };
  }
  return { x: vx, y: vy };
}

function attachStick(stick: StickState, el: HTMLDivElement) {
  stick.el = el;
  stick.el.id = stick.id;
  stick.el.classList.add('vj');
  stick.el.style.touchAction = 'none';
  stick.el.style.userSelect = 'none';

  const nub = document.createElement('div');
  nub.className = 'nub';
  stick.knob = nub;
  stick.el.appendChild(nub);

  const pointerDown = (event: PointerEvent) => {
    if (stick.pointerId !== null) return;
    stick.pointerId = event.pointerId;
    if (event.pointerType === 'touch') {
      event.preventDefault();
    }
    stick.el?.setPointerCapture(event.pointerId);
    updateStickFromEvent(stick, event);
  };

  const pointerMove = (event: PointerEvent) => {
    if (stick.pointerId !== event.pointerId) return;
    if (event.pointerType === 'touch') {
      event.preventDefault();
    }
    updateStickFromEvent(stick, event);
  };

  const endHandler = (event: PointerEvent) => {
    if (stick.pointerId !== event.pointerId) return;
    if (stick.el && stick.el.hasPointerCapture(event.pointerId)) {
      stick.el.releasePointerCapture(event.pointerId);
    }
    resetStick(stick);
  };

  stick.el.addEventListener('pointerdown', pointerDown, { passive: false });
  window.addEventListener('pointermove', pointerMove, { passive: false });
  window.addEventListener('pointerup', endHandler);
  window.addEventListener('pointercancel', endHandler);
  window.addEventListener('pointerout', endHandler);
  window.addEventListener('pointerleave', endHandler);

  listeners.push({ type: 'pointerdown', target: stick.el, handler: pointerDown });
  listeners.push({ type: 'pointermove', target: window, handler: pointerMove });
  listeners.push({ type: 'pointerup', target: window, handler: endHandler });
  listeners.push({ type: 'pointercancel', target: window, handler: endHandler });
  listeners.push({ type: 'pointerout', target: window, handler: endHandler });
  listeners.push({ type: 'pointerleave', target: window, handler: endHandler });
}

function updateStickFromEvent(stick: StickState, event: PointerEvent) {
  if (!stick.el) return;
  const rect = stick.el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = rect.width / 2 || 1;
  const rawX = (event.clientX - centerX) / radius;
  const rawY = (event.clientY - centerY) / radius;
  const clamped = clampVector(rawX, rawY);
  const dz = applyDeadzone(clamped.x, clamped.y);
  stick.visual = clamped;
  stick.target = dz;
  updateKnob(stick);
}

function updateKnob(stick: StickState) {
  if (!stick.knob || !stick.el) return;
  const maxOffset = stick.el.clientWidth * 0.5 - stick.knob.clientWidth * 0.5;
  const offsetX = stick.visual.x * maxOffset;
  const offsetY = stick.visual.y * maxOffset;
  stick.knob.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
}

function resetStick(stick: StickState) {
  stick.pointerId = null;
  stick.target = { x: 0, y: 0 };
  stick.visual = { x: 0, y: 0 };
  updateKnob(stick);
}

function smoothStick(stick: StickState) {
  stick.smoothed.x = lerp(stick.smoothed.x, stick.target.x, 0.25);
  stick.smoothed.y = lerp(stick.smoothed.y, stick.target.y, 0.25);
  if (Math.abs(stick.smoothed.x) < 0.0001) stick.smoothed.x = 0;
  if (Math.abs(stick.smoothed.y) < 0.0001) stick.smoothed.y = 0;
  return { x: stick.smoothed.x, y: stick.smoothed.y };
}

export function initVirtualJoysticks({ leftEl, rightEl }: { leftEl: HTMLDivElement; rightEl: HTMLDivElement }) {
  if (initialized) return;
  if (!leftEl || !rightEl) {
    throw new Error('Virtual joystick elements are required');
  }
  attachStick(sticks.left, leftEl);
  attachStick(sticks.right, rightEl);
  initialized = true;
}

export function getLeftVector() {
  return smoothStick(sticks.left);
}

export function getRightVector() {
  return smoothStick(sticks.right);
}

export function resetVirtualJoysticks() {
  resetStick(sticks.left);
  resetStick(sticks.right);
  sticks.left.smoothed = { x: 0, y: 0 };
  sticks.right.smoothed = { x: 0, y: 0 };
}

export function teardownVirtualJoysticks() {
  if (!initialized) return;
  resetVirtualJoysticks();
  for (const { type, target, handler } of listeners.splice(0, listeners.length)) {
    target.removeEventListener(type, handler as EventListener);
  }
  if (sticks.left.knob && sticks.left.knob.parentElement) {
    sticks.left.knob.parentElement.removeChild(sticks.left.knob);
  }
  if (sticks.right.knob && sticks.right.knob.parentElement) {
    sticks.right.knob.parentElement.removeChild(sticks.right.knob);
  }
  sticks.left.el = null;
  sticks.right.el = null;
  sticks.left.knob = null;
  sticks.right.knob = null;
  initialized = false;
}

export function getStickDebug() {
  return {
    left: { ...sticks.left.target },
    right: { ...sticks.right.target }
  };
}
