from fastapi import APIRouter, HTTPException
from services.village_map import VillageMap
from schemas import LocationResponse, LocationActionsResponse

router = APIRouter(prefix="/api/v1/village", tags=["village"])

village = VillageMap()

@router.get("/locations", response_model=List[LocationResponse])
async def get_village_locations():
    return [
        LocationResponse(
            id=loc_id,
            name=loc['name'],
            category=loc['category'],
            position=loc['pos'],
            icon=loc['icon'],
            color=loc['color']
        )
        for loc_id, loc in village.locations.items()
    ]

@router.get("/{location_id}/actions", response_model=LocationActionsResponse)
async def get_location_actions(location_id: str):
    if location_id not in village.locations:
        raise HTTPException(status_code=404, detail="Location not found")
    
    actions = village.actions.get(location_id, [])
    loc = village.locations[location_id]
    
    return LocationActionsResponse(
        location=loc['name'],
        actions=actions
    )

@router.get("/map")
async def get_village_map(view: str = "2d", highlight: str = None):
    if view == "2d":
        fig = village.draw_2d(highlight)
        import io
        import base64
        buf = io.BytesIO()
        fig.savefig(buf, format='png')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
        return {"image": f"data:image/png;base64,{img_base64}"}
    elif view == "3d":
        fig = village.draw_3d(highlight)
        return {"plotly_json": fig.to_json()}
    else:
        raise HTTPException(status_code=400, detail="Invalid view")
 
