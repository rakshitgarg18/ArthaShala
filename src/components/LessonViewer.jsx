import React, { useState } from 'react';

// Screen 1: Action Cards
function ActionScreen({ screen, onNext }) {
  const [picked, setPick] = useState(null);

  const colorMap = {
    amber: {
      card: 'border-amber-400 bg-amber-950/60',
      tag: 'bg-amber-500 text-white',
      icon: 'bg-amber-400/20',
    },
    green: {
      card: 'border-green-400 bg-green-950/60',
      tag: 'bg-green-500 text-white',
      icon: 'bg-green-400/20',
    },
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-slate-950" />
      <div className="absolute inset-x-0 top-0 h-48 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=800&q=40')] bg-cover bg-center opacity-20" />

      <div className="relative z-10 flex flex-col h-full px-6 pt-14 pb-6">
        {/* Artha Chacha voice bubble */}
        <div className="flex items-start gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-2xl flex-shrink-0 border-2 border-amber-300 shadow-lg">👴</div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl rounded-tl-sm px-5 py-4 flex-1">
            <p className="text-white font-bold text-sm leading-relaxed italic">
              "{screen.voiceover}"
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">🌾 Season Start</span>
          <h1 className="text-3xl font-black text-white italic tracking-tighter leading-tight mt-1">
            {screen.title}
          </h1>
          <p className="text-slate-400 font-bold text-sm mt-1">{screen.subtitle}</p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col gap-4 flex-1">
          {screen.actions.map((action) => {
            const c = colorMap[action.color] || colorMap.amber;
            const isSelected = picked === action.id;
            return (
              <button
                key={action.id}
                onClick={() => setPick(action.id)}
                className={`w-full p-5 rounded-[2rem] border-2 text-left flex items-center gap-5 transition-all active:scale-95 ${isSelected ? c.card + ' scale-[1.02] shadow-2xl' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${isSelected ? c.icon : 'bg-white/5'}`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <div className="font-black text-white text-base leading-tight">{action.label}</div>
                  <div className="text-slate-400 text-sm mt-0.5">{action.sublabel}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-black text-white bg-white/10 px-3 py-1 rounded-full text-sm">{action.cost}</span>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isSelected ? c.tag : 'bg-white/10 text-white/50'}`}>{action.tag}</span>
                  </div>
                </div>
                {isSelected && <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-black flex-shrink-0">✓</div>}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => picked && onNext(picked)}
          className={`mt-6 w-full py-5 rounded-[2rem] font-black text-base uppercase tracking-widest transition-all active:scale-95 ${picked ? 'bg-amber-500 text-white shadow-[0_8px_30px_-5px_rgba(245,158,11,0.5)]' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
        >
          {picked ? 'आगे बढ़ो (Continue) ➔' : 'पहले चुनो (Pick one first)'}
        </button>
      </div>
    </div>
  );
}

// Screen 2: Warning Story
function WarningScreen({ screen, onNext }) {
  return (
    <div className="h-full flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-red-950" />

      <div className="relative z-10 flex flex-col h-full px-6 pt-14 pb-6 justify-between">
        {/* Visual */}
        <div className="flex flex-col items-center mt-4 mb-6">
          <div className="w-32 h-32 rounded-full bg-amber-500/20 border-4 border-amber-500/40 flex items-center justify-center text-7xl animate-pulse mb-4">
            ⚠️
          </div>
          <span className="text-amber-400 font-black uppercase tracking-[0.3em] text-xs">Soil Alert</span>
        </div>

        {/* Artha Chacha */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-2xl flex-shrink-0 border-2 border-amber-300">👴</div>
          <div className="bg-white/10 border border-white/20 rounded-3xl rounded-tl-sm px-5 py-4 flex-1">
            <p className="text-white font-bold text-sm italic leading-relaxed">
              "{screen.voiceover}"
            </p>
          </div>
        </div>

        {/* Two-column comparison */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-green-900/40 border border-green-500/30 rounded-3xl p-4 flex flex-col items-center gap-2">
            <span className="text-3xl">🌿</span>
            <p className="text-green-300 font-black text-xs text-center uppercase tracking-wide">Pehle<br/>Short-term</p>
            <p className="text-white font-bold text-sm text-center">अच्छी फसल</p>
          </div>
          <div className="bg-red-900/40 border border-red-500/30 rounded-3xl p-4 flex flex-col items-center gap-2">
            <span className="text-3xl">🏜️</span>
            <p className="text-red-400 font-black text-xs text-center uppercase tracking-wide">Baad Mein<br/>Long-term</p>
            <p className="text-white font-bold text-sm text-center">बंजर मिट्टी</p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full py-5 bg-white/10 border border-white/20 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
        >
          समझ गया (Got It) ➔
        </button>
      </div>
    </div>
  );
}

// Screen 3: Bridge to Map
function BridgeScreen({ screen, onStartDemo }) {
  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=800&q=60"
          className="w-full h-full object-cover brightness-[0.3]"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col h-full items-center justify-end px-6 pb-10">
        {/* Map preview icon */}
        <div className="w-32 h-32 rounded-full border-4 border-amber-400/50 bg-amber-500/20 backdrop-blur-md flex items-center justify-center text-6xl mb-8 animate-pulse shadow-[0_0_60px_rgba(245,158,11,0.3)]">
          🗺️
        </div>

        <span className="text-amber-400 font-black uppercase tracking-[0.4em] text-[10px] mb-3">Ready to Practice?</span>
        <h1 className="text-4xl font-black text-white italic tracking-tighter text-center leading-tight mb-3">
          {screen.title}
        </h1>
        <p className="text-slate-400 font-bold text-sm text-center mb-10">
          {screen.subtitle}
        </p>

        {/* Chip hints */}
        <div className="flex gap-2 mb-10 flex-wrap justify-center">
          {['🏪 Seed Shop', '🧪 Fertilizer', '🌾 Your Farm'].map((h) => (
            <span key={h} className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs rounded-full">
              {h}
            </span>
          ))}
        </div>

        <button
          onClick={onStartDemo}
          className="w-full py-7 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_20px_60px_-10px_rgba(245,158,11,0.5)] active:scale-95 transition-all border border-amber-300/30"
        >
          {screen.cta}
        </button>
      </div>
    </div>
  );
}

// Main LessonViewer
export default function LessonViewer({ lesson, onStartDemo }) {
  const [screenIdx, setScreenIdx] = useState(0);
  const [firstAction, setFirstAction] = useState(null);

  if (!lesson) return null;

  const screens = lesson.screens || [];
  const current = screens[screenIdx];

  if (!current) return null;

  const handleNext = (actionId) => {
    if (actionId) setFirstAction(actionId);
    setScreenIdx((i) => Math.min(i + 1, screens.length - 1));
  };

  if (current.type === 'action') {
    return <ActionScreen key={screenIdx} screen={current} onNext={handleNext} />;
  }
  if (current.type === 'story') {
    return <WarningScreen key={screenIdx} screen={current} onNext={() => handleNext()} />;
  }
  if (current.type === 'bridge') {
    return <BridgeScreen key={screenIdx} screen={current} onStartDemo={onStartDemo} />;
  }

  return null;
}
