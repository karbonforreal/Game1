import type { LevelDefinition } from './types';

const mapRows = [
  '1111111111111111111111',
  '1000000100000010000001',
  '1000000100000010000001',
  '1000000100000010000001',
  '1000000000000000000001',
  '1000000000000000000001',
  '1000000100000010000001',
  '1111001111100111110011',
  '1000000100000010000001',
  '1000000100000010000001',
  '1000000100000010000001',
  '1000000000000000000001',
  '1000000000000000000001',
  '1000000100000010000001',
  '1111111111111111111111'
];

export const level1: LevelDefinition = {
  width: mapRows[0].length,
  height: mapRows.length,
  tiles: mapRows.flatMap((row) => row.split('').map((cell) => Number(cell))),
  textureLookup: [0, 0],
  playerStart: { x: 11.5, y: 7.5 },
  enemies: [
    { position: { x: 4.5, y: 4.5 }, type: 'grunt' },
    { position: { x: 11.5, y: 4.5 }, type: 'grunt' },
    { position: { x: 18.5, y: 4.5 }, type: 'grunt' },
    { position: { x: 4.5, y: 11.5 }, type: 'grunt' },
    { position: { x: 11.5, y: 11.5 }, type: 'grunt' },
    { position: { x: 18.5, y: 11.5 }, type: 'grunt' }
  ],
  pickups: [
    { position: { x: 7.5, y: 4.5 }, type: 'ammo' },
    { position: { x: 15.5, y: 4.5 }, type: 'armor' },
    { position: { x: 7.5, y: 11.5 }, type: 'health' },
    { position: { x: 15.5, y: 11.5 }, type: 'ammo' },
    { position: { x: 11.5, y: 9.5 }, type: 'health' }
  ]
};
