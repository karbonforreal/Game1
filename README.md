# Raycast Retro

A minimal retro dungeon shooter that fuses Wolfenstein-era raycasting with modern TypeScript and Vite tooling. The project targets Cloudflare Pages deployment from a private GitHub repository and includes mobile-ready touch controls, configurable options, and a complete first level with enemies, pickups, and three weapons.

## Getting Started

```bash
npm install
npm run dev
```

> The development server runs on Vite. Use `npm run build` to create a production bundle and `npm run preview` to serve the output locally.

## Controls

### Keyboard & Mouse
- **W/A/S/D** – Move/strafe
- **Mouse** – Look (pointer lock on click)
- **Left click / Space** – Fire/attack
- **1 / 2 / 3** – Switch weapons (Punch, Pistol, Knife)
- **E** – Interact / pick up
- **Esc** – Pause menu

### Gamepad (optional)
- **Left stick** – Move
- **Right stick** – Look
- **A** – Fire/attack
- **X** – Interact
- **D-Pad** – Cycle weapons

### Touch Layout
The touch UI is always available (auto-enabled on mobile, toggleable on desktop):

- **Left pad** – Virtual joystick (move/strafe)
- **Right pad** – Look/turn
- **Buttons** – Fire, Interact, and weapon slots **1/2/3** stacked near the fire button
- **Pause** – Top-right corner

All touch targets scale between 56–72px with 12–16px gutters, semi-transparent by default, and increase opacity while active.

> The optional desktop toggle is in the top-left corner labelled “Touch Controls ON/OFF”. The repository intentionally ships
> without binary art assets; see `docs/README.md` for guidance on adding visual diagrams when needed.

## Options & Local Storage
Access **Options** from the pause menu (Esc or the pause button). Settings persist via `localStorage`.

- Look sensitivity (mouse/touch yaw)
- Joystick size
- Touch UI opacity
- Master volume
- Left-handed layout (swaps joystick/look pads)
- Touch controls enable toggle

## Gameplay Systems

- **Raycasting** – Column-based DDA ray march with textured walls and sprite depth sorting.
- **Level 1** – 24×24 grid dungeon, three rooms, connected hallways, no doors.
- **Enemies** – Billboard melee grunts with idle → chase → attack state machine, LOS aggro, knockback on hit.
- **Weapons** – Punch (infinite), Pistol (ammo), Knife (fast melee) with HUD weapon sprite rising from the info bar.
- **HUD** – Bottom bar shows Health, Armor, Ammo, weapon name, and FPS toggle (`F`) for diagnostics.
- **Pickups** – Health, Armor, Ammo; auto-pickup on overlap or via interact.
- **Touch Controls** – Always-on overlays with left-handed mode and persistent toggle state.
- **Audio** – Lightweight synthesized cues using Howler.js (footsteps, shots, swings, pickups, damage).

## Extending the Game

### Adding Levels
1. Create a new file in `src/levels/` (e.g. `level2.ts`). Export a `LevelDefinition` with tile data, spawn lists, and texture lookup.
2. Update the level selector in `src/main.ts` to load your new level.
3. Drop new textures in `assets/textures/walls/` and import them in `src/sprites.ts` (the existing setup generates textures at
   runtime, so you can replace the procedural art with your own pipelines).

**Tile legend**: `0 = empty`, `1+ = wall indices mapped via level.textureLookup`.

### Creating Weapons
1. Add sprites to `assets/sprites/player/` and update `src/sprites.ts` to load them. The default build keeps binary-free by
   generating canvases at runtime, so be sure to commit optimized PNG/SVG assets when you are ready to replace the placeholders.
2. Extend `createWeaponDefinitions` in `src/weapons.ts` with the new weapon stats (damage, cooldown, range, ammo cost).
3. Update HUD strings and touch weapon buttons if you exceed three slots (e.g. convert to carousel).

### Asset Specs
- **Wall textures**: power-of-two PNGs (e.g. 64×64) for crisp nearest-neighbor sampling. Procedural textures are used by
  default so the repo stays binary-free.
- **Sprites**: PNGs with alpha channel; recommended 64–128px square for weapons/enemies. The shipped build draws placeholders at
  runtime until you provide real art.
- **Audio**: Howler-compatible sources; add additional samples in `src/audio.ts`.

### Performance Tips
- Keep sprite counts modest; billboard sorting runs every frame.
- Avoid extremely large maps without culling—raycasting cost scales with width.
- Use the built-in dynamic resolution scaler (drops to 75% when FPS < 50) to stabilize performance.
- Prefer small, looping audio clips to reduce initial load time.

## Cloudflare Pages Deployment

1. **Create a private GitHub repository** named `raycast-retro` and push the project (default branch `main`, active development on `dev`).
2. In **Cloudflare Pages**, create a new project `raycast-karbon` and connect the private repo via GitHub OAuth.
3. Set build command to `npm run build` and output directory to `dist`. Framework preset: “None (Vite)”.
4. Ensure the `_headers` file is copied by Vite (already handled in `vite.config.ts`). Headers applied:
   ```
   /*
     X-Content-Type-Options: nosniff
     X-Frame-Options: DENY
     Referrer-Policy: no-referrer
     Cache-Control: public, max-age=3600
   ```
5. Enable automatic deployments from `main`; use the `dev` branch for preview builds.

## Troubleshooting
- If pointer lock fails, confirm you clicked inside the canvas and the browser allows pointer lock.
- Touch controls require pointer events and multi-touch support. Desktop toggle is hidden on actual touch devices.
- When developing offline, synth audio may be blocked until user interaction—fire a weapon to unlock.

Enjoy modding and extending the dungeon!
