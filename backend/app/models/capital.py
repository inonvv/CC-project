from sqlalchemy import Column, Integer, String, Float
from app.db.database import Base


class Capital(Base):
    __tablename__ = "capitals"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String, nullable=False)
    city = Column(String, nullable=False, unique=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
