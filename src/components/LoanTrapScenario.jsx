/**
 * LoanTrapScenario.jsx
 * 
 * Scenario: Medical Emergency. ₹5000 needed.
 * Locations: Sahukar (Instant/High Interest), Bank (Low Interest/Delay), Panchayat (Govt Schemes).
 */
import React, { useState, useEffect, useCallback } from 'react';

const OUTCOMES = {
  sahukar: {
    title: '⚠️ करज़ का बोझ (Debt Trap)',
    titleHi: '⚠️ करज़ का बोझ',
    subtitle: 'Sahukar se turant paise to mile, par... ',
    subtitleHi: 'साहूकार से तुरंत पैसे तो मिले, पर ब्याज बहुत ज्यादा है।',
    arthaChange: -25,
    color: 'red',
    mapTint: 'rgba(239,68,68,0.15)',
    totalLoss: '₹8,000',
    lines: [
      { icon: '💸', label: 'Principal', labelHi: 'मूल राशि', value: '₹5,000' },
      { icon: '📈', label: 'Interest', labelHi: 'ब्याज', value: '₹3,000' },
      { icon: '🚨', label: 'Debt Status', labelHi: 'स्थिति', value: 'Critical' },
    ],
  },
  bank: {
    title: '🏦 Sahi Karz (Safe Loan)',
    titleHi: '🏦 सही ऋण',
    subtitle: 'Bank se thoda deri hui, par karz kam hai.',
    subtitleHi: 'बैंक से थोड़ी देरी हुई, पर ब्याज बहुत कम है।',
    arthaChange: 5,
    color: 'yellow',
    mapTint: 'rgba(251,191,36,0.12)',
    totalLoss: '₹5,200',
    lines: [
      { icon: '💸', label: 'Principal', labelHi: 'मूल राशि', value: '₹5,000' },
      { icon: '📉', label: 'Interest', labelHi: 'ब्याज', value: '₹200' },
      { icon: '🛡️', label: 'Debt Status', labelHi: 'स्थिति', value: 'Safe' },
    ],
  },
  panchayat: {
    title: '🌟 Samajhdaari (Discovery)',
    titleHi: '🌟 समझदारी',
    subtitle: 'Govt Schemes se madad mili!',
    subtitleHi: 'सरकारी योजनाओं से पूरी मदद मिली!',
    arthaChange: 20,
    color: 'green',
    mapTint: 'rgba(34,197,94,0.15)',
    totalLoss: '₹0',
    lines: [
      { icon: '🛡️', label: 'Ayushman Bharat', labelHi: 'आयुष्मान भारत', value: 'Free' },
      { icon: '🌾', label: 'PM-Kisan', labelHi: 'पीएम-किसान', value: 'Enabled' },
      { icon: '💰', label: 'Savings', labelHi: 'बचत', value: '₹5,000' },
    ],
  },
};

