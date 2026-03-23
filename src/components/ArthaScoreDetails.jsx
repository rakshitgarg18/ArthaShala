import React, { useEffect, useState } from 'react';
import { TRANSLATIONS } from '../data/translations';

const ArthaScoreDetails = ({ currentScore, walletBalance, language, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getZone = (score) => {
    if (score >= 71) return {
      color: 'from-green-600 to-lime-500',
      status: 'गाँव का गौरव (Village Pride)',
      consequence: 'बैंक आप पर पूरा भरोसा करते हैं। आपको लोन आसानी से मिलेगा। (Banks trust you fully; you will get loans easily.)',
      zone: 'GREEN'
    };
    if (score >= 41) return {
      color: 'from-yellow-500 to-orange-400',
      status: 'सतर्क रहें (Be Careful)',
      consequence: 'बैंक आपके साथ सावधानी बरत रहे हैं। समय पर भुगतान करें। (Banks are cautious with you. Pay on time.)',
      zone: 'YELLOW'
    };
    return {
      color: 'from-red-600 to-orange-500',
      status: 'साहूकार का जाल (Debt Trap)',
      consequence: 'बैंक आप पर भरोसा नहीं कर रहे हैं। कर्ज का बोझ बढ़ सकता है। (Banks do not trust you. Debt could grow.)',
      zone: 'RED'
    };
  };

  const zoneInfo = getZone(currentScore);

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
        className={`relative w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-2xl border-t border-white/20 rounded-t-[3rem] p-4 flex flex-col transition-transform duration-500 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '90vh' }}
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
            <div className="grid grid-cols-2 gap-4 w-full mt-8">
              
              {/* Good Habits Card */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-green-400 font-black text-xl tracking-wide uppercase">
                    {language === 'hi' ? 'स्कोर बढ़ाएं' : 'Boost Score'}
                  </h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-white/80 text-lg font-bold">
                    <span className="text-2xl">🏦</span> 
                    {language === 'hi' ? 'बैंक से लेनदेन' : 'Bank Deals'}
                  </li>
                  <li className="flex items-center gap-3 text-white/80 text-lg font-bold">
                    <span className="text-2xl">🛡️</span> 
                    {language === 'hi' ? 'फसल बीमा' : 'Crop Insurance'}
                  </li>
                  <li className="flex items-center gap-3 text-white/80 text-lg font-bold">
                    <span className="text-2xl">🩺</span> 
                    {language === 'hi' ? 'आयुष्मान भारत' : 'Ayushman Card'}
                  </li>
                </ul>
              </div>

              {/* Bad Habits Card */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">❌</span>
                  <h3 className="text-red-400 font-black text-xl tracking-wide uppercase">
                    {language === 'hi' ? 'स्कोर घटाएं' : 'Lower Score'}
                  </h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-white/80 text-lg font-bold">
                    <span className="text-2xl">🧛</span> 
                    {language === 'hi' ? 'साहूकार का कर्ज़' : 'Debt Trap'}
                  </li>
                  <li className="flex items-center gap-3 text-white/80 text-lg font-bold">
                    <span className="text-2xl">📉</span> 
                    {language === 'hi' ? 'किश्त में देरी' : 'Late Pays'}
                  </li>
                  <li className="flex items-center gap-3 text-white/80 text-lg font-bold">
                    <span className="text-2xl">🛑</span> 
                    {language === 'hi' ? 'OTP शेयर करना' : 'Sharing OTP'}
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 text-center text-white/30 text-xs font-black tracking-widest uppercase">
          {language === 'hi' ? 'आपका आर्थिक स्वास्थ्य, भारत की प्रगति' : 'Your Financial Health, India\'s Progress'}
        </div>
      </div>
    </div>
  );
};

export default ArthaScoreDetails;
