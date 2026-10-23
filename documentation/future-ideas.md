# Future ideas

Ideas for someday, in no particular order. None of them is planned work yet. When one is picked up, design it and
move its tasks to [the roadmap](roadmap.md).

## Apple Watch complication

A simplified version of the clock as an Apple Watch complication, for example the current Moment and the phase
dial without the labels and complications.

-   watchOS complications are built with WidgetKit, so this would share most of its code with the iOS widget below.

-   Native Apple code can't use the TypeScript in `app/types/` directly. The math in `astrolabe.ts`, `moment.ts`,
    and `astro_algo` would need a Swift port, or the watch would need its values computed somewhere else.

-   WidgetKit renders timelines of entries ahead of time instead of updating every second, so the design needs a
    view that still reads well when it only changes once per stage.

## iOS home screen widget

The clock, or a simplified version of it, as a home screen widget. It raises the same questions as the
complication, and the two could be built together as one app with a widget extension and a watch extension.

## Calendar integration

Show on the clock how busy each Moment will be, from the user's calendar. For example, each stage on the phase
dial could be shaded by how much of it is booked.

-   The site is a static export with no server, so the calendar would have to be read in the browser: an `.ics`
    file or URL the user provides, or a provider's API (such as Google Calendar) with OAuth in the browser.

-   Calendar data is private. It should stay on the user's device and not be saved anywhere it could leak.

-   Busyness needs a definition: for example, the fraction of a stage covered by events, or the number of events
    that overlap it.
