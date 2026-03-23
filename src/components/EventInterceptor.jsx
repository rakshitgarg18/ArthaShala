import React, { useState, useEffect } from 'react';
import { useFinancials } from '../context/FinancialContext';
import eventsData from '../data/events.json';

const EventInterceptor = ({ language }) => {
  const { 
    currentMonth, 
    walletBalance, 
    registerTransaction, 
    claimedSchemes,
    arthaScore
  } = useFinancials();

  const [activeEvent, setActiveEvent] = useState(null);
  const [triggeredMonths, setTriggeredMonths] = useState(new Set());

  useEffect(() => {
    // Check for event trigger at start of month
    if (triggeredMonths.has(currentMonth)) return;

    const event = eventsData.find(e => e.triggerMonth === currentMonth);
    if (event) {
      // 50% probability logic
      if (Math.random() > 0.5) {
        setActiveEvent(event);
      }
      setTriggeredMonths(prev => new Set(prev).add(currentMonth));
    }
  }, [currentMonth, triggeredMonths]);

  if (!activeEvent) return null;

  const hasBypass = () => {
    if (activeEvent.educationalBypass === 'emergency_savings') return walletBalance >= 10000; // Lesson: Having 2x cost in savings
    // Check if the relevant scheme was claimed (mocked via claimedSchemes array)
    // In our simplified context, we can check if any scheme was claimed
    return claimedSchemes.length > 0; 
  };

  const handleResolution = (type) => {
    if (type === 'pay') {
      registerTransaction(-activeEvent.cost, 'expense');
    } else if (type === 'loan') {
      // Taking an emergency loan (we'll assume Sahukar for max pedagogical impact)
      registerTransaction(activeEvent.cost, 'loan'); 
    }
    // 'bypass' costs nothing
    setActiveEvent(null);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md" />
      
      <div className="relative w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border-4 border-red-500 animate-in zoom-in duration-500">
        <div className="bg-red-500 p-8 text-center text-white">
          <div className="text-5xl mb-4">🚨</div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{activeEvent.title}</h2>
          <p className="text-sm font-bold opacity-90 mt-2">{activeEvent.description}</p>
        </div>

        <div className="p-8 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial Concept</p>
            <p className="text-slate-900 font-bold">{activeEvent.concept}</p>
          </div>

          <div className="space-y-3">
            {/* Resolution Options */}
            {walletBalance >= activeEvent.cost && (
              <button 
                onClick={() => handleResolution('pay')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-transform"
              >
                {language === 'hi' ? `नकद भुगतान करें (₹${activeEvent.cost})` : `Pay with Cash (₹${activeEvent.cost})`}
              </button>
            )}

            {hasBypass() ? (
              <button 
                onClick={() => handleResolution('bypass')}
                className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 border-b-4 border-green-700"
              >
                <span>🛡️</span>
                {language === 'hi' ? "बीमा/योजना का उपयोग करें" : "Use Insurance/Scheme"}
              </button>
            ) : (
              <button 
                onClick={() => handleResolution('loan')}
                className="w-full py-4 bg-red-50 text-red-600 border-2 border-red-200 rounded-2xl font-black text-sm active:scale-95 transition-transform"
              >
                {language === 'hi' ? "आपातकालीन ऋण लें (₹)" : "Take Emergency Loan (₹)"}
              </button>
            )}
          </div>

          <p className="text-center text-[10px] text-slate-400 font-bold italic leading-tight">
            {language === 'hi' 
              ? "आपका फैसला आपकी 'नया साल' की रिपोर्ट को प्रभावित करेगा।" 
              : "Your decision will affect your 'New Year' Epiphany report."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventInterceptor;
 
 
