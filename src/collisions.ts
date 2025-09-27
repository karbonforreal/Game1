import type { LevelDefinition, Vec2 } from './types';

const DEFAULT_RADIUS = 0.3;

export function resolveMovement(position: Vec2, velocity: Vec2, delta: number, level: LevelDefinition): Vec2 {
  const radius = DEFAULT_RADIUS;
  const nextX = position.x + velocity.x * delta;
  const nextY = position.y + velocity.y * delta;

  const canMoveX = !isPositionBlocked(nextX, position.y, level, radius);
  const canMoveY = !isPositionBlocked(position.x, nextY, level, radius);

  return {
    x: canMoveX ? nextX : position.x,
    y: canMoveY ? nextY : position.y
  };
}

export function isPositionBlocked(x: number, y: number, level: LevelDefinition, radius: number = DEFAULT_RADIUS) {
  const minX = Math.floor(x - radius);
  const maxX = Math.floor(x + radius);
  const minY = Math.floor(y - radius);
  const maxY = Math.floor(y + radius);

  for (let ty = minY; ty <= maxY; ty++) {
    for (let tx = minX; tx <= maxX; tx++) {
      if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) return true;
      if (level.tiles[ty * level.width + tx] > 0) return true;
    }
  }
  return false;
}

export function findNearestOpenPosition(target: Vec2, level: LevelDefinition, radius: number = DEFAULT_RADIUS): Vec2 {
  if (!isPositionBlocked(target.x, target.y, level, radius)) {
    return { ...target };
  }

  const startTileX = Math.floor(target.x);
  const startTileY = Math.floor(target.y);
  const visited = new Set<string>();
  const queue: { x: number; y: number }[] = [{ x: startTileX, y: startTileY }];
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.x},${current.y}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (current.x < 0 || current.y < 0 || current.x >= level.width || current.y >= level.height) {
      continue;
    }

    const tileValue = level.tiles[current.y * level.width + current.x];
    if (tileValue === 0) {
      const center = { x: current.x + 0.5, y: current.y + 0.5 };
      if (!isPositionBlocked(center.x, center.y, level, radius)) {
        return center;
      }
    }

    for (const [dx, dy] of directions) {
      const next = { x: current.x + dx, y: current.y + dy };
      const nextKey = `${next.x},${next.y}`;
      if (!visited.has(nextKey)) {
        queue.push(next);
      }
    }
  }

  return { ...target };
}
