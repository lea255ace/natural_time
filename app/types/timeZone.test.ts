import { describe, expect, it } from 'vitest';
import {
    daylightSavingsPeriod,
    offsetMinutes,
    timeZoneForLocation,
    zonedDate,
    zonedDayOfYear,
    zonedParts,
} from 'types/timeZone';

const utc = (year: number, month: number, day: number, hours = 0, minutes = 0) =>
    new Date(Date.UTC(year, month - 1, day, hours, minutes));

describe('timeZoneForLocation', () => {
    it.each([
        [40.71, -74.01, 'America/New_York'],
        [51.51, -0.13, 'Europe/London'],
        [-33.87, 151.21, 'Australia/Sydney'],
        [28.61, 77.21, 'Asia/Kolkata'],
        [33.45, -112.07, 'America/Phoenix'],
    ])('finds the time zone at %f, %f', (latitude, longitude, timeZone) => {
        expect(timeZoneForLocation(latitude, longitude)).toBe(timeZone);
    });
});

describe('offsetMinutes', () => {
    it.each([
        ['America/New_York', utc(2026, 1, 15, 12), -300],
        ['America/New_York', utc(2026, 7, 15, 12), -240],
        ['Australia/Sydney', utc(2026, 1, 15, 12), 660],
        ['Asia/Kolkata', utc(2026, 7, 15, 12), 330],
        ['Asia/Kathmandu', utc(2026, 7, 15, 12), 345],
    ])('is the offset east of UTC in %s on %s', (timeZone, date, offset) => {
        expect(offsetMinutes(date, timeZone)).toBe(offset);
    });
});

describe('zonedParts and zonedDayOfYear', () => {
    it('reads the civil date and time in the time zone', () => {
        // 2026-01-01 04:30 UTC is still December 31 in New York.
        expect(zonedParts(utc(2026, 1, 1, 4, 30), 'America/New_York'))
            .toEqual({ year: 2025, month: 12, day: 31, hour: 23, minute: 30 });
        expect(zonedDayOfYear(utc(2026, 1, 1, 4, 30), 'America/New_York')).toBe(364);
        expect(zonedDayOfYear(utc(2026, 1, 1, 4, 30), 'Europe/London')).toBe(0);
    });
});

describe('zonedDate', () => {
    it('finds the instant for a civil time', () => {
        expect(zonedDate('America/New_York', 2026, 1, 15, 12)).toEqual(utc(2026, 1, 15, 17));
        expect(zonedDate('America/New_York', 2026, 7, 15, 12)).toEqual(utc(2026, 7, 15, 16));
        expect(zonedDate('Asia/Kolkata', 2026, 7, 15, 12)).toEqual(utc(2026, 7, 15, 6, 30));
    });

    it('rolls over days past the end of the month', () => {
        expect(zonedDate('Europe/London', 2026, 1, 32, 12)).toEqual(utc(2026, 2, 1, 12));
    });

    it('moves a time skipped by DST to the hour after', () => {
        // 02:30 doesn't exist in New York on March 8, 2026; 03:30 EDT is 07:30 UTC.
        expect(zonedDate('America/New_York', 2026, 3, 8, 2, 30)).toEqual(utc(2026, 3, 8, 7, 30));
    });

    it('gives a repeated time that reads correctly on the wall clock', () => {
        const date = zonedDate('America/New_York', 2026, 11, 1, 1, 30);
        expect(zonedParts(date, 'America/New_York')).toMatchObject({ day: 1, hour: 1, minute: 30 });
    });
});

describe('daylightSavingsPeriod', () => {
    it.each([
        ['America/New_York', 2024, utc(2024, 3, 10, 7), utc(2024, 11, 3, 6)],
        ['America/New_York', 2025, utc(2025, 3, 9, 7), utc(2025, 11, 2, 6)],
        ['America/New_York', 2026, utc(2026, 3, 8, 7), utc(2026, 11, 1, 6)],
        ['Europe/London', 2026, utc(2026, 3, 29, 1), utc(2026, 10, 25, 1)],
        // Southern Hemisphere: DST ends in April and starts in October.
        ['Australia/Sydney', 2026, utc(2026, 10, 3, 16), utc(2026, 4, 4, 16)],
    ])('finds the transitions in %s in %i', (timeZone, year, start, end) => {
        expect(daylightSavingsPeriod(timeZone, year)).toEqual({ start, end });
    });

    it.each(['Asia/Kolkata', 'America/Phoenix', 'Asia/Tokyo'])('is null in %s, which has no DST', timeZone => {
        expect(daylightSavingsPeriod(timeZone, 2026)).toBeNull();
    });
});
