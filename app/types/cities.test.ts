import { describe, expect, it } from 'vitest';
import { CITIES, DEFAULT_CITY, cityAt } from 'types/cities';
import { timeZoneForLocation } from 'types/timeZone';

describe('CITIES', () => {
    it('has one city in each continental US time zone', () => {
        expect(CITIES.map(city => [city.name, timeZoneForLocation(city.latitude, city.longitude)])).toEqual([
            ['New York', 'America/New_York'],
            ['Chicago', 'America/Chicago'],
            ['Denver', 'America/Denver'],
            ['Los Angeles', 'America/Los_Angeles'],
        ]);
    });

    it('defaults to New York', () => {
        expect(DEFAULT_CITY.name).toBe('New York');
    });
});

describe('cityAt', () => {
    it('finds a preset city by its exact coordinates', () => {
        expect(cityAt(34.0522, -118.2437)?.name).toBe('Los Angeles');
    });

    it('returns undefined for other coordinates', () => {
        expect(cityAt(34.05, -118.24)).toBeUndefined();
    });
});
