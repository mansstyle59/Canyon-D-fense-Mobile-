import { TowerType } from './types';

export const TOWER_CONFIGS: Record<TowerType, { name: string, desc: string, cost: number, color: string, damage: number, hp: number, range: number, fireRate: number, targetsAir: boolean, targetsGround: boolean, armorPiercing: boolean, aoe: number }> = {
  mitrailleuse: { name: 'M-16 Sentinel', desc: 'Mitrailleuse lourde anti-personnel. Très rapide mais inefficace contre le blindage.', cost: 60, color: 'bg-green-500', damage: 12, hp: 100, range: 187, fireRate: 4, targetsAir: false, targetsGround: true, armorPiercing: false, aoe: 0 },
  canon: { name: 'Tank-Killer 88', desc: 'Canon antichar à haute vélocité. Perce les blindages les plus lourds.', cost: 150, color: 'bg-orange-500', damage: 55, hp: 250, range: 240, fireRate: 0.9, targetsAir: false, targetsGround: true, armorPiercing: true, aoe: 0 },
  dca: { name: 'Flak-38 Skyguard', desc: 'Défense antiaérienne à cadence infernale. Uniquement cibles volantes.', cost: 180, color: 'bg-cyan-500', damage: 35, hp: 200, range: 320, fireRate: 5.5, targetsAir: true, targetsGround: false, armorPiercing: false, aoe: 0 },
  mortier: { name: 'Howitzer M2', desc: 'Appui feu d\'artillerie. Dégâts de zone massifs sur les positions terrestres.', cost: 350, color: 'bg-red-500', damage: 120, hp: 300, range: 350, fireRate: 0.4, targetsAir: false, targetsGround: true, armorPiercing: true, aoe: 100 },
  missile: { name: 'S-400 Triumph', desc: 'Lance-missiles guidés multi-rôles. Excellente portée et puissance.', cost: 650, color: 'bg-pink-500', damage: 320, hp: 450, range: 500, fireRate: 0.2, targetsAir: true, targetsGround: true, armorPiercing: true, aoe: 150 },
  plasma: { name: 'Prototype X-1', desc: 'Arme à énergie expérimentale. Découpe n\'importe quelle cible à une vitesse ahurissante.', cost: 1100, color: 'bg-purple-500', damage: 45, hp: 600, range: 210, fireRate: 8, targetsAir: true, targetsGround: true, armorPiercing: true, aoe: 0 },
};

export const ENEMY_CONFIGS = {
  jeep: { hp: 150, speed: 75, reward: 35, isFlying: false },
  squad: { hp: 80, speed: 55, reward: 20, isFlying: false },
  buggy: { hp: 100, speed: 125, reward: 45, isFlying: false },
  apc: { hp: 450, speed: 48, reward: 80, isFlying: false, isArmored: true },
  tank: { hp: 1100, speed: 38, reward: 150, isFlying: false, isArmored: true },
  heavy_tank: { hp: 3200, speed: 22, reward: 550, isFlying: false, isArmored: true },
  jet: { hp: 400, speed: 105, reward: 250, isFlying: true },
  emp_drone: { hp: 250, speed: 55, reward: 200, isFlying: true, canDisableTurrets: true },
  stealth_heli: { hp: 220, speed: 85, reward: 250, isFlying: true, isStealth: true },
  mech: { hp: 8000, speed: 18, reward: 1200, isFlying: false, isArmored: true, isBoss: true },
  motorcycle: { hp: 60, speed: 170, reward: 30, isFlying: false },
  bomber: { hp: 1500, speed: 35, reward: 500, isFlying: true, isArmored: true },
  medic_truck: { hp: 500, speed: 45, reward: 250, isFlying: false, canHeal: true },
}

export const WAVE_MODIFIERS = [
  { type: 'fog', name: 'Vague de Brouillard', description: 'Visibilité réduite. Les unités furtives sont visibles à seulement 25% de la portée.' },
  { type: 'energy_surge', name: 'Vague Énergétique', description: 'Surcharge système : dégâts des tours réduits de 25%.' },
  { type: 'armored_convoy', name: 'Vague Blindée', description: 'Blindage renforcé : tous les ennemis terrestres ignorent une partie des dégâts.' },
];

export const TOWER_SPECIALIZATIONS: Record<string, Record<string, { name: string, desc: string, bonus: { damage?: number, range?: number, fireRate?: number, aoe?: number, armorPiercing?: boolean } }>> = {
  mitrailleuse: {
    gatling: { name: 'M-134 Gatling', desc: 'Cadence de tir infernale déchiquetant les cibles légères.', bonus: { fireRate: 2.2, damage: 0.75 } },
    armor_piercing: { name: 'Perce-Blindage', desc: 'Projectiles à pointe tungstène. Ignore 50% du blindage.', bonus: { armorPiercing: true, damage: 1.2 } }
  },
  canon: {
    long_range: { name: 'Canon de Siège', desc: 'Tube allongé pour une portée extrême sur tout le champ.', bonus: { range: 1.6, damage: 1.5, fireRate: 0.8, armorPiercing: true } },
    artillery: { name: 'Obusier Lourd', desc: 'Projectiles explosifs. Ajoute des dégâts de zone au canon.', bonus: { aoe: 90, damage: 1.3, fireRate: 0.75 } }
  },
  dca: {
    flak: { name: 'Flak-Burst', desc: 'Explosions aériennes. Dégâts de zone contre les cibles volantes.', bonus: { aoe: 100, damage: 1.1 } },
    rapid: { name: 'DCA Gatling', desc: 'Vitesse de rotation et cadence de tir accrues.', bonus: { fireRate: 1.5, range: 1.2 } }
  },
  mortier: {
    siege: { name: 'Obusier de Siège', desc: 'Dégâts colossaux contre les cibles lentes et blindées.', bonus: { damage: 2, range: 1.3, fireRate: 0.7 } },
    cluster: { name: 'Pluie de Grenades', desc: 'Zone d\'effet massivement étendue via sous-munitions.', bonus: { aoe: 1.8, damage: 0.8 } }
  },
  missile: {
    hyper_velocity: { name: 'Missile Hypersonique', desc: 'Vitesse d\'interception foudroyante et dégâts accrus.', bonus: { damage: 1.5, range: 1.2 } },
    saturation: { name: 'Barrage MIRV', desc: 'Capacité de destruction de zone décuplée.', bonus: { aoe: 1.5, damage: 1.2 } }
  },
  plasma: {
    pulsar: { name: 'Pulsar à Énergie', desc: 'Concentration de plasma pur réduisant tout en cendres.', bonus: { damage: 2, fireRate: 0.8 } },
    diffuser: { name: 'Diffuseur Large', desc: 'Rayon de plasma élargi balayant tout sur son passage.', bonus: { range: 1.5, damage: 1.2 } }
  }
};

