# Contributing to Cascade

Thank you for taking the time to improve Cascade. Focus contributions on a clear student need, keep the game easy to approach, and describe any change in terms a history student or teacher can understand.

## Before you begin

For a large feature or change to historical content, open an issue first. This helps keep the campaign coherent and avoids duplicate work. Small fixes to wording, accessibility, or a reproducible bug can go directly into a pull request.

The project is marked `UNLICENSED` and has no project-wide code license or contributor agreement. Do not assume that opening a pull request grants Cascade permission to reuse your code. Before contributing code, open an issue with the maintainer to agree on the intended terms.

## Set up a local copy

Install Node.js and pnpm, then run these commands from the repository root:

```powershell
pnpm install
pnpm dev
```

Vite prints the local address. To build the production version, run `pnpm build`.

## Checks before a pull request

Run the checks relevant to your change:

```powershell
pnpm run typecheck
pnpm run selfcheck
pnpm run assets:verify
pnpm run build
pnpm run verify:visual
```

The visual check opens a local Edge or Chrome browser and exercises the menu, campaign selector, briefing, and guided scenario. If the browser is not at its default Edge location, set `CASCADE_BROWSER_EXECUTABLE_PATH` to the browser executable. The browser check must be able to connect to its local development server.

## Project conventions

- Keep the first action on each screen clear. Prefer one recommended next step and keep secondary tools out of the way.
- Write interface text in sentence case or title case. Do not use all-caps labels, and spell out terms when a student may not know an abbreviation.
- Give panels a full outline or a distinct surface. Do not add a narrow vertical bar along a container's left edge.
- Check resizing, scrolling, keyboard focus, text scaling, and reduced motion when changing a screen. Text and controls must remain readable and inside their panels.
- Keep loops bounded by a collection or validated input size. Any state progression needs a clear exit, and malformed assets or saves must fail with a useful error instead of hanging.
- Keep documented historical outcomes distinct from player choices and alternate-history consequences.
- Treat civilians and affected communities with care. Do not make rewards depend on deaths or atrocities.
- Keep historical map geometry in data files. Do not use generated illustrations as geographic boundaries.
- Add source, attribution, and license details to `docs/credits-and-licenses.md` when introducing third-party material. Update the Unit 7 coverage guide when changing curriculum content.
- Avoid adding dependencies for work the existing stack can support.
- Use Conventional Commit messages, such as `fix(ui): keep briefing text inside the reading panel`.

## Pull request checklist

- Describe the student or teacher problem and the change that addresses it.
- Include screenshots for visible changes at a desktop size and a narrow layout.
- List the checks you ran and any checks you could not run.
- Update curriculum coverage, credits, or save-data notes when the change affects them.
- Do not include real student information, local save files, secrets, or unrelated generated output.

## Project health

Pull requests run the checks in [the GitHub Actions workflow](.github/workflows/ci.yml). Dependabot checks the JavaScript dependencies and GitHub Actions versions each week. Keep policy and support links in the README current when these files move.
