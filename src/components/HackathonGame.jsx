import React from 'react';
import { useGame } from '../context/GameContext';
import VillageHub from './VillageHub';
import BhavishyaSlider from './BhavishyaSlider';
import ArthaReportCard from './ArthaReportCard';

export default function HackathonGame() {
  const { gameState } = useGame();

  const renderScreen = () => {
    switch (gameState) {
      case 'HUB':
        return <VillageHub />;
      case 'SLIDER_LESSON':
        return <BhavishyaSlider />;
      case 'END_REPORT':
        return <ArthaReportCard />;
      default:
        return <VillageHub />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* SHADOWED PHONE FRAME */}
      <div className="relative w-full max-w-[430px] h-[880px] bg-white rounded-[56px] shadow-[0_45px_100px_-25px_rgba(0,0,0,0.8)] border-[12px] border-slate-950 overflow-hidden flex flex-col">
        
        {/* Notch - Visual only */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
            <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderScreen()}
        </div>

        {/* Home Indicator - Visual only */}
        <div className="h-6 bg-white flex items-center justify-center pb-2">
           <div className="w-32 h-1.5 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
 
 
