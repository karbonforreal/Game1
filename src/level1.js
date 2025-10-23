const mapRows = [
  '111111111111111111111111',
  '100000011000000110000001',
  '100000011000000110000001',
  '100000000000000000000001',
  '100000000000000000000001',
  '100000011000000110000001',
  '100000011000000110000001',
  '111001100110011001100111',
  '111001100110011001100111',
  '100000011000000110000001',
  '100000011000000110000001',
  '100000000000000000000001',
  '100000000000000000000001',
  '100000011000000110000001',
  '100000011000000110000001',
  '111111111111111111111111'
];

export const level1 = {
  width: mapRows[0].length,
  height: mapRows.length,
  tiles: mapRows.flatMap((row) => row.split('').map((cell) => Number(cell))),
  textureLookup: [0, 0],
  playerStart: { x: 12.5, y: 12.5 },
  enemies: [
    { position: { x: 4.5, y: 4.5 }, type: 'grunt' },
    { position: { x: 12.5, y: 4.5 }, type: 'grunt' },
    { position: { x: 20.5, y: 4.5 }, type: 'grunt' },
    { position: { x: 4.5, y: 12.5 }, type: 'grunt' },
    { position: { x: 12.5, y: 12.5 }, type: 'grunt' },
    { position: { x: 20.5, y: 12.5 }, type: 'grunt' }
  ],
  pickups: [
    { position: { x: 12.5, y: 8.5 }, type: 'armor' },
    { position: { x: 4.5, y: 8.5 }, type: 'ammo' },
    { position: { x: 20.5, y: 8.5 }, type: 'ammo' },
    { position: { x: 8.5, y: 12.5 }, type: 'health' },
    { position: { x: 16.5, y: 12.5 }, type: 'health' }
  ]
};
