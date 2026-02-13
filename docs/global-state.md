# Global Trip State (Critical)

## Store Shape

```
{
  destinations: [],
  startDate: string | null,
  durations: { [cityId]: number },
  selectedFlights: {},
  selectedHotels: {},
  selectedAttractions: {}
}
```

## State Consistency Rule

State must ALWAYS reflect current destinations.

State must be reactive to:
- Destination addition
- Destination removal
- Destination replacement
- Destination reordering

### If a destination is removed, system MUST:

1. Remove its duration
2. Remove its selected hotel
3. Remove its selected attraction
4. Remove all related flight segments
5. Recompute flight route

NO stale state allowed.

### Example

If user removes Vienna:

Remove:
- durations["Vienna"]
- selectedHotels["Vienna"]
- selectedAttractions["Vienna"]

Remove flight segments:
- Lisbon -> Vienna
- Vienna -> Zurich

Recompute:
- Lisbon -> Zurich

This is mandatory.
