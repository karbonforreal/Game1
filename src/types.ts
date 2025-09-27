export type Vec2 = {
  x: number;
  y: number;
};

export interface PlayerState {
  position: Vec2;
  direction: Vec2;
  plane: Vec2;
  velocity: Vec2;
  health: number;
  armor: number;
  ammo: number;
  maxHealth: number;
  maxArmor: number;
  maxAmmo: number;
  activeWeapon: WeaponType;
  weapons: Record<WeaponType, WeaponRuntime>;
  isAttacking: boolean;
  attackTimer: number;
  hurtTimer: number;
}

export interface WeaponDefinition {
  id: WeaponType;
  name: string;
  damage: number;
  range: number;
  cooldown: number;
  ammoCost: number;
  hold: boolean;
  sprite: HTMLCanvasElement;
  sound?: string;
}

export interface WeaponRuntime {
  definition: WeaponDefinition;
  lastFire: number;
}

export type WeaponType = 'punch' | 'pistol' | 'knife';

export interface InputState {
  forward: number;
  strafe: number;
  turning: number;
  looking: number;
  fire: boolean;
  interact: boolean;
  weaponSlot: WeaponType | null;
  pauseRequested: boolean;
  toggleDebug?: boolean;
}

export interface EnemyDefinition {
  id: string;
  sprite: HTMLCanvasElement;
  speed: number;
  health: number;
  damage: number;
  attackCooldown: number;
  aggroRange: number;
}

export type EnemyMode = 'idle' | 'chase' | 'attack';

export interface EnemyInstance {
  id: number;
  definition: EnemyDefinition;
  position: Vec2;
  velocity: Vec2;
  health: number;
  state: EnemyMode;
  attackTimer: number;
  hurtTimer: number;
  patrolDirection: number;
  alive: boolean;
}

export interface PickupDefinition {
  id: string;
  type: 'health' | 'armor' | 'ammo';
  amount: number;
  sprite: HTMLCanvasElement;
}

export interface PickupInstance {
  id: number;
  definition: PickupDefinition;
  position: Vec2;
  collected: boolean;
}

export interface LevelDefinition {
  width: number;
  height: number;
  tiles: number[];
  textureLookup: number[];
  playerStart: Vec2;
  enemies: { position: Vec2; type: string }[];
  pickups: { position: Vec2; type: string }[];
}

export interface SpriteRenderable {
  image: HTMLCanvasElement;
  position: Vec2;
  size: number;
  offsetY?: number;
  isBillboard: boolean;
  distance: number;
  type: 'enemy' | 'pickup';
  id: number;
  anchor?: 'center' | 'floor';
}

export interface Settings {
  lookSensitivity: number;
  joystickSize: number;
  uiOpacity: number;
  leftHanded: boolean;
  touchEnabled: boolean;
  dynamicResolution: number;
  volume: number;
}

export interface HUDMessage {
  text: string;
  timer: number;
}
