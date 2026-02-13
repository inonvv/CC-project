def test_get_capitals_returns_data(client):
    response = client.get("/capitals")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "city" in data[0]
    assert "country" in data[0]
    assert "lat" in data[0]
    assert "lng" in data[0]


def test_get_capitals_contains_known_cities(client):
    response = client.get("/capitals")
    cities = [c["city"] for c in response.json()]
    assert "Paris" in cities
    assert "Berlin" in cities
    assert "London" in cities
