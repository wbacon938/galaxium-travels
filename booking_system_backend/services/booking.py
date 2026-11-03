from sqlalchemy.orm import Session
from datetime import datetime
from models import User, Flight, Booking
from schemas import BookingOut, ErrorResponse


VALID_SEAT_CLASSES = {"economy", "business", "galaxium"}


def book_flight(db: Session, user_id: int, name: str, flight_id: int, seat_class: str = "economy") -> BookingOut | ErrorResponse:
    """Book a seat on a specific flight for a user in the requested seat class."""
    seat_class = (seat_class or "economy").lower()
    if seat_class not in VALID_SEAT_CLASSES:
        return ErrorResponse(
            error="Invalid seat class",
            error_code="INVALID_SEAT_CLASS",
            details=f"Seat class '{seat_class}' is invalid. Must be one of: economy, business, galaxium."
        )

    # Check flight exists
    flight = db.query(Flight).filter(Flight.flight_id == flight_id).first()
    if not flight:
        return ErrorResponse(
            error="Flight not found",
            error_code="FLIGHT_NOT_FOUND",
            details=f"The specified flight_id {flight_id} does not exist in our system. Please check the flight_id or use list_flights to see available flights."
        )

    # Check seats available for this class
    seat_attr = f"seats_{seat_class}"
    price_attr = f"price_{seat_class}"
    available = getattr(flight, seat_attr, 0)
    if available < 1:
        return ErrorResponse(
            error="No seats available",
            error_code="NO_SEATS_AVAILABLE",
            details=f"No seats available in {seat_class.capitalize()} class for this flight. Please check other classes or flights."
        )

    # Check user exists and name matches
    user = db.query(User).filter(User.user_id == user_id, User.name == name).first()
    if not user:
        existing_user = db.query(User).filter(User.user_id == user_id).first()
        if existing_user:
            return ErrorResponse(
                error="Name mismatch",
                error_code="NAME_MISMATCH",
                details=f"User ID {user_id} exists but the name '{name}' does not match the registered name '{existing_user.name}'. Please verify the user's name or use the correct name for this user ID."
            )
        else:
            return ErrorResponse(
                error="User not found",
                error_code="USER_NOT_FOUND",
                details=f"User with ID {user_id} is not registered in our system. The user might need to register first, or you may need to check if the user_id is correct."
            )

    # Create booking
    setattr(flight, seat_attr, available - 1)
    price_paid = getattr(flight, price_attr, 0)
    new_booking = Booking(
        user_id=user_id,
        flight_id=flight_id,
        seat_class=seat_class,
        price_paid=price_paid,
        status="booked",
        booking_time=datetime.utcnow().isoformat()
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return BookingOut.model_validate(new_booking)


def cancel_booking(db: Session, booking_id: int) -> BookingOut | ErrorResponse:
    """Cancel an existing booking by its booking_id."""
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        return ErrorResponse(
            error="Booking not found",
            error_code="BOOKING_NOT_FOUND",
            details=f"Booking with ID {booking_id} not found. The booking may have been deleted or the booking_id may be incorrect. Please verify the booking_id or check if the booking exists."
        )

    if booking.status == "cancelled":
        return ErrorResponse(
            error="Booking already cancelled",
            error_code="ALREADY_CANCELLED",
            details=f"Booking {booking_id} is already cancelled and cannot be cancelled again. The booking status is currently '{booking.status}'. If you need to make changes, please contact support."
        )

    # Restore seat for the booked seat class
    flight = db.query(Flight).filter(Flight.flight_id == booking.flight_id).first()
    if flight:
        seat_class = getattr(booking, "seat_class", "economy") or "economy"
        seat_attr = f"seats_{seat_class}"
        if hasattr(flight, seat_attr):
            setattr(flight, seat_attr, getattr(flight, seat_attr) + 1)
        elif hasattr(flight, "seats_economy"):
            flight.seats_economy += 1

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return BookingOut.model_validate(booking)


def get_bookings(db: Session, user_id: int) -> list[BookingOut]:
    """Retrieve all bookings for a specific user."""
    bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
    return [BookingOut.model_validate(b) for b in bookings]
