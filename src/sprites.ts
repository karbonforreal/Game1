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
    drawWeaponBase(ctx, '#c98f63');
    ctx.fillStyle = '#f2c9a1';
    ctx.beginPath();
    ctx.moveTo(28, 12);
    ctx.lineTo(36, 12);
    ctx.lineTo(50, 44);
    ctx.lineTo(14, 44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#9a6842';
    ctx.fillRect(22, 28, 20, 8);
  });
}

function createPistolSprite(): HTMLCanvasElement {
  return createCanvas(64, 64, (ctx) => {
    drawWeaponBase(ctx, '#3a4c6e');
    ctx.fillStyle = '#1b2536';
    ctx.fillRect(22, 24, 28, 16);
    ctx.fillStyle = '#8ba2d0';
    ctx.fillRect(24, 20, 24, 6);
    ctx.fillStyle = '#dfe8ff';
    ctx.fillRect(30, 22, 10, 2);
  });
}

function createKnifeSprite(): HTMLCanvasElement {
  return createCanvas(64, 64, (ctx) => {
    drawWeaponBase(ctx, '#556b2f');
    ctx.fillStyle = '#9dbb75';
    ctx.fillRect(28, 12, 8, 24);
    ctx.fillStyle = '#d8e4c2';
    ctx.beginPath();
    ctx.moveTo(32, 8);
    ctx.lineTo(44, 40);
    ctx.lineTo(20, 40);
    ctx.closePath();
    ctx.fill();
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
