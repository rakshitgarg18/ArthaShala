import React from 'react';
import { useGame } from '../context/GameContext';

export default function VillageHub() {
  const { currentLesson, currentMonth, arthaScore, makeChoice } = useGame();

  if (!currentLesson) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* HUD Bar */}
      <div className="flex justify-between items-center p-6 bg-white border-b border-slate-200">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Month</span>
          <span className="text-2xl font-black text-indigo-600 leading-none">{currentMonth}/12</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Artha Score</span>
          <div className="flex items-center gap-2">
             <div className="w-24 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${arthaScore}%` }} 
                />
             </div>
             <span className="text-xl font-black text-indigo-600 tabular-nums leading-none">{arthaScore}</span>
          </div>
        </div>
      </div>

      {/* Main Crisis Section */}
      <div className="flex-1 flex flex-col p-8 gap-8 justify-center items-center">
        
        {/* Animated Icon/Visual */}
        <div className="w-40 h-40 bg-indigo-50 rounded-full flex items-center justify-center text-6xl shadow-inner border-2 border-indigo-100 animate-bounce">
          💡
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black italic tracking-tighter leading-tight text-slate-900">
            {currentLesson.crisis.split('(')[0]}
          </h1>
          <p className="text-xl font-bold text-slate-500 italic opacity-80 leading-snug">
            {currentLesson.crisis.split('(')[1]?.replace(')', '')}
          </p>
        </div>

        <div className="w-full flex flex-col gap-4 mt-8">
          {/* GOOD CHOICE BUTTON */}
          <button 
            onClick={() => makeChoice('good')}
            className="w-full p-8 bg-green-600 hover:bg-green-700 active:scale-95 transition-all rounded-[32px] text-white shadow-xl shadow-green-900/10 flex flex-col items-center gap-1 group border-b-8 border-green-800"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Option A</span>
            <span className="text-2xl font-black italic">{currentLesson.goodChoice.text}</span>
          </button>

          {/* BAD CHOICE BUTTON */}
          <button 
            onClick={() => makeChoice('bad')}
            className="w-full p-8 bg-red-600 hover:bg-red-700 active:scale-95 transition-all rounded-[32px] text-white shadow-xl shadow-red-900/10 flex flex-col items-center gap-1 group border-b-8 border-red-800"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Option B</span>
            <span className="text-2xl font-black italic">{currentLesson.badChoice.text}</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Tip */}
      <div className="p-6 bg-slate-100 text-center">
        <p className="text-sm font-bold text-slate-500 italic uppercase tracking-wider">
          Choose the path of wisdom, beta.
        </p>
      </div>
    </div>
  );
}
 
 
