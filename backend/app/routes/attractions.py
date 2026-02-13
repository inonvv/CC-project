from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.attraction import Attraction

router = APIRouter()


@router.get("/attractions")
def list_attractions(city_id: int = Query(...), db: Session = Depends(get_db)):
    attractions = db.query(Attraction).filter(Attraction.city_id == city_id).all()
    return [
        {
            "id": a.id,
            "city_id": a.city_id,
            "name": a.name,
            "category": a.category,
            "price": a.price,
            "image_url": a.image_url,
            "address": a.address,
        }
        for a in attractions
    ]
