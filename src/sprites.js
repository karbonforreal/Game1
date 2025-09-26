function createCanvas(width, height, draw) {
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

function createDungeonTexture() {
  return createCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#262033';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = '#0f0a18';
    ctx.lineWidth = 4;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const offset = y % 2 === 0 ? x * 16 : x * 16 - 8;
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

function drawWeaponBase(ctx, color) {
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

function createFistSprite() {
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

function createPistolSprite() {
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

function createKnifeSprite() {
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

function createGruntSprite() {
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

function createPickupSprite(color, symbol) {
  return createCanvas(40, 40, (ctx) => {
    ctx.clearRect(0, 0, 40, 40);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(20, 20, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 20, 22);
  });
}

export async function loadAssets() {
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
    health: createPickupSprite('#a83245', '+'),
    armor: createPickupSprite('#3d7ea6', 'A'),
    ammo: createPickupSprite('#f2a541', '•')
  };
  return { textures, weapons, enemies, pickups };
}
