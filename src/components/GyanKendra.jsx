import React from 'react';
import { useFinancials } from '../context/FinancialContext.jsx';
import lessonsData from '../data/lessons.json';

export default function GyanKendra({ onSelectModule, onExploreVillage }) {
  const { language, completedModules, arthaScore } = useFinancials();

  const t = {
    hi: {
      title: 'ज्ञान केंद्र',
      subtitle: 'सफलता की ओर आपका पहला कदम',
      start: 'सीखें',
      completed: 'पूर्ण',
      score: 'आपका स्कोर',
      explore: 'गाँव घूमें (Explore Village) ➔'
    },
    en: {
      title: 'Gyan Kendra',
      subtitle: 'Your first step towards success',
      start: 'Learn',
      completed: 'Done',
      score: 'Your Score',
      explore: 'Explore Village ➔'
    }
  }[language] || {
    title: 'Gyan Kendra',
    subtitle: 'Your first step towards success',
    start: 'Learn',
    completed: 'Done',
    score: 'Your Score',
    explore: 'Explore Village ➔'
  };

  const moduleIcons = {
    seed_trap: '🌾',
    monsoon_ruin: '🌧️',
    medical_shock: '🏥',
    cyber_fraud: '📱',
    distress_sell: '⚖️',
    soil_health: '🧪',
    wedding_pressure: '💍',
    pension_plan: '👴',
    microfinance: '🐄',
    emergency_funds: '🔧'
  };

  return (
    <div className="h-full w-full bg-orange-50/30 flex flex-col overflow-hidden font-sans">
      
      {/* Header Section - Warmer, more inviting */}
      <header className="px-6 pt-12 pb-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white relative shadow-lg">
        <div className="absolute top-4 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80 mr-2">{t.score}</span>
          <span className="text-xl font-black italic">{arthaScore}</span>
        </div>
        
        <h1 className="text-4xl font-black italic tracking-tighter leading-tight">
          {t.title}
        </h1>
        <p className="text-amber-100 font-bold text-sm opacity-90 mt-1">
          {t.subtitle}
        </p>
      </header>

      {/* Explore Village CTA - Prominent for rural users who want to see the map */}
      <div className="px-6 mt-6">
        <button 
          onClick={onExploreVillage}
          className="w-full bg-white border-2 border-amber-200 p-5 rounded-[2rem] flex items-center justify-between shadow-xl shadow-amber-900/5 active:scale-95 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
              🚜
            </div>
            <span className="text-xl font-black text-amber-900 italic">{t.explore}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black">
            +
          </div>
        </button>
      </div>

      {/* Modules Grid - Two columns for better accessibility */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 grid grid-cols-2 gap-4 auto-rows-max">
        {lessonsData.map((module, idx) => {
          const isCompleted = completedModules.includes(module.id);
          const isLocked = idx > 0 && !completedModules.includes(lessonsData[idx - 1].id);
          const icon = moduleIcons[module.id] || '📖';

          return (
            <div 
              key={module.id}
              onClick={() => !isLocked && onSelectModule(module.id)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer ${isCompleted ? 'bg-green-50 border-green-200' : isLocked ? 'bg-slate-100 border-slate-200 opacity-50 grayscale cursor-not-allowed' : 'bg-white border-white shadow-xl shadow-amber-900/5 hover:border-amber-400 hover:scale-[1.05]'}`}
            >
              <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 shadow-inner border ${isCompleted ? 'bg-green-100 border-green-200' : 'bg-orange-50 border-orange-100'}`}>
                {isLocked ? '🔒' : icon}
              </div>
              
              <h3 className="text-center text-sm font-black text-slate-800 leading-tight tracking-tighter uppercase line-clamp-2 h-10 px-2">
                {module.id.replace(/_/g, ' ')}
              </h3>
              
              {isCompleted ? (
                <div className="mt-3 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {t.completed}
                </div>
              ) : !isLocked && (
                <div className="mt-3 px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-amber-500/30">
                  {t.start}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fixed bottom safety visual */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-300/40 rounded-full pointer-events-none" />

    </div>
  );
}
