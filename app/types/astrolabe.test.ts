import { describe, expect, it } from 'vitest';
import Astrolabe from 'types/astrolabe';

// vitest.config.mts pins TZ to America/New_York, so these dates follow US Eastern time and DST rules.
const at = (year: number, month: number, day: number, hours = 12, minutes = 0) =>
    new Date(year, month - 1, day, hours, minutes);

const astrolabe = (date: Date, latitude = 40, longitude = -74) => new Astrolabe({ date, latitude, longitude });

describe('test environment', () => {
    it('runs in US Eastern time', () => {
        expect(at(2026, 1, 15).getTimezoneOffset()).toBe(300);
        expect(at(2026, 7, 15).getTimezoneOffset()).toBe(240);
    });
});

describe('dayOfYear', () => {
    it.each([
        [at(2026, 1, 1), 0],
        [at(2026, 3, 8, 3), 66],
        [at(2026, 11, 1, 23, 30), 304],
        [at(2026, 12, 31), 364],
        [at(2024, 12, 31), 365],
    ])('counts %s as day %i', (date, day) => {
        expect(astrolabe(date).dayOfYear()).toBe(day);
    });

    it('is unaffected by the DST change on the same day', () => {
        expect(astrolabe(at(2026, 3, 8, 1)).dayOfYear()).toBe(astrolabe(at(2026, 3, 8, 23)).dayOfYear());
    });
});

describe('US DST dates', () => {
    it.each([
        [2024, at(2024, 3, 10, 2), at(2024, 11, 3, 2)],
        [2025, at(2025, 3, 9, 2), at(2025, 11, 2, 2)],
        // March 1 and November 1, 2026 are both Sundays.
        [2026, at(2026, 3, 8, 2), at(2026, 11, 1, 2)],
    ])('starts and ends on the right Sundays in %i', (year, start, end) => {
        const a = astrolabe(at(year, 6, 1));
        expect(a.daylightSavingsStartDate()).toEqual(start);
        expect(a.daylightSavingsEndDate()).toEqual(end);
    });

    it.each([
        [at(2026, 1, 15), false],
        [at(2026, 3, 8, 1, 59), false],
        [at(2026, 3, 8, 3), true],
        [at(2026, 7, 15), true],
        [at(2026, 12, 15), false],
    ])('reports %s as DST: %s', (date, isDst) => {
        expect(astrolabe(date).isDaylightSavings()).toBe(isDst);
    });
});

describe('equation of time', () => {
    it('reaches its February minimum and November maximum', () => {
        expect(astrolabe(at(2026, 2, 11)).eqTime()).toBeCloseTo(-14.2, 0);
        expect(astrolabe(at(2026, 11, 3)).eqTime()).toBeCloseTo(16.4, 0);
    });

    it.each([
        at(2026, 4, 15), at(2026, 6, 13), at(2026, 9, 1), at(2026, 12, 25),
    ])('is near zero on %s', date => {
        expect(Math.abs(astrolabe(date).eqTime())).toBeLessThan(1);
    });
});

describe('civil time', () => {
    it('counts minutes since local midnight', () => {
        expect(astrolabe(at(2026, 3, 20, 15, 30)).civilTimeMinutes()).toBe(930);
    });

    it('equals the equation of time on the time zone meridian in standard time', () => {
        // 75° W is the EST meridian, so only the equation of time separates solar and civil time.
        const a = astrolabe(at(2026, 1, 15), 40, -75);
        expect(a.civilTimeOffsetMinutes()).toBeCloseTo(a.eqTime(), 6);
    });

    it('shifts an hour behind during DST', () => {
        const a = astrolabe(at(2026, 7, 15), 40, -75);
        expect(a.civilTimeOffsetMinutes()).toBeCloseTo(a.eqTime() - 60, 6);
    });

    it('adds four minutes per degree east of the meridian', () => {
        const a = astrolabe(at(2026, 1, 15), 40, -74);
        expect(a.civilTimeOffsetMinutes()).toBeCloseTo(a.eqTime() + 4, 6);
    });
});

describe('daylight', () => {
    // Reference values from the sunrise equation with the standard -0.833° horizon for refraction.
    const expectDaylight = (date: Date, latitude: number, minutes: number) => {
        expect(astrolabe(date, latitude).daylightMinutes()).toBeGreaterThan(minutes - 3);
        expect(astrolabe(date, latitude).daylightMinutes()).toBeLessThan(minutes + 3);
    };

    it.each([
        ['June solstice at 40° N', at(2026, 6, 21), 40, 901],
        ['December solstice at 40° N', at(2026, 12, 21), 40, 559],
        ['June solstice at 40° S', at(2026, 6, 21), -40, 559],
        ['March equinox at the equator', at(2026, 3, 20), 0, 727],
        ['June solstice at the equator', at(2026, 6, 21), 0, 727],
    ])('lasts about the expected minutes on the %s', (_name, date, latitude, minutes) => {
        expectDaylight(date, latitude, minutes);
    });

    // astro_algo's declination is up to about 0.5° off near the equinoxes (see documentation/roadmap.md). When that
    // is fixed, this starts failing; change it back to a regular `it`.
    it.fails('lasts about the expected minutes on the March equinox at 40° N', () => {
        expectDaylight(at(2026, 3, 20), 40, 729);
    });

    it('uses the June solstice for the solstice daylight', () => {
        const solstice = astrolabe(at(2026, 6, 21)).daylightMinutes();
        expect(astrolabe(at(2026, 1, 15)).solsticeDaylightMinutes()).toBeCloseTo(solstice, 0);
    });
});
