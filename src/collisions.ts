import { config } from './config';
import type { LevelDefinition, Vec2 } from './types';

export function resolveMovement(position: Vec2, velocity: Vec2, delta: number, level: LevelDefinition): Vec2 {
  const radius = 0.3;
  const nextX = position.x + velocity.x * delta;
  const nextY = position.y + velocity.y * delta;

  const canMoveX = !isWall(nextX, position.y, level, radius);
  const canMoveY = !isWall(position.x, nextY, level, radius);

  return {
    x: canMoveX ? nextX : position.x,
    y: canMoveY ? nextY : position.y
  };
}

function isWall(x: number, y: number, level: LevelDefinition, radius: number) {
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
