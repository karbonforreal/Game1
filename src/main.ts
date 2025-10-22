import { GameLoop } from './loop';
import { Renderer } from './renderer';
import { loadAssets } from './sprites';
import { config, loadSettings } from './config';
import { initAudio, updateVolume } from './audio';
import { InputManager } from './input';
import { TouchControls } from './touch';
import { createPlayer, playerFire, setPlayerStart, updatePlayer, endAttack } from './player';
import { createWeaponDefinitions, performAttack } from './weapons';
import { level1 } from './level1';
import { Raycaster } from './raycaster';
import { applyDamage, createEnemy, updateEnemies } from './enemy';
import { createPickup, tryCollect } from './pickups';
import type { EnemyInstance, GameState, HitMarker, PickupInstance, Settings, SpriteRenderable } from './types';
import { UIManager } from './ui';
import { findNearestOpenPosition } from './collisions';
import { normalize } from './math';

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Press Start 2P';
      font-style: normal;
      font-weight: 400;
      src: local('Press Start 2P'), url('https://fonts.gstatic.com/s/pressstart2p/v12/e3t4euO8T-267oIAQAu6jDQyK3nD-zP-W4Cq7z0.woff2') format('woff2');
    }
    .ui-overlay {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(5, 5, 12, 0.85);
      z-index: 50;
      color: #fff;
      font-family: 'Press Start 2P', monospace;
    }
    .ui-overlay .panel {
      background: rgba(20, 20, 40, 0.95);
      padding: 32px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 320px;
      text-align: center;
    }
    .ui-overlay button {
      padding: 12px 16px;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      background: #3a4c6e;
      border: 2px solid #556b85;
      color: #fff;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .ui-overlay button:hover {
      background: #556b85;
      border-color: #8ba2d0;
      transform: scale(1.05);
    }
    .ui-overlay label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      font-size: 12px;
    }
    .ui-overlay input[type="range"] {
      flex: 1;
    }
    .ui-overlay .actions {
      display: flex;
      justify-content: space-between;
    }
    .game-over-title {
      font-size: 28px;
      margin-bottom: 16px;
      line-height: 1.4;
    }
    .game-over-title.victory {
      color: #4afe4a;
      text-shadow: 0 0 10px rgba(74, 254, 74, 0.5);
    }
    .game-over-title.defeat {
      color: #ff4444;
      text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
    }
    .game-over-message {
      font-size: 14px;
      margin-bottom: 24px;
      color: #aaa;
      line-height: 1.6;
    }
  `;
  document.head.appendChild(style);
}

function createGameOverUI(): { victoryScreen: HTMLElement; defeatScreen: HTMLElement } {
  const victoryScreen = document.createElement('div');
  victoryScreen.id = 'victory-screen';
  victoryScreen.className = 'ui-overlay';
  victoryScreen.innerHTML = `
    <div class="panel">
      <h1 class="game-over-title victory">VICTORY!</h1>
      <p class="game-over-message">All hostiles eliminated.<br>Mission accomplished.</p>
      <button id="victory-restart">Restart</button>
    </div>
  `;
  document.body.appendChild(victoryScreen);

  const defeatScreen = document.createElement('div');
  defeatScreen.id = 'defeat-screen';
  defeatScreen.className = 'ui-overlay';
  defeatScreen.innerHTML = `
    <div class="panel">
      <h1 class="game-over-title defeat">DEFEATED</h1>
      <p class="game-over-message">Your mission has failed.<br>Better luck next time.</p>
      <button id="defeat-restart">Restart</button>
    </div>
  `;
  document.body.appendChild(defeatScreen);

  return { victoryScreen, defeatScreen };
}

async function bootstrap() {
  injectStyles();
  const app = document.getElementById('app');
  if (!app) throw new Error('No app container');
  let settings = loadSettings();
  initAudio(settings);

  const { victoryScreen, defeatScreen } = createGameOverUI();

  const renderer = new Renderer(app);
  renderer.resize(settings.dynamicResolution);

  const assets = await loadAssets();
  const weapons = createWeaponDefinitions(assets.weapons);
  const player = createPlayer(weapons);
  const safePlayerStart = findNearestOpenPosition(level1.playerStart, level1);
  setPlayerStart(player, safePlayerStart.x, safePlayerStart.y, 0);
  const raycaster = new Raycaster(level1);
  raycaster.setTextures(assets.textures);

  const enemies: EnemyInstance[] = level1.enemies.map((spawn, index) =>
    createEnemy(
      {
        id: spawn.type,
        sprite: assets.enemies[spawn.type],
        speed: 1.4,
        health: 40,
        damage: 8,
        attackCooldown: 0.8,
        aggroRange: 8
      },
      findNearestOpenPosition(spawn.position, level1),
      index,
      level1
    )
  );

  const pickups: PickupInstance[] = level1.pickups.map((item, index) =>
    createPickup(
      {
        id: item.type,
        type: item.type as any,
        amount: item.type === 'health' ? 25 : item.type === 'armor' ? 20 : 12,
        sprite: assets.pickups[item.type]
      },
      findNearestOpenPosition(item.position, level1, 0.2),
      index
    )
  );

  const input = new InputManager(settings);
  const touchControls = new TouchControls(settings);

  const ui = new UIManager(settings, {
    onResume: () => {
      paused = false;
    },
    onSettingsChanged: (newSettings) => {
      settings = { ...newSettings };
      input.updateSettings(settings);
      touchControls.updateSettings(settings);
      updateVolume(settings);
      renderer.resize(settings.dynamicResolution);
    }
  });

  let paused = false;
  let gameState: GameState = 'playing';
  let lastAttackTime = 0;
  let hudState = { fps: 60, showDebug: false, messages: [] };
  let lastRender = performance.now();
  const hitMarkers: HitMarker[] = [];

  // Restart button handlers
  const restartGame = () => {
    location.reload();
  };
  victoryScreen.querySelector('#victory-restart')?.addEventListener('click', restartGame);
  defeatScreen.querySelector('#defeat-restart')?.addEventListener('click', restartGame);

  const loop = new GameLoop((delta, time) => {
    if (paused || gameState !== 'playing') return;
    const keyboardState = input.getState(delta);
    const touchState = touchControls.getState();
    const combined = {
      forward: keyboardState.forward + (touchState.forward ?? 0),
      strafe: keyboardState.strafe + (touchState.strafe ?? 0),
      turning: keyboardState.turning + (touchState.turning ?? 0),
      looking: 0,
      fire: keyboardState.fire || !!touchState.fire,
      interact: keyboardState.interact || !!touchState.interact,
      weaponSlot: touchState.weaponSlot ?? keyboardState.weaponSlot,
      pauseRequested: keyboardState.pauseRequested || !!touchState.pauseRequested,
      toggleDebug: keyboardState.toggleDebug || !!touchState.toggleDebug
    };

    if (combined.pauseRequested) {
      paused = true;
      ui.showPause();
      return;
    }

    if (combined.toggleDebug) {
      hudState.showDebug = !hudState.showDebug;
    }

    updatePlayer(player, combined, delta, settings, level1);
    updateEnemies(enemies, delta, level1, player);

    // Check for lose condition
    if (player.health <= 0 && gameState === 'playing') {
      gameState = 'lost';
      defeatScreen.style.display = 'flex';
      return;
    }

    // Check for win condition
    const allEnemiesDead = enemies.every(enemy => !enemy.alive);
    if (allEnemiesDead && gameState === 'playing') {
      gameState = 'won';
      victoryScreen.style.display = 'flex';
      return;
    }

    for (let i = hitMarkers.length - 1; i >= 0; i--) {
      const marker = hitMarkers[i];
      marker.timer -= delta;
      if (marker.timer <= 0) {
        hitMarkers.splice(i, 1);
      }
    }

    if (combined.fire && time - lastAttackTime > 0.05) {
      const weapon = playerFire(player, time);
      if (weapon) {
        const attack = performAttack(weapon, player, enemies, raycaster);
        if (attack.enemy) {
          applyDamage(attack.enemy, weapon.damage);
        }

        const clampedDistance = Math.min(attack.distance, weapon.range);
        let markerPosition = attack.position;
        if (attack.distance > 0 && attack.distance !== clampedDistance) {
          const scale = clampedDistance / attack.distance;
          markerPosition = {
            x: player.position.x + (attack.position.x - player.position.x) * scale,
            y: player.position.y + (attack.position.y - player.position.y) * scale
          };
        }
        let shouldAddMarker = true;
        if (!attack.enemy && (weapon.id === 'punch' || weapon.id === 'knife')) {
          const direction = normalize(player.direction);
          const meleeWallHit = raycaster.cast(player.position, direction);
          shouldAddMarker = meleeWallHit.distance <= 1;
        }

        if (shouldAddMarker) {
          const markerDuration = 0.25;
          hitMarkers.push({
            position: markerPosition,
            distance: clampedDistance,
            timer: markerDuration,
            duration: markerDuration,
            kind: attack.kind
          });
        }
        lastAttackTime = time;
      }
    }

    if (!combined.fire && player.attackTimer <= 0 && player.isAttacking) {
      endAttack(player);
    }

    for (const pickup of pickups) {
      if (!pickup.collected) {
        tryCollect(pickup, player);
      }
    }
  }, (alpha, time) => {
    const now = performance.now();
    const deltaMs = now - lastRender;
    lastRender = now;
    hudState.fps = 1000 / deltaMs;
    if (hudState.fps < config.lowFPSThreshold && settings.dynamicResolution > config.resolutionScaleMin) {
      settings.dynamicResolution = Math.max(config.resolutionScaleMin, settings.dynamicResolution - config.resolutionStep);
      renderer.resize(settings.dynamicResolution);
    } else if (hudState.fps > config.lowFPSThreshold + 15 && settings.dynamicResolution < config.resolutionScaleMax) {
      settings.dynamicResolution = Math.min(config.resolutionScaleMax, settings.dynamicResolution + config.resolutionStep);
      renderer.resize(settings.dynamicResolution);
    }

    const spriteList: SpriteRenderable[] = [];
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      spriteList.push({
        id: enemy.id,
        image: enemy.definition.sprite,
        position: enemy.position,
        size: 1,
        isBillboard: true,
        distance: 0,
        type: 'enemy'
      });
    }
    for (const pickup of pickups) {
      if (pickup.collected) continue;
      spriteList.push({
        id: pickup.id,
        image: pickup.definition.sprite,
        position: pickup.position,
        size: 0.65,
        anchor: 'floor',
        isBillboard: true,
        distance: 0,
        type: 'pickup'
      });
    }

    renderer.render(
      raycaster,
      player,
      spriteList,
      hudState,
      player.weapons[player.activeWeapon].definition,
      hitMarkers,
      settings
    );
  });

  window.addEventListener('resize', () => renderer.resize(settings.dynamicResolution));
  loop.start();
}

bootstrap();
