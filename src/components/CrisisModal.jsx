import React from 'react';
import { useFinancials } from '../context/FinancialContext';

export default function CrisisModal({ lesson, onChoice }) {
  const { language } = useFinancials();
  if (!lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-md rounded-[1.5rem] shadow-2xl p-4 w-[92vw] max-w-[320px] max-h-[85vh] overflow-y-auto border border-white/50 flex flex-col transform animate-in zoom-in-95 duration-500">
        
        <h2 className="text-base font-black mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500 uppercase tracking-tight shrink-0">
          {language === 'hi' ? (lesson.crisis || 'फैसला लें!') : (lesson.crisisEn || lesson.crisis)}
        </h2>
        
        <p className="text-slate-600 font-bold mb-3 leading-tight text-[11px] shrink-0">
          {language === 'hi' ? 'बुवाई का समय! सही विकल्प चुनें।' : 'Planting time! Choose the right path.'}
        </p>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 gap-3">
          {/* GOOD CHOICE CARD */}
          <div 
            onClick={() => onChoice('good')}
            className="group relative overflow-hidden bg-green-50/50 hover:bg-green-100 border-2 border-green-400/30 hover:border-green-500 rounded-xl p-3 cursor-pointer transition-all duration-300 active:scale-95 shadow-lg shadow-green-900/5"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 bg-green-500 text-white rounded-lg flex items-center justify-center text-lg shadow-md shadow-green-500/30">
                🏦
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-green-900 font-black text-[11px] leading-tight uppercase truncate">
                   {language === 'hi' ? (lesson.choices.good.textHi || lesson.choices.good.text) : (lesson.choices.good.textEn || lesson.choices.good.text)}
                </h3>
                <p className="text-green-700/70 text-[9px] font-bold mt-0.5 leading-tight">
                   {language === 'hi' ? 'सुरक्षित और सस्ता' : 'Safe and affordable'}
                </p>
              </div>
            </div>
          </div>

          {/* BAD CHOICE CARD */}
          <div 
            onClick={() => onChoice('bad')}
            className="group relative overflow-hidden bg-red-50/50 hover:bg-red-100 border-2 border-red-400/30 hover:border-red-500 rounded-xl p-3 cursor-pointer transition-all duration-300 active:scale-95 shadow-lg shadow-red-900/5"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg shadow-md shadow-red-500/30">
                🤑
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-red-900 font-black text-[11px] leading-tight uppercase truncate">
                   {language === 'hi' ? (lesson.choices.bad.textHi || lesson.choices.bad.text) : (lesson.choices.bad.textEn || lesson.choices.bad.text)}
                </h3>
                <p className="text-red-700/70 text-[9px] font-bold mt-0.5 leading-tight">
                   {language === 'hi' ? 'जाल में फंस सकते हैं!' : 'Potential debt trap!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-4 text-center shrink-0">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">
            {language === 'hi' ? 'विवेकपूर्ण चयन करें' : 'Choose wisely'}
          </p>
        </div>
      </div>
    </div>
  );
}
 
