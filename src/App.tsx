import React, { useState } from 'react';
import { Menu } from './components/Menu';
import { PlayMenu } from './components/PlayMenu';
import { PartidaFisica } from './components/PartidaFisica';
import { PartidaVirtual } from './components/PartidaVirtual';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('menu');

  return (
    <div className="font-sans antialiased text-slate-900 w-full h-full min-h-screen bg-slate-950">
      {currentScreen === 'menu' && (
        <Menu onNavigate={(screen) => setCurrentScreen(screen)} />
      )}
      {currentScreen === 'playMenu' && (
        <PlayMenu onNavigate={(screen) => setCurrentScreen(screen)} onBack={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'physical' && (
        <PartidaFisica onBack={() => setCurrentScreen('menu')} />
      )}
      {currentScreen === 'virtual' && (
        <PartidaVirtual onBack={() => setCurrentScreen('playMenu')} />
      )}
    </div>
  );
}
