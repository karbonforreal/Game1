import type { EnemyInstance, PlayerState, Vec2, WeaponDefinition, WeaponType } from './types';
import { distance, dot, normalize } from './math';
import { Raycaster } from './raycaster';

export interface AttackResult {
  enemy: EnemyInstance | null;
  kind: 'enemy' | 'wall';
  position: Vec2;
  distance: number;
}

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

export function performAttack(
  def: WeaponDefinition,
  player: PlayerState,
  enemies: EnemyInstance[],
  raycaster: Raycaster
): AttackResult {
  const origin = player.position;
  const direction = normalize(player.direction);
  const wallHit = raycaster.cast(origin, direction);
  const maxDistance = Math.min(wallHit.distance, def.range);

  let closestEnemy: EnemyInstance | null = null;
  let closestDistance = maxDistance;

  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const toEnemy = {
      x: enemy.position.x - origin.x,
      y: enemy.position.y - origin.y
    };
    const enemyDistance = distance(enemy.position, origin);
    if (enemyDistance > def.range) continue;

    const forwardProjection = dot(toEnemy, direction);
    if (forwardProjection <= 0) continue;

    const lateralSq = enemyDistance * enemyDistance - forwardProjection * forwardProjection;
    const lateralDistance = lateralSq > 0 ? Math.sqrt(lateralSq) : 0;
    if (lateralDistance > 0.6) continue;

    if (forwardProjection < closestDistance + 1e-6) {
      closestEnemy = enemy;
      closestDistance = Math.min(forwardProjection, maxDistance);
    }
  }

  if (closestEnemy) {
    const hitDistance = Math.min(closestDistance, def.range);
    const position = {
      x: origin.x + direction.x * hitDistance,
      y: origin.y + direction.y * hitDistance
    };
    return {
      enemy: closestEnemy,
      kind: 'enemy',
      position,
      distance: hitDistance
    };
  }

  const wallDistance = Math.min(wallHit.distance, def.range);
  const wallPosition = {
    x: origin.x + direction.x * wallDistance,
    y: origin.y + direction.y * wallDistance
  };

  return {
    enemy: null,
    kind: 'wall',
    position: wallPosition,
    distance: wallDistance
  };
}
