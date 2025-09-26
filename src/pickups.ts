import type { PickupDefinition, PickupInstance, PlayerState, Vec2 } from './types';
import { distance } from './math';
import { addAmmo, addArmor, healPlayer } from './player';
import { play } from './audio';

export function createPickup(definition: PickupDefinition, position: Vec2, id: number): PickupInstance {
  return {
    id,
    definition,
    position: { ...position },
    collected: false
  };
}

export function tryCollect(pickup: PickupInstance, player: PlayerState): boolean {
  if (pickup.collected) return false;
  if (distance(pickup.position, player.position) > 0.9) return false;
  applyPickup(pickup.definition, player);
  pickup.collected = true;
  play('pickup');
  return true;
}

export function applyPickup(definition: PickupDefinition, player: PlayerState) {
  switch (definition.type) {
    case 'health':
      healPlayer(player, definition.amount);
      break;
    case 'armor':
      addArmor(player, definition.amount);
      break;
    case 'ammo':
      addAmmo(player, definition.amount);
      break;
  }
}
