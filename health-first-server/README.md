# Provider Registration Backend

## Setup

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

```bash
uvicorn main:app --reload
```

## API Endpoint

POST `/api/v1/provider/register`

See the code for request/response details.

## Testing

- Unit tests: `pytest`
- Integration tests: `pytest`

## Project Structure

- `controllers/` - API route handlers
- `services/` - Business logic, email, validation
- `models/` - Pydantic/ORM models
- `middlewares/` - Rate limiting, validation
- `utils/` - Password, email utilities