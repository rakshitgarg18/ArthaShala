import React, { useState, useEffect, useRef } from 'react';


import { TRANSLATIONS } from '../data/translations';
import { useFinancials } from '../context/FinancialContext.jsx';
import { LOCATIONS, ACTIONS } from '../data/locations';
import ArthaChacha from './ArthaChacha';
import BoloEngine from './BoloEngine';
import SchemeEligibilityReport from './SchemeEligibilityReport';
import CrisisModal from './CrisisModal';
import learningModules from '../data/learningModules';
import DecisionModal from './DecisionModal';
import OutcomeOverlay from './OutcomeOverlay';
import ArthaScoreDetails from './ArthaScoreDetails';
console.log("SimulationMap: Initializing...");

const MAP_SIZE = 800;

const CategoryColors = {
  residence:   '#607D8B',
  agriculture: '#4CAF50',
  market:      '#FF9800',
  shop:        '#FF9800',
  financial:   '#1976D2',
  service:     '#7B1FA2',
  transport:   '#6D4C41',
};

// ── SUB-COMPONENT: MAP MARKERS (Phase 8 Aesthetic) ──
const MapMarkers = ({ activeLocation, setActiveLocation, language, activeTourStep, highlights }) => {
  return (
    <>
      {Object.entries(LOCATIONS).map(([id, loc]) => {
        const isActive = activeLocation?.id === id;
        const color = CategoryColors[loc.category] || '#94a3b8';
        const isTarget = activeTourStep === 4 && id === 'panchayat';
        const isHighlighted = highlights && highlights.includes(id);
        
        return (
          <button
            key={id}
            className={`absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-[90%] transition-all cursor-pointer ${isActive ? 'scale-125 z-[60]' : 'hover:scale-110 hover:z-[60]'} ${isTarget || isHighlighted ? 'z-[2000]' : 'z-10'}`}
            style={{ left: `${loc.pos.x}%`, top: `${loc.pos.y}%` }}
            onClick={() => setActiveLocation({ id, ...loc })}
          >
            {(isTarget || isHighlighted) && (
              <div className={`absolute top-2 w-14 h-14 ${isHighlighted ? 'bg-amber-400' : 'bg-blue-400'} rounded-full animate-ping opacity-60 pointer-events-none`} />
            )}
            <div className={`relative flex items-center justify-center ${isHighlighted ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-125' : ''}`}>
              <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 24 24" fill={color}>
                <path d="M12 0C7.029 0 3 4.029 3 9c0 5.25 7 13 8.35 14.776a2.053 2.053 0 003.3 0C16 22.001 21 14.25 21 9c0-4.971-4.029-9-9-9z" />
              </svg>
              <div className="absolute top-[6px] text-lg pointer-events-none">{loc.icon}</div>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded shadow-sm border border-slate-200/50">
              <span className="text-[9px] font-black text-slate-800 whitespace-nowrap tracking-wide">
                {language === 'hi' ? (loc.nameHi || loc.name)
                : language === 'mr' ? (loc.nameMr || loc.name)
                : language === 'gu' ? (loc.nameGu || loc.name)
                : language === 'bn' ? (loc.nameBn || loc.name)
                : loc.name}
              </span>
            </div>
          </button>
        );
      })}
    </>
  );
};

