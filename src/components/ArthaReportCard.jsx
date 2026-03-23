import React from 'react';
import { useFinancials } from '../context/FinancialContext';

export default function ArthaReportCard({ score, waste, onRestart }) {
  const getStatus = () => {
    if (score >= 75) return { color: 'text-green-400', label: 'Financial Champion', theme: 'from-green-500 to-emerald-700' };
    if (score >= 40) return { color: 'text-yellow-400', label: 'Balanced Builder', theme: 'from-yellow-400 to-orange-600' };
    return { color: 'text-red-500', label: 'High Risk / Struggling', theme: 'from-red-600 to-rose-800' };
  };

  const status = getStatus();

  const getLostAssets = () => {
    const assets = [];
    if (waste >= 25000) assets.push({ icon: '🐄', title: 'Milch Cow', desc: 'LOST: Potential daily income from milk.' });
    if (waste >= 15000) assets.push({ icon: '⛲', title: 'Solar Pump', desc: 'LOST: Freedom from diesel costs.' });
    if (waste >= 5000) assets.push({ icon: '📚', title: 'Higher Schooling', desc: 'LOST: Enhanced future for children.' });
    if (assets.length === 0 && waste > 0) assets.push({ icon: '🌾', title: 'Better Seeds', desc: 'LOST: Higher yield per acre.' });
    return assets;
  };

  const assets = getLostAssets();

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 text-white overflow-y-auto p-6 sm:p-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="max-w-4xl mx-auto py-10">
        
        {/* Header Section */}
        <header className="text-center mb-16 px-4">
          <div className="inline-block px-6 py-2 bg-white/5 rounded-full border border-white/10 mb-6 backdrop-blur-sm">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Year 1 Performance Review</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            ARTHA SHALA
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: Artha Score Gauge */}
          <div className="flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,1)] relative overflow-hidden group">
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${status.theme} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
            
            <div className="relative">
              <svg className="w-64 h-64 transform -rotate-90">
                <circle cx="128" cy="128" r="110" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-gray-800" />
                <circle 
                  cx="128" cy="128" r="110" fill="transparent" stroke="currentColor" strokeWidth="12" 
                  strokeDasharray={691}
                  strokeDashoffset={691 - (691 * score) / 100}
                  className={`${status.color} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                <span className="text-6xl font-[1000] tracking-tighter">{score}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Artha Score</span>
              </div>
            </div>

            <div className={`mt-10 px-8 py-3 rounded-full border border-white/10 bg-black/40 text-sm font-black uppercase tracking-widest ${status.color}`}>
              {status.label}
            </div>
          </div>

          {/* RIGHT: Lost Wealth Section */}
          <div>
             <div className="mb-8 items-start">
               <h3 className="text-2xl font-black uppercase tracking-tight text-red-500 mb-2 italic">Hidden Costs</h3>
               <p className="text-gray-400 font-medium">You lost <span className="text-white font-black italic">₹{waste.toLocaleString()}</span> in interest & mistakes.</p>
             </div>

             <div className="space-y-4">
                {assets.map((asset, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group hover:-translate-x-2"
                  >
                    <div className="text-5xl group-hover:scale-125 transition-transform duration-500">{asset.icon}</div>
                    <div>
                      <h4 className="font-black text-xl uppercase tracking-tighter text-white">{asset.title}</h4>
                      <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-wider">{asset.desc}</p>
                    </div>
                  </div>
                ))}
                {assets.length === 0 && (
                   <div className="p-8 rounded-[2rem] bg-green-500/10 border border-green-500/20 text-center">
                      <div className="text-5xl mb-4">🏆</div>
                      <h4 className="font-black text-xl text-green-400 uppercase">Flawless Management</h4>
                      <p className="text-gray-400 text-sm mt-2 font-bold uppercase tracking-widest leading-relaxed">You minimized waste and maximized your village's potential!</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* RESTART ACTION */}
        <div className="mt-20 text-center">
           <button 
             onClick={onRestart}
             className="group relative px-12 py-6 bg-white text-black rounded-full text-sm font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
           >
             <span className="relative z-10 flex items-center gap-3">New Year, New Start <span className="text-xl">↺</span> </span>
             <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
           </button>
        </div>

      </div>
    </div>
  );
}
 
 
