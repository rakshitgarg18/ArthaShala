import React, { createContext, useContext, useState } from 'react';
import GuidedMap from './GuidedMap';
import OpportunityCost from './OpportunityCost';

// ─── GAME STATE CONTEXT ────────────────────────────────────────────────────
const GameStateContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useGameState = () => useContext(GameStateContext);

// ─── INITIAL STATE ─────────────────────────────────────────────────────────
const INITIAL_STATE = {
  step: 1,       // 1, 2, 3 = map decisions; 4 = epiphany
  wallet: 5000,
  debt: 0,
  wastedMoney: 0,
};

// ═══════════════════════════════════════════════════════════════════════════
export default function GuidedGameController() {
  const [state, setState] = useState(INITIAL_STATE);

  // Core decision function — fired by each DecisionModal choice
  // cost:       amount deducted from wallet (negative adds to debt if wallet < 0)
  // debtAdded:  amount added to debt
  // waste:      the opportunity cost of this decision
  const makeDecision = (cost, debtAdded, waste) => {
    setState(prev => {
      let newWallet = prev.wallet + cost;          // cost is negative for spending
      let newDebt = prev.debt + debtAdded;

      // If wallet goes negative, convert overflow to debt
      if (newWallet < 0) {
        newDebt += Math.abs(newWallet);
        newWallet = 0;
      }

      return {
        step: prev.step + 1,
        wallet: newWallet,
        debt: newDebt,
        wastedMoney: prev.wastedMoney + waste,
      };
    });
  };

  const resetGame = () => setState(INITIAL_STATE);

  return (
    <GameStateContext.Provider value={{ ...state, makeDecision, resetGame }}>
      <div className="h-screen w-full overflow-hidden relative bg-[#FDFAF4]"
           style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {state.step < 4
          ? <GuidedMap />
          : <OpportunityCost />
        }
      </div>
    </GameStateContext.Provider>
  );
}
 
 
