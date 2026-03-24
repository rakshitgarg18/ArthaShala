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
    <div className="fixed inset-0 z-[4000] bg-slate-950 flex flex-col overflow-y-auto font-sans custom-scrollbar">
      {/* Header Section - Compacted */}
      <div className="p-6 text-center shrink-0">
        <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full mb-4 border border-white/20">
          <p className="text-white font-black text-[9px] uppercase tracking-widest">
            {language === 'hi' ? "१२ महीने पूरे हुए" : "12 MONTHS COMPLETE"}
          </p>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-2 px-2">
          {language === 'hi' ? "आपकी आर्थिक सच्चाई" : "Your Financial Result"}
        </h1>
        <p className="text-slate-400 font-bold text-xs max-w-xs mx-auto px-4">
          {language === 'hi' 
            ? "एक साल के फैसलों ने आपकी किस्मत कैसे बदली?" 
            : "How did a year of decisions change your destiny?"}
        </p>
      </div>

      <div className="max-w-md mx-auto w-full px-4 pb-12 space-y-4">
        
        {/* Actual Reality (Red) */}
        <div className="bg-red-950/40 border border-red-500/30 rounded-[2rem] p-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-3xl mb-4">💰</div>
          <p className="text-red-400 font-black uppercase text-[9px] tracking-widest mb-1 text-center">
            {language === 'hi' ? "साहूकार को दिया ब्याज" : "INTEREST PAID TO SAHUKAR"}
          </p>
          <h2 className="text-4xl font-black text-red-500 tabular-nums">₹{actualInterest.toLocaleString()}</h2>
          <div className="mt-4 p-3 bg-red-500/10 rounded-xl text-center border border-red-500/20">
            <p className="text-red-400 text-[10px] font-bold italic leading-tight">
              {language === 'hi' 
                ? "यह पैसा आपकी जेब से हमेशा के लिए चला गया।" 
                : "This money is gone from your pocket forever."}
            </p>
          </div>
        </div>

        {/* The Smart Reality (Green) */}
        <div className="bg-green-950/40 border border-green-500/30 rounded-[2rem] p-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-3xl mb-4">🏦</div>
          <p className="text-green-400 font-black uppercase text-[9px] tracking-widest mb-1 text-center">
            {language === 'hi' ? "अगर बैंक से लेते (KCC)" : "IF YOU USED BANK (KCC)"}
          </p>
          <h2 className="text-4xl font-black text-green-400 tabular-nums">₹{theoreticalInterest.toLocaleString()}</h2>
          <div className="mt-4 p-3 bg-green-500/10 rounded-xl text-center border border-green-500/20">
            <p className="text-green-400 text-[10px] font-bold italic leading-tight">
              {language === 'hi' 
                ? "सिर्फ ४% ब्याज पर सरकारी मदद मिलती।" 
                : "Government help was available at only 4% interest."}
            </p>
          </div>
        </div>

        {/* The Ultimate Lesson - Compacted */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('/assets/pattern_texture.png')] opacity-10" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <h3 className="text-indigo-100 font-black uppercase tracking-widest text-[9px] mb-3">
              {language === 'hi' ? "सबसे बड़ा सबक" : "THE ULTIMATE LESSON"}
            </h3>
            <div className="text-white text-xl font-black leading-tight mb-4">
              {loss > 0 ? (
                language === 'hi' 
                  ? `गलत फैसले से आपने ₹${loss.toLocaleString()} का नुकसान किया!` 
                  : `Your wrong choice cost you ₹${loss.toLocaleString()} legacy!`
              ) : (
                language === 'hi' 
                  ? "शाबाश! आपने सही वित्तीय फैसले लिए।" 
                  : "Well done! You made wise financial choices!"
              )}
            </div>
            <p className="text-indigo-200 font-bold text-[11px] leading-tight">
              {language === 'hi'
                ? "वित्तीय साक्षरता का मतलब सिर्फ पैसा कमाना नहीं, उसे बचाना भी है। साहूकार से बचें, बैंक से जुड़ें।"
                : "Financial literacy is also about saving what you have. Avoid moneylenders, join the bank."}
            </p>
          </div>
        </div>

        {/* Play Again Action */}
        <div className="flex justify-center pt-4">
           <button 
             onClick={resetGame}
             className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-base hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
           >
             {language === 'hi' ? "फिर से खेलें" : "PLAY AGAIN"}
           </button>
        </div>
      </div>
    </div>
  );
};

export default EpiphanyScreen;
 
 
