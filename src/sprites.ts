import type { WeaponType } from './types';

export interface SpriteAssets {
  textures: HTMLCanvasElement[];
  weapons: Record<WeaponType, HTMLCanvasElement>;
  enemies: Record<string, HTMLCanvasElement>;
  pickups: Record<string, HTMLCanvasElement>;
}

function createCanvas(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  ctx.imageSmoothingEnabled = false;
  draw(ctx);
  return canvas;
}

function createDungeonTexture(): HTMLCanvasElement {
  return createCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#262033';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = '#0f0a18';
    ctx.lineWidth = 4;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const offset = y % 2 === 0 ? (x * 16) : (x * 16 - 8);
        ctx.fillStyle = y % 2 === 0 ? '#42365a' : '#3a2e52';
        ctx.fillRect((offset + 64) % 64, y * 16, 20, 16);
        ctx.strokeRect((offset + 64) % 64 + 1, y * 16 + 1, 18, 14);
      }
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
    }
  });
}

function drawWeaponBase(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(10, 54);
  ctx.lineTo(54, 54);
  ctx.lineTo(40, 10);
  ctx.lineTo(24, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.fillRect(20, 28, 24, 6);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(18, 20, 28, 3);
}

function createFistSprite(): HTMLCanvasElement {
  return createCanvas(64, 64, (ctx) => {
    // Forearm base
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(16, 40, 32, 18);

    // Wrist wrap/bandage
    ctx.fillStyle = '#e8d8c8';
    ctx.fillRect(16, 38, 32, 6);
    ctx.fillStyle = '#d0c0b0';
    ctx.fillRect(18, 39, 28, 1);
    ctx.fillRect(18, 41, 28, 1);

    // Hand palm
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(18, 18, 28, 22);

    // Knuckles - more defined
    ctx.fillStyle = '#e8c9a1';
    ctx.fillRect(20, 18, 6, 8);
    ctx.fillRect(28, 16, 6, 8);
    ctx.fillRect(36, 18, 6, 8);

    // Knuckle highlights
    ctx.fillStyle = '#f2d8b8';
    ctx.fillRect(21, 19, 4, 2);
    ctx.fillRect(29, 17, 4, 2);
    ctx.fillRect(37, 19, 4, 2);

    // Knuckle shadows/definition
    ctx.fillStyle = '#9a6842';
    ctx.fillRect(20, 25, 6, 2);
    ctx.fillRect(28, 23, 6, 2);
    ctx.fillRect(36, 25, 6, 2);

    // Thumb
    ctx.fillStyle = '#c99574';
    ctx.fillRect(14, 28, 8, 14);
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(15, 30, 6, 10);

    // Fingers curled
    ctx.fillStyle = '#b88964';
    ctx.fillRect(22, 26, 5, 14);
    ctx.fillRect(29, 24, 5, 14);
    ctx.fillRect(36, 26, 5, 14);
    ctx.fillRect(43, 28, 4, 12);

    // Finger highlights
    ctx.fillStyle = '#c99574';
    ctx.fillRect(23, 27, 3, 4);
    ctx.fillRect(30, 25, 3, 4);
    ctx.fillRect(37, 27, 3, 4);

    // Palm lines/detail
    ctx.fillStyle = '#a87854';
    ctx.fillRect(24, 34, 16, 1);
    ctx.fillRect(26, 37, 12, 1);

    // Shadows for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(18, 38, 28, 2);
    ctx.fillRect(44, 30, 2, 10);
  });
}

function createPistolSprite(): HTMLCanvasElement {
  return createCanvas(64, 64, (ctx) => {
    // Grip - textured handle
    ctx.fillStyle = '#2a1f1a';
    ctx.fillRect(18, 42, 12, 18);
    ctx.fillStyle = '#3d2e26';
    ctx.fillRect(19, 43, 10, 16);

    // Grip texture lines
    ctx.fillStyle = '#2a1f1a';
    ctx.fillRect(19, 46, 10, 1);
    ctx.fillRect(19, 50, 10, 1);
    ctx.fillRect(19, 54, 10, 1);

    // Trigger guard
    ctx.fillStyle = '#556b85';
    ctx.fillRect(26, 44, 8, 2);
    ctx.fillRect(26, 44, 2, 10);
    ctx.fillRect(32, 44, 2, 10);
    ctx.fillRect(26, 52, 8, 2);

    // Trigger
    ctx.fillStyle = '#2a3644';
    ctx.fillRect(28, 48, 4, 4);

    // Lower receiver
    ctx.fillStyle = '#3a4c6e';
    ctx.fillRect(22, 34, 20, 10);

    // Magazine
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(24, 44, 8, 12);
    ctx.fillStyle = '#2a3644';
    ctx.fillRect(25, 45, 6, 10);

    // Upper receiver/frame
    ctx.fillStyle = '#4a5c7e';
    ctx.fillRect(22, 28, 24, 8);

    // Slide - main body
    ctx.fillStyle = '#556b85';
    ctx.fillRect(24, 20, 28, 10);

    // Slide serrations
    ctx.fillStyle = '#3a4c6e';
    ctx.fillRect(26, 21, 2, 8);
    ctx.fillRect(30, 21, 2, 8);
    ctx.fillRect(34, 21, 2, 8);

    // Barrel protruding
    ctx.fillStyle = '#2a3644';
    ctx.fillRect(50, 24, 10, 4);

    // Barrel opening
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(58, 25, 2, 2);

    // Front sight
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(54, 18, 3, 4);
    // Sight dot
    ctx.fillStyle = '#4afe4a';
    ctx.fillRect(55, 19, 1, 1);

    // Rear sight
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(26, 18, 4, 4);

    // Ejection port
    ctx.fillStyle = '#2a3644';
    ctx.fillRect(38, 22, 8, 4);
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(39, 23, 6, 2);

    // Metallic highlights
    ctx.fillStyle = '#8ba2d0';
    ctx.fillRect(25, 21, 24, 2);
    ctx.fillRect(51, 25, 6, 1);

    // Light reflection
    ctx.fillStyle = '#dfe8ff';
    ctx.fillRect(28, 21, 12, 1);
    ctx.fillRect(52, 25, 3, 1);

    // Shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(24, 28, 24, 2);
    ctx.fillRect(50, 27, 10, 1);
  });
}

function createKnifeSprite(): HTMLCanvasElement {
  return createCanvas(64, 64, (ctx) => {
    // Handle base - dark wood/polymer
    ctx.fillStyle = '#2a3a1f';
    ctx.fillRect(22, 42, 20, 18);

    // Handle grip texture
    ctx.fillStyle = '#445a2f';
    ctx.fillRect(23, 43, 18, 16);

    // Handle ridges for grip
    ctx.fillStyle = '#2a3a1f';
    ctx.fillRect(23, 45, 18, 1);
    ctx.fillRect(23, 48, 18, 1);
    ctx.fillRect(23, 51, 18, 1);
    ctx.fillRect(23, 54, 18, 1);

    // Pommel (bottom of handle)
    ctx.fillStyle = '#556b45';
    ctx.fillRect(24, 58, 16, 2);

    // Guard/crossguard
    ctx.fillStyle = '#6a8050';
    ctx.fillRect(18, 38, 28, 6);
    ctx.fillStyle = '#7a9560';
    ctx.fillRect(19, 39, 26, 3);

    // Blade base (fuller/groove)
    ctx.fillStyle = '#8a9a9a';
    ctx.fillRect(28, 10, 8, 30);

    // Main blade - steel
    ctx.fillStyle = '#b8c8d8';
    ctx.beginPath();
    ctx.moveTo(32, 4);
    ctx.lineTo(38, 10);
    ctx.lineTo(40, 38);
    ctx.lineTo(32, 40);
    ctx.lineTo(24, 38);
    ctx.lineTo(26, 10);
    ctx.closePath();
    ctx.fill();

    // Blade edge - sharp side
    ctx.fillStyle = '#e8f0f8';
    ctx.beginPath();
    ctx.moveTo(32, 5);
    ctx.lineTo(37, 10);
    ctx.lineTo(39, 38);
    ctx.lineTo(32, 39);
    ctx.closePath();
    ctx.fill();

    // Blade tip point
    ctx.fillStyle = '#d8e8f0';
    ctx.beginPath();
    ctx.moveTo(32, 4);
    ctx.lineTo(36, 8);
    ctx.lineTo(32, 10);
    ctx.lineTo(28, 8);
    ctx.closePath();
    ctx.fill();

    // Fuller (blood groove) detail
    ctx.fillStyle = '#7a8a9a';
    ctx.fillRect(30, 12, 4, 24);

    // Blade shine/reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(33, 8, 2, 26);
    ctx.fillRect(34, 6, 1, 4);

    // Edge highlight (sharp)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(37, 11, 1, 26);

    // Shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(24, 38, 16, 2);
    ctx.fillRect(28, 38, 8, 4);
  });
}

function createGruntSprite(): HTMLCanvasElement {
  return createCanvas(48, 64, (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // MASSIVE LEGS - thick and imposing
    ctx.fillStyle = '#8b0000'; // Dark red
    ctx.fillRect(6, 42, 16, 22);
    ctx.fillRect(26, 42, 16, 22);

    // Leg highlights - bright red
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(8, 44, 4, 18);
    ctx.fillRect(28, 44, 4, 18);

    // HUGE TORSO - demonic body
    ctx.fillStyle = '#a00000'; // Bright crimson
    ctx.fillRect(4, 20, 40, 26);

    // Chest plate - GLOWING ORANGE
    ctx.fillStyle = '#ff4500'; // Orange-red
    ctx.fillRect(10, 24, 28, 18);

    // Glowing core in center
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(18, 28, 12, 10);
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(20, 30, 8, 6);
    ctx.fillStyle = '#ffaa00'; // Bright yellow-orange center
    ctx.fillRect(22, 32, 4, 2);

    // MASSIVE SHOULDERS
    ctx.fillStyle = '#700000';
    ctx.fillRect(2, 18, 12, 10);
    ctx.fillRect(34, 18, 12, 10);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(4, 20, 8, 6);
    ctx.fillRect(36, 20, 8, 6);

    // DEMON HEAD - large and menacing
    ctx.fillStyle = '#600000'; // Very dark red
    ctx.fillRect(12, 4, 24, 18);

    // HUGE HORNS
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(10, 2, 4, 8);
    ctx.fillRect(34, 2, 4, 8);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(11, 3, 2, 6);
    ctx.fillRect(35, 3, 2, 6);

    // MASSIVE GLOWING EYES - super bright
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(16, 10, 6, 6);
    ctx.fillRect(26, 10, 6, 6);
    // Inner glow
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(17, 11, 4, 4);
    ctx.fillRect(27, 11, 4, 4);
    // Brightest center
    ctx.fillStyle = '#ffff00'; // BRIGHT YELLOW
    ctx.fillRect(18, 12, 2, 2);
    ctx.fillRect(28, 12, 2, 2);

    // FANGED MOUTH - open and threatening
    ctx.fillStyle = '#000000';
    ctx.fillRect(18, 16, 12, 5);
    // Sharp teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(19, 16, 2, 3);
    ctx.fillRect(22, 16, 2, 3);
    ctx.fillRect(25, 16, 2, 3);
    ctx.fillRect(28, 16, 2, 3);
    ctx.fillRect(20, 18, 2, 3);
    ctx.fillRect(26, 18, 2, 3);

    // Clawed hands/arms extending from sides
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(0, 26, 6, 12);
    ctx.fillRect(42, 26, 6, 12);
    // Claws
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 36, 2, 4);
    ctx.fillRect(2, 36, 2, 4);
    ctx.fillRect(46, 36, 2, 4);

    // Metallic armor details - BRIGHT
    ctx.fillStyle = '#ffcc00'; // Gold accents
    ctx.fillRect(12, 22, 24, 2);
    ctx.fillRect(16, 44, 16, 2);

    // Edge glow effect
    ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
    ctx.fillRect(6, 22, 2, 22);
    ctx.fillRect(40, 22, 2, 22);
  });
}

