import { config } from './config.js';

function renderMinimap(ctx, canvas, level, player, sprites, settings) {
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

export function renderHUD(ctx, canvas, player, weapon, hud, settings, level, sprites) {
  if (level) {
    renderMinimap(ctx, canvas, level, player, sprites, settings);
  }

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
    const hudTop = canvas.height - hudHeight;
    const centerY = canvas.height / 2;
    const safetyMargin = 24;
    const maxWeaponHeight = Math.max(0, hudTop - (centerY + safetyMargin));

    let weaponWidth = canvas.width * 0.35;
    const aspect = weapon.sprite.height / weapon.sprite.width;
    let weaponHeight = weaponWidth * aspect;

    if (maxWeaponHeight > 0 && weaponHeight > maxWeaponHeight) {
      const scale = maxWeaponHeight / weaponHeight;
      weaponHeight = maxWeaponHeight;
      weaponWidth *= scale;
    }

    const weaponX = canvas.width / 2 - weaponWidth / 2;
    const weaponY = Math.max(centerY + safetyMargin, hudTop - weaponHeight);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(weapon.sprite, weaponX, weaponY, weaponWidth, weaponHeight);
  }

  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0.25, settings.uiOpacity));
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(-6, 0);
  ctx.moveTo(6, 0);
  ctx.lineTo(16, 0);
  ctx.moveTo(0, -16);
  ctx.lineTo(0, -6);
  ctx.moveTo(0, 6);
  ctx.lineTo(0, 16);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}
