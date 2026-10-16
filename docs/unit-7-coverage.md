# AP World History Unit 7 coverage

Cascade's Unit 7 crosswalk lives in [`src/data/CedUnitSevenCoverage.ts`](../src/data/CedUnitSevenCoverage.ts). Keep that file in sync with the [College Board AP World History: Modern Course and Exam Description](https://apcentral.collegeboard.org/media/pdf/ap-world-history-modern-course-and-exam-description-effective-fall-2026.pdf) when a new CED takes effect.

The crosswalk links each CED topic to its learning objective, historical reasoning skill, and campaign scenario. The teacher dashboard uses it to show topic-level multiple-choice practice signals and download a CSV summary. `pnpm run selfcheck` checks that all nine topic codes are present and that the scenario location map covers every playable location.

The progress-check accuracy is a formative signal from Cascade's own question bank. It is not an estimate of AP exam performance. Short-answer checks are heuristic signals; students should use the visible criteria and have a teacher review their writing.

## Geographic assets

The playable map uses SVG world snapshots for 1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000, and 2010. Generate them with `pnpm run generate:maps`. Source GeoJSON and its attribution are in [`public/assets/maps/README.md`](../public/assets/maps/README.md). Snapshot boundaries have uneven historical precision. Clickable scenario locations are anchored points, not administrative province polygons; do not describe them as province boundaries.