function drawPickupShadow(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(ctx.canvas.width / 2, ctx.canvas.height - 8, ctx.canvas.width / 2.6, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function createHealthPickupSprite(): HTMLCanvasElement {
  return createCanvas(48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    drawPickupShadow(ctx);

    // Outer glow
    ctx.fillStyle = 'rgba(242, 95, 107, 0.3)';
    ctx.fillRect(8, 2, 32, 34);

    // Main med kit body
    ctx.fillStyle = '#d62839';
    ctx.fillRect(12, 6, 24, 26);

    // Border highlight
    ctx.strokeStyle = '#ff6b7a';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 6, 24, 26);

    // Metallic clasp top
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(20, 5, 8, 3);

    // White cross - vertical
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, 10, 4, 16);
    // White cross - horizontal
    ctx.fillRect(16, 16, 16, 4);

    // Cross shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(22, 24, 4, 2);
    ctx.fillRect(29, 18, 3, 2);

    // Shine/reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(14, 8, 8, 3);

    // Bottom shading
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(12, 28, 24, 4);

    // Corner details
    ctx.fillStyle = '#a01f29';
    ctx.fillRect(12, 6, 3, 3);
    ctx.fillRect(33, 6, 3, 3);
    ctx.fillRect(12, 29, 3, 3);
    ctx.fillRect(33, 29, 3, 3);
  });
}

