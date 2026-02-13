from fastapi import APIRouter
from pydantic import BaseModel

from app.services.flight_engine import compute_route

router = APIRouter()


class Location(BaseModel):
    city: str
    lat: float
    lng: float


class Destination(BaseModel):
    city_id: int
    city: str
    lat: float
    lng: float


class ComputeRouteRequest(BaseModel):
    origin: Location
    destinations: list[Destination]


@router.post("/compute-route")
def compute_route_endpoint(request: ComputeRouteRequest):
    origin = {"city": request.origin.city, "lat": request.origin.lat, "lng": request.origin.lng}
    destinations = [
        {"city_id": d.city_id, "city": d.city, "lat": d.lat, "lng": d.lng}
        for d in request.destinations
    ]
    segments = compute_route(origin, destinations)
    return {"segments": segments}
