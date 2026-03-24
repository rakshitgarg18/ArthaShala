import React, { useState, useEffect } from 'react';
import schemesData from '../data/schemes.json';
import { useFinancials } from '../context/FinancialContext.jsx';

export default function YojanaConnect({ onClose }) {
  const { farmerProfile, setFarmerProfile, language } = useFinancials();
  const [step, setStep] = useState('land'); // land | income | matching | schemes | apply
  const [matches, setMatches] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  
  // Local profile state to avoid polluting context until finished
  const [localLand, setLocalLand] = useState(null);
  const [localIncome, setLocalIncome] = useState(null);

  useEffect(() => {
    if (step !== 'matching') return;

    const timer = setTimeout(() => {
      // Find real matches from schemesData
      const result = schemesData.filter(s => {
        const cond = s.triggerConditions || {};
        const req = cond.requiredProfile || {};
        
        // 1. Check Profession
        const prof = (farmerProfile.profession || farmerProfile.occupation || 'farmer').toLowerCase();
        if (req.profession && req.profession.toLowerCase() !== prof) return false;

        // 2. Check Land (Exact string match from our options)
        if (req.land && localLand !== req.land) return false;

        // 3. Check Income (Exact string match from our options)
        if (req.income && localIncome !== req.income) return false;

        return true;
      });

      setMatches(result.slice(0, 3));
      setStep('schemes');
    }, 1500);
    return () => clearTimeout(timer);
  }, [step, localLand, localIncome, farmerProfile]);

  const t = {
    en: {
      matching: 'Scrutinizing Profile...',
      found: 'Matched Schemes!',
      apply: 'How to Apply',
      steps: 'Next Steps',
      close: 'Back',
      guidance: 'This is not just a game. You can use this in real life too. - Artha Chacha'
    },
    hi: {
      matching: 'प्रोफ़ाइल की जाँच...',
      found: 'योग्य योजनाएं!',
      apply: 'आवेदन प्रक्रिया',
      steps: 'अगले कदम',
      close: 'वापस',
      guidance: 'यह सिर्फ गेम नहीं है। इसे तुम असल ज़िंदगी में भी इस्तेमाल कर सकते हो। - अर्था चाचा'
    }
  }[language] || {
    matching: 'Matching Profile...',
    found: 'Matched Schemes!',
    apply: 'How to Apply',
    steps: 'Next Steps',
    close: 'Back',
    guidance: 'This is not just a game. You can use this in real life too. - Artha Chacha'
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3">
      <div className="w-[92vw] max-w-[320px] bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[85vh]">
        
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-xl">🌍</div>
             <h2 className="text-white font-black text-sm tracking-tight uppercase">Yojana Connect</h2>
          </div>
          <button onClick={onClose} className="text-white/40 text-sm p-1">✕</button>
        </div>

        {/* Content Area - Compacted */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
          
          {step === 'land' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="text-center">
                <p className="text-indigo-500 font-black text-[10px] uppercase tracking-widest mb-1">
                  {language === 'hi' ? 'कदम १' : 'STEP 1'}
                </p>
                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {language === 'hi' ? 'आपकी ज़मीन कितनी है?' : 'How much land do you own?'}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'None', hi: 'ज़मीन नहीं है', en: 'No Land / Landless' },
                  { id: '< 2 Hectares', hi: '२ हेक्टेयर से कम', en: '< 2 Hectares' },
                  { id: '2-5 Hectares', hi: '२-५ हेक्टेयर', en: '2-5 Hectares' },
                  { id: '> 5 Hectares', hi: '५ हेक्टेयर से अधिक', en: '> 5 Hectares' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setLocalLand(opt.id); setStep('income'); }}
                    className="w-full py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 active:bg-indigo-50 active:border-indigo-200 transition-all text-left px-5"
                  >
                    {language === 'hi' ? opt.hi : opt.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'income' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="text-center">
                <p className="text-indigo-500 font-black text-[10px] uppercase tracking-widest mb-1">
                  {language === 'hi' ? 'कदम २' : 'STEP 2'}
                </p>
                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {language === 'hi' ? 'आपकी सालाना आय कितनी है?' : 'What is your yearly income?'}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: '< 1 Lakh', hi: '१ लाख से कम', en: '< 1 Lakh' },
                  { id: '1-3 Lakhs', hi: '१-३ लाख', en: '1-3 Lakhs' },
                  { id: '3-5 Lakhs', hi: '३-५ लाख', en: '3-5 Lakhs' },
                  { id: '> 5 Lakhs', hi: '५ लाख से अधिक', en: '> 5 Lakhs' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setLocalIncome(opt.id); setStep('matching'); }}
                    className="w-full py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 active:bg-indigo-50 active:border-indigo-200 transition-all text-left px-5"
                  >
                    {language === 'hi' ? opt.hi : opt.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'matching' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
               <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">📄</div>
               </div>
               <p className="text-slate-600 font-bold text-xs animate-pulse tracking-tight">{t.matching}</p>
            </div>
          )}

          {step === 'schemes' && (
            <>
              <div className="text-center">
                <p className="text-indigo-500 font-black text-[10px] uppercase tracking-widest mb-0.5">{t.found}</p>
                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">
                  {language === 'hi' ? 'आपके लिए विशेष अवसर' : 'Eligible Opportunities'}
                </h3>
              </div>

              <div className="flex flex-col gap-2.5">
                {matches.length > 0 ? matches.map(s => (
                  <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 hover:border-indigo-200 transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl mt-0.5">🛡️</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 text-[11px] leading-tight group-hover:text-indigo-600 transition-colors uppercase truncate">
                          {language === 'hi' ? s.nameHi : s.name}
                        </h4>
                        <p className="text-slate-500 font-bold text-[9px] leading-tight mt-1 line-clamp-2">
                          {language === 'hi' ? s.descriptionHi : s.description}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedScheme(s); setStep('apply'); }}
                      className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-indigo-600 active:scale-95 transition-all shadow-sm uppercase tracking-widest"
                    >
                      {language === 'hi' ? 'आवेदन करें ➔' : 'APPLY NOW ➔'}
                    </button>
                  </div>
                )) : (
                  <div className="py-8 text-center text-slate-400 font-bold text-[11px] italic">
                    {language === 'hi' ? 'आपकी प्रोफ़ाइल के लिए कोई सटीक मेल नहीं मिला।' : 'No matches found.'}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 'apply' && selectedScheme && (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
               <div className="flex flex-col items-center text-center">
                  <div className="text-4xl mb-2">📍</div>
                  <h3 className="text-lg font-black text-slate-800 leading-tight mb-0.5">{t.apply}</h3>
                  <p className="text-indigo-600 font-black text-[9px] uppercase tracking-widest leading-tight">
                    {language === 'hi' ? selectedScheme.nameHi : selectedScheme.name}
                  </p>
               </div>

               <div className="space-y-2">
                  <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest">{t.steps}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[10px]">1</span>
                      <p className="text-slate-700 font-bold text-[10px] leading-tight">
                        {language === 'hi' ? 'नज़दीकी पंचायत या CSC सेंटर जाएँ' : 'Visit nearest Panchayat / CSC Center'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[10px]">2</span>
                      <p className="text-slate-700 font-bold text-[10px] leading-tight">
                        {language === 'hi' ? 'आधार कार्ड और बैंक पासबुक साथ रखें' : 'Carry Aadhaar & Bank Details'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[10px]">3</span>
                      <p className="text-slate-700 font-bold text-[10px] leading-tight">
                        {language === 'hi' 
                          ? `${selectedScheme.nameHi} में पंजीकरण मांगें` 
                          : `Ask for registration in ${selectedScheme.name}`}
                      </p>
                    </div>
                  </div>
               </div>

               <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0">👴</span>
                  <p className="text-amber-900 font-bold italic text-[9px] leading-tight">
                    "{t.guidance}"
                  </p>
               </div>

               <button 
                  onClick={() => setStep('schemes')}
                  className="w-full py-2 border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 active:scale-95 transition-all uppercase tracking-widest"
               >
                  {language === 'hi' ? '← वापस सूची' : '← BACK TO LIST'}
               </button>
            </div>
          )}
        </div>

        {/* Footer - Compacitied */}
        <div className="p-4 pt-2 bg-slate-50 border-t border-slate-100 shrink-0">
           <button onClick={onClose}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs active:scale-95 transition-all shadow-lg tracking-widest uppercase">
              {t.close}
           </button>
        </div>
      </div>
    </div>
  );
}