function createAmmoPickupSprite(): HTMLCanvasElement {
  return createCanvas(48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    drawPickupShadow(ctx);

    // Outer glow
    ctx.fillStyle = 'rgba(252, 231, 162, 0.25)';
    ctx.fillRect(4, 6, 40, 30);

    // Ammo crate body
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(8, 10, 32, 22);

    // Wood grain texture
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(9, 11, 30, 1);
    ctx.fillRect(9, 16, 30, 1);
    ctx.fillRect(9, 21, 30, 1);
    ctx.fillRect(9, 26, 30, 1);

    // Border/edge
    ctx.strokeStyle = '#8a7a6a';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 10, 32, 22);

    // Metal bands
    ctx.fillStyle = '#6a6a6a';
    ctx.fillRect(8, 14, 32, 2);
    ctx.fillRect(8, 24, 32, 2);

    // Bottom darker section
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(8, 28, 32, 4);

    // Bullets standing in crate
    for (let i = 0; i < 3; i++) {
      const x = 13 + i * 10;

      // Bullet casing
      ctx.fillStyle = '#d4a654';
      ctx.fillRect(x, 12, 6, 14);

      // Casing highlight
      ctx.fillStyle = '#f6d77a';
      ctx.fillRect(x + 1, 13, 2, 12);

      // Bullet base
      ctx.fillStyle = '#b08844';
      ctx.fillRect(x, 22, 6, 4);

      // Bullet tip (projectile)
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x + 3, 6);
      ctx.lineTo(x + 6, 12);
      ctx.closePath();
      ctx.fillStyle = '#8a7a6a';
      ctx.fill();

      // Bullet tip shine
      ctx.fillStyle = '#fce7a2';
      ctx.fillRect(x + 2, 8, 2, 3);

      // Shadow under bullet
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x, 25, 6, 1);
    }

    // Crate highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(10, 11, 14, 2);

    // Crate corner rivets
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(10, 12, 2, 2);
    ctx.fillRect(36, 12, 2, 2);
    ctx.fillRect(10, 28, 2, 2);
    ctx.fillRect(36, 28, 2, 2);
  });
}

