import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Enemy, PlacedTurret, Projectile, EnemyType, TowerType } from '../types';
import { getPointOnPath, getPathPoints } from '../utils/path';
import { ENEMY_CONFIGS, TOWER_CONFIGS } from '../constants';

const getLevelWaves = (level: number) => {
  const numWaves = level * 10;
  return Array.from({ length: numWaves }).map((_, i) => {
    const waveNumber = i + 1;
    const isBossWave = waveNumber % 5 === 0;
    
    if (isBossWave) {
      if (waveNumber % 20 === 0) {
        return { count: 1 + Math.floor(waveNumber / 20), type: 'mech', interval: 5, hpMult: 1.5 + (waveNumber * 0.3) } as any;
      }
      if (waveNumber % 10 === 0) {
         return { count: 1 + Math.floor(waveNumber / 10), type: 'heavy_tank', interval: 3, hpMult: 1.5 + (waveNumber * 0.5) } as any;
      }
      if (waveNumber % 15 === 0) {
         return { count: 2 + Math.floor(waveNumber / 15), type: 'bomber', interval: 4, hpMult: 1.5 + (waveNumber * 0.4) } as any;
      }
      return { count: 3 + Math.floor(waveNumber / 5) * 2, type: 'jet', interval: 1.5, hpMult: 1.5 + (waveNumber * 0.5) } as any;
    }
    
    if (waveNumber < 5) {
       const types = ['squad', 'jeep', 'buggy', 'motorcycle'];
       return { count: 4 + waveNumber * 2, type: types[waveNumber - 1] || 'squad', interval: 1.8 - (waveNumber * 0.1), hpMult: 0.8 + (waveNumber * 0.1) } as any;
    }
    
    // As levels progress, we introduce harder units
    let types = ['jeep', 'squad'];
    if (waveNumber > 2) types.push('buggy', 'motorcycle');
    if (waveNumber > 4) types.push('apc', 'medic_truck');
    if (waveNumber > 6) types.push('tank', 'emp_drone');
    if (waveNumber > 8) types.push('stealth_heli');
    if (waveNumber > 12) types.push('heavy_tank');
    
    // Instead of selecting a single type, we return the array. The spawner will mix them.
    return { count: 8 + Math.floor(waveNumber * 1.5), type: types, interval: Math.max(0.5, 1.5 - (waveNumber * 0.03)), hpMult: 1.0 + (waveNumber * 0.15) };
  });
};

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedLevel = parseInt(localStorage.getItem('defense_level') || '1', 10);
    const waves = getLevelWaves(savedLevel);
    return {
      money: 300 + (savedLevel * 50),
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

  const updateGame = useCallback((time: number) => {
    const deltaTime = (time - lastTimeRef.current) / 1000;
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
        
        const pathData = getPathPoints();
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
       // Wave completed
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
        const pt = enemy.isFlying 
          ? {
              x: getPointOnPath(0).x + (getPointOnPath(totalPathLength).x - getPointOnPath(0).x) * (nextProgress / totalPathLength),
              y: getPointOnPath(0).y + (getPointOnPath(totalPathLength).y - getPointOnPath(0).y) * (nextProgress / totalPathLength)
            }
          : getPointOnPath(nextProgress);
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
        if (e.isStealth && dist(e) > turret.range * 0.5) return false; // Stealth units visible only at half range
        return true;
      };

      if (!target || dist(target) > turret.range || !isValidTarget(target)) {
        const validTargets = enemies.filter(e => isValidTarget(e) && dist(e) <= turret.range);
        if (validTargets.length > 0) {
          validTargets.sort((a, b) => {
            // Prioritize enemies closer to the base (higher progress)
            if (Math.abs(b.progress - a.progress) > 0.05) {
               return b.progress - a.progress;
            }
            // Tie-breaker: higher HP enemies
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

        // Check fire rate
        const timeSinceLastFire = time - turret.lastFired;
        const cooldownMs = 1000 / turret.fireRate;
        if (timeSinceLastFire >= cooldownMs) {
          // Fire projectile
          newProjectiles.push({
            id: Math.random().toString(36).substr(2, 9),
            towerType: turret.type,
            x: turret.x,
            y: turret.y,
            targetX: target.x,
            targetY: target.y,
            targetId: target.id,
            speed: turret.type === 'missile' ? 300 : 800, // pixels per sec
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

      // Homing projectiles
      if (target) {
        tx = target.x;
        ty = target.y;
      }

      const dx = tx - proj.x;
      const dy = ty - proj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const moveDist = proj.speed * deltaTime;

      if (moveDist >= distance) {
        // Hit
        if (target) {
          let damageToApply = proj.damage;
          const projTowerConfig = TOWER_CONFIGS[proj.towerType];
          
          if (target.isArmored && projTowerConfig && !projTowerConfig.armorPiercing) {
            damageToApply *= 0.3; // 70% reduction
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

    // Sync React State
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
    setGameState(prev => {
      // Must be playing, wave >= 5, and cooldown of 20s must have passed
      if (prev.status !== 'playing') return prev;
      if (prev.wave < 5) return prev;
      if (Date.now() - prev.lastAirstrikeTime < 20000) return prev;

      // Deal massive damage to all enemies
      const newEnemies = prev.enemies.map(e => ({
        ...e,
        hp: e.hp - 1000 // 1000 damage
      })).filter(e => e.hp > 0);

      // We actually want the enemies to explode. If they die, we gain money.
      let moneyGained = 0;
      prev.enemies.forEach(e => {
        if (e.hp - 1000 <= 0 && !e.isBoss) {
            // Boss takes damage, but others die and give reward
            moneyGained += e.reward;
        }
      });
      // Keep bosses if they survived
      const survivingEnemies = prev.enemies.map(e => ({
          ...e,
          hp: e.hp - 1000
      })).filter(e => e.hp > 0);

      return {
        ...prev,
        money: prev.money + moneyGained,
        enemies: survivingEnemies,
        lastAirstrikeTime: Date.now(),
        activeAirstrikes: [...prev.activeAirstrikes, { id: Math.random().toString(), startTime: Date.now() }]
      };
    });
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

  return { gameState, buildTurret, upgradeTurret, togglePause, startWave, callAirstrike };
}
