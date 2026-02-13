from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.trip import Trip

router = APIRouter()


class CreateTripRequest(BaseModel):
    total_price: float


@router.post("/trips")
def create_trip(request: CreateTripRequest, db: Session = Depends(get_db)):
    trip = Trip(total_price=request.total_price)
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return {
        "id": trip.id,
        "created_at": trip.created_at.isoformat(),
        "total_price": trip.total_price,
    }
