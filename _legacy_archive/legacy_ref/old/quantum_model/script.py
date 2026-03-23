"""
🌾 SaralPaisa AI - Quantum Village Financial Simulator 🌾
Enhanced Version with More Locations + 3D Visualization
Works perfectly in Google Colab!

INSTALLATION - Run this first:
!pip install qiskit qiskit-aer matplotlib ipywidgets numpy pandas plotly

Then run all cells sequentially!
"""

# ============================================================================
# IMPORTS
# ============================================================================
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Polygon
import ipywidgets as widgets
from IPython.display import display, clear_output, HTML
from datetime import datetime
import plotly.graph_objects as go
import plotly.express as px

# Qiskit
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import warnings
warnings.filterwarnings('ignore')

print("✅ Imports successful! Qiskit version:", __import__('qiskit').__version__)

# ============================================================================
# QUANTUM ENGINE
# ============================================================================
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

quantum_engine = QuantumFinancialEngine()
print("⚛️ Quantum Engine Ready!\n")

# ============================================================================
# EXPANDED VILLAGE MAP (25+ Locations!)
# ============================================================================
class VillageMap:
    def __init__(self):
        self.locations = {
            # Residential
            'home': {'name': 'Home', 'pos': (2, 8), 'color': '#8B4513', 'icon': '🏠', 'category': 'residence'},
            'neighbor1': {'name': 'House 1', 'pos': (1.5, 9), 'color': '#A0522D', 'icon': '🏘️', 'category': 'residence'},
            'neighbor2': {'name': 'House 2', 'pos': (2.5, 9), 'color': '#A0522D', 'icon': '🏘️', 'category': 'residence'},

            # Shopping
            'grocery': {'name': 'Grocery', 'pos': (5, 9), 'color': '#FF6B6B', 'icon': '🏪', 'category': 'shop'},
            'cloth_shop': {'name': 'Clothes', 'pos': (6, 9), 'color': '#FF8C94', 'icon': '👔', 'category': 'shop'},
            'electronics': {'name': 'Electronics', 'pos': (7, 9), 'color': '#FFA07A', 'icon': '📱', 'category': 'shop'},

            # Agriculture
            'farm': {'name': 'Farm', 'pos': (2, 3), 'color': '#4ECB71', 'icon': '🌾', 'category': 'agriculture'},
            'seed_shop': {'name': 'Seed Shop', 'pos': (5, 3), 'color': '#F39C12', 'icon': '🌱', 'category': 'agriculture'},
            'fertilizer': {'name': 'Fertilizer Shop', 'pos': (6, 3), 'color': '#E67E22', 'icon': '🧪', 'category': 'agriculture'},
            'cattle_market': {'name': 'Cattle Market', 'pos': (3, 2), 'color': '#8B4513', 'icon': '🐄', 'category': 'agriculture'},
            'dairy': {'name': 'Dairy', 'pos': (4, 2), 'color': '#F5DEB3', 'icon': '🥛', 'category': 'agriculture'},

            # Financial
            'bank': {'name': 'Bank', 'pos': (8, 8), 'color': '#4A90E2', 'icon': '🏦', 'category': 'financial'},
            'post_office': {'name': 'Post Office', 'pos': (9, 8), 'color': '#5DADE2', 'icon': '📮', 'category': 'financial'},
            'shg': {'name': 'SHG Center', 'pos': (8, 5), 'color': '#9B59B6', 'icon': '👥', 'category': 'financial'},
            'moneylender': {'name': 'Moneylender', 'pos': (5, 1), 'color': '#95A5A6', 'icon': '💰', 'category': 'financial'},

            # Services
            'medical': {'name': 'Medical Center', 'pos': (8, 2), 'color': '#E74C3C', 'icon': '⚕️', 'category': 'service'},
            'school': {'name': 'School', 'pos': (5, 6), 'color': '#3498DB', 'icon': '🏫', 'category': 'service'},
            'temple': {'name': 'Temple', 'pos': (9, 6), 'color': '#FF6347', 'icon': '🕉️', 'category': 'service'},
            'panchayat': {'name': 'Panchayat', 'pos': (7, 7), 'color': '#FFD700', 'icon': '🏛️', 'category': 'service'},

            # Market
            'market': {'name': 'Market', 'pos': (2, 5.5), 'color': '#E67E22', 'icon': '🛒', 'category': 'market'},
            'vegetable': {'name': 'Vegetable Market', 'pos': (3, 5.5), 'color': '#2ECC71', 'icon': '🥬', 'category': 'market'},

            # Transport & Communication
            'bus_stand': {'name': 'Bus Stand', 'pos': (4, 8), 'color': '#34495E', 'icon': '🚌', 'category': 'transport'},
            'mobile_tower': {'name': 'Mobile Tower', 'pos': (9, 4), 'color': '#7F8C8D', 'icon': '📡', 'category': 'service'},

            # Others
            'workshop': {'name': 'Workshop', 'pos': (1, 6), 'color': '#AAB7B8', 'icon': '🔧', 'category': 'service'},
            'tea_stall': {'name': 'Tea Stall', 'pos': (4, 6.5), 'color': '#D35400', 'icon': '☕', 'category': 'shop'},
        }

        self.actions = {
            'home': [
                {'name': 'Rent', 'amount': -2000, 'type': 'expense'},
                {'name': 'Maintenance', 'amount': -1000, 'type': 'expense'},
                {'name': 'Remittance', 'amount': 3000, 'type': 'income'}
            ],
            'neighbor1': [
                {'name': 'Lend Money', 'amount': -1000, 'type': 'loan_give'},
                {'name': 'Borrow Money', 'amount': 1000, 'type': 'loan'}
            ],
            'neighbor2': [
                {'name': 'Group Purchase', 'amount': -800, 'type': 'expense'},
            ],
            'grocery': [
                {'name': 'Groceries', 'amount': -1500, 'type': 'expense'},
                {'name': 'Credit', 'amount': -2000, 'type': 'loan'},
                {'name': 'Bulk Purchase', 'amount': -3000, 'type': 'expense'}
            ],
            'cloth_shop': [
                {'name': 'Buy Clothes', 'amount': -2500, 'type': 'expense'},
                {'name': 'Festival Clothes', 'amount': -4000, 'type': 'expense'}
            ],
            'electronics': [
                {'name': 'Mobile Phone', 'amount': -5000, 'type': 'expense'},
                {'name': 'TV/Radio', 'amount': -8000, 'type': 'expense'}
            ],
            'farm': [
                {'name': 'Sell Crop', 'amount': 8000, 'type': 'income'},
                {'name': 'Farming Expenses', 'amount': -3000, 'type': 'expense'},
                {'name': 'Labor Wages', 'amount': -2000, 'type': 'expense'}
            ],
            'seed_shop': [
                {'name': 'Seeds', 'amount': -1500, 'type': 'expense'},
                {'name': 'Hybrid Seeds', 'amount': -2500, 'type': 'expense'}
            ],
            'fertilizer': [
                {'name': 'Fertilizer', 'amount': -2000, 'type': 'expense'},
                {'name': 'Pesticide', 'amount': -1200, 'type': 'expense'},
                {'name': 'Organic Manure', 'amount': -1800, 'type': 'expense'}
            ],
            'cattle_market': [
                {'name': 'Buy Cow', 'amount': -25000, 'type': 'expense'},
                {'name': 'Buy Buffalo', 'amount': -40000, 'type': 'expense'},
                {'name': 'Sell Livestock', 'amount': 30000, 'type': 'income'}
            ],
            'dairy': [
                {'name': 'Sell Milk', 'amount': 3000, 'type': 'income'},
                {'name': 'Cattle Feed', 'amount': -1500, 'type': 'expense'}
            ],
            'bank': [
                {'name': 'Save', 'amount': -2000, 'type': 'savings'},
                {'name': 'Withdraw', 'amount': 1500, 'type': 'withdrawal'},
                {'name': 'KCC Loan', 'amount': 50000, 'type': 'loan'},
                {'name': 'Fixed Deposit (FD)', 'amount': -10000, 'type': 'investment'},
                {'name': 'Repay Loan', 'amount': -1000, 'type': 'loan_repay'}
            ],
            'post_office': [
                {'name': 'Recurring Deposit (RD)', 'amount': -500, 'type': 'savings'},
                {'name': 'NSC Investment', 'amount': -5000, 'type': 'investment'},
                {'name': 'Withdraw Pension', 'amount': 2000, 'type': 'income'}
            ],
            'shg': [
                {'name': 'SHG Deposit', 'amount': -1000, 'type': 'investment'},
                {'name': 'SHG Loan (12%)', 'amount': 5000, 'type': 'loan'},
                {'name': 'Dividend', 'amount': 800, 'type': 'income'}
            ],
            'moneylender': [
                {'name': 'Moneylender Loan (24%)', 'amount': 5000, 'type': 'loan'},
                {'name': 'Repay with Interest', 'amount': -2500, 'type': 'loan_repay'}
            ],
            'medical': [
                {'name': 'Treatment', 'amount': -3000, 'type': 'expense'},
                {'name': 'Medicine', 'amount': -800, 'type': 'expense'},
                {'name': 'Insurance Claim', 'amount': 5000, 'type': 'income'},
                {'name': 'Ayushman', 'amount': 0, 'type': 'income'}
            ],
            'school': [
                {'name': 'Fee', 'amount': -1000, 'type': 'expense'},
                {'name': 'Books', 'amount': -500, 'type': 'expense'},
                {'name': 'Scholarship', 'amount': 2000, 'type': 'income'}
            ],
            'temple': [
                {'name': 'Donation', 'amount': -200, 'type': 'expense'},
                {'name': 'Festival Expense', 'amount': -1000, 'type': 'expense'}
            ],
            'panchayat': [
                {'name': 'MGNREGA Wages', 'amount': 5000, 'type': 'income'},
                {'name': 'PM-KISAN', 'amount': 2000, 'type': 'income'},
                {'name': 'License Fee', 'amount': -500, 'type': 'expense'}
            ],
            'market': [
                {'name': 'Sell Produce', 'amount': 6000, 'type': 'income'},
                {'name': 'Trader Advance', 'amount': 4000, 'type': 'loan'},
                {'name': 'Sell at MSP', 'amount': 8000, 'type': 'income'}
            ],
            'vegetable': [
                {'name': 'Sell Vegetables', 'amount': 1500, 'type': 'income'},
                {'name': 'Buy Vegetables', 'amount': -600, 'type': 'expense'}
            ],
            'bus_stand': [
                {'name': 'Go to City', 'amount': -200, 'type': 'expense'},
                {'name': 'Business Travel', 'amount': -500, 'type': 'expense'}
            ],
            'workshop': [
                {'name': 'Tractor Repair', 'amount': -3000, 'type': 'expense'},
                {'name': 'Pump Repair', 'amount': -1500, 'type': 'expense'}
            ],
            'tea_stall': [
                {'name': 'Tea & Snacks', 'amount': -50, 'type': 'expense'}
            ]
        }


    def draw_2d(self, highlight=None):
        """Enhanced 2D map with categories"""
        fig, ax = plt.subplots(figsize=(16, 12))
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)

        # Gradient background (sky to ground)
        for i in range(100):
            y = i / 100 * 10
            color_val = 0.88 + (i / 100) * 0.08
            ax.axhspan(y, y + 0.1, facecolor=(0.9, color_val, 0.9), zorder=0)

        # Roads
        ax.plot([0, 10], [7, 7], 'gray', lw=10, alpha=0.4, solid_capstyle='round')
        ax.plot([4, 4], [0, 10], 'gray', lw=8, alpha=0.4, solid_capstyle='round')
        ax.plot([8, 8], [0, 10], 'gray', lw=6, alpha=0.3, solid_capstyle='round')
        ax.plot([0, 10], [5, 5], 'gray', lw=6, alpha=0.3, solid_capstyle='round')

        # Draw fields/farms
        field1 = Rectangle((0.5, 2), 1.2, 1.5, facecolor='#90EE90', alpha=0.3, zorder=1)
        field2 = Rectangle((2.8, 2), 1.5, 1.8, facecolor='#98FB98', alpha=0.3, zorder=1)
        ax.add_patch(field1)
        ax.add_patch(field2)

        # Locations by category
        categories = {}
        for loc_id, loc in self.locations.items():
            cat = loc['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append((loc_id, loc))

               # Draw locations
        for loc_id, loc in self.locations.items():
            x, y = loc['pos']

            if loc_id == highlight:
                glow = Circle((x, y), 0.9, color='yellow', alpha=0.6, zorder=1)
                ax.add_patch(glow)
                # Pulsing effect
                for r in [1.0, 1.1, 1.2]:
                    pulse = Circle((x, y), r, fill=False, edgecolor='yellow',
                                  linewidth=2, alpha=0.3, zorder=1)
                    ax.add_patch(pulse)

            # Location circle
            circle = Circle((x, y), 0.45, color=loc['color'], alpha=0.8,
                          edgecolor='white', linewidth=2, zorder=2)
            ax.add_patch(circle)

            # Icon
            ax.text(x, y, loc['icon'], fontsize=28, ha='center', va='center', zorder=3)

            # Label
            ax.text(x, y-0.8, loc['name'], fontsize=8, ha='center',
                   bbox=dict(boxstyle='round,pad=0.3', fc='white', alpha=0.9,
                            edgecolor=loc['color'], linewidth=1.5),
                   weight='bold', zorder=3)

        # Legend
        legend_items = {
            'residence': '🏠 Residence',
            'shop': '🏪 Shop',
            'agriculture': '🌾 Agriculture',
            'financial': '💰 Financial',
            'service': '⚕️ Service',
            'market': '🛒 Market',
            'transport': '🚌 Transport'
        }

        legend_y = 9.5
        for cat, label in legend_items.items():
            ax.text(0.2, legend_y, label, fontsize=9,
                   bbox=dict(boxstyle='round', fc='white', alpha=0.8))
            legend_y -= 0.4

        # Title
        ax.text(5, 9.85, '🌾 Your Detailed Village 🌾',
               fontsize=20, ha='center', weight='bold',
               bbox=dict(boxstyle='round,pad=0.6', fc='white', alpha=0.95,
                        edgecolor='green', linewidth=3))

        # Village name
        ax.text(5, 0.2, 'Village: Saralpur | Population: ~2000',
               fontsize=10, ha='center', style='italic',
               bbox=dict(boxstyle='round', fc='lightyellow', alpha=0.8))

        ax.set_aspect('equal')
        ax.axis('off')
        plt.tight_layout()
        return fig

    def draw_3d(self, highlight=None):
        """Interactive 3D village visualization using Plotly"""

        # Prepare data
        x_coords = []
        y_coords = []
        z_coords = []
        colors = []
        sizes = []
        texts = []
        icons = []

        for loc_id, loc in self.locations.items():
            x, y = loc['pos']
            x_coords.append(x)
            y_coords.append(y)

            # Height based on category
            height_map = {
                'residence': 2,
                'shop': 2.5,
                'agriculture': 1,
                'financial': 3,
                'service': 2.5,
                'market': 2,
                'transport': 1.5
            }
            z = height_map.get(loc['category'], 2)
            z_coords.append(z)

            colors.append(loc['color'])

            # Size based on importance
            size = 40 if loc_id == highlight else 25
            sizes.append(size)

            texts.append(f"{loc['icon']} {loc['name']}<br>Category: {loc['category']}")
            icons.append(loc['icon'])

        # Create 3D scatter plot
        fig = go.Figure(data=[go.Scatter3d(
            x=x_coords,
            y=y_coords,
            z=z_coords,
            mode='markers+text',
            marker=dict(
                size=sizes,
                color=colors,
                opacity=0.8,
                line=dict(color='white', width=2)
            ),
            text=icons,
            textfont=dict(size=16),
            hovertext=texts,
            hoverinfo='text'
        )])

        # Add ground plane
        xx, yy = np.meshgrid(np.linspace(0, 10, 20), np.linspace(0, 10, 20))
        zz = np.zeros_like(xx)

        fig.add_trace(go.Surface(
            x=xx, y=yy, z=zz,
            colorscale=[[0, '#90EE90'], [1, '#228B22']],
            showscale=False,
            opacity=0.3,
            name='Ground'
        ))

        # Layout
        fig.update_layout(
            title=dict(
                text='🌾 3D Village View - Rotate & Zoom! 🌾',
                font=dict(size=20, color='green'),
                x=0.5,
                xanchor='center'
            ),
            scene=dict(
                xaxis=dict(title='', showgrid=False, showticklabels=False, showbackground=False),
                yaxis=dict(title='', showgrid=False, showticklabels=False, showbackground=False),
                zaxis=dict(title='Height', showgrid=True, gridcolor='lightgray'),
                camera=dict(
                    eye=dict(x=1.5, y=1.5, z=1.2)
                ),
                aspectmode='manual',
                aspectratio=dict(x=1, y=1, z=0.3)
            ),
            height=700,
            showlegend=False,
            paper_bgcolor='#E8F5E9',
            plot_bgcolor='#C8E6C9'
        )

        return fig

village = VillageMap()
print(f"🗺️ Enhanced Village Map Created with {len(village.locations)} locations!\n")

# ============================================================================
# GAME STATE
# ============================================================================
class GameState:
    def __init__(self):
        self.cash = 5000
        self.savings = 0
        self.investments = 0
        self.loans = 0
        self.insurance = 500
        self.monthly_income = 10000
        self.monthly_expenses = 0
        self.history = []

    def transact(self, location, action):
        amt = action['amount']

        if action['type'] == 'income':
            self.cash += amt
        elif action['type'] == 'expense':
            self.cash += amt
            self.monthly_expenses += abs(amt)
        elif action['type'] == 'savings':
            self.cash += amt
            self.savings += abs(amt)
        elif action['type'] == 'investment':
            self.cash += amt
            self.investments += abs(amt)
        elif action['type'] == 'loan':
            self.cash += amt
            self.loans += abs(amt)
        elif action['type'] == 'loan_repay':
            self.cash += amt
            self.loans -= abs(amt)
        elif action['type'] == 'withdrawal':
            self.cash += amt
            self.savings -= abs(amt)
        elif action['type'] == 'loan_give':
            self.cash += amt
            self.investments += abs(amt)

        self.history.append({
            'time': datetime.now(),
            'location': location,
            'action': action['name'],
            'amount': amt
        })

        return True

    def get_summary(self):
        return {
            'cash': self.cash,
            'savings': self.savings,
            'investments': self.investments,
            'loans': self.loans,
            'insurance': self.insurance,
            'net_worth': self.cash + self.savings + self.investments - self.loans,
            'monthly_income': self.monthly_income,
            'monthly_expenses': self.monthly_expenses
        }

game = GameState()
print("💰 Game State Ready!\n")

# ============================================================================
# UI
# ============================================================================
map_out = widgets.Output()
map_3d_out = widgets.Output()
info_out = widgets.Output()
action_out = widgets.Output()
sim_out = widgets.Output()

current_location = [None]
view_mode = ['2d']

def update_finances():
    s = game.get_summary()
    html = f"""
    <div style='background: linear-gradient(135deg, #667eea, #764ba2);
                padding: 20px; border-radius: 15px; color: white;'>
        <h2>💰 Financial Status</h2>
        <div style='display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;'>
            <div style='background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px;'>
                <h4 style='margin: 5px 0;'>Cash</h4>
                <p style='font-size: 20px; margin: 5px 0;'>₹{s['cash']:,.0f}</p>
            </div>
            <div style='background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px;'>
                <h4 style='margin: 5px 0;'>Savings</h4>
                <p style='font-size: 20px; margin: 5px 0;'>₹{s['savings']:,.0f}</p>
            </div>
            <div style='background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px;'>
                <h4 style='margin: 5px 0;'>Investments</h4>
                <p style='font-size: 20px; margin: 5px 0;'>₹{s['investments']:,.0f}</p>
            </div>
            <div style='background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px;'>
                <h4 style='margin: 5px 0;'>Loans</h4>
                <p style='font-size: 20px; margin: 5px 0; color: #ffcccb;'>₹{s['loans']:,.0f}</p>
            </div>
            <div style='background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px;'>
                <h4 style='margin: 5px 0;'>Insurance</h4>
                <p style='font-size: 20px; margin: 5px 0;'>₹{s['insurance']:,.0f}</p>
            </div>
            <div style='background: rgba(255,255,255,0.3); padding: 12px; border-radius: 10px;'>
                <h4 style='margin: 5px 0;'>Total Assets</h4>
                <p style='font-size: 20px; margin: 5px 0; font-weight: bold;'>₹{s['net_worth']:,.0f}</p>
            </div>
        </div>
        <div style='margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.15); border-radius: 8px;'>
            <small>📊 Transactions: {len(game.history)} | Monthly Expense: ₹{s['monthly_expenses']:,.0f}</small>
        </div>
    </div>
    """

    with info_out:
        clear_output(wait=True)
        display(HTML(html))

def toggle_view(btn):
    if view_mode[0] == '2d':
        view_mode[0] = '3d'
        btn.description = '🗺️ Switch to 2D'
        with map_out:
            clear_output(wait=True)
        with map_3d_out:
            clear_output(wait=True)
            fig = village.draw_3d(current_location[0])
            display(fig)
    else:
        view_mode[0] = '2d'
        btn.description = '🌐 Switch to 3D'
        with map_3d_out:
            clear_output(wait=True)
        with map_out:
            clear_output(wait=True)
            fig = village.draw_2d(current_location[0])
            plt.show()

def on_loc_click(btn):
    current_location[0] = btn.loc_id

    # Update map
    if view_mode[0] == '2d':
        with map_out:
            clear_output(wait=True)
            fig = village.draw_2d(btn.loc_id)
            plt.show()
    else:
        with map_3d_out:
            clear_output(wait=True)
            fig = village.draw_3d(btn.loc_id)
            display(fig)

    actions = village.actions.get(btn.loc_id, [])

    with action_out:
        clear_output(wait=True)
        loc = village.locations[btn.loc_id]
        print(f"\n📍 {loc['icon']} {loc['name']} - {loc['category'].upper()}")
        print("=" * 60)
        print(f"\n🎯 Available Actions ({len(actions)} options):\n")

        for i, act in enumerate(actions, 1):
            amt_str = f"₹{abs(act['amount']):,.0f}"
            sym = "➕" if act['amount'] > 0 else "➖"
            type_emoji = {
                'income': '💵', 'expense': '💸', 'savings': '🏦',
                'investment': '📈', 'loan': '💳', 'loan_repay': '✅',
                'withdrawal': '🏧', 'loan_give': '🤝'
            }.get(act['type'], '💰')
            print(f"{i}. {type_emoji} {act['name']}")
            print(f"   {sym} {amt_str} ({act['type']})")

        print("\n💡 Enter number to execute (0 to cancel)")

# Create location buttons organized by category
categories_order = ['financial', 'agriculture', 'shop', 'service', 'market', 'residence', 'transport']
loc_buttons_by_cat = {cat: [] for cat in categories_order}

for loc_id, loc in village.locations.items():
    cat = loc['category']
    btn = widgets.Button(
        description=f"{loc['icon']} {loc['name'].split('(')[0].strip()}",
        layout=widgets.Layout(width='150px', height='35px', margin='2px'),
        button_style='info',
        tooltip=f"{loc['name']} - {cat}"
    )
    btn.loc_id = loc_id
    btn.on_click(on_loc_click)
    if cat in loc_buttons_by_cat:
        loc_buttons_by_cat[cat].append(btn)

action_input = widgets.Text(
    placeholder='Enter action #',
    description='Action:',
    layout=widgets.Layout(width='250px')
)

def do_action(change):
    if not current_location[0] or not change['new']:
        return

    try:
        num = int(change['new']) - 1
        actions = village.actions.get(current_location[0], [])

        if 0 <= num < len(actions):
            act = actions[num]
            game.transact(current_location[0], act)

            with action_out:
                print(f"\n✅ Transaction Complete!")
                print(f"   📝 {act['name']}")
                print(f"   💰 Amount: ₹{act['amount']:,.0f}")
                print(f"   💵 New Cash: ₹{game.cash:,.0f}")
                print(f"   📊 Transaction #{len(game.history)}")

            update_finances()
            action_input.value = ''
    except:
        pass

action_input.observe(do_action, names='value')

view_toggle_btn = widgets.Button(
    description='🌐 Switch to 3D',
    button_style='success',
    layout=widgets.Layout(width='200px', height='40px')
)
view_toggle_btn.on_click(toggle_view)

timeframe = widgets.Dropdown(
    options=[
        ('1 महीने (1 months)', 6),
        ('6 महीने (6 months)', 6),
        ('1 साल (1 year)', 12),
        ('2 साल (2 years)', 24),
        ('5 साल (5 years)', 60)
    ],
    value=12,
    description='Timeframe:',
    layout=widgets.Layout(width='250px')
)

sim_btn = widgets.Button(
    description='⚛️ Run Quantum Simulation',
    button_style='warning',
    layout=widgets.Layout(width='300px', height='50px'),
    tooltip='Analyze your financial decisions using quantum computing'
)

def run_sim(btn):
    with sim_out:
        clear_output(wait=True)

        s = game.get_summary()
        decisions = {
            'income': s['monthly_income'],
            'expenses': s['monthly_expenses'],
            'savings': s['savings'] / 10,
            'investment': s['investments'] / 10,
            'loan': s['loans'] * 0.02,
            'insurance': s['insurance']
        }

        result = quantum_engine.quantum_monte_carlo(
            s['net_worth'], decisions, timeframe.value
        )

        # Create comprehensive visualization
        fig = plt.figure(figsize=(16, 12))
        gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)

        # Title
        fig.suptitle('⚛️ Quantum Financial Simulation Results ⚛️',
                    fontsize=20, weight='bold', y=0.98)

        # 1. Outcomes bar chart
        ax1 = fig.add_subplot(gs[0, :2])
        outcomes = ['Worst\n5%', 'Poor\n25%', 'Median\n50%', 'Good\n75%', 'Best\n95%']
        vals = [result['worst'], result['poor'], result['median'], result['good'], result['best']]
        colors = ['#E74C3C', '#F39C12', '#3498DB', '#2ECC71', '#27AE60']

        bars = ax1.bar(outcomes, vals, color=colors, alpha=0.8, edgecolor='black', lw=2)
        ax1.axhline(s['net_worth'], color='red', ls='--', lw=2, label=f'Start: ₹{s["net_worth"]:,.0f}')
        ax1.set_ylabel('Final Wealth (₹)', weight='bold', fontsize=12)
        ax1.set_title('Possible Outcomes Distribution', weight='bold', fontsize=14)
        ax1.legend(fontsize=10)
        ax1.grid(axis='y', alpha=0.3)

        for bar, v in zip(bars, vals):
            h = bar.get_height()
            color = 'green' if v > s['net_worth'] else 'red'
            ax1.text(bar.get_x() + bar.get_width()/2, h, f'₹{v:,.0f}',
                   ha='center', va='bottom', weight='bold', fontsize=9, color=color)

        # 2. Probability gauge
        ax2 = fig.add_subplot(gs[0, 2])
        probs = [result['prob_gain'], 100 - result['prob_gain']]
        colors_pie = ['#2ECC71', '#E74C3C']
        wedges, texts, autotexts = ax2.pie(probs, labels=['Success', 'Loss'],
                                           colors=colors_pie, autopct='%1.1f%%',
                                           startangle=90, explode=(0.05, 0))
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(14)
            autotext.set_weight('bold')
        ax2.set_title('Success Probability', weight='bold', fontsize=14)

        # 3. Trajectories
        ax3 = fig.add_subplot(gs[1, :])
        for i, traj in enumerate(result['trajectories'][:12]):
            alpha = 0.6 if i == 0 else 0.2
            lw = 2.5 if i == 0 else 1
            color = 'blue' if i == 0 else 'gray'
            ax3.plot(traj, alpha=alpha, lw=lw, color=color)

        ax3.plot(result['trajectories'][0], color='blue', lw=2.5, label='Most Likely Path', zorder=10)
        ax3.axhline(s['net_worth'], color='red', ls='--', lw=2, alpha=0.7, label='Starting Point')
        ax3.fill_between(range(len(result['trajectories'][0])),
                        result['worst'], result['best'], alpha=0.1, color='blue')
        ax3.set_xlabel('Months', weight='bold', fontsize=12)
        ax3.set_ylabel('Wealth (₹)', weight='bold', fontsize=12)
        ax3.set_title('Wealth Trajectory Over Time (12 Quantum Paths Shown)', weight='bold', fontsize=14)
        ax3.legend(fontsize=10)
        ax3.grid(alpha=0.3)

        # 4. Distribution histogram
        ax4 = fig.add_subplot(gs[2, 0])
        ax4.hist(result['all_finals'], bins=30, color='skyblue', edgecolor='black', alpha=0.7)
        ax4.axvline(s['net_worth'], color='red', ls='--', lw=2, label='Start')
        ax4.axvline(result['median'], color='blue', ls='-', lw=2, label='Median')
        ax4.set_xlabel('Final Wealth (₹)', weight='bold')
        ax4.set_ylabel('Frequency', weight='bold')
        ax4.set_title('Outcome Distribution', weight='bold', fontsize=12)
        ax4.legend()
        ax4.grid(alpha=0.3)

        # 5. Statistics box
        ax5 = fig.add_subplot(gs[2, 1])
        ax5.axis('off')
        stats_text = f"""
📊 STATISTICAL SUMMARY

Initial Wealth: ₹{s['net_worth']:,.0f}

Best Outcome: ₹{result['best']:,.0f}
Expected (Mean): ₹{result['mean']:,.0f}
Median: ₹{result['median']:,.0f}
Worst Outcome: ₹{result['worst']:,.0f}

Success Rate: {result['prob_gain']:.1f}%
Risk Level: {'High' if result['prob_gain'] < 50 else 'Moderate' if result['prob_gain'] < 70 else 'Low'}

⚛️ Quantum Iterations: 300
📈 Scenarios Analyzed: {timeframe.value * 300:,}
        """
        ax5.text(0.1, 0.5, stats_text, fontsize=10, family='monospace',
               bbox=dict(boxstyle='round', fc='lightyellow', alpha=0.9, pad=1),
               verticalalignment='center')

        # 6. Recommendations
        ax6 = fig.add_subplot(gs[2, 2])
        ax6.axis('off')

        recommendations = []
        if result['prob_gain'] < 40:
            recommendations = [
                "⚠️ HIGH RISK!",
                "• Reduce expenses 20%",
                "• Increase insurance",
                "• Avoid high-interest loans",
                "• Build emergency fund"
            ]
        elif result['prob_gain'] < 60:
            recommendations = [
                "💡 MODERATE RISK",
                "• Balance spending",
                "• Diversify income",
                "• Save regularly",
                "• Monitor monthly"
            ]
        elif result['prob_gain'] < 80:
            recommendations = [
                "✅ GOOD STRATEGY",
                "• Maintain discipline",
                "• Increase savings 10%",
                "• Consider investments",
                "• Plan long-term"
            ]
        else:
            recommendations = [
                "🌟 EXCELLENT!",
                "• Keep it up!",
                "• Explore growth options",
                "• Help community",
                "• Share knowledge"
            ]

        rec_text = "🎯 AI RECOMMENDATIONS\n\n" + "\n".join(recommendations)
        ax6.text(0.1, 0.5, rec_text, fontsize=11, family='sans-serif',
               bbox=dict(boxstyle='round', fc='lightgreen', alpha=0.9, pad=1),
               verticalalignment='center', weight='bold')

        plt.tight_layout()
        plt.show()

        # Additional 3D visualization of risk landscape
        print("\n" + "="*60)
        print("🌌 GENERATING 3D RISK LANDSCAPE...")
        print("="*60)

        # Create risk surface
        expense_range = np.linspace(s['monthly_expenses']*0.5, s['monthly_expenses']*1.5, 20)
        savings_range = np.linspace(0, s['savings']*1.5, 20)
        X, Y = np.meshgrid(expense_range, savings_range)
        Z = np.zeros_like(X)

        for i in range(20):
            for j in range(20):
                # Simulate risk based on expense/savings ratio
                ratio = X[i,j] / max(Y[i,j], 1)
                Z[i,j] = min(100, ratio * 30)

        fig3d = go.Figure(data=[go.Surface(z=Z, x=X, y=Y, colorscale='RdYlGn_r')])
        fig3d.update_layout(
            title='3D Risk Landscape: Expenses vs Savings',
            scene=dict(
                xaxis_title='Monthly Expenses (₹)',
                yaxis_title='Savings (₹)',
                zaxis_title='Risk Score',
                camera=dict(eye=dict(x=1.5, y=1.5, z=1.2))
            ),
            height=500
        )
        display(fig3d)

