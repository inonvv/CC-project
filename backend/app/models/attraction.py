from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.db.database import Base


class Attraction(Base):
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("capitals.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    address = Column(String, nullable=True)
