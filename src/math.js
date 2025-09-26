export function vec(x = 0, y = 0) {
  return { x, y };
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v, s) {
  return { x: v.x * s, y: v.y * s };
}

export function length(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v) {
  const len = length(v);
  if (len === 0) return { ...v };
  return { x: v.x / len, y: v.y / len };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

export function rotate(v, radians) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
}

export function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function approach(current, target, delta) {
  if (current < target) return Math.min(target, current + delta);
  return Math.max(target, current - delta);
}

export function wrapAngle(angle) {
  const twoPi = Math.PI * 2;
  return ((angle % twoPi) + twoPi) % twoPi;
}
