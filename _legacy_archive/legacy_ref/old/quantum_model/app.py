from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.village import router as village_router
from routers.game import router as game_router
from routers.simulation import router as simulation_router

app = FastAPI(title="ArthShala AI - Quantum Village Financial Simulator")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(village_router)
app.include_router(game_router)
app.include_router(simulation_router)

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "service": "arthshala-ai"}
 
