import type { LevelDefinition, Vec2 } from './types';

function isWallTile(level: LevelDefinition, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= level.width || tileY >= level.height) {
    return true;
  }
  return level.tiles[tileY * level.width + tileX] > 0;
}

export function findNearestWalkablePoint(level: LevelDefinition, target: Vec2): Vec2 {
  const startTileX = Math.floor(target.x);
  const startTileY = Math.floor(target.y);
  const queue: { x: number; y: number }[] = [{ x: startTileX, y: startTileY }];
  const visited = new Set<string>();

  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 }
  ];

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (!isWallTile(level, x, y)) {
      return { x: x + 0.5, y: y + 0.5 };
    }

    for (const dir of directions) {
      const nextX = x + dir.x;
      const nextY = y + dir.y;
      const nextKey = `${nextX},${nextY}`;
      if (!visited.has(nextKey)) {
        queue.push({ x: nextX, y: nextY });
      }
    }
  }

  return {
    x: Math.min(Math.max(target.x, 0.5), level.width - 0.5),
    y: Math.min(Math.max(target.y, 0.5), level.height - 0.5)
  };
}
