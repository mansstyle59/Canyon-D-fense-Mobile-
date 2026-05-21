import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Enemy, PlacedTurret, Projectile, EnemyType, TowerType, TargetingPriority, GameMode } from '../types';
import { getPointOnPath, getPathPoints } from '../utils/path';
import { ENEMY_CONFIGS, TOWER_CONFIGS, WAVE_MODIFIERS, TOWER_SPECIALIZATIONS } from '../constants';
import { triggerHaptic } from '../utils/haptics';

const getLevelWaves = (level: number, mode: GameMode = 'campaign', currentWave: number = 1) => {
  if (mode === 'survival' || mode === 'time_attack') {
    // Dynamic wave scaling for non-campaign modes
    const waveNumber = currentWave;
    const intensity = mode === 'survival' ? 1 + (waveNumber / 8) : 1 + (waveNumber / 12);
    const hpFactor = 1.0 + (level * 0.2) + (waveNumber * (mode === 'survival' ? 0.15 : 0.1));
    
    let types: EnemyType[] = ['squad', 'jeep'];
    if (waveNumber > 3) types.push('buggy', 'motorcycle');
    if (waveNumber > 7) types.push('apc', 'medic_truck', 'emp_drone');
    if (waveNumber > 12) types.push('tank', 'stealth_heli');
    if (waveNumber > 18) types.push('heavy_tank', 'jet', 'mech', 'bomber');

    return [{
      count: Math.floor(((mode === 'survival' ? 8 : 12) + waveNumber) * intensity),
      type: types,
      interval: Math.max(0.3, 1.0 - (waveNumber * 0.02)),
      hpMult: hpFactor
    }];
  }

  const numWaves = 10 + (level * 2);
  return Array.from({ length: Math.min(numWaves, 100) }).map((_, i) => {
    const waveNumber = i + 1;
    const isBossWave = waveNumber % 5 === 0;
    
    // Wave difficulty scaling
    const intensity = 1 + (waveNumber / 10);
    const hpFactor = 1.0 + (level * 0.2) + (waveNumber * 0.1);

    if (isBossWave) {
      if (waveNumber % 10 === 0) {
        const bossType = level > 2 ? 'mech' : 'heavy_tank';
        return { 
          count: 1 + Math.floor(waveNumber / 20), 
          type: [bossType, 'tank', 'apc'], 
          interval: 4, 
          hpMult: hpFactor * 1.5 
        } as any;
      }
      const eliteType = level > 1 ? 'bomber' : 'heavy_tank';
      return { 
        count: 2 + Math.floor(waveNumber / 10), 
        type: [eliteType, 'jet', 'buggy'], 
        interval: 2.5, 
        hpMult: hpFactor * 1.2 
      } as any;
    }
    
    let types: EnemyType[] = ['squad', 'jeep'];
    if (waveNumber > 3) types.push('buggy', 'motorcycle');
    if (waveNumber > 7) types.push('apc', 'medic_truck', 'emp_drone');
    if (waveNumber > 12) types.push('tank', 'stealth_heli');
    if (waveNumber > 18) types.push('heavy_tank', 'jet');

    if (waveNumber < 3) {
      return { 
        count: 6 + (waveNumber * 3), 
        type: types, 
        interval: 0.3, // Faster start (reduced from 0.6)
        hpMult: hpFactor * 0.7 
      } as any;
    }
    
    return { 
      count: Math.floor((10 + waveNumber) * intensity), 
      type: types, 
      interval: Math.max(0.4, 1.2 - (waveNumber * 0.02)), 
      hpMult: hpFactor 
    };
  });
};

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>(() => {
    return {
      money: 450,
      lives: 15,
      level: 1,
      wave: 1,
      maxWaves: 15,
      mode: 'campaign',
      status: 'menu', // Start in menu for mode selection
      enemies: [],
      turrets: {},
      projectiles: [],
      waveActive: false,
      waveTime: 0,
      gameTime: 0,
      lastAirstrikeTime: 0,
      activeAirstrikes: [],
      explosions: [],
      terrainDebris: [],
      activeModifier: null,
    };
  });

  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;
  
  const wavesRef = useRef(getLevelWaves(gameState.level, gameState.mode));
  
  const lastTimeRef = useRef<number>(performance.now());
  const requestRef = useRef<number>(0);
  const waveDataRef = useRef({ spawned: 0, timeSinceLastSpawn: 0 });

  const startGame = useCallback((mode: GameMode) => {
    const startMoney = mode === 'campaign' ? 500 : (mode === 'survival' ? 1000 : 750);
    const startLives = mode === 'survival' ? 50 : 20;
    const initialLevel = mode === 'campaign' ? (parseInt(localStorage.getItem('defense_level') || '1', 10)) : 1;
    const initialWaves = getLevelWaves(initialLevel, mode);
    
    // Clear any pending saves
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const newState: GameState = {
      money: startMoney,
      lives: startLives,
      level: initialLevel,
      wave: 1,
      maxWaves: mode === 'survival' ? 0 : initialWaves.length,
      mode,
      status: 'playing',
      enemies: [],
      turrets: {},
      projectiles: [],
      waveActive: false,
      gameTime: mode === 'time_attack' ? 300 : 0, 
      lastAirstrikeTime: 0,
      activeAirstrikes: [],
      explosions: [],
      terrainDebris: [],
      activeModifier: null,
      waveTime: 0
    };
    
    setGameState(newState);
    wavesRef.current = initialWaves;
    waveDataRef.current = { spawned: 0, timeSinceLastSpawn: 0 };
  }, []);

  // Optimized Persistance Helper - Debounced to avoid loop hitches
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveProgress = useCallback((state: GameState) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const saveObj = {
          money: state.money,
          lives: state.lives,
          level: state.level,
          wave: state.wave,
          turrets: state.turrets,
          lastAirstrikeTime: state.lastAirstrikeTime
        };
        localStorage.setItem('canyon_defense_session', JSON.stringify(saveObj));
        localStorage.setItem('defense_level', state.level.toString());
      } catch (e) {
        console.warn("Storage unreachable", e);
      }
    }, 500); // 500ms debounce
  }, []);

  const buildTurret = useCallback((slotId: string, x: number, y: number, type: TowerType) => {
    const cost = TOWER_CONFIGS[type].cost;
    if (stateRef.current.money >= cost && !stateRef.current.turrets[slotId] && stateRef.current.status === 'playing') {
      setGameState(prev => {
        const next = {
          ...prev,
          money: prev.money - cost,
          turrets: {
            ...prev.turrets,
            [slotId]: {
              id: slotId,
              type,
              level: 1,
              hp: TOWER_CONFIGS[type].hp,
              maxHp: TOWER_CONFIGS[type].hp,
              x,
              y,
              damage: TOWER_CONFIGS[type].damage,
              range: TOWER_CONFIGS[type].range,
              fireRate: TOWER_CONFIGS[type].fireRate,
              lastFired: 0,
              targetPriority: 'first'
            }
          }
        };
        saveProgress(next);
        return next;
      });
      triggerHaptic('medium');
    }
  }, [saveProgress]);

  const upgradeTurret = useCallback((slotId: string, specKey?: string) => {
    const turret = stateRef.current.turrets[slotId];
    if (!turret || stateRef.current.status !== 'playing') return;

    if (turret.level >= 5) return;

    const baseConfig = TOWER_CONFIGS[turret.type];
    const isSpecializing = turret.level === 3 && specKey;
    const upgradeCost = Math.floor(baseConfig.cost * Math.pow(1.5, turret.level) * (isSpecializing ? 1.5 : 1));

    if (stateRef.current.money >= upgradeCost) {
      setGameState(prev => {
        const updatedTurret = { ...turret };
        
        if (isSpecializing && specKey) {
          const spec = TOWER_SPECIALIZATIONS[turret.type]?.[specKey];
          if (spec) {
            updatedTurret.specialization = specKey;
            if (spec.bonus.damage) updatedTurret.damage = Math.floor(updatedTurret.damage * spec.bonus.damage);
            if (spec.bonus.range) updatedTurret.range = Math.floor(updatedTurret.range * spec.bonus.range);
            if (spec.bonus.fireRate) updatedTurret.fireRate = parseFloat((updatedTurret.fireRate * spec.bonus.fireRate).toFixed(2));
            if (spec.bonus.aoe) {
              const currentAoe = updatedTurret.aoeOverride ?? baseConfig.aoe;
              updatedTurret.aoeOverride = Math.floor(spec.bonus.aoe > 5 ? spec.bonus.aoe : currentAoe * spec.bonus.aoe);
            }
            if (spec.bonus.armorPiercing) updatedTurret.armorPiercingOverride = true;
          }
        } else {
          updatedTurret.damage = Math.floor(turret.damage * 1.4);
          updatedTurret.range = Math.floor(turret.range * 1.1);
          updatedTurret.fireRate = parseFloat((turret.fireRate * 1.1).toFixed(2));
        }

        updatedTurret.level = turret.level + 1;
        // Increase max HP on upgrade and heal slightly
        const hpIncrease = Math.floor(baseConfig.hp * 0.5 * (turret.level));
        updatedTurret.maxHp += hpIncrease;
        updatedTurret.hp += hpIncrease + (updatedTurret.maxHp * 0.2); // Heal 20% on upgrade
        updatedTurret.hp = Math.min(updatedTurret.hp, updatedTurret.maxHp);

        const next = {
          ...prev,
          money: prev.money - upgradeCost,
          turrets: {
            ...prev.turrets,
            [slotId]: updatedTurret
          }
        };
        saveProgress(next);
        return next;
      });
      triggerHaptic('success');
    }
  }, [saveProgress]);

  const updateGame = useCallback((time: number) => {
    // Cap deltaTime to 1/20th of a second to prevent massive jumps/teleporting 
    // when the browser tab is backgrounded or during heavy frame drops
    const rawDeltaTime = (time - lastTimeRef.current) / 1000;
    const deltaTime = Math.min(0.05, rawDeltaTime);
    lastTimeRef.current = time;

    const state = stateRef.current;
    
    // Quick escape if not playing
    if (state.status !== 'playing') {
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    let { money, lives, wave, enemies, turrets, projectiles, waveActive, gameTime, mode } = state;
    let newStatus = state.status;
    let waveCompleted = false;

    // 0. Game Time Logic
    if (mode === 'time_attack') {
      gameTime = Math.max(0, (gameTime || 0) - deltaTime);
      if (gameTime <= 0) {
        newStatus = 'victory'; // Survive until end of time
      }
    } else if (mode === 'survival') {
      gameTime = (gameTime || 0) + deltaTime;
    }

    // 1. Spawning enemies
    const currentWaves = wavesRef.current;
    const currentWaveInfo = mode === 'survival' ? currentWaves[0] : currentWaves[wave - 1];
    
    if (waveActive && currentWaveInfo && waveDataRef.current.spawned < currentWaveInfo.count) {
      waveDataRef.current.timeSinceLastSpawn += deltaTime;
      if (waveDataRef.current.timeSinceLastSpawn >= currentWaveInfo.interval) {
        waveDataRef.current.timeSinceLastSpawn = 0;
        waveDataRef.current.spawned++;
        
        const waveType = currentWaveInfo.type as EnemyType | EnemyType[];
        const type = Array.isArray(waveType) ? waveType[Math.floor(Math.random() * waveType.length)] : waveType;
        const baseConfig = ENEMY_CONFIGS[type] as any;
        
        const pathData = getPathPoints(state.level);
        const startPoint = getPointOnPath(0, state.level);
        const nextPoint = getPointOnPath(1, state.level);
        const rotation = Math.atan2(nextPoint.y - startPoint.y, nextPoint.x - startPoint.x) * (180 / Math.PI);

        const laneOffset = (Math.random() - 0.5) * 40; // Random offset for visual variety

        const isBoss = baseConfig.isBoss;
        const isElite = !isBoss && state.level >= 1 && state.wave >= 2 && Math.random() < 0.15;
        const hpMult = currentWaveInfo.hpMult * (isElite ? 2.5 : 1);
        const speedWaveMult = state.wave === 1 ? 1.5 : 1;
        const speedMult = (isElite ? 1.2 : 1) * speedWaveMult;
        const rewardMult = isElite ? 3 : 1;

        enemies = [...enemies, {
          id: Math.random().toString(36).substr(2, 9),
          type,
          hp: baseConfig.hp * hpMult,
          maxHp: baseConfig.hp * hpMult,
          progress: 0,
          speed: baseConfig.speed * speedMult,
          reward: Math.floor(baseConfig.reward * rewardMult),
          isFlying: baseConfig.isFlying,
          isArmored: baseConfig.isArmored || (state.activeModifier?.type === 'armored_convoy' && !baseConfig.isFlying),
          canDisableTurrets: baseConfig.canDisableTurrets,
          canHeal: baseConfig.canHeal,
          isStealth: baseConfig.isStealth,
          isBoss,
          isElite,
          x: startPoint.x,
          y: startPoint.y,
          rotation,
          laneOffset
        }];
      }
    } else if (waveActive && enemies.length === 0 && waveDataRef.current.spawned >= (currentWaveInfo?.count ?? 0)) {
       // Wave completed
       waveActive = false;
       if (mode === 'survival' || mode === 'time_attack' || wave < currentWaves.length) {
         wave++;
         waveDataRef.current = { spawned: 0, timeSinceLastSpawn: 0 };
         if (mode === 'survival' || mode === 'time_attack') {
           wavesRef.current = getLevelWaves(state.level, mode, wave);
         }
         saveProgress({ ...state, wave, waveActive });
       } else {
         newStatus = 'victory';
         saveProgress({ ...state, level: state.level + 1, money, lives, wave: 1 });
       }
       state.activeModifier = null;
    }

    const { length: totalPathLength } = getPathPoints(state.level);

    // 2. Move enemies
    let newEnemies = [];
    const elitePositions = enemies.filter(e => e.isElite).map(e => ({ x: e.x, y: e.y }));

    for (const enemy of enemies) {
      let currentEnemySpeed = enemy.speed;
      
      // Elite Aura: nearby allies (non-elite) get a speed boost
      if (!enemy.isElite && !enemy.isBoss && elitePositions.length > 0) {
        const isNearElite = elitePositions.some(pos => {
          const dx = pos.x - enemy.x;
          const dy = pos.y - enemy.y;
          return (dx*dx + dy*dy) < 100*100; // Use squared distance for perf
        });
        if (isNearElite) {
           currentEnemySpeed *= 1.25;
        }
      }

      const nextProgress = enemy.progress + currentEnemySpeed * deltaTime;
      
      // Elite Capacity: Regeneration
      let currentHp = enemy.hp;
      if (enemy.isElite && enemy.hp < enemy.maxHp) {
        currentHp = Math.min(enemy.maxHp, enemy.hp + (enemy.maxHp * 0.02) * deltaTime); // Increased slightly for challenge
      }
      
      if (nextProgress >= totalPathLength && totalPathLength > 0) {
        // Enemy reached base
        lives -= enemy.isBoss ? 5 : (enemy.maxHp > 800 ? 2 : 1);
        triggerHaptic('heavy');

        if (lives <= 0) {
          lives = 0;
          newStatus = 'game_over';
        }
      } else {
        let pt;
        if (enemy.isFlying) {
          const t = nextProgress / totalPathLength;
          // Air units fly path with a slight sine wave for smoother "flight" feel
          pt = {
            x: 100 + (800 - 100) * t + Math.sin(t * Math.PI) * 150,
            y: -200 + (1000 + 400) * t
          };
        } else {
          const rawPt = getPointOnPath(nextProgress, state.level);
          const nextPt = getPointOnPath(nextProgress + 1, state.level);
          const dx = nextPt.x - rawPt.x;
          const dy = nextPt.y - rawPt.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const px = -dy / dist;
          const py = dx / dist;
          
          pt = {
            x: rawPt.x + px * enemy.laneOffset,
            y: rawPt.y + py * enemy.laneOffset
          };
        }
        
        let rotation = enemy.rotation;
        if (pt.x !== enemy.x || pt.y !== enemy.y) {
           const targetRotation = Math.atan2(pt.y - enemy.y, pt.x - enemy.x) * (180 / Math.PI);
           const diff = targetRotation - rotation;
           const normalizedDiff = ((diff + 540) % 360) - 180;
           // Smoother rotation using a fixed step or lerp that scales with deltaTime
           rotation += normalizedDiff * Math.min(1, deltaTime * 12);
        }

        newEnemies.push({
          ...enemy,
          progress: nextProgress,
          hp: currentHp,
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
    const turretList = Object.values(updatedTurrets);
    
    // Process EMP drones, Medics and Counter-attacks in a more optimized way
    for (const enemy of enemies) {
      // Small optimization: only check turrets if enemy has an aura or attack
      if (enemy.canDisableTurrets || enemy.type === 'mech' || enemy.type === 'bomber' || enemy.type === 'heavy_tank' || enemy.type === 'tank') {
        const attackRange = enemy.isBoss ? 250 : 150;
        const attackRangeSq = attackRange * attackRange;
        const disableRangeSq = 100 * 100;
        const dps = enemy.isBoss ? 40 : 20;

        turretList.forEach((t: any) => {
          const dx = enemy.x - t.x;
          const dy = enemy.y - t.y;
          const distSq = dx*dx + dy*dy;

          if (enemy.canDisableTurrets && distSq < disableRangeSq) {
            t.disabledUntil = time + 1000;
          }
          
          const isHostile = ['mech', 'bomber', 'heavy_tank', 'tank'].includes(enemy.type);
          if (isHostile && distSq < attackRangeSq) {
            t.hp -= dps * deltaTime;
          }
        });
      }

      if (enemy.canHeal) {
         enemies.forEach(otherEnemy => {
           if (enemy.id !== otherEnemy.id) {
             const dx = enemy.x - otherEnemy.x;
             const dy = enemy.y - otherEnemy.y;
             if ((dx*dx + dy*dy) < 120*120 && otherEnemy.hp < otherEnemy.maxHp) {
               otherEnemy.hp = Math.min(otherEnemy.maxHp, otherEnemy.hp + (otherEnemy.maxHp * 0.05 * deltaTime));
             }
           }
         });
      }
    }

    // Filter out destroyed turrets
    Object.keys(updatedTurrets).forEach(key => {
      if (updatedTurrets[key].hp <= 0) {
        delete updatedTurrets[key];
        triggerHaptic('error');
      }
    });

    Object.keys(updatedTurrets).forEach(key => {
      const turret = updatedTurrets[key];
      const turretConfig = TOWER_CONFIGS[turret.type];
      
      const effectiveRange = turret.range;

      const distSq = (e: Enemy) => {
        const dx = e.x - turret.x;
        const dy = e.y - turret.y;
        return dx*dx + dy*dy;
      };

      const rangeSq = effectiveRange * effectiveRange;

      // Find targets in range
      let target = enemies.find(e => e.id === turret.targetId);
      
      const isValidTarget = (e: Enemy) => {
        if (e.y < -150 || e.y > 1150) return false; // Off-screen (updated for new viewport)
        if (e.isFlying && !turretConfig.targetsAir) return false;
        if (!e.isFlying && !turretConfig.targetsGround) return false;
        
        let stealthDetectionThreshold = 0.5;
        if (state.activeModifier?.type === 'fog') {
          stealthDetectionThreshold = 0.25; 
        }
        
        if (e.isStealth && distSq(e) > (rangeSq * stealthDetectionThreshold * stealthDetectionThreshold)) return false;
        return true;
      };

      if (!target || distSq(target) > rangeSq || !isValidTarget(target)) {
        const validTargets = enemies.filter(e => isValidTarget(e) && distSq(e) <= rangeSq);
        if (validTargets.length > 0) {
          const priority = turret.targetPriority || 'first';
          validTargets.sort((a, b) => {
            if (priority === 'strong') return b.hp - a.hp;
            if (priority === 'weak') return a.hp - b.hp;
            if (priority === 'armored') {
               if (a.isArmored && !b.isArmored) return -1;
               if (!a.isArmored && b.isArmored) return 1;
            }
            if (priority === 'stealth') {
               if (a.isStealth && !b.isStealth) return -1;
               if (!a.isStealth && b.isStealth) return 1;
            }
            if (priority === 'fast') return b.speed - a.speed;
            
            // Default to 'first' vs 'last'
            return priority === 'last' ? a.progress - b.progress : b.progress - a.progress;
          });
          target = validTargets[0];
          turret.targetId = target.id;
        } else {
          turret.targetId = undefined;
        }
      }

      if (target) {
        const targetAngle = Math.atan2(target.y - turret.y, target.x - turret.x) * (180 / Math.PI);
        const currRot = turret.rotation ?? 0;
        const diff = targetAngle - currRot;
        const normDiff = ((diff + 540) % 360) - 180;
        turret.rotation = currRot + normDiff * Math.min(1, deltaTime * 15);

        if (turret.disabledUntil && turret.disabledUntil > time) {
          return;
        }

        const timeSinceLastFire = time - turret.lastFired;
        const cooldownMs = 1000 / turret.fireRate;
        if (timeSinceLastFire >= cooldownMs) {
          let projectileDamage = turret.damage;
          if (state.activeModifier?.type === 'energy_surge') {
            projectileDamage = Math.floor(projectileDamage * 0.75); 
          }

          newProjectiles.push({
            id: Math.random().toString(36).substr(2, 9),
            towerType: turret.type,
            x: turret.x,
            y: turret.y,
            targetX: target.x,
            targetY: target.y,
            targetId: target.id,
            speed: turret.type === 'missile' ? 300 : 800, // pixels per sec
            damage: projectileDamage,
            aoe: turret.aoeOverride ?? turretConfig.aoe,
            armorPiercing: turret.armorPiercingOverride ?? turretConfig.armorPiercing,
            rotation: Math.atan2(target.y - turret.y, target.x - turret.x) * (180 / Math.PI)
          });
          turret.lastFired = time;
        }
      }
    });

    // 4. Move projectiles and apply damage
    let finalProjectiles = [];
    const nowPerf = performance.now();
    const projectileList = newProjectiles;
    
    for (const proj of projectileList) {
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
      const distanceSq = dx * dx + dy * dy;
      
      const moveDist = proj.speed * deltaTime;
      const moveDistSq = moveDist * moveDist;

      if (moveDistSq >= distanceSq) {
        // Hit
        const aoe = proj.aoe ?? 0;
        const armorPiercing = proj.armorPiercing ?? false;
        
        let explosionColor = "#f59e0b";
        if (proj.towerType === 'mitrailleuse') explosionColor = "#16a34a";
        else if (proj.towerType === 'canon') explosionColor = "#ea580c";
        else if (proj.towerType === 'dca') explosionColor = "#00cbff";
        else if (proj.towerType === 'plasma') explosionColor = "#9333ea";
        else if (proj.towerType === 'mortier') explosionColor = "#dc2626";
        else if (proj.towerType === 'missile') explosionColor = "#db2677";

        if (aoe > 0) {
          // Trigger explosion event
        const newDebris: any[] = [];
        // Reduced sample rate for debris for performance
        for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
          newDebris.push({
            id: `debris-${Math.random().toString(36).substr(2, 9)}-${nowPerf}-${i}`,
            x: tx,
            y: ty,
            size: 4 + Math.random() * 10,
            rotation: Math.random() * 360,
            type: Math.random() > 0.4 ? 'rock' : 'dust',
            opacity: 0.6 + Math.random() * 0.4,
            createdAt: nowPerf
          });
        }

        // Use local variable instead of mutating state directly
        const newExplosion = {
            id: `exp-${Math.random().toString(36).substr(2, 9)}-${nowPerf}`,
            x: tx,
            y: ty,
            radius: aoe,
            startTime: nowPerf,
            color: explosionColor
        };
        
        state.explosions = [...(state.explosions || []), newExplosion];
        state.terrainDebris = [...(state.terrainDebris || []), ...newDebris].slice(-40);

          // AOE Damage: Optimize by filtering nearby enemies first
          const hitX = tx;
          const hitY = ty;
          const aoeSq = aoe * aoe;
          
          enemies.forEach(e => {
            const edx = e.x - hitX;
            const edy = e.y - hitY;
            const distToExplosionSq = edx*edx + edy*edy;
            if (distToExplosionSq <= aoeSq) {
              let damageToApply = proj.damage;
              if (e.isArmored && !armorPiercing) damageToApply *= 0.3;
              if (e.isElite) damageToApply *= 0.8;
              
              // Falloff damage for AOE
              const falloff = 1 - (Math.sqrt(distToExplosionSq) / aoe) * 0.5;
              e.hp -= damageToApply * Math.max(0.5, falloff);
              e.lastHitTime = nowPerf;
            }
          });
          
          // Filter dead enemies and collect rewards
          const deadEnemies = enemies.filter(e => e.hp <= 0);
          deadEnemies.forEach(e => { money += e.reward; });
          enemies = enemies.filter(e => e.hp > 0);
        } else {
          // Single target
          if (target) {
            let damageToApply = proj.damage;
            if (target.isArmored && !armorPiercing) damageToApply *= 0.3;
            if (target.isElite) damageToApply *= 0.8;
            
            target.hp -= damageToApply;
            target.lastHitTime = nowPerf;
            
            if (target.hp <= 0) {
              money += target.reward;
              enemies = enemies.filter(e => e.id !== target.id);
            }
          }
        }
      } else {
        const distance = Math.sqrt(distanceSq);
        const nextX = proj.x + (dx / distance) * moveDist;
        const nextY = proj.y + (dy / distance) * moveDist;
        const newRotation = Math.atan2(nextY - proj.y, nextX - proj.x) * (180 / Math.PI);
        
        finalProjectiles.push({
          ...proj,
          x: nextX,
          y: nextY,
          targetX: tx,
          targetY: ty,
          rotation: newRotation
        });
      }
    }
    
    // Cleanup old airstrikes, explosions and debris
    const nowReal = Date.now();
    const activeAirstrikes = state.activeAirstrikes.filter(a => nowReal - a.startTime < 4000);
    const activeExplosions = state.explosions.filter(e => nowPerf - e.startTime < 1500);
    const activeDebris = state.terrainDebris.filter(d => {
      const age = nowPerf - d.createdAt;
      const maxAge = d.type === 'rock' ? 5000 : 2500;
      return age < maxAge;
    }).map(d => {
      const age = nowPerf - d.createdAt;
      const maxAge = d.type === 'rock' ? 5000 : 2500;
      if (age > maxAge * 0.5) {
        return { ...d, opacity: Math.max(0, 1 - (age / maxAge)) };
      }
      return d;
    });

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
      activeAirstrikes,
      explosions: activeExplosions,
      terrainDebris: activeDebris,
      activeModifier: state.activeModifier,
      gameTime: gameTime
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updateGame]);

  const callAirstrike = useCallback((x: number, y: number) => {
    const COOLDOWN = 90000; // 90 seconds
    const RADIUS = 280;
    setGameState(prev => {
      // Must be playing, wave >= 3, and cooldown of 90s must have passed
      if (prev.status !== 'playing') return prev;
      if (prev.wave < 3) return prev;
      if (Date.now() - prev.lastAirstrikeTime < COOLDOWN) return prev;

      // Deal damaging blast to enemies within radius
      const nextEnemies = prev.enemies.map(e => {
        const dX = e.x - x;
        const dY = e.y - y;
        const dist = Math.sqrt(dX*dX + dY*dY);
        
        if (dist > RADIUS) return e;

        let reduction = 1.0;
        if (e.isBoss) reduction = 0.4;
        else if (e.isElite) reduction = 0.7;
        
        const damage = 2500 * reduction * (1 - (dist / RADIUS) * 0.4);
        return { 
          ...e, 
          hp: e.hp - damage, 
          lastHitTime: performance.now()
        };
      });

      // Calculate rewards for killed enemies
      let totalReward = 0;
      prev.enemies.forEach(e => {
        const dX = e.x - x;
        const dY = e.y - y;
        const dist = Math.sqrt(dX*dX + dY*dY);
        
        if (dist <= RADIUS) {
          let reduction = 1.0;
          if (e.isBoss) reduction = 0.4;
          else if (e.isElite) reduction = 0.7;
          if (e.hp - (2500 * reduction * (1 - (dist / RADIUS) * 0.4)) <= 0) {
            totalReward += e.reward;
          }
        }
      });

        const next = {
          ...prev,
          money: prev.money + totalReward,
          enemies: nextEnemies.filter(e => e.hp > 0),
          lastAirstrikeTime: Date.now(),
          activeAirstrikes: [...prev.activeAirstrikes, { id: `airstrike-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`, startTime: Date.now(), x, y }]
        };
      saveProgress(next);
      return next;
    });
    triggerHaptic('heavy');
  }, [saveProgress]);

  const sellTurret = useCallback((slotId: string) => {
    const turret = stateRef.current.turrets[slotId];
    if (!turret || stateRef.current.status !== 'playing') return;

    const baseConfig = TOWER_CONFIGS[turret.type];
    let totalValue = baseConfig.cost;
    
    // Sum up previous upgrades to find total investment
    for (let i = 1; i < turret.level; i++) {
        // level 1->2 is pow(1.5, 1), level 2->3 is pow(1.5, 2), level 3->4 is pow(1.5, 3)*1.5
        const isSpec = i === 3;
        totalValue += Math.floor(baseConfig.cost * Math.pow(1.5, i) * (isSpec ? 1.5 : 1));
    }

    const refund = Math.floor(totalValue * 0.6);

    setGameState(prev => {
      const { [slotId]: _, ...remTurrets } = prev.turrets;
      const next = {
        ...prev,
        money: prev.money + refund,
        turrets: remTurrets
      };
      saveProgress(next);
      return next;
    });
    triggerHaptic('medium');
  }, [saveProgress]);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev, 
      status: prev.status === 'playing' ? 'paused' : 'playing'
    }));
  }, []);

  const setTargetPriority = useCallback((slotId: string, priority: TargetingPriority) => {
    setGameState(prev => {
      if (!prev.turrets[slotId]) return prev;
      const next = {
        ...prev,
        turrets: {
          ...prev.turrets,
          [slotId]: { ...prev.turrets[slotId], targetPriority: priority }
        }
      };
      saveProgress(next);
      return next;
    });
  }, [saveProgress]);

  const startWave = useCallback(() => {
    setGameState(prev => {
      if (!prev.waveActive && prev.status === 'playing') {
        let modifier = null;
        // 40% chance for modifier starting from level 2
        if (prev.level >= 2 && Math.random() > 0.6) {
          modifier = WAVE_MODIFIERS[Math.floor(Math.random() * WAVE_MODIFIERS.length)];
        }
        const next = { ...prev, waveActive: true, activeModifier: modifier };
        saveProgress(next);
        return next;
      }
      return prev;
    });
  }, [saveProgress]);

  const resetGame = useCallback(() => {
    localStorage.removeItem('canyon_defense_session');
    localStorage.setItem('defense_level', '1');
    const newState: GameState = {
      money: 450,
      lives: 20,
      level: 1,
      wave: 1,
      maxWaves: 15,
      mode: 'campaign',
      status: 'menu',
      enemies: [],
      turrets: {},
      projectiles: [],
      waveActive: false,
      waveTime: 0,
      gameTime: 0,
      lastAirstrikeTime: 0,
      activeAirstrikes: [],
      explosions: [],
      terrainDebris: [],
      activeModifier: null,
    };
    setGameState(newState);
    saveProgress(newState);
  }, [saveProgress]);

  return { gameState, buildTurret, upgradeTurret, sellTurret, togglePause, startWave, callAirstrike, setTargetPriority, resetGame, startGame };
}
