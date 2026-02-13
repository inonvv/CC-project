def test_get_hotels_for_valid_city(client):
    # First get a valid city_id
    capitals = client.get("/capitals").json()
    city_id = capitals[0]["id"]

    response = client.get(f"/hotels?city_id={city_id}")
    assert response.status_code == 200
    hotels = response.json()
    assert len(hotels) == 3
    for hotel in hotels:
        assert "name" in hotel
        assert "price_per_night" in hotel
        assert "rating" in hotel
        assert hotel["city_id"] == city_id


def test_get_hotels_for_invalid_city(client):
    response = client.get("/hotels?city_id=99999")
    assert response.status_code == 200
    assert response.json() == []
