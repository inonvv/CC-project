# Flight Engine Rules (Backend)

## FastAPI Endpoints

- `GET /capitals`
- `POST /compute-route`
- `GET /hotels?city_id=`
- `GET /attractions?city_id=`

## Flight Generation Rules

For EVERY segment including return home, generate exactly 3 options:
- 06:00
- 12:00
- 21:00

No more. No less.

### Price
- Random between 120-450

### Route Order
```
user_location
  -> destination_1
  -> destination_2
  -> ...
  -> last_destination
  -> user_location
```
