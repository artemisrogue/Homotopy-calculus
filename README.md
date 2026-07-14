# The Calculus of Homotopy Functors

A self-contained, graduate-level interactive teaching app for **Goodwillie
calculus** (the calculus of homotopy functors) and its relatives.

**Live site:** https://artemisrogue.github.io/Homotopy-calculus/

## Run it locally

No build step — it is a static site.

- **Simplest:** open `index.html` in a browser (it makes no network calls
  except loading KaTeX from a CDN).
- **Or with a server:**
  ```bash
  python serve.py            # http://localhost:8051
  python serve.py --port 9000
  ```

## Layout

```
index.html                        the app shell (header + #app-root; loads KaTeX + Plotly from a CDN)
functor-calculus.js               the module — window.renderFunctorCalculus(containerEl)
style.css                         stylesheet
references.json                   72 verified references (Goodwillie trilogy → Kosanović 2024)
FUNCTOR_CALCULUS_LIT_REVIEW.md    ~125 KB companion literature review (6 web-verified sections)
serve.py                          minimal static server
.nojekyll                         serve files as-is on GitHub Pages
```

## Contents

Nine sub-tabs:

1. **Overview** — the calculus ↔ functor-calculus dictionary, the three calculi, a timeline
2. **Cubes & Excision** — cubical diagrams, *n*-excision, Blakers–Massey; interactive squares gallery
3. **Taylor Tower** — the T_n / P_n construction, universal property, analyticity; interactive Taylor-series demo
4. **Sheafification** — P_n as a localization; manifold-calculus approximation as homotopy sheafification (Boavida de Brito–Weiss)
5. **Derivatives & Layers** — cross effects, the homogeneous classification, the chain rule; interactive cross-effect calculator
6. **Worked Examples** — the identity functor, Σ^∞Ω^∞, algebraic K-theory
7. **Knots & Embedding Calculus** — the Goodwillie–Weiss tower for spaces of long knots and finite-type invariants
8. **Other Calculi** — orthogonal, discrete/abelian, tangent ∞-categories
9. **Further Reading** — annotated bibliography, verified lecture notes, and a 14-week course plan

Every mathematical claim was checked against primary sources and passed through
two adversarial verification passes; see the literature-review document for the
audit note.

## Hosting on GitHub Pages

This repo serves directly from the default branch root (`index.html` is at the
top level, and `.nojekyll` disables Jekyll). To turn it on:
**Settings → Pages → Build and deployment → Source: Deploy from a branch →
Branch: `main` / `(root)` → Save.** The site appears at the Live-site URL above
within a minute or two.

## House conventions (for editing the module)

The module is an IIFE exposing a single `window.renderFunctorCalculus(containerEl)`,
with HTML built by string concatenation (never template literals), KaTeX via
`\(...\)` / `$$...$$`, and **no ASCII apostrophes inside the concatenated
strings** (use `&rsquo;`, Unicode primes, etc.) — a stray apostrophe silently
terminates the JS string. Tooltip `title="..."` text is plain Unicode only.
