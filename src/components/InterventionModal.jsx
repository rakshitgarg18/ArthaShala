import React from 'react';

const InterventionModal = ({ scheme, onClaim, onCancel, language = 'hi' }) => {
  if (!scheme) return null;

  const isHi = language === 'hi';

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-md bg-white rounded-[40 px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in slide-in-from-bottom-20 duration-700 border-4 border-blue-400">
        
        {/* CSC Worker Illustration Placeholder / UI Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl mb-4 border-2 border-white/30 animate-pulse">
            🙋‍♂️
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {isHi ? 'रुको! (Wait!)' : 'Wait!'}
          </h2>
          <p className="text-blue-50 font-bold mt-2 text-center uppercase tracking-widest text-sm">
            {isHi ? 'CSC गाइड संदेश' : 'CSC Guide Message'}
          </p>
        </div>

        <div className="p-10 space-y-8">
          <p className="text-2xl font-[900] text-slate-800 leading-tight text-center italic">
            {isHi 
              ? `आप 24% ब्याज पर कर्ज लेने जा रहे हैं। पंचायत में आपके *${scheme.nameHi}* फंड इंतजार कर रहे हैं।`
              : `You are about to take a loan at 24% interest. Your *${scheme.name}* funds are waiting at the Panchayat.`}
          </p>
          
          <p className="text-slate-500 font-bold text-center leading-relaxed">
            {isHi 
              ? "पहले उन्हें प्राप्त करें। यह पूरी तरह मुफ्त है और आपकी मदद के लिए है।"
              : "Let's claim that first. It is completely free and here to help you."}
          </p>

          <div className="space-y-4">
            <button 
              onClick={onClaim}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white rounded-[30px] text-2xl font-black shadow-xl shadow-blue-500/20"
            >
              {isHi ? `₹${scheme.benefitAmount} प्राप्त करें` : `Claim ₹${scheme.benefitAmount}`}
            </button>
            
            <button 
              onClick={onCancel}
              className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              {isHi ? 'नहीं, मुझे साहूकार का कर्ज चाहिए' : 'No, I want Sahukar loan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionModal;
 
 
