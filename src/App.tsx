import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Crosshair, Zap, Target, Flame, Rocket, Plane, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TOWER_CONFIGS } from './constants';
import { GameBoard } from './components/GameBoard';
import { TowerType } from './types';
import { useGameEngine } from './hooks/useGameEngine';

export default function App() {
  const { gameState, buildTurret, upgradeTurret, sellTurret, togglePause, startWave, callAirstrike, speedMultiplier, toggleSpeed } = useGameEngine();
  const { money, lives, level, wave, maxWaves, status, waveActive, lastAirstrikeTime, enemies } = gameState;
  const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);
  const [selectedTurretId, setSelectedTurretId] = useState<string | null>(null);
  const [dismissedStatus, setDismissedStatus] = useState('');
  const [hintDismissed, setHintDismissed] = useState(false);
  const [waveFlash, setWaveFlash] = useState<{ text: string; boss: boolean } | null>(null);
  const prevWaveActiveRef = useRef(false);

  const overlayVisible = (status === 'game_over' || status === 'victory') && dismissedStatus !== status;
  const fmt = (v: number) => Math.floor(v).toLocaleString('fr-FR');

  const airstrikeAvailable = wave >= 5;
  const airstrikeCooldown = Math.max(0, 20000 - (Date.now() - lastAirstrikeTime));
  const airstrikeReady = airstrikeAvailable && airstrikeCooldown <= 0 && status === 'playing';
  const cooldownFrac = airstrikeReady ? 1 : airstrikeAvailable ? Math.max(0, 1 - airstrikeCooldown / 20000) : 0;

  const isBossWave = wave % 5 === 0;
  const bossLabel = wave % 20 === 0 ? 'MECH' : wave % 15 === 0 ? 'BOMBERS' : wave % 10 === 0 ? 'TANKS' : 'JETS';
  const livesColor = lives > 6 ? '#22c55e' : lives > 3 ? '#facc15' : '#ef4444';

  // SVG circle for airstrike cooldown
  const circR = 14;
  const circC = 2 * Math.PI * circR;

  // Flash overlay when a wave starts
  useEffect(() => {
    if (waveActive && !prevWaveActiveRef.current) {
      const boss = wave % 5 === 0;
      const label = boss ? (wave % 20 === 0 ? 'MECH' : wave % 15 === 0 ? 'BOMBERS' : wave % 10 === 0 ? 'TANKS' : 'JETS') : '';
      setWaveFlash({ text: boss ? `⚠ BOSS — ${label}` : `VAGUE ${wave}`, boss });
      prevWaveActiveRef.current = true;
      const t = setTimeout(() => setWaveFlash(null), 2200);
      return () => clearTimeout(t);
    }
    if (!waveActive) prevWaveActiveRef.current = false;
  }, [waveActive]);

  return (
    <div className="relative h-screen w-screen bg-[#0a0907] overflow-hidden font-sans select-none">

      {/* Map */}
      <div className="absolute top-14 bottom-24 left-0 right-0 z-0">
        <GameBoard
          gameState={gameState}
          buildTurret={buildTurret}
          selectedTower={selectedTower}
          setSelectedTower={setSelectedTower}
          selectedTurretId={selectedTurretId}
          setSelectedTurretId={setSelectedTurretId}
        />
      </div>

      {/* Wave flash overlay */}
      <AnimatePresence>
        {waveFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className={`px-8 py-4 rounded-2xl border-2 backdrop-blur-sm text-center ${
              waveFlash.boss
                ? 'bg-red-950/85 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]'
                : 'bg-[#1a1510]/85 border-orange-600/50 shadow-[0_0_30px_rgba(249,115,22,0.3)]'
            }`}>
              <p className={`text-2xl font-black uppercase tracking-widest ${waveFlash.boss ? 'text-red-300' : 'text-orange-400'}`}
                style={{ textShadow: waveFlash.boss ? '0 0 25px rgba(239,68,68,0.9)' : '0 0 15px rgba(249,115,22,0.8)' }}>
                {waveFlash.text}
              </p>
              <p className={`text-[9px] uppercase tracking-[0.25em] mt-1 font-mono ${waveFlash.boss ? 'text-red-500/70' : 'text-orange-600/60'}`}>
                {waveFlash.boss ? 'Alerte niveau maximum' : `${maxWaves - wave} vagues restantes`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {overlayVisible && status === 'game_over' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/65 backdrop-blur-sm z-50 flex items-center justify-center flex-col pointer-events-auto px-6">
            <button onClick={() => setDismissedStatus(status)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 border border-red-500/30 text-red-400 hover:text-white transition-colors text-lg font-bold">✕</button>
            <p className="text-red-500/60 text-[10px] uppercase tracking-[0.3em] mb-2 font-mono">Transmission terminée</p>
            <h1 className="text-5xl font-black text-red-400 mb-2 tracking-widest uppercase" style={{ textShadow: '0 0 40px rgba(239,68,68,0.8)' }}>DÉFAITE</h1>
            <p className="text-sm text-red-200/50 mb-6 text-center">Canyon perdu — arrêté à la vague <span className="text-red-300 font-bold">{wave}</span>/{maxWaves}</p>
            <button onClick={() => window.location.reload()} className="w-full max-w-xs py-3.5 bg-red-600 hover:bg-red-500 active:scale-95 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(220,38,38,0.5)] border border-red-400/30 text-white">
              Recommencer Niveau {level}
            </button>
            {level > 1 && (
              <button onClick={() => { localStorage.setItem('defense_level', '1'); window.location.reload(); }} className="mt-3 px-5 py-2 text-xs text-red-400/50 hover:text-red-300 border border-red-500/15 hover:border-red-500/40 rounded-xl uppercase tracking-widest transition-colors">
                Niveau 1
              </button>
            )}
          </motion.div>
        )}

        {/* Victory */}
        {overlayVisible && status === 'victory' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-orange-950/65 backdrop-blur-sm z-50 flex items-center justify-center flex-col pointer-events-auto px-6">
            <button onClick={() => setDismissedStatus(status)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 border border-orange-500/30 text-orange-400 hover:text-white transition-colors text-lg font-bold">✕</button>
            <p className="text-orange-500/60 text-[10px] uppercase tracking-[0.3em] mb-2 font-mono">Zone sécurisée</p>
            <h1 className="text-5xl font-black text-orange-400 mb-2 tracking-widest uppercase" style={{ textShadow: '0 0 40px rgba(249,115,22,0.8)' }}>VICTOIRE</h1>
            <p className="text-sm text-orange-200/50 mb-6 text-center">{maxWaves} vagues repoussées — Niveau <span className="text-orange-300 font-bold">{level}</span> sécurisé</p>
            <button onClick={() => { localStorage.setItem('defense_level', String(level + 1)); window.location.reload(); }} className="w-full max-w-xs py-3.5 bg-orange-600 hover:bg-orange-500 active:scale-95 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(234,88,12,0.5)] border border-orange-400/30 text-white">
              Niveau {level + 1} →
            </button>
            <button onClick={() => { localStorage.setItem('defense_level', '1'); window.location.reload(); }} className="mt-3 px-5 py-2 text-xs text-orange-400/50 hover:text-orange-300 border border-orange-500/15 hover:border-orange-500/40 rounded-xl uppercase tracking-widest transition-colors">
              Niveau 1
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top HUD ── */}
      <div className="absolute top-0 left-0 right-0 h-14 z-40 bg-[#0d0b09]/96 backdrop-blur-xl border-b-2 border-[#1f1c17] flex items-center px-3 gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">

        {/* Level badge */}
        <div className="flex-shrink-0 bg-orange-600/15 border border-orange-600/25 rounded-lg px-2 py-1 text-center min-w-[38px]">
          <div className="text-[6px] uppercase tracking-widest text-orange-500/60 font-bold">NIV</div>
          <div className="text-base font-black font-mono text-orange-400 leading-tight">{level}</div>
        </div>

        {/* Wave + progress */}
        <div className="flex flex-col gap-0.5 flex-shrink-0 min-w-[60px]">
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] uppercase tracking-widest text-[#6b6558] font-bold">Vague</span>
            {isBossWave && !waveActive && (
              <span className="text-[6px] font-black text-red-400 uppercase tracking-widest animate-pulse">BOSS</span>
            )}
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-black font-mono text-[#e8dcc4] leading-none">{wave}</span>
            <span className="text-[9px] font-mono text-[#3a352a]">/{maxWaves}</span>
          </div>
          <div className="w-full h-[2px] bg-[#1a1512] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${((wave - 1) / maxWaves) * 100}%`, background: waveActive ? '#f97316' : '#22c55e' }} />
          </div>
        </div>

        <div className="w-px h-8 bg-[#1f1c17] flex-shrink-0" />

        {/* Lives as colored squares */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <span className="text-[7px] uppercase tracking-widest text-[#6b6558] font-bold">Vie</span>
          <div className="flex items-center flex-wrap gap-[2px] max-w-[44px]">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="w-[7px] h-[7px] rounded-[1px] transition-all duration-300"
                style={{
                  background: i < lives ? livesColor : '#1a1512',
                  boxShadow: i < lives && lives <= 4 ? `0 0 4px ${livesColor}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-8 bg-[#1f1c17] flex-shrink-0" />

        {/* Money */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-[7px] uppercase tracking-widest text-[#6b6558] font-bold">Fonds</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[9px] text-yellow-700 font-bold">$</span>
            <span className="text-sm font-black font-mono text-[#e8dcc4] leading-none tabular-nums">{fmt(money)}</span>
          </div>
        </div>

        {/* Active enemies counter */}
        {waveActive && enemies.length > 0 && (
          <div className="flex-shrink-0 flex flex-col gap-0.5 items-center">
            <span className="text-[7px] uppercase tracking-widest text-orange-500/60 font-bold">Actifs</span>
            <span className="text-sm font-black font-mono text-orange-400 leading-none">{enemies.length}</span>
          </div>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          {!waveActive && status === 'playing' && (
            <motion.button onClick={startWave} whileTap={{ scale: 0.92 }}
              className={`relative flex flex-col items-center justify-center rounded-xl px-3 py-2 border transition-all gap-0.5 ${
                isBossWave
                  ? 'bg-red-900/70 border-red-500/70 shadow-[0_0_18px_rgba(239,68,68,0.4)] text-red-200'
                  : 'bg-orange-600 border-orange-400/40 shadow-[0_0_14px_rgba(234,88,12,0.4)] text-white'
              }`}
            >
              {isBossWave && <span className="text-[6px] font-black text-red-400 uppercase tracking-widest animate-pulse leading-none">⚠ BOSS</span>}
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                <span className="text-[9px] font-black uppercase tracking-wider">{isBossWave ? bossLabel : `Vague ${wave}`}</span>
              </div>
            </motion.button>
          )}
          <button onClick={togglePause} disabled={status === 'game_over' || status === 'victory'}
            className={`flex items-center justify-center rounded-lg w-9 h-9 transition-all active:scale-95 border ${
              status === 'playing' ? 'bg-[#141210] border-[#2a241c] text-[#c4b49a] hover:bg-[#1f1c17]' : 'bg-green-900/30 border-green-800/40 text-green-400'
            }`}>
            {status === 'playing' ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button onClick={toggleSpeed} disabled={status === 'game_over' || status === 'victory'}
            className={`flex items-center gap-0.5 justify-center rounded-lg px-2 h-9 transition-all active:scale-95 border ${
              speedMultiplier === 2 ? 'bg-orange-900/40 border-orange-600/50 text-orange-400' : 'bg-[#141210] border-[#2a241c] text-[#c4b49a] hover:bg-[#1f1c17]'
            }`}>
            <FastForward className={`w-3.5 h-3.5 ${speedMultiplier === 2 ? 'fill-orange-500' : ''}`} />
            <span className="text-[9px] font-black">{speedMultiplier}x</span>
          </button>
        </div>
      </div>

      {/* ── Bottom Arsenal ── */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-[#0d0b09]/96 backdrop-blur-xl border-t-2 border-[#1f1c17] shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">

        {/* Context strip (upgrade / placement hint) */}
        <AnimatePresence>
          {selectedTurretId && gameState.turrets[selectedTurretId] ? (() => {
            const turret = gameState.turrets[selectedTurretId];
            const config = TOWER_CONFIGS[turret.type];
            const upgCost = Math.floor(config.cost * Math.pow(1.5, turret.level));
            const canAfford = money >= upgCost;
            const sellVal = Math.floor(config.cost * (Math.pow(1.5, turret.level) - 1));
            const stats = [
              { label: 'DMG', cur: turret.damage, next: Math.floor(turret.damage * 1.4) },
              { label: 'RNG', cur: turret.range, next: Math.floor(turret.range * 1.1) },
              { label: 'RPS', cur: turret.fireRate, next: parseFloat((turret.fireRate * 1.1).toFixed(1)) },
            ];
            return (
              <motion.div key="upgrade" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="px-3 pt-2 pb-1.5 border-b border-[#1f1c17]">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest truncate">{config.name}</span>
                      <span className="text-[8px] bg-orange-900/30 border border-orange-800/40 rounded px-1.5 py-[1px] text-orange-400 font-mono font-bold flex-shrink-0">LV{turret.level}</span>
                      <button onClick={() => setSelectedTurretId(null)} className="ml-auto text-[#3a352a] hover:text-white transition-colors text-xs flex-shrink-0 w-5 h-5 flex items-center justify-center">✕</button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {stats.map(({ label, cur, next }) => (
                        <div key={label} className="bg-[#0a0907] rounded-lg px-2 py-1.5 border border-[#1f1c17]">
                          <div className="text-[6px] text-[#4a4031] uppercase tracking-widest mb-0.5">{label}</div>
                          <div className="flex items-center gap-0.5 text-[9px] font-mono font-bold">
                            <span className="text-[#6b6558]">{cur}</span>
                            <span className="text-orange-600 text-[8px]">›</span>
                            <span className="text-green-400">{next}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0 w-[90px]">
                    <button onClick={() => upgradeTurret(selectedTurretId)}
                      disabled={!canAfford || status !== 'playing'}
                      className={`py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 text-center ${
                        canAfford && status === 'playing'
                          ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)] border border-orange-500/40'
                          : 'bg-[#1a1512] text-[#3a352a] border border-[#1f1c17] cursor-not-allowed'
                      }`}>
                      ↑ ${fmt(upgCost)}
                    </button>
                    <button onClick={() => { sellTurret(selectedTurretId); setSelectedTurretId(null); }}
                      disabled={status !== 'playing'}
                      className="py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 text-center bg-[#1a0a0a] hover:bg-red-950 text-red-500 border border-red-900/40 hover:text-red-300">
                      +${fmt(sellVal)}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })() : selectedTower ? (
            <motion.div key="sel-tower" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-3 py-2 border-b border-[#1f1c17] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-green-400 font-mono">Toucher une zone ⊕ pour déployer</span>
              <button onClick={() => setSelectedTower(null)} className="ml-auto text-[#3a352a] hover:text-white text-xs w-5 h-5 flex items-center justify-center">✕</button>
            </motion.div>
          ) : !hintDismissed ? (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-3 py-1.5 border-b border-[#1f1c17] flex items-center gap-2">
              <div className="w-1 h-1 bg-orange-500/50 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-[7px] text-[#3a352a] font-mono">Sélectionner un armement → toucher zone ⊕ sur la carte</span>
              <button onClick={() => setHintDismissed(true)} className="ml-auto text-[#2a241c] hover:text-[#6b6558] text-xs w-5 h-5 flex items-center justify-center flex-shrink-0">✕</button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Tower cards + Airstrike */}
        <div className="flex items-center px-2 py-2 gap-1.5 overflow-x-auto scrollbar-hide">
          {Object.entries(TOWER_CONFIGS).map(([key, config]) => {
            const type = key as TowerType;
            const isSelected = selectedTower === type;
            const canAfford = money >= config.cost;
            return (
              <motion.button key={key} whileTap={canAfford ? { scale: 0.92 } : {}}
                onClick={() => { if (canAfford) { setSelectedTower(isSelected ? null : type); setSelectedTurretId(null); } }}
                className={`relative flex-shrink-0 w-[64px] h-[78px] rounded-xl flex flex-col items-center justify-between py-1.5 px-1 transition-all overflow-hidden border-2 ${
                  isSelected
                    ? 'bg-orange-950/70 border-orange-500 shadow-[0_0_16px_rgba(249,115,22,0.35)] -translate-y-1'
                    : canAfford
                      ? 'bg-[#111009] border-[#242018] hover:border-[#3a352a] active:border-orange-500/30'
                      : 'bg-[#0a0907] border-[#141210] opacity-45 cursor-not-allowed'
                }`}>
                {/* Air/Ground target dots */}
                <div className="absolute top-1 left-1 flex gap-[2px]">
                  {config.targetsAir && <div className="w-[5px] h-[5px] rounded-full bg-cyan-400/80" title="Aérien" />}
                  {config.targetsGround && <div className="w-[5px] h-[5px] rounded-sm bg-orange-400/80" title="Terrestre" />}
                </div>
                {config.armorPiercing && <div className="absolute top-1 right-1 text-[7px] font-black text-yellow-500/80">AP</div>}

                {/* Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${isSelected ? 'bg-orange-900/50' : 'bg-[#0a0907]'}`}>
                  {type === 'mitrailleuse' && <Crosshair className="w-[15px] h-[15px] text-green-400" />}
                  {type === 'canon' && <Zap className="w-[15px] h-[15px] text-orange-400" />}
                  {type === 'mortier' && <Flame className="w-[15px] h-[15px] text-amber-400" />}
                  {type === 'missile' && <Rocket className="w-[15px] h-[15px] text-pink-400" />}
                  {type === 'dca' && <Target className="w-[15px] h-[15px] text-cyan-400" />}
                </div>

                <span className={`text-[6px] font-black uppercase tracking-widest text-center leading-tight px-0.5 ${isSelected ? 'text-orange-300' : canAfford ? 'text-[#b4a48a]' : 'text-[#3a352a]'}`}>
                  {config.name.split(' ')[0]}
                </span>

                <div className={`w-full text-center py-[2px] rounded-md text-[8px] font-mono font-black ${
                  isSelected ? 'bg-orange-500 text-white'
                    : canAfford ? 'bg-[#0e2010] text-green-400 border border-[#1a4020]/60'
                    : 'bg-[#1a0a0a] text-red-800 border border-[#3a1010]/40'
                }`}>
                  ${fmt(config.cost)}
                </div>
              </motion.button>
            );
          })}

          <div className="w-px h-14 bg-[#1f1c17] flex-shrink-0 mx-0.5" />

          {/* Airstrike with circular cooldown */}
          <motion.button whileTap={airstrikeReady ? { scale: 0.92 } : {}}
            onClick={() => airstrikeReady && callAirstrike()}
            className={`relative flex-shrink-0 w-[64px] h-[78px] rounded-xl flex flex-col items-center justify-between py-1.5 px-1 transition-all overflow-hidden border-2 ${
              airstrikeReady
                ? 'bg-red-950/70 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-[#0e0806] border-[#1f1008] opacity-60 cursor-not-allowed'
            }`}>
            {!airstrikeAvailable && (
              <div className="absolute inset-0 bg-black/65 z-10 flex items-center justify-center rounded-xl">
                <span className="text-[7px] font-black text-red-900 uppercase -rotate-[15deg] border border-red-900/40 px-1 tracking-widest">V5+</span>
              </div>
            )}

            {/* SVG circular progress */}
            <div className="relative w-8 h-8 flex items-center justify-center mt-1">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r={circR} fill="none" stroke="#1a0a08" strokeWidth="2.5" />
                <circle cx="16" cy="16" r={circR} fill="none"
                  stroke={airstrikeReady ? '#ef4444' : '#7f1d1d'}
                  strokeWidth="2.5"
                  strokeDasharray={circC}
                  strokeDashoffset={circC * (1 - cooldownFrac)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                />
              </svg>
              <Plane className={`w-[14px] h-[14px] relative z-10 ${airstrikeReady ? 'text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]' : 'text-red-900'}`} />
            </div>

            <span className={`text-[6px] font-black uppercase tracking-widest ${airstrikeReady ? 'text-red-300' : 'text-red-900'}`}>FRAPPE</span>

            <div className={`w-full text-center py-[2px] rounded-md text-[8px] font-mono font-black ${
              airstrikeReady ? 'bg-red-600 text-white border border-red-500/40'
                : 'bg-[#150605] text-red-900 border border-[#2a0f08]/40'
            }`}>
              {airstrikeReady ? 'PRÊT' : airstrikeAvailable ? `${Math.ceil(airstrikeCooldown / 1000)}s` : 'VERR'}
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
