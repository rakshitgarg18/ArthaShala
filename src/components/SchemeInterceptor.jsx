import React, { useState, useEffect } from 'react';
import { useFinancials } from '../context/FinancialContext';

const SchemeInterceptor = ({ children, onAction }) => {
  const { 
    walletBalance, 
    currentMonth, 
    language, 
    handleTransaction,
    arthaScore 
  } = useFinancials();

  const [activeScheme, setActiveScheme] = useState(null); // 'pm_kisan', 'ayushman', 'mgnrega'
  const [showMedicalEvent, setShowMedicalEvent] = useState(false);

  const isHi = language === 'hi';

  // 1. Ayushman Bharat - Medical Emergency Trigger (Month 6)
  useEffect(() => {
    if (currentMonth === 6 && !showMedicalEvent) {
      setShowMedicalEvent(true);
      setActiveScheme('ayushman');
    }
  }, [currentMonth, showMedicalEvent]);

  // Interceptor Logic for Node Clicks
  const interceptAction = (locationId, originalAction) => {
    // Interceptor 1: PM-Kisan (Cash Rescue)
    if (locationId === 'moneylender' && walletBalance < 2000) {
      setActiveScheme('pm_kisan');
      return true; // Intercepted
    }

    return false; // Not intercepted
  };

  // Helper handling for scheme completion
  const handleSchemeClaim = (scheme) => {
    if (scheme === 'pm_kisan') {
      handleTransaction(6000, 'income', 'pm_kisan_installment', { scoreChange: 20 });
    }
    if (scheme === 'ayushman') {
      // Bypasses the ₹15,000 cost
      handleTransaction(0, 'expense', 'medical_covered_ayushman', { scoreChange: 30 });
    }
    if (scheme === 'mgnrega') {
      handleTransaction(250, 'income', 'mgnrega_daily_wage', { scoreChange: 5 });
    }
    setActiveScheme(null);
  };

  return (
    <>
      {/* Pass the interceptor function to children via Render Prop */}
      {typeof children === 'function' ? children({ interceptAction }) : children}

      {/* Scheme Modals */}
      {activeScheme && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-xl bg-blue-900/20 animate-in fade-in duration-500">
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border-4 border-blue-500/30 animate-in zoom-in slide-in-from-bottom-10 duration-500">
            
            <div className="bg-blue-600 p-8 text-white flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-4">
                {activeScheme === 'pm_kisan' && '🌾'}
                {activeScheme === 'ayushman' && '🏥'}
                {activeScheme === 'mgnrega' && '🔨'}
              </div>
              <h2 className="text-3xl font-black tracking-tight text-center">
                {activeScheme === 'pm_kisan' && (isHi ? 'पीएम-किसान संदेश' : 'PM-Kisan Message')}
                {activeScheme === 'ayushman' && (isHi ? 'आयुष्मान भारत' : 'Ayushman Bharat')}
                {activeScheme === 'mgnrega' && (isHi ? 'रोजगार अवसर' : 'Work Opportunity')}
              </h2>
            </div>

            <div className="p-10 space-y-6">
              <p className="text-xl font-bold text-slate-800 leading-relaxed text-center italic">
                {activeScheme === 'pm_kisan' && (isHi 
                  ? "रुको! आप एक महंगा कर्ज लेने जा रहे हैं। आप पीएम-किसान के पात्र हैं। अभी अपनी ₹6,000 की किस्त प्राप्त करें।"
                  : "Wait! You are about to take a predatory loan. You are eligible for PM-Kisan. Claim your ₹6,000 installment now.")}
                
                {activeScheme === 'ayushman' && (isHi 
                  ? "मेडिकल इमरजेंसी! सामान्यतः इसमें ₹15,000 खर्च होते, जो आपको कर्ज में डाल देते। मुफ्त इलाज के लिए अपने आयुष्मान भारत कार्ड का उपयोग करें।"
                  : "Medical emergency! Normally this costs ₹15,000, forcing you into debt. Use your Ayushman Bharat eCard to cover treatment for free.")}
                
                {activeScheme === 'mgnrega' && (isHi 
                  ? "खेती का ऑफ-सीजन है, लेकिन आपको नकद की जरूरत है। पंचायत में मनरेगा कार्य उपलब्ध है। ₹250 कमाने के लिए यहाँ टैप करें।"
                  : "Crops are growing, but you need daily cash. The Panchayat has MGNREGA work available. Tap here to earn ₹250 a day.")}
              </p>

              <button 
                onClick={() => handleSchemeClaim(activeScheme)}
                className="w-full py-6 bg-slate-900 text-white rounded-3xl text-2xl font-black shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isHi ? 'लाभ प्राप्त करें' : 'Claim Benefit'}
                <span>→</span>
              </button>
              
              {activeScheme === 'mgnrega' && (
                <button 
                  onClick={() => setActiveScheme(null)}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                  {isHi ? 'बाद में' : 'Maybe Later'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SchemeInterceptor;
 
 
