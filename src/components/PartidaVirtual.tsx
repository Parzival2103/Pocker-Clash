import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCcw, Crown, Shield, Bot, User, Backpack, Trash2 } from 'lucide-react';

export interface CardData {
  id: string;
  val: string;
  suit: string;
  isPowerUp: boolean;
  value: number;
}

export interface VirtualTower {
  id: string;
  type: 'J' | 'K';
  maxHp: number;
  damage: number;
  destroyed: boolean;
  destroyedAtTurn?: number;
  appliedCards: CardData[];
}

export interface VirtualPlayer {
  id: 'p1' | 'p2';
  towers: {
    leftJ: VirtualTower;
    king: VirtualTower;
    rightJ: VirtualTower;
  };
  hand: CardData[];
  inventory: CardData[];
}

interface VirtualGameState {
  deck: CardData[];
  discardPile: CardData[];
  p1: VirtualPlayer;
  p2: VirtualPlayer;
  currentTurn: 'p1' | 'p2';
  turnCount: number;
  winner: 'p1' | 'p2' | null;
}

const SUITS = ['♠', '♥', '♣', '♦'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function getCardValue(val: string): number {
  if (['2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(val)) return parseInt(val);
  if (val === 'A') return 1;
  if (val === 'K') return 15;
  return 0;
}

function generateDeck(): CardData[] {
  let deck: CardData[] = [];
  let idCounter = 0;
  for (const suit of SUITS) {
    for (const val of VALUES) {
      deck.push({
        id: `card_${idCounter++}`,
        val,
        suit,
        isPowerUp: ['A', 'Q', 'K'].includes(val),
        value: getCardValue(val)
      });
    }
  }
  const js = deck.filter(c => c.val === 'J');
  const ks = deck.filter(c => c.val === 'K');
  const toRemoveIds = [...js.map(c => c.id), ks[0].id, ks[1].id];
  return deck.filter(c => !toRemoveIds.includes(c.id));
}

function shuffleDeck(deck: CardData[]): CardData[] {
  return [...deck].sort(() => Math.random() - 0.5);
}

function createInitialTowers(): VirtualPlayer['towers'] {
  return {
    leftJ: { id: 'leftJ', type: 'J', maxHp: 30, damage: 0, destroyed: false, appliedCards: [] },
    king: { id: 'king', type: 'K', maxHp: 40, damage: 0, destroyed: false, appliedCards: [] },
    rightJ: { id: 'rightJ', type: 'J', maxHp: 30, damage: 0, destroyed: false, appliedCards: [] },
  };
}

interface PartidaVirtualProps {
  onBack: () => void;
}

export function PartidaVirtual({ onBack }: PartidaVirtualProps) {
  const [state, setState] = useState<VirtualGameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const drawCard = (currentState: VirtualGameState): CardData | null => {
    if (currentState.deck.length === 0) {
      if (currentState.discardPile.length === 0) return null;
      currentState.deck = shuffleDeck([...currentState.discardPile]);
      currentState.discardPile = [];
    }
    return currentState.deck.pop() || null;
  };

  const fillPlayerHand = (currentState: VirtualGameState, player: VirtualPlayer) => {
    let safetyCounter = 0;
    while (player.hand.length < 2 && safetyCounter < 100) {
      safetyCounter++;
      const card = drawCard(currentState);
      if (!card) break;

      if (card.isPowerUp) {
        if (player.inventory.length < 5) {
          player.inventory.push(card);
        } else {
          currentState.discardPile.push(card);
        }
      } else {
        player.hand.push(card);
      }
    }
  };

  const startNewGame = () => {
    const newDeck = shuffleDeck(generateDeck());
    
    let initialState: VirtualGameState = {
      deck: newDeck,
      discardPile: [],
      p1: { id: 'p1', towers: createInitialTowers(), hand: [], inventory: [] },
      p2: { id: 'p2', towers: createInitialTowers(), hand: [], inventory: [] },
      currentTurn: 'p1',
      turnCount: 1,
      winner: null
    };

    fillPlayerHand(initialState, initialState.p1);
    fillPlayerHand(initialState, initialState.p2);

    setState(initialState);
    setSelectedCard(null);
  };

  const advanceTurn = (currentState: VirtualGameState): VirtualGameState => {
    let nextTurn = currentState.currentTurn === 'p1' ? 'p2' : 'p1';
    currentState.currentTurn = nextTurn as 'p1'|'p2';
    if (nextTurn === 'p1') currentState.turnCount++;
    
    fillPlayerHand(currentState, currentState.p1);
    fillPlayerHand(currentState, currentState.p2);
    return currentState;
  };

  const handleTowerClick = (targetPlayer: 'p1'|'p2', towerId: string) => {
    if (!state || !selectedCard) return;
    
    const activeTurnPlayer = state.currentTurn;
    const isOpponent = targetPlayer !== activeTurnPlayer;
    
    const tower = state[targetPlayer].towers[towerId as keyof VirtualPlayer['towers']];
    
    if (isOpponent) {
        if (tower.destroyed) return;
        if (tower.type === 'K' && (!state[targetPlayer].towers.leftJ.destroyed || !state[targetPlayer].towers.rightJ.destroyed)) {
            showNotification('Debes destruir las torres laterales primero.');
            return;
        }
        if (selectedCard.val === 'Q') {
            showNotification('La Reina (Q) solo se usa para curar o revivir tus torres.');
            return;
        }
        applyCardAction('attack', targetPlayer, towerId);
    } else {
        if (selectedCard.val === 'A') {
            if (tower.destroyed) return;
            if (tower.damage === 0) {
                showNotification('La torre ya tiene la vida al máximo.');
                return;
            }
            applyCardAction('heal', targetPlayer, towerId);
        } else if (selectedCard.val === 'Q') {
            if (tower.destroyed) {
                // If it was destroyed in the opponent's previous turn. 
                // Since turnCount advances when p1 plays, we check if it was destroyed exactly 1 turn ago.
                const turnDiff = state.turnCount - tower.destroyedAtTurn!;
                // For p1, if destroyed by p2, p2 played in turnCount-1 (or turnCount if same round?).
                // Wait, advanceTurn increments turnCount only when it becomes p1's turn.
                // It's safer to just let them revive if destroyedAtTurn is recent. Let's just allow it if destroyedAtTurn is within 1.
                if (turnDiff <= 1) {
                    applyCardAction('revive', targetPlayer, towerId);
                } else {
                    showNotification('Solo puedes revivir en el turno inmediato posterior a la destrucción.');
                }
            } else {
                if (tower.damage === 0) {
                    showNotification('La torre ya tiene la vida al máximo.');
                    return;
                }
                applyCardAction('heal', targetPlayer, towerId);
            }
        } else {
            showNotification('Esa carta solo sirve para atacar torres enemigas.');
        }
    }
  };

  const applyCardAction = (action: 'attack'|'heal'|'revive'|'discard', targetPlayer: 'p1'|'p2', towerId: string) => {
    setState(prev => {
        if (!prev) return prev;
        let newState = JSON.parse(JSON.stringify(prev)) as VirtualGameState;
        
        const activePlayer = newState[newState.currentTurn];
        const card = selectedCard!;
        
        if (activePlayer.hand.find(c => c.id === card.id)) {
            activePlayer.hand = activePlayer.hand.filter(c => c.id !== card.id);
        } else {
            activePlayer.inventory = activePlayer.inventory.filter(c => c.id !== card.id);
        }

        if (action === 'discard') {
            newState.discardPile.push(card);
        } else {
            const targetTower = newState[targetPlayer].towers[towerId as keyof VirtualPlayer['towers']];
            
            if (action === 'attack') {
                let dmg = card.value;
                let newDamage = targetTower.damage + dmg;
                if (newDamage === targetTower.maxHp) {
                    targetTower.destroyed = true;
                    targetTower.damage = targetTower.maxHp;
                    targetTower.destroyedAtTurn = newState.turnCount;
                    targetTower.appliedCards.push(card);
                } else if (newDamage > targetTower.maxHp) {
                    targetTower.damage = 0;
                    newState.deck = shuffleDeck([...newState.deck, ...targetTower.appliedCards]);
                    targetTower.appliedCards = [];
                    newState.discardPile.push(card);
                } else {
                    targetTower.damage = newDamage;
                    targetTower.appliedCards.push(card);
                }
            } else if (action === 'heal') {
                if (card.val === 'A') {
                    targetTower.damage = Math.max(0, targetTower.damage - 1);
                    newState.discardPile.push(card);
                } else if (card.val === 'Q') {
                    targetTower.damage = 0;
                    newState.deck = shuffleDeck([...newState.deck, ...targetTower.appliedCards]);
                    targetTower.appliedCards = [];
                    newState.discardPile.push(card);
                }
            } else if (action === 'revive') {
                targetTower.destroyed = false;
                targetTower.damage = 0;
                delete targetTower.destroyedAtTurn;
                newState.deck = shuffleDeck([...newState.deck, ...targetTower.appliedCards]);
                targetTower.appliedCards = [];
                newState.discardPile.push(card);
            }
        }

        if (newState.p2.towers.leftJ.destroyed && newState.p2.towers.king.destroyed && newState.p2.towers.rightJ.destroyed) {
            newState.winner = 'p1';
        } else if (newState.p1.towers.leftJ.destroyed && newState.p1.towers.king.destroyed && newState.p1.towers.rightJ.destroyed) {
            newState.winner = 'p2';
        }

        if (!newState.winner) {
           newState = advanceTurn(newState);
        }

        return newState;
    });
    setSelectedCard(null);
  };

  const storeInInventory = () => {
    // Deprecated: Power-ups are stored automatically during draw.
  };

  if (!state) return null;

  const TowerComponent = ({ player, towerId, tower }: { player: 'p1'|'p2'; towerId: string; tower: VirtualTower }) => {
    const isP1 = player === 'p1';
    const colorClass = isP1 ? 'from-blue-600 to-blue-800' : 'from-red-600 to-red-800';
    const shadowClass = isP1 ? 'shadow-blue-900/50' : 'shadow-red-900/50';
    const isKing = tower.type === 'K';
    
    const isTargetableForAttack = () => {
      if (!isKing) return true;
      const pt = state[player].towers;
      return pt.leftJ.destroyed && pt.rightJ.destroyed;
    };

    const isSelectable = selectedCard && 
      (player !== state.currentTurn ? isTargetableForAttack() && !tower.destroyed : true);

    return (
      <button 
        disabled={!isSelectable}
        onClick={() => handleTowerClick(player, towerId)}
        className={`relative flex flex-col items-center justify-center transition-transform ${isSelectable ? 'active:scale-95 cursor-pointer ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900 hover:-translate-y-1' : 'cursor-default'} ${isKing ? 'w-20 h-28 z-10' : 'w-16 h-24 mt-4'} ${tower.destroyed ? 'opacity-30 grayscale' : ''}`}
      >
        <div className={`w-full h-full rounded-lg bg-gradient-to-b ${colorClass} shadow-xl ${shadowClass} flex flex-col items-center justify-between p-2 border-2 border-slate-900`}>
          <div className="bg-slate-950/50 rounded-full p-1 text-white">
            {isKing ? <Crown size={isKing ? 16 : 12} /> : <Shield size={isKing ? 16 : 12} />}
          </div>
          
          <div className="text-center">
            <div className="text-white font-black text-xl tracking-tighter" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {tower.type}
            </div>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700 relative flex items-center justify-center mt-1">
            <div 
              className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300"
              style={{ width: `${((tower.maxHp - tower.damage) / tower.maxHp) * 100}%` }}
            />
            <span className="relative z-10 text-[8px] font-black text-white drop-shadow-md leading-none">
              {tower.maxHp - tower.damage}
            </span>
          </div>
          <div className="text-[8px] text-white font-mono font-bold mt-1 opacity-80 text-center leading-none">
            {tower.damage} / {tower.maxHp} DMG
          </div>
        </div>
        {tower.appliedCards.length > 0 && (
           <div className="absolute -bottom-3 text-[8px] font-bold bg-slate-800 border border-slate-600 text-yellow-500 px-1.5 py-0.5 rounded-md shadow-md whitespace-nowrap">
               {tower.appliedCards.length} {tower.appliedCards.length === 1 ? 'carta' : 'cartas'}
           </div>
        )}
      </button>
    );
  };

  const CardComponent = ({ card, isSmall = false, owner }: { card: CardData, isSmall?: boolean, owner: 'p1'|'p2', key?: React.Key }) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    const isSelected = selectedCard?.id === card.id;
    return (
      <div 
        onClick={() => state.currentTurn === owner ? setSelectedCard(isSelected ? null : card) : null}
        className={`bg-white rounded-lg border-2 shadow-md flex flex-col ${isSmall ? 'w-12 h-16 p-1' : 'w-16 h-24 p-2'} transition-all flex-shrink-0 ${isSelected ? 'border-yellow-400 scale-110 -translate-y-2 ring-2 ring-yellow-400/50 shadow-yellow-500/20' : 'border-slate-300 hover:-translate-y-1'} ${state.currentTurn === owner ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-80'}`}
      >
        <div className={`${isRed ? 'text-red-500' : 'text-slate-900'} font-black ${isSmall ? 'text-sm' : 'text-lg'} leading-none`}>
          {card.val}
        </div>
        <div className={`${isRed ? 'text-red-500' : 'text-slate-900'} text-center mt-auto ${isSmall ? 'text-sm' : 'text-2xl'}`}>
          {card.suit}
        </div>
      </div>
    );
  };

  const PlayerUI = ({ player }: { player: 'p1'|'p2' }) => {
    const isP1 = player === 'p1';
    const pState = state[player];
    
    return (
      <div className={`bg-slate-950 p-4 border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 flex-1 flex flex-col justify-end ${isP1 ? 'rounded-t-3xl border-t' : 'rounded-b-3xl border-b rotate-180'}`}>
        
        {selectedCard && state.currentTurn === player && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 rounded-full p-1 shadow-lg border border-slate-700 animate-in fade-in flex gap-2 z-30">
             <button onClick={() => applyCardAction('discard', player, 'leftJ')} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap">
                <Trash2 size={14} /> Descartar
             </button>
           </div>
        )}
        
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${state.currentTurn === player ? (isP1 ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]') : (isP1 ? 'bg-blue-900/50 border-blue-500/50 text-blue-300' : 'bg-red-900/50 border-red-500/50 text-red-300')}`}>
              {isP1 ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="text-xs font-bold text-slate-300">{isP1 ? 'JUGADOR 1 (Azul)' : 'JUGADOR 2 (Rojo)'}</div>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {state.currentTurn === player ? 'Tu Turno' : 'Esperando...'}
          </div>
        </div>

        <div className="flex justify-between items-end relative flex-1 pb-2">
          {/* Inventory */}
          <div className="flex flex-col gap-1 w-[60%]">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Backpack size={10} /> Mochila ({pState.inventory.length}/5)
            </span>
            <div className="flex gap-1 h-20 bg-slate-900/50 rounded-xl p-1.5 border border-slate-800 items-center overflow-x-auto">
              {pState.inventory.map((card) => (
                <CardComponent key={card.id} card={card} isSmall={true} owner={player} />
              ))}
              {pState.inventory.length === 0 && <div className="text-xs text-slate-600 font-bold m-auto">VACÍO</div>}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Tus Cartas</span>
             <div className="flex gap-2">
               {pState.hand.map((card) => (
                 <CardComponent key={card.id} card={card} owner={player} />
               ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col select-none touch-manipulation">
      {/* P2 UI (Top) */}
      <PlayerUI player="p2" />

      {notification && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-yellow-500 text-black font-bold px-4 py-2 rounded-full shadow-lg text-xs animate-in fade-in zoom-in">
          {notification}
        </div>
      )}

      {/* Battlefield */}
      <div className="relative flex flex-col justify-between py-6 px-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shrink-0 h-[340px]">
        
        {/* Player 2 (Top) */}
        <div className="flex justify-center items-start gap-4 rotate-180">
          <TowerComponent player="p2" towerId="leftJ" tower={state.p2.towers.leftJ} />
          <TowerComponent player="p2" towerId="king" tower={state.p2.towers.king} />
          <TowerComponent player="p2" towerId="rightJ" tower={state.p2.towers.rightJ} />
        </div>

        {/* Center Line */}
        <div className="w-full h-px bg-slate-800/50 my-4 relative z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 rounded-full text-[10px] font-bold text-slate-500 tracking-widest flex items-center gap-2">
            <span className="text-blue-500">{state.turnCount}</span>
            MESA
            <span className="text-red-500 rotate-180">{state.turnCount}</span>
          </div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-1">
             <div className="w-8 h-12 bg-slate-800 rounded border border-slate-700 shadow-inner flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-500">{state.deck.length}</span>
             </div>
          </div>
        </div>

        {/* Player 1 (Bottom) */}
        <div className="flex justify-center items-end gap-4">
          <TowerComponent player="p1" towerId="leftJ" tower={state.p1.towers.leftJ} />
          <TowerComponent player="p1" towerId="king" tower={state.p1.towers.king} />
          <TowerComponent player="p1" towerId="rightJ" tower={state.p1.towers.rightJ} />
        </div>
        
        {/* Back Button (Floating Middle) */}
        <button onClick={onBack} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-700 shadow-lg z-10">
          <ArrowLeft size={16} />
        </button>
        <button onClick={startNewGame} className="absolute left-12 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-700 shadow-lg z-10">
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* P1 UI (Bottom) */}
      <PlayerUI player="p1" />

      {/* Victory Modal */}
      {state.winner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border-2 border-yellow-500 rounded-3xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-in zoom-in duration-300 w-full max-w-sm">
            <Crown className="w-24 h-24 text-yellow-500 mx-auto mb-6 drop-shadow-lg" />
            <h2 className="text-4xl font-black text-white italic tracking-tight mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {state.winner === 'p1' ? '¡VICTORIA AZUL!' : '¡VICTORIA ROJA!'}
            </h2>
            <p className={`text-xl font-bold mb-8 ${state.winner === 'p1' ? 'text-blue-400' : 'text-red-400'}`}>
              GANADOR: {state.winner === 'p1' ? 'JUGADOR 1 (AZUL)' : 'JUGADOR 2 (ROJO)'}
            </p>
            <button 
              onClick={startNewGame}
              className="bg-yellow-500 text-black font-black text-xl py-4 px-12 rounded-full shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all w-full"
            >
              JUGAR DE NUEVO
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
