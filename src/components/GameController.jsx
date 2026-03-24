import { useState } from 'react';
import { useFinancials } from '../context/FinancialContext.jsx';
import LanguageSelector from './LanguageSelector';
import ProfileSelector from './ProfileSelector';
import SimulationMap from './SimulationMap';
import GyanKendra from './GyanKendra';
import InsightScreen from './InsightScreen';
import ProfileSetup from './ProfileSetup';

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
    setOnboardingScreen('setup');
  };

  const handleProfileComplete = (setupData) => {
    setFarmerProfile({ 
      profession: selectedProfile, 
      land: setupData.land, 
      income: setupData.income, 
      name: 'Farmer' 
    });
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
    <div className="h-screen w-full bg-slate-900 flex items-center justify-center overflow-hidden font-sans">
      {/* ── MOBILE PHONE FRAME ── */}
      <div className="relative w-full h-full max-w-[min(430px,100vw)] max-h-[100dvh] bg-white shadow-2xl overflow-hidden sm:rounded-[3rem] sm:border-[8px] border-slate-900 transition-all duration-500">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-[1000]" />

        {/* ── SCREEN CONTENT ── */}
        <div className="h-full w-full relative overflow-hidden bg-white">

          {currentView === 'ONBOARDING' && (
            <>
              {onboardingScreen === 'language' && <LanguageSelector onSelect={handleLanguageSelect} />}
              {onboardingScreen === 'profile' && <ProfileSelector language={language} onSelect={handleProfileSelect} />}
              {onboardingScreen === 'setup' && <ProfileSetup language={language} onProfileComplete={handleProfileComplete} />}
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