// ── FLOATING EVENT CARD ───────────────────────────────────────────
function FloatingEventCard({ onDismiss, language }) {
  const isHi = language === 'hi';
  return (
    <div className="absolute top-14 left-2 right-2 z-[3000] animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-3 py-2 flex items-center gap-2">
          <span className="text-xl">🚨</span>
          <div>
            <p className="text-white font-black text-[10px] items-center flex uppercase tracking-wider">
              {isHi ? 'आपातकालीन समस्या!' : 'Medical Emergency!'}
            </p>
            <p className="text-red-100 text-[9px] font-bold">
              {isHi ? '₹5000 की सख्त जरूरत है' : '₹5000 urgently needed'}
            </p>
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-sm flex-shrink-0">👴</div>
            <div className="bg-red-50 rounded-xl rounded-tl-sm px-2.5 py-1.5 flex-1">
              <p className="text-red-900 font-bold text-[10px] italic leading-tight">
                {isHi 
                  ? '"बहू बीमार है, इलाज के लिए ₹5000 चाहिए। इंतजाम कैसे करें?"'
                  : '"Daughter-in-law is sick. We need ₹5000. How to manage?"'}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-full py-2 bg-red-600 text-white rounded-xl font-black text-[10px] active:scale-95 transition-all uppercase tracking-widest"
          >
            {isHi ? 'मदद खोजें ➔' : 'Find Help ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TOP INSTRUCTION HINT ──────────────────────────────────────────
function InstructionHint({ icon, text }) {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[3000] pointer-events-none animate-in slide-in-from-top-4 fade-in duration-500 w-[90%] max-w-sm">
      <div className="bg-slate-900/90 backdrop-blur-md border border-indigo-400/30 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl">
        <span className="text-xl animate-bounce">{icon}</span>
        <p className="text-white font-black text-[13px] leading-tight tracking-tight">{text}</p>
      </div>
    </div>
  );
}

// ── PICKER COMPONENTS ─────────────────────────────────────────────
function SahukarPicker({ onPick, onClose, language }) {
  const isHi = language === 'hi';
  return (
    <div className="absolute inset-x-2 bottom-32 z-[4000] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100">
        <div className="bg-red-700 px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div>
              <p className="text-white font-black text-[10px] uppercase tracking-tight">
                {isHi ? 'साहूकार (Moneylender)' : 'Moneylender'}
              </p>
              <p className="text-red-200 text-[9px] font-bold">{isHi ? 'तुरंत नकद' : 'Instant Cash'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 text-sm p-1">✕</button>
        </div>
        <div className="p-2.5">
          <button onClick={() => onPick('sahukar')}
            className="w-full p-2.5 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2.5 active:scale-95 transition-all text-left">
            <span className="text-2xl">😱</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-800 text-[11px] leading-tight flex items-center">
                {isHi ? '₹5,000 अभी लें' : 'Take ₹5,000 Now'}
              </p>
              <p className="text-red-600 text-[9px] font-black leading-tight mt-0.5 italic">
                {isHi ? 'कोई कागज़ नहीं, बस ब्याज ज्यादा!' : 'No papers, just high interest!'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function BankPicker({ onPick, onClose, language }) {
  const isHi = language === 'hi';
  return (
    <div className="absolute inset-x-2 bottom-32 z-[4000] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-100">
        <div className="bg-indigo-700 px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏦</span>
            <div>
              <p className="text-white font-black text-[10px] uppercase tracking-tight">
                {isHi ? 'बैंक ऋण (Bank Loan)' : 'Bank Loan'}
              </p>
              <p className="text-indigo-200 text-[9px] font-bold">{isHi ? 'सस्ता और सुरक्षित' : 'Safe & Low Interest'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 text-sm p-1">✕</button>
        </div>
        <div className="p-2.5">
          <button onClick={() => onPick('bank')}
            className="w-full p-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl flex items-center gap-3 active:scale-95 transition-all text-left">
            <span className="text-2xl">📝</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-800 text-[11px]">
                {isHi ? '₹5,000 पर्सनल लोन' : '₹5,000 Personal Loan'}
              </p>
              <p className="text-indigo-600 text-[9px] font-black leading-tight mt-0.5 italic">
                {isHi ? 'थोड़ा कागजी काम, पर ब्याज कम।' : 'Some paperwork, but low interest.'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function PanchayatPicker({ onPick, onClose, language }) {
  const isHi = language === 'hi';
  return (
    <div className="absolute inset-x-2 bottom-32 z-[4000] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">
        <div className="bg-green-700 px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <div>
              <p className="text-white font-black text-[10px] uppercase tracking-tight">
                {isHi ? 'सरकारी योजनाएं (Schemes)' : 'Eligible Schemes'}
              </p>
              <p className="text-green-200 text-[9px] font-bold">{isHi ? 'फ्री मदद' : 'Government Support'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 text-sm p-1">✕</button>
        </div>
        <div className="p-2.5">
          <div className="p-2.5 bg-green-50 border border-green-200 rounded-xl space-y-2">
             <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <p className="font-black text-slate-800 text-[10px] leading-tight flex-1">
                  {isHi ? 'आयुष्मान भारत - इलाज मुफ्त!' : 'Ayushman Bharat - Free treatment!'}
                </p>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xl">🚜</span>
                <p className="font-black text-slate-800 text-[10px] leading-tight flex-1">
                  {isHi ? 'पीएम-किसान भी उपलब्ध।' : 'PM-Kisan also available.'}
                </p>
             </div>
          </div>
          <button onClick={() => onPick('panchayat')}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-black text-[10px] active:scale-95 transition-all mt-2.5 shadow-lg shadow-green-100 uppercase tracking-widest">
            {isHi ? 'योजना का उपयोग करें ➔' : 'Claim Scheme ➔'}
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
    day1:    { label: isHi ? 'दिन 1' : 'Day 1',    emoji: '🚑', step: 0 },
    week2:   { label: isHi ? 'सप्ताह 2' : 'Week 2',   emoji: '💊', step: 1 },
    month1:  { label: isHi ? 'महिना 1' : 'Month 1',  emoji: '🏥', step: 2 },
  };
  const s = stages[stage] || stages.day1;
  return (
    <div className="absolute inset-0 z-[5000] bg-slate-950/95 flex flex-col items-center justify-center gap-6 px-8">
      <p className="text-red-400 font-black uppercase tracking-widest text-[10px]">
        {isHi ? 'समय बीत रहा है' : 'Time Passing'}
      </p>
      <div className="text-8xl animate-bounce">{s.emoji}</div>
      <h1 className="text-5xl font-black text-white italic tracking-tighter">{s.label}</h1>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-700 ${i <= s.step ? 'bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
}

// ── OUTCOME CARD ──────────────────────────────────────────────────
function OutcomeCard({ outcome, onDone, onWantExplanation, language }) {
  const isHi = language === 'hi';
  const isGood = outcome.color === 'green';
  const isBad = outcome.color === 'red';
  return (
    <div className="absolute inset-x-2 top-10 z-[4000] animate-in zoom-in-95 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        <div className={`px-4 py-3 shrink-0 ${isGood ? 'bg-gradient-to-r from-green-600 to-emerald-600' : isBad ? 'bg-gradient-to-r from-red-600 to-orange-700' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
          <h2 className="text-white font-black text-base">{isHi ? outcome.titleHi : outcome.title}</h2>
          <p className="text-white/80 font-bold text-[10px] leading-tight">{isHi ? outcome.subtitleHi : outcome.subtitle}</p>
        </div>
        
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {outcome.totalLoss && (
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-black text-[9px] uppercase tracking-widest ${isBad ? 'text-red-500' : 'text-amber-500'}`}>
                 {isHi ? 'लागत: ' : 'Total: '}{outcome.totalLoss}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          )}
          {outcome.lines.map((l, i) => (
            <div key={i} className={`flex items-center gap-2.5 p-2 rounded-xl border ${isGood ? 'bg-green-50/50 border-green-100' : isBad ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/50 border-amber-100'}`}>
              <span className="text-lg">{l.icon}</span>
              <span className="flex-1 font-bold text-slate-700 text-[11px]">{isHi ? l.labelHi : l.label}</span>
              <span className={`font-black text-[11px] ${isGood ? 'text-green-700' : isBad ? 'text-red-700' : 'text-amber-700'}`}>{l.value}</span>
            </div>
          ))}

          <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2.5">
            <span className="text-lg shrink-0">👴</span>
            <p className="text-amber-800 font-bold italic text-[10px] leading-tight">
              {isHi 
                ? '"सही वक़्त पर लिया गया फैसला आपको बड़े संकट से बचा सकता है।"'
                : '"A timely decision can save you from big debts."'}
            </p>
          </div>
        </div>

        <div className="p-3 bg-white border-t border-slate-50 flex flex-col gap-1.5 shrink-0">
          <button onClick={onWantExplanation}
            className="w-full py-2 bg-slate-100 text-slate-800 rounded-xl font-black text-[10px] active:scale-95 transition-all uppercase tracking-tight">
            {isHi ? 'समझना चाहते हो? 💡' : 'Need explanation? 💡'}
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

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function LoanTrapScenario({ language = 'hi', onComplete, onShowInsight, onHighlightsChange, onMapTintChange, onRegisterTapHandler }) {
  const [stage, setStage] = useState('intro'); // intro | pick | time_passing | outcome
  const [timeStage, setTimeStage] = useState('day1');
  const [activePicker, setActivePicker] = useState(null); // 'moneylender' | 'bank' | 'panchayat'
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    const highlights = stage === 'pick' ? ['moneylender', 'bank', 'panchayat'] : [];
    onHighlightsChange(highlights);
  }, [stage, onHighlightsChange]);

  useEffect(() => {
    if (stage === 'outcome' && outcome) {
      onMapTintChange(outcome.mapTint);
    } else {
      onMapTintChange(null);
    }
  }, [stage, outcome, onMapTintChange]);

  const handleLocationTap = useCallback((locId) => {
    if (stage === 'pick') {
      if (['moneylender', 'bank', 'panchayat'].includes(locId)) {
        setActivePicker(locId);
      }
    }
  }, [stage]);

  useEffect(() => {
    onRegisterTapHandler?.(handleLocationTap);
  }, [handleLocationTap, onRegisterTapHandler]);

  const handleSelection = (type) => {
    setActivePicker(null);
    setStage('time_passing');
    setTimeStage('day1');
    setTimeout(() => setTimeStage('week2'), 1500);
    setTimeout(() => setTimeStage('month1'), 3000);
    setTimeout(() => {
      setOutcome(OUTCOMES[type]);
      setStage('outcome');
      // Pass a special flag to insight to use the alternate data
    }, 4500);
  };

  const isDimmed = stage === 'pick' && !activePicker;

  return (
    <>
      {isDimmed && (
        <div className="absolute inset-0 z-[2000] bg-slate-900/55 backdrop-blur-[1px] pointer-events-none transition-all" />
      )}

      {stage === 'intro' && <FloatingEventCard language={language} onDismiss={() => setStage('pick')} />}

      {stage === 'pick' && !activePicker && (
        <InstructionHint 
          icon="🔍" 
          text={language === 'hi' 
            ? "साहूकार, बैंक या पंचायत पर जाएं और मदद मांगें।" 
            : "Visit Moneylender, Bank or Panchayat for help."} 
        />
      )}

      {activePicker === 'moneylender' && <SahukarPicker language={language} onPick={handleSelection} onClose={() => setActivePicker(null)} />}
      {activePicker === 'bank' && <BankPicker language={language} onPick={handleSelection} onClose={() => setActivePicker(null)} />}
      {activePicker === 'panchayat' && <PanchayatPicker language={language} onPick={handleSelection} onClose={() => setActivePicker(null)} />}

      {stage === 'time_passing' && <TimePassingOverlay language={language} stage={timeStage} />}

      {stage === 'outcome' && outcome && (
        <OutcomeCard
          language={language}
          outcome={outcome}
          onDone={onComplete}
          onWantExplanation={() => onShowInsight?.({ ...outcome, moduleId: 'loan_trap' })}
        />
      )}
    </>
  );
}
