import React, { useEffect, useState } from 'react';
import { TRANSLATIONS } from '../data/translations';

const ArthaScoreDetails = ({ currentScore, walletBalance, language, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getZone = (score, lang) => {
    const isEn = lang === 'en';
    const isMr = lang === 'mr';
    const isGu = lang === 'gu';
    const isBn = lang === 'bn';

    if (score >= 71) return {
      color: 'from-green-600 to-lime-500',
      status: isEn ? 'Village Pride' 
            : isMr ? 'गावाचा गौरव'
            : isGu ? 'ગામનું ગૌરવ'
            : isBn ? 'গ্রামের গৌরব'
            : 'गाँव का गौरव',
      consequence: isEn ? 'Banks trust you fully; you will get loans easily.'
                 : isMr ? 'बँकांचा तुमच्यावर पूर्ण विश्वास आहे। कर्ज सहज मिळेल।'
                 : isGu ? 'બેંકો તમારા પર પૂરો વિશ્વાસ રાખે છે। લોન સરળતાથી મળશે।'
                 : isBn ? 'ব্যাংকগুলি আপনার ওপর পূর্ণ ভরসা করে। ঋণ সহজে পাবেন।'
                 : 'बैंक आप पर पूरा भरोसा करते हैं। आपको लोन आसानी से मिलेगा।',
      zone: 'GREEN'
    };
    if (score >= 41) return {
      color: 'from-yellow-500 to-orange-400',
      status: isEn ? 'Be Careful'
            : isMr ? 'सतर्क रहा'
            : isGu ? 'સતર્ક રહો'
            : isBn ? 'সতর্ক থাকুন'
            : 'सतर्क रहें',
      consequence: isEn ? 'Banks are cautious with you. Pay on time.'
                 : isMr ? 'बँका तुमच्या बाबतीत सावध आहेत। वेळेवर पैसे भरा।'
                 : isGu ? 'બેંકો તમારા માટે સાવચેત છે। સમયસર ચૂકવણી કરો।'
                 : isBn ? 'ব্যাংকগুলি আপনার প্রতি সতর্ক। সময়মতো পরিশোধ করুন।'
                 : 'बैंक आपके साथ सावधानी बरत रहे हैं। समय पर भुगतान करें।',
      zone: 'YELLOW'
    };
    return {
      color: 'from-red-600 to-orange-500',
      status: isEn ? 'Debt Trap'
            : isMr ? 'सावकाराचे जाळे'
            : isGu ? 'શાહુકારની જાળ'
            : isBn ? 'মহাজনের জাল'
            : 'साहूकार का जाल',
      consequence: isEn ? 'Banks do not trust you. Debt could grow.'
                 : isMr ? 'बँकांचा तुमच्यावर विश्वास नाही। कर्जाचा बोजा वाढू शकतो।'
                 : isGu ? 'બેંકો તમારા પર વિશ્વાસ નથી કરતી। દેવું વધી શકે છે।'
                 : isBn ? 'ব্যাংকগুলি আপনার ওপর ভরসা করছে না। ঋণের বোঝা বাড়তে পারে।'
                 : 'बैंक आप पर भरोसा नहीं कर रहे हैं। कर्ज का बोझ बढ़ सकता है।',
      zone: 'RED'
    };
  };

  const zoneInfo = getZone(currentScore, language);

  const T_LABELS = {
    hi: { boost: 'स्कोर बढ़ाएं', lower: 'स्कोर घटाएं', bank: 'बैंक लेनदेन', crop: 'फसल बीमा', health: 'आयुष्मान भारत', debt: 'साहूकार कर्ज', late: 'किश्त देरी', otp: 'OTP शेयर', footer: 'आपका आर्थिक स्वास्थ्य, भारत की प्रगति' },
    en: { boost: 'Boost Score', lower: 'Lower Score', bank: 'Bank Deals', crop: 'Crop Insurance', health: 'Ayushman Card', debt: 'Debt Trap', late: 'Late Pays', otp: 'Sharing OTP', footer: 'Your Financial Health, India\'s Progress' },
    mr: { boost: 'स्कोर वाढवा', lower: 'स्कोर कमी करा', bank: 'बँक व्यवहार', crop: 'पीक विमा', health: 'आयुष्मान भारत', debt: 'सावकाराचे कर्ज', late: 'हप्ता उशीर', otp: 'OTP शेअर', footer: 'तुमचे आर्थिक आरोग्य, भारताची प्रगती' },
    gu: { boost: 'સ્કોર વધારો', lower: 'સ્કોર ઘટાડો', bank: 'બેંક વ્યવહાર', crop: 'પાક વીમો', health: 'આયુષ્માન ભારત', debt: 'શાહુકારનું દેવું', late: 'હપ્તામાં વિલંબ', otp: 'OTP શેર', footer: 'તમારું આર્થિક સ્વાસ્થ્ય, ભારતની પ્રગતિ' },
    bn: { boost: 'স্কোর বাড়ান', lower: 'স্কোর কমান', bank: 'ব্যাংক লেনদেন', crop: 'ফসল বিমা', health: 'আয়ুষ্মান ভারত', debt: 'মহাজনের ঋণ', late: 'কিস্তিতে দেরি', otp: 'OTP শেয়ার', footer: 'আপনার আর্থিক স্বাস্থ্য, ভারতের প্রগতি' }
  };

  const labels = T_LABELS[language] || T_LABELS.hi;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  return (
    <div className={`fixed inset-0 z-[5000] flex flex-col justify-end transition-all duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" onClick={handleClose} />

      {/* Slide-up Container - Compacted */}
      <div 
        className={`relative w-full max-w-md mx-auto bg-slate-900 shadow-2xl border-t border-white/20 rounded-t-[2.5rem] p-3 flex flex-col transition-transform duration-500 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '80vh' }}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-3xl font-light p-2 transition-colors z-[6000]"
        >
          ✕
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pt-8 pb-12">
          <div className="flex flex-col items-center text-center space-y-5">
            
            {/* HERO GAUGE - Shrinked */}
            <div className="relative flex flex-col items-center">
              {/* Semi-circle Gauge Path */}
              <div className="relative w-48 h-24 overflow-hidden">
                <div className="absolute top-0 left-0 w-48 h-48 border-[12px] border-white/10 rounded-full" />
                <div 
                  className={`absolute top-0 left-0 w-48 h-48 border-[12px] border-transparent rounded-full bg-gradient-to-r ${zoneInfo.color} transition-all duration-1000`}
                  style={{ 
                    clipPath: `polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)`,
                    transform: `rotate(${(currentScore / 100) * 180 - 180}deg)`,
                    transformOrigin: 'center'
                  }}
                />
              </div>
              
              {/* Score Display */}
              <div className="absolute top-8 flex flex-col items-center">
                <span className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
                  {currentScore}
                </span>
              </div>
            </div>

            {/* Emotional Status */}
            <div className="pt-0">
              <h2 className={`text-xl font-black bg-clip-text text-transparent bg-gradient-to-r ${zoneInfo.color} tracking-tight leading-tight uppercase`}>
                {zoneInfo.status}
              </h2>
            </div>

            {/* Consequence Box - More compact */}
            <div className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 mt-0 shadow-inner">
              <p className="text-sm text-slate-200 font-bold leading-tight italic">
                {zoneInfo.consequence}
              </p>
            </div>

            {/* BREAKDOWN GRID - Tighter */}
            <div className="grid grid-cols-1 gap-3 w-full mt-2">
              
              {/* Good Habits Card */}
              <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/30 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✅</span>
                  <h3 className="text-green-400 font-black text-sm tracking-wide uppercase">
                    {labels.boost}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black bg-slate-800/40 p-2 rounded-lg truncate">
                    <span className="text-base">🏦</span> {labels.bank}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black bg-slate-800/40 p-2 rounded-lg truncate">
                    <span className="text-base">🛡️</span> {labels.crop}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black bg-slate-800/40 p-2 rounded-lg truncate col-span-2">
                    <span className="text-base">🩺</span> {labels.health}
                  </div>
                </div>
              </div>

              {/* Bad Habits Card */}
              <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/30 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">❌</span>
                  <h3 className="text-red-400 font-black text-sm tracking-wide uppercase">
                    {labels.lower}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black bg-slate-800/40 p-2 rounded-lg truncate">
                    <span className="text-base">🧛</span> {labels.debt}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black bg-slate-800/40 p-2 rounded-lg truncate">
                    <span className="text-base">📉</span> {labels.late}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black bg-slate-800/40 p-2 rounded-lg truncate col-span-2">
                    <span className="text-base">🛑</span> {labels.otp}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 text-center text-white/30 text-[10px] font-black tracking-widest uppercase">
          {labels.footer}
        </div>
      </div>
    </div>
  );
};

export default ArthaScoreDetails;
