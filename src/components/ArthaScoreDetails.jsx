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
      status: isEn ? 'Gao Ka Gaurav (Village Pride)' 
            : isMr ? 'गावाचा गौरव'
            : isGu ? 'ગામનું ગૌરવ'
            : isBn ? 'গ্রামের গৌরব'
            : 'गाँव का गौरव',
      consequence: isEn ? 'Banks trust you fully; you will get loans easily.'
                 : isMr ? 'बँकांचा तुमच्यावर पूर्ण विश्वास आहे. कर्ज सहज मिळेल.'
                 : isGu ? 'બેંકો તમારા પર પૂરો વિશ્વાસ રાખે છે. લોન સરળતાથી મળશે.'
                 : isBn ? 'ব্যাংকগুলি আপনার ওপর পূর্ণ ভরসা করে। ঋণ সহজে পাবেন।'
                 : 'बैंक आप पर पूरा भरोसा करते हैं। आपको लोन आसानी से मिलेगा।',
      zone: 'GREEN'
    };
    if (score >= 41) return {
      color: 'from-yellow-500 to-orange-400',
      status: isEn ? 'Satark Rahein (Be Careful)'
            : isMr ? 'सतर्क रहा'
            : isGu ? 'સતર્ક રહો'
            : isBn ? 'সতর্ক থাকুন'
            : 'सतर्क रहें',
      consequence: isEn ? 'Banks are cautious with you. Pay on time.'
                 : isMr ? 'बँका तुमच्या बाबतीत सावध आहेत. वेळेवर पैसे भरा.'
                 : isGu ? 'બેંકો તમારા માટે સાવચેત છે. સમયસર ચૂકવણી કરો.'
                 : isBn ? 'ব্যাংকগুলি আপনার প্রতি সতর্ক। সময়মতো পরিশোধ করুন।'
                 : 'बैंक आपके साथ सावधानी बरत रहे हैं। समय पर भुगतान करें।',
      zone: 'YELLOW'
    };
    return {
      color: 'from-red-600 to-orange-500',
      status: isEn ? 'Sahukar Ka Jaal (Debt Trap)'
            : isMr ? 'सावकाराचे जाळे'
            : isGu ? 'શાહુકારની જાળ'
            : isBn ? 'মহাজনের জাল'
            : 'साहूकार का जाल',
      consequence: isEn ? 'Banks do not trust you. Debt could grow.'
                 : isMr ? 'बँकांचा तुमच्यावर विश्वास नाही. कर्जाचा बोजा वाढू शकतो.'
                 : isGu ? 'બેંકો તમારા પર વિશ્વાસ નથી કરતી. દેવું વધી શકે છે.'
                 : isBn ? 'ব্যাংকগুলি আপনার ওপর ভরসা করছে না। ঋণের বোঝা বাড়তে পারে।'
                 : 'बैंक आप पर भरोसा नहीं कर रहे हैं। कर्ज का बोझ बढ़ सकता है।',
      zone: 'RED'
    };
  };

  const zoneInfo = getZone(currentScore, language);

  const T_LABELS = {
    hi: { boost: 'स्कोर बढ़ाएं', lower: 'स्कोर घटाएं', bank: 'बैंक से लेनदेन', crop: 'फसल बीमा', health: 'आयुष्मान भारत', debt: 'साहूकार का कर्ज़', late: 'किश्त में देरी', otp: 'OTP शेयर करना', footer: 'आपका आर्थिक स्वास्थ्य, भारत की प्रगति' },
    en: { boost: 'Boost Score', lower: 'Lower Score', bank: 'Bank Deals', crop: 'Crop Insurance', health: 'Ayushman Card', debt: 'Debt Trap', late: 'Late Pays', otp: 'Sharing OTP', footer: 'Your Financial Health, India\'s Progress' },
    mr: { boost: 'स्कोर वाढवा', lower: 'स्कोर कमी करा', bank: 'बँक व्यवहार', crop: 'पीक विमा', health: 'आयुष्मान भारत', debt: 'सावकाराचे कर्ज', late: 'हप्ता उशीर', otp: 'OTP शेअर करणे', footer: 'तुमचे आर्थिक आरोग्य, भारताची प्रगতি' },
    gu: { boost: 'સ્કોર વધારો', lower: 'સ્કોર ઘટાડો', bank: 'બેંક વ્યવહાર', crop: 'પાક વીમો', health: 'આયુષ્માન ભારત', debt: 'શાહુકારનું દેવું', late: 'હપ્તામાં વિલંબ', otp: 'OTP શેર કરવો', footer: 'તમારું આર્થિક સ્વાસ્થ્ય, ભારતની પ્રગતિ' },
    bn: { boost: 'স্কোর বাড়ান', lower: 'স্কোর কমান', bank: 'ব্যাংক লেনদেন', crop: 'ফসল বিমা', health: 'আয়ুষ্মান ভারত', debt: 'মহাজনের ঋণ', late: 'কিস্তিতে দেরি', otp: 'OTP শেয়ার করা', footer: 'আপনার আর্থিক স্বাস্থ্য, ভারতের প্রগতি' }
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

      {/* Slide-up Container */}
      <div 
        className={`relative w-full max-w-md mx-auto bg-slate-900 shadow-2xl border-t border-white/20 rounded-t-[3rem] p-4 flex flex-col transition-transform duration-500 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '85vh' }}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white text-5xl font-light p-2 transition-colors z-[6000]"
        >
          ✕
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-12 pb-24">
          <div className="flex flex-col items-center text-center space-y-8">
            
            {/* HER0 GAUGE */}
            <div className="relative flex flex-col items-center">
              {/* Semi-circle Gauge Path */}
              <div className="relative w-64 h-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 border-[16px] border-white/10 rounded-full" />
                <div 
                  className={`absolute top-0 left-0 w-64 h-64 border-[16px] border-transparent rounded-full bg-gradient-to-r ${zoneInfo.color} transition-all duration-1000`}
                  style={{ 
                    clipPath: `polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)`,
                    transform: `rotate(${(currentScore / 100) * 180 - 180}deg)`,
                    transformOrigin: 'center'
                  }}
                />
              </div>
              
              {/* Score Display */}
              <div className="absolute top-12 flex flex-col items-center">
                <span className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                  {currentScore}
                </span>
              </div>
            </div>

            {/* Emotional Status */}
            <div className="pt-8">
              <h2 className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${zoneInfo.color} tracking-tight`}>
                {zoneInfo.status}
              </h2>
            </div>

            {/* Consequence Box */}
            <div className="w-full bg-white/10 border border-white/20 rounded-[2.5rem] p-8 mt-4 shadow-2xl">
              <p className="text-xl text-white/90 font-medium leading-relaxed italic">
                {zoneInfo.consequence}
              </p>
            </div>

            {/* BREAKDOWN GRID */}
            <div className="grid grid-cols-1 gap-4 w-full mt-8">
              
              {/* Good Habits Card */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-green-400 font-black text-xl tracking-wide uppercase">
                    {labels.boost}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-white/80 text-sm font-bold">
                    <span className="text-xl">🏦</span> {labels.bank}
                  </div>
                  <div className="flex items-center gap-3 text-white/80 text-sm font-bold">
                    <span className="text-xl">🛡️</span> {labels.crop}
                  </div>
                  <div className="flex items-center gap-3 text-white/80 text-sm font-bold">
                    <span className="text-xl">🩺</span> {labels.health}
                  </div>
                </div>
              </div>

              {/* Bad Habits Card */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">❌</span>
                  <h3 className="text-red-400 font-black text-xl tracking-wide uppercase">
                    {labels.lower}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-white/80 text-sm font-bold">
                    <span className="text-xl">🧛</span> {labels.debt}
                  </div>
                  <div className="flex items-center gap-3 text-white/80 text-sm font-bold">
                    <span className="text-xl">📉</span> {labels.late}
                  </div>
                  <div className="flex items-center gap-3 text-white/80 text-sm font-bold">
                    <span className="text-xl">🛑</span> {labels.otp}
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
