import React, { useMemo } from 'react';
import schemesData from '../data/schemes.json';

export default function SchemeEligibilityReport({ userProfile, onProceed, language = 'hi', buttonLabelEn = 'ENTER SIMULATION', buttonLabelHi = 'सिमुलेशन शुरू करें' }) {
  const isHi = language === 'hi';

  const eligibleSchemes = useMemo(() => {
    if (!userProfile) return [];
    return schemesData.filter(scheme => {
      const { requiredProfile } = scheme.triggerConditions;
      if (!requiredProfile) return true; // Available to all profiles
      for (const [key, value] of Object.entries(requiredProfile)) {
        if (userProfile[key] !== value) return false;
      }
      return true;
    });
  }, [userProfile]);

  return (
    <div className="w-full h-screen bg-slate-900 text-white flex flex-col p-6 overflow-y-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 430, margin: '0 auto' }}>
      <div className="pt-12 mb-8 text-center animate-in slide-in-from-top-10 duration-700">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
          ✓
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          {isHi ? 'आपकी योजनाएं' : 'Your Schemes'}
        </h1>
        <p className="text-green-400 font-bold text-sm">
          {isHi ? 'आपकी जानकारी के आधार पर, आप इन सरकारी योजनाओं के लिए पात्र हैं:' : 'Based on your profile, you are eligible for:'}
        </p>
      </div>

      <div className="space-y-4 flex-1 pb-10">
        {eligibleSchemes.map((s, idx) => (
          <div key={s.id} className="p-5 bg-slate-800 rounded-2xl border-2 border-slate-700 flex items-start gap-4 animate-in slide-in-from-bottom-10" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'backwards' }}>
            <span className="text-3xl">🏛️</span>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                {isHi ? s.nameHi : s.name}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1">
                 {isHi ? s.descriptionHi : s.description}
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                {isHi ? `₹${s.benefitAmount} लाभ` : `₹${s.benefitAmount} Benefit`}
              </div>
            </div>
          </div>
        ))}
        {eligibleSchemes.length === 0 && (
          <div className="text-center p-8 text-slate-500 font-bold">
            {isHi ? 'फिलहाल कोई विशिष्ट योजना नहीं मिली।' : 'No specific schemes matched.'}
          </div>
        )}
      </div>

      <div className="mt-auto pb-6 animate-in fade-in duration-1000 delay-500">
        <button
          onClick={onProceed}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white rounded-[24px] text-xl font-black shadow-xl shadow-blue-500/30"
        >
          {isHi ? buttonLabelHi : buttonLabelEn}
        </button>
      </div>
    </div>
  );
}
 
 