export default function SimulationMap({ onOpenLedger, profile, activeModuleId, onChoiceMade }) {
  const { 
    walletBalance, 
    bankDebt, 
    sahukarDebt, 
    arthaScore, 
    language,
    registerTransaction,
    isFirstVisit,
    completeFirstVisit,
    resetGame
  } = useFinancials();

  const [activeLocation, setActiveLocation] = useState(null);
  const [showIntervention, setShowIntervention] = useState(false);
  const [activeTourStep, setActiveTourStep] = useState(profile ? 0 : 1);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [activeOutcome, setActiveOutcome] = useState(null);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [lastDecision, setLastDecision] = useState(null);
  const [showSchemes, setShowSchemes] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  
  // Simulation Step Tracking
  const [simStep, setSimStep] = useState('seed'); // 'seed' | 'fertilizer' | 'transition' | 'harvest'
  const [simChoices, setSimChoices] = useState({ seed: null, fertilizer: null });
  const [timeTransition, setTimeTransition] = useState(null); // null | 'week2' | 'month1' | 'harvest'
  const mapScrollRef = useRef(null);

  useEffect(() => {
    // CAMPAIGN MODE: Trigger Crisis immediately on mount
    if (activeModuleId && activeModuleId !== 'seed_trap') {
      const module = learningModules.find(l => l.id === activeModuleId);
      if (module) {
        setPendingDecision({
          ...module,
          ...module.simulation,
          isCrisis: true
        });
      }
    }
  }, [activeModuleId]);

  useEffect(() => {
    // Auto-scroll to Panchayat during its tour step
    if (activeTourStep === 4 && mapScrollRef.current) {
      // Offset scrolling to center Panchayat (which is at x:50, y:70)
      mapScrollRef.current.scrollTo({ top: MAP_SIZE * 0.5, left: MAP_SIZE * 0.25, behavior: 'smooth' });
    }
  }, [activeTourStep]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const isAutoPaused = !!(activeLocation || showIntervention || pendingDecision || activeTourStep > 0);
  const actualPause = isManualPaused || isAutoPaused;

  const handleAction = (action, locId) => {
    if (action.type === 'scheme') {
      setShowSchemes(true);
      setActiveLocation(null);
      return;
    }

    const isBank = (locId === 'bank');
    const debtType = isBank ? 'bank' : 'sahukar';
    
    // LOAN DECISION HUB
    if (action.type === 'loan' && !pendingDecision) {
      const loanOptions = isBank ? [
        { label: language === 'hi' ? 'KCC लोन लें (४%)' : 'Take KCC Loan (4%)', sublabel: language === 'hi' ? 'सुरक्षित और सस्ता' : 'Safe and affordable', cost: action.amount, debtAdded: action.amount, waste: 0, isGood: true, type: 'loan' },
        { label: language === 'hi' ? 'अभी नहीं' : 'Not now', sublabel: '', cost: 0, debtAdded: 0, waste: 0, isGood: false, type: 'cancel' }
      ] : [
        { label: language === 'hi' ? 'साहूकार से कर्ज लें (२४%)' : 'Take Sahukar Loan (24%)', sublabel: language === 'hi' ? 'जाल में फंस सकते हैं!' : 'Potential debt trap!', cost: action.amount, debtAdded: action.amount, waste: Math.round(action.amount * 0.2), isGood: false, type: 'loan' },
        { label: language === 'hi' ? 'बैंक जाएं (४%)' : 'Go to Bank (4%)', sublabel: language === 'hi' ? 'बेहतर विकल्प' : 'Suggested choice', cost: 0, debtAdded: 0, waste: 0, isGood: true, type: 'nav_bank' }
      ];

      setPendingDecision({
        title: language === 'hi' ? (isBank ? 'बैंक ऋण' : 'साहूकार का कर्ज') : (isBank ? 'Bank Loan' : 'Sahukar Loan'),
        subtitle: language === 'hi' ? 'सोच-समझकर फैसला लें' : 'Choose wisely, beta',
        options: loanOptions,
        action,
        locId
      });
      return;
    }

    // SEED TRAP SCENARIO OVERRIDE
    if (activeModuleId === 'seed_trap') {
      if (locId === 'seed_shop' && simStep === 'seed') {
         setSimChoices(prev => ({ ...prev, seed: action.type }));
         setSimStep('fertilizer');
         setActiveLocation(null);
         return;
      }
      if (locId === 'fertilizer' && simStep === 'fertilizer') {
         setSimChoices(prev => ({ ...prev, fertilizer: action.type }));
         setSimStep('transition');
         setActiveLocation(null);
         startTimeline();
         return;
      }
    }

    const finalAmount = action.amount;
    const finalType = action.type;

    let scoreChange = isBank ? 30 : (locId === 'moneylender' ? -40 : 0);
    registerTransaction(finalAmount, finalType, { scoreChange, debtType });
    setLastDecision({ type: finalType, source: locId });
    setActiveLocation(null); // Close modal on action
    setPendingDecision(null);
    
    if (scoreChange !== 0 || finalType === 'grant') {
       // Transition to Consequence Slider after a brief delay for the feedback overlay
       setTimeout(() => {
         onChoiceMade();
       }, 500);
    }
  };

  const handleDecision = (cost, debtAdded, waste, option) => {
    if (option.type === 'cancel') {
      setPendingDecision(null);
      return;
    }
    if (option.type === 'nav_bank') {
      setPendingDecision(null);
      setActiveLocation({ id: 'bank', ...LOCATIONS.bank });
      return;
    }
    
    // Actually execute the loan
    const { action, locId, isCrisis } = pendingDecision;
    
    if (isCrisis) {
      // Handle Campaign Crisis Choice
      const choice = cost === 'good' ? pendingDecision.choices.good : pendingDecision.choices.bad;
      const scoreChange = choice.arthaChange;
      registerTransaction(0, 'crisis_choice', { scoreChange, meta: { choiceType: cost } });
      setLastDecision({ type: 'crisis', id: activeModuleId, choiceType: cost });
      setPendingDecision(null);
      onChoiceMade(cost); // Pass choice to parent for BhavishyaSlider
      return;
    }

    handleAction({ ...action, amount: cost }, locId);
  };

  const startTimeline = () => {
    setTimeTransition('week2');
    setTimeout(() => setTimeTransition('month1'), 1500);
    setTimeout(() => setTimeTransition('harvest'), 3000);
    setTimeout(() => {
      setTimeTransition(null);
      // Determine Outcome
      let outcome = 'mid';
      const { seed, fertilizer } = simChoices;
      if (seed === 'hybrid_seeds' && fertilizer === 'organic_manure') outcome = 'good'; // Adjusted for actual types
      if (seed === 'hybrid_seeds' && fertilizer === 'fertilizer_bag') outcome = 'good'; 
      if (fertilizer === 'buy_excess_urea') outcome = 'bad';
      
      onChoiceMade(outcome);
    }, 4500);
  };

  const handleVoiceCommand = (intent) => {
    if (intent.action === 'open_node' && intent.target) {
      const loc = LOCATIONS[intent.target];
      if (loc) {
        setActiveLocation({ id: intent.target, ...loc });
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative overflow-hidden font-sans">
      
      {/* ── GLOBAL IMMERSIVE TOUR MASK ── */}
      {activeTourStep > 0 && activeTourStep < 5 && (
        <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-md z-[500] pointer-events-none transition-all duration-500" />
      )}


      {/* ── LIGHT THEME MAP HUD ── */}
      <div className={`relative bg-white px-5 pt-6 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t-[3px] border-slate-100 flex-shrink-0 transition-all duration-500 ${activeTourStep === 2 ? 'z-[600]' : 'z-[100]'}`}>
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          
          {/* Top Info Bar */}
          <div className="flex flex-row items-center justify-between">
             <div className="flex items-center gap-3 bg-slate-100 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-sm">👴</div>
                <span className="font-black text-sm text-slate-800 tracking-tight">Artha Chacha</span>
             </div>
             
             <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-slate-600 font-black text-[10px] uppercase tracking-[0.2em]">{language === 'en' ? 'LIVE' : 'लाइव'}</span>
             </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
             {/* Wallet - Green Theme */}
             <div className={`rounded-[24px] p-3 border-2 transition-all shadow-sm flex flex-col items-center group ${walletBalance < 2000 ? 'bg-red-50 border-red-200 shadow-red-100' : 'bg-green-50/50 border-green-100 shadow-green-100 hover:border-green-400'}`}>
                <span className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${walletBalance < 2000 ? 'text-red-400' : 'text-green-600'}`}>
                  {language === 'en' ? 'WALLET' : 'बटुआ'}
                </span>
                <div className={`font-black text-lg tabular-nums ${walletBalance < 2000 ? 'text-red-600' : 'text-green-700'}`}>
                  ₹{walletBalance.toLocaleString()}
                </div>
             </div>
             
              {/* Artha Score - Indigo Theme */}
              <div 
                className="bg-indigo-50/50 rounded-[24px] p-3 border-2 border-indigo-100 shadow-sm shadow-indigo-100 flex flex-col items-center group hover:border-indigo-400 transition-all cursor-pointer active:scale-95"
                onClick={() => setShowScoreDetails(true)}
              >
                 <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">
                   {language === 'en' ? 'ARTHA SCORE' : 'स्कोर'}
                 </span>
                 <div className="text-indigo-700 font-black text-lg tabular-nums">{arthaScore}</div>
              </div>

             {/* Total Debt - Amber/Red Theme */}
             <div 
               className={`rounded-[24px] p-3 border-2 transition-all shadow-sm flex flex-col items-center cursor-pointer active:scale-95 group ${(bankDebt + sahukarDebt) > 0 ? 'bg-amber-50/50 border-amber-200 shadow-amber-100 hover:border-red-400' : 'bg-slate-50 border-slate-200 shadow-slate-100'}`}
               onClick={onOpenLedger}
             >
                <span className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${(bankDebt + sahukarDebt) > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {language === 'en' ? 'TOTAL DEBT' : 'कुल कर्ज'}
                </span>
                <div className={`font-black text-lg tabular-nums ${(bankDebt + sahukarDebt) > walletBalance ? 'text-red-600' : ((bankDebt + sahukarDebt) > 0 ? 'text-amber-700' : 'text-slate-900')}`}>
                  ₹{(bankDebt + sahukarDebt).toLocaleString()}
                </div>
             </div>
          </div>
          
          {/* Time Tracker Removed */}
        </div>
      </div>

      {/* ── VIBRANT MAP AREA ── */}
      <div ref={mapScrollRef} className={`flex-1 overflow-auto bg-[#F4EBD9] relative cursor-grab active:cursor-grabbing scroll-smooth ${activeTourStep === 4 ? 'z-[600]' : 'z-10'}`}>
         {activeTourStep === 4 && (
            <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-[10] pointer-events-none transition-all duration-500" />
         )}
         <div style={{ position: 'relative', width: MAP_SIZE, height: MAP_SIZE, backgroundColor: '#F4EBD9' }} className="shadow-inner">
           <img 
             src="/assets/village_map.png" 
             alt="Village Map" 
             style={{ width: MAP_SIZE, height: MAP_SIZE }} 
             draggable={false} 
             className="brightness-[1.03] contrast-[1.05] block" 
           />
           {activeTourStep === 4 && (
              <div className="absolute inset-0 bg-slate-900/65 z-[50] pointer-events-none transition-all duration-500" />
           )}
           
           <MapMarkers 
             activeLocation={activeLocation} 
             setActiveLocation={setActiveLocation} 
             language={language}
             activeTourStep={activeTourStep}
              highlights={activeModuleId === 'seed_trap' ? [simStep === 'seed' ? 'seed_shop' : simStep === 'fertilizer' ? 'fertilizer' : ''] : (pendingDecision?.isCrisis ? ['bank', 'moneylender'] : [])} 
           />
         </div>

          {/* Timeline Transition Overlay */}
          {timeTransition && (
            <div className="absolute inset-0 z-[5000] bg-amber-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-6 p-8">
              <div className="text-8xl animate-bounce">
                {timeTransition === 'week2' ? '🌱' : timeTransition === 'month1' ? '🌿' : '🌾'}
              </div>
              <div className="text-center">
                <p className="text-amber-400 font-black uppercase tracking-[0.4em] text-xs mb-2">समय बीत रहा है... / Time Passing...</p>
                <h1 className="text-5xl font-black text-white italic tracking-tighter">
                  {timeTransition === 'week2' ? 'Week 2' : timeTransition === 'month1' ? 'Month 1' : 'Harvest!'}
                </h1>
              </div>
              <div className="flex gap-3 mt-2">
                {['week2','month1','harvest'].map((s) => (
                  <div key={s} className={`h-2 w-12 rounded-full transition-all duration-500 ${s === timeTransition ? 'bg-amber-400 scale-x-125' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
          )}
      </div>

      {/* ── BOLO ENGINE FIXED AT BOTTOM ── */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 ${activeTourStep === 3 ? 'z-[600]' : 'z-[1000]'}`}>
        <BoloEngine 
          onCommand={handleVoiceCommand} 
          activeModal={activeLocation?.id || (showIntervention ? 'intervention' : null) || (activeTourStep > 0 && activeTourStep !== 3 ? 'tour' : null)}
        />
      </div>

      {/* ── ARTHA CHACHA GUIDE ── */}
      <ArthaChacha 
        activeModal={activeLocation?.id || (showIntervention ? 'moneylender' : null)} 
        lastDecision={lastDecision}
        language={language}
        isFirstVisit={isFirstVisit}
        onCompleteTour={completeFirstVisit}
        onStepChange={setActiveTourStep}
      />

      {/* Location Modal (Phase 24 Aesthetic) */}
      {activeLocation && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center p-4" onClick={() => setActiveLocation(null)}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" />
          <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500" onClick={e => e.stopPropagation()}>
            <div className="bg-indigo-600 p-8 text-white flex flex-col items-center relative">
              <button 
                onClick={() => setActiveLocation(null)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
              >
                ✕
              </button>
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-5xl mb-4 border border-white/10 shadow-inner">
                {activeLocation.icon}
              </div>
              <h3 className="text-2xl font-black text-center tracking-tight">
                {language === 'hi' ? activeLocation.nameHi : activeLocation.name}
              </h3>
            </div>
            
            <div className="p-6 bg-slate-50 space-y-3 max-h-[50vh] overflow-y-auto">
              {(ACTIONS[activeLocation.id] || []).map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(action, activeLocation.id)}
                  className="w-full flex items-center p-4 bg-white border-2 border-slate-100 hover:border-blue-200 hover:shadow-md rounded-3xl active:scale-[0.98] transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mr-4 group-hover:bg-blue-50 transition-colors">
                    {action.asset ? (
                      <img src={action.asset} className="w-8 h-8 object-contain drop-shadow-sm" alt="" />
                    ) : (action.icon)}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-black text-slate-800 text-[16px] leading-tight group-hover:text-indigo-600 transition-colors">
                      {t[action.name] || action.name.replace(/_/g, ' ').toUpperCase()}
                    </h4>
                    {action.badge && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest rounded">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  {action.amount !== 0 && (
                    <div className="text-right ml-2 flex flex-col items-end">
                      <span className={`text-base font-black ${action.amount > 0 ? 'text-green-500' : 'text-slate-600'}`}>
                        {action.amount > 0 ? '+' : ''}₹{Math.abs(action.amount)}
                      </span>
                      {action.amountLabel && (
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">{action.amountLabel}</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
              
              {(!ACTIONS[activeLocation.id] || ACTIONS[activeLocation.id].length === 0) && (
                <div className="py-8 text-center text-slate-400 font-bold text-sm">
                  {language === 'hi' ? 'यहाँ कोई विकल्प नहीं है।' : 'No actions available here.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {pendingDecision && (
        pendingDecision.isCrisis ? (
          <CrisisModal 
            lesson={pendingDecision} 
            onChoice={(type) => handleDecision(type)} 
          />
        ) : (
          <DecisionModal 
            {...pendingDecision} 
            onChoose={handleDecision} 
            onClose={() => setPendingDecision(null)} 
          />
        )
      )}

      {showSchemes && (
        <div className="absolute inset-0 z-[3000] bg-slate-900">
          <SchemeEligibilityReport 
            userProfile={profile} 
            language={language}
            onProceed={() => setShowSchemes(false)}
            buttonLabelEn="RETURN TO MAP"
            buttonLabelHi="वापस जाएं"
          />
        </div>
      )}

      {activeOutcome && <OutcomeOverlay {...activeOutcome} language={language} onComplete={() => setActiveOutcome(null)} />}

      {showScoreDetails && (
        <ArthaScoreDetails 
          currentScore={arthaScore}
          walletBalance={walletBalance}
          language={language}
          onClose={() => setShowScoreDetails(false)}
        />
      )}
    </div>
  );
}
 
 
