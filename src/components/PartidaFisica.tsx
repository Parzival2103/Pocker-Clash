import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCcw, Crown, Shield, ArrowRightLeft } from 'lucide-react';
import { GameState, PlayerId, Tower, PlayerTowers } from '../types';

interface PartidaFisicaProps {
  onBack: () => void;
}

const INITIAL_TOWERS = {
  leftJ: { id: 'leftJ', type: 'J' as const, maxHp: 30, damage: 0, destroyed: false },
  king: { id: 'king', type: 'K' as const, maxHp: 40, damage: 0, destroyed: false },
  rightJ: { id: 'rightJ', type: 'J' as const, maxHp: 30, damage: 0, destroyed: false },
};

export function PartidaFisica({ onBack }: PartidaFisicaProps) {
  const [gameState, setGameState] = useState<GameState>({
    p1: JSON.parse(JSON.stringify(INITIAL_TOWERS)), // Player 1 (Bottom - Blue)
    p2: JSON.parse(JSON.stringify(INITIAL_TOWERS)), // Player 2 (Top - Red)
  });

  const [selectedTower, setSelectedTower] = useState<{ player: PlayerId; towerId: string } | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PlayerId>('p1');
  const [turnCount, setTurnCount] = useState<number>(1);
  const [winner, setWinner] = useState<PlayerId | null>(null);

  useEffect(() => {
    const previousPlayer = currentTurn === 'p1' ? 'p2' : 'p1';
    const previousPlayerTowers = gameState[previousPlayer];
    
    if (previousPlayerTowers.leftJ.destroyed && previousPlayerTowers.king.destroyed && previousPlayerTowers.rightJ.destroyed) {
      setWinner(currentTurn);
    }
  }, [currentTurn, gameState]);

  const endTurn = () => {
    setCurrentTurn(prev => prev === 'p1' ? 'p2' : 'p1');
    setTurnCount(prev => prev + 1);
    setSelectedTower(null);
  };

  const resetGame = () => {
    if (confirm('¿Estás seguro de reiniciar la partida?')) {
      setGameState({
        p1: JSON.parse(JSON.stringify(INITIAL_TOWERS)),
        p2: JSON.parse(JSON.stringify(INITIAL_TOWERS)),
      });
      setSelectedTower(null);
      setCurrentTurn('p1');
      setTurnCount(1);
      setWinner(null);
    }
  };

  const applyAction = (actionType: 'attack' | 'heal' | 'revive', amount: number = 0) => {
    if (!selectedTower) return;
    
    setGameState(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      const playerTowers = newState[selectedTower.player] as PlayerTowers;
      const tower = playerTowers[selectedTower.towerId as keyof PlayerTowers];
      
      if (actionType === 'revive') {
        tower.destroyed = false;
        tower.damage = 0;
        delete tower.destroyedAtTurn;
        return newState;
      }
      
      if (tower.destroyed) return prev;

      if (actionType === 'attack') {
        let newDamage = tower.damage + amount;
        
        if (newDamage === tower.maxHp) {
          tower.destroyed = true;
          tower.damage = tower.maxHp;
          tower.destroyedAtTurn = turnCount;
        } else if (newDamage > tower.maxHp) {
          tower.damage = 0;
        } else {
          tower.damage = newDamage;
        }
      } else if (actionType === 'heal') {
        if (amount === 0) {
          tower.damage = 0;
        } else {
          tower.damage = Math.max(0, tower.damage - amount);
        }
      }

      return newState;
    });
    
    endTurn();
  };

  const TowerComponent = ({ player, towerId, tower }: { player: PlayerId; towerId: string; tower: Tower }) => {
    const isP1 = player === 'p1';
    const colorClass = isP1 ? 'from-blue-600 to-blue-800' : 'from-red-600 to-red-800';
    const shadowClass = isP1 ? 'shadow-blue-900/50' : 'shadow-red-900/50';
    const isKing = tower.type === 'K';
    
    const isTargetableForAttack = () => {
      if (!isKing) return true;
      const pt = gameState[player];
      return pt.leftJ.destroyed && pt.rightJ.destroyed;
    };

    const isDisabledAttack = player !== currentTurn && !isTargetableForAttack();
    
    return (
      <button
        disabled={isDisabledAttack}
        onClick={() => setSelectedTower({ player, towerId })}
        className={`relative flex flex-col items-center justify-center transition-transform active:scale-95 ${isKing ? 'w-24 h-32 z-10' : 'w-20 h-28 mt-4'} ${tower.destroyed ? 'opacity-30 grayscale' : ''} ${isDisabledAttack ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className={`w-full h-full rounded-lg bg-gradient-to-b ${colorClass} shadow-xl ${shadowClass} flex flex-col items-center justify-between p-2 border-2 ${isDisabledAttack ? 'border-slate-500/50' : 'border-slate-900'}`}>
          <div className="bg-slate-950/50 rounded-full p-1 text-white">
            {isKing ? <Crown size={isKing ? 24 : 16} /> : <Shield size={isKing ? 24 : 16} />}
          </div>
          
          <div className="text-center">
            <div className="text-white font-black text-2xl tracking-tighter" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {tower.type}
            </div>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-700 relative flex items-center justify-center">
            <div 
              className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300"
              style={{ width: `${((tower.maxHp - tower.damage) / tower.maxHp) * 100}%` }}
            />
            <span className="relative z-10 text-[9px] font-black text-white drop-shadow-md leading-none">
              {tower.maxHp - tower.damage}
            </span>
          </div>
          <div className="text-[10px] text-white font-mono font-bold mt-1">
            {tower.damage} / {tower.maxHp} DMG
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col select-none touch-manipulation">
      {/* Header */}
      <div className="bg-slate-950 p-4 flex justify-between items-center border-b border-slate-800">
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-900">
          <ArrowLeft size={20} />
        </button>
        <div className="font-black text-white tracking-widest text-lg" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          PARTIDA <span className="text-red-500">FÍSICA</span>
        </div>
        <button onClick={resetGame} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-900">
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* Turn Indicator Bar Top (For Player 2) */}
      <div className={`py-2 px-6 flex justify-between items-center shadow-md z-10 transition-colors duration-300 rotate-180 ${currentTurn === 'p1' ? 'bg-blue-900/20 border-b border-blue-500/20' : 'bg-red-900/60 border-b border-red-500/50'}`}>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Turno Actual</span>
          <span className={`font-black text-lg ${currentTurn === 'p1' ? 'text-blue-400 opacity-50' : 'text-red-400'}`}>
            JUGADOR {currentTurn === 'p1' ? '1 (AZUL)' : '2 (ROJO)'}
          </span>
        </div>
        {currentTurn === 'p2' && (
          <button 
            onClick={endTurn}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-bold border border-slate-600 transition-all active:scale-95 shadow-[0_4px_0_rgb(71,85,105)] active:shadow-none active:translate-y-1"
          >
            <span>Pasar Turno</span>
            <ArrowRightLeft size={16} />
          </button>
        )}
      </div>

      {/* Battlefield */}
      <div className="flex-1 relative flex flex-col justify-between py-12 px-4 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        {/* Center Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800/50 -translate-y-1/2 flex items-center justify-center">
          <div className="px-4 py-1 bg-slate-900 rounded-full text-xs font-bold text-slate-500 tracking-widest">RIO</div>
        </div>

        {/* Player 2 (Top) */}
        <div className="flex justify-center items-start gap-4 rotate-180">
          <TowerComponent player="p2" towerId="leftJ" tower={gameState.p2.leftJ} />
          <TowerComponent player="p2" towerId="king" tower={gameState.p2.king} />
          <TowerComponent player="p2" towerId="rightJ" tower={gameState.p2.rightJ} />
        </div>

        {/* Player 1 (Bottom) */}
        <div className="flex justify-center items-end gap-4">
          <TowerComponent player="p1" towerId="leftJ" tower={gameState.p1.leftJ} />
          <TowerComponent player="p1" towerId="king" tower={gameState.p1.king} />
          <TowerComponent player="p1" towerId="rightJ" tower={gameState.p1.rightJ} />
        </div>
      </div>

      {/* Turn Indicator Bar Bottom (For Player 1) */}
      <div className={`py-2 px-6 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 transition-colors duration-300 ${currentTurn === 'p1' ? 'bg-blue-900/60 border-t border-blue-500/50' : 'bg-red-900/20 border-t border-red-500/20'}`}>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Turno Actual</span>
          <span className={`font-black text-lg ${currentTurn === 'p1' ? 'text-blue-400' : 'text-red-400 opacity-50'}`}>
            JUGADOR {currentTurn === 'p1' ? '1 (AZUL)' : '2 (ROJO)'}
          </span>
        </div>
        {currentTurn === 'p1' && (
          <button 
            onClick={endTurn}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-bold border border-slate-600 transition-all active:scale-95 shadow-[0_4px_0_rgb(71,85,105)] active:shadow-none active:translate-y-1"
          >
            <span>Pasar Turno</span>
            <ArrowRightLeft size={16} />
          </button>
        )}
      </div>

      {/* Action Modal */}
      {selectedTower && (() => {
        const isOpponent = selectedTower.player !== currentTurn;
        const towerState = gameState[selectedTower.player][selectedTower.towerId as keyof PlayerTowers];
        const canRevive = towerState.destroyed && towerState.destroyedAtTurn === turnCount - 1;

        return (
          <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end pb-8 px-4 ${currentTurn === 'p2' ? 'rotate-180' : ''}`}>
            <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-10 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-xl">
                  {isOpponent ? 'Atacar a' : (towerState.destroyed ? 'Revivir a' : 'Curar a')} Torre {towerState.type}
                </h3>
                <button onClick={() => setSelectedTower(null)} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full">
                  ✕
                </button>
              </div>
              
              {isOpponent ? (
                !towerState.destroyed ? (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => (
                        <button
                          key={num}
                          onClick={() => applyAction('attack', num)}
                          style={{ animationDelay: `${i * 30}ms` }}
                          className="bg-white text-slate-900 font-black text-3xl py-4 rounded-xl border-2 border-slate-300 shadow-[0_4px_0_#94a3b8] active:translate-y-1 active:shadow-none hover:-translate-y-1 transition-all flex items-center justify-center animate-in zoom-in-50 fade-in duration-300"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
                      <button 
                        onClick={() => applyAction('attack', 1)} 
                        className="bg-white text-red-500 font-black text-2xl py-4 rounded-xl border-2 border-slate-300 shadow-[0_4px_0_#94a3b8] active:translate-y-1 active:shadow-none hover:-translate-y-1 transition-all flex flex-col items-center justify-center animate-in zoom-in-50 fade-in duration-300 delay-300"
                      >
                        <span>A</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Daño 1</span>
                      </button>
                      <button 
                        onClick={() => applyAction('attack', 15)} 
                        className="bg-white text-slate-900 font-black text-2xl py-4 rounded-xl border-2 border-slate-300 shadow-[0_4px_0_#94a3b8] active:translate-y-1 active:shadow-none hover:-translate-y-1 transition-all flex flex-col items-center justify-center animate-in zoom-in-50 fade-in duration-300 delay-300"
                      >
                        <span>K</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Daño 15</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-500 py-8 font-bold">
                    Esta torre ya está destruida.
                  </div>
                )
              ) : (
                <>
                  {towerState.destroyed ? (
                    canRevive ? (
                      <div className="grid grid-cols-1 gap-3">
                        <button 
                          onClick={() => applyAction('revive')} 
                          className="bg-white text-emerald-600 font-black text-2xl py-6 rounded-xl border-2 border-slate-300 shadow-[0_4px_0_#94a3b8] active:translate-y-1 active:shadow-none hover:-translate-y-1 transition-all flex flex-col items-center justify-center animate-in zoom-in-50 fade-in duration-300"
                        >
                          <span>Q</span>
                          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Revivir Torre</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 py-8 font-bold">
                        Demasiado tarde para revivir. Debió ser en tu siguiente turno.
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => applyAction('heal', 1)} 
                        disabled={towerState.damage === 0}
                        className={`bg-white text-red-500 font-black text-2xl py-4 rounded-xl border-2 border-slate-300 shadow-[0_4px_0_#94a3b8] flex flex-col items-center justify-center animate-in zoom-in-50 fade-in duration-300 transition-all ${towerState.damage === 0 ? 'opacity-50 cursor-not-allowed shadow-none translate-y-1' : 'active:translate-y-1 active:shadow-none hover:-translate-y-1'}`}
                      >
                        <span>A</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Curar 1</span>
                      </button>
                      <button 
                        onClick={() => applyAction('heal', 0)} 
                        disabled={towerState.damage === 0}
                        className={`bg-white text-blue-600 font-black text-2xl py-4 rounded-xl border-2 border-slate-300 shadow-[0_4px_0_#94a3b8] flex flex-col items-center justify-center animate-in zoom-in-50 fade-in duration-300 transition-all ${towerState.damage === 0 ? 'opacity-50 cursor-not-allowed shadow-none translate-y-1' : 'active:translate-y-1 active:shadow-none hover:-translate-y-1'}`}
                      >
                        <span>Q</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Curación Total</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Victory Modal */}
      {winner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border-2 border-yellow-500 rounded-3xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-in zoom-in duration-300 w-full max-w-sm">
            <Crown className="w-24 h-24 text-yellow-500 mx-auto mb-6 drop-shadow-lg" />
            <h2 className="text-4xl font-black text-white italic tracking-tight mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              ¡VICTORIA!
            </h2>
            <p className={`text-xl font-bold mb-8 ${winner === 'p1' ? 'text-blue-400' : 'text-red-400'}`}>
              GANADOR: JUGADOR {winner === 'p1' ? '1 (AZUL)' : '2 (ROJO)'}
            </p>
            <button 
              onClick={() => {
                setWinner(null);
                setGameState({
                  p1: JSON.parse(JSON.stringify(INITIAL_TOWERS)),
                  p2: JSON.parse(JSON.stringify(INITIAL_TOWERS)),
                });
                setCurrentTurn('p1');
                setTurnCount(1);
              }}
              className="bg-yellow-500 text-black font-black text-xl py-4 px-12 rounded-full shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all w-full"
            >
              NUEVA PARTIDA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
