/**
 * Free geocoding utility using OpenStreetMap (Nominatim).
 * Returns [longitude, latitude] matching GeoJSON standard.
 */
export async function geocodeAddress(address: string, city: string, state: string): Promise<[number, number]> {
  try {
    const query = encodeURIComponent(`${address}, ${city}, ${state}`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "RealEstateApp/1.0 (admin@realestate.com)",
        },
      }
    );

    if (!response.ok) throw new Error("Geocoding network request failed");

    const data = (await response.json()) as Array<{ lon: string; lat: string }>;

    if (data && data.length > 0) {
      const lng = parseFloat(data[0].lon);
      const lat = parseFloat(data[0].lat);

      // Service region validation guard (Nigeria bounds check)
      if (lng >= 2.6 && lng <= 14.7 && lat >= 4.2 && lat <= 13.9) {
        return [lng, lat];
      }
    }
  } catch (error) {
    console.warn("Geocoding failed, falling back to default city coordinates:", error);
  }

  // Default fallback (Lagos: [3.3792, 6.5244])
  return [3.3792, 6.5244];
}
