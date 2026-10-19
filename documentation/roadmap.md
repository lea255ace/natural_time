# Roadmap

Known bugs and planned work, in priority order. When an item is finished, remove it in the same commit.

## Known bugs (by priority)

1.  Polar latitudes produce `NaN`. `calculateSunriseHourAngleDegrees` in `astro_algo` doesn't clamp the `acos`
    argument, so polar day and night break the clock. `Moment` also needs to handle a zero-length day or night.

1.  Location and timezone can disagree. Latitude and longitude come from config, but the timezone offset and DST
    state come from the browser, and `Astrolabe` hardcodes US DST dates for the DST complication.

1.  `/dashboard` has a hydration mismatch, because the static export prerenders it with the build-time `Date`.

## Minor issues

- The stage dial in `Clock` assumes 60-minute stages, so stages longer than an hour produce negative angles.
- A latitude or longitude of exactly 0 displays as "S" or "W" in `Config`.
- Leap years are ignored; the day sliders and ranges are hardcoded to 0–364.
- The solstice lines in `SolarClock` are drawn symmetrically, which is wrong (see the `TODO` there).
- `about.mdx` has the typo "becuase" and says "0° latitude (the prime meridian)" where it means longitude.

## Maintenance

-   Add unit tests for `Moment` and `Astrolabe`, including phase boundaries, polar latitudes, and timezones.

-   Turn on `strict` in `tsconfig.json` and type the remaining untyped props and events.

-   Move the `remark-*` packages to `devDependencies`, and remove the redundant `jsconfig.json`.

-   Remove the unused `CivilOffset` complication, and rename `civilTimeHourAngleDeg` in `Clock`, which holds the
    solar hour angle.

-   Memoize the 365-sample curve in the `EqTime` complication by year.

-   Make `rotationAngleDeg` optional in `RotatingImage` so `ClockFrame` and `StageTimer` can reuse it instead of
    repeating its `Image` props (see the `TODO` in `SolarClock`).

-   Move client state out of the pages and into smaller client components: the ticking clock in
    `app/dashboard/page.tsx` and the slider state in `app/solar_clock/page.tsx` (see the `TODO`s there). Starting
    the dashboard clock after mount would also fix the `/dashboard` hydration bug. The `TODO` in `app/layout.tsx`
    about moving `metadata` can then be removed, since a site-wide `metadata` export belongs in the root layout.
