import React, { useState } from 'react';

export default function BhavishyaSlider({ lesson, choice, onComplete }) {
  const [sliderValue, setSliderValue] = useState(100);

  if (!lesson || !lesson.simulation) return null;

  const sim = lesson.simulation;
  const outcomeKey = choice || 'mid';
  const outcome = sim.outcomes[outcomeKey];
  
  const presentImg = sim.images.present;
  const futureImg = sim.images[outcome.visual] || sim.images.fair_field;

  const handleSliderChange = (e) => {
    setSliderValue(parseInt(e.target.value));
  };

  const isFutureVisible = sliderValue < 40;

  const colorMap = {
    green:  { bg: 'bg-green-600',  text: 'text-green-400', border: 'border-green-500', emoji: '🌿' },
    yellow: { bg: 'bg-amber-500',  text: 'text-amber-400', border: 'border-amber-500', emoji: '⚠️' },
    red:    { bg: 'bg-red-600',    text: 'text-red-400',   border: 'border-red-500',   emoji: '💔' },
  };
  const theme = colorMap[outcome.color] || colorMap.yellow;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden font-sans relative bg-black">
      
      {/* Image Cross-Fade */}
      <div className="absolute inset-0">
        <img src={presentImg} className="w-full h-full object-cover" alt="Present" style={{ opacity: sliderValue / 100 }} />
        <img src={futureImg} className="w-full h-full object-cover absolute inset-0" alt="Future" style={{ opacity: 1 - (sliderValue / 100) }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Scrollable Content */}
      <div className="relative flex-1 flex flex-col overflow-y-auto pt-14 px-6 pb-4">

        {/* Header Badge */}
        <div className="flex-shrink-0 mb-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${theme.border} bg-black/40 backdrop-blur-md`}>
            <span className="text-xl">{theme.emoji}</span>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.text}`}>
              {isFutureVisible ? outcome.title : 'Slide to See Future'}
            </span>
          </div>
        </div>

        {/* Main Message — only on future reveal */}
        {isFutureVisible && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <h2 className="text-xl font-black text-white leading-tight mb-3">
              {outcome.description}
            </h2>
            
            {/* Impact Card */}
            <div className={`flex items-center gap-4 p-4 rounded-3xl border backdrop-blur-md bg-black/40 mb-4 ${theme.border}`}>
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${theme.bg} flex-shrink-0`}>
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Score</span>
                <span className="text-lg font-black text-white">{outcome.arthaChange > 0 ? '+' : ''}{outcome.arthaChange}</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">{outcome.impact}</p>
              </div>
            </div>

            {/* Artha Chacha Quote */}
            <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-3xl mb-4">
              <p className="text-amber-200 font-bold italic text-sm text-center">
                👴 "Zameen ka khayal rakhoge, to woh bhi tumhara khayal rakhegi."
              </p>
            </div>

            {/* Continue Button */}
            <button 
              onClick={onComplete}
              className={`w-full py-5 rounded-[2rem] font-black text-lg text-white ${theme.bg} shadow-lg active:scale-95 transition-all`}
            >
              अगला सबक सीखें ➔
            </button>
          </div>
        )}
        
        {/* Placeholder text when future not yet revealed */}
        {!isFutureVisible && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/40 font-bold text-center text-sm">
              स्लाइडर को बाईं ओर खींचो<br/>(Slide left to see the future)
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom: Slider */}
      <div className="relative flex-shrink-0 bg-black/60 backdrop-blur-md border-t border-white/10 px-6 py-5">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50 mb-3 px-1">
          <span>अभी / Now</span>
          <span>भविष्य / Future</span>
        </div>
        <div className="relative h-14 flex items-center">
          <div className="w-full h-2 bg-white/20 rounded-full" />
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderValue} 
            onChange={handleSliderChange}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-14"
          />
          {/* Custom Thumb */}
          <div 
            className="absolute w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center pointer-events-none transition-all border-4 border-slate-200"
            style={{ left: `calc(${sliderValue}% - ${sliderValue * 0.56}px)` }}
          >
            <span className="text-2xl">{sliderValue > 60 ? '🌾' : sliderValue > 30 ? '⏳' : theme.emoji}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
