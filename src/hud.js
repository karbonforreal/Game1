import { config } from './config.js';

export function renderHUD(ctx, canvas, player, weapon, hud, settings) {
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
