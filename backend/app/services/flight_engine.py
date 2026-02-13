import random


def compute_route(origin: dict, destinations: list[dict]) -> list[dict]:
    """
    Build route: origin -> dest1 -> dest2 -> ... -> destN -> origin
    For each segment, generate exactly 3 flight options at 06:00, 12:00, 21:00.
    """
    waypoints = [origin] + destinations + [origin]
    segments = []

    for i in range(len(waypoints) - 1):
        from_point = waypoints[i]
        to_point = waypoints[i + 1]

        options = [
            {"departure": "06:00", "price": random.randint(120, 450)},
            {"departure": "12:00", "price": random.randint(120, 450)},
            {"departure": "21:00", "price": random.randint(120, 450)},
        ]

        segments.append({
            "from": from_point["city"],
            "to": to_point["city"],
            "options": options,
        })

    return segments
