# Frontend Pages

## 1. OnboardingPage
- Explanation
- Start button

## 2. DestinationPage
- Search European capitals only
- Map (Leaflet)
- Selected cities list (ordered)
- Allow removing cities
- Next button

## 3. SchedulePage

### Requirements
- One GLOBAL start date
- For EACH destination: input number of days

### Example
```
Start Date: 2026-07-01
Lisbon: 3
Vienna: 2
Zurich: 4
```

### Validation
- Start date required
- Days required
- Days must be numeric, integer, > 0
- No decimals
- No empty fields
- Use React Hook Form + Zod schema
- Block progression if invalid

## 4. FlightResultsPage

For EVERY segment, exactly 3 options:
- 06:00
- 12:00
- 21:00

Each option includes time and price (120-450 random).

User must select exactly one per segment. Cannot continue without full selection.

## 5. HotelsPage
- 1 hotel per destination
- Required before continue

## 6. AttractionsPage
- 1 attraction per destination
- Required before continue

## 7. SummaryPage
- Show: Destinations, Dates, Flights, Hotels, Attractions, Total price
- Button: "Fly Me A Travel"
