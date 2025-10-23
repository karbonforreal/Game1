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
    const baseGradient = ctx.createLinearGradient(0, 0, 0, 64);
    baseGradient.addColorStop(0, '#161126');
    baseGradient.addColorStop(0.5, '#1f1735');
    baseGradient.addColorStop(1, '#30244d');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, 64, 64);

    ctx.lineWidth = 3;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const offset = (x * 16 + (y % 2 === 0 ? 0 : 8)) % 64;
        const tileGradient = ctx.createLinearGradient(0, y * 16, 0, y * 16 + 16);
        tileGradient.addColorStop(0, y % 2 === 0 ? '#3c2f59' : '#35294f');
        tileGradient.addColorStop(1, '#201737');
        ctx.fillStyle = tileGradient;
        ctx.fillRect(offset, y * 16, 18, 16);
        ctx.strokeStyle = 'rgba(12, 8, 24, 0.7)';
        ctx.strokeRect(offset + 0.5, y * 16 + 0.5, 17, 15);
      }
    }

    const highlight = ctx.createRadialGradient(32, 20, 6, 32, 20, 30);
    highlight.addColorStop(0, 'rgba(140, 110, 210, 0.35)');
    highlight.addColorStop(1, 'rgba(30, 24, 48, 0)');
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, 64, 32);

    ctx.strokeStyle = 'rgba(12, 9, 20, 0.65)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const startX = Math.random() * 64;
      let startY = Math.random() * 64;
      const segments = 3 + Math.floor(Math.random() * 3);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      for (let s = 0; s < segments; s++) {
        startX += (Math.random() - 0.5) * 12;
        startY += Math.random() * 8;
        ctx.lineTo(startX, startY);
      }
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(120, 90, 200, 0.25)';
    for (let i = 0; i < 6; i++) {
      const size = 2 + Math.random() * 3;
      ctx.fillRect(Math.random() * 64, Math.random() * 64, size, size);
    }
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(Math.random() * 64, Math.random() * 64, 1, 1);
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
    drawWeaponBase(ctx, '#2c1a23');

    const fistGradient = ctx.createLinearGradient(18, 52, 46, 14);
    fistGradient.addColorStop(0, '#b66b45');
    fistGradient.addColorStop(0.5, '#e3b088');
    fistGradient.addColorStop(1, '#f8dac0');
    ctx.fillStyle = fistGradient;
    ctx.beginPath();
    ctx.moveTo(18, 46);
    ctx.lineTo(46, 46);
    ctx.quadraticCurveTo(54, 34, 40, 12);
    ctx.lineTo(24, 12);
    ctx.quadraticCurveTo(14, 22, 18, 46);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(120, 60, 40, 0.35)';
    ctx.beginPath();
    ctx.moveTo(22, 44);
    ctx.quadraticCurveTo(24, 30, 32, 26);
    ctx.quadraticCurveTo(40, 30, 42, 44);
    ctx.lineTo(22, 44);
    ctx.fill();

    ctx.fillStyle = '#f9e5cf';
    for (let i = 0; i < 4; i++) {
      const x = 22 + i * 6;
      ctx.beginPath();
      ctx.ellipse(x + 2, 30, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#7a3c4a';
    ctx.fillRect(20, 40, 24, 6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(20, 38, 24, 2);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, 20);
    ctx.quadraticCurveTo(32, 10, 40, 20);
    ctx.stroke();

    ctx.save();
    const energy = ctx.createRadialGradient(32, 18, 4, 32, 18, 22);
    energy.addColorStop(0, 'rgba(255, 155, 100, 0.7)');
    energy.addColorStop(0.7, 'rgba(255, 102, 102, 0.25)');
    energy.addColorStop(1, 'rgba(255, 102, 102, 0)');
    ctx.fillStyle = energy;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillRect(0, 0, 64, 40);
    ctx.restore();
  });
}

