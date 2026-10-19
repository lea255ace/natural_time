import { describe, expect, it } from 'vitest';
import Astrolabe from 'types/astrolabe';

// Instants are given in UTC. vitest.config.mts runs the tests in Asia/Tokyo, which matches none of the time zones
// below, so any use of the browser's own time zone shows up as a failure.
const utc = (year: number, month: number, day: number, hours = 0, minutes = 0) =>
    new Date(Date.UTC(year, month - 1, day, hours, minutes));

const astrolabe = (date: Date, latitude = 40, longitude = -74, timeZone = 'America/New_York') =>
    new Astrolabe({ date, latitude, longitude, timeZone });

describe('test environment', () => {
    it('runs in a time zone that none of the tests use', () => {
        expect(utc(2026, 1, 15).getTimezoneOffset()).toBe(-540);
    });
});

describe('dayOfYear', () => {
    it.each([
        // 00:00 EST on January 1.
        [utc(2026, 1, 1, 5), 0],
        // 23:59 EST on December 31, 2025, though it's already 2026 in UTC and Tokyo.
        [utc(2026, 1, 1, 4, 59), 364],
        // 03:00 EDT, just after DST starts.
        [utc(2026, 3, 8, 7), 66],
        [utc(2026, 12, 31, 17), 364],
        [utc(2024, 12, 31, 17), 365],
    ])('counts %s as day %i in New York', (date, day) => {
        expect(astrolabe(date).dayOfYear()).toBe(day);
    });
});

describe('dateAt', () => {
    it('finds the instant for a civil day and time at the location', () => {
        const a = astrolabe(utc(2026, 6, 1, 16));
        expect(a.dateAt(0, 12 * 60)).toEqual(utc(2026, 1, 1, 17));
        expect(a.dateAt(66, 3 * 60)).toEqual(utc(2026, 3, 8, 7));
    });
});

describe('DST', () => {
    it.each([
        // US: second Sunday in March to first Sunday in November, at 02:00 local time.
        ['America/New_York', 2026, utc(2026, 3, 8, 7), utc(2026, 11, 1, 6)],
        // UK: last Sunday in March to last Sunday in October, at 01:00 UTC.
        ['Europe/London', 2026, utc(2026, 3, 29, 1), utc(2026, 10, 25, 1)],
        // Australia: first Sunday in October to first Sunday in April, so it ends before it starts.
        ['Australia/Sydney', 2026, utc(2026, 10, 3, 16), utc(2026, 4, 4, 16)],
    ])('starts and ends on the right dates in %s in %i', (timeZone, year, start, end) => {
        const a = astrolabe(utc(year, 6, 1, 12), 0, 0, timeZone);
        expect(a.daylightSavingsStartDate()).toEqual(start);
        expect(a.daylightSavingsEndDate()).toEqual(end);
    });

    it('has no dates where DST isn\'t observed', () => {
        const a = astrolabe(utc(2026, 6, 1, 12), 33.45, -112.07, 'America/Phoenix');
        expect(a.daylightSavingsStartDate()).toBeNull();
        expect(a.daylightSavingsEndDate()).toBeNull();
    });

    it.each([
        ['America/New_York', utc(2026, 1, 15, 17), false],
        ['America/New_York', utc(2026, 3, 8, 6, 59), false],
        ['America/New_York', utc(2026, 3, 8, 7), true],
        ['America/New_York', utc(2026, 7, 15, 16), true],
        ['Australia/Sydney', utc(2026, 1, 15, 1), true],
        ['Australia/Sydney', utc(2026, 7, 15, 2), false],
        ['America/Phoenix', utc(2026, 7, 15, 19), false],
    ])('reports DST in %s at %s as %s', (timeZone, date, isDst) => {
        expect(astrolabe(date, 0, 0, timeZone).isDaylightSavings()).toBe(isDst);
    });
});

