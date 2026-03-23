import React, { useEffect } from 'react';

const OutcomeOverlay = ({ type, scoreChange, language, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const isHi = language === 'hi';
  const isPositive = type === 'success';

  const config = {
    success: {
      title: isHi ? 'सही निर्णय!' : 'Right Decision!',
      subtitle: isHi ? 'आपका आर्थिक स्कोर बढ़ गया है' : 'Your Artha Score has increased',
      icon: '✅',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
      glowClass: 'text-glow-green',
      animClass: 'animate-success-pop'
    },
    warning: {
      title: isHi ? 'महंगा सौदा!' : 'Expensive Choice!',
      subtitle: isHi ? 'सावधान! आपका कर्ज और स्कोर प्रभावित हुआ है' : 'Caution! Your debt and score are affected',
      icon: '⚠️',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
      glowClass: 'text-glow-red',
      animClass: 'animate-failure-shake'
    }
  };

  const { title, subtitle, icon, bgColor, textColor, glowClass, animClass } = config[type];

  return (
    <div className={`absolute inset-0 z-[800] flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-500 rounded-[50px] overflow-hidden ${type === 'success' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
      
      {/* Close Button */}
      <button 
        onClick={onComplete}
        className="absolute top-8 right-8 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl z-[810] transition-all active:scale-90"
      >
        ✕
      </button>

      <div className={`flex flex-col items-center text-center p-12 rounded-[60px] bg-slate-900 shadow-2xl border-4 ${type === 'success' ? 'border-green-400' : 'border-red-400'} ${animClass}`}>
        
        <div className={`text-8xl mb-8 drop-shadow-[0_0_40px_${type === 'success' ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'}]`}>
          {icon}
        </div>

        <h2 className={`text-5xl font-black italic tracking-tighter mb-4 ${type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {title}
        </h2>
        
        <p className="text-xl font-bold text-white/80 max-w-xs mx-auto leading-tight italic mb-8">
          {subtitle}
        </p>

        <div className={`px-8 py-4 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4`}>
          <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Artha Score</span>
          <span className={`text-4xl font-black ${type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{scoreChange}
          </span>
        </div>
      </div>

      {/* Confetti-like bits (CSS purely) */}
      {isPositive && (
         <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-30"></div>
            <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-green-300 rounded-full animate-ping delay-300 opacity-20"></div>
            <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-ping delay-500 opacity-40"></div>
         </div>
      )}
    </div>
  );
};

export default OutcomeOverlay;
 
 
