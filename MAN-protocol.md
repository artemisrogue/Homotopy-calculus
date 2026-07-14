# M/A/N Protocol — Master / Apprentice / Novice

An iterative refinement loop that improves an artifact by alternating pressure from two
opposed critics: one demanding rigor, one demanding accessibility. Neither critic edits.
The Apprentice edits, and must answer to both.

---

## 0. Parameters

Fill these in before invoking. Everything below reads from this block.

```yaml
ARTIFACT:        # what is being improved (file path, app, deck, proof, spec)
ARTIFACT_TYPE:   # code | presentation | proof | documentation | mixed
DOMAIN:          # e.g. point-set topology, React frontend, quant library
N:               # number of M/A/N rounds to run
EXCHANGE_DEPTH:  # Q&A pairs per critic per round (default 4)
INVARIANTS:      # things no round may change (API surface, deadline scope, house style)
BUDGET:          # hard ceiling — LOC, slide count, page count, bundle size
NOVICE_PROFILE:  # what the novice already knows (default: bright undergrad, no domain background)
MASTER_PROFILE:  # default: professor of DOMAIN, values rigor and mathematical maturity
```

---

## 1. Roles

### Master
A professor of `DOMAIN`. Wants the artifact to be **correct and mature**. Does not care
whether it is approachable — that is not the Master's job, and the Master should not
pretend otherwise.

Attacks:
- unstated hypotheses; theorems missing their conditions
- quantifier order, edge cases, boundary conditions, the empty case, the degenerate case
- claims of generality the argument does not support
- notation abuse, overloaded symbols, undefined objects used before definition
- hand-waving marked by "clearly", "obviously", "it follows that"
- appeals to intuition standing where an argument should stand

Constraints:
- **Every question must cite a specific location** (line, slide, function, step).
- **May not ask what the artifact already answers.** If the answer is present but the Master
  missed it, that is a finding about exposition — hand it to the Novice, not a rigor gap.
- May not ask for scope expansion. Rigor is about what is *there* being sound, not about
  covering more.

### Apprentice
A graduate student. **The only role that edits.** Owns the artifact, defends it, concedes
when the argument goes against them, and adjudicates when the two critics conflict.

Constraints:
- Each Master/Novice question gets one of exactly three responses:
  1. **Defend** — the artifact is already right; state why, and cite where.
  2. **Concede** — the criticism lands; the resulting edit is described concretely.
  3. **Defer** — real but out of scope for `INVARIANTS`/`BUDGET`; logged as open.
- "That's a good point, I'll consider it" is not a response. Pick one of the three.
- The Apprentice may not concede to both critics on the same point. See §5.
- See §3 for when and how a concession must be committed to disk.

### Novice
A bright undergraduate. Wants to know **what this is and why it matters** — and wants to
get there without unnecessary friction. Smart but uninformed — their confusion is data
about the artifact, never about their ability.

The Novice's mandate is **clarity**, not merely length. These usually pull the same
direction (padding obscures the point) but are not the same axis, and neither may be
sacrificed to the other:
- Cutting a sentence that was genuinely unclear, redundant, or delaying the point is a win.
- Cutting a sentence that was already clear, purely to satisfy a word-count `BUDGET`, is not
  the Novice's job — it produces prose that is shorter but not better.
- Symmetrically, the Novice may ask for something to be *added* — a missing connective, a
  disambiguating word, a one-clause signpost — when its absence is what caused the
  confusion. A shorter draft that is harder to follow is a regression, not progress, even
  under a `BUDGET` tuned toward brevity.

Attacks:
- definitions dropped without motivation ("why would anyone define this?")
- no worked example before the general case
- jargon used before it is introduced
- the interesting thing buried under setup
- ambiguous referents or overloaded terms — a sentence whose meaning depends on the reader
  silently picking the right one of two available readings
- padding that delays the point without adding information
- "what breaks if we drop this condition?"
- "what is the smallest example where this is non-trivial?"

Constraints:
- **Must name the exact point of loss** — the sentence, the line, the slide. "This is
  confusing" is not a finding; "I stopped following at line 40 because I don't know what
  `X` is" is.
- May not ask for the rigor to be reduced. May ask for it to be *reached differently*.
- When tuned toward economy (§9), "cut this" and "clarify this" are equally in scope. A
  rewrite that is a few words *longer* but resolves a genuine ambiguity is still a valid
  finding — brevity is a tool for clarity here, not a competing goal.

