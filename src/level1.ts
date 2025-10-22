import type { LevelDefinition } from './types';

// Simple 6-room layout with clear doors
// Layout: 2x3 grid
// [Room 1 - Spawn] [Door] [Room 2 - Armory]
//      [Door]              [Door]
// [Room 3 - Storage] [Door] [Room 4 - Central]
//      [Door]              [Door]
// [Room 5 - Medical] [Door] [Room 6 - Command]
const mapRows = [
  '1111111111111111111111111',
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1000000000001000000000001', // Room 1 (Spawn)
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1000000000000000000000001',
  '1111111000111111111111111',
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1000000000001000000000001', // Room 3 (Storage) | Room 4 (Central)
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1000000000000000000000001',
  '1111111000111111111111111',
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1000000000001000000000001', // Room 5 (Medical) | Room 6 (Command)
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1000000000001000000000001',
  '1111111111111111111111111'
];

export const level1: LevelDefinition = {
  width: mapRows[0].length,
  height: mapRows.length,
  tiles: mapRows.flatMap((row) => row.split('').map((cell) => Number(cell))),
  textureLookup: [0, 0],
  playerStart: { x: 4.5, y: 3.5 }, // Room 1 - Spawn
  enemies: [
    // Room 1 - Spawn
    { position: { x: 8.5, y: 4.5 }, type: 'grunt' },
    // Room 2 - Armory
    { position: { x: 18.5, y: 4.5 }, type: 'grunt' },
    { position: { x: 21.5, y: 5.5 }, type: 'grunt' },
    // Room 3 - Storage
    { position: { x: 5.5, y: 11.5 }, type: 'grunt' },
    { position: { x: 9.5, y: 13.5 }, type: 'grunt' },
    // Room 4 - Central
    { position: { x: 16.5, y: 11.5 }, type: 'grunt' },
    { position: { x: 20.5, y: 13.5 }, type: 'grunt' },
    // Room 5 - Medical
    { position: { x: 5.5, y: 19.5 }, type: 'grunt' },
    { position: { x: 8.5, y: 21.5 }, type: 'grunt' },
    // Room 6 - Command
    { position: { x: 17.5, y: 19.5 }, type: 'grunt' },
    { position: { x: 20.5, y: 20.5 }, type: 'grunt' },
    { position: { x: 18.5, y: 22.5 }, type: 'grunt' }
  ],
  pickups: [
    // Room 1 - Spawn
    { position: { x: 3.5, y: 3.5 }, type: 'ammo' },
    { position: { x: 9.5, y: 5.5 }, type: 'ammo' },
    // Room 2 - Armory
    { position: { x: 15.5, y: 3.5 }, type: 'ammo' },
    { position: { x: 19.5, y: 3.5 }, type: 'ammo' },
    { position: { x: 22.5, y: 4.5 }, type: 'ammo' },
    { position: { x: 17.5, y: 6.5 }, type: 'ammo' },
    // Room 3 - Storage
    { position: { x: 3.5, y: 11.5 }, type: 'armor' },
    { position: { x: 8.5, y: 10.5 }, type: 'ammo' },
    { position: { x: 10.5, y: 13.5 }, type: 'ammo' },
    // Room 4 - Central
    { position: { x: 18.5, y: 11.5 }, type: 'armor' },
    { position: { x: 21.5, y: 12.5 }, type: 'ammo' },
    // Room 5 - Medical
    { position: { x: 3.5, y: 19.5 }, type: 'health' },
    { position: { x: 7.5, y: 19.5 }, type: 'health' },
    { position: { x: 5.5, y: 22.5 }, type: 'health' },
    // Room 6 - Command
    { position: { x: 22.5, y: 20.5 }, type: 'health' },
    { position: { x: 19.5, y: 22.5 }, type: 'ammo' }
  ]
};
