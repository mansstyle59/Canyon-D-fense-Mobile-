export type ModifierType = 'fog' | 'energy_surge' | 'armored_convoy' | 'none';

export interface WaveModifier {
  type: ModifierType;
  name: string;
  description: string;
}

export type TowerType = 'mitrailleuse' | 'canon' | 'mortier' | 'missile' | 'dca' | 'plasma';
export type EnemyType = 'jeep' | 'tank' | 'squad' | 'apc' | 'jet' | 'buggy' | 'heavy_tank' | 'emp_drone' | 'stealth_heli' | 'mech' | 'motorcycle' | 'bomber' | 'medic_truck';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  rotation: number;
  hp: number;
  maxHp: number;
  progress: number;
  speed: number;
  reward: number;
  isFlying: boolean;
  isArmored?: boolean;
  canDisableTurrets?: boolean;
  canHeal?: boolean;
  isStealth?: boolean;
  isBoss?: boolean;
  isElite?: boolean;
  lastHitTime?: number;
  laneOffset: number;
}

export type TargetingPriority = 'first' | 'last' | 'strong' | 'weak' | 'armored' | 'stealth' | 'fast';

export interface PlacedTurret {
  id: string; // The slot id
  type: TowerType;
  specialization?: string;
  x: number;
  y: number;
  level: number;
  hp: number;
  maxHp: number;
  range: number;
  damage: number;
  fireRate: number; // shots per second
  rotation?: number;
  aoeOverride?: number;
  armorPiercingOverride?: boolean;
  lastFired: number; // timestamp
  targetId?: string | null;
  targetPriority?: TargetingPriority;
  disabledUntil?: number;
}

export interface Projectile {
  id: string;
  towerType: TowerType;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  aoe?: number;
  armorPiercing?: boolean;
  targetId: string;
  rotation?: number;
}

export interface AirstrikeEvent {
  id: string;
  startTime: number;
  x: number;
  y: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  radius: number;
  startTime: number;
  color: string;
}

export interface TerrainDebris {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: 'rock' | 'dust';
  opacity: number;
  createdAt: number;
}

export type GameMode = 'campaign' | 'survival' | 'time_attack';

export interface GameState {
  money: number;
  lives: number;
  level: number;
  wave: number;
  maxWaves: number;
  mode: GameMode;
  status: 'playing' | 'paused' | 'game_over' | 'victory' | 'menu';
  waveActive: boolean;
  enemies: Enemy[];
  turrets: Record<string, PlacedTurret>;
  projectiles: Projectile[];
  waveTime: number; 
  gameTime?: number; // Total time elapsed or remaining for Time Attack
  lastAirstrikeTime: number;
  activeAirstrikes: AirstrikeEvent[];
  explosions: Explosion[];
  terrainDebris: TerrainDebris[];
  activeModifier?: WaveModifier | null;
}