describe('equation of time', () => {
    it('reaches its February minimum and November maximum', () => {
        expect(astrolabe(utc(2026, 2, 11, 17)).eqTime()).toBeCloseTo(-14.2, 0);
        expect(astrolabe(utc(2026, 11, 3, 17)).eqTime()).toBeCloseTo(16.4, 0);
    });

    it.each([
        utc(2026, 4, 15, 16), utc(2026, 6, 13, 16), utc(2026, 9, 1, 16), utc(2026, 12, 25, 17),
    ])('is near zero on %s', date => {
        expect(Math.abs(astrolabe(date).eqTime())).toBeLessThan(1);
    });
});

describe('civil time', () => {
    it.each([
        ['America/New_York', 15 * 60 + 30],
        ['Europe/London', 19 * 60 + 30],
        // 01:00 the next day.
        ['Asia/Kolkata', 60],
    ])('reads the wall clock in %s', (timeZone, minutes) => {
        expect(astrolabe(utc(2026, 3, 20, 19, 30), 0, 0, timeZone).civilTimeMinutes()).toBe(minutes);
    });

    it('equals the equation of time on the time zone meridian in standard time', () => {
        // 75° W is the EST meridian, so only the equation of time separates solar and civil time.
        const a = astrolabe(utc(2026, 1, 15, 17), 40, -75);
        expect(a.civilTimeOffsetMinutes()).toBeCloseTo(a.eqTime(), 6);
    });

    it('shifts an hour behind during DST', () => {
        const a = astrolabe(utc(2026, 7, 15, 16), 40, -75);
        expect(a.civilTimeOffsetMinutes()).toBeCloseTo(a.eqTime() - 60, 6);
    });

    it('adds four minutes per degree east of the meridian', () => {
        const a = astrolabe(utc(2026, 1, 15, 17), 40, -74);
        expect(a.civilTimeOffsetMinutes()).toBeCloseTo(a.eqTime() + 4, 6);
    });

    it('uses the location\'s time zone, not the browser\'s', () => {
        // 82.5° E is the IST meridian (UTC+05:30).
        const a = astrolabe(utc(2026, 1, 15, 6, 30), 28.61, 82.5, 'Asia/Kolkata');
        expect(a.civilTimeOffsetMinutes()).toBeCloseTo(a.eqTime(), 6);
    });
});

describe('daylight', () => {
    // Reference values from the sunrise equation with the standard -0.833° horizon for refraction.
    const expectDaylight = (date: Date, latitude: number, minutes: number) => {
        expect(astrolabe(date, latitude).daylightMinutes()).toBeGreaterThan(minutes - 1);
        expect(astrolabe(date, latitude).daylightMinutes()).toBeLessThan(minutes + 1);
    };

    it.each([
        ['June solstice at 40° N', utc(2026, 6, 21, 16), 40, 900.9],
        ['December solstice at 40° N', utc(2026, 12, 21, 17), 40, 559.5],
        ['June solstice at 40° S', utc(2026, 6, 21, 16), -40, 559.5],
        ['March equinox at the equator', utc(2026, 3, 20, 16), 0, 726.7],
        ['June solstice at the equator', utc(2026, 6, 21, 16), 0, 727.3],
    ])('lasts about the expected minutes on the %s', (_name, date, latitude, minutes) => {
        expectDaylight(date, latitude, minutes);
    });

    // astro_algo's declination is up to about 0.5° off near the equinoxes (see documentation/roadmap.md). When that
    // is fixed, this starts failing; change it back to a regular `it`.
    it.fails('lasts about the expected minutes on the March equinox at 40° N', () => {
        expectDaylight(utc(2026, 3, 20, 16), 40, 728.8);
    });

    it('finds the June 2026 solstice at its published time, 08:24 UTC', () => {
        const solstice = astrolabe(utc(2026, 1, 15, 17)).summerSolsticeDate();
        expect(Math.abs(solstice.getTime() - utc(2026, 6, 21, 8, 24).getTime())).toBeLessThan(10 * 60 * 1000);
    });

    it('uses the June solstice for the solstice daylight', () => {
        const solstice = astrolabe(utc(2026, 6, 21, 16)).daylightMinutes();
        expect(astrolabe(utc(2026, 1, 15, 17)).solsticeDaylightMinutes()).toBeCloseTo(solstice, 0);
    });
});
