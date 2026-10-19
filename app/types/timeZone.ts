import tzlookup from '@photostructure/tz-lookup';

// Civil date and time helpers for an IANA time zone, independent of the browser's own time zone.

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

export type ZonedParts = {
    year: number;
    month: number; // 1-12
    day: number;
    hour: number;
    minute: number;
};

// The IANA time zone at a location. Results can be wrong within a few kilometers of a time zone border.
export function timeZoneForLocation(latitude: number, longitude: number): string {
    return tzlookup(latitude, longitude);
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string) {
    let format = formatters.get(timeZone);
    if (!format) {
        format = new Intl.DateTimeFormat('en-US', {
            timeZone,
            hourCycle: 'h23',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });
        formatters.set(timeZone, format);
    }
    return format;
}

export function zonedParts(date: Date, timeZone: string): ZonedParts {
    const parts = Object.fromEntries(formatter(timeZone).formatToParts(date)
        .filter(part => part.type !== 'literal')
        .map(part => [part.type, Number(part.value)]));
    return { year: parts.year, month: parts.month, day: parts.day, hour: parts.hour, minute: parts.minute };
}

// Minutes east of UTC, so New York in winter is -300. This is the opposite sign of Date.getTimezoneOffset().
export function offsetMinutes(date: Date, timeZone: string): number {
    const instant = Math.floor(date.getTime() / MS_PER_MINUTE) * MS_PER_MINUTE;
    const parts = zonedParts(new Date(instant), timeZone);
    const wallClock = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    return (wallClock - instant) / MS_PER_MINUTE;
}

// The instant when the wall clock in the time zone reads the given time. Out-of-range values roll over like
// Date.UTC (day 32 of January is February 1). A time repeated by a DST change resolves to its first occurrence, and a
// time skipped by one resolves to the same distance past the change (02:30 becomes 03:30).
export function zonedDate(timeZone: string, year: number, month: number, day: number, hour = 0, minute = 0): Date {
    const wallClock = Date.UTC(year, month - 1, day, hour, minute);
    // Offsets a day either side of the wall clock time bracket any DST change near it.
    const offsetBefore = offsetMinutes(new Date(wallClock - MS_PER_DAY), timeZone);
    const offsetAfter = offsetMinutes(new Date(wallClock + MS_PER_DAY), timeZone);
    const candidates = [offsetBefore, offsetAfter]
        .map(offset => wallClock - offset * MS_PER_MINUTE)
        .filter(instant => offsetMinutes(new Date(instant), timeZone) * MS_PER_MINUTE === wallClock - instant);
    const instant = candidates.length > 0 ? Math.min(...candidates) : wallClock - offsetBefore * MS_PER_MINUTE;
    return new Date(instant);
}

// Days since January 1 of the civil year, starting at 0.
export function zonedDayOfYear(date: Date, timeZone: string): number {
    const { year, month, day } = zonedParts(date, timeZone);
    return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / MS_PER_DAY);
}

export type DaylightSavingsPeriod = {
    start: Date;
    end: Date;
};

const periods = new Map<string, DaylightSavingsPeriod | null>();

// When DST starts and ends in the civil year, or null if the time zone doesn't observe DST that year. In the
// Southern Hemisphere, DST ends early in the year and starts late in it, so `end` comes before `start`.
export function daylightSavingsPeriod(timeZone: string, year: number): DaylightSavingsPeriod | null {
    const key = `${timeZone}:${year}`;
    if (!periods.has(key)) {
        periods.set(key, findDaylightSavingsPeriod(timeZone, year));
    }
    return periods.get(key);
}

function findDaylightSavingsPeriod(timeZone: string, year: number): DaylightSavingsPeriod | null {
    let start: Date | null = null;
    let end: Date | null = null;
    // Sample each day at noon UTC, then narrow each change in offset down to the minute.
    let previous = Date.UTC(year, 0, 1, 12);
    let previousOffset = offsetMinutes(new Date(previous), timeZone);
    for (let next = previous + MS_PER_DAY; next < Date.UTC(year + 1, 0, 1, 12); next += MS_PER_DAY) {
        const nextOffset = offsetMinutes(new Date(next), timeZone);
        if (nextOffset !== previousOffset) {
            const transition = findTransition(timeZone, previous, next);
            if (nextOffset > previousOffset) {
                start = transition;
            } else {
                end = transition;
            }
        }
        previous = next;
        previousOffset = nextOffset;
    }
    return start && end ? { start, end } : null;
}

// The first minute after `low` with the offset at `high`.
function findTransition(timeZone: string, low: number, high: number): Date {
    const lowOffset = offsetMinutes(new Date(low), timeZone);
    while (high - low > MS_PER_MINUTE) {
        const middle = Math.floor((low + high) / 2 / MS_PER_MINUTE) * MS_PER_MINUTE;
        if (offsetMinutes(new Date(middle), timeZone) === lowOffset) {
            low = middle;
        } else {
            high = middle;
        }
    }
    return new Date(high);
}
