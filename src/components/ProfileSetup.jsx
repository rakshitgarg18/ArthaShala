import React, { useState } from 'react';

const SETUP_T = {
  en: {
    title: 'Your Details',
    subtitle: 'Answer 2 quick questions for a personalized experience.',
    q1: 'Q1: How much land do you own?',
    land0: 'None', land1: '< 2 Hectares', land2: '> 2 Hectares',
    q2: 'Q2: Ration Card Type?',
    ration1: 'BPL/Antyodaya', ration2: 'General/Average',
    start: 'START GAME'
  },
  hi: {
    title: 'आपकी जानकारी',
    subtitle: 'बेहतर अनुभव के लिए 2 आसान सवालों के जवाब दें।',
    q1: 'प्रश्न 1: आपके पास कितनी जमीन है?',
    land0: 'कुछ नहीं', land1: '2 हेक्टेयर से कम', land2: '2 हेक्टेयर से अधिक',
    q2: 'प्रश्न 2: आपका राशन कार्ड प्रकार?',
    ration1: 'बीपीएल / अंत्योदय', ration2: 'सामान्य',
    start: 'खेल शुरू करें'
  },
  mr: {
    title: 'तुमची माहिती',
    subtitle: 'उत्तम अनुभवासाठी २ सोप्या प्रश्नांची उत्तरे द्या.',
    q1: 'प्रश्न १: तुमच्याकडे किती जमीन आहे?',
    land0: 'काहीही नाही', land1: '२ हेक्टरपेक्षा कमी', land2: '२ हेक्टरपेक्षा जास्त',
    q2: 'प्रश्न २: तुमचा रेशनकार्ड प्रकार?',
    ration1: 'बीपीएल / अंत्योदय', ration2: 'सामान्य',
    start: 'सुरू करा'
  },
  gu: {
    title: 'તમારી માહિતી',
    subtitle: 'વધુ સારા અનુભવ માટે 2 સરળ પ્રશ્નોના જવાબ આપો.',
    q1: 'પ્રશ્ન 1: તમારી પાસે કેટલી જમીન છે?',
    land0: 'કંઈ નહીં', land1: '2 હેક્ટરથી ઓછી', land2: '2 હેક્ટરથી વધુ',
    q2: 'પ્રશ્ન 2: તમારો રેશન કાર્ડ પ્રકાર?',
    ration1: 'બીપીએલ / અંત્યોદય', ration2: 'સામાન્ય',
    start: 'શરૂ કરો'
  }
};

export default function ProfileSetup({ language = 'hi', onProfileComplete }) {
  const [profile, setProfile] = useState({ land: '', income: '' });

  const t = SETUP_T[language] || SETUP_T.hi; // Fallback to Hindi
  const isComplete = profile.land && profile.income;

  const handleSelect = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  // Ensure underlying data values remain English for JSON matching Engine
  const LAND_OPTS = [
    { label: t.land0, val: 'None' },
    { label: t.land1, val: '< 2 Hectares' },
    { label: t.land2, val: '> 2 Hectares' }
  ];
  
  const RATION_OPTS = [
    { label: t.ration1, val: 'BPL/Antyodaya' },
    { label: t.ration2, val: 'General/Average' }
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col p-4 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="pt-6 mb-3 text-center">
        <h1 className="text-xl font-black text-slate-800 tracking-tight mb-0.5">
          {t.title}
        </h1>
        <p className="text-slate-500 font-bold text-[11px] leading-tight max-w-[240px] mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {/* Q1: Land */}
        <div>
          <h2 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">
            {t.q1}
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {LAND_OPTS.map((opt, idx) => (
              <button
                key={opt.val}
                onClick={() => handleSelect('land', opt.val)}
                className={`py-3 rounded-xl text-sm font-black border-2 transition-all ${profile.land === opt.val ? 'bg-green-50 border-green-500 text-green-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Q2: Income */}
        <div>
          <h2 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">
            {t.q2}
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {RATION_OPTS.map(opt => (
              <button
                key={opt.val}
                onClick={() => handleSelect('income', opt.val)}
                className={`py-3 rounded-xl text-sm font-black border-2 transition-all ${profile.income === opt.val ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pb-4">
        <button
          onClick={() => onProfileComplete(profile)}
          disabled={!isComplete}
          className={`w-full py-4 rounded-xl text-sm font-black transition-all uppercase tracking-widest ${isComplete ? 'bg-blue-600 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          {t.start}
        </button>
      </div>
    </div>
  );
}
 
 
