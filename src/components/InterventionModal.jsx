import React from 'react';

const InterventionModal = ({ scheme, onClaim, onCancel, language = 'hi' }) => {
  if (!scheme) return null;

  const isHi = language === 'hi';

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-3 bg-blue-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-[92vw] max-w-[320px] bg-white rounded-[1.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border-2 border-blue-400 flex flex-col max-h-[85vh]">
        
        {/* CSC Worker Illustration Placeholder / UI Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-5 pt-8 flex flex-col items-center shrink-0">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl mb-3 border border-white/30 animate-pulse">
            🙋‍♂️
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            {isHi ? 'रुकिए!' : 'Wait!'}
          </h2>
          <p className="text-blue-50 font-black mt-1 text-center uppercase tracking-widest text-[10px] opacity-80">
            {isHi ? 'पंचायत गाइड' : 'Panchayat Guide'}
          </p>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <p className="text-base font-black text-slate-800 leading-tight text-center italic">
            {isHi 
              ? `आप ऊंचे ब्याज पर कर्ज लेने जा रहे हैं। पंचायत में आपके "${scheme.nameHi}" फंड उपलब्ध हैं।`
              : `You are about to take a high-interest loan. Your "${scheme.name}" funds are available at the Panchayat.`}
          </p>
          
          <p className="text-slate-500 font-bold text-center leading-tight text-xs">
            {isHi 
              ? "पहले उन्हें प्राप्त करें। यह पूरी तरह मुफ्त है और आपकी मदद के लिए है।"
              : "Let's claim that first. It is completely free and here to help you."}
          </p>

          <div className="space-y-2 pt-2">
            <button 
              onClick={onClaim}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white rounded-xl text-lg font-black shadow-lg shadow-blue-500/20"
            >
              {isHi ? `₹${scheme.benefitAmount} प्राप्त करें` : `Claim ₹${scheme.benefitAmount}`}
            </button>
            
            <button 
              onClick={onCancel}
              className="w-full py-2 text-slate-400 font-black text-[10px] items-center justify-center flex uppercase tracking-wider"
            >
              {isHi ? 'नहीं, साहूकार से कर्ज चाहिए' : 'No, I want Sahukar loan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionModal;
 
 
