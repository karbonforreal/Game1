import { distance, normalize, scale, sub } from './math';
import { config } from './config';
import type { EnemyDefinition, EnemyInstance, LevelDefinition, PlayerState, Vec2 } from './types';
import { resolveMovement } from './collisions';
import { play } from './audio';
import { damagePlayer } from './player';

function generatePatrolWaypoints(startPos: Vec2, level: LevelDefinition): Vec2[] {
  const waypoints: Vec2[] = [];
  const numWaypoints = 4 + Math.floor(Math.random() * 3); // 4-6 waypoints

  // Helper to check if a position is valid (not a wall)
  const isValidPosition = (pos: Vec2): boolean => {
    const mapX = Math.floor(pos.x);
    const mapY = Math.floor(pos.y);
    if (mapX < 0 || mapY < 0 || mapX >= level.width || mapY >= level.height) return false;
    return level.tiles[mapY * level.width + mapX] === 0;
  };

  // Generate waypoints in a radius around the starting position
  const baseRadius = 4;
  for (let i = 0; i < numWaypoints; i++) {
    let attempts = 0;
    let waypoint: Vec2 | null = null;

    while (attempts < 20 && !waypoint) {
      const angle = (i / numWaypoints) * Math.PI * 2 + (Math.random() - 0.5) * 1.0;
      const radius = baseRadius * (0.5 + Math.random() * 0.8);
      const candidate = {
        x: startPos.x + Math.cos(angle) * radius,
        y: startPos.y + Math.sin(angle) * radius
      };

      if (isValidPosition(candidate)) {
        waypoint = candidate;
      }
      attempts++;
    }

    if (waypoint) {
      waypoints.push(waypoint);
    }
  }

  // Ensure at least 3 waypoints (fallback to positions near start)
  while (waypoints.length < 3) {
    waypoints.push({
      x: startPos.x + (Math.random() - 0.5) * 2,
      y: startPos.y + (Math.random() - 0.5) * 2
    });
  }

  return waypoints;
}

export function createEnemy(definition: EnemyDefinition, position: Vec2, id: number, level: LevelDefinition): EnemyInstance {
  return {
    id,
    definition,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    health: definition.health,
    state: 'patrol',
    attackTimer: 0,
    hurtTimer: 0,
    patrolDirection: Math.random() * Math.PI * 2,
    patrolWaypoints: generatePatrolWaypoints(position, level),
    currentWaypointIndex: 0,
    waypointWaitTimer: 0,
    alive: true
  };
}

export function updateEnemies(enemies: EnemyInstance[], delta: number, level: LevelDefinition, player: PlayerState) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    enemy.attackTimer = Math.max(0, enemy.attackTimer - delta);
    enemy.waypointWaitTimer = Math.max(0, enemy.waypointWaitTimer - delta);

    const toPlayer = sub(player.position, enemy.position);
    const dist = distance(player.position, enemy.position);
    const dir = normalize(toPlayer);

    const hasLOS = lineOfSight(enemy.position, player.position, level);

    // Check for player detection in all states except attack
    if (enemy.state !== 'attack' && dist < enemy.definition.aggroRange && hasLOS) {
      enemy.state = 'chase';
      play('swing');
    }

    if (enemy.state === 'patrol') {
      // Check if waiting at waypoint
      if (enemy.waypointWaitTimer > 0) {
        // While waiting, slowly rotate to scan area
        enemy.patrolDirection += delta * 0.5;
      } else {
        // Move to current waypoint
        const waypoint = enemy.patrolWaypoints[enemy.currentWaypointIndex];
        const toWaypoint = sub(waypoint, enemy.position);
        const distToWaypoint = distance(waypoint, enemy.position);

        if (distToWaypoint < 0.5) {
          // Reached waypoint, wait and look around
          enemy.currentWaypointIndex = (enemy.currentWaypointIndex + 1) % enemy.patrolWaypoints.length;
          enemy.waypointWaitTimer = 1.0 + Math.random() * 1.5; // Wait 1-2.5 seconds
          enemy.patrolDirection = Math.random() * Math.PI * 2;
        } else {
          // Move toward waypoint
          const dirToWaypoint = normalize(toWaypoint);
          const velocity = scale(dirToWaypoint, enemy.definition.speed * 0.6);
          enemy.position = resolveMovement(enemy.position, velocity, delta, level);
          // Update patrol direction to face movement
          enemy.patrolDirection = Math.atan2(dirToWaypoint.y, dirToWaypoint.x);
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
        enemy.state = 'patrol';
        enemy.waypointWaitTimer = 0;
      }
    } else if (enemy.state === 'attack') {
      if (dist > 1.2) {
        enemy.state = hasLOS ? 'chase' : 'patrol';
      } else if (enemy.attackTimer <= 0) {
        damagePlayer(player, enemy.definition.damage);
        enemy.attackTimer = enemy.definition.attackCooldown;
        player.position = resolveMovement(player.position, scale(dir, -2), delta, level);
      }
    }
  }
}

function lineOfSight(start: Vec2, end: Vec2, level: LevelDefinition): boolean {
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

export function applyDamage(enemy: EnemyInstance, amount: number) {
  enemy.health -= amount;
  if (enemy.health <= 0) {
    enemy.alive = false;
  } else {
    enemy.hurtTimer = 0.3;
  }
}
