import { describe, expect, it } from 'vitest';
import Moment from 'types/moment';

// Times are minutes after solar midnight.
const hm = (hours: number, minutes = 0) => hours * 60 + minutes;

describe('Moment with a 12-hour day', () => {
    // Sunrise at 06:00 and sunset at 18:00; every phase is 3 hours and every stage is 1 hour.
    const momentAt = (solarTimeMinutes: number) => new Moment({ daylightMinutes: 720, solarTimeMinutes });

    it.each([
        [hm(6), 'Early Morning'],
        [hm(7), 'Mid Morning'],
        [hm(8), 'Late Morning'],
        [hm(9), 'Early Forenoon'],
        [hm(12), 'Early Afternoon'],
        [hm(15), 'Early Evening'],
        [hm(17, 59), 'Late Evening'],
        [hm(18), 'Early First Watch'],
        [hm(21), 'Early Second Watch'],
        [hm(23, 59), 'Late Second Watch'],
        [hm(0), 'Early Third Watch'],
        [hm(3), 'Early Fourth Watch'],
        [hm(5, 59), 'Late Fourth Watch'],
    ])('names %i minutes "%s"', (solarTimeMinutes, name) => {
        expect(momentAt(solarTimeMinutes).momentName()).toBe(name);
    });

    it('starts each stage with no time elapsed', () => {
        const moment = momentAt(hm(7));
        expect(moment.currentStageMinutesTotal()).toBe(60);
        expect(moment.currentStageMinutesElapsed()).toBe(0);
    });

    it('tracks the time elapsed within a stage', () => {
        expect(momentAt(hm(7, 45)).currentStageMinutesElapsed()).toBe(45);
        expect(momentAt(hm(19, 30)).currentStageMinutesElapsed()).toBe(30);
    });
});

describe('Moment with a 15-hour day', () => {
    // Sunrise at 04:30 and sunset at 19:30; day stages are 75 minutes and night stages are 45 minutes.
    const momentAt = (solarTimeMinutes: number) => new Moment({ daylightMinutes: 900, solarTimeMinutes });

    it('places phase boundaries relative to sunrise and sunset', () => {
        expect(momentAt(hm(4, 29)).momentName()).toBe('Late Fourth Watch');
        expect(momentAt(hm(4, 30)).momentName()).toBe('Early Morning');
        expect(momentAt(hm(19, 29)).momentName()).toBe('Late Evening');
        expect(momentAt(hm(19, 30)).momentName()).toBe('Early First Watch');
    });

    it('stretches day stages and shrinks night stages', () => {
        expect(momentAt(hm(12)).currentStageMinutesTotal()).toBe(75);
        expect(momentAt(hm(1)).currentStageMinutesTotal()).toBe(45);
    });

    it('puts solar noon at the start of the afternoon', () => {
        expect(momentAt(hm(12)).momentName()).toBe('Early Afternoon');
        expect(momentAt(hm(11, 59)).momentName()).toBe('Late Forenoon');
    });
});

describe('Moment at polar latitudes', () => {
    it.todo('handles polar day and night (needs a design decision; see documentation/roadmap.md)');
});
