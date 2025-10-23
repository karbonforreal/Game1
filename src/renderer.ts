import { config } from './config';
import type { HitMarker, PlayerState, Settings, SpriteRenderable, WeaponDefinition } from './types';
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

  render(
    raycaster: Raycaster,
    player: PlayerState,
    sprites: SpriteRenderable[],
    hud: HUDState,
    weapon: WeaponDefinition,
    hitMarkers: HitMarker[],
    settings: Settings
  ) {
    const ctx = this.viewCtx;
    const width = this.view.width;
    const height = this.view.height;
    ctx.imageSmoothingEnabled = false;
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height / 2);
    skyGradient.addColorStop(0, '#05060f');
    skyGradient.addColorStop(1, config.ceilingColor);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height / 2);

    const floorGradient = ctx.createLinearGradient(0, height / 2, 0, height);
    floorGradient.addColorStop(0, '#271c36');
    floorGradient.addColorStop(1, config.floorColor);
    ctx.fillStyle = floorGradient;
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
      if (lineHeight <= 0) continue;
      const rawDrawStart = -lineHeight / 2 + height / 2;
      const rawDrawEnd = lineHeight / 2 + height / 2;
      const drawStart = Math.max(rawDrawStart, 0);
      const drawEnd = Math.min(rawDrawEnd, height);
      const visibleHeight = drawEnd - drawStart;
      if (visibleHeight <= 0) continue;

      const clippedTop = Math.max(0, -rawDrawStart);
      const clippedBottom = Math.max(0, rawDrawEnd - height);

      const tex = hit.texture;
      const texX = hit.texX;
      const texImage = tex.image;
      const texHeight = tex.height;
      const srcY = Math.max(0, (clippedTop / lineHeight) * texHeight);
      const srcBottomOffset = Math.max(0, (clippedBottom / lineHeight) * texHeight);
      const srcHeight = Math.max(0, texHeight - srcY - srcBottomOffset);
      if (srcHeight <= 0) continue;
      ctx.drawImage(texImage, texX, srcY, 1, srcHeight, x, drawStart, 1, visibleHeight);
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

    if (hitMarkers.length > 0) {
      ctx.save();
      ctx.lineCap = 'round';
      const invDet = 1.0 / (planeX * dirY - dirX * planeY);
      for (const marker of hitMarkers) {
        if (marker.timer <= 0 || marker.duration <= 0) continue;
        const fade = Math.max(0, Math.min(1, marker.timer / marker.duration));
        if (fade <= 0) continue;

        const markerX = marker.position.x - posX;
        const markerY = marker.position.y - posY;
        const transformX = invDet * (dirY * markerX - dirX * markerY);
        const transformY = invDet * (-planeY * markerX + planeX * markerY);
        if (transformY <= 0) continue;

        const screenX = Math.floor((width / 2) * (1 + transformX / transformY));
        if (screenX < 0 || screenX >= width) continue;

        const bufferIndex = Math.min(width - 1, Math.max(0, screenX));
        const depth = this.depthBuffer[bufferIndex] ?? Infinity;
        if (transformY > depth + 0.0001) continue;

        const projectedHeight = Math.abs(Math.floor(height / transformY));
        const size = Math.max(2, Math.min(12, Math.floor(projectedHeight * 0.1) || 0));
        const centerY = Math.floor(height / 2);

        ctx.globalAlpha = fade;
        ctx.strokeStyle = marker.kind === 'enemy' ? '#ff5a5f' : '#f2d16b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX - size, centerY);
        ctx.lineTo(screenX + size, centerY);
        ctx.moveTo(screenX, centerY - size);
        ctx.lineTo(screenX, centerY + size);
        ctx.stroke();

        const innerSize = Math.max(1, size * 0.5);
        ctx.beginPath();
        ctx.moveTo(screenX - innerSize, centerY - innerSize);
        ctx.lineTo(screenX + innerSize, centerY + innerSize);
        ctx.moveTo(screenX - innerSize, centerY + innerSize);
        ctx.lineTo(screenX + innerSize, centerY - innerSize);
        ctx.stroke();
      }
      ctx.restore();
    }

    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.25,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(5, 0, 12, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    if (player.isAttacking) {
      const cooldown = weapon.cooldown || 0.001;
      const normalized = Math.min(1, Math.max(0, player.attackTimer / cooldown));
      const intensity = Math.pow(normalized, 0.65);
      const centerX = width / 2;
      const centerY = height * 0.85;

      let innerColor = 'rgba(255, 200, 160, 0.85)';
      let arcColor = '#ffd9a0';
      if (weapon.id === 'knife') {
        innerColor = 'rgba(150, 255, 235, 0.8)';
        arcColor = '#a0fff0';
      } else if (weapon.id === 'punch') {
        innerColor = 'rgba(255, 130, 150, 0.85)';
        arcColor = '#ff98ad';
      }

      const overlay = ctx.createRadialGradient(centerX, centerY, width * 0.05, centerX, centerY, width * 0.45);
      overlay.addColorStop(0, innerColor);
      overlay.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.65 * intensity;
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.35 * intensity;
      ctx.beginPath();
      ctx.arc(centerX, centerY, width * 0.18, Math.PI * 1.05, Math.PI * 1.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, width * 0.23, Math.PI * 1.1, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();
    }

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.view, 0, 0, this.canvas.width, this.canvas.height);
    renderHUD(this.ctx, this.canvas, player, weapon, hud, settings, raycaster.level, sprites);
  }
}