function createArmorPickupSprite(): HTMLCanvasElement {
  return createCanvas(48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    drawPickupShadow(ctx);

    // Outer glow
    ctx.fillStyle = 'rgba(111, 177, 211, 0.3)';
    ctx.beginPath();
    ctx.moveTo(8, 6);
    ctx.lineTo(40, 6);
    ctx.lineTo(38, 28);
    ctx.lineTo(36, 38);
    ctx.lineTo(24, 42);
    ctx.lineTo(12, 38);
    ctx.lineTo(10, 28);
    ctx.closePath();
    ctx.fill();

    // Main shield body - darker base
    ctx.beginPath();
    ctx.moveTo(12, 8);
    ctx.lineTo(36, 8);
    ctx.lineTo(34, 26);
    ctx.lineTo(32, 34);
    ctx.lineTo(24, 38);
    ctx.lineTo(16, 34);
    ctx.lineTo(14, 26);
    ctx.closePath();
    ctx.fillStyle = '#2d5f7f';
    ctx.fill();

    // Shield border/edge
    ctx.strokeStyle = '#1d3f5f';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner shield face - lighter blue
    ctx.fillStyle = '#4a8fb8';
    ctx.beginPath();
    ctx.moveTo(16, 12);
    ctx.lineTo(32, 12);
    ctx.lineTo(30, 26);
    ctx.lineTo(28, 32);
    ctx.lineTo(24, 34);
    ctx.lineTo(20, 32);
    ctx.lineTo(18, 26);
    ctx.closePath();
    ctx.fill();

    // Highlight/shine on shield
    ctx.fillStyle = '#7db9d8';
    ctx.beginPath();
    ctx.moveTo(18, 14);
    ctx.lineTo(30, 14);
    ctx.lineTo(28, 24);
    ctx.lineTo(24, 26);
    ctx.lineTo(20, 24);
    ctx.closePath();
    ctx.fill();

    // Central emblem/cross
    ctx.fillStyle = '#e8f0f8';
    ctx.fillRect(23, 16, 2, 12);
    ctx.fillRect(19, 21, 10, 2);

    // Side reinforcement plates
    ctx.fillStyle = '#1d4f6f';
    ctx.fillRect(14, 20, 4, 10);
    ctx.fillRect(30, 20, 4, 10);

    // Plate highlights
    ctx.fillStyle = '#3d6f8f';
    ctx.fillRect(14, 20, 2, 8);
    ctx.fillRect(30, 20, 2, 8);

    // Top rim shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(18, 10, 12, 2);

    // Bottom shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(20, 32, 8, 3);

    // Decorative rivets
    ctx.fillStyle = '#9ac0d8';
    ctx.fillRect(22, 12, 1, 1);
    ctx.fillRect(25, 12, 1, 1);
    ctx.fillRect(20, 18, 1, 1);
    ctx.fillRect(27, 18, 1, 1);
    ctx.fillRect(20, 24, 1, 1);
    ctx.fillRect(27, 24, 1, 1);
  });
}

export async function loadAssets(): Promise<SpriteAssets> {
  const textures = [createDungeonTexture()];
  const weapons = {
    punch: createFistSprite(),
    pistol: createPistolSprite(),
    knife: createKnifeSprite()
  };
  const enemies = {
    grunt: createGruntSprite()
  };
  const pickups = {
    health: createHealthPickupSprite(),
    armor: createArmorPickupSprite(),
    ammo: createAmmoPickupSprite()
  };
  return { textures, weapons, enemies, pickups };
}
