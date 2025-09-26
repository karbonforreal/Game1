import { config } from './config.js';

export function resolveMovement(position, velocity, delta, level) {
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

function isWall(x, y, level, radius) {
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
