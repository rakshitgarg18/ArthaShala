import React from 'react';
import GameController from './components/GameController';
import { FinancialProvider } from './context/FinancialContext.jsx';

function App() {
  return (
    <FinancialProvider>
      <GameController />
    </FinancialProvider>
  );
}

export default App;
 
 
