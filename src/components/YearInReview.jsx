import React from 'react';

export default function YearInReview({
  totalIncome = 0,
  totalInterestPaid = 0,
  selectedLoanType = 'sahukar',
  language = 'hi',
  onReset
}) {
  const isHi = language === 'hi';
  const isSahukar = selectedLoanType === 'sahukar';
  
  // Calculate specific values
  const netProfit = totalIncome - totalInterestPaid;
  
  // Static comparative math based on standard parameters
  const actualInterest = totalInterestPaid;
  // If they took a bank loan, actual is the bank interest. 
  // If they took sahukar (60% APR equivalent), KCC (4% APR) would be roughly 1/15th of the interest.
  const bankInterestEquivalent = isSahukar ? Math.round(actualInterest * (4 / 60)) : actualInterest;
  const difference = Math.abs(actualInterest - bankInterestEquivalent);

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-start overflow-y-auto bg-slate-900 animate-in fade-in duration-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ── 1. THE HEADER (The Brutal Truth) ── */}
      <div className={`w-full max-w-md px-6 pt-16 pb-12 shadow-2xl rounded-b-[3rem] ${isSahukar ? 'bg-red-600' : 'bg-green-600'}`}>
        <div className="text-center">
          <span className="text-6xl mb-4 block">{isSahukar ? '⚠️' : '🎉'}</span>
          <h1 className="text-3xl font-black text-white italic tracking-tighter leading-tight mb-3">
            {isSahukar 
              ? (isHi ? 'सावधान! कर्ज ने आपका मुनाफा खा लिया।' : 'Warning! Debt ate your profit.')
              : (isHi ? 'बधाई हो! आपने समझदारी से बचत की।' : 'Congratulations! You saved wisely.')}
          </h1>
          
          <div className="mt-8 bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 text-white">
            <span className="text-xs uppercase tracking-widest font-bold opacity-80 block mb-1">
              {isHi ? 'शुद्ध लाभ (Net Profit)' : 'Net Profit'}
            </span>
            <div className="text-5xl font-black tracking-tighter">
              ₹{netProfit.toLocaleString('en-IN')}
            </div>
            <div className="flex justify-between mt-4 border-t border-white/20 pt-4 text-sm font-bold">
              <span className="opacity-80">{isHi ? 'कुल आय:' : 'Total Income:'} ₹{Math.max(0, totalIncome).toLocaleString('en-IN')}</span>
              <span className="opacity-80">{isHi ? 'कुल ब्याज:' : 'Total Interest:'} ₹{actualInterest.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. THE TIME MACHINE (The Comparative Lesson) ── */}
      <div className="w-full max-w-md px-5 -mt-6 z-10 space-y-4 pb-32">
        
        {/* Card A (Your Choice) */}
        <div className={`p-6 rounded-3xl border-2 shadow-xl ${isSahukar ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${isSahukar ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              {isHi ? 'आपका फैसला' : 'Your Choice'}
            </span>
            <span className="text-2xl">{isSahukar ? '💸' : '🏦'}</span>
          </div>
          <h2 className={`text-xl font-bold mb-1 ${isSahukar ? 'text-red-900' : 'text-green-900'}`}>
            {isSahukar 
              ? (isHi ? 'साहूकार का कर्ज' : 'Moneylender Debt') 
              : (isHi ? 'बैंक का कर्ज' : 'Bank Debt')}
          </h2>
          <p className={`text-2xl font-black tracking-tighter ${isSahukar ? 'text-red-600' : 'text-green-600'}`}>
            {isHi ? '₹' + actualInterest.toLocaleString('en-IN') + ' ब्याज दिया' : 'Paid ₹' + actualInterest.toLocaleString('en-IN') + ' in interest'}
          </p>
        </div>

        {/* The Gap Highlight (Only show if they made a mistake) */}
        {isSahukar && difference > 0 && (
          <div className="relative flex justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-dashed border-red-500/50"></div></div>
            <div className="relative bg-red-600 text-white text-sm font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-red-500/30">
              {isHi ? `आपने ₹${difference.toLocaleString('en-IN')} का नुकसान किया!` : `You lost ₹${difference.toLocaleString('en-IN')}!`}
            </div>
          </div>
        )}

        {/* Card B (The Alternative) */}
        {isSahukar && (
          <div className="p-6 rounded-3xl bg-blue-50 border-2 border-blue-200 shadow-xl opacity-90 scale-[0.98]">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500 text-white">
                {isHi ? 'KCC का विकल्प' : 'The Smart Choice'}
              </span>
              <span className="text-2xl">🏦</span>
            </div>
            <h2 className="text-xl font-bold text-blue-900 mb-1">
              {isHi ? 'बैंक का कर्ज (KCC)' : 'KCC Bank Debt'}
            </h2>
            <p className="text-xl font-bold text-blue-700/80">
              {isHi 
                ? `सिर्फ ₹${bankInterestEquivalent.toLocaleString('en-IN')} ब्याज लगता` 
                : `Would have paid only ₹${bankInterestEquivalent.toLocaleString('en-IN')} in interest`}
            </p>
          </div>
        )}
      </div>

      {/* ── 3. THE ACTION LOOP (Redemption) ── */}
      <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent z-50 text-center flex justify-center">
        <button 
          onClick={onReset}
          className="w-full max-w-sm py-5 bg-white text-slate-900 hover:bg-slate-100 active:scale-95 transition-all rounded-3xl text-xl font-black shadow-[0_0_40px_rgba(255,255,255,0.3)] animate-pulse"
        >
          {isHi ? 'फिर से कोशिश करें' : 'TRY AGAIN'}
        </button>
      </div>
      
    </div>
  );
}
 
 
