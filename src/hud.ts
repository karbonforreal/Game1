import { config } from './config';
import type {
  HUDMessage,
  PlayerState,
  Settings,
  WeaponDefinition,
  LevelDefinition,
  SpriteRenderable
} from './types';

function renderMinimap(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  level: LevelDefinition,
  player: PlayerState,
  sprites: SpriteRenderable[],
  settings: Settings
) {
  const size = 180;
  const padding = 24;
  const tileWidth = size / level.width;
  const tileHeight = size / level.height;
  const originX = canvas.width - padding - size;
  const originY = padding;

  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0.35, settings.uiOpacity + 0.2));
  ctx.fillStyle = 'rgba(8, 6, 18, 0.9)';
  ctx.fillRect(originX - 6, originY - 6, size + 12, size + 12);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(originX - 6, originY - 6, size + 12, size + 12);
  ctx.fillStyle = 'rgba(12, 10, 26, 0.9)';
  ctx.fillRect(originX, originY, size, size);

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#2d3359';
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const tile = level.tiles[y * level.width + x];
      if (tile <= 0) continue;
      ctx.fillRect(originX + x * tileWidth, originY + y * tileHeight, tileWidth, tileHeight);
    }
  }

  for (const sprite of sprites) {
    const spriteX = originX + sprite.position.x * tileWidth;
    const spriteY = originY + sprite.position.y * tileHeight;
    ctx.fillStyle = sprite.type === 'enemy' ? '#ff6b6b' : '#f2c94c';
    ctx.beginPath();
    ctx.arc(spriteX, spriteY, sprite.type === 'enemy' ? 3 : 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const playerX = originX + player.position.x * tileWidth;
  const playerY = originY + player.position.y * tileHeight;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playerX, playerY);
  ctx.lineTo(playerX + player.direction.x * 14, playerY + player.direction.y * 14);
  ctx.stroke();

  ctx.restore();
}

export interface HUDState {
  fps: number;
  showDebug: boolean;
  messages: HUDMessage[];
}

export function renderHUD(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  player: PlayerState,
  weapon: WeaponDefinition,
  hud: HUDState,
  settings: Settings,
  level: LevelDefinition,
  sprites: SpriteRenderable[]
) {
  renderMinimap(ctx, canvas, level, player, sprites, settings);

  const hudHeight = config.hudHeight;
  ctx.save();
  ctx.fillStyle = 'rgba(15, 10, 25, 0.85)';
  ctx.fillRect(0, canvas.height - hudHeight, canvas.width, hudHeight);

  ctx.fillStyle = '#f2c94c';
  ctx.font = '24px "Press Start 2P", monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  const baseY = canvas.height - hudHeight + 16;
  ctx.fillText(`HEALTH ${Math.floor(player.health)}`, 24, baseY);
  ctx.fillStyle = '#5bc0eb';
  ctx.fillText(`ARMOR ${Math.floor(player.armor)}`, 24, baseY + 32);
  ctx.fillStyle = '#f2994a';
  ctx.fillText(`AMMO ${player.ammo}`, 24, baseY + 64);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`WEAPON ${weapon.name.toUpperCase()}`, canvas.width - 24, baseY);

  if (hud.showDebug) {
    ctx.fillStyle = '#8dff8d';
    ctx.fillText(`FPS ${hud.fps.toFixed(0)}`, canvas.width - 24, baseY + 32);
  }

  if (weapon.sprite) {
    const weaponWidth = canvas.width * 0.35;
    const aspect = weapon.sprite.height / weapon.sprite.width;
    const weaponHeight = weaponWidth * aspect;
    const weaponX = canvas.width / 2 - weaponWidth / 2;
    const weaponY = canvas.height - hudHeight - weaponHeight + 20;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(weapon.sprite, weaponX, weaponY, weaponWidth, weaponHeight);
  }

  ctx.restore();
}
