import React from 'react';
import { useFinancials } from '../context/FinancialContext';

const EpiphanyScreen = ({ language }) => {
  const { 
    totalInterestPaid, 
    bankDebt, 
    sahukarDebt, 
    resetGame,
    arthaScore 
  } = useFinancials();

  // Calculation Logic
  // Assuming a median representative principal of 30k for pedagogical math
  // or using the actual debt if available. 
  // Let's use the totalInterestPaid we've been tracking for Sahukar
  const actualInterest = Math.round(totalInterestPaid);
  
  // Theoretical Bank KCC Interest (4% vs 24%)
  // If they paid 24%, then 4% would be 1/6th of that.
  const theoreticalInterest = Math.round(actualInterest / 6);
  const loss = actualInterest - theoreticalInterest;

  const isSuccess = actualInterest < 1000; // Lesson: Success if interest was kept low

  return (
    <div className="fixed inset-0 z-[4000] bg-slate-950 flex flex-col overflow-y-auto font-sans">
      {/* Header Section */}
      <div className="p-12 text-center">
        <div className="inline-block px-6 py-2 bg-white/10 rounded-full mb-6 border border-white/20">
          <p className="text-white font-black text-xs uppercase tracking-[0.3em]">
            {language === 'hi' ? "१२ महीने पूरे हुए" : "12 MONTHS COMPLETE"}
          </p>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">
          {language === 'hi' ? "आपकी आर्थिक सच्चाई" : "Your Financial Epiphany"}
        </h1>
        <p className="text-slate-400 font-bold max-w-md mx-auto">
          {language === 'hi' 
            ? "एक साल के फैसलों ने आपकी किस्मत कैसे बदली?" 
            : "How did a year of decisions change your destiny, beta?"}
        </p>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 pb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Actual Reality (Red) */}
        <div className="bg-red-950/40 border-2 border-red-500/50 rounded-[48px] p-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-4xl mb-6">💰</div>
          <p className="text-red-400 font-black uppercase text-[10px] tracking-widest mb-1">
            {language === 'hi' ? "साहूकार को दिया ब्याज" : "INTEREST PAID TO SAHUKAR"}
          </p>
          <h2 className="text-5xl font-black text-red-500 tabular-nums">₹{actualInterest.toLocaleString()}</h2>
          <div className="mt-8 p-4 bg-red-500/10 rounded-2xl text-center border border-red-500/20">
            <p className="text-red-400 text-xs font-bold italic leading-relaxed">
              {language === 'hi' 
                ? "यह पैसा आपकी जेब से हमेशा के लिए चला गया।" 
                : "This money is gone from your pocket forever, beta."}
            </p>
          </div>
        </div>

        {/* The Smart Reality (Green) */}
        <div className="bg-green-950/40 border-2 border-green-500/50 rounded-[48px] p-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-4xl mb-6">🏦</div>
          <p className="text-green-400 font-black uppercase text-[10px] tracking-widest mb-1">
            {language === 'hi' ? "अगर बैंक से लेते (KCC)" : "IF YOU USED BANK (KCC)"}
          </p>
          <h2 className="text-5xl font-black text-green-400 tabular-nums">₹{theoreticalInterest.toLocaleString()}</h2>
          <div className="mt-8 p-4 bg-green-500/10 rounded-2xl text-center border border-green-500/20">
            <p className="text-green-400 text-xs font-bold italic leading-relaxed">
              {language === 'hi' 
                ? "सिर्फ ४% ब्याज पर सरकारी मदद मिलती।" 
                : "Government help was available at only 4% interest."}
            </p>
          </div>
        </div>

        {/* The Ultimate Lesson (Highlight) */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('/assets/pattern_texture.png')] opacity-20" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <h3 className="text-indigo-100 font-black uppercase tracking-[0.2em] text-sm mb-4">
              {language === 'hi' ? "सबसे बड़ा सबक" : "THE ULTIMATE LESSON"}
            </h3>
            <div className="text-white text-3xl md:text-4xl font-black leading-tight mb-6">
              {loss > 0 ? (
                language === 'hi' 
                  ? `गलत फैसले से आपने ₹${loss.toLocaleString()} का नुकसान किया!` 
                  : `Your wrong choice cost you ₹${loss.toLocaleString()} legacy!`
              ) : (
                language === 'hi' 
                  ? "शाबाश! आपने सही वित्तीय फैसले लिए।" 
                  : "Well done! You made wise financial choices, beta."
              )}
            </div>
            <p className="text-indigo-200 font-medium max-w-xl">
              {language === 'hi'
                ? "वित्तीय साक्षरता का मतलब सिर्फ पैसा कमाना नहीं, उसे बचाना भी है। साहूकार से बचें, बैंक से जुड़ें।"
                : "Financial literacy is not just about earning; it's about protecting what you have. Avoid moneylenders, join the bank."}
            </p>
          </div>
        </div>

        {/* Play Again Action */}
        <div className="md:col-span-2 flex justify-center pt-8">
           <button 
             onClick={resetGame}
             className="px-16 py-6 bg-white text-slate-900 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]"
           >
             {language === 'hi' ? "फिर से खेलें" : "PLAY AGAIN"}
           </button>
        </div>
      </div>
    </div>
  );
};

export default EpiphanyScreen;
 
 
