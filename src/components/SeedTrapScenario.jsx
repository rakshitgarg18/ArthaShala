/**
 * SeedTrapScenario.jsx
 * 
 * Map-first scenario. No screen switching.
 * Floating cards, pickers triggered on PIN TAP (not automatic),
 * map dimmed with highlighted pin glowing through.
 */
import React, { useState, useEffect, useCallback } from 'react';

const OUTCOMES = {
  good: {
    title: '🌱 Mitti mazboot hai!',
    subtitle: 'Aapki zameen mazboot bani rahegi',
    arthaChange: +15,
    color: 'green',
    mapTint: 'rgba(34,197,94,0.18)',
    totalLoss: null,
    lines: [
      { icon: '🌾', label: 'Fasal', value: '+40% Yield' },
      { icon: '💧', label: 'Soil Health', value: '✅ Strong' },
      { icon: '💰', label: 'Income', value: '+₹25,000' },
    ],
  },
  bad: {
    title: '⚠️ Mitti kamzor ho gayi',
    subtitle: 'Zyada urea ne mitti ko kamzor kar diya',
    arthaChange: -20,
    color: 'red',
    mapTint: 'rgba(239,68,68,0.15)',
    totalLoss: '₹10,000',
    lines: [
      { icon: '🌾', label: 'Fasal / Crop Loss', value: '−40%' },
      { icon: '💧', label: 'Mitti / Soil', value: '−60% fertility' },
      { icon: '💰', label: 'Agle Season', value: '−₹10,000' },
    ],
  },
};

