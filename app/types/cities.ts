// Preset locations: one major city in each continental US time zone, east to west.

export type City = {
    name: string;
    latitude: number;
    longitude: number;
};

export const CITIES: readonly City[] = [
    { name: 'New York', latitude: 40.7128, longitude: -74.006 },
    { name: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
    { name: 'Denver', latitude: 39.7392, longitude: -104.9903 },
    { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
];

export const DEFAULT_CITY = CITIES[0];

// The preset city at exactly these coordinates, if there is one.
export function cityAt(latitude: number, longitude: number): City | undefined {
    return CITIES.find(city => city.latitude === latitude && city.longitude === longitude);
}
