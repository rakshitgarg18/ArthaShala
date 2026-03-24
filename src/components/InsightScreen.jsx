import React from 'react';

/**
 * InsightScreen — "Samajh Aaya?" 
 * Full screen that visually explains what happened and what should have been done.
 * Opens when user clicks "Samajhna chahte ho?" from the outcome card.
 */
export default function InsightScreen({ outcome, onDone }) {
  const isBad = outcome?.color === 'red';

  const userChoice = isBad
    ? { icon: '💊', label: 'Aapka Faisla', name: 'Excess Urea', result: 'Mitti kamzor ho gayi', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-500', text: 'text-red-700', emoji: '⚠️' }
    : { icon: '🌱', label: 'Aapka Faisla', name: 'Balanced Fertilizer', result: 'Mitti mazboot rahi!', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500', text: 'text-green-700', emoji: '✅' };

  const betterChoice = isBad
    ? { icon: '🌿', label: 'Behtar Tarika', name: 'Balanced Fertilizer', result: 'Mitti mazboot rahegi', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500', text: 'text-green-700' }
    : { icon: '🏆', label: 'Sahi Faisla!', name: 'Hybrid + Balanced', result: 'Har season strong fasal', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', text: 'text-emerald-700' };

  const explanation = isBad
    ? [
        'Zyada urea mitti ki taakat kam kar deta hai.',
        'Isse aane wali fasal par bura asar padta hai.',
      ]
    : [
        'Hybrid beej aur balanced khaad — yahi sahi combo hai.',
        'Mitti bhi theek, fasal bhi achhi, income bhi zyada.',
      ];

  const arthaChacha = isBad
    ? '"Jaldi faida dekhna asaan hai… par zameen ko samajhna zaroori hai."'
    : '"Jo dheere boya, woh gehre ugta hai. Tu sahi raste par hai."';

  return (
    <div className="h-full w-full flex flex-col bg-white font-sans overflow-hidden">

      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-4 bg-white border-b border-slate-100">
        <button onClick={onDone} className="flex items-center gap-2 text-slate-500 font-black text-sm active:scale-95 transition-all">
          <span className="text-lg">←</span> Wapas
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Insight Mode</p>
          <h1 className="font-black text-lg text-slate-900 leading-tight">Samajh Aaya? 💡</h1>
        </div>
        <div className="w-14" /> {/* spacer */}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">

        {/* === VISUAL COMPARISON (most important) === */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center mb-3">Kya hua vs Kya hona chahiye tha</p>
          <div className="grid grid-cols-2 gap-3">

            {/* Left: User's choice */}
            <div className={`rounded-3xl border-2 p-4 flex flex-col items-center gap-2 ${userChoice.bg} ${userChoice.border}`}>
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-white ${userChoice.badge}`}>
                {userChoice.label}
              </span>
              <span className="text-5xl mt-1">{userChoice.icon}</span>
              <p className={`font-black text-sm text-center ${userChoice.text}`}>{userChoice.name}</p>
              <div className="flex items-center gap-1">
                <span className="text-lg">{userChoice.emoji}</span>
                <p className="text-slate-600 font-bold text-[11px] text-center leading-tight">{userChoice.result}</p>
              </div>
            </div>

            {/* Right: Better choice */}
            <div className={`rounded-3xl border-2 p-4 flex flex-col items-center gap-2 ${betterChoice.bg} ${betterChoice.border}`}>
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-white ${betterChoice.badge}`}>
                {betterChoice.label}
              </span>
              <span className="text-5xl mt-1">{betterChoice.icon}</span>
              <p className={`font-black text-sm text-center ${betterChoice.text}`}>{betterChoice.name}</p>
              <div className="flex items-center gap-1">
                <span className="text-lg">✅</span>
                <p className="text-slate-600 font-bold text-[11px] text-center leading-tight">{betterChoice.result}</p>
              </div>
            </div>
          </div>
        </div>

        {/* === SIMPLE EXPLANATION === */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">Kyun Hua Aisa?</p>
          {explanation.map((line, i) => (
            <div key={i} className="flex items-start gap-3 mb-2">
              <span className="text-indigo-400 font-black text-sm flex-shrink-0">{i + 1}.</span>
              <p className="text-slate-700 font-bold text-sm leading-relaxed">{line}</p>
            </div>
          ))}
        </div>

        {/* === ARTHA CHACHA === */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-2xl flex-shrink-0 border-2 border-amber-300">
            👴
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-2">Artha Chacha</p>
            <p className="text-amber-900 font-bold italic text-sm leading-relaxed">{arthaChacha}</p>
          </div>
        </div>

        {/* Visual flow diagram */}
        {isBad && (
          <div className="bg-slate-900 rounded-3xl p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Kyun Nuksaan Hota Hai</p>
            <div className="flex items-center gap-2 flex-wrap">
              {['Sasta Urea', '→ Jaldi Growth', '→ Mitti damage', '→ Agli season −40%'].map((s, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-xs font-black ${i === 0 ? 'bg-amber-500 text-white' : i === 3 ? 'bg-red-500 text-white' : 'bg-white/10 text-white/70'}`}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {!isBad && (
          <div className="bg-slate-900 rounded-3xl p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Kyun Faida Hota Hai</p>
            <div className="flex items-center gap-2 flex-wrap">
              {['Hybrid + Balanced', '→ Strong roots', '→ Healthy soil', '→ +40% every season'].map((s, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-xs font-black ${i === 0 ? 'bg-green-500 text-white' : i === 3 ? 'bg-emerald-400 text-white' : 'bg-white/10 text-white/70'}`}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="flex-shrink-0 px-5 py-5 bg-white border-t border-slate-100">
        <button
          onClick={onDone}
          className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-base shadow-lg shadow-indigo-200 active:scale-95 transition-all"
        >
          ✔ Samajh Gaya — Aage Bado
        </button>
      </div>
    </div>
  );
}
