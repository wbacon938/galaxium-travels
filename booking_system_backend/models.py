from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

class Flight(Base):
    __tablename__ = 'flights'
    flight_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    price_economy = Column(Integer, nullable=False, default=1000000)
    price_business = Column(Integer, nullable=False, default=1750000)
    price_galaxium = Column(Integer, nullable=False, default=3500000)
    seats_economy = Column(Integer, nullable=False, default=10)
    seats_business = Column(Integer, nullable=False, default=5)
    seats_galaxium = Column(Integer, nullable=False, default=2)

    @property
    def price(self) -> int:
        return self.price_economy

    @price.setter
    def price(self, value: int):
        self.price_economy = value

    @property
    def seats_available(self) -> int:
        return self.seats_economy + self.seats_business + self.seats_galaxium

    @seats_available.setter
    def seats_available(self, value: int):
        self.seats_economy = value

class Booking(Base):
    __tablename__ = 'bookings'
    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    flight_id = Column(Integer, ForeignKey('flights.flight_id'), nullable=False)
    seat_class = Column(String, nullable=False, default="economy")
    price_paid = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False)
    booking_time = Column(String, nullable=False)