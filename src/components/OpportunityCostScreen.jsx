import React, { useEffect, useMemo } from 'react';
import { useFinancials } from '../context/FinancialContext.jsx';
import ASSETS from '../data/OpportunityAssets.json';

// ── Mistake metadata ──────────────────────────────────────────────────────
const MISTAKE_META = {
  sahukarInterest: {
    labelHi: 'साहूकार का ब्याज',
    labelEn: 'Moneylender Interest',
    contextHi: 'इस पैसे से आप खरीद सकते थे',
    contextEn: 'With this money you could have bought',
    icon: '💸',
    color: 'from-red-900 to-red-700',
  },
  uninsuredCropLoss: {
    labelHi: 'बिना बीमे के फसल का नुकसान',
    labelEn: 'Uninsured Crop Loss',
    contextHi: 'इस पैसे से आप खरीद सकते थे',
    contextEn: 'With this money you could have bought',
    icon: '🌧️',
    color: 'from-orange-900 to-orange-700',
  },
  medicalOutOfPocket: {
    labelHi: 'अस्पताल का नकद खर्च',
    labelEn: 'Out-of-Pocket Medical Bill',
    contextHi: 'बिना आयुष्मान कार्ड के आपने खो दिया',
    contextEn: 'Without Ayushman Bharat, you lost',
    icon: '🏥',
    color: 'from-rose-900 to-rose-700',
  },
  distressSellLoss: {
    labelHi: 'संकट बिक्री से नुकसान',
    labelEn: 'Distress Selling Loss',
    contextHi: 'इस पैसे से आप खरीद सकते थे',
    contextEn: 'With this money you could have bought',
    icon: '📉',
    color: 'from-amber-900 to-amber-700',
  },
  fertilizerWaste: {
    labelHi: 'अनावश्यक खाद बर्बादी',
    labelEn: 'Excessive Fertilizer Waste',
    contextHi: 'इस पैसे से आप खरीद सकते थे',
    contextEn: 'With this money you could have bought',
    icon: '☠️',
    color: 'from-yellow-900 to-yellow-700',
  },
};

// ── Find the best asset the user could have afforded ──────────────────────
function getBestAsset(amount) {
  const sorted = [...ASSETS].sort((a, b) => b.costThreshold - a.costThreshold);
  return sorted.find(a => a.costThreshold <= amount) || null;
}

// ── TTS Audio Cue ─────────────────────────────────────────────────────────
function speakEpiphany(language) {
  if (!window.speechSynthesis) return;
  const msg = language === 'hi'
    ? 'पैसे सिर्फ नंबर नहीं होते, बेटा। ये तुम्हारे परिवार का भविष्य हैं।'
    : 'Money is not just numbers, son. It is your family\'s future.';
  
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(msg);
  utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
  
  // Try to find a local voice
  const voices = synth.getVoices();
  const localIn = voices.find(v => v.localService && (v.lang.includes('hi') || v.lang.includes('IN')));
  if (localIn) utterance.voice = localIn;

  utterance.rate = 0.85;
  utterance.pitch = 0.9;
  synth.cancel();
  setTimeout(() => synth.speak(utterance), 800);
}

