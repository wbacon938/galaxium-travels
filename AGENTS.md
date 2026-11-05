# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Commands
- Backend (run from `booking_system_backend/`, venv at `.venv`): `python server.py` (port 8080), `pytest`, single test: `pytest tests/test_services.py::TestFlightService::test_name`
- Frontend (run from `booking_system_frontend/`): `npm run dev` (5173), `npm run lint`, `npm run build` (runs `tsc -b` first; this is the only frontend "test")
- No Python linter/formatter is configured. README mentions `start.bat` but it does not exist; only `start.sh`.

## Gotchas
- `server.py` lifespan calls `seed()` on EVERY startup, which deletes all users, flights and bookings and reseeds (with random bookings). Data never persists across restarts.
- SQLite path is `sqlite:///./booking.db`, relative to the CWD. Running from the repo root vs `booking_system_backend/` uses different DB files (both gitignored).
- `create_all` never alters tables. After changing `models.py`, delete the stale `booking.db` (symptom: "table flights has no column named ...").
- Backend modules use flat imports (`from models import ...`, `from services import flight`), so run everything from `booking_system_backend/`. `tests/conftest.py` adds that dir to `sys.path`.
- `Flight.price` and `Flight.seats_available` are legacy compatibility properties (price = economy price; seats_available = sum of all 3 classes; setters only write economy). Real data is `price_{class}` / `seats_{class}`.
- Seat class is resolved dynamically via `getattr(flight, f"seats_{seat_class}")` / `price_{seat_class}` in `services/booking.py`. A new class needs columns named exactly that, plus updates to `VALID_SEAT_CLASSES` and `schemas.SeatClass`.

## Architecture / patterns
- REST (FastAPI) and MCP (FastMCP, mounted at `/mcp`) share the `services/` layer. Put new logic in `services/` and expose it in BOTH places in `server.py`. The MCP server must be created before the FastAPI app (lifespan combining).
- Services return `ErrorResponse` (`schemas.py`) instead of raising. REST returns it with HTTP 200 as `Union[Out, ErrorResponse]`; MCP tools convert it via `raise Exception(result.details or result.error)`. Errors carry `error_code` constants such as `FLIGHT_NOT_FOUND`.
- MCP tools open their own `SessionLocal()` and close it in `finally`; REST endpoints use `Depends(get_db)`.
- Frontend: the axios interceptor in `src/services/api.ts` rejects with the backend error body (or a synthetic `NETWORK_ERROR`), and 200 responses can still be errors, so check with `isErrorResponse()`. API base is `VITE_API_URL` (default `http://localhost:8080`). `src/types/index.ts` mirrors `schemas.py`.

## Testing
- Tests use an in-memory SQLite DB (`StaticPool`). The `client` fixture monkeypatches `server.SessionLocal` and `server.seed`, so tests never touch `booking.db`.
- The `sample_flight_data` fixture in `tests/conftest.py` uses the old `price`/`seats_available` fields. Create test flights with `price_economy=...`, `seats_economy=...` etc., as existing tests do.

## Style (inferred)
- Python: type hints with `X | Y` unions in services; docstrings on service functions and MCP tools (MCP docstrings are the tool descriptions shown to AI agents, so keep them accurate). Pydantic models use `class Config: from_attributes = True`.
- TS: ESLint flat config (`typescript-eslint` recommended, react-hooks, react-refresh). Components live in `src/components/{common,flights,bookings,layout,user}`; `common/index.ts` is a barrel export.
