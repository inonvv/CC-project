from sqlalchemy.orm import Session
from app.models.capital import Capital
from app.models.hotel import Hotel
from app.models.attraction import Attraction


CAPITALS = [
    ("Albania", "Tirana", 41.33, 19.82),
    ("Andorra", "Andorra la Vella", 42.51, 1.52),
    ("Austria", "Vienna", 48.21, 16.37),
    ("Belarus", "Minsk", 53.90, 27.57),
    ("Belgium", "Brussels", 50.85, 4.35),
    ("Bosnia and Herzegovina", "Sarajevo", 43.86, 18.41),
    ("Bulgaria", "Sofia", 42.70, 23.32),
    ("Croatia", "Zagreb", 45.81, 15.98),
    ("Cyprus", "Nicosia", 35.17, 33.37),
    ("Czech Republic", "Prague", 50.08, 14.44),
    ("Denmark", "Copenhagen", 55.68, 12.57),
    ("Estonia", "Tallinn", 59.44, 24.75),
    ("Finland", "Helsinki", 60.17, 24.94),
    ("France", "Paris", 48.86, 2.35),
    ("Germany", "Berlin", 52.52, 13.41),
    ("Greece", "Athens", 37.98, 23.73),
    ("Hungary", "Budapest", 47.50, 19.04),
    ("Iceland", "Reykjavik", 64.15, -21.94),
    ("Ireland", "Dublin", 53.35, -6.26),
    ("Italy", "Rome", 41.90, 12.50),
    ("Kosovo", "Pristina", 42.66, 21.17),
    ("Latvia", "Riga", 56.95, 24.11),
    ("Liechtenstein", "Vaduz", 47.14, 9.52),
    ("Lithuania", "Vilnius", 54.69, 25.28),
    ("Luxembourg", "Luxembourg City", 49.61, 6.13),
    ("Malta", "Valletta", 35.90, 14.51),
    ("Moldova", "Chisinau", 47.01, 28.86),
    ("Monaco", "Monaco", 43.73, 7.42),
    ("Montenegro", "Podgorica", 42.44, 19.26),
    ("Netherlands", "Amsterdam", 52.37, 4.90),
    ("North Macedonia", "Skopje", 42.00, 21.43),
    ("Norway", "Oslo", 59.91, 10.75),
    ("Poland", "Warsaw", 52.23, 21.01),
    ("Portugal", "Lisbon", 38.72, -9.14),
    ("Romania", "Bucharest", 44.43, 26.10),
    ("Russia", "Moscow", 55.76, 37.62),
    ("San Marino", "San Marino", 43.94, 12.46),
    ("Serbia", "Belgrade", 44.79, 20.47),
    ("Slovakia", "Bratislava", 48.15, 17.11),
    ("Slovenia", "Ljubljana", 46.06, 14.51),
    ("Spain", "Madrid", 40.42, -3.70),
    ("Sweden", "Stockholm", 59.33, 18.07),
    ("Switzerland", "Bern", 46.95, 7.45),
    ("Ukraine", "Kyiv", 50.45, 30.52),
    ("United Kingdom", "London", 51.51, -0.13),
]

# (name_template, price, rating, image_keyword)
HOTEL_TEMPLATES = [
    ("Grand Hotel {city}", 220, 4.5, "luxury+hotel"),
    ("City Center Inn {city}", 120, 3.8, "city+hotel+room"),
    ("Budget Stay {city}", 85, 3.2, "budget+hostel"),
]

# (name_template, category, price, image_keyword, address_template)
ATTRACTION_TEMPLATES = [
    ("National Museum of {city}", "Museum", 15, "museum+building", "Museum Avenue 1, {city}"),
    ("{city} Historic Landmark", "Landmark", 0, "historic+landmark+europe", "Old Town Square, {city}"),
    ("{city} Central Park", "Park", 5, "city+park+europe", "Park Boulevard 10, {city}"),
]


def seed_data(db: Session):
    existing = db.query(Capital).count()
    if existing > 0:
        return

    for idx, (country, city, lat, lng) in enumerate(CAPITALS):
        capital = Capital(country=country, city=city, lat=lat, lng=lng)
        db.add(capital)
        db.flush()

        for h_idx, (name_tpl, price, rating, img_kw) in enumerate(HOTEL_TEMPLATES):
            hotel = Hotel(
                city_id=capital.id,
                name=name_tpl.format(city=city),
                price_per_night=price,
                rating=rating,
                image_url=f"https://picsum.photos/seed/hotel-{idx}-{h_idx}/400/250",
            )
            db.add(hotel)

        for a_idx, (name_tpl, category, price, img_kw, addr_tpl) in enumerate(ATTRACTION_TEMPLATES):
            attraction = Attraction(
                city_id=capital.id,
                name=name_tpl.format(city=city),
                category=category,
                price=price,
                image_url=f"https://picsum.photos/seed/attr-{idx}-{a_idx}/400/250",
                address=addr_tpl.format(city=city),
            )
            db.add(attraction)

    db.commit()