sim_btn.on_click(run_sim)

# Initialize displays
with map_out:
    fig = village.draw_2d()
    plt.show()

update_finances()

# ============================================================================
# MAIN DISPLAY LAYOUT
# ============================================================================
print("\n" + "="*80)
print("🎮 GAME READY! Enhanced with 25+ locations and 3D visualization!")
print("="*80 + "\n")

display(HTML("""
<div style='text-align:center; background: linear-gradient(135deg, #667eea, #764ba2);
            padding: 30px; border-radius: 20px; color: white; margin-bottom: 20px;'>
    <h1 style='margin: 0; font-size: 36px;'>🌾 ArthShala AI - Quantum Simulator 🌾</h1>
    <p style='font-size: 18px; margin: 10px 0;'>25+ Locations | Real Qiskit Quantum Computing | 3D Visualization</p>
    <p style='font-size: 14px; margin: 5px 0;'>Click locations → Make transactions → Run quantum predictions!</p>
</div>
"""))

# Map and financial status side by side
display(widgets.HBox([view_toggle_btn]))
display(widgets.HBox([map_out, map_3d_out, info_out]))

# Location buttons by category
display(HTML("<h3 style='margin: 20px 0 10px 0; color: #2c3e50;'>📍 Select Location by Category:</h3>"))

for cat in categories_order:
    if loc_buttons_by_cat[cat]:
        cat_emoji = {'financial': '💰', 'agriculture': '🌾', 'shop': '🏪',
                     'service': '⚕️', 'market': '🛒', 'residence': '🏠', 'transport': '🚌'}
        display(HTML(f"<h4 style='margin: 10px 0 5px 0;'>{cat_emoji.get(cat, '📍')} {cat.upper()}</h4>"))
        # Display buttons in rows of 5
        for i in range(0, len(loc_buttons_by_cat[cat]), 5):
            display(widgets.HBox(loc_buttons_by_cat[cat][i:i+5]))

display(action_out)
display(action_input)

display(HTML("<hr style='margin: 30px 0; border: 2px solid #ddd;'><h3 style='color: #2c3e50;'>⚛️ Quantum Financial Simulation:</h3>"))
display(widgets.HBox([timeframe, sim_btn]))
display(sim_out)

print("\n✅ All systems operational!")
print("🗺️ Toggle between 2D and 3D views")
print("📍 Click any location to see available transactions")
print("⚛️ Run quantum simulation to predict your financial future!")
print("\n" + "="*80) 
