import React, { useEffect } from 'react';
import { useGameState } from './GuidedGameController';

// ─── RURAL ASSET DICTIONARY (sorted descending) ───────────────────────────
const ASSETS = [
  { cost: 15000, name: 'सोलर पंप',          nameEn: 'Solar Water Pump',  icon: '💧' },
  { cost: 5000,  name: 'बच्चों की स्कूल फीस', nameEn: 'School Fees (1yr)',  icon: '🏫' },
  { cost: 2000,  name: 'अच्छी खाद',           nameEn: 'Quality Fertilizer', icon: '🌱' },
  { cost: 500,   name: 'महीने का राशन',        nameEn: '1-Month Ration',     icon: '🌾' },
];

// ─── GREEDY ASSET MATCHER ─────────────────────────────────────────────────
// Returns an array of { asset, count } pairs that sum as close to wastedMoney as possible.
function matchAssets(amount) {
  let remaining = amount;
  const result = [];
  for (const asset of ASSETS) {
    if (remaining >= asset.cost) {
      const count = Math.floor(remaining / asset.cost);
      result.push({ asset, count });
      remaining -= count * asset.cost;
    }
  }
  return result;
}

// ─── TTS ─────────────────────────────────────────────────────────────────
function speak() {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(
    'पैसे सिर्फ नंबर नहीं होते, बेटा। ये तुम्हारे परिवार का भविष्य हैं।'
  );
  utterance.lang = 'hi-IN';
  utterance.rate = 0.85;
  utterance.pitch = 0.9;
  window.speechSynthesis.cancel();
  setTimeout(() => window.speechSynthesis.speak(utterance), 600);
}

// ═══════════════════════════════════════════════════════════════════════════
export default function OpportunityCost() {
  const { wallet, debt, wastedMoney, resetGame } = useGameState();

  useEffect(() => { speak(); }, []);

  const matched = matchAssets(wastedMoney);
  const finalProfit = Math.max(0, wallet - debt);

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-950 overflow-y-auto"
         style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── RED HEADER ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-gradient-to-br from-red-950 via-red-900 to-slate-900 px-6 pt-12 pb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500 to-transparent" />
        <div className="relative z-10">
          <div className="w-16 h-16 bg-red-500/20 border-2 border-red-400/40 rounded-[20px] flex items-center justify-center text-3xl mx-auto mb-4">
            💀
          </div>
          <h1 className="text-xl font-black text-white leading-tight mb-3 tracking-tight">
            आपकी गलतियों की कीमत
            <span className="block text-sm font-semibold text-red-300 mt-1">The Cost of Your Mistakes</span>
          </h1>
          {wastedMoney > 0 ? (
            <div className="inline-block bg-red-500/20 border border-red-400/30 rounded-2xl px-5 py-3">
              <p className="text-red-300 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                आपने खराब फैसलों में गँवाए
              </p>
              <p className="text-red-400 font-black text-4xl tabular-nums">
                -₹{wastedMoney.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="inline-block bg-green-500/20 border border-green-400/30 rounded-2xl px-5 py-3">
              <p className="text-green-300 font-black text-lg">🏆 कोई गलती नहीं! Perfect!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── WHAT YOU COULD HAVE BOUGHT ──────────────────────────────────── */}
      {wastedMoney > 0 && (
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-center">
            इस पैसे से आप खरीद सकते थे →
          </p>
          <div className="flex flex-col gap-3">
            {matched.map(({ asset, count }, idx) => (
              <div key={idx} className="bg-slate-900 border border-white/5 rounded-[24px] p-4 flex items-center gap-4">
                {/* Big icon */}
                <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  {asset.icon}
                </div>
                {/* Details */}
                <div className="flex-1">
                  <p className="text-green-300 font-black text-base leading-tight">{asset.name}</p>
                  <p className="text-slate-500 text-[11px] font-semibold">{asset.nameEn}</p>
                  <p className="text-slate-400 text-xs mt-0.5">₹{asset.cost.toLocaleString()} प्रति यूनिट</p>
                </div>
                {/* Count badge */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-center flex-shrink-0">
                  <p className="text-green-400 font-black text-2xl">{count}×</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── YOUR FINANCIAL RESULT ───────────────────────────────────────── */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="bg-slate-900 border border-white/5 rounded-[24px] p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">इस साल का शुद्ध मुनाफा</p>
            <p className={`font-black text-2xl tabular-nums ${finalProfit > 0 ? 'text-white' : 'text-red-400'}`}>
              ₹{finalProfit.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">कुल कर्ज़</p>
            <p className={`font-black text-2xl tabular-nums ${debt > 0 ? 'text-red-400' : 'text-green-400'}`}>
              ₹{debt.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ── ARTHA CHACHA WISDOM ─────────────────────────────────────────── */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="bg-slate-900/70 border border-white/5 rounded-[24px] p-4 flex gap-3 items-start">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">👴</div>
          <div>
            <p className="text-white/30 font-black text-[8px] uppercase tracking-widest mb-1">अर्था चाचा</p>
            <p className="text-slate-300 text-sm font-semibold italic leading-relaxed">
              "पैसे सिर्फ नंबर नहीं होते, बेटा।
              ये तुम्हारे परिवार का भविष्य हैं।"
            </p>
          </div>
        </div>
      </div>

      {/* ── REPLAY BUTTON ──────────────────────────────────────────────── */}
      <div className="px-4 pb-10 flex-shrink-0">
        <button
          onClick={resetGame}
          className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 active:scale-[0.97] transition-all text-slate-900 font-black rounded-[20px] text-base uppercase tracking-widest shadow-[0_10px_40px_rgba(34,197,94,0.4)] flex items-center justify-center gap-3"
        >
          <span className="text-xl">🌱</span>
          फिर से खेलें — Play Again
        </button>
      </div>
    </div>
  );
}
 
 
