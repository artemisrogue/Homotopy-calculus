# TODO

Recommendations from reviewing this project end-to-end (content quality passes plus general
maintainability), roughly in order of leverage.

## High priority

- **Guard the "no ASCII apostrophe" house rule with automation.** The whole module depends on
  never letting an ASCII apostrophe into a concatenated string in `functor-calculus.js` — a single
  slip silently breaks the JS. Add a pre-commit hook or CI check: grep for the disallowed pattern
  inside the concatenated string literals, plus a `node -c functor-calculus.js` syntax sanity
  check. Cheap, currently nonexistent, and would have caught any mistake from heavy editing passes.

- **Add deep-linking via URL hash routing.** This is a citable teaching resource (14-week course
  plan, full bibliography), but there is no way to link directly to a specific sub-tab (or a
  section within one) — everything lives in JS-only state. `switchTab()` in `functor-calculus.js`
  already does the tab switch; wire `location.hash` to it (read on load, update on switch) so URLs
  like `#taylor-tower` or `#knots-3` work. Small change, outsized payoff for something meant to be
  shared or assigned.

- **Make cross-references between sub-tabs actually clickable.** The course-plan table and the
  "How to read this module" list *name* other sub-tabs as plain text instead of linking to them.
  Wire these to call `switchTab()` directly. Same infrastructure as above, near-zero cost.

## Smaller-ticket

- **Lightweight in-app search.** The content is dense enough (9 sub-tabs, many with 100+ lines of
  citation-heavy prose) that browser find-in-page across one tab isn't enough for someone hunting
  for a specific theorem or citation.

- **Treat future MAN-protocol passes as targeted, not blanket.** This session's brevity/rigor
  critics returned "no findings" often enough (Overview, Cubes & Excision, Taylor Tower, Other
  Calculi all came back clean) that the baseline prose is already close to ceiling. Future passes
  should target specific sections flagged by a real issue, not re-review the whole file from
  scratch every time.

## Deliberately not recommending

- **Splitting the single large `functor-calculus.js` file.** This trades against the project's
  explicit "no build step, just open index.html" design, which is load-bearing for how the app is
  hosted (GitHub Pages) and edited. Leave it as one file.
