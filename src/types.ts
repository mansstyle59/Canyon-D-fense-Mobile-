export type TowerType = 'mitrailleuse' | 'canon' | 'mortier' | 'missile' | 'dca';
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
}

export interface PlacedTurret {
  id: string; // The slot id
  type: TowerType;
  x: number;
  y: number;
  level: number;
  range: number;
  damage: number;
  fireRate: number; // shots per second
  lastFired: number; // timestamp
  targetId?: string | null;
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
  targetId: string;
}

export interface AirstrikeEvent {
  id: string;
  startTime: number;
}

export interface GameState {
  money: number;
  lives: number;
  level: number;
  wave: number;
  maxWaves: number;
  status: 'playing' | 'paused' | 'game_over' | 'victory';
  waveActive: boolean;
  enemies: Enemy[];
  turrets: Record<string, PlacedTurret>;
  projectiles: Projectile[];
  waveTime: number; // Time until next enemy spawn
  lastAirstrikeTime: number;
  activeAirstrikes: AirstrikeEvent[];
}
