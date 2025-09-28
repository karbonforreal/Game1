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

function createFistSprite(): HTMLCanvasElement {
  return createCanvas(112, 72, (ctx) => {
    ctx.clearRect(0, 0, 112, 72);

    // Wrist wrap
    ctx.fillStyle = '#2d243a';
    ctx.fillRect(12, 44, 46, 20);
    ctx.fillStyle = '#3b3050';
    ctx.fillRect(12, 44, 46, 6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(16, 46, 18, 3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(12, 58, 46, 6);

    // Main fist volume
    ctx.fillStyle = '#c78d5e';
    ctx.beginPath();
    ctx.moveTo(20, 52);
    ctx.lineTo(84, 52);
    ctx.lineTo(102, 38);
    ctx.lineTo(98, 24);
    ctx.lineTo(82, 14);
    ctx.lineTo(48, 10);
    ctx.lineTo(30, 14);
    ctx.lineTo(16, 26);
    ctx.closePath();
    ctx.fill();

    // Palm shading
    ctx.fillStyle = '#9d653c';
    ctx.beginPath();
    ctx.moveTo(24, 48);
    ctx.lineTo(68, 44);
    ctx.lineTo(84, 32);
    ctx.lineTo(78, 20);
    ctx.lineTo(60, 18);
    ctx.lineTo(36, 24);
    ctx.lineTo(24, 34);
    ctx.closePath();
    ctx.fill();

    // Knuckle highlights
    ctx.fillStyle = '#f2c9a1';
    for (let i = 0; i < 4; i++) {
      const offset = 28 + i * 12;
      ctx.fillRect(offset, 20, 10, 6);
      ctx.fillRect(offset - 2, 26, 12, 4);
    }

    // Subtle rim lighting
    ctx.fillStyle = 'rgba(255, 238, 210, 0.25)';
    ctx.beginPath();
    ctx.moveTo(18, 42);
    ctx.lineTo(34, 24);
    ctx.lineTo(52, 18);
    ctx.lineTo(68, 20);
    ctx.lineTo(76, 28);
    ctx.lineTo(68, 36);
    ctx.lineTo(34, 44);
    ctx.closePath();
    ctx.fill();

    // Knuckle creases
    ctx.strokeStyle = '#5d361a';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    for (let i = 0; i < 4; i++) {
      const startX = 30 + i * 12;
      ctx.beginPath();
      ctx.moveTo(startX, 34);
      ctx.lineTo(startX + 8, 34);
      ctx.lineTo(startX + 6, 40);
      ctx.stroke();
    }

    // Outline
    ctx.strokeStyle = '#2a1609';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(18, 52);
    ctx.lineTo(84, 52);
    ctx.lineTo(104, 38);
    ctx.lineTo(100, 20);
    ctx.lineTo(82, 10);
    ctx.lineTo(48, 6);
    ctx.lineTo(26, 12);
    ctx.lineTo(12, 26);
    ctx.closePath();
    ctx.stroke();
  });
}

function createPistolSprite(): HTMLCanvasElement {
  return createCanvas(128, 64, (ctx) => {
    ctx.clearRect(0, 0, 128, 64);

    // Pistol frame silhouette
    ctx.fillStyle = '#1c2337';
    ctx.beginPath();
    ctx.moveTo(12, 40);
    ctx.lineTo(92, 40);
    ctx.lineTo(118, 30);
    ctx.lineTo(118, 20);
    ctx.lineTo(70, 20);
    ctx.lineTo(70, 14);
    ctx.lineTo(40, 14);
    ctx.lineTo(36, 34);
    ctx.lineTo(26, 52);
    ctx.lineTo(18, 54);
    ctx.closePath();
    ctx.fill();

    // Grip shading
    ctx.fillStyle = '#101524';
    ctx.beginPath();
    ctx.moveTo(28, 52);
    ctx.lineTo(40, 30);
    ctx.lineTo(46, 30);
    ctx.lineTo(52, 52);
    ctx.closePath();
    ctx.fill();

    // Slide highlight
    ctx.fillStyle = '#5a6d95';
    ctx.fillRect(26, 18, 64, 12);
    ctx.fillStyle = '#8293bd';
    ctx.fillRect(28, 18, 56, 6);

    // Barrel muzzle detail
    ctx.fillStyle = '#0d111c';
    ctx.fillRect(112, 24, 8, 8);
    ctx.fillStyle = '#9aa6c8';
    ctx.fillRect(112, 22, 6, 4);

    // Trigger guard and trigger
    ctx.strokeStyle = '#2e3b57';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(58, 40);
    ctx.lineTo(48, 50);
    ctx.lineTo(56, 56);
    ctx.stroke();

    ctx.strokeStyle = '#9aa6c8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(54, 46);
    ctx.lineTo(50, 50);
    ctx.stroke();

    // Top venting and screws
    ctx.fillStyle = '#b6c2e4';
    ctx.fillRect(36, 20, 8, 3);
    ctx.fillRect(60, 20, 8, 3);
    ctx.fillRect(82, 20, 8, 3);
    ctx.fillStyle = '#0d111c';
    ctx.fillRect(40, 24, 2, 4);
    ctx.fillRect(64, 24, 2, 4);
    ctx.fillRect(86, 24, 2, 4);

    // Edge lighting
    ctx.strokeStyle = '#4c5d86';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(18, 54);
    ctx.lineTo(30, 32);
    ctx.lineTo(36, 14);
    ctx.lineTo(70, 14);
    ctx.lineTo(70, 18);
    ctx.lineTo(118, 18);
    ctx.stroke();

    // Underside shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(16, 40, 88, 6);
    ctx.fillRect(26, 48, 32, 12);
  });
}

function createKnifeSprite(): HTMLCanvasElement {
  return createCanvas(120, 72, (ctx) => {
    ctx.clearRect(0, 0, 120, 72);

    // Handle core
    ctx.fillStyle = '#4a2f1c';
    ctx.beginPath();
    ctx.moveTo(12, 44);
    ctx.lineTo(44, 44);
    ctx.lineTo(54, 52);
    ctx.lineTo(30, 60);
    ctx.lineTo(14, 56);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7a4b28';
    ctx.fillRect(14, 46, 24, 10);
    ctx.fillStyle = 'rgba(255, 220, 180, 0.2)';
    ctx.fillRect(18, 48, 18, 4);

    // Guard
    ctx.fillStyle = '#2c3b4e';
    ctx.fillRect(40, 40, 10, 12);
    ctx.fillStyle = '#4e6580';
    ctx.fillRect(40, 40, 10, 4);

    // Blade base tone
    ctx.fillStyle = '#d5e0e7';
    ctx.beginPath();
    ctx.moveTo(44, 22);
    ctx.lineTo(112, 12);
    ctx.lineTo(102, 50);
    ctx.lineTo(46, 48);
    ctx.closePath();
    ctx.fill();

    // Blade midtone
    ctx.fillStyle = '#b1c1cf';
    ctx.beginPath();
    ctx.moveTo(50, 28);
    ctx.lineTo(102, 18);
    ctx.lineTo(94, 46);
    ctx.lineTo(52, 44);
    ctx.closePath();
    ctx.fill();

    // Blade edge highlight
    ctx.fillStyle = '#f3f8ff';
    ctx.beginPath();
    ctx.moveTo(52, 26);
    ctx.lineTo(110, 14);
    ctx.lineTo(104, 36);
    ctx.lineTo(54, 38);
    ctx.closePath();
    ctx.fill();

    // Fuller line
    ctx.strokeStyle = 'rgba(80, 104, 128, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(52, 32);
    ctx.lineTo(96, 26);
    ctx.stroke();

    // Edge outline
    ctx.strokeStyle = '#27303f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(44, 22);
    ctx.lineTo(112, 12);
    ctx.lineTo(100, 52);
    ctx.lineTo(44, 50);
    ctx.closePath();
    ctx.stroke();

    // Handle rivets
    ctx.fillStyle = '#c0c9d6';
    ctx.fillRect(20, 50, 4, 4);
    ctx.fillRect(30, 50, 4, 4);
  });
}

function createGruntSprite(): HTMLCanvasElement {
  return createCanvas(48, 64, (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#201629';
    ctx.fillRect(0, 16, 48, 48);
    ctx.fillStyle = '#684a7a';
    ctx.fillRect(12, 24, 24, 32);
    ctx.fillStyle = '#c9a37a';
    ctx.fillRect(16, 8, 16, 20);
    ctx.fillStyle = '#000';
    ctx.fillRect(18, 16, 4, 4);
    ctx.fillRect(26, 16, 4, 4);
    ctx.fillStyle = '#c94c4c';
    ctx.fillRect(20, 24, 8, 4);
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

    ctx.fillStyle = '#b3202a';
    ctx.fillRect(12, 6, 24, 26);
    ctx.strokeStyle = '#f25f6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 6, 24, 26);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, 12, 4, 14);
    ctx.fillRect(16, 18, 16, 4);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(14, 8, 10, 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(12, 26, 24, 6);
  });
}

function createAmmoPickupSprite(): HTMLCanvasElement {
  return createCanvas(48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    drawPickupShadow(ctx);

    ctx.fillStyle = '#4a4034';
    ctx.fillRect(8, 10, 32, 22);
    ctx.strokeStyle = '#a08f75';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 10, 32, 22);

    ctx.fillStyle = '#2f271f';
    ctx.fillRect(8, 26, 32, 6);

    for (let i = 0; i < 3; i++) {
      const x = 13 + i * 10;
      ctx.fillStyle = '#f6d77a';
      ctx.fillRect(x, 12, 6, 16);
      ctx.fillStyle = '#d9b76e';
      ctx.fillRect(x, 22, 6, 6);
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x + 3, 6);
      ctx.lineTo(x + 6, 12);
      ctx.closePath();
      ctx.fillStyle = '#fce7a2';
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(x, 22, 6, 1);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(10, 12, 12, 4);
  });
}

function createArmorPickupSprite(): HTMLCanvasElement {
  return createCanvas(48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    drawPickupShadow(ctx);

    ctx.beginPath();
    ctx.moveTo(12, 8);
    ctx.lineTo(36, 8);
    ctx.lineTo(34, 26);
    ctx.lineTo(32, 34);
    ctx.lineTo(24, 38);
    ctx.lineTo(16, 34);
    ctx.lineTo(14, 26);
    ctx.closePath();
    ctx.fillStyle = '#3d7ea6';
    ctx.fill();
    ctx.strokeStyle = '#1d4258';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#6fb1d3';
    ctx.beginPath();
    ctx.moveTo(16, 12);
    ctx.lineTo(32, 12);
    ctx.lineTo(30, 26);
    ctx.lineTo(24, 30);
    ctx.lineTo(18, 26);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2a5c78';
    ctx.fillRect(14, 20, 4, 10);
    ctx.fillRect(30, 20, 4, 10);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(20, 10, 10, 3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(16, 30, 16, 3);
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
