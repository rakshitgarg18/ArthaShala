import React, { useState } from 'react';
import YojanaConnect from './YojanaConnect';

/**
 * InsightScreen — "Samajh Aaya?" 
 * Full screen that visually explains what happened and what should have been done.
 * Handles both "Seed Trap" and "Loan Trap" modules.
 */
export default function InsightScreen({ outcome, onDone }) {
  const [showYojana, setShowYojana] = useState(false);
  const isLoanTrap = outcome?.moduleId === 'loan_trap';
  const isBad = outcome?.color === 'red';
  const isGood = outcome?.color === 'green';

  // ── SEED TRAP DATA ──────────────────────────────────────────
  const seedTrapData = {
    user: isBad
      ? { icon: '💊', label: 'आपका फैसला', name: 'ज़्यादा यूरिया', result: 'मिट्टी कमज़ोर हुई', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-500', text: 'text-red-700', emoji: '⚠️' }
      : { icon: '🌱', label: 'आपका फैसला', name: 'संतुलित खाद', result: 'मिट्टी मजबूत रही!', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500', text: 'text-green-700', emoji: '✅' },
    better: isBad
      ? { icon: '🌿', label: 'बेहतर तरीका', name: 'संतुलित खाद', result: 'मिट्टी मजबूत रहेगी', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500', text: 'text-green-700' }
      : { icon: '🏆', label: 'सही फैसला!', name: 'हाइब्रिड + संतुलित', result: 'हर सीजन मजबूत फसल', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', text: 'text-emerald-700' },
    explanation: isBad
      ? ['ज़्यादा यूरिया मिट्टी की ताकत कम कर देता है।', 'इससे आने वाली फसल पर बुरा असर पड़ता है।']
      : ['हाइब्रिड बीज और संतुलित खाद — यही सही जोड़ है।', 'मिट्टी भी ठीक, फसल भी अच्छी, आय भी ज़्यादा।'],
    arthaChacha: isBad
      ? '"जल्दी फायदा देखना आसान है... पर ज़मीन को समझना ज़रूरी है।"'
      : '"जो धीरे बोया, वह गहरे उगता है। तू सही रास्ते पर है।"',
    flow: isBad 
      ? ['सस्ता यूरिया', 'तेज़ बढ़त', 'मिट्टी क्षति', 'नुकसान']
      : ['हाइब्रिड बीज', 'मजबूत जड़ें', 'स्वस्थ मिट्टी', 'बंपर पैदावार']
  };

  // ── LOAN TRAP DATA ──────────────────────────────────────────
  const loanTrapData = {
    user: isBad
      ? { icon: '💰', label: 'आपका फैसला', name: 'साहूकार कर्ज', result: 'कर्ज जाल (₹8,000)', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-500', text: 'text-red-700', emoji: '⚠️' }
      : isGood 
        ? { icon: '🏛️', label: 'आपका फैसला', name: 'सरकारी योजना', result: '₹5,000 बचाए!', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500', text: 'text-green-700', emoji: '✅' }
        : { icon: '🏦', label: 'आपका फैसला', name: 'बैंक लोन', result: 'सस्ता ब्याज (₹5,200)', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-500', text: 'text-amber-700', emoji: '📊' },
    better: isGood
      ? { icon: '🏆', label: 'सही फैसला!', name: 'सरकारी योजना', result: 'योजना का लाभ!', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', text: 'text-emerald-700' }
      : { icon: '🏛️', label: 'बेहतर तरीका', name: 'पंचायत / बैंक', result: 'सुरक्षित और सस्ता', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500', text: 'text-green-700' },
    explanation: isBad
      ? ['साहूकार का ब्याज बहुत ज़्यादा होता है।', '₹5,000 का कर्ज़ ₹8,000 बन जाता है।']
      : isGood
        ? ['आयुष्मान भारत से मुफ़्त इलाज मिलता है।', 'कर्ज़ लेने की ज़रूरत ही नहीं पड़ी!']
        : ['बैंक से कर्ज़ लेना साहूकार से सस्ता है।', 'ब्याज दर कम होने से बोझ कम होता है।'],
    arthaChacha: isBad
      ? '"कर्ज़ लेना आसान है, पर उसे चुकाना नहीं। हमेशा सही जगह चुनिए।"'
      : '"सरकारी योजनाएं हमारे लिए ही हैं। उनका उपयोग करना ही असली समझदारी है।"',
    flow: isBad 
      ? ['इमरजेंसी', 'साहूकार', 'ऊँचा ब्याज', 'कर्ज जाल']
      : ['इमरजेंसी', 'पंचायत', 'सरकारी योजना', 'पैसे बचे!']
  };

  const data = isLoanTrap ? loanTrapData : seedTrapData;

  return (
    <div className="h-full w-full flex flex-col bg-white font-sans overflow-hidden">
      {/* Top Bar - Compact */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-8 pb-3 bg-white border-b border-slate-100">
        <button onClick={onDone} className="flex items-center gap-1.5 text-slate-500 font-black text-xs active:scale-95 transition-all">
          <span className="text-base">←</span> 
        </button>
        <div className="text-center">
          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Insight Mode</p>
          <h1 className="font-black text-base text-slate-900 leading-tight">क्या समझ आया? 💡</h1>
        </div>
        <div className="w-8" />
      </div>

      {/* Scrollable content - Tighter */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 custom-scrollbar">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center mb-2.5">तुलना (Comparison)</p>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Left Card */}
            <div className={`rounded-2xl border p-3 flex flex-col items-center gap-1.5 ${data.user.bg} ${data.user.border}`}>
              <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg text-white ${data.user.badge}`}>
                {data.user.label}
              </span>
              <span className="text-4xl mt-0.5">{data.user.icon}</span>
              <p className={`font-black text-[11px] text-center leading-tight ${data.user.text}`}>{data.user.name}</p>
              <div className="flex items-center gap-1">
                <span className="text-base">{data.user.emoji}</span>
                <p className="text-slate-600 font-bold text-[9px] text-center leading-tight">{data.user.result}</p>
              </div>
            </div>

            {/* Right Card */}
            <div className={`rounded-2xl border p-3 flex flex-col items-center gap-1.5 ${data.better.bg} ${data.better.border}`}>
              <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg text-white ${data.better.badge}`}>
                {data.better.label}
              </span>
              <span className="text-4xl mt-0.5">{data.better.icon}</span>
              <p className={`font-black text-[11px] text-center leading-tight ${data.better.text}`}>{data.better.name}</p>
              <div className="flex items-center gap-1">
                <span className="text-base">✅</span>
                <p className="text-slate-600 font-bold text-[9px] text-center leading-tight">{data.better.result}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5">ऐसा क्यों हुआ?</p>
          {data.explanation.map((line, i) => (
            <div key={i} className="flex items-start gap-2.5 mb-1.5 last:mb-0">
              <span className="text-indigo-500 font-black text-xs flex-shrink-0">{i + 1}.</span>
              <p className="text-slate-700 font-bold text-[11px] leading-tight">{line}</p>
            </div>
          ))}
        </div>

        {/* Artha Chacha */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-xl flex-shrink-0 border-2 border-amber-300">👴</div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-amber-500 mb-1">अर्था चाचा</p>
            <p className="text-amber-900 font-bold italic text-[11px] leading-tight">{data.arthaChacha}</p>
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-3">यात्रा (The Journey)</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.flow.map((s, i) => (
                <span key={i} className={`px-2 py-1 rounded-lg text-[9px] font-black ${i === 0 ? 'bg-amber-500 text-white' : i === 3 ? (isBad ? 'bg-red-500 text-white' : 'bg-green-500 text-white') : 'bg-white/10 text-white/70'}`}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex-shrink-0 px-4 py-4 bg-white border-t border-slate-100 flex flex-col gap-2.5">
        {isLoanTrap && isGood && (
          <button 
            onClick={() => setShowYojana(true)}
            className="w-full py-3 bg-emerald-50 border border-emerald-500 text-emerald-700 rounded-xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            👉 असल ज़िंदगी में आवेदन करें
          </button>
        )}
        <button onClick={onDone}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest">
          समझ गया — आगे बढ़ें
        </button>
      </div>

      {showYojana && <YojanaConnect onClose={() => setShowYojana(false)} />}
    </div>
  );
}
