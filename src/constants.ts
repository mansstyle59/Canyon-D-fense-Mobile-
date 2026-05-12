import { TowerType } from './types';

export const TOWER_CONFIGS: Record<TowerType, { name: string, desc: string, cost: number, color: string, damage: number, range: number, fireRate: number, targetsAir: boolean, targetsGround: boolean, armorPiercing: boolean }> = {
  mitrailleuse: { name: 'Mitrailleuse Rapide', desc: 'Tir rapide contre l\'infanterie terrestre. Faible contre l\'armure.', cost: 50, color: 'bg-green-500', damage: 10, range: 160, fireRate: 3.5, targetsAir: false, targetsGround: true, armorPiercing: false },
  canon: { name: 'Canon Lourd', desc: 'Perce l\'armure. Lent mais mortel contre les blindés.', cost: 120, color: 'bg-blue-500', damage: 45, range: 220, fireRate: 1, targetsAir: false, targetsGround: true, armorPiercing: true },
  dca: { name: 'Tourelle DCA', desc: 'Défense antiaérienne exclusive. Cadence de tir élevée.', cost: 150, color: 'bg-cyan-500', damage: 25, range: 300, fireRate: 5, targetsAir: true, targetsGround: false, armorPiercing: false },
  mortier: { name: 'Mortier Explosif', desc: 'Dégâts massifs de zone contre les cibles terrestres.', cost: 250, color: 'bg-orange-500', damage: 100, range: 320, fireRate: 0.5, targetsAir: false, targetsGround: true, armorPiercing: true },
  missile: { name: 'Lance-missiles', desc: 'Cible sol/air à longue distance. Très puissant, tir très lent.', cost: 500, color: 'bg-red-500', damage: 250, range: 450, fireRate: 0.25, targetsAir: true, targetsGround: true, armorPiercing: true },
};

export const ENEMY_CONFIGS = {
  jeep: { hp: 120, speed: 70, reward: 25, isFlying: false },
  squad: { hp: 60, speed: 50, reward: 15, isFlying: false },
  buggy: { hp: 80, speed: 120, reward: 35, isFlying: false },
  apc: { hp: 350, speed: 45, reward: 60, isFlying: false, isArmored: true },
  tank: { hp: 900, speed: 35, reward: 120, isFlying: false, isArmored: true },
  heavy_tank: { hp: 2500, speed: 20, reward: 400, isFlying: false, isArmored: true },
  jet: { hp: 300, speed: 100, reward: 180, isFlying: true },
  emp_drone: { hp: 200, speed: 50, reward: 140, isFlying: true, canDisableTurrets: true },
  stealth_heli: { hp: 180, speed: 80, reward: 180, isFlying: true, isStealth: true },
  mech: { hp: 6000, speed: 15, reward: 800, isFlying: false, isArmored: true, isBoss: true },
  motorcycle: { hp: 45, speed: 160, reward: 25, isFlying: false },
  bomber: { hp: 1200, speed: 30, reward: 350, isFlying: true, isArmored: true },
  medic_truck: { hp: 400, speed: 40, reward: 180, isFlying: false, canHeal: true },
}

