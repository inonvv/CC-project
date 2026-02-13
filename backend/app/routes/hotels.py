from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.hotel import Hotel

router = APIRouter()


@router.get("/hotels")
def list_hotels(city_id: int = Query(...), db: Session = Depends(get_db)):
    hotels = db.query(Hotel).filter(Hotel.city_id == city_id).all()
    return [
        {
            "id": h.id,
            "city_id": h.city_id,
            "name": h.name,
            "price_per_night": h.price_per_night,
            "rating": h.rating,
            "image_url": h.image_url,
        }
        for h in hotels
    ]