function createPistolSprite(): HTMLCanvasElement {
  return createCanvas(64, 64, (ctx) => {
    drawWeaponBase(ctx, '#111b2b');

    const bodyGradient = ctx.createLinearGradient(18, 52, 46, 16);
    bodyGradient.addColorStop(0, '#1b273c');
    bodyGradient.addColorStop(0.5, '#2f3f5f');
    bodyGradient.addColorStop(1, '#1b273c');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(20, 44);
    ctx.lineTo(48, 44);
    ctx.lineTo(54, 32);
    ctx.lineTo(52, 20);
    ctx.lineTo(18, 20);
    ctx.lineTo(16, 28);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0d1320';
    ctx.fillRect(24, 34, 16, 10);

    const emitter = ctx.createLinearGradient(48, 30, 58, 30);
    emitter.addColorStop(0, '#b6f0ff');
    emitter.addColorStop(0.3, '#5ad5ff');
    emitter.addColorStop(1, 'rgba(90, 213, 255, 0)');
    ctx.fillStyle = emitter;
    ctx.fillRect(48, 26, 12, 12);

    ctx.fillStyle = '#5ad5ff';
    ctx.fillRect(26, 24, 20, 4);
    ctx.fillStyle = 'rgba(180, 230, 255, 0.4)';
    ctx.fillRect(27, 25, 18, 2);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, 28);
    ctx.lineTo(46, 28);
    ctx.stroke();

    ctx.fillStyle = '#121b29';
    ctx.fillRect(30, 40, 10, 10);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(30, 40, 10, 3);

    ctx.save();
    const glow = ctx.createRadialGradient(52, 30, 2, 52, 30, 14);
    glow.addColorStop(0, 'rgba(135, 225, 255, 0.6)');
    glow.addColorStop(1, 'rgba(135, 225, 255, 0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.fillRect(36, 16, 28, 24);
    ctx.restore();
  });
}

