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
    titleHi: '🌱 मिट्टी मजबूत है!',
    subtitle: 'Aapki zameen mazboot bani rahegi',
    subtitleHi: 'आपकी जमीन उपजाऊ बनी रहेगी।',
    arthaChange: +15,
    color: 'green',
    mapTint: 'rgba(34,197,94,0.18)',
    totalLoss: null,
    lines: [
      { icon: '🌾', label: 'Yield', labelHi: 'पैदावार', value: '+40%' },
      { icon: '💧', label: 'Soil Health', labelHi: 'मिट्टी', value: '✅' },
      { icon: '💰', label: 'Income', labelHi: 'आय', value: '+₹25k' },
    ],
  },
  bad: {
    title: '⚠️ Mitti kamzor ho gayi',
    titleHi: '⚠️ मिट्टी कमजोर हो गई',
    subtitle: 'Zyada urea ne mitti ko kamzor kar diya',
    subtitleHi: 'ज्यादा यूरिया ने मिट्टी को नुकसान पहुँचाया।',
    arthaChange: -20,
    color: 'red',
    mapTint: 'rgba(239,68,68,0.15)',
    totalLoss: '₹10,000',
    lines: [
      { icon: '🌾', label: 'Crop Loss', labelHi: 'फसल नुकसान', value: '−40%' },
      { icon: '💧', label: 'Soil Damage', labelHi: 'मिट्टी क्षति', value: 'High' },
      { icon: '💰', label: 'Future Loss', labelHi: 'भविष्य नुकसान', value: '₹10k' },
    ],
  },
};

