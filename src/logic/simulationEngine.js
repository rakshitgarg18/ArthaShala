/**
 * Advanced ArthaShala Quantum Simulation Engine
 * Ported from legacy services/quantum_engine.py
 */

export const simulationEngine = {
  /**
   * Mimics Quantum Amplitude Encoding for a financial state vector
   */
  encodeState: (finances, riskScore) => {
    // Vector: [Income, Expenses, Savings, Risk, Debt, Insurance]
    const state = [
      finances.income || 10000,
      finances.expenses || 4000,
      finances.savings || 1000,
      riskScore || 0.5,
      finances.loan || 0,
      finances.insurance || 0
    ];

    const total = Math.sqrt(state.reduce((sum, val) => sum + val**2, 0)) || 1;
    const amplitudes = state.map(val => val / total);
    
    return amplitudes;
  },

  /**
   * Mimics Quantum Entanglement-based risk assessment
   * CX (CNOT) gate effects: Correlated risks
   */
  assessQuantumRisk: (amplitudes) => {
    // Legacy: CX(0,1), CX(1,2), CX(2,3), CX(3,0)
    // In our case, we correlate Debt (index 4) and Expenses (index 1) with risk (index 3)
    const [income, expenses, savings, risk, debt, insurance] = amplitudes;
    
    // Entanglement effect: Debt increases the volatility of expenses
    const correlationFactor = (debt * expenses * 2) + (risk * (1 - insurance));
    const finalRisk = (risk + correlationFactor) / 2;
    
    return Math.min(Math.max(finalRisk, 0.05), 0.95);
  },

  runSimulation: (initialWealth, decisions, months = 12, iterations = 300) => {
    // Encode the current state
    const amplitudes = simulationEngine.encodeState(decisions, 0.5);
    const quantumRisk = simulationEngine.assessQuantumRisk(amplitudes);

    const outcomes = [];

    for (let i = 0; i < iterations; i++) {
      let wealth = initialWealth;
      let trajectory = [wealth];

      for (let m = 0; m < months; m++) {
        // Quantum-inspired randomness (Pseudo-randomized bitstream)
        const market = (Math.random() - 0.5) * 0.3;
        const seasonal = Math.sin(m * Math.PI / 6) * 0.1;

        const income = decisions.income * (1 + seasonal);
        const savingsGain = decisions.savings * 0.005;
        const investGain = decisions.investment * (0.008 + market);
        const loanCost = decisions.loan * 0.02;
        const insuranceCost = decisions.insurance * 0.01;

        // Shock Logic (Legacy port)
        const shockQ = Math.random();
        let shock = 0;
        
        // Entangled Shock: Probability influenced by quantumRisk
        if (shockQ < (0.05 * (1 + quantumRisk))) {
          // Major Shock
          shock = -income * (decisions.insurance > 0 ? 0.3 : 2.0);
        } else if (shockQ < (0.15 * (1 + quantumRisk/2))) {
          // Minor Shock
          shock = -income * (decisions.insurance > 0 ? 0.1 : 0.5);
        }

        const change = income + savingsGain + investGain - loanCost - insuranceCost - decisions.expenses + shock;
        wealth += (isNaN(change) ? 0 : change);

        // Floor at -3x income
        if (wealth < -income * 3) {
          wealth = -income * 3;
        }

        trajectory.push(wealth);
      }

      outcomes.push({ final: wealth, traj: trajectory });
    }

    // Sort to find percentiles
    outcomes.sort((a, b) => a.final - b.final);
    const finals = outcomes.map(o => o.final);

    const getPercentile = (arr, p) => {
      const idx = Math.floor(arr.length * (p / 100));
      return arr[idx];
    };

    return {
      best: getPercentile(finals, 95),
      good: getPercentile(finals, 75),
      median: getPercentile(finals, 50),
      poor: getPercentile(finals, 25),
      worst: getPercentile(finals, 5),
      mean: finals.reduce((a, b) => a + b, 0) / finals.length,
      prob_gain: (finals.filter(w => w > initialWealth).length / finals.length) * 100,
      trajectories: outcomes.slice(0, 15).map(o => o.traj)
    };
  }
};
 
 
