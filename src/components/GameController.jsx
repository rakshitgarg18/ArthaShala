import { useState } from 'react';
import LanguageSelector from './LanguageSelector';
import ProfileSelector from './ProfileSelector';
import SimulationMap from './SimulationMap';
import LedgerView from './LedgerView';
import { useFinancials } from '../context/FinancialContext.jsx';
import ProfileSetup from './ProfileSetup';

export default function GameController() {
  const [currentScreen, setCurrentScreen] = useState('language');
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { language, setLanguage, setFarmerProfile } = useFinancials();

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setCurrentScreen('profile');
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setCurrentScreen('setup');
  };

  const handleProfileComplete = (setupData) => {
    setFarmerProfile({ profession: selectedProfile, ...setupData, name: 'Farmer' });
    setCurrentScreen('simulation');
  };

  return (
    <div className="h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      {/* ── MOBILE PHONE FRAME ── */}
      <div className="relative w-full h-full max-w-[430px] max-h-[850px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-900 ring-4 ring-slate-800">
        
        {/* Notch - Decorative */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-[1000]" />

        {/* ── SCREEN CONTENT ── */}
        <div className="h-full w-full relative overflow-hidden bg-white">
          {/* SIMULATION */}
          {currentScreen === 'simulation' && (
            <div className="absolute inset-0 z-10">
              <SimulationMap
                onOpenLedger={() => setCurrentScreen('ledger')}
                profile={selectedProfile}
              />
            </div>
          )}

          {/* LANGUAGE SELECTOR */}
          {currentScreen === 'language' && (
            <div className="absolute inset-0 z-[100]">
              <LanguageSelector onSelect={handleLanguageSelect} />
            </div>
          )}

          {/* PROFILE SELECTOR */}
          {currentScreen === 'profile' && (
            <div className="absolute inset-0 z-[100]">
              <ProfileSelector language={language} onSelect={handleProfileSelect} />
            </div>
          )}

          {/* PROFILE SETUP */}
          {currentScreen === 'setup' && (
            <div className="absolute inset-0 z-[100]">
              <ProfileSetup language={language} onProfileComplete={handleProfileComplete} />
            </div>
          )}

          {/* LEDGER */}
          {currentScreen === 'ledger' && (
            <div className="absolute inset-0 z-[200]">
              <LedgerView
                onBack={() => setCurrentScreen('simulation')}
                language={language}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
 
