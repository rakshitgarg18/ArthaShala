from fastapi import APIRouter, HTTPException
from services.game_state import GameState
from services.village_map import VillageMap
from schemas import TransactionRequest, TransactionResponse, GameStateResponse, SessionCreateResponse
import uuid

router = APIRouter(prefix="/api/v1/game", tags=["game"])

# In-memory session store
sessions = {}

village = VillageMap()

@router.post("/start", response_model=SessionCreateResponse)
async def start_game():
    session_id = str(uuid.uuid4())
    sessions[session_id] = GameState()
    return SessionCreateResponse(session_id=session_id)

@router.delete("/{session_id}")
async def end_game(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    del sessions[session_id]
    return {"message": "Session ended"}

@router.post("/transaction", response_model=TransactionResponse)
async def execute_transaction(request: TransactionRequest):
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    game = sessions[request.session_id]
    
    if request.location not in village.locations:
        raise HTTPException(status_code=404, detail="Location not found")
    
    actions = village.actions.get(request.location, [])
    action = next((a for a in actions if a['name'] == request.action), None)
    
    if not action:
        raise HTTPException(status_code=400, detail="Action not available at this location")
    
    success = game.transact(request.location, action)
    
    return TransactionResponse(
        success=success,
        updated_state=game.get_summary()
    )

@router.get("/state", response_model=GameStateResponse)
async def get_game_state(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    game = sessions[session_id]
    return GameStateResponse(**game.get_summary())
 
