from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class LocationResponse(BaseModel):
    id: str
    name: str
    category: str
    position: tuple
    icon: str
    color: str

class ActionResponse(BaseModel):
    name: str
    amount: int
    type: str

class LocationActionsResponse(BaseModel):
    location: str
    actions: List[ActionResponse]

class TransactionRequest(BaseModel):
    session_id: str
    location: str
    action: str

class TransactionResponse(BaseModel):
    success: bool
    updated_state: Dict[str, Any]

class GameStateResponse(BaseModel):
    cash: int
    savings: int
    investments: int
    loans: int
    insurance: int
    net_worth: int
    monthly_income: int
    monthly_expenses: int

class SimulationRequest(BaseModel):
    session_id: str
    months: int

class SimulationResponse(BaseModel):
    best: float
    good: float
    median: float
    poor: float
    worst: float
    mean: float
    trajectories: List[List[float]]
    prob_gain: float
    all_finals: List[float]

class RiskLandscapeResponse(BaseModel):
    expenses: List[float]
    savings: List[float]
    risk_scores: List[List[float]]

class SessionCreateResponse(BaseModel):
    session_id: str
 
