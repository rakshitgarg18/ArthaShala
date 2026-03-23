from datetime import datetime

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
 
