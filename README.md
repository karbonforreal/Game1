# Raycast Retro

A minimalist browser FPS inspired by classic raycasters. Everything is rendered with vanilla Canvas APIs and self-generated sprites so the game can ship without external build tooling or binary assets.

## Running locally

Because the project now uses plain ES modules you can load it from any static server:

```bash
npx serve .
```

or with Python:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173` in your browser. Hosting platforms such as Cloudflare Pages can deploy the repository directly with "no build" settings because the shipped HTML points at `src/main.js`.

## Controls

### Keyboard & mouse
- **W/A/S/D** – Move/strafe
- **Mouse** – Look (click once to enable pointer lock)
- **Space / Left click** – Attack / fire
- **1 / 2 / 3** – Switch weapons (Punch, Pistol, Knife)
- **E** – Interact / pick up
- **Esc** – Pause
- **F** – Toggle FPS readout

### Touch
- Left pad – Move
- Right pad – Turn
- Buttons – Fire, interact, weapon slots, pause
- Toggle button (top-left) – Enable/disable touch UI on desktop

## Options
Settings persist in `localStorage` and can be changed from the pause menu:
- Look sensitivity
- Joystick size
- Touch UI opacity
- Master volume
- Left-handed layout
- Touch controls enabled

## Project layout
- `index.html` – Static entry point that loads the ES module game.
- `src/` – Game logic written in modern JavaScript.
  - `main.js` – Bootstraps the game loop, assets, input, and rendering.
  - `renderer.js` / `raycaster.js` – Software raycaster and HUD compositing.
  - `player.js`, `enemy.js`, `weapons.js`, `pickups.js` – Core gameplay systems.
  - `touch.js`, `input.js`, `ui.js` – Input managers and overlays.
  - `sprites.js` – Procedural canvas sprites and textures.
  - `audio.js` – Base64-encoded sound effects powered by Howler via CDN import.
- `cloudflare/_headers` – Optional security headers for static hosts.

## Deployment tips
- Ensure your host serves the repository root; no build step is required.
- If using Cloudflare Pages choose the "None" preset and leave the build command blank.
- The app relies on modern browser APIs (Pointer Lock, Pointer Events, ES modules).

Enjoy exploring the dungeon! Pull requests are welcome for new levels, weapons, or visual polish.
