import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Polygon
import plotly.graph_objects as go
import plotly.express as px

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
 
