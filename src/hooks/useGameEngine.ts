import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Enemy, PlacedTurret, Projectile, EnemyType, TowerType } from '../types';
import { getPointOnPath, getPathPoints } from '../utils/path';
import { ENEMY_CONFIGS, TOWER_CONFIGS } from '../constants';

const computeSellValue = (type: TowerType, level: number): number => {
  const baseCost = TOWER_CONFIGS[type].cost;
  // Total invested = baseCost * sum(1.5^i, i=0..level-1) = baseCost * (1.5^level - 1) / 0.5
  // Sell at 50% refund
  return Math.floor(baseCost * (Math.pow(1.5, level) - 1));
};

const getLevelWaves = (level: number) => {
  const numWaves = level * 10;
  // Each level adds 50% more difficulty on top of wave scaling
  const levelScale = 1 + (level - 1) * 0.5;

  return Array.from({ length: numWaves }).map((_, i) => {
    const waveNumber = i + 1;
    const isBossWave = waveNumber % 5 === 0;

    if (isBossWave) {
      // Wave 20, 40, 60… — solo mega mech boss
      if (waveNumber % 20 === 0) {
        return {
          count: 1 + Math.floor(waveNumber / 20),
          type: 'mech' as any,
          interval: 8,
          hpMult: (2.5 + waveNumber * 0.12) * levelScale,
        };
      }
      // Wave 10, 30, 50… — heavy tank column
      if (waveNumber % 10 === 0) {
        return {
          count: 3 + Math.floor(waveNumber / 10),
          type: 'heavy_tank' as any,
          interval: 4,
          hpMult: (2.0 + waveNumber * 0.08) * levelScale,
        };
      }
      // Wave 15, 45… — bomber squadron
      if (waveNumber % 15 === 0) {
        return {
          count: 4 + Math.floor(waveNumber / 15),
          type: 'bomber' as any,
          interval: 2.5,
          hpMult: (1.8 + waveNumber * 0.07) * levelScale,
        };
      }
      // Wave 5, 25, 35… — jet swarm
      return {
        count: 4 + Math.floor(waveNumber / 5) * 2,
        type: 'jet' as any,
        interval: 0.7,
        hpMult: (1.2 + waveNumber * 0.05) * levelScale,
      };
    }

    // Normal waves: count 7 → 24 over 10 waves, interval 1.56s → 0.35s floor
    const count = 6 + Math.floor(waveNumber * 1.8);
    const interval = Math.max(0.35, 1.6 - waveNumber * 0.04);
    // HP capped at 5.5× base to prevent bullet-sponge enemies
    const hpMult = Math.min(5.5, 0.75 + waveNumber * 0.12) * levelScale;

    // Gradual enemy type introduction
    const types: string[] = ['squad', 'jeep'];
    if (waveNumber >= 2) types.push('motorcycle');
    if (waveNumber >= 3) types.push('buggy');
    if (waveNumber >= 6) types.push('apc');
    if (waveNumber >= 7) types.push('medic_truck');
    if (waveNumber >= 8) types.push('emp_drone');
    if (waveNumber >= 9) types.push('tank');
    if (waveNumber >= 11) types.push('stealth_heli');
    if (waveNumber >= 14) types.push('heavy_tank');

    return { count, type: types as any, interval, hpMult };
  });
};

