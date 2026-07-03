import React from 'react';
import { Play, Layers, ShoppingBag, Backpack, Settings, LogOut } from 'lucide-react';

interface MenuProps {
  onNavigate: (screen: string) => void;
}

export function Menu({ onNavigate }: MenuProps) {
  return (
    <div className="min-h-screen bg-[#0a2e1f] text-white flex flex-col items-center overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at center, #14532d 0%, #064e3b 100%)' }}>
      <div className="absolute top-0 left-0 w-full h-48 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #f59e0b, transparent)' }}></div>
      <div className="absolute top-0 left-0 w-full h-48 opacity-20 pointer-events-none flex justify-around pt-12 text-4xl">
        <span>♠️</span><span>♥️</span><span>♣️</span><span>♦️</span>
      </div>

      <div className="w-full max-w-md px-6 pt-10 pb-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-yellow-500 bg-gray-700 flex items-center justify-center shadow-lg">
            <span className="text-xl">👤</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Nivel 12</span>
            <span className="text-sm font-black">ClashMaster_24</span>
          </div>
        </div>
        <div className="flex gap-2 items-center bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-yellow-400 text-xs font-bold">4,250 🪙</span>
        </div>
      </div>

      <div className="mb-4 text-center z-10 pt-4">
        <h1 className="text-5xl font-black italic tracking-tighter text-yellow-500 drop-shadow-[0_4px_0_rgba(180,83,9,1)]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          POKER<br />CLASH
        </h1>
        <div className="mt-1 text-[10px] uppercase font-bold tracking-[0.3em] text-emerald-400">clash.lebytek.com</div>
      </div>

      <div className="w-full max-w-md px-6 flex-1 flex flex-col gap-3 z-10 pb-4">
        <button
          onClick={() => onNavigate('playMenu')}
          className="group w-full py-5 bg-blue-600 rounded-2xl shadow-[0_6px_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
        >
          <Play className="text-white fill-white" size={24} />
          <span className="text-xl font-black uppercase italic text-white">Jugar</span>
        </button>

        <button
          onClick={() => onNavigate('physical')}
          className="group w-full py-5 bg-amber-500 rounded-2xl shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center relative text-black"
        >
          <div className="absolute -top-2 -right-2 bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-black text-white animate-pulse">NUEVO</div>
          <div className="flex items-center gap-3">
            <Layers size={24} className="text-black" />
            <span className="text-xl font-black uppercase italic text-black">Partida Física</span>
          </div>
          <span className="text-[9px] font-bold text-black/60 tracking-widest uppercase mt-1">Modo Realidad Mixta</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={true}
            className="py-4 bg-purple-600 rounded-xl shadow-[0_4px_0_#7e22ce] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-2 opacity-60 cursor-not-allowed text-center"
          >
            <ShoppingBag className="text-white" size={24} />
            <span className="text-[11px] font-bold uppercase text-white leading-tight px-2">Tienda</span>
          </button>
          <button
            disabled={true}
            className="py-4 bg-orange-500 rounded-xl shadow-[0_4px_0_#c2410c] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center gap-2 opacity-60 cursor-not-allowed text-center"
          >
            <Backpack className="text-white" size={24} />
            <span className="text-[11px] font-bold uppercase text-white leading-tight px-2">Mochila</span>
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-8">
          <button
            disabled={true}
            className="w-full py-3 bg-zinc-800 rounded-xl border border-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-white opacity-60 cursor-not-allowed"
          >
            <Settings size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Ajustes</span>
          </button>
          <button
            disabled={true}
            className="w-full py-3 bg-red-900/30 text-red-400 rounded-xl border border-red-900/50 active:scale-95 transition-all flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
          >
            <LogOut size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="w-full bg-black/50 p-4 border-t border-white/5 flex gap-4 overflow-x-auto pointer-events-none mt-auto z-10">
        <div className="flex-shrink-0 flex items-center gap-2 bg-emerald-950/50 p-2 rounded-lg border border-emerald-500/20">
          <div className="text-lg font-bold text-emerald-400">J</div>
          <div className="text-[9px] text-gray-400">30 HP</div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 bg-emerald-950/50 p-2 rounded-lg border border-emerald-500/20">
          <div className="text-lg font-bold text-yellow-500">K</div>
          <div className="text-[9px] text-gray-400">40 HP</div>
        </div>
        <div className="flex-shrink-0 flex flex-col justify-center px-2 bg-blue-900/20 rounded-lg border border-blue-500/20">
          <div className="text-[8px] font-bold text-blue-300 uppercase leading-none mb-1">Tip Regla</div>
          <div className="text-[9px] leading-tight">Suma exacta para derribar<br />o se reinicia vida</div>
        </div>
      </div>
      
      <div className="absolute right-12 bottom-12 w-64 bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl hidden lg:block z-10">
        <h3 className="text-yellow-500 font-bold mb-3 uppercase text-sm tracking-widest">Guía de Cartas</h3>
        <ul className="space-y-3 text-[11px]">
          <li className="flex justify-between border-b border-white/5 pb-1">
            <span>2-9</span><span className="text-red-400">-X Puntos</span>
          </li>
          <li className="flex justify-between border-b border-white/5 pb-1">
            <span>As (A)</span><span className="text-emerald-400">-1 pts / +1 Heal</span>
          </li>
          <li className="flex justify-between border-b border-white/5 pb-1">
            <span>Reina (Q)</span><span className="text-blue-400">Tower Heal</span>
          </li>
          <li className="flex justify-between">
            <span>Rey (K)</span><span className="text-red-600 font-bold">-15 Puntos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
