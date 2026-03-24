/**
 * SeedTrapScenario.jsx
 * 
 * A fully self-contained scenario that runs INSIDE the SimulationMap.
 * No screen switching. All events, decisions, and consequences 
 * are floating overlays on top of the live map.
 */
import React, { useState, useEffect } from 'react';

// ── SCENARIO STAGES ──────────────────────────────────────────────
// intro → seed_shop → fertilizer → farming → time_passing → outcome → complete
// ─────────────────────────────────────────────────────────────────

const OUTCOMES = {
  good: {
    title: '🌱 Mitti mazboot hai!',
    subtitle: 'Aapki zameen mazboot bani rahegi',
    detail: 'Hybrid seeds + balanced fertilizer = healthy soil, high yield.',
    arthaChange: +15,
    color: 'green',
    mapTint: 'rgba(34,197,94,0.18)',
    lines: [
      { icon: '🌾', label: 'Fasal', value: '+40% Yield' },
      { icon: '💧', label: 'Soil Health', value: '✅ Strong' },
      { icon: '💰', label: 'Income', value: '+₹25,000' },
    ],
  },
  bad: {
    title: '⚠️ Mitti kamzor ho gayi',
    subtitle: 'Zyada urea ne mitti ko kamzor kar diya',
    detail: 'Short-term crop looked good. Next season: -40% yield.',
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

// ── FLOATING EVENT CARD ──────────────────────────────────────────
function FloatingEventCard({ onDismiss }) {
  return (
    <div className="absolute top-20 left-4 right-4 z-[3000] animate-in slide-in-from-top-4 fade-in duration-500">
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
                "Naya season shuru ho gaya hai… beej aur khaad leni hai."
              </p>
            </div>
          </div>
          <div className="flex gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">🏪 Seed Shop</span>
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">🧪 Fertilizer</span>
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">🌾 Farm</span>
          </div>
          <button
            onClick={onDismiss}
            className="w-full py-3 bg-amber-500 text-white rounded-2xl font-black text-sm active:scale-95 transition-all"
          >
            Taiyar hoon! (Let's Go) ➔
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BOTTOM HINT STRIP ─────────────────────────────────────────────
function BottomHint({ icon, text }) {
  return (
    <div className="absolute bottom-24 left-4 right-4 z-[3000] animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-white font-bold text-sm">{text}</p>
      </div>
    </div>
  );
}

// ── SEED SHOP PICKER ─────────────────────────────────────────────
function SeedShopOverlay({ onPick }) {
  return (
    <div className="absolute inset-x-4 bottom-24 z-[4000] animate-in slide-in-from-bottom-8 fade-in duration-400">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-green-700 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="text-white font-black text-sm">Seed Shop</p>
            <p className="text-green-200 text-xs font-bold">Apne beej chuniye</p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <button
            onClick={() => onPick('basic')}
            className="w-full p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center gap-4 active:scale-95 transition-all group hover:border-amber-400"
          >
            <span className="text-3xl">🌿</span>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-800">Basic Seeds</p>
              <p className="text-slate-500 text-xs">Saamanya beej, low cost</p>
            </div>
            <span className="font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-full text-sm">₹1,500</span>
          </button>
          <button
            onClick={() => onPick('hybrid')}
            className="w-full p-4 bg-green-50 border-2 border-green-300 rounded-2xl flex items-center gap-4 active:scale-95 transition-all group hover:border-green-500"
          >
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
function FertilizerOverlay({ onPick }) {
  return (
    <div className="absolute inset-x-4 bottom-24 z-[4000] animate-in slide-in-from-bottom-8 fade-in duration-400">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-blue-700 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <div>
            <p className="text-white font-black text-sm">Fertilizer Shop</p>
            <p className="text-blue-200 text-xs font-bold">Khaad chuniye</p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <button
            onClick={() => onPick('urea')}
            className="w-full p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-4 active:scale-95 transition-all hover:border-red-400"
          >
            <span className="text-3xl">💊</span>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-800">Cheap Urea</p>
              <p className="text-red-500 text-xs font-bold">Jaldi faida, mitti ko nuksaan</p>
            </div>
            <span className="font-black text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm">₹800</span>
          </button>
          <button
            onClick={() => onPick('balanced')}
            className="w-full p-4 bg-green-50 border-2 border-green-300 rounded-2xl flex items-center gap-4 active:scale-95 transition-all hover:border-green-500"
          >
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
  const stages = { week2: { label: 'Week 2', emoji: '🌱', step: 0 }, month1: { label: 'Month 1', emoji: '🌿', step: 1 }, harvest: { label: 'Harvest!', emoji: '🌾', step: 2 } };
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

// ── OUTCOME CARD (floats on the map) ─────────────────────────────
function OutcomeCard({ outcome, onWantExplanation, onDone }) {
  const isGood = outcome.color === 'green';
  return (
    <div className="absolute inset-x-4 top-16 z-[4000] animate-in zoom-in-95 fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className={`px-5 py-5 ${isGood ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-orange-700'}`}>
          <h2 className="text-white font-black text-xl leading-tight">{outcome.title}</h2>
          <p className="text-white/80 font-bold text-sm mt-1">{outcome.subtitle}</p>
        </div>

        {/* Loss / Gain rows */}
        <div className="px-5 py-4 flex flex-col gap-2">
          {outcome.totalLoss && (
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-red-100" />
              <span className="text-red-500 font-black text-xs uppercase tracking-widest">Aapka Nuksaan: {outcome.totalLoss}</span>
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

        {/* Artha Chacha */}
        <div className="mx-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">👴</span>
          <p className="text-amber-800 font-bold italic text-sm leading-relaxed">
            "Zameen ka khayal rakhoge, to woh bhi tumhara khayal rakhegi."
          </p>
        </div>

        {/* Actions */}
        <div className="px-4 pb-5 flex flex-col gap-2">
          <button
            onClick={onWantExplanation}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm active:scale-95 transition-all"
          >
            Samajhna chahte ho? (Explain) 💡
          </button>
          <button
            onClick={onDone}
            className={`w-full py-4 text-white rounded-2xl font-black text-sm active:scale-95 transition-all ${isGood ? 'bg-green-600' : 'bg-amber-600'}`}
          >
            Gyan Kendra Wapas Jao ➔
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EXPLANATION MINI-CARD ─────────────────────────────────────────
function ExplainCard({ isGood, onClose }) {
  return (
    <div className="absolute inset-x-4 bottom-24 z-[5000] animate-in slide-in-from-bottom-6 fade-in duration-400">
      <div className="bg-slate-900 rounded-[2rem] p-5 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-amber-400 font-black text-xs uppercase tracking-widest">Artha Chacha Explains</span>
          <button onClick={onClose} className="text-white/40 text-lg">✕</button>
        </div>
        {isGood ? (
          <p className="text-white font-bold text-sm leading-relaxed">
            🌱 Hybrid seeds cost more, but they grow stronger crops. Balanced fertilizer keeps the soil alive for many seasons. <span className="text-green-400">Sahi nivesh, baar baar milenga.</span>
          </p>
        ) : (
          <p className="text-white font-bold text-sm leading-relaxed">
            ⚠️ Cheap urea gives fast growth in Year 1. But it depletes soil nitrogen. By Year 2, your yield drops 40%. <span className="text-red-400">Sasta aaj, mehenga kal.</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ── MAIN SCENARIO CONTROLLER ─────────────────────────────────────
export default function SeedTrapScenario({ onComplete, onHighlightsChange, onMapTintChange }) {
  const [stage, setStage] = useState('intro');      // intro|seed|fertilizer|farm_hint|time_passing|outcome|done
  const [timeStage, setTimeStage] = useState('week2');
  const [seedType, setSeedType] = useState(null);
  const [fertType, setFertType] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [showExplain, setShowExplain] = useState(false);

  // Communicate highlights to parent map
  useEffect(() => {
    const map = {
      intro:        [],
      seed:         ['seed_shop'],
      fertilizer:   ['fertilizer'],
      farm_hint:    ['farm'],
      time_passing: [],
      outcome:      [],
      done:         [],
    };
    onHighlightsChange(map[stage] || []);
  }, [stage, onHighlightsChange]);

  // Communicate map tint to parent
  useEffect(() => {
    if (stage === 'outcome' && outcome) {
      onMapTintChange(outcome.mapTint);
    } else {
      onMapTintChange(null);
    }
  }, [stage, outcome, onMapTintChange]);

  // Handle location tap from parent map
  const handleLocationTap = (locId) => {
    if (stage === 'seed' && locId === 'seed_shop') return; // handled by overlay
    if (stage === 'fertilizer' && locId === 'fertilizer') return;
    if (stage === 'farm_hint' && locId === 'farm') {
      startTimePassing();
    }
  };

  const startTimePassing = () => {
    setStage('time_passing');
    setTimeStage('week2');
    setTimeout(() => setTimeStage('month1'), 1500);
    setTimeout(() => setTimeStage('harvest'), 3000);
    setTimeout(() => {
      const isGood = (seedType === 'hybrid') || (fertType === 'balanced');
      const isBad = fertType === 'urea' && seedType !== 'hybrid';
      const outcomeKey = isBad ? 'bad' : isGood ? 'good' : 'good';
      setOutcome(OUTCOMES[outcomeKey]);
      setStage('outcome');
    }, 4500);
  };

  return (
    <>
      {/* Stage: Intro floating event card */}
      {stage === 'intro' && (
        <FloatingEventCard onDismiss={() => setStage('seed')} />
      )}

      {/* Stage: Seed shop hint */}
      {stage === 'seed' && (
        <BottomHint icon="🏪" text="Seed Shop pe jao — Beej chuniye (Select your seeds)" />
      )}

      {/* Stage: Fertilizer hint */}
      {stage === 'fertilizer' && (
        <BottomHint icon="🧪" text="Fertilizer Shop pe jao — Khaad chuniye (Select fertilizer)" />
      )}

      {/* Stage: Farm hint */}
      {stage === 'farm_hint' && (
        <BottomHint icon="🌾" text="Farm pe jao — Kheti shuru karo! (Go to Farm to start)" />
      )}

      {/* Stage: Time passing */}
      {stage === 'time_passing' && <TimePassingOverlay stage={timeStage} />}

      {/* Stage: Outcome */}
      {stage === 'outcome' && outcome && (
        <>
          <OutcomeCard
            outcome={outcome}
            onWantExplanation={() => setShowExplain(true)}
            onDone={onComplete}
          />
          {showExplain && (
            <ExplainCard
              isGood={outcome.color === 'green'}
              onClose={() => setShowExplain(false)}
            />
          )}
        </>
      )}

      {/* Seed Shop popup — appears when user taps Seed Shop during 'seed' stage */}
      {stage === 'seed' && (
        <SeedShopOverlay onPick={(type) => { setSeedType(type); setStage('fertilizer'); }} />
      )}

      {/* Fertilizer popup — appears when user is in 'fertilizer' stage */}
      {stage === 'fertilizer' && (
        <FertilizerOverlay onPick={(type) => { setFertType(type); setStage('farm_hint'); }} />
      )}
    </>
  );
}

// Export location tap handler helper so SimulationMap can forward taps
export { OUTCOMES };