---

## 2. One Round

Round `i` of `N`:

| Phase | Actor | Output |
|---|---|---|
| 0 | Apprentice | Presents the current state. Round 1: in full. Later rounds: diff from round `i-1` plus a one-paragraph orientation. |
| 1 | Master ↔ Apprentice | `EXCHANGE_DEPTH` Q&A pairs. Master probes; Apprentice defends/concedes/defers. |
| 2 | Apprentice | **Rigor revision.** Every concession from Phase 1 becomes a concrete edit, committed per §3. |
| 3 | Novice ↔ Apprentice | `EXCHANGE_DEPTH` Q&A pairs against the *revised* artifact — the Novice never sees the pre-Master version. |
| 4 | Apprentice | **Pedagogy revision.** Every concession from Phase 3 becomes a concrete edit, committed per §3, without violating anything locked in Phase 2. |
| 5 | Apprentice | Ledger update + convergence check (§4, §6). |

Order matters and is not symmetric. Rigor comes first each round because it is cheaper to
make a correct thing clear than to make a clear thing correct — the second direction tends
to require throwing away the exposition you just built.

---

## 3. Process Integrity (automated / multi-agent runs)

When a round's phases are executed by automated agents rather than a human Apprentice
narrating in a chat, two failure modes appear that don't exist in a single-threaded
conversation: lost work, and lost contributions from concurrent workers. Both are cheap to
prevent and expensive to discover after the fact — so prevent them structurally, don't rely
on remembering to check.

**Commit after every task, not after every round.** A *task* is any single unit of the
Apprentice's work that changes the artifact on disk — at finest grain, one finding conceded
and edited; at coarsest, one phase (Phase 2's rigor revision, Phase 4's pedagogy revision).
The artifact must be written, saved, and committed to version control before the next task
begins. Edits are never batched into a single commit at the end of a round, and never left
uncommitted across a phase boundary. If the run is interrupted, the loss is bounded to the
current task, not the whole round or the whole run — and the commit log becomes a second,
independent copy of the ledger.

**Concurrent Apprentices must not race on the same file.** If a phase's edits are
parallelized across multiple Apprentice agents (e.g., one per section of a large artifact)
rather than run as a single sequential editor, each concurrent Apprentice must work in an
isolated copy (a git worktree or branch, not the shared working tree) and commit its own
contribution there. A merge step then integrates every branch before the round is
considered complete. Editing the same shared file concurrently from multiple agents without
isolation is not a speed optimization — the last writer silently overwrites everyone else's
work, so a ledger that claims "20 findings conceded" can quietly become "6 findings
conceded, 14 discarded" with no error and no record. If concurrent edits ever genuinely
conflict at merge time (two Apprentices touching the same lines), that is itself a finding:
the artifact had two agents assigned overlapping scope with no boundary between them —
resolve it explicitly and narrow the scoping for next round; do not let a merge tool guess.

**Findings from parallel critics are additive, never dropped for convenience.** When Master
or Novice review is fanned out across several concurrent critics (e.g., one per section, or
one per holistic "lens"), every critic's findings must reach the ledger — either as an edit,
a Defend, or a Deferred entry. A finding is not permitted to silently disappear because the
Apprentice ran out of attention before reaching it; if genuinely out of `BUDGET`, it is
logged Deferred, not dropped.

---

## 4. The Ledger

The device that makes this converge instead of oscillate. Carried across all rounds and
reproduced (compactly) at the end of each.

| ID | Round | Source | Issue | Resolution | Status |
|---|---|---|---|---|---|
| R1-M2 | 1 | Master | Compactness claim omits Hausdorff | Added hypothesis, slide 4 | LOCKED |
| R1-N1 | 1 | Novice | No example before general defn | Added finite-complement example | LOCKED |
| R2-M3 | 2 | Master | Cut the example, it's not general | Rejected — conflicts R1-N1, stratified instead | LOCKED |

**LOCKED** entries may not be reopened by a later round unless the later round presents
*new evidence* — a counterexample, a broken test, a downstream contradiction. "The Master
would prefer otherwise" is not new evidence. Without this rule the Master spends round 3
deleting what the Novice won in round 2, and the process runs forever at zero net gain.

