import React, { createContext, useContext, useState, useCallback } from 'react';

const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  // ── CORE STATE ──────────────────────────
  const [farmerProfile, setFarmerProfile] = useState({ name: '', landSize: 0, incomeGroup: 'medium' });
  const [walletBalance, setWalletBalance] = useState(10000);
  const [bankDebt, setBankDebt] = useState(0);
  const [sahukarDebt, setSahukarDebt] = useState(5000);
  const [arthaScore, setArthaScore] = useState(650);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [language, setLanguage] = useState('hi');
  const [claimedSchemes, setClaimedSchemes] = useState([]);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);
  const [stingTriggered, setStingTriggered] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // ── EPIPHANY ENGINE: SILENT MISTAKE TRACKER ──
  const [mistakeTracker, setMistakeTracker] = useState({
    sahukarInterest: 0,
    uninsuredCropLoss: 0,
    medicalOutOfPocket: 0,
    distressSellLoss: 0,
    fertilizerWaste: 0,
  });

  const BANK_INTEREST = 0.04;    // 4% Annual
  const SAHUKAR_INTEREST = 0.24; // 24% Annual

  // Log a financial mistake silently into the tracker
  const logMistake = useCallback((key, amount) => {
    setMistakeTracker(prev => ({ ...prev, [key]: (prev[key] || 0) + amount }));
  }, []);

  const advanceMonth = useCallback(() => {
    const bankInterestMonthly = (bankDebt * BANK_INTEREST) / 12;
    const sahukarInterestMonthly = (sahukarDebt * SAHUKAR_INTEREST) / 12;

    // Silently log the Sahukar interest bleed as a mistake
    if (sahukarDebt > 0) {
      setStingTriggered(true);
      setTimeout(() => setStingTriggered(false), 1200);
      setTotalInterestPaid(prev => prev + sahukarInterestMonthly);
      // Log Sahukar interest as a mistake silently
      logMistake('sahukarInterest', Math.round(sahukarInterestMonthly));
    }

    setWalletBalance(prev => Math.round(prev - bankInterestMonthly - sahukarInterestMonthly));
    setBankDebt(prev => Math.round(prev + bankInterestMonthly));
    setSahukarDebt(prev => Math.round(prev + sahukarInterestMonthly));
    setCurrentMonth(prev => prev + 1);
  }, [bankDebt, sahukarDebt, logMistake]);

  const registerTransaction = useCallback((amount, type, options = {}) => {
    setWalletBalance(prev => prev + amount);
    
    // Handle Debt Logic
    if (type === 'loan') {
      if (options.debtType === 'bank') setBankDebt(prev => prev + Math.abs(amount));
      else setSahukarDebt(prev => prev + Math.abs(amount));
      
      if (amount > 0) setArthaScore(prev => Math.max(0, prev - 30));
    }
    
    if (type === 'loan_repay') {
      const repayAmount = Math.abs(amount);
      if (options.debtType === 'bank') setBankDebt(prev => Math.max(0, prev - repayAmount));
      else setSahukarDebt(prev => Math.max(0, prev - repayAmount));
      
      setArthaScore(prev => Math.min(1000, prev + 40));
    }
  }, []);

  const claimScheme = useCallback((amount, schemeId) => {
    setWalletBalance(prev => prev + amount);
    setClaimedSchemes(prev => [...prev, schemeId]);
    setArthaScore(prev => Math.min(1000, prev + 25));
  }, []);

  const resetGame = useCallback(() => {
    setWalletBalance(farmerProfile.incomeGroup === 'poor' ? 5000 : 15000);
    setBankDebt(0);
    setSahukarDebt(5000);
    setArthaScore(650);
    setCurrentMonth(1);
    setTotalInterestPaid(0);
    setClaimedSchemes([]);
    setMistakeTracker({
      sahukarInterest: 0,
      uninsuredCropLoss: 0,
      medicalOutOfPocket: 0,
      distressSellLoss: 0,
      fertilizerWaste: 0,
    });
  }, [farmerProfile]);

  const completeFirstVisit = useCallback(() => setIsFirstVisit(false), []);

  const value = {
    farmerProfile, setFarmerProfile,
    walletBalance, setWalletBalance,
    bankDebt, setBankDebt,
    sahukarDebt, setSahukarDebt,
    arthaScore, setArthaScore,
    currentMonth, setCurrentMonth,
    language, setLanguage,
    totalInterestPaid,
    claimedSchemes,
    stingTriggered,
    isFirstVisit,
    mistakeTracker,
    logMistake,
    advanceMonth,
    registerTransaction,
    claimScheme,
    resetGame,
    completeFirstVisit,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFinancials = () => {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancials must be used within a FinancialProvider');
  return context;
};
 
 
