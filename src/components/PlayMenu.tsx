import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, Bot, Users } from 'lucide-react';

interface PlayMenuProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function PlayMenu({ onBack, onNavigate }: PlayMenuProps) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleJoinPrivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim().length >= 4) {
      onNavigate('virtual');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a2e1f] text-white flex flex-col items-center py-12 px-6 overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at center, #14532d 0%, #064e3b 100%)' }}>
      <div className="absolute top-0 left-0 w-full h-48 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #f59e0b, transparent)' }}></div>
      <div className="absolute top-0 left-0 w-full h-48 opacity-20 pointer-events-none flex justify-around pt-12 text-4xl">
        <span>♠️</span><span>♥️</span><span>♣️</span><span>♦️</span>
      </div>

      <div className="w-full max-w-md z-10 mb-8 flex justify-between items-center">
        <button onClick={onBack} className="p-3 bg-black/40 rounded-full border border-white/10 text-white hover:bg-black/60 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-black italic tracking-tighter text-yellow-500 drop-shadow-[0_2px_0_rgba(180,83,9,1)]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          MODOS DE JUEGO
        </h2>
        <div className="w-12"></div> {/* Spacer for centering */}
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col gap-4 z-10 pb-4">
        <button
          onClick={() => onNavigate('virtual')}
          className="w-full py-5 bg-blue-600 rounded-2xl shadow-[0_6px_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center gap-2"
        >
          <Search className="text-white" size={32} />
          <span className="text-xl font-black uppercase italic text-white">Buscar Partida</span>
          <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Emparejamiento Global</span>
        </button>

        {!showCodeInput ? (
          <button
            onClick={() => setShowCodeInput(true)}
            className="w-full py-5 bg-purple-600 rounded-2xl shadow-[0_6px_0_#7e22ce] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center gap-2"
          >
            <Users className="text-white" size={32} />
            <span className="text-xl font-black uppercase italic text-white">Partida Privada</span>
            <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest">Juega con amigos</span>
          </button>
        ) : (
          <div className="w-full p-5 bg-purple-900/60 rounded-2xl border border-purple-500/50 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-purple-200 mb-3 text-center uppercase">Crear o Unirse</h3>
            
            <button
              onClick={() => onNavigate('virtual')}
              className="w-full mb-4 py-3 bg-purple-600 rounded-xl shadow-[0_4px_0_#7e22ce] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              <span className="font-bold uppercase">Crear Sala</span>
            </button>

            <div className="relative flex items-center mb-4">
              <div className="flex-grow border-t border-purple-500/30"></div>
              <span className="flex-shrink-0 mx-4 text-purple-300/50 text-xs font-bold">O</span>
              <div className="flex-grow border-t border-purple-500/30"></div>
            </div>

            <form onSubmit={handleJoinPrivate} className="flex gap-2">
              <input 
                type="text" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO DE SALA" 
                maxLength={6}
                className="flex-1 bg-black/50 border border-purple-500/50 rounded-xl px-4 text-center font-black tracking-widest outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all placeholder:text-purple-300/30 uppercase"
              />
              <button 
                type="submit"
                disabled={roomCode.trim().length < 4}
                className="bg-yellow-500 text-black px-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                IR
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => onNavigate('virtual')}
          className="w-full py-5 bg-emerald-600 rounded-2xl shadow-[0_6px_0_#047857] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center gap-2 mt-auto"
        >
          <Bot className="text-white" size={32} />
          <span className="text-xl font-black uppercase italic text-white">Jugar con Bot</span>
          <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">Práctica Offline</span>
        </button>
      </div>
    </div>
  );
}
