import type { LevelDefinition } from './types';

// Enhanced map with distinct rooms and hallways
// Layout:
// - Spawn Room (top-left)
// - Armory (top-right)
// - Medical Bay (bottom-left)
// - Central Courtyard (middle)
// - Security Room (bottom-right)
// - Storage Room (middle-left)
// - Command Center (middle-right)
const mapRows = [
  '11111111111111111111111111111',
  '10000000111100000000000000001',
  '10000000111100000000000000001', // Spawn Room
  '10000000000000000000000000001',
  '10000000111111110001111111101',
  '11100011100000000000000000001',
  '11100011100000000000000000001', // Armory
  '11100000000000000001111111101',
  '11100111111001111111100000001',
  '10000100000000000000000000001',
  '10000100000000000000000000001', // Storage
  '10000100000001111000111111001',
  '10000111110001000000100000001',
  '10000000000001000000100000001', // Central Courtyard
  '10000000000001000000100000001',
  '10000000000001000000100000001',
  '11110111100001111111100000001',
  '10000000000000000000111110001',
  '10000000000000000000000000001', // Medical Bay
  '10000000000000000000000000001',
  '11111111000111110001111110001',
  '10000000000000000000000000001',
  '10000000000000000000000000001', // Command Center
  '10000000000000000000000000001',
  '11111100001111000011111111001',
  '10000000000000000000000000001',
  '10000000000000000000000000001', // Security Room
  '10000000000000000000000000001',
  '11111111111111111111111111111'
];

export const level1: LevelDefinition = {
  width: mapRows[0].length,
  height: mapRows.length,
  tiles: mapRows.flatMap((row) => row.split('').map((cell) => Number(cell))),
  textureLookup: [0, 0],
  playerStart: { x: 3.5, y: 2.5 }, // Spawn room
  enemies: [
    { position: { x: 24.5, y: 5.5 }, type: 'grunt' },  // Armory guard
    { position: { x: 14.5, y: 14.5 }, type: 'grunt' }, // Courtyard patrol
    { position: { x: 5.5, y: 10.5 }, type: 'grunt' },  // Storage guard
    { position: { x: 24.5, y: 22.5 }, type: 'grunt' }, // Command center guard
    { position: { x: 5.5, y: 19.5 }, type: 'grunt' },  // Medical bay guard
    { position: { x: 14.5, y: 26.5 }, type: 'grunt' }  // Security room guard
  ],
  pickups: [
    { position: { x: 6.5, y: 2.5 }, type: 'ammo' },     // Spawn room
    { position: { x: 25.5, y: 2.5 }, type: 'ammo' },    // Armory
    { position: { x: 26.5, y: 6.5 }, type: 'ammo' },    // Armory
    { position: { x: 3.5, y: 19.5 }, type: 'health' },  // Medical bay
    { position: { x: 8.5, y: 18.5 }, type: 'health' },  // Medical bay
    { position: { x: 14.5, y: 13.5 }, type: 'armor' },  // Courtyard center
    { position: { x: 3.5, y: 10.5 }, type: 'armor' },   // Storage room
    { position: { x: 22.5, y: 23.5 }, type: 'health' }, // Command center
    { position: { x: 10.5, y: 26.5 }, type: 'ammo' }    // Security room
  ]
};
