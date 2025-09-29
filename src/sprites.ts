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
  const width = 168;
  const height = 128;
  return createCanvas(width, height, (ctx) => {
    ctx.clearRect(0, 0, width, height);

    const wristWrap = ctx.createLinearGradient(0, height, 0, height * 0.55);
    wristWrap.addColorStop(0, '#4d2d1f');
    wristWrap.addColorStop(0.4, '#6d3a26');
    wristWrap.addColorStop(1, '#8a4c30');
    ctx.fillStyle = wristWrap;
    ctx.beginPath();
    ctx.moveTo(16, height - 18);
    ctx.lineTo(86, height - 2);
    ctx.lineTo(124, height - 20);
    ctx.lineTo(92, height - 46);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2a160f';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(18, height - 18);
    ctx.lineTo(82, height - 6);
    ctx.lineTo(76, height - 24);
    ctx.lineTo(20, height - 26);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    const glove = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.75);
    glove.addColorStop(0, '#f5c7a1');
    glove.addColorStop(0.4, '#e9a977');
    glove.addColorStop(0.75, '#d48754');
    glove.addColorStop(1, '#a0623a');
    ctx.fillStyle = glove;
    ctx.beginPath();
    ctx.moveTo(52, height - 98);
    ctx.lineTo(130, height - 82);
    ctx.lineTo(156, height - 32);
    ctx.quadraticCurveTo(width - 6, height - 20, 130, height - 10);
    ctx.lineTo(58, height - 22);
    ctx.lineTo(32, height - 56);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(32, 12, 8, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(60, height - 78);
    ctx.lineTo(134, height - 64);
    ctx.quadraticCurveTo(150, height - 50, 140, height - 28);
    ctx.stroke();

    ctx.fillStyle = '#f9d5b5';
    for (let i = 0; i < 4; i++) {
      const knuckleX = 68 + i * 18;
      const knuckleY = height - 60 - i * 2;
      ctx.beginPath();
      ctx.ellipse(knuckleX, knuckleY, 12, 10, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(96, 54, 32, 0.75)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 238, 215, 0.35)';
    ctx.beginPath();
    ctx.moveTo(60, height - 90);
    ctx.quadraticCurveTo(104, height - 110, 142, height - 70);
    ctx.quadraticCurveTo(122, height - 52, 72, height - 48);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(90, 40, 15, 0.45)';
    ctx.beginPath();
    ctx.moveTo(40, height - 58);
    ctx.lineTo(80, height - 44);
    ctx.lineTo(70, height - 30);
    ctx.lineTo(30, height - 36);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#392015';
    ctx.beginPath();
    ctx.moveTo(24, height - 42);
    ctx.lineTo(60, height - 18);
    ctx.lineTo(44, height - 10);
    ctx.lineTo(14, height - 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(100, height - 108);
    ctx.lineTo(132, height - 100);
    ctx.lineTo(140, height - 88);
    ctx.lineTo(120, height - 86);
    ctx.closePath();
    ctx.fill();
  });
}

function createPistolSprite(): HTMLCanvasElement {
  const width = 192;
  const height = 128;
  return createCanvas(width, height, (ctx) => {
    ctx.clearRect(0, 0, width, height);

    const barrelGradient = ctx.createLinearGradient(24, 40, width - 8, 60);
    barrelGradient.addColorStop(0, '#2f3d5b');
    barrelGradient.addColorStop(0.25, '#3d4f72');
    barrelGradient.addColorStop(0.5, '#5d6e92');
    barrelGradient.addColorStop(0.75, '#3b4a68');
    barrelGradient.addColorStop(1, '#1f283b');
    ctx.fillStyle = barrelGradient;
    ctx.beginPath();
    ctx.moveTo(32, 46);
    ctx.lineTo(width - 12, 46);
    ctx.lineTo(width - 24, 30);
    ctx.lineTo(38, 30);
    ctx.quadraticCurveTo(20, 32, 22, 54);
    ctx.lineTo(28, 74);
    ctx.lineTo(width - 48, 74);
    ctx.lineTo(width - 60, 64);
    ctx.lineTo(40, 64);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#11141f';
    ctx.fillRect(width - 36, 40, 20, 18);

    ctx.fillStyle = '#0e141f';
    ctx.fillRect(56, 72, 48, 38);

    const gripGradient = ctx.createLinearGradient(40, 76, 110, height - 8);
    gripGradient.addColorStop(0, '#6f472c');
    gripGradient.addColorStop(0.3, '#925d38');
    gripGradient.addColorStop(0.65, '#704529');
    gripGradient.addColorStop(1, '#422613');
    ctx.fillStyle = gripGradient;
    ctx.beginPath();
    ctx.moveTo(60, 74);
    ctx.lineTo(118, 74);
    ctx.lineTo(138, height - 8);
    ctx.lineTo(80, height - 8);
    ctx.quadraticCurveTo(52, height - 12, 52, 96);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(44, 58, width - 84, 6);
    ctx.fillRect(66, 86, 36, 8);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(42, 42);
    ctx.lineTo(width - 38, 42);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(70, 86);
    ctx.lineTo(108, 120);
    ctx.stroke();

    ctx.fillStyle = '#16c5ff';
    ctx.beginPath();
    ctx.arc(122, 78, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b0bcd7';
    ctx.fillRect(32, 54, 30, 10);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.moveTo(50, 34);
    ctx.lineTo(94, 34);
    ctx.lineTo(86, 30);
    ctx.lineTo(44, 30);
    ctx.closePath();
    ctx.fill();
  });
}

function createKnifeSprite(): HTMLCanvasElement {
  const width = 176;
  const height = 128;
  return createCanvas(width, height, (ctx) => {
    ctx.clearRect(0, 0, width, height);

    const bladeGradient = ctx.createLinearGradient(56, 12, width - 20, 90);
    bladeGradient.addColorStop(0, '#eef6ff');
    bladeGradient.addColorStop(0.25, '#c8d5e8');
    bladeGradient.addColorStop(0.55, '#f9fcff');
    bladeGradient.addColorStop(0.8, '#a9b5c6');
    bladeGradient.addColorStop(1, '#5f6b7c');
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(58, 28);
    ctx.quadraticCurveTo(width - 10, 6, width - 12, 44);
    ctx.quadraticCurveTo(width - 34, 88, 70, 104);
    ctx.lineTo(44, 94);
    ctx.lineTo(46, 42);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(20, 28, 44, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(60, 32);
    ctx.quadraticCurveTo(width - 20, 14, width - 26, 44);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64, 36);
    ctx.quadraticCurveTo(width - 40, 20, width - 44, 44);
    ctx.stroke();

    const guardGradient = ctx.createLinearGradient(28, 60, 72, 72);
    guardGradient.addColorStop(0, '#272b35');
    guardGradient.addColorStop(0.5, '#464d5a');
    guardGradient.addColorStop(1, '#171920');
    ctx.fillStyle = guardGradient;
    ctx.beginPath();
    ctx.moveTo(32, 60);
    ctx.lineTo(80, 64);
    ctx.lineTo(78, 78);
    ctx.lineTo(30, 74);
    ctx.closePath();
    ctx.fill();

    const handleGradient = ctx.createLinearGradient(8, 52, 52, height - 12);
    handleGradient.addColorStop(0, '#3f2a1d');
    handleGradient.addColorStop(0.2, '#6b4327');
    handleGradient.addColorStop(0.5, '#8f5b32');
    handleGradient.addColorStop(0.8, '#6a4124');
    handleGradient.addColorStop(1, '#2d1a10');
    ctx.fillStyle = handleGradient;
    ctx.beginPath();
    ctx.moveTo(14, 46);
    ctx.lineTo(44, 50);
    ctx.lineTo(50, 106);
    ctx.lineTo(24, 120);
    ctx.quadraticCurveTo(8, 112, 8, 86);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 204, 128, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(18, 60);
    ctx.lineTo(42, 64);
    ctx.lineTo(46, 94);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(74, 48);
    ctx.quadraticCurveTo(width - 36, 28, width - 48, 56);
    ctx.quadraticCurveTo(width - 70, 82, 84, 94);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#131820';
    ctx.beginPath();
    ctx.moveTo(10, 72);
    ctx.lineTo(52, 80);
    ctx.lineTo(50, 92);
    ctx.lineTo(8, 84);
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
