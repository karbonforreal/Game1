import { config } from './config.js';
import { distance } from './math.js';

export class Raycaster {
  constructor(level) {
    this.level = level;
    this.textures = [];
  }

  setTextures(images) {
    this.textures = images.map((image) => ({ image, width: image.width, height: image.height, data: image }));
  }

  isWall(x, y) {
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);
    if (mapX < 0 || mapY < 0 || mapX >= this.level.width || mapY >= this.level.height) {
      return true;
    }
    return this.level.tiles[mapY * this.level.width + mapX] > 0;
  }

  cast(origin, direction) {
    const mapX = Math.floor(origin.x);
    const mapY = Math.floor(origin.y);
    const deltaDistX = direction.x === 0 ? 1e30 : Math.abs(1 / direction.x);
    const deltaDistY = direction.y === 0 ? 1e30 : Math.abs(1 / direction.y);

    let stepX = 0;
    let stepY = 0;
    let sideDistX = 0;
    let sideDistY = 0;

    if (direction.x < 0) {
      stepX = -1;
      sideDistX = (origin.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1 - origin.x) * deltaDistX;
    }

    if (direction.y < 0) {
      stepY = -1;
      sideDistY = (origin.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1 - origin.y) * deltaDistY;
    }

    let hit = false;
    let side = 0;
    let currentX = mapX;
    let currentY = mapY;

    while (!hit) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        currentX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        currentY += stepY;
        side = 1;
      }
      if (currentX < 0 || currentY < 0 || currentX >= this.level.width || currentY >= this.level.height) {
        break;
      }
      const tileIndex = this.level.tiles[currentY * this.level.width + currentX];
      if (tileIndex > 0) {
        hit = true;
        const perpWallDist = side === 0
          ? (currentX - origin.x + (1 - stepX) / 2) / direction.x
          : (currentY - origin.y + (1 - stepY) / 2) / direction.y;
        const textureIndex = this.level.textureLookup[tileIndex] ?? 0;
        const texture = this.textures[textureIndex] ?? this.textures[0];
        let wallX = side === 0 ? origin.y + perpWallDist * direction.y : origin.x + perpWallDist * direction.x;
        wallX -= Math.floor(wallX);
        const texX = Math.floor(wallX * texture.width);
        return {
          distance: Math.max(perpWallDist, 0.0001),
          texture,
          texX,
          side,
          mapX: currentX,
          mapY: currentY
        };
      }
    }

    return {
      distance: config.maxRenderDistance,
      texture: this.textures[0],
      texX: 0,
      side,
      mapX: currentX,
      mapY: currentY
    };
  }

  gatherSprites(playerPos, sprites) {
    const result = sprites.map((sprite) => ({ ...sprite }));
    for (const sprite of result) {
      sprite.distance = distance(playerPos, sprite.position);
    }
    result.sort((a, b) => b.distance - a.distance);
    return result;
  }
}
