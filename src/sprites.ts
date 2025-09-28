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
  return createCanvas(128, 96, (ctx) => {
    ctx.clearRect(0, 0, 128, 96);

    // Wrist wraps with layered bands
    ctx.fillStyle = '#2a1c33';
    ctx.fillRect(10, 60, 46, 22);
    ctx.fillStyle = '#372646';
    ctx.fillRect(10, 60, 46, 8);
    ctx.fillStyle = '#45325a';
    ctx.fillRect(10, 70, 46, 6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(14, 64, 20, 3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(10, 78, 46, 4);

    // Palm and knuckle massing
    ctx.fillStyle = '#d39a63';
    ctx.beginPath();
    ctx.moveTo(20, 70);
    ctx.lineTo(94, 70);
    ctx.lineTo(114, 52);
    ctx.lineTo(112, 38);
    ctx.lineTo(96, 26);
    ctx.lineTo(74, 18);
    ctx.lineTo(40, 16);
    ctx.lineTo(24, 26);
    ctx.lineTo(14, 44);
    ctx.closePath();
    ctx.fill();

    // Thumb volume
    ctx.fillStyle = '#c2824f';
    ctx.beginPath();
    ctx.moveTo(24, 52);
    ctx.lineTo(42, 32);
    ctx.lineTo(58, 30);
    ctx.lineTo(62, 40);
    ctx.lineTo(50, 54);
    ctx.closePath();
    ctx.fill();

    // Finger planes
    const fingerColors = ['#e8b785', '#e0ac77', '#d89f69', '#cf955f'];
    for (let i = 0; i < 4; i++) {
      const baseX = 40 + i * 16;
      const height = 26 - i * 2;
      ctx.fillStyle = fingerColors[i];
      ctx.fillRect(baseX, 30, 14, height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(baseX, 30 + height - 4, 14, 4);
    }

    // Finger separation shadows
    ctx.strokeStyle = 'rgba(60, 32, 16, 0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(54, 30);
    ctx.lineTo(54, 60);
    ctx.moveTo(70, 30);
    ctx.lineTo(70, 64);
    ctx.moveTo(86, 30);
    ctx.lineTo(86, 62);
    ctx.stroke();

    // Highlight along knuckles
    ctx.fillStyle = 'rgba(255, 236, 210, 0.45)';
    ctx.beginPath();
    ctx.moveTo(36, 28);
    ctx.lineTo(104, 24);
    ctx.lineTo(98, 36);
    ctx.lineTo(38, 40);
    ctx.closePath();
    ctx.fill();

    // Crease accents
    ctx.strokeStyle = '#5c371c';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    const creaseStarts = [38, 56, 72, 90];
    for (const x of creaseStarts) {
      ctx.beginPath();
      ctx.moveTo(x, 52);
      ctx.lineTo(x + 8, 50);
      ctx.lineTo(x + 6, 58);
      ctx.stroke();
    }

    // Rim lighting on outside edge
    ctx.strokeStyle = 'rgba(255, 220, 180, 0.5)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(18, 66);
    ctx.lineTo(36, 34);
    ctx.lineTo(54, 22);
    ctx.lineTo(80, 20);
    ctx.lineTo(104, 30);
    ctx.stroke();

    // Bold outline to reinforce silhouette
    ctx.strokeStyle = '#221008';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(16, 72);
    ctx.lineTo(96, 72);
    ctx.lineTo(120, 52);
    ctx.lineTo(118, 32);
    ctx.lineTo(98, 18);
    ctx.lineTo(72, 12);
    ctx.lineTo(36, 12);
    ctx.lineTo(18, 24);
    ctx.lineTo(8, 46);
    ctx.closePath();
    ctx.stroke();
  });
}

function createPistolSprite(): HTMLCanvasElement {
  return createCanvas(140, 88, (ctx) => {
    ctx.clearRect(0, 0, 140, 88);

    // Under-barrel shadow to add depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.moveTo(18, 62);
    ctx.lineTo(108, 62);
    ctx.lineTo(118, 56);
    ctx.lineTo(118, 68);
    ctx.lineTo(28, 74);
    ctx.closePath();
    ctx.fill();

    // Frame silhouette with angular grip
    ctx.fillStyle = '#1a2538';
    ctx.beginPath();
    ctx.moveTo(14, 54);
    ctx.lineTo(102, 54);
    ctx.lineTo(128, 44);
    ctx.lineTo(128, 24);
    ctx.lineTo(90, 24);
    ctx.lineTo(90, 16);
    ctx.lineTo(50, 16);
    ctx.lineTo(46, 34);
    ctx.lineTo(30, 74);
    ctx.lineTo(20, 76);
    ctx.closePath();
    ctx.fill();

    // Slide mid-tone
    ctx.fillStyle = '#42506d';
    ctx.fillRect(32, 18, 74, 18);
    ctx.fillStyle = '#596a8d';
    ctx.fillRect(34, 18, 64, 10);

    // Barrel and muzzle details
    ctx.fillStyle = '#0d1523';
    ctx.fillRect(118, 28, 10, 10);
    ctx.fillStyle = '#8d9abd';
    ctx.fillRect(118, 24, 8, 6);

    ctx.fillStyle = '#9aa9c9';
    ctx.fillRect(40, 22, 6, 4);
    ctx.fillRect(56, 22, 6, 4);
    ctx.fillRect(72, 22, 6, 4);

    // Grip texture bands
    ctx.fillStyle = '#111722';
    ctx.beginPath();
    ctx.moveTo(36, 76);
    ctx.lineTo(52, 40);
    ctx.lineTo(58, 42);
    ctx.lineTo(66, 76);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#141b27';
    ctx.fillRect(40, 58, 22, 6);
    ctx.fillRect(38, 66, 24, 6);

    // Trigger guard with metallic accent
    ctx.strokeStyle = '#28344a';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(74, 54);
    ctx.lineTo(62, 68);
    ctx.lineTo(74, 78);
    ctx.stroke();

    ctx.strokeStyle = '#97a8d0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 62);
    ctx.lineTo(66, 68);
    ctx.stroke();

    // Top rail and ejection port highlight
    ctx.fillStyle = '#c1cae4';
    ctx.fillRect(34, 18, 56, 4);
    ctx.fillRect(62, 26, 12, 8);
    ctx.fillStyle = '#101520';
    ctx.fillRect(64, 28, 8, 4);

    // Edge lighting to separate silhouette
    ctx.strokeStyle = '#4c5e85';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(22, 76);
    ctx.lineTo(36, 48);
    ctx.lineTo(44, 20);
    ctx.lineTo(90, 14);
    ctx.lineTo(90, 18);
    ctx.lineTo(130, 18);
    ctx.stroke();

    // Outline for crisp pixel art
    ctx.strokeStyle = '#080b14';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(12, 56);
    ctx.lineTo(104, 56);
    ctx.lineTo(132, 44);
    ctx.lineTo(132, 20);
    ctx.lineTo(92, 20);
    ctx.lineTo(92, 14);
    ctx.lineTo(48, 14);
    ctx.lineTo(42, 36);
    ctx.lineTo(28, 76);
    ctx.lineTo(16, 78);
    ctx.closePath();
    ctx.stroke();
  });
}

function createKnifeSprite(): HTMLCanvasElement {
  return createCanvas(136, 84, (ctx) => {
    ctx.clearRect(0, 0, 136, 84);

    // Handle base with carved grip
    ctx.fillStyle = '#412a18';
    ctx.beginPath();
    ctx.moveTo(12, 56);
    ctx.lineTo(52, 56);
    ctx.lineTo(60, 64);
    ctx.lineTo(34, 74);
    ctx.lineTo(16, 70);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#6d4428';
    ctx.fillRect(18, 58, 26, 12);
    ctx.fillStyle = '#815233';
    ctx.fillRect(18, 58, 26, 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(18, 66, 26, 4);

    // Rivets
    ctx.fillStyle = '#c8d0dc';
    ctx.fillRect(24, 62, 4, 4);
    ctx.fillRect(34, 62, 4, 4);

    // Guard and bolster
    ctx.fillStyle = '#253344';
    ctx.fillRect(48, 48, 12, 18);
    ctx.fillStyle = '#3c5168';
    ctx.fillRect(48, 48, 12, 6);

    // Blade base layer
    ctx.fillStyle = '#cfd9e2';
    ctx.beginPath();
    ctx.moveTo(54, 28);
    ctx.lineTo(132, 16);
    ctx.lineTo(116, 60);
    ctx.lineTo(56, 54);
    ctx.closePath();
    ctx.fill();

    // Blade midtone for volume
    ctx.fillStyle = '#b4c2cf';
    ctx.beginPath();
    ctx.moveTo(60, 32);
    ctx.lineTo(120, 22);
    ctx.lineTo(108, 56);
    ctx.lineTo(62, 50);
    ctx.closePath();
    ctx.fill();

    // Cutting edge highlight
    ctx.fillStyle = '#f4f9ff';
    ctx.beginPath();
    ctx.moveTo(62, 28);
    ctx.lineTo(130, 18);
    ctx.lineTo(122, 40);
    ctx.lineTo(64, 42);
    ctx.closePath();
    ctx.fill();

    // Fuller groove and reflections
    ctx.strokeStyle = 'rgba(90, 112, 138, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(64, 36);
    ctx.lineTo(112, 28);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(66, 46);
    ctx.lineTo(110, 42);
    ctx.stroke();

    // Spine shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(58, 52);
    ctx.lineTo(122, 58);
    ctx.lineTo(118, 62);
    ctx.lineTo(58, 56);
    ctx.closePath();
    ctx.fill();

    // Blade outline
    ctx.strokeStyle = '#1a2532';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(52, 30);
    ctx.lineTo(134, 16);
    ctx.lineTo(118, 64);
    ctx.lineTo(52, 56);
    ctx.closePath();
    ctx.stroke();

    // Handle outline
    ctx.strokeStyle = '#120a04';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(10, 58);
    ctx.lineTo(52, 58);
    ctx.lineTo(64, 66);
    ctx.lineTo(34, 78);
    ctx.lineTo(12, 72);
    ctx.closePath();
    ctx.stroke();
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
