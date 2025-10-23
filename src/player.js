import { config } from './config.js';
import { play } from './audio.js';
import { resolveMovement } from './collisions.js';
import { rotate } from './math.js';

export function createPlayer(weapons) {
  return {
    position: { x: 2.5, y: 2.5 },
    direction: { x: 1, y: 0 },
    plane: { x: 0, y: Math.tan(config.fov / 2) },
    velocity: { x: 0, y: 0 },
    health: 80,
    armor: 25,
    ammo: 10,
    maxHealth: 100,
    maxArmor: 100,
    maxAmmo: 50,
    activeWeapon: 'pistol',
    weapons: Object.fromEntries(Object.entries(weapons).map(([id, def]) => [id, { definition: def, lastFire: 0 }])),
    isAttacking: false,
    attackTimer: 0,
    hurtTimer: 0
  };
}

export function setPlayerStart(player, x, y, direction) {
  player.position.x = x;
  player.position.y = y;
  player.direction = { x: Math.cos(direction), y: Math.sin(direction) };
  player.plane = { x: -player.direction.y * Math.tan(config.fov / 2), y: player.direction.x * Math.tan(config.fov / 2) };
}

export function updatePlayer(player, input, delta, settings, level) {
  const speed = config.moveSpeed;
  const strafeSpeed = config.strafeSpeed;
  const forward = input.forward;
  const strafe = input.strafe;

  const dir = player.direction;
  const right = { x: -dir.y, y: dir.x };
  const velocity = {
    x: dir.x * forward * speed + right.x * strafe * strafeSpeed,
    y: dir.y * forward * speed + right.y * strafe * strafeSpeed
  };

  player.position = resolveMovement(player.position, velocity, delta, level);

  if (Math.abs(velocity.x) + Math.abs(velocity.y) > 0.01 && Math.random() < 0.02) {
    play('step');
  }

  if (input.turning !== 0) {
    const angle = input.turning * settings.lookSensitivity * 600;
    player.direction = rotate(player.direction, angle);
    player.plane = rotate(player.plane, angle);
  }

  player.attackTimer = Math.max(0, player.attackTimer - delta);
  player.hurtTimer = Math.max(0, player.hurtTimer - delta);

  if (input.weaponSlot) {
    player.activeWeapon = input.weaponSlot;
  }
}

export function playerFire(player, time) {
  const weapon = player.weapons[player.activeWeapon];
  if (!weapon) return null;
  const def = weapon.definition;
  if (time - weapon.lastFire < def.cooldown) return null;
  if (def.ammoCost > 0 && player.ammo < def.ammoCost) return null;
  if (def.ammoCost > 0) {
    player.ammo = Math.max(0, player.ammo - def.ammoCost);
  }
  weapon.lastFire = time;
  player.attackTimer = def.cooldown;
  player.isAttacking = true;
  play(def.id === 'pistol' ? 'pistol' : 'swing');
  return def;
}

export function endAttack(player) {
  player.isAttacking = false;
}

export function healPlayer(player, amount) {
  player.health = Math.min(player.maxHealth * 1.5, player.health + amount);
}

export function addArmor(player, amount) {
  player.armor = Math.min(player.maxArmor, player.armor + amount);
}

export function addAmmo(player, amount) {
  player.ammo = Math.min(player.maxAmmo, player.ammo + amount);
}

export function damagePlayer(player, amount) {
  const armorAbsorb = Math.min(player.armor, amount * 0.6);
  player.armor -= armorAbsorb;
  player.health -= amount - armorAbsorb;
  player.hurtTimer = 0.3;
  play('hurt');
  if (navigator.vibrate) {
    navigator.vibrate(40);
  }
}

export function isPlayerAlive(player) {
  return player.health > 0;
}
