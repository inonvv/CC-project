from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.db.database import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("capitals.id"), nullable=False)
    name = Column(String, nullable=False)
    price_per_night = Column(Float, nullable=False)
    rating = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
