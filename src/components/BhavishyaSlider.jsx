import React, { useState } from 'react';

export default function BhavishyaSlider({ lesson, choice, onComplete }) {
  const [sliderValue, setSliderValue] = useState(100);
  const [revealed, setRevealed] = useState(false);

  if (!lesson || !lesson.simulation) return null;

  const sim = lesson.simulation;
  const outcomeKey = choice || 'mid';
  const outcome = sim.outcomes[outcomeKey];
  const presentImg = sim.images.present;
  const futureImg = sim.images[outcome.visual] || sim.images.fair_field;
  const isBad = outcome.color === 'red';
  const isGood = outcome.color === 'green';

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val < 30 && !revealed) setRevealed(true);
  };

  const colorClass = {
    green:  { bg: 'bg-green-600',  border: 'border-green-500',  text: 'text-green-400', pill: 'bg-green-500/20 border-green-500/40' },
    yellow: { bg: 'bg-amber-500',  border: 'border-amber-500',  text: 'text-amber-400', pill: 'bg-amber-500/20 border-amber-500/40' },
    red:    { bg: 'bg-red-600',    border: 'border-red-500',    text: 'text-red-400',   pill: 'bg-red-500/20 border-red-500/40' },
  }[outcome.color] || {};

  return (
    <div className="h-full w-full flex flex-col overflow-hidden font-sans relative bg-black">

      {/* Cross-fade images */}
      <div className="absolute inset-0">
        <img src={presentImg} className="w-full h-full object-cover" alt="Present" style={{ opacity: sliderValue / 100 }} />
        <img src={futureImg}  className="w-full h-full object-cover absolute inset-0" alt="Future"  style={{ opacity: 1 - sliderValue / 100 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col overflow-y-auto px-6 pt-14 pb-4">

        {/* Outcome badge */}
        <div className={`inline-flex items-center gap-2 self-start px-4 py-2 rounded-full border backdrop-blur-md mb-6 ${colorClass.pill} ${colorClass.border}`}>
          <span className="text-xl">{isGood ? '🌾' : isBad ? '⚠️' : '📊'}</span>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${colorClass.text}`}>
            {revealed ? outcome.title : 'Slide left to see your harvest →'}
          </span>
        </div>

        {revealed && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col gap-4">

            {/* Main message */}
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter leading-tight">
                {outcome.messageHi}
              </h2>
              <p className="text-slate-400 font-bold text-sm mt-1">{outcome.message}</p>
            </div>

            {/* Loss/Gain grid */}
            {isBad && outcome.losses && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-red-500/30" />
                  <span className="text-red-400 font-black text-[10px] uppercase tracking-[0.3em]">
                    Aapka Nuksaan — You Lost {outcome.totalLoss}
                  </span>
                  <div className="h-px flex-1 bg-red-500/30" />
                </div>
                <div className="flex flex-col gap-2">
                  {outcome.losses.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-red-950/50 border border-red-500/20 rounded-2xl">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">{item.label}</p>
                      </div>
                      <span className="font-black text-red-400 text-base">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isGood && outcome.gains && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-green-500/30" />
                  <span className="text-green-400 font-black text-[10px] uppercase tracking-[0.3em]">Aapka Faida</span>
                  <div className="h-px flex-1 bg-green-500/30" />
                </div>
                <div className="flex flex-col gap-2">
                  {outcome.gains.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-green-950/50 border border-green-500/20 rounded-2xl">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">{item.label}</p>
                      </div>
                      <span className="font-black text-green-400 text-base">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Artha Chacha Quote */}
            <div className="p-4 bg-amber-900/30 border border-amber-500/30 rounded-3xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">👴</span>
                <p className="text-amber-200 font-bold italic text-sm leading-relaxed">
                  "Zameen ka khayal rakhoge, to woh bhi tumhara khayal rakhegi."
                </p>
              </div>
            </div>

            {/* Artha Score */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${colorClass.pill} ${colorClass.border}`}>
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${colorClass.bg} flex-shrink-0`}>
                <span className="text-[8px] font-black text-white/70 uppercase">Score</span>
                <span className="text-lg font-black text-white">{outcome.arthaChange > 0 ? '+' : ''}{outcome.arthaChange}</span>
              </div>
              <p className="text-white font-bold text-sm">Artha Score updated based on your farming decision.</p>
            </div>

            {/* Continue */}
            <button
              onClick={onComplete}
              className={`w-full py-5 rounded-[2rem] font-black text-base text-white ${colorClass.bg} active:scale-95 transition-all mt-2`}
            >
              अगला सबक सीखें ➔
            </button>
          </div>
        )}

        {!revealed && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-6xl animate-bounce">🌾</div>
            <p className="text-white/50 font-bold text-center text-sm leading-relaxed">
              स्लाइडर को बाईं ओर खींचो<br/>
              <span className="text-white/30">(Drag slider left to reveal your harvest)</span>
            </p>
          </div>
        )}
      </div>

      {/* Fixed Slider */}
      <div className="relative flex-shrink-0 bg-black/70 backdrop-blur-md border-t border-white/10 px-6 py-5">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">
          <span>भविष्य / Future</span>
          <span>अभी / Now</span>
        </div>
        <div className="relative h-14 flex items-center">
          <div className="absolute inset-x-0 h-2 bg-white/10 rounded-full mx-2" />
          <input
            type="range"
            min="0" max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-14"
          />
          {/* Custom thumb */}
          <div
            className="absolute w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center pointer-events-none border-4 border-slate-200 transition-all"
            style={{ left: `calc(${sliderValue}% - ${sliderValue * 0.56}px)` }}
          >
            <span className="text-2xl">
              {sliderValue > 65 ? '🌾' : sliderValue > 30 ? '⏳' : (isBad ? '⚠️' : '✨')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
