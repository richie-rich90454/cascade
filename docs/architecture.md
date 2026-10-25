# Development architecture

Cascade keeps its simulation, historical content, and interface in separate layers so contributors can improve one without silently changing the others.

## Main layers

- `src/main.ts` creates the Phaser game and installs shared display behavior.
- `src/scenes/` contains navigable screens and their user interactions.
- `src/ui/` contains reusable panels, maps, reading tools, and learning activities.
- `src/core/GameSession.ts` coordinates the active scenario, world state, turn state, profile saves, and managers.
- `src/domain/` contains the world model, scenarios, and simulation rules.
- `src/data/` contains curriculum coverage, sources, map coordinates, rubrics, and assessment questions.
- `src/managers/LocalProfileManager.ts` validates and persists versioned browser-local student records.
- `public/assets/manifest.json` describes art and audio assets; `docs/credits-and-licenses.md` records their sources and terms.

## Change boundaries

- A scene owns presentation and interaction. Reusable controls belong in `src/ui/` when more than one screen needs them.
- A scenario owns dated learning activities and learning checks. Shared simulation rules belong in `src/domain/scenarios/systems/`.
- Documented events, player decisions, and hypothetical consequences must remain distinguishable in content and state.
- Changes to a save record must preserve validation and migration behavior in `LocalProfileManager` and `GameSession`.
- Third-party assets need an attribution and license entry before they are added to the project.

## Reliability rules

- Loops over user data or binary assets must have a finite boundary derived from validated input length or collection size.
- Each loop that advances a parser or state machine must either make measurable progress or return a clear error.
- Timed playback and event listeners need a stop or shutdown path; scene shutdown must release their timers and subscriptions.
- Invalid saves should preserve the last valid profile data and show a recoverable message.
- UI content must remain inside the visible area at desktop, tablet, and narrow widths. Scrollable content must be keyboard accessible and provide a visible cue.

## Local quality checks

The GitHub Actions quality workflow runs the type check, game self-check, asset audit, and production build. The browser flow can be run locally with `pnpm run verify:visual` when Edge or Chrome is available.
