import { config } from './config';
import type { PlayerState, Settings, SpriteRenderable, WeaponDefinition } from './types';
import { renderHUD, HUDState } from './hud';
import { Raycaster } from './raycaster';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  private view: HTMLCanvasElement;
  private viewCtx: CanvasRenderingContext2D;
  private depthBuffer: number[] = [];

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.imageRendering = 'pixelated';
    container.appendChild(this.canvas);
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');
    this.ctx = ctx;
    this.view = document.createElement('canvas');
    const viewCtx = this.view.getContext('2d');
    if (!viewCtx) throw new Error('No view context');
    this.viewCtx = viewCtx;
  }

  resize(scale: number) {
    const width = Math.floor(window.innerWidth * scale);
    const height = Math.floor(window.innerHeight * scale);
    this.view.width = Math.max(320, width);
    this.view.height = Math.max(240, height);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.depthBuffer = new Array(this.view.width).fill(0);
  }

  render(raycaster: Raycaster, player: PlayerState, sprites: SpriteRenderable[], hud: HUDState, weapon: WeaponDefinition, settings: Settings) {
    const ctx = this.viewCtx;
    const width = this.view.width;
    const height = this.view.height;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = config.ceilingColor;
    ctx.fillRect(0, 0, width, height / 2);
    ctx.fillStyle = config.floorColor;
    ctx.fillRect(0, height / 2, width, height / 2);

    const posX = player.position.x;
    const posY = player.position.y;
    const dirX = player.direction.x;
    const dirY = player.direction.y;
    const planeX = player.plane.x;
    const planeY = player.plane.y;

    for (let x = 0; x < width; x++) {
      const cameraX = (2 * x) / width - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;
      const hit = raycaster.cast({ x: posX, y: posY }, { x: rayDirX, y: rayDirY });
      const perpDist = hit.distance;
      this.depthBuffer[x] = perpDist;
      const lineHeight = Math.floor(height / perpDist);
      const drawStart = Math.max(-lineHeight / 2 + height / 2, 0);
      const drawEnd = Math.min(lineHeight / 2 + height / 2, height);

      const tex = hit.texture;
      const texX = hit.texX;
      const texImage = tex.image;
      ctx.drawImage(texImage, texX, 0, 1, tex.height, x, drawStart, 1, drawEnd - drawStart);
    }

    const sortedSprites = raycaster.gatherSprites(player.position, sprites);
    for (const sprite of sortedSprites) {
      if (sprite.distance <= 0.1) continue;
      const spriteX = sprite.position.x - posX;
      const spriteY = sprite.position.y - posY;

      const invDet = 1.0 / (planeX * dirY - dirX * planeY);
      const transformX = invDet * (dirY * spriteX - dirX * spriteY);
      const transformY = invDet * (-planeY * spriteX + planeX * spriteY);
      if (transformY <= 0) continue;

      const spriteScreenX = Math.floor((width / 2) * (1 + transformX / transformY));
      const spriteHeight = Math.abs(Math.floor(height / transformY)) * sprite.size;
      let drawStartY = -spriteHeight / 2 + height / 2;
      let drawEndY = spriteHeight / 2 + height / 2;

      if ((sprite.anchor ?? 'center') === 'floor') {
        const floorOffset = spriteHeight / 2;
        drawStartY += floorOffset;
        drawEndY += floorOffset;
      }

      const offsetY = sprite.offsetY ?? 0;
      drawStartY += offsetY;
      drawEndY += offsetY;
      if (drawStartY < 0) drawStartY = 0;
      if (drawEndY >= height) drawEndY = height;

      const spriteWidth = Math.abs(Math.floor(height / transformY)) * sprite.size;
      if (spriteWidth < 1) continue;
      const halfSpriteWidth = spriteWidth / 2;
      let drawStartX = Math.floor(spriteScreenX - halfSpriteWidth);
      let drawEndX = Math.ceil(spriteScreenX + halfSpriteWidth);

      if (drawStartX < 0) drawStartX = 0;
      if (drawEndX >= width) drawEndX = width;

      const spriteScreenOffset = spriteScreenX - halfSpriteWidth;
      const texStep = sprite.image.width / spriteWidth;

      if (drawStartX >= drawEndX) continue;

      for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
        const texX = Math.min(
          sprite.image.width - 1,
          Math.max(0, Math.floor((stripe - spriteScreenOffset) * texStep))
        );
        if (transformY > 0 && stripe > 0 && stripe < width && transformY <= this.depthBuffer[stripe]) {
          ctx.drawImage(
            sprite.image,
            texX,
            0,
            1,
            sprite.image.height,
            stripe,
            drawStartY,
            1,
            drawEndY - drawStartY
          );
        }
      }
    }

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.view, 0, 0, this.canvas.width, this.canvas.height);
    renderHUD(this.ctx, this.canvas, player, weapon, hud, settings, raycaster.level, sprites);
  }
}
