from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime, timezone
from app.db.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    total_price = Column(Float, nullable=False)