function createKnifeSprite(): HTMLCanvasElement {
  return createCanvas(64, 64, (ctx) => {
    drawWeaponBase(ctx, '#162c25');

    const gripGradient = ctx.createLinearGradient(24, 48, 40, 12);
    gripGradient.addColorStop(0, '#1e5d4a');
    gripGradient.addColorStop(0.5, '#2f8a6f');
    gripGradient.addColorStop(1, '#5bd3b5');
    ctx.fillStyle = gripGradient;
    ctx.fillRect(26, 18, 12, 26);

    ctx.fillStyle = '#0f1f1a';
    ctx.fillRect(24, 24, 16, 4);

    ctx.beginPath();
    ctx.moveTo(32, 10);
    ctx.lineTo(48, 40);
    ctx.lineTo(16, 40);
    ctx.closePath();
    const bladeGradient = ctx.createLinearGradient(20, 12, 44, 42);
    bladeGradient.addColorStop(0, '#f2fff7');
    bladeGradient.addColorStop(0.4, '#a8fff2');
    bladeGradient.addColorStop(1, '#52c4ae');
    ctx.fillStyle = bladeGradient;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(28, 16);
    ctx.lineTo(40, 38);
    ctx.stroke();

    ctx.save();
    const aura = ctx.createRadialGradient(32, 24, 4, 32, 24, 24);
    aura.addColorStop(0, 'rgba(120, 255, 210, 0.55)');
    aura.addColorStop(0.7, 'rgba(80, 210, 190, 0.2)');
    aura.addColorStop(1, 'rgba(80, 210, 190, 0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = aura;
    ctx.fillRect(8, 8, 48, 40);
    ctx.restore();
  });
}

function createGruntSprite(): HTMLCanvasElement {
  return createCanvas(64, 64, (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const silhouette = ctx.createLinearGradient(0, 26, 0, 64);
    silhouette.addColorStop(0, '#04121d');
    silhouette.addColorStop(0.4, '#071c2d');
    silhouette.addColorStop(1, '#03070c');
    ctx.fillStyle = silhouette;
    ctx.beginPath();
    ctx.moveTo(10, 60);
    ctx.lineTo(54, 60);
    ctx.lineTo(50, 32);
    ctx.quadraticCurveTo(48, 18, 32, 18);
    ctx.quadraticCurveTo(16, 18, 14, 32);
    ctx.closePath();
    ctx.fill();

    const plating = ctx.createLinearGradient(0, 20, 0, 56);
    plating.addColorStop(0, '#16404f');
    plating.addColorStop(0.5, '#1f6a78');
    plating.addColorStop(1, '#0a2530');
    ctx.fillStyle = plating;
    ctx.beginPath();
    ctx.moveTo(18, 54);
    ctx.lineTo(46, 54);
    ctx.lineTo(48, 32);
    ctx.quadraticCurveTo(46, 26, 32, 28);
    ctx.quadraticCurveTo(18, 26, 16, 32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#031822';
    ctx.beginPath();
    ctx.moveTo(22, 30);
    ctx.lineTo(42, 30);
    ctx.lineTo(46, 44);
    ctx.quadraticCurveTo(32, 48, 18, 44);
    ctx.closePath();
    ctx.fill();

    const helm = ctx.createLinearGradient(0, 6, 0, 32);
    helm.addColorStop(0, '#0d2636');
    helm.addColorStop(0.5, '#174a5f');
    helm.addColorStop(1, '#0a1c27');
    ctx.fillStyle = helm;
    ctx.beginPath();
    ctx.moveTo(22, 28);
    ctx.quadraticCurveTo(22, 10, 32, 6);
    ctx.quadraticCurveTo(42, 10, 42, 28);
    ctx.quadraticCurveTo(32, 34, 22, 28);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#64ffd1';
    ctx.beginPath();
    ctx.moveTo(24, 18);
    ctx.quadraticCurveTo(32, 10, 40, 18);
    ctx.lineTo(37, 12);
    ctx.lineTo(32, 10);
    ctx.lineTo(27, 12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#061a22';
    ctx.beginPath();
    ctx.moveTo(26, 34);
    ctx.lineTo(38, 34);
    ctx.lineTo(36, 40);
    ctx.lineTo(28, 40);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1afac9';
    ctx.beginPath();
    ctx.ellipse(28, 26, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(36, 26, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0dffd8';
    ctx.fillRect(28, 26, 8, 2);

    ctx.fillStyle = 'rgba(18, 255, 204, 0.65)';
    ctx.beginPath();
    ctx.moveTo(30, 36);
    ctx.quadraticCurveTo(32, 38, 34, 36);
    ctx.quadraticCurveTo(32, 42, 30, 36);
    ctx.fill();

    ctx.fillStyle = '#34d7ff';
    ctx.beginPath();
    ctx.moveTo(18, 52);
    ctx.lineTo(24, 36);
    ctx.lineTo(22, 30);
    ctx.lineTo(16, 32);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(46, 52);
    ctx.lineTo(40, 36);
    ctx.lineTo(42, 30);
    ctx.lineTo(48, 32);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 255, 220, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(18, 46);
    ctx.quadraticCurveTo(32, 52, 46, 46);
    ctx.stroke();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const aura = ctx.createRadialGradient(32, 26, 4, 32, 26, 26);
    aura.addColorStop(0, 'rgba(28, 255, 210, 0.8)');
    aura.addColorStop(0.4, 'rgba(28, 255, 210, 0.35)');
    aura.addColorStop(1, 'rgba(28, 255, 210, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(6, 4, 52, 44);

    const sparkCount = 16;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2;
      const radius = 10 + Math.random() * 6;
      const x = 32 + Math.cos(angle) * radius;
      const y = 28 + Math.sin(angle) * radius * 0.6;
      ctx.fillStyle = 'rgba(64, 255, 220, 0.35)';
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
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
