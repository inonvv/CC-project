def test_route_length_equals_destinations_plus_one(client):
    """Route should have N+1 segments for N destinations (including return home)."""
    response = client.post("/compute-route", json={
        "origin": {"city": "Tel Aviv", "lat": 32.08, "lng": 34.78},
        "destinations": [
            {"city_id": 1, "city": "Lisbon", "lat": 38.72, "lng": -9.14},
            {"city_id": 2, "city": "Vienna", "lat": 48.21, "lng": 16.37},
        ],
    })
    assert response.status_code == 200
    segments = response.json()["segments"]
    # 2 destinations → 3 segments (origin→d1, d1→d2, d2→origin)
    assert len(segments) == 3


def test_exactly_three_options_per_segment(client):
    """Each segment must have exactly 3 flight options."""
    response = client.post("/compute-route", json={
        "origin": {"city": "Tel Aviv", "lat": 32.08, "lng": 34.78},
        "destinations": [
            {"city_id": 1, "city": "Paris", "lat": 48.86, "lng": 2.35},
        ],
    })
    segments = response.json()["segments"]
    for segment in segments:
        assert len(segment["options"]) == 3
        departures = [o["departure"] for o in segment["options"]]
        assert departures == ["06:00", "12:00", "21:00"]


def test_return_home_segment_exists(client):
    """Last segment must return to origin city."""
    response = client.post("/compute-route", json={
        "origin": {"city": "Tel Aviv", "lat": 32.08, "lng": 34.78},
        "destinations": [
            {"city_id": 1, "city": "Lisbon", "lat": 38.72, "lng": -9.14},
            {"city_id": 2, "city": "Vienna", "lat": 48.21, "lng": 16.37},
        ],
    })
    segments = response.json()["segments"]
    last_segment = segments[-1]
    assert last_segment["to"] == "Tel Aviv"


def test_flight_prices_in_range(client):
    """All flight prices should be between 120 and 450."""
    response = client.post("/compute-route", json={
        "origin": {"city": "Tel Aviv", "lat": 32.08, "lng": 34.78},
        "destinations": [
            {"city_id": 1, "city": "Paris", "lat": 48.86, "lng": 2.35},
        ],
    })
    segments = response.json()["segments"]
    for segment in segments:
        for option in segment["options"]:
            assert 120 <= option["price"] <= 450
