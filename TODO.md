# TODO

Recommendations from reviewing this project end-to-end (content quality passes plus general
maintainability), roughly in order of leverage.

## Done

- ~~**Guard the "no ASCII apostrophe" house rule with automation.**~~ Added
  `.github/workflows/check.yml`: runs `node --check functor-calculus.js` plus a grep heuristic for
  bare letter-apostrophe-letter contractions on every push/PR.
- ~~**Add deep-linking via URL hash routing.**~~ `TAB_SLUGS` + `switchTab()` now read/write
  `location.hash` (e.g. `#taylor-tower`), with a `hashchange` listener for back/forward navigation.
  Section-level anchors (`#knots-3`) were judged out of scope for this pass — would need `id`
  attributes threaded through every numbered section across all 9 functions; tab-level linking
  captures most of the payoff at a fraction of the risk.
- ~~**Make cross-references between sub-tabs actually clickable.**~~ The course-plan table and
  "How to read this module" list now use real `<a href="#slug" class="fk-xref">` links.

## High priority

(none remaining)

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
