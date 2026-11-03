from models import Base, User, Flight, Booking
from db import engine, SessionLocal
from datetime import datetime, timedelta
import random

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Clear existing data
    db.query(Booking).delete()
    db.query(User).delete()
    db.query(Flight).delete()
    db.commit()
    # Add demo users
    users = [
        User(name="Alice", email="alice@example.com"),
        User(name="Bob", email="bob@example.com"),
        User(name="Charlie", email="charlie@galaxium.com"),
        User(name="Diana", email="diana@moonmail.com"),
        User(name="Eve", email="eve@marsmail.com"),
        User(name="Frank", email="frank@venusmail.com"),
        User(name="Grace", email="grace@jupiter.com"),
        User(name="Heidi", email="heidi@europa.com"),
        User(name="Ivan", email="ivan@asteroidbelt.com"),
        User(name="Judy", email="judy@pluto.com"),
    ]
    db.add_all(users)
    db.commit()
    # Add demo flights
    flights = [
        Flight(origin="Earth", destination="Mars", departure_time="2099-01-01T09:00:00Z", arrival_time="2099-01-01T17:00:00Z", price_economy=1000000, price_business=1750000, price_galaxium=3500000, seats_economy=12, seats_business=4, seats_galaxium=2),
        Flight(origin="Earth", destination="Moon", departure_time="2099-01-02T10:00:00Z", arrival_time="2099-01-02T14:00:00Z", price_economy=500000, price_business=875000, price_galaxium=1750000, seats_economy=15, seats_business=6, seats_galaxium=2),
        Flight(origin="Mars", destination="Earth", departure_time="2099-01-03T12:00:00Z", arrival_time="2099-01-03T20:00:00Z", price_economy=950000, price_business=1650000, price_galaxium=3300000, seats_economy=10, seats_business=4, seats_galaxium=1),
        Flight(origin="Venus", destination="Earth", departure_time="2099-01-04T08:00:00Z", arrival_time="2099-01-04T18:00:00Z", price_economy=1200000, price_business=2100000, price_galaxium=4200000, seats_economy=8, seats_business=3, seats_galaxium=1),
        Flight(origin="Jupiter", destination="Europa", departure_time="2099-01-05T15:00:00Z", arrival_time="2099-01-05T19:00:00Z", price_economy=2000000, price_business=3500000, price_galaxium=7000000, seats_economy=6, seats_business=2, seats_galaxium=1),
        Flight(origin="Earth", destination="Venus", departure_time="2099-01-06T07:00:00Z", arrival_time="2099-01-06T15:00:00Z", price_economy=1100000, price_business=1900000, price_galaxium=3850000, seats_economy=10, seats_business=4, seats_galaxium=2),
        Flight(origin="Moon", destination="Mars", departure_time="2099-01-07T11:00:00Z", arrival_time="2099-01-07T19:00:00Z", price_economy=800000, price_business=1400000, price_galaxium=2800000, seats_economy=14, seats_business=5, seats_galaxium=2),
        Flight(origin="Mars", destination="Jupiter", departure_time="2099-01-08T13:00:00Z", arrival_time="2099-01-08T23:00:00Z", price_economy=2500000, price_business=4375000, price_galaxium=8750000, seats_economy=5, seats_business=2, seats_galaxium=1),
        Flight(origin="Europa", destination="Earth", departure_time="2099-01-09T09:00:00Z", arrival_time="2099-01-09T21:00:00Z", price_economy=3000000, price_business=5250000, price_galaxium=10500000, seats_economy=6, seats_business=3, seats_galaxium=1),
        Flight(origin="Earth", destination="Pluto", departure_time="2099-01-10T06:00:00Z", arrival_time="2099-01-11T06:00:00Z", price_economy=5000000, price_business=8750000, price_galaxium=17500000, seats_economy=4, seats_business=2, seats_galaxium=1),
    ]
    db.add_all(flights)
    db.commit()
    # Add demo bookings
    user_ids = [user.user_id for user in db.query(User).all()]
    all_flights = db.query(Flight).all()
    statuses = ["booked", "cancelled", "completed"]
    seat_classes = ["economy", "business", "galaxium"]
    seat_weights = [0.65, 0.25, 0.10]
    bookings = []
    now = datetime.utcnow()
    for i in range(20):
        user_id = random.choice(user_ids)
        flight = random.choice(all_flights)
        status = random.choice(statuses)
        seat_class = random.choices(seat_classes, weights=seat_weights, k=1)[0]
        price_paid = getattr(flight, f"price_{seat_class}")
        booking_time = (now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))).isoformat() + "Z"
        bookings.append(Booking(
            user_id=user_id,
            flight_id=flight.flight_id,
            seat_class=seat_class,
            price_paid=price_paid,
            status=status,
            booking_time=booking_time
        ))
    db.add_all(bookings)
    db.commit()
    db.close()
    print("Database seeded with elaborate demo data!")

if __name__ == "__main__":
    seed() 