import type { EnemyInstance, PlayerState, WeaponDefinition, WeaponType } from './types';
import { distance, dot, normalize } from './math';
import { applyDamage } from './enemy';

export function createWeaponDefinitions(assets: Record<WeaponType, HTMLCanvasElement>): Record<WeaponType, WeaponDefinition> {
  return {
    punch: {
      id: 'punch',
      name: 'Punch',
      damage: 12,
      range: 1.1,
      cooldown: 0.35,
      ammoCost: 0,
      hold: false,
      sprite: assets.punch
    },
    pistol: {
      id: 'pistol',
      name: 'Pistol',
      damage: 20,
      range: 8,
      cooldown: 0.5,
      ammoCost: 1,
      hold: false,
      sprite: assets.pistol,
      sound: 'pistol'
    },
    knife: {
      id: 'knife',
      name: 'Knife',
      damage: 8,
      range: 0.9,
      cooldown: 0.2,
      ammoCost: 0,
      hold: true,
      sprite: assets.knife
    }
  };
}

export function performAttack(def: WeaponDefinition, player: PlayerState, enemies: EnemyInstance[]): EnemyInstance | null {
  let target: EnemyInstance | null = null;
  if (def.id === 'pistol') {
    let closestDistance = def.range;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const toEnemy = {
        x: enemy.position.x - player.position.x,
        y: enemy.position.y - player.position.y
      };
      const dist = distance(enemy.position, player.position);
      if (dist > def.range) continue;
      const direction = normalize(player.direction);
      const enemyDir = normalize(toEnemy);
      const facing = dot(direction, enemyDir);
      if (facing < 0.85) continue;
      if (dist < closestDistance) {
        closestDistance = dist;
        target = enemy;
      }
    }
  } else {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dist = distance(enemy.position, player.position);
      if (dist <= def.range) {
        target = enemy;
        break;
      }
    }
  }
  if (target) {
    applyDamage(target, def.damage);
  }
  return target;
}
