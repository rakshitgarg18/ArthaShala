import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import warnings
warnings.filterwarnings('ignore')

class QuantumFinancialEngine:
    def __init__(self):
        self.simulator = AerSimulator()
        self.n_qubits = 6

    def quantum_random_generator(self, n_samples=100):
        """True quantum randomness for Monte Carlo"""
        qc = QuantumCircuit(4, 4)
        for i in range(4):
            qc.h(i)  # Superposition
        qc.measure(range(4), range(4))

        job = self.simulator.run(qc, shots=n_samples)
        counts = job.result().get_counts()

        randoms = []
        for bits, count in counts.items():
            val = int(bits, 2) / 15.0
            randoms.extend([val] * count)
        return np.array(randoms[:n_samples])

    def encode_financial_state(self, income, expenses, savings, risk, debt, insurance):
        """Quantum amplitude encoding of financial profile"""
        total = np.sqrt(income**2 + expenses**2 + savings**2 + risk**2 + debt**2 + insurance**2)
        if total == 0: total = 1

        qc = QuantumCircuit(self.n_qubits)
        amplitudes = np.array([income, expenses, savings, risk, debt, insurance]) / total

        state = np.zeros(2**self.n_qubits)
        state[:6] = amplitudes
        state = state / np.linalg.norm(state)
        qc.initialize(state, range(self.n_qubits))

        return qc, amplitudes

    def quantum_risk_assessment(self, financial_state):
        """Quantum entanglement-based risk assessment"""
        qc = QuantumCircuit(4, 4)

        qc.ry(financial_state[0] * np.pi, 0)
        qc.ry(financial_state[1] * np.pi, 1)
        qc.ry(financial_state[2] * np.pi, 2)
        qc.ry(financial_state[3] * np.pi, 3)

        qc.cx(0, 1)
        qc.cx(1, 2)
        qc.cx(2, 3)
        qc.cx(3, 0)

        qc.measure(range(4), range(4))

        job = self.simulator.run(qc, shots=1000)
        counts = job.result().get_counts()

        risk = sum(int(bits, 2) * cnt for bits, cnt in counts.items()) / 15000
        return risk

    def quantum_monte_carlo(self, initial_wealth, decisions, months, iterations=300):
        """Quantum-enhanced Monte Carlo simulation"""
        print(f"⚛️ Running Quantum Simulation: {iterations} iterations × {months} months")

        qrandoms = self.quantum_random_generator(iterations * months * 2)
        outcomes = []

        for i in range(iterations):
            wealth = initial_wealth
            trajectory = [wealth]

            for m in range(months):
                idx = (i * months + m) % len(qrandoms)
                market = (qrandoms[idx] - 0.5) * 0.3
                seasonal = np.sin(m * np.pi / 6) * 0.1

                income = decisions['income'] * (1 + seasonal)
                savings_gain = decisions['savings'] * 0.005
                invest_gain = decisions['investment'] * (0.008 + market)
                loan_cost = decisions['loan'] * 0.02
                insurance_cost = decisions['insurance'] * 0.01

                shock_q = qrandoms[(idx + 1) % len(qrandoms)]
                shock = 0
                if shock_q < 0.05:
                    shock = -income * (0.3 if decisions['insurance'] > 0 else 2.0)
                elif shock_q < 0.15:
                    shock = -income * (0.1 if decisions['insurance'] > 0 else 0.5)

                change = income + savings_gain + invest_gain - loan_cost - insurance_cost - decisions['expenses'] + shock
                wealth += change

                if wealth < -income * 3:
                    wealth = -income * 3

                trajectory.append(wealth)

            outcomes.append({'final': wealth, 'traj': trajectory})

        outcomes.sort(key=lambda x: x['final'])
        finals = [o['final'] for o in outcomes]

        return {
            'best': np.percentile(finals, 95),
            'good': np.percentile(finals, 75),
            'median': np.percentile(finals, 50),
            'poor': np.percentile(finals, 25),
            'worst': np.percentile(finals, 5),
            'mean': np.mean(finals),
            'trajectories': [o['traj'] for o in outcomes[:15]],
            'prob_gain': sum(1 for w in finals if w > initial_wealth) / len(finals) * 100,
            'all_finals': finals
        }
 
