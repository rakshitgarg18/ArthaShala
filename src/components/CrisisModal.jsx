import React from 'react';
import { useFinancials } from '../context/FinancialContext';

export default function CrisisModal({ lesson, onChoice }) {
  if (!lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-8 max-w-lg w-full border border-white/50 transform animate-in zoom-in-95 duration-500">
        
        {/* Header with Title Gradient */}
        <h2 className="text-3xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500 uppercase tracking-tighter">
          {lesson.crisis}
        </h2>
        
        <p className="text-slate-600 font-medium mb-8 leading-relaxed">
          The situation is critical. Your decision will impact your future directly.
        </p>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* GOOD CHOICE CARD */}
          <div 
            onClick={() => onChoice('good')}
            className="group relative overflow-hidden bg-green-50/50 hover:bg-green-100 border-2 border-green-400/30 hover:border-green-500 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-900/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-green-500/40 group-hover:rotate-12 transition-transform">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="text-green-900 font-black text-lg leading-tight uppercase">{lesson.goodChoice.text}</h3>
                <p className="text-green-700/70 text-xs font-bold mt-1">Recommended for high Artha Score</p>
              </div>
            </div>
          </div>

          {/* BAD CHOICE CARD */}
          <div 
            onClick={() => onChoice('bad')}
            className="group relative overflow-hidden bg-red-50/50 hover:bg-red-100 border-2 border-red-400/30 hover:border-red-500 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-900/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-red-500/40 group-hover:-rotate-12 transition-transform">
                ⚠
              </div>
              <div className="flex-1">
                <h3 className="text-red-900 font-black text-lg leading-tight uppercase">{lesson.badChoice.text}</h3>
                <p className="text-red-700/70 text-xs font-bold mt-1">High immediate cost / risk</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Choose wisely as the future is watching
          </p>
        </div>
      </div>
    </div>
  );
}
 
 
