import React, { createContext, useContext, useState, useCallback } from 'react';
import lessonsData from '../data/lessons.json';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [arthaScore, setArthaScore] = useState(50);
  const [wastedWealth, setWastedWealth] = useState(0);
  const [gameState, setGameState] = useState('HUB'); // 'HUB' | 'DECISION' | 'SLIDER_LESSON' | 'END_REPORT'
  
  const currentLesson = lessonsData[currentLessonIndex];
  const currentMonth = currentLesson?.month || 12;

  const makeChoice = useCallback((choiceType) => {
    const choice = choiceType === 'good' ? currentLesson.goodChoice : currentLesson.badChoice;
    
    setArthaScore(prev => {
      const next = prev + choice.arthaChange;
      return Math.min(100, Math.max(0, next));
    });
    
    setWastedWealth(prev => prev + choice.waste);
    setGameState('SLIDER_LESSON');
  }, [currentLesson]);

  const nextMonth = useCallback(() => {
    if (currentLessonIndex < lessonsData.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
      setGameState('HUB');
    } else {
      setGameState('END_REPORT');
    }
  }, [currentLessonIndex]);

  const resetGame = useCallback(() => {
    setCurrentLessonIndex(0);
    setArthaScore(50);
    setWastedWealth(0);
    setGameState('HUB');
  }, []);

  const value = {
    currentMonth,
    arthaScore,
    wastedWealth,
    currentLessonIndex,
    gameState,
    currentLesson,
    makeChoice,
    nextMonth,
    resetGame,
    setGameState
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
 
 
