from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.capital import Capital

router = APIRouter()


@router.get("/capitals")
def list_capitals(db: Session = Depends(get_db)):
    capitals = db.query(Capital).order_by(Capital.city).all()
    return [
        {
            "id": c.id,
            "country": c.country,
            "city": c.city,
            "lat": c.lat,
            "lng": c.lng,
        }
        for c in capitals
    ]