export function useGameEngine() {
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const speedRef = useRef<1 | 2>(1);

  const [gameState, setGameState] = useState<GameState>(() => {
    const savedLevel = parseInt(localStorage.getItem('defense_level') || '1', 10);
    const waves = getLevelWaves(savedLevel);
    return {
      money: 250 + (savedLevel * 100),
      lives: 10,
      level: savedLevel,
      wave: 1,
      maxWaves: waves.length,
      status: 'playing',
      waveActive: false,
      enemies: [],
      turrets: {},
      projectiles: [],
      waveTime: 0,
      lastAirstrikeTime: 0,
      activeAirstrikes: [],
    };
  });

  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  const wavesRef = useRef(getLevelWaves(gameState.level));

  const lastTimeRef = useRef<number>(performance.now());
  const requestRef = useRef<number>(0);
  const waveDataRef = useRef({ spawned: 0, timeSinceLastSpawn: 0 });
  const pendingAirstrikeRef = useRef(false);

  const toggleSpeed = useCallback(() => {
    setSpeedMultiplier(prev => {
      const next = prev === 1 ? 2 : 1;
      speedRef.current = next;
      return next;
    });
  }, []);

  const buildTurret = useCallback((slotId: string, x: number, y: number, type: TowerType) => {
    const cost = TOWER_CONFIGS[type].cost;
    if (stateRef.current.money >= cost && !stateRef.current.turrets[slotId] && stateRef.current.status === 'playing') {
      setGameState(prev => ({
        ...prev,
        money: prev.money - cost,
        turrets: {
          ...prev.turrets,
          [slotId]: {
            id: slotId,
            type,
            level: 1,
            x,
            y,
            damage: TOWER_CONFIGS[type].damage,
            range: TOWER_CONFIGS[type].range,
            fireRate: TOWER_CONFIGS[type].fireRate,
            lastFired: 0
          }
        }
      }));
    }
  }, []);

  const upgradeTurret = useCallback((slotId: string) => {
    const turret = stateRef.current.turrets[slotId];
    if (!turret || stateRef.current.status !== 'playing') return;

    const baseConfig = TOWER_CONFIGS[turret.type];
    const upgradeCost = Math.floor(baseConfig.cost * Math.pow(1.5, turret.level));

    if (stateRef.current.money >= upgradeCost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - upgradeCost,
        turrets: {
          ...prev.turrets,
          [slotId]: {
            ...turret,
            level: turret.level + 1,
            damage: Math.floor(turret.damage * 1.4),
            range: Math.floor(turret.range * 1.1),
            fireRate: parseFloat((turret.fireRate * 1.1).toFixed(2))
          }
        }
      }));
    }
  }, []);

  const sellTurret = useCallback((slotId: string) => {
    const turret = stateRef.current.turrets[slotId];
    if (!turret || stateRef.current.status !== 'playing') return;
    const refund = computeSellValue(turret.type, turret.level);
    setGameState(prev => {
      const newTurrets = { ...prev.turrets };
      delete newTurrets[slotId];
      return { ...prev, money: prev.money + refund, turrets: newTurrets };
    });
  }, []);

  const updateGame = useCallback((time: number) => {
    const rawDelta = (time - lastTimeRef.current) / 1000;
    const deltaTime = rawDelta * speedRef.current;
    lastTimeRef.current = time;

    const state = stateRef.current;
    
    // Quick escape if not playing
    if (state.status !== 'playing') {
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    let { money, lives, wave, enemies, turrets, projectiles, waveActive } = state;
    let newStatus = state.status;
    let waveCompleted = false;

    // Apply pending airstrike damage (triggered by callAirstrike via ref)
    if (pendingAirstrikeRef.current) {
      pendingAirstrikeRef.current = false;
      enemies.forEach(e => { if (e.hp - 1000 <= 0 && !e.isBoss) money += e.reward; });
      enemies = enemies.map(e => ({ ...e, hp: e.hp - 1000 })).filter(e => e.hp > 0);
    }

    // 1. Spawning enemies
    const currentWaves = wavesRef.current;
    const currentWaveInfo = currentWaves[wave - 1];
    if (waveActive && currentWaveInfo && waveDataRef.current.spawned < currentWaveInfo.count) {
      waveDataRef.current.timeSinceLastSpawn += deltaTime;
      if (waveDataRef.current.timeSinceLastSpawn >= currentWaveInfo.interval) {
        waveDataRef.current.timeSinceLastSpawn = 0;
        waveDataRef.current.spawned++;
        
        const waveType = currentWaveInfo.type as EnemyType | EnemyType[];
        const type = Array.isArray(waveType) ? waveType[Math.floor(Math.random() * waveType.length)] : waveType;
        const baseConfig = ENEMY_CONFIGS[type] as any;
        
        const startPoint = getPointOnPath(0);
        const nextPoint = getPointOnPath(1);
        const rotation = Math.atan2(nextPoint.y - startPoint.y, nextPoint.x - startPoint.x) * (180 / Math.PI);

        enemies = [...enemies, {
          id: Math.random().toString(36).substr(2, 9),
          type,
          hp: baseConfig.hp * currentWaveInfo.hpMult,
          maxHp: baseConfig.hp * currentWaveInfo.hpMult,
          progress: 0,
          speed: baseConfig.speed,
          reward: baseConfig.reward,
          isFlying: baseConfig.isFlying,
          isArmored: baseConfig.isArmored,
          canDisableTurrets: baseConfig.canDisableTurrets,
          canHeal: baseConfig.canHeal,
          isStealth: baseConfig.isStealth,
          isBoss: baseConfig.isBoss,
          x: startPoint.x,
          y: startPoint.y,
          rotation
        }];
      }
    } else if (waveActive && enemies.length === 0 && waveDataRef.current.spawned >= (currentWaveInfo?.count ?? 0)) {
       // Wave completed — award bonus
       const waveBonus = 75 + wave * 30;
       money += waveBonus;
       waveActive = false;
       if (wave < currentWaves.length) {
         wave++;
         waveDataRef.current = { spawned: 0, timeSinceLastSpawn: 0 };
       } else {
         newStatus = 'victory';
       }
    }

    const { length: totalPathLength } = getPathPoints();

    // 2. Move enemies
    let newEnemies = [];
    for (const enemy of enemies) {
      const nextProgress = enemy.progress + enemy.speed * deltaTime;
      
      if (nextProgress >= totalPathLength && totalPathLength > 0) {
        // Enemy reached base
        if (enemy.isBoss) {
          lives -= 5;
        } else if (enemy.maxHp > 800) {
          lives -= 2;
        } else {
          lives -= 1;
        }
        
        if (lives <= 0) {
          lives = 0;
          newStatus = 'game_over';
        }
      } else {
        const pt = getPointOnPath(nextProgress);
        let rotation = enemy.rotation;
        
        // update rotation if moving
        if (pt.x !== enemy.x || pt.y !== enemy.y) {
           rotation = Math.atan2(pt.y - enemy.y, pt.x - enemy.x) * (180 / Math.PI);
        }

        newEnemies.push({
          ...enemy,
          progress: nextProgress,
          x: pt.x,
          y: pt.y,
          rotation
        });
      }
    }
    enemies = newEnemies;

    // 3. Special Enemy Abilities Logic and Target Acquisition
    const newProjectiles = [...projectiles];
    const updatedTurrets = { ...turrets };
    
    // Process EMP drones and Medics
    for (const enemy of enemies) {
      if (enemy.canDisableTurrets) {
        Object.values(updatedTurrets).forEach((t: any) => {
          const dist = Math.sqrt(Math.pow(enemy.x - t.x, 2) + Math.pow(enemy.y - t.y, 2));
          if (dist < 100) {
            t.disabledUntil = time + 1000;
          }
        });
      }
      if (enemy.canHeal) {
         enemies.forEach(otherEnemy => {
           if (enemy.id !== otherEnemy.id) {
             const dist = Math.sqrt(Math.pow(enemy.x - otherEnemy.x, 2) + Math.pow(enemy.y - otherEnemy.y, 2));
             if (dist < 120 && otherEnemy.hp < otherEnemy.maxHp) {
               otherEnemy.hp = Math.min(otherEnemy.maxHp, otherEnemy.hp + (otherEnemy.maxHp * 0.05 * deltaTime));
             }
           }
         });
      }
    }

    Object.keys(updatedTurrets).forEach(key => {
      const turret = updatedTurrets[key];
      const turretConfig = TOWER_CONFIGS[turret.type];
      
      const dist = (e: Enemy) => Math.sqrt(Math.pow(e.x - turret.x, 2) + Math.pow(e.y - turret.y, 2));

      // Find targets in range
      let target = enemies.find(e => e.id === turret.targetId);
      
      const isValidTarget = (e: Enemy) => {
        if (e.isFlying && !turretConfig.targetsAir) return false;
        if (!e.isFlying && !turretConfig.targetsGround) return false;
        if (e.isStealth && dist(e) > turret.range * 0.5) return false;
        return true;
      };

      if (!target || dist(target) > turret.range || !isValidTarget(target)) {
        const validTargets = enemies.filter(e => isValidTarget(e) && dist(e) <= turret.range);
        if (validTargets.length > 0) {
          validTargets.sort((a, b) => {
            if (Math.abs(b.progress - a.progress) > 0.05) {
               return b.progress - a.progress;
            }
            return b.hp - a.hp;
          });
          target = validTargets[0];
          turret.targetId = target.id;
        } else {
          turret.targetId = undefined;
        }
      }

      if (target) {
        if (turret.disabledUntil && turret.disabledUntil > time) {
          return;
        }

        const timeSinceLastFire = time - turret.lastFired;
        const cooldownMs = 1000 / turret.fireRate;
        if (timeSinceLastFire >= cooldownMs) {
          newProjectiles.push({
            id: Math.random().toString(36).substr(2, 9),
            towerType: turret.type,
            x: turret.x,
            y: turret.y,
            targetX: target.x,
            targetY: target.y,
            targetId: target.id,
            speed: turret.type === 'missile' ? 300 : 800,
            damage: turret.damage
          });
          turret.lastFired = time;
        }
      }
    });

    // 4. Move projectiles and apply damage
    let finalProjectiles = [];
    for (const proj of newProjectiles) {
      const target = enemies.find(e => e.id === proj.targetId);
      
      let tx = proj.targetX;
      let ty = proj.targetY;

      if (target) {
        tx = target.x;
        ty = target.y;
      }

      const dx = tx - proj.x;
      const dy = ty - proj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const moveDist = proj.speed * deltaTime;

      if (moveDist >= distance) {
        if (target) {
          let damageToApply = proj.damage;
          const projTowerConfig = TOWER_CONFIGS[proj.towerType];
          
          if (target.isArmored && projTowerConfig && !projTowerConfig.armorPiercing) {
            damageToApply *= 0.3;
          }
          
          target.hp -= damageToApply;
          if (target.hp <= 0) {
            money += target.reward;
            enemies = enemies.filter(e => e.id !== target.id);
          }
        }
      } else {
        finalProjectiles.push({
          ...proj,
          x: proj.x + (dx / distance) * moveDist,
          y: proj.y + (dy / distance) * moveDist,
          targetX: tx,
          targetY: ty
        });
      }
    }
    
    // Cleanup old airstrikes
    const now = Date.now();
    const activeAirstrikes = state.activeAirstrikes.filter(a => now - a.startTime < 4000);

    setGameState({
      ...state,
      money,
      lives,
      wave,
      waveActive,
      status: newStatus,
      enemies,
      projectiles: finalProjectiles,
      turrets: updatedTurrets,
      activeAirstrikes
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updateGame]);

  const callAirstrike = useCallback(() => {
    const state = stateRef.current;
    if (state.status !== 'playing') return;
    if (state.wave < 5) return;
    if (Date.now() - state.lastAirstrikeTime < 20000) return;
    pendingAirstrikeRef.current = true;
    setGameState(prev => ({
      ...prev,
      lastAirstrikeTime: Date.now(),
      activeAirstrikes: [...prev.activeAirstrikes, { id: Math.random().toString(), startTime: Date.now() }]
    }));
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev, 
      status: prev.status === 'playing' ? 'paused' : 'playing'
    }));
  }, []);

  const startWave = useCallback(() => {
    setGameState(prev => {
      if (!prev.waveActive && prev.status === 'playing') {
        return { ...prev, waveActive: true };
      }
      return prev;
    });
  }, []);

  return { gameState, buildTurret, upgradeTurret, sellTurret, togglePause, startWave, callAirstrike, speedMultiplier, toggleSpeed };
}
