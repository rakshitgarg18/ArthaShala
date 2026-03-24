import { useState } from 'react';
import LanguageSelector from './LanguageSelector';
import ProfileSelector from './ProfileSelector';
import SimulationMap from './SimulationMap';
import { useFinancials } from '../context/FinancialContext.jsx';
import GyanKendra from './GyanKendra';
import InsightScreen from './InsightScreen';

export default function GameController() {
  const [onboardingScreen, setOnboardingScreen] = useState('language');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [insightOutcome, setInsightOutcome] = useState(null); // stores outcome for InsightScreen

  const { 
    language, setLanguage, 
    setFarmerProfile, 
    currentView, setCurrentView,
    activeModuleId, setActiveModuleId,
    completeModule
  } = useFinancials();

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setOnboardingScreen('profile');
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setFarmerProfile({ profession: profile, landSize: 2, incomeGroup: 'medium', name: 'Farmer' });
    setCurrentView('GYAN_KENDRA');
  };

  const handleShowInsight = (outcome) => {
    setInsightOutcome(outcome);
    setCurrentView('INSIGHT');
  };

  const handleInsightDone = () => {
    setInsightOutcome(null);
    completeModule(activeModuleId);
    // Navigate to Gyan Kendra — user can choose another topic
    setCurrentView('GYAN_KENDRA');
  };

  return (
    <div className="h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      {/* ── MOBILE PHONE FRAME ── */}
      <div className="relative w-full h-full max-w-[430px] max-h-[850px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-900 ring-4 ring-slate-800">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-[1000]" />

        {/* ── SCREEN CONTENT ── */}
        <div className="h-full w-full relative overflow-hidden bg-white">

          {/* 1. ONBOARDING */}
          {currentView === 'ONBOARDING' && (
            <>
              {onboardingScreen === 'language' && <LanguageSelector onSelect={handleLanguageSelect} />}
              {onboardingScreen === 'profile' && <ProfileSelector language={language} onSelect={handleProfileSelect} />}
            </>
          )}

          {/* 2. GYAN KENDRA HUB */}
          {currentView === 'GYAN_KENDRA' && (
            <GyanKendra 
              onSelectModule={(id) => {
                setActiveModuleId(id);
                setCurrentView('MAP_DEMO');
              }} 
              onExploreVillage={() => {
                setActiveModuleId(null);
                setCurrentView('MAP_DEMO');
              }}
            />
          )}

          {/* 3. SIMULATION MAP — handles events, decisions, consequences */}
          {currentView === 'MAP_DEMO' && (
            <SimulationMap
              onOpenLedger={() => {}}
              profile={selectedProfile}
              activeModuleId={activeModuleId}
              onModuleComplete={() => completeModule(activeModuleId)}
              onShowInsight={handleShowInsight}
              onBack={() => setCurrentView('GYAN_KENDRA')}
            />
          )}

          {/* 4. INSIGHT SCREEN — explains what happened and what should have been done */}
          {currentView === 'INSIGHT' && (
            <InsightScreen
              outcome={insightOutcome}
              onDone={handleInsightDone}
            />
          )}
        </div>
      </div>
    </div>
  );
}
