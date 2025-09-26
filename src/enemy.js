import { distance, normalize, scale, sub } from './math.js';
import { resolveMovement } from './collisions.js';
import { play } from './audio.js';
import { damagePlayer } from './player.js';

export function createEnemy(definition, position, id) {
  return {
    id,
    definition,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    health: definition.health,
    state: 'idle',
    attackTimer: 0,
    hurtTimer: 0,
    patrolDirection: Math.random() * Math.PI * 2,
    alive: true
  };
}

export function updateEnemies(enemies, delta, level, player) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    enemy.attackTimer = Math.max(0, enemy.attackTimer - delta);
    const toPlayer = sub(player.position, enemy.position);
    const dist = distance(player.position, enemy.position);
    const dir = normalize(toPlayer);

    const hasLOS = lineOfSight(enemy.position, player.position, level);

    if (enemy.state === 'idle') {
      if (dist < enemy.definition.aggroRange && hasLOS) {
        enemy.state = 'chase';
        play('swing');
      } else {
        const wander = { x: Math.cos(enemy.patrolDirection), y: Math.sin(enemy.patrolDirection) };
        enemy.position = resolveMovement(enemy.position, scale(wander, enemy.definition.speed * 0.2), delta, level);
        if (Math.random() < 0.01) {
          enemy.patrolDirection += (Math.random() - 0.5) * 0.5;
        }
      }
    } else if (enemy.state === 'chase') {
      if (dist < 0.9) {
        enemy.state = 'attack';
      } else {
        const velocity = scale(dir, enemy.definition.speed);
        enemy.position = resolveMovement(enemy.position, velocity, delta, level);
      }
      if (!hasLOS && dist > enemy.definition.aggroRange * 1.2) {
        enemy.state = 'idle';
      }
    } else if (enemy.state === 'attack') {
      if (dist > 1.2) {
        enemy.state = hasLOS ? 'chase' : 'idle';
      } else if (enemy.attackTimer <= 0) {
        damagePlayer(player, enemy.definition.damage);
        enemy.attackTimer = enemy.definition.attackCooldown;
        player.position = resolveMovement(player.position, scale(dir, -2), delta, level);
      }
    }
  }
}

function lineOfSight(start, end, level) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const steps = Math.ceil(distance(start, end) * 10);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = start.x + dx * t;
    const y = start.y + dy * t;
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);
    if (mapX < 0 || mapY < 0 || mapX >= level.width || mapY >= level.height) return false;
    const tile = level.tiles[mapY * level.width + mapX];
    if (tile > 0) {
      if (Math.floor(start.x) === mapX && Math.floor(start.y) === mapY) continue;
      return false;
    }
  }
  return true;
}

export function applyDamage(enemy, amount) {
  enemy.health -= amount;
  if (enemy.health <= 0) {
    enemy.alive = false;
  } else {
    enemy.hurtTimer = 0.3;
  }
}
