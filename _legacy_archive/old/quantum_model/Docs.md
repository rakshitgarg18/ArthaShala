## 1️⃣ API DOCUMENTATION (for integrating this simulator with FastAPI)

Below is an **API-first interpretation** of your notebook code, converted into logical backend services.
This is **docs only**, not implementation yet.

---

### 🌾 ArthShala AI – Backend API Docs

**Base URL**

```
/api/v1
```

---

### 🔹 1. Health Check

**Purpose:** Verify backend is running.

```
GET /health
```

**Response**

```json
{
  "status": "ok",
  "service": "arthshala-ai"
}
```

---

### 🔹 2. Get Village Locations

**Purpose:** Fetch all village locations with metadata.

```
GET /village/locations
```

**Response**

```json
{
  "count": 25,
  "locations": [
    {
      "id": "bank",
      "name": "Bank",
      "category": "financial",
      "position": [8, 8],
      "icon": "🏦",
      "color": "#4A90E2"
    }
  ]
}
```

---

### 🔹 3. Get Actions for a Location

**Purpose:** Fetch possible actions for a selected location.

```
GET /village/{location_id}/actions
```

**Example**

```
GET /village/bank/actions
```

**Response**

```json
{
  "location": "bank",
  "actions": [
    {
      "name": "Save",
      "amount": -2000,
      "type": "savings"
    },
    {
      "name": "KCC Loan",
      "amount": 50000,
      "type": "loan"
    }
  ]
}
```

---

### 🔹 4. Execute Transaction

**Purpose:** Apply a financial action to the game state.

```
POST /game/transaction
```

**Request Body**

```json
{
  "location": "bank",
  "action": "Save"
}
```

**Response**

```json
{
  "success": true,
  "updated_state": {
    "cash": 3000,
    "savings": 2000,
    "investments": 0,
    "loans": 0,
    "net_worth": 5000
  }
}
```

---

### 🔹 5. Get Current Game State

**Purpose:** Fetch current financial status.

```
GET /game/state
```

**Response**

```json
{
  "cash": 5000,
  "savings": 0,
  "investments": 0,
  "loans": 0,
  "insurance": 500,
  "monthly_income": 10000,
  "monthly_expenses": 0,
  "net_worth": 5000
}
```

---

### 🔹 6. Run Quantum Simulation

**Purpose:** Predict future wealth using quantum Monte Carlo.

```
POST /simulation/quantum
```

**Request Body**

```json
{
  "months": 12
}
```

**Response**

```json
{
  "best": 145000,
  "median": 82000,
  "worst": 15000,
  "mean": 91000,
  "probability_of_gain": 67.4,
  "risk_level": "Moderate",
  "trajectories": [
    [5000, 6200, 8100, 12000]
  ]
}
```

---

### 🔹 7. Get Simulation Risk Surface (Optional)

**Purpose:** Return 3D risk data (for frontend plotly).

```
GET /simulation/risk-landscape
```

**Response**

```json
{
  "expenses": [2000, 2500, 3000],
  "savings": [0, 1000, 2000],
  "risk_scores": [[10, 30, 60]]
}
```

If you want, next I can:

* 🔧 **Actually write `main.py` + schemas + services**
* 🔁 **Make it multi-user with session IDs**
* 🌐 **Prepare it for React frontend integration**
* 🧪 **Add unit tests**

Just tell me the next step. 