// ── FLOATING EVENT CARD ───────────────────────────────────────────
function FloatingEventCard({ onDismiss, language }) {
  const isHi = language === 'hi';
  return (
    <div className="absolute top-14 left-2 right-2 z-[3000] animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 flex items-center gap-2">
          <span className="text-xl">🌾</span>
          <div>
            <p className="text-white font-black text-[10px] uppercase tracking-wider">
              {isHi ? 'सीजन शुरू!' : 'Season Started!'}
            </p>
            <p className="text-amber-100 text-[9px] font-bold">
              {isHi ? 'अपनी फसल की तैयारी करें' : 'Prepare your crops'}
            </p>
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-sm flex-shrink-0">👴</div>
            <div className="bg-amber-50 rounded-xl rounded-tl-sm px-2.5 py-1.5 flex-1">
              <p className="text-amber-900 font-bold text-[10px] italic leading-tight">
                {isHi 
                  ? '"नया सीजन शुरू हो गया है... बीज की दुकान पर जाएं और सही बीज चुनें।"'
                  : '"New season started... Go to Seed Shop and pick your seeds."'}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-full py-2 bg-amber-500 text-white rounded-xl font-black text-[10px] active:scale-95 transition-all uppercase tracking-widest"
          >
            {isHi ? 'चलो चलें ➔' : 'Let\'s Go ➔'}
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
    <div className="absolute inset-x-3 bottom-24 z-[4000] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100">
        <div className="bg-green-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <div>
              <p className="text-white font-black text-xs">Seed Shop</p>
              <p className="text-green-200 text-[10px]">Apne beej chuniye</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 text-base w-6 h-6 flex items-center justify-center">✕</button>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <button onClick={() => onPick('basic')}
            className="w-full p-3 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center gap-3 active:scale-95 transition-all">
            <span className="text-2xl">🌿</span>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-800 text-xs">Basic Seeds</p>
              <p className="text-slate-500 text-[10px]">Saamanya beej</p>
            </div>
            <span className="font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-lg text-[10px]">₹1,500</span>
          </button>
          <button onClick={() => onPick('hybrid')}
            className="w-full p-3 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center gap-3 active:scale-95 transition-all">
            <span className="text-2xl">🌱</span>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-800 text-xs">Hybrid Seeds</p>
              <p className="text-green-600 text-[10px] font-bold">Better yield, healthy soil</p>
            </div>
            <span className="font-black text-green-700 bg-green-100 px-2 py-1 rounded-lg text-[10px]">₹2,500</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FERTILIZER PICKER ─────────────────────────────────────────────
function FertilizerPicker({ onPick, onClose, language }) {
  const isHi = language === 'hi';
  return (
    <div className="absolute inset-x-2 bottom-32 z-[4000] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
        <div className="bg-blue-700 px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧪</span>
            <div>
              <p className="text-white font-black text-[10px] uppercase tracking-tight">
                {isHi ? 'खाद की दुकान (Fertilizers)' : 'Fertilizer Shop'}
              </p>
              <p className="text-blue-200 text-[9px] font-bold">{isHi ? 'सही खाद चुनें' : 'Choose Fertilizer'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 text-sm p-1">✕</button>
        </div>
        <div className="p-2.5 flex flex-col gap-2">
          <button onClick={() => onPick('urea')}
            className="w-full p-2.5 bg-red-50 border-2 border-red-100 rounded-xl flex items-center gap-2.5 active:scale-95 transition-all">
            <span className="text-2xl">💊</span>
            <div className="flex-1 text-left min-w-0">
              <p className="font-black text-slate-800 text-[11px]">
                {isHi ? 'सस्ती यूरिया' : 'Cheap Urea'}
              </p>
              <p className="text-red-600 text-[9px] font-bold leading-tight truncate">
                {isHi ? 'मिट्टी को नुकसान होगा' : 'Harmful for soil'}
              </p>
            </div>
            <span className="font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-lg text-[10px]">₹800</span>
          </button>
          <button onClick={() => onPick('balanced')}
            className="w-full p-2.5 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-2.5 active:scale-95 transition-all">
            <span className="text-2xl">🌿</span>
            <div className="flex-1 text-left min-w-0">
              <p className="font-black text-slate-800 text-[11px]">
                {isHi ? 'संतुलित खाद' : 'Balanced Fertilizer'}
              </p>
              <p className="text-green-600 text-[9px] font-bold leading-tight truncate">
                {isHi ? 'मिट्टी रहे स्वस्थ' : 'Long-term health'}
              </p>
            </div>
            <span className="font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-lg text-[10px]">₹1,800</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TIME PASSING OVERLAY ──────────────────────────────────────────
function TimePassingOverlay({ stage, language }) {
  const isHi = language === 'hi';
  const stages = {
    week2:   { label: isHi ? 'सप्ताह 2' : 'Week 2',   emoji: '🌱', step: 0 },
    month1:  { label: isHi ? 'महिना 1' : 'Month 1',  emoji: '🌿', step: 1 },
    harvest: { label: isHi ? 'कटाई!' : 'Harvest!', emoji: '🌾', step: 2 },
  };
  const s = stages[stage] || stages.week2;
  return (
    <div className="absolute inset-0 z-[5000] bg-amber-950/95 flex flex-col items-center justify-center gap-6 px-8">
      <p className="text-amber-400 font-black uppercase tracking-widest text-[10px]">
        {isHi ? 'समय बीत रहा है' : 'Time Passing'}
      </p>
      <div className="text-8xl animate-bounce">{s.emoji}</div>
      <h1 className="text-5xl font-black text-white italic tracking-tighter">{s.label}</h1>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-700 ${i <= s.step ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
}

// ── OUTCOME CARD ─────────────────────────────────────────────────
function OutcomeCard({ outcome, onDone, onWantExplanation, language }) {
  const isHi = language === 'hi';
  const isGood = outcome.color === 'green';
  return (
    <div className="absolute inset-x-2 top-10 z-[4000] animate-in zoom-in-95 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        <div className={`px-4 py-3 shrink-0 ${isGood ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-orange-700'}`}>
          <h2 className="text-white font-black text-base">{isHi ? outcome.titleHi : outcome.title}</h2>
          <p className="text-white/80 font-bold text-[10px] leading-tight mt-0.5">{isHi ? outcome.subtitleHi : outcome.subtitle}</p>
        </div>
        
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {outcome.totalLoss && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-500 font-black text-[9px] uppercase tracking-widest">
                {isHi ? 'नुकसान: ' : 'Loss: '}{outcome.totalLoss}
              </span>
              <div className="h-px flex-1 bg-red-100" />
            </div>
          )}
          {outcome.lines.map((l, i) => (
            <div key={i} className={`flex items-center gap-2.5 p-2 rounded-xl border ${isGood ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
              <span className="text-lg">{l.icon}</span>
              <span className="flex-1 font-bold text-slate-700 text-[11px]">{isHi ? l.labelHi : l.label}</span>
              <span className={`font-black text-[11px] ${isGood ? 'text-green-700' : 'text-red-700'}`}>{l.value}</span>
            </div>
          ))}

          <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2.5">
            <span className="text-lg shrink-0">👴</span>
            <p className="text-amber-800 font-bold italic text-[10px] leading-tight">
              {isHi 
                ? '"ज़मीन का ख्याल रखोगे, तो वह भी तुम्हारा ख्याल रखेगी। सही बीज ही सही निवेश है।"'
                : '"Take care of the land, and it will take care of you. Right seeds are the right investment."'}
            </p>
          </div>
        </div>

        <div className="p-3 bg-white border-t border-slate-50 flex flex-col gap-1.5 shrink-0">
          <button onClick={onWantExplanation}
            className="w-full py-2 bg-slate-100 text-slate-800 rounded-xl font-black text-[10px] active:scale-95 transition-all uppercase tracking-tight">
            {isHi ? 'विस्तार से समझें 💡' : 'Need details? 💡'}
          </button>
          <button onClick={onDone}
            className={`w-full py-3 text-white rounded-xl font-black text-xs active:scale-95 transition-all shadow-md ${isGood ? 'bg-green-600 shadow-green-100' : 'bg-amber-600 shadow-amber-100'}`}>
            {isHi ? 'आगे बढ़ें ➔' : 'Proceed ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MINI EXPLANATION ──────────────────────────────────────────────
function ExplainCard({ isGood, onClose, language }) {
  const isHi = language === 'hi';
  return (
    <div className="absolute inset-x-2 bottom-32 z-[5500] animate-in slide-in-from-bottom-6 fade-in duration-300">
      <div className="bg-slate-900 rounded-2xl p-4 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber-400 font-black text-[10px] uppercase tracking-widest">
            {isHi ? 'अर्था चाचा' : 'Artha Chacha'}
          </span>
          <button onClick={onClose} className="text-white/40 text-sm p-1">✕</button>
        </div>
        <p className="text-white font-bold text-[11px] leading-tight">
          {isGood
            ? (isHi 
                ? '🌱 हाइब्रिड बीज महंगे हैं पर इनसे मिट्टी और फसल दोनों बेहतर होते हैं। सही निवेश बार-बार लाभ देता है!'
                : '🌱 Hybrid seeds cost more but grow stronger. Better yield, better soil. Right investment pays back!')
            : (isHi
                ? '⚠️ सस्ती यूरिया पहले साल तो ठीक लगती है, पर दूसरे साल पैदावार 40% गिरा देती है। सस्ता आज, महंगा कल।'
                : '⚠️ Cheap urea ruins soil fertility. Year 1 looks okay, but Year 2 yield drops by 40%. Cheap today, costly tomorrow.')}
        </p>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────
export default function SeedTrapScenario({ language = 'hi', onComplete, onShowInsight, onHighlightsChange, onMapTintChange, onRegisterTapHandler }) {
  const [stage, setStage] = useState('intro');
  const [timeStage, setTimeStage] = useState('week2');
  const [showPicker, setShowPicker] = useState(false);
  const [seedType, setSeedType] = useState(null);
  const [outcome, setOutcome] = useState(null);

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
      {stage === 'intro' && <FloatingEventCard language={language} onDismiss={() => setStage('seed')} />}

      {/* Hint strips (only when picker is closed) */}
      {stage === 'seed' && !showPicker && (
        <BottomHint 
          icon="🏪" 
          text={language === 'hi' 
            ? "बीज की दुकान पर टैप करें — बीज चुनें।" 
            : "Tap the glowing Seed Shop to pick seeds."} 
        />
      )}
      {stage === 'fertilizer' && !showPicker && (
        <BottomHint 
          icon="🧪" 
          text={language === 'hi' 
            ? "खाद की दुकान पर टैप करें — खाद चुनें।" 
            : "Tap the glowing Fertilizer shop to pick fertilizers."} 
        />
      )}

      {/* Pickers — only appear after user taps the pin */}
      {stage === 'seed' && showPicker && (
        <SeedShopPicker language={language} onPick={handleSeedPick} onClose={() => setShowPicker(false)} />
      )}
      {stage === 'fertilizer' && showPicker && (
        <FertilizerPicker language={language} onPick={handleFertilizerPick} onClose={() => setShowPicker(false)} />
      )}

      {/* Time passing */}
      {stage === 'time_passing' && <TimePassingOverlay stage={timeStage} />}

      {/* Outcome card */}
      {stage === 'outcome' && outcome && (
        <OutcomeCard
          language={language}
          outcome={outcome}
          onDone={onComplete}
          onWantExplanation={() => onShowInsight?.(outcome)}
        />
      )}
    </>
  );
}
