import requests


def get_postal_details(country_code, postal_code):
    """
    Example:
    country_code = "in"
    postal_code = "613001"
    """

    try:
        url = f"https://api.zippopotam.us/{country_code}/{postal_code}"

        response = requests.get(
            url,
            timeout=10
        )

        if response.status_code != 200:
            return None

        data = response.json()

        places = data.get("places", [])

        if not places:
            return None

        place = places[0]

        return {
            "country": data.get("country"),
            "state": place.get("state"),
            "city": place.get("place name"),
            "postal_code": postal_code
        }

    except requests.exceptions.RequestException:
        return None

    except Exception:
        return None