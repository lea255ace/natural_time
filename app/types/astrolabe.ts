import astro_algo from '@lea255ace/astro_algo';
import {
    daylightSavingsPeriod,
    offsetMinutes,
    zonedDate,
    zonedDayOfYear,
    zonedParts,
} from 'types/timeZone';

// astro_algo reads the hour and day with Date's local-time methods, but its NOAA formulas expect UTC. This shifts the
// date so that its local time reads as UTC, which also keeps the results the same in every browser time zone.
function utcAsLocal(date: Date) {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
}

// The inverse for dates astro_algo returns: it builds them from UTC fields with the local-time Date constructor.
function localFieldsAsUtc(date: Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
}

export default class Astrolabe {
    date: Date;
    timeZone: string;
    #latitude: number;
    #longitude: number;

    constructor({ date, latitude, longitude, timeZone }:
        { date: Date, latitude: number, longitude: number, timeZone: string }) {
        this.date = date;
        this.timeZone = timeZone;
        this.#latitude = latitude;
        this.#longitude = longitude;
    }

    // The civil year in the location's time zone.
    year(date = this.date) {
        return zonedParts(date, this.timeZone).year;
    }

    dayOfYear(date = this.date) {
        return zonedDayOfYear(date, this.timeZone);
    }

    // The instant at the given civil day of the year (starting at 0) and minutes after midnight in this.date's year.
    dateAt(dayOfYear: number, civilTimeMinutes = 0) {
        return zonedDate(this.timeZone, this.year(), 1, 1 + dayOfYear,
            Math.floor(civilTimeMinutes / 60), civilTimeMinutes % 60);
    }

    // Null when the time zone doesn't observe DST.
    daylightSavingsStartDate(date = this.date) {
        return daylightSavingsPeriod(this.timeZone, this.year(date))?.start ?? null;
    }

    // Null when the time zone doesn't observe DST.
    daylightSavingsEndDate(date = this.date) {
        return daylightSavingsPeriod(this.timeZone, this.year(date))?.end ?? null;
    }

    isDaylightSavings(date = this.date) {
        const year = this.year(date);
        const standardOffset = Math.min(
            offsetMinutes(new Date(Date.UTC(year, 0, 1, 12)), this.timeZone),
            offsetMinutes(new Date(Date.UTC(year, 6, 1, 12)), this.timeZone));
        return offsetMinutes(date, this.timeZone) > standardOffset;
    }

    eqTime(date = this.date) {
        return astro_algo.calculateEqTimeMinutes(utcAsLocal(date));
    }

    civilTimeMinutes(date = this.date) {
        const { hour, minute } = zonedParts(date, this.timeZone);
        return hour * 60 + minute;
    }

    // Minutes to add to civil time to get true solar time.
    civilTimeOffsetMinutes(date = this.date) {
        const eqTime = this.eqTime(date);
        return eqTime + 4 * this.#longitude - offsetMinutes(date, this.timeZone);
    }

    daylightMinutes(date = this.date): number {
        const declination = astro_algo.calculateDeclinationRadians(utcAsLocal(date));
        const sunriseHourAngleDegrees = astro_algo.calculateSunriseHourAngleDegrees(this.#latitude, declination);
        return 8 * sunriseHourAngleDegrees;
    }

    // The June solstice in this.date's civil year.
    summerSolsticeDate(date = this.date) {
        return localFieldsAsUtc(
            astro_algo.calculateQuarterDayForYear(astro_algo.QuarterDays.SummerSolstice, this.year(date)));
    }

    solsticeDaylightMinutes(date = this.date): number {
        return this.daylightMinutes(this.summerSolsticeDate(date));
    }
}