// ═══════════════════════════════════════════════════════════════════════════
export default function OpportunityCostScreen({ language = 'hi', onReset }) {
  const { mistakeTracker } = useFinancials();

  // Trigger Artha Chacha voice on mount
  useEffect(() => {
    speakEpiphany(language);
    return () => window.speechSynthesis?.cancel();
  }, [language]);

  const isHi = language === 'hi';

  // Filter only mistakes with a real loss
  const triggeredMistakes = useMemo(() => {
    return Object.entries(mistakeTracker).filter(([, val]) => val > 0);
  }, [mistakeTracker]);

  const totalLoss = useMemo(() => {
    return triggeredMistakes.reduce((sum, [, val]) => sum + val, 0);
  }, [triggeredMistakes]);

  const topAsset = getBestAsset(totalLoss);

  return (
    <div className="absolute inset-0 z-[5000] bg-slate-950 flex flex-col overflow-y-auto"
         style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-slate-950 px-6 pt-14 pb-10 text-center flex-shrink-0">
        {/* Ambient glow */}
        <div className="absolute inset-0 opacity-20"
             style={{ background: 'radial-gradient(ellipse at center, #ef4444 0%, transparent 70%)' }} />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-500/20 border-2 border-red-500/40 rounded-[28px] flex items-center justify-center text-4xl mx-auto mb-5 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
            💀
          </div>
          <h1 className="text-[22px] font-black text-white leading-tight tracking-tight mb-3">
            {isHi
              ? 'इस साल आपकी गलतियों की क्या कीमत रही?'
              : 'What did your mistakes cost you this year?'}
          </h1>
          {totalLoss > 0 && (
            <div className="inline-block bg-red-500/20 border border-red-500/40 rounded-2xl px-5 py-2 mt-2">
              <span className="text-red-300 font-black text-[11px] uppercase tracking-[0.2em]">
                {isHi ? 'कुल नुकसान' : 'Total Lost'}
              </span>
              <div className="text-red-400 font-black text-3xl tabular-nums mt-0.5">
                -₹{totalLoss.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MISTAKE CARDS ──────────────────────────────────────────────── */}
      <div className="px-4 py-6 flex flex-col gap-4 flex-1">
        {triggeredMistakes.length === 0 ? (
          // Perfect score - no mistakes
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-black text-green-400 mb-2">
              {isHi ? 'शाबाश! कोई गलती नहीं!' : 'Perfect! Zero Mistakes!'}
            </h2>
            <p className="text-slate-400 font-semibold text-sm">
              {isHi
                ? 'आपने इस साल बहुत समझदारी से निर्णय लिए।'
                : 'You made wise financial decisions all year.'}
            </p>
          </div>
        ) : (
          triggeredMistakes.map(([key, value], idx) => {
            const meta = MISTAKE_META[key];
            if (!meta) return null;
            const asset = getBestAsset(value);

            return (
              <div
                key={key}
                className="rounded-[28px] overflow-hidden border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-8"
                style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'backwards' }}
              >
                {/* Top — the loss (dark red) */}
                <div className={`bg-gradient-to-br ${meta.color} p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{meta.icon}</span>
                    <div>
                      <p className="text-white/60 font-black text-[9px] uppercase tracking-[0.2em]">
                        {isHi ? 'गलती' : 'MISTAKE'}
                      </p>
                      <h3 className="text-white font-black text-base leading-tight">
                        {isHi ? meta.labelHi : meta.labelEn}
                      </h3>
                    </div>
                  </div>
                  <div className="text-red-300 font-black text-[28px] tabular-nums">
                    -₹{value.toLocaleString()}
                  </div>
                </div>

                {/* Bottom — the opportunity (bright green) */}
                {asset && (
                  <div className="bg-slate-900 p-5 border-t-2 border-green-500/20 flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                      {asset.icon}
                    </div>
                    <div>
                      <p className="text-green-400/70 font-black text-[9px] uppercase tracking-[0.2em] mb-1">
                        {isHi ? meta.contextHi : meta.contextEn}
                      </p>
                      <p className="text-green-300 font-black text-base leading-snug">
                        {isHi ? asset.name : asset.nameEn}
                      </p>
                      <p className="text-slate-500 font-bold text-[11px] mt-0.5">
                        ≤ ₹{asset.costThreshold.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* ── TOTAL COULD-HAVE-BOUGHT ─────────────────────────────────── */}
        {topAsset && totalLoss > 0 && (
          <div className="mt-2 rounded-[28px] bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 p-5 flex items-center gap-4 shadow-[0_0_60px_rgba(99,102,241,0.15)]">
            <div className="text-5xl flex-shrink-0">{topAsset.icon}</div>
            <div>
              <p className="text-indigo-300/60 font-black text-[9px] uppercase tracking-[0.2em] mb-1">
                {isHi ? 'कुल नुकसान से आप खरीद सकते थे' : 'With your total loss you could have bought'}
              </p>
              <p className="text-indigo-200 font-black text-lg leading-snug">
                {isHi ? topAsset.name : topAsset.nameEn}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── ARTHA CHACHA QUOTE ─────────────────────────────────────────── */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="bg-slate-900/80 border border-white/5 rounded-[24px] p-5 flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            👴
          </div>
          <div>
            <p className="text-white/40 font-black text-[9px] uppercase tracking-widest mb-1">Artha Chacha</p>
            <p className="text-slate-300 font-semibold text-sm leading-relaxed italic">
              {isHi
                ? '"पैसे सिर्फ नंबर नहीं होते, बेटा। ये तुम्हारे परिवार का भविष्य हैं।"'
                : '"Money is not just numbers, son. It is your family\'s future."'}
            </p>
          </div>
        </div>
      </div>

      {/* ── RESET BUTTON ───────────────────────────────────────────────── */}
      <div className="px-4 pb-8 flex-shrink-0">
        <button
          onClick={onReset}
          className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 active:scale-[0.98] transition-all text-slate-900 font-black rounded-[20px] text-base uppercase tracking-widest shadow-[0_10px_40px_rgba(34,197,94,0.4)] flex items-center justify-center gap-3"
        >
          <span className="text-xl">🌱</span>
          {isHi ? 'अगले साल समझदारी से खेलें' : 'Play Next Year With Wisdom'}
        </button>
      </div>
    </div>
  );
}
 
 
