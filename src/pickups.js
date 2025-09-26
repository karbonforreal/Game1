import { distance } from './math.js';
import { addAmmo, addArmor, healPlayer } from './player.js';
import { play } from './audio.js';

export function createPickup(definition, position, id) {
  return {
    id,
    definition,
    position: { ...position },
    collected: false
  };
}

export function tryCollect(pickup, player) {
  if (pickup.collected) return false;
  if (distance(pickup.position, player.position) > 0.9) return false;
  applyPickup(pickup.definition, player);
  pickup.collected = true;
  play('pickup');
  return true;
}

export function applyPickup(definition, player) {
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
