import { useState } from 'react';
import LanguageSelector from './LanguageSelector';
import ProfileSelector from './ProfileSelector';
import SimulationMap from './SimulationMap';
import LedgerView from './LedgerView';
import { useFinancials } from '../context/FinancialContext.jsx';
import ProfileSetup from './ProfileSetup';
import GyanKendra from './GyanKendra';
import LessonViewer from './LessonViewer';
import BhavishyaSlider from './BhavishyaSlider';
import learningModules from '../data/learningModules';

export default function GameController() {
  const [onboardingScreen, setOnboardingScreen] = useState('language');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [lastChoice, setLastChoice] = useState(null);

  const { 
    language, setLanguage, 
    setFarmerProfile, 
    currentView, setCurrentView,
    activeModuleId, setActiveModuleId,
    completeModule
  } = useFinancials();

  const activeLesson = learningModules.find(l => l.id === activeModuleId);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setOnboardingScreen('profile');
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setOnboardingScreen('setup');
  };

  const handleProfileComplete = (setupData) => {
    setFarmerProfile({ profession: selectedProfile, ...setupData, name: 'Farmer' });
    setCurrentView('GYAN_KENDRA');
  };

  return (
    <div className="h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      {/* ── MOBILE PHONE FRAME ── */}
      <div className="relative w-full h-full max-w-[430px] max-h-[850px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-900 ring-4 ring-slate-800">
        
        {/* Notch - Decorative */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-[1000]" />

        {/* ── SCREEN CONTENT ── */}
        <div className="h-full w-full relative overflow-hidden bg-white">
          {/* 1. ONBOARDING FLOW */}
          {currentView === 'ONBOARDING' && (
            <>
              {onboardingScreen === 'language' && (
                <LanguageSelector onSelect={handleLanguageSelect} />
              )}
              {onboardingScreen === 'profile' && (
                <ProfileSelector language={language} onSelect={handleProfileSelect} />
              )}
              {onboardingScreen === 'setup' && (
                <ProfileSetup language={language} onProfileComplete={handleProfileComplete} />
              )}
            </>
          )}

          {/* 2. GYAN KENDRA (MODULE HUB) */}
          {currentView === 'GYAN_KENDRA' && (
            <GyanKendra 
              onSelectModule={(id) => {
                setActiveModuleId(id);
                setCurrentView('LESSON');
              }} 
              onExploreVillage={() => {
                setActiveModuleId(null);
                setCurrentView('MAP_DEMO');
              }}
            />
          )}

          {/* 3. LESSON VIEWER (THEORY) */}
          {currentView === 'LESSON' && (
            <LessonViewer 
              lesson={activeLesson}
              onStartDemo={() => setCurrentView('MAP_DEMO')}
            />
          )}

          {/* 4. MAP DEMO (THE PRACTICAL) */}
          {currentView === 'MAP_DEMO' && (
            <SimulationMap
              onOpenLedger={() => {/* Possibly remove ledger or handle differently */}}
              profile={selectedProfile}
              activeModuleId={activeModuleId}
              onChoiceMade={(choice) => {
                setLastChoice(choice);
                setCurrentView('CONSEQUENCE_SLIDER');
              }}
            />
          )}

          {/* 5. CONSEQUENCE SLIDER (THE RESULT) */}
          {currentView === 'CONSEQUENCE_SLIDER' && (
            <BhavishyaSlider 
              lesson={activeLesson}
              choice={lastChoice}
              onComplete={() => completeModule(activeModuleId)}
            />
          )}

          {/* LEDGER (If needed, could be a floating modal or overlay) */}
        </div>
      </div>
    </div>
  );
}
 
 
