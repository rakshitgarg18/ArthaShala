from fastapi import APIRouter, HTTPException
from services.quantum_engine import QuantumFinancialEngine
from schemas import SimulationRequest, SimulationResponse, RiskLandscapeResponse
import numpy as np

router = APIRouter(prefix="/api/v1/simulation", tags=["simulation"])

quantum_engine = QuantumFinancialEngine()

@router.post("/quantum", response_model=SimulationResponse)
async def run_quantum_simulation(request: SimulationRequest):
    # Note: In a real app, you'd get game state from session
    # For now, using default values or from request if extended
    # Assuming session_id is used to get game state, but for simplicity, using defaults
    
    initial_wealth = 5000  # Could be from session
    decisions = {
        'income': 10000,
        'expenses': 0,  # Would be from game state
        'savings': 0,
        'investment': 0,
        'loan': 0,
        'insurance': 500
    }
    
    result = quantum_engine.quantum_monte_carlo(
        initial_wealth, decisions, request.months
    )
    
    return SimulationResponse(**result)

@router.get("/risk-landscape", response_model=RiskLandscapeResponse)
async def get_risk_landscape(session_id: str):
    # Simplified risk surface generation
    expense_range = np.linspace(0, 20000, 20)
    savings_range = np.linspace(0, 10000, 20)
    X, Y = np.meshgrid(expense_range, savings_range)
    Z = np.zeros_like(X)

    for i in range(20):
        for j in range(20):
            ratio = X[i,j] / max(Y[i,j], 1)
            Z[i,j] = min(100, ratio * 30)
    
    return RiskLandscapeResponse(
        expenses=expense_range.tolist(),
        savings=savings_range.tolist(),
        risk_scores=Z.tolist()
    )
 