// ── FLOATING EVENT CARD ───────────────────────────────────────────
function FloatingEventCard({ onDismiss }) {
  return (
    <div className="absolute top-16 left-4 right-4 z-[3000] animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-amber-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 flex items-center gap-3">
          <span className="text-3xl">🌾</span>
          <div>
            <p className="text-white font-black text-sm">Season Started!</p>
            <p className="text-amber-100 text-xs font-bold">Apni fasal ki tayari karo</p>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-xl flex-shrink-0">👴</div>
            <div className="bg-amber-50 rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
              <p className="text-amber-900 font-bold text-sm italic leading-relaxed">
                "Naya season shuru ho gaya… Seed Shop pe jao aur beej chuniye."
              </p>
            </div>
          </div>
          <div className="flex gap-2 text-[10px] font-black text-slate-500 mb-4 flex-wrap">
            <span className="px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-full text-amber-800">🏪 1. Seed Shop</span>
            <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">🧪 2. Fertilizer</span>
          </div>
          <button
            onClick={onDismiss}
            className="w-full py-3 bg-amber-500 text-white rounded-2xl font-black text-sm active:scale-95 transition-all"
          >
            Samajh gaya — Chalo! ➔
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BOTTOM HINT STRIP ─────────────────────────────────────────────
function BottomHint({ icon, text }) {
  return (
    <div className="absolute bottom-28 left-4 right-4 z-[3000] animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-slate-900/90 backdrop-blur-md border border-amber-400/30 rounded-2xl px-5 py-4 flex items-center gap-3">
        <span className="text-2xl animate-bounce">{icon}</span>
        <p className="text-white font-bold text-sm">{text}</p>
      </div>
    </div>
  );
}

// ── SEED SHOP PICKER ─────────────────────────────────────────────
function SeedShopPicker({ onPick, onClose }) {
  return (
    <div className="absolute inset-x-4 bottom-28 z-[4000] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-green-100">
        <div className="bg-green-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <p className="text-white font-black text-sm">Seed Shop</p>
              <p className="text-green-200 text-xs">Apne beej chuniye</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 text-lg w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <button onClick={() => onPick('basic')}
            className="w-full p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center gap-4 active:scale-95 transition-all hover:border-amber-400">
            <span className="text-3xl">🌿</span>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-800">Basic Seeds</p>
              <p className="text-slate-500 text-xs">Saamanya beej — sasta</p>
            </div>
            <span className="font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-sm">₹1,500</span>
          </button>
          <button onClick={() => onPick('hybrid')}
            className="w-full p-4 bg-green-50 border-2 border-green-300 rounded-2xl flex items-center gap-4 active:scale-95 transition-all hover:border-green-500">
            <span className="text-3xl">🌱</span>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-800">Hybrid Seeds</p>
              <p className="text-green-600 text-xs font-bold">Better yield, healthy soil</p>
            </div>
            <span className="font-black text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">₹2,500</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FERTILIZER PICKER ─────────────────────────────────────────────
function FertilizerPicker({ onPick, onClose }) {
  return (
    <div className="absolute inset-x-4 bottom-28 z-[4000] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-blue-100">
        <div className="bg-blue-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            <div>
              <p className="text-white font-black text-sm">Fertilizer Shop</p>
              <p className="text-blue-200 text-xs">Khaad chuniye</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 text-lg w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <button onClick={() => onPick('urea')}
            className="w-full p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-4 active:scale-95 transition-all hover:border-red-400">
            <span className="text-3xl">💊</span>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-800">Cheap Urea</p>
              <p className="text-red-500 text-xs font-bold">Jaldi faida, mitti ko nuksaan</p>
            </div>
            <span className="font-black text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm">₹800</span>
          </button>
          <button onClick={() => onPick('balanced')}
            className="w-full p-4 bg-green-50 border-2 border-green-300 rounded-2xl flex items-center gap-4 active:scale-95 transition-all hover:border-green-500">
            <span className="text-3xl">🌿</span>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-800">Balanced Fertilizer</p>
              <p className="text-green-600 text-xs font-bold">Long-term soil health</p>
            </div>
            <span className="font-black text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">₹1,800</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TIME PASSING OVERLAY ──────────────────────────────────────────
function TimePassingOverlay({ stage }) {
  const stages = {
    week2:   { label: 'Week 2',   emoji: '🌱', step: 0 },
    month1:  { label: 'Month 1',  emoji: '🌿', step: 1 },
    harvest: { label: 'Harvest!', emoji: '🌾', step: 2 },
  };
  const s = stages[stage] || stages.week2;
  return (
    <div className="absolute inset-0 z-[5000] bg-amber-950/95 flex flex-col items-center justify-center gap-6 px-8">
      <p className="text-amber-400 font-black uppercase tracking-[0.4em] text-xs">समय बीत रहा है / Time Passing</p>
      <div className="text-9xl animate-bounce">{s.emoji}</div>
      <h1 className="text-5xl font-black text-white italic tracking-tighter">{s.label}</h1>
      <div className="flex gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-2 w-12 rounded-full transition-all duration-700 ${i <= s.step ? 'bg-amber-400' : 'bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}

// ── OUTCOME CARD ─────────────────────────────────────────────────
function OutcomeCard({ outcome, onDone, onWantExplanation }) {
  const isGood = outcome.color === 'green';
  return (
    <div className="absolute inset-x-4 top-14 z-[4000] animate-in zoom-in-95 fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className={`px-5 py-5 ${isGood ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-orange-700'}`}>
          <h2 className="text-white font-black text-xl">{outcome.title}</h2>
          <p className="text-white/80 font-bold text-sm mt-1">{outcome.subtitle}</p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-2">
          {outcome.totalLoss && (
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-red-100" />
              <span className="text-red-500 font-black text-[10px] uppercase tracking-widest">Nuksaan: {outcome.totalLoss}</span>
              <div className="h-px flex-1 bg-red-100" />
            </div>
          )}
          {outcome.lines.map((l, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl ${isGood ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="text-2xl">{l.icon}</span>
              <span className="flex-1 font-bold text-slate-700 text-sm">{l.label}</span>
              <span className={`font-black text-sm ${isGood ? 'text-green-600' : 'text-red-600'}`}>{l.value}</span>
            </div>
          ))}
        </div>
        <div className="mx-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">👴</span>
          <p className="text-amber-800 font-bold italic text-sm leading-relaxed">
            "Zameen ka khayal rakhoge, to woh bhi tumhara khayal rakhegi."
          </p>
        </div>
        <div className="px-4 pb-5 flex flex-col gap-2">
          <button onClick={onWantExplanation}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm active:scale-95 transition-all">
            Samajhna chahte ho? 💡
          </button>
          <button onClick={onDone}
            className={`w-full py-4 text-white rounded-2xl font-black text-sm active:scale-95 transition-all ${isGood ? 'bg-green-600' : 'bg-amber-600'}`}>
            Gyan Kendra Wapas Jao ➔
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MINI EXPLANATION ──────────────────────────────────────────────
function ExplainCard({ isGood, onClose }) {
  return (
    <div className="absolute inset-x-4 bottom-28 z-[5500] animate-in slide-in-from-bottom-6 fade-in duration-300">
      <div className="bg-slate-900 rounded-[2rem] p-5 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-amber-400 font-black text-xs uppercase tracking-widest">Artha Chacha</span>
          <button onClick={onClose} className="text-white/40 text-lg w-8 h-8 flex items-center justify-center">✕</button>
        </div>
        <p className="text-white font-bold text-sm leading-relaxed">
          {isGood
            ? '🌱 Hybrid seeds cost more but grow stronger. Balanced fertilizer keeps soil alive every season. Sahi nivesh, baar baar milenga!'
            : '⚠️ Cheap urea looks good in Year 1. But by Year 2, yield drops 40% due to soil damage. Sasta aaj, mehenga kal.'}
        </p>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────
export default function SeedTrapScenario({ onComplete, onHighlightsChange, onMapTintChange, onRegisterTapHandler }) {
  const [stage, setStage] = useState('intro');
  const [timeStage, setTimeStage] = useState('week2');
  const [showPicker, setShowPicker] = useState(false);
  const [seedType, setSeedType] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [showExplain, setShowExplain] = useState(false);

  // Update parent with which pins should glow
  useEffect(() => {
    const highlightMap = {
      intro:        [],
      seed:         ['seed_shop'],
      fertilizer:   ['fertilizer'],
      time_passing: [],
      outcome:      [],
    };
    onHighlightsChange(highlightMap[stage] || []);
  }, [stage, onHighlightsChange]);

  // Update map tint color on outcome
  useEffect(() => {
    if (stage === 'outcome' && outcome) {
      onMapTintChange(outcome.mapTint);
    } else {
      onMapTintChange(null);
    }
  }, [stage, outcome, onMapTintChange]);

  // Handle a location pin being tapped on the map
  const handleLocationTap = useCallback((locId) => {
    if (stage === 'seed' && locId === 'seed_shop') {
      setShowPicker(true);
    }
    if (stage === 'fertilizer' && locId === 'fertilizer') {
      setShowPicker(true);
    }
  }, [stage]);

  // Register the tap handler with the parent (SimulationMap)
  useEffect(() => {
    onRegisterTapHandler?.(handleLocationTap);
  }, [handleLocationTap, onRegisterTapHandler]);

  const handleSeedPick = (type) => {
    setSeedType(type);
    setShowPicker(false);
    setStage('fertilizer');
  };

  const handleFertilizerPick = (type) => {
    setShowPicker(false);
    // Directly go to time passing — no farm step
    const isGood = seedType === 'hybrid' || type === 'balanced';
    startTimePassing(seedType, type, isGood);
  };

  const startTimePassing = (seed, fert, isGood) => {
    setStage('time_passing');
    setTimeStage('week2');
    setTimeout(() => setTimeStage('month1'), 1500);
    setTimeout(() => setTimeStage('harvest'), 3000);
    setTimeout(() => {
      const isBad = fert === 'urea' && seed !== 'hybrid';
      setOutcome(OUTCOMES[isBad ? 'bad' : 'good']);
      setStage('outcome');
    }, 4500);
  };

  const isDimmed = (stage === 'seed' || stage === 'fertilizer') && !showPicker;

  return (
    <>
      {/* ── MAP DIM OVERLAY: visible when a specific pin must be tapped ── */}
      {isDimmed && (
        <div className="absolute inset-0 z-[2000] bg-slate-900/55 backdrop-blur-[1px] pointer-events-none transition-all duration-500" />
      )}

      {/* Intro card */}
      {stage === 'intro' && <FloatingEventCard onDismiss={() => setStage('seed')} />}

      {/* Hint strips (only when picker is closed) */}
      {stage === 'seed' && !showPicker && (
        <BottomHint icon="🏪" text="Seed Shop ka pin tapein — Beej chuniye (Tap the glowing Seed Shop)" />
      )}
      {stage === 'fertilizer' && !showPicker && (
        <BottomHint icon="🧪" text="Fertilizer Shop tapein — Khaad chuniye (Tap the glowing Fertilizer shop)" />
      )}

      {/* Pickers — only appear after user taps the pin */}
      {stage === 'seed' && showPicker && (
        <SeedShopPicker onPick={handleSeedPick} onClose={() => setShowPicker(false)} />
      )}
      {stage === 'fertilizer' && showPicker && (
        <FertilizerPicker onPick={handleFertilizerPick} onClose={() => setShowPicker(false)} />
      )}

      {/* Time passing */}
      {stage === 'time_passing' && <TimePassingOverlay stage={timeStage} />}

      {/* Outcome card */}
      {stage === 'outcome' && outcome && (
        <>
          <OutcomeCard
            outcome={outcome}
            onDone={onComplete}
            onWantExplanation={() => setShowExplain(true)}
          />
          {showExplain && (
            <ExplainCard isGood={outcome.color === 'green'} onClose={() => setShowExplain(false)} />
          )}
        </>
      )}
    </>
  );
}
