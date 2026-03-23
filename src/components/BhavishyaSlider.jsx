import React, { useState } from 'react';

export default function BhavishyaSlider({ lesson, choice, onComplete }) {
  const [sliderValue, setSliderValue] = useState(100);
  const [hasInteracted, setHasInteracted] = useState(false);

  if (!lesson || !lesson.simulation) return null;

  const sim = lesson.simulation;
  const outcomeKey = choice || 'mid';
  const outcome = sim.outcomes[outcomeKey];
  
  const presentImg = sim.images.present;
  const futureImg = sim.images[outcome.visual] || sim.images.fair_field;

  const handleSliderChange = (e) => {
    setSliderValue(parseInt(e.target.value));
    if (!hasInteracted) setHasInteracted(true);
  };

  const getThemeColor = () => {
    if (outcome.color === 'green') return 'text-green-400 border-green-500 bg-green-500/20';
    if (outcome.color === 'yellow') return 'text-yellow-400 border-yellow-500 bg-yellow-500/20';
    return 'text-red-400 border-red-500 bg-red-500/20';
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col font-sans overflow-hidden">
      
      {/* Immersive Background Images (Cross-fade) */}
      <div className="absolute inset-0">
         <img 
           src={presentImg} 
           className="w-full h-full object-cover transition-opacity duration-700"
           style={{ opacity: sliderValue / 100 }}
           alt="Present"
         />
         <div 
           className="absolute inset-0"
           style={{ opacity: 1 - (sliderValue / 100) }}
         >
           <img 
             src={futureImg} 
             className="w-full h-full object-cover brightness-[0.6] contrast-[1.1]"
             alt="Future Consequence"
           />
           
           {/* Visual Overlays for Outcome Highlights */}
           {sliderValue < 30 && (
             <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className={`px-10 py-6 backdrop-blur-md rounded-[3rem] border-4 border-white shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col items-center ${outcome.color === 'red' ? 'bg-red-600/80' : outcome.color === 'yellow' ? 'bg-amber-500/80' : 'bg-green-600/80'}`}>
                   <h1 className="text-3xl font-black text-white italic tracking-tighter text-center">
                     {outcome.title}
                   </h1>
                   <p className="text-white/80 font-bold text-xs mt-2 uppercase tracking-widest">{outcome.impact}</p>
                </div>
             </div>
           )}
         </div>
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative flex-1 flex flex-col items-center justify-end pb-12 sm:pb-24 px-8 text-center">
        
        <div className={`transition-all duration-1000 transform ${sliderValue < 30 ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-6 ${getThemeColor()}`}>
            <span className="text-xl">{outcome.color === 'red' ? '⚠️' : '🌟'}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Future Perspective</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter leading-tight drop-shadow-2xl max-w-xl mx-auto">
            {outcome.description}
          </h2>

          <div className="mt-6 flex flex-col items-center gap-2">
             <div className={`flex flex-col items-center p-4 rounded-3xl border-2 backdrop-blur-md ${getThemeColor()}`}>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Artha Score</span>
               <span className="text-2xl font-black">{outcome.arthaChange > 0 ? '+' : ''}{outcome.arthaChange}</span>
             </div>
             
             {/* Artha Chacha's Emotional Line */}
             <div className="mt-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 max-w-xs transition-all duration-1000 delay-500">
               <p className="text-amber-200 font-bold italic text-sm">
                 👴 "Zameen ka khayal rakhoge, to woh bhi tumhara khayal rakhegi."
               </p>
             </div>
          </div>

          <button 
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 px-10 rounded-full mt-10 shadow-[0_20px_40px_-10px_rgba(22,163,74,0.5)] active:scale-95 transition-all flex items-center gap-3 border-t border-white/20 mx-auto group"
          >
            अगला पाठ सीखें (Continue Learning) <span className="group-hover:translate-x-2 transition-transform">➔</span>
          </button>
        </div>

        {/* The Slider Control */}
        <div className={`mt-12 w-full max-w-sm transition-opacity duration-500 ${sliderValue < 10 ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex justify-between items-end mb-4 px-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Present</span>
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest animate-pulse italic">Slide to see the harvest ➔</span>
          </div>
          <div className="relative group">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderValue} 
              onChange={handleSliderChange}
              className="w-full h-16 bg-white/10 backdrop-blur-3xl rounded-full appearance-none cursor-pointer border border-white/20 px-2 outline-none transition-all group-hover:bg-white/20 active:scale-[0.98]"
              style={{
                WebkitAppearance: 'none',
              }}
            />
            <div 
              className="absolute left-2 top-2 bottom-2 w-12 bg-white rounded-full flex items-center justify-center pointer-events-none shadow-xl transition-all"
              style={{ left: `calc(${sliderValue}% - ${sliderValue * 0.48}px)` }}
            >
              <div className="w-1 h-3 bg-slate-300 rounded-full mr-0.5" />
              <div className="w-1 h-5 bg-slate-400 rounded-full mx-0.5" />
              <div className="w-1 h-3 bg-slate-300 rounded-full ml-0.5" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