**OPEN** entries are live and should be attacked in the next round.
**DEFERRED** entries are real, out of scope, and reported at the end as known gaps.

---

## 5. Conflict Protocol

When the Master wants X removed and the Novice wants X kept, the Apprentice must find a
**structural** resolution. In order of preference:

1. **Stratify** — the rigorous statement stays load-bearing; the intuition lives *adjacent*
   to it and is marked as such (remark, margin note, docstring, tooltip, appendix). Both
   survive at full strength; neither dilutes the other. This is the right answer most of
   the time.
2. **Order** — informal first, formal after, with an explicit signpost at the transition
   ("Precisely:"). The reader knows which one they are reading.
3. **Split** — the audiences genuinely differ; produce two artifacts (paper + talk, API +
   tutorial, core + examples).
4. **Concede** — one side loses, and the ledger records who and why.

**Forbidden: averaging.** A statement made half-rigorous to be half-approachable is worse
than either pure version — it misleads the expert and still loses the beginner. If the
Apprentice's resolution reads as a hedge, it is wrong.

---

## 6. Convergence

Stop at the first of:
- `N` rounds complete
- a full round produces **zero edits** — the artifact is at a fixed point
- the ledger has no OPEN items and both critics decline to raise new ones
- `BUDGET` reached (report what would have been done next)

Anti-theater rules, enforced every round:
- Every exchange produces at least one edit **or** one explicitly logged decision not to edit.
- No praise-only turns. The critics are not there to approve.
- If round `i` finds nothing, say so and halt — do not manufacture findings to fill `EXCHANGE_DEPTH`.
- Diminishing returns is a result, not a failure. Report it.

---

## 7. Type Mapping

The two axes are constant; what they *mean* depends on `ARTIFACT_TYPE`.

| | Master reads as | Novice reads as |
|---|---|---|
| **Code** | correctness, invariants, edge cases, error handling, type safety, no silent failure, honest complexity claims, test coverage of the hard cases | naming, API ergonomics, error message quality, docs, onboarding path, sane defaults, principle of least surprise |
| **Presentation** | correct statements, sufficient hypotheses, sound argument, no overclaiming | motivation before machinery, one worked example per concept, the point stated early *and clearly* — precise enough that a mature reader doesn't have to reread it, not merely short |
| **Proof** | every step justified, no gaps, hypotheses used where claimed | the idea of the proof stated before the proof, why each hypothesis is needed |
| **Documentation** | accuracy, completeness, correct edge-case behavior described | task-oriented ordering, runnable examples, findability |

---

## 8. Invocation

> Apply the M/A/N protocol to `ARTIFACT` for `N` rounds.
> Parameters: [paste the §0 block]
>
> Run each round in full: Master exchange, rigor revision, Novice exchange, pedagogy
> revision, ledger update. Show the dialogue — it is where the reasoning lives — but keep
> each turn to a few sentences. Show revisions as diffs after round 1. Report the ledger
> at the end of each round and the final artifact plus DEFERRED gaps at the end of the run.
> Commit each phase's edits per §3 before starting the next phase.
>
> Do not soften either critic. The value of this process is entirely in the friction.

---

## 9. Tuning

- **`N`.** 2–3 for most work. Round 1 finds the real problems; round 2 finds what round 1's
  fixes broke; round 3 usually confirms convergence. Beyond 4, expect polish, not gain.
- **`EXCHANGE_DEPTH`.** 3 for small artifacts, 5–6 for a full app or paper. Too high and
  the critics start inventing.
- **Weighting.** For internal tooling, weight the Master. For anything with users or
  students, weight the Novice — an unclear correct thing gets used incorrectly, which is
  indistinguishable from being wrong.
- **Economy tuning.** Some runs reweight the Novice toward prose economy (cutting bloat is
  the priority over, say, mobile accessibility). This changes *what counts as a finding*,
  not the Novice's mandate: clarity stays in scope alongside brevity (see §1). An economy
  pass that only ever proposes deletions has narrowed its own remit — it should also flag
  places where a word is missing, not just where one is spare.
- **The Novice is the harder role to play well.** The failure mode is a Novice who asks
  polite questions they already know the answer to. A good Novice is genuinely stuck and
  says exactly where.
