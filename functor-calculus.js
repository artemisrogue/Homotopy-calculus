/**
 * functor-calculus.js — Calculus of Homotopy Functors module for KnotLab
 * Exposes window.renderFunctorCalculus(containerEl)
 *
 * Graduate-level introduction to Goodwillie calculus: cubical diagrams and
 * excision, the Taylor tower, polynomial approximation as sheafification,
 * derivatives and homogeneous layers, worked examples, and the
 * Goodwillie-Weiss embedding calculus applied to spaces of knots.
 *
 * HOUSE RULE: HTML is built with single-quoted concatenated strings. Never
 * write an ASCII apostrophe inside them (use &rsquo; / &lsquo; / Unicode
 * primes instead). Tooltip title="..." attributes are plain Unicode text
 * only - no LaTeX, no \( \) delimiters.
 */
(function () {
  'use strict';

  var SUB_TABS = [
    'Overview',
    'Cubes & Excision',
    'Taylor Tower',
    'Sheafification',
    'Derivatives & Layers',
    'Worked Examples',
    'Knots & Embedding Calculus',
    'Other Calculi',
    'Further Reading'
  ];

  // ───────────────────────────────────────────────────────────────────
  //  Small helpers
  // ───────────────────────────────────────────────────────────────────

  function mathRender(el) {
    try {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      }
    } catch (e) { /* KaTeX not loaded */ }
  }

  // Stirling numbers of the second kind, memoized. S(d,k) = number of
  // partitions of a d-element set into k non-empty blocks.
  var _stirling = {};
  function stirling2(d, k) {
    if (k === 0) return d === 0 ? 1 : 0;
    if (k > d) return 0;
    if (k === d) return 1;
    var key = d + ',' + k;
    if (_stirling[key] !== undefined) return _stirling[key];
    var v = k * stirling2(d - 1, k) + stirling2(d - 1, k - 1);
    _stirling[key] = v;
    return v;
  }

  function factorial(n) {
    var v = 1;
    for (var i = 2; i <= n; i++) v *= i;
    return v;
  }

  function binomial(n, k) {
    if (k < 0 || k > n) return 0;
    return Math.round(factorial(n) / (factorial(k) * factorial(n - k)));
  }

  // ───────────────────────────────────────────────────────────────────
  //  Sub-tab renderers (HTML string builders)
  // ───────────────────────────────────────────────────────────────────

  function overviewHTML() {
    return '' +
      '<div class="expo-panel">' +
        '<h3>The Calculus of Homotopy Functors</h3>' +
        '<p>The <strong>calculus of homotopy functors</strong>, created by Thomas Goodwillie in a trilogy of ' +
        'papers &mdash; <em>Calculus I: The first derivative of pseudoisotopy theory</em> (<em>K</em>-Theory, 1990), ' +
        '<em>Calculus II: Analytic functors</em> (<em>K</em>-Theory, 1992), and ' +
        '<em>Calculus III: Taylor series</em> (Geometry &amp; Topology, 2003) &mdash; imports the central idea of ' +
        'differential calculus into homotopy theory. Where classical calculus approximates a smooth function ' +
        '\\(f\\) near a point by polynomials \\(T_n f\\), functor calculus approximates a ' +
        '<span class="kl-term" title="Homotopy functor: a functor between categories of spaces (or spectra) that sends weak homotopy equivalences to weak homotopy equivalences.">homotopy functor</span> ' +
        '\\(F\\) &mdash; such as the identity \\(X \\mapsto X\\), stable homotopy \\(X \\mapsto \\Omega^\\infty\\Sigma^\\infty X\\), ' +
        'Waldhausen \\(K\\)-theory \\(X \\mapsto A(X)\\), or an embedding functor \\(V \\mapsto \\operatorname{Emb}(V,N)\\) &mdash; ' +
        'by <span class="kl-term" title="n-excisive functor: one that sends every strongly cocartesian (n+1)-cube of spaces to a cartesian cube. The functor-calculus analogue of a polynomial of degree at most n.">\\(n\\)-excisive functors</span>, ' +
        'assembled into a <strong>Taylor tower</strong></p>' +
        '<div class="formula-box">$$F \\;\\longrightarrow\\; \\cdots \\;\\longrightarrow\\; P_3 F \\;\\longrightarrow\\; P_2 F \\;\\longrightarrow\\; P_1 F \\;\\longrightarrow\\; P_0 F \\simeq F(*).$$</div>' +
        '<p>Each stage \\(P_n F\\) is the universal degree-\\(n\\) approximation to \\(F\\); the difference between ' +
        'consecutive stages is a <strong>homogeneous layer</strong> \\(D_n F\\), and each layer is classified by a ' +
        'single <span class="kl-term" title="Spectrum: a sequence of pointed spaces Eₙ with structure maps ΣEₙ → Eₙ₊₁; the objects representing generalized (co)homology theories. Stable homotopy theory is the study of spectra.">spectrum</span> ' +
        '\\(\\partial_n F\\) with an action of the symmetric group \\(\\Sigma_n\\) &mdash; the ' +
        '<strong>\\(n\\)-th derivative</strong> of \\(F\\). Under an analyticity hypothesis the tower converges, ' +
        'and one recovers \\(F\\) from its derivatives exactly as an analytic function is recovered from its ' +
        'Taylor coefficients.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>The dictionary</h3>' +
        '<p>The analogy is precise enough to organise the whole theory. Keep this table in mind throughout the ' +
        'module; the <em>Taylor Tower</em> sub-tab has an interactive demonstration of the left column.</p>' +
        '<table class="dict-table" style="width:100%;border-collapse:collapse">' +
          '<thead><tr style="border-bottom:1.5px solid #333">' +
            '<th style="padding:6px 10px;text-align:left;color:#2171b5">Differential calculus</th>' +
            '<th style="padding:6px 10px;text-align:left;color:#c04000">Calculus of functors</th>' +
          '</tr></thead>' +
          '<tbody>' +
            '<tr><td style="padding:4px 10px">smooth function \\(f : \\mathbb{R} \\to \\mathbb{R}\\)</td><td style="padding:4px 10px">homotopy functor \\(F : \\mathcal{S} \\to \\mathcal{S}\\) (or to spectra)</td></tr>' +
            '<tr><td style="padding:4px 10px">continuity</td><td style="padding:4px 10px">preservation of weak equivalences (+ filtered colimits)</td></tr>' +
            '<tr><td style="padding:4px 10px">polynomial of degree \\(\\leq n\\)</td><td style="padding:4px 10px">\\(n\\)-excisive functor</td></tr>' +
            '<tr><td style="padding:4px 10px">linear function</td><td style="padding:4px 10px">reduced 1-excisive functor \\(X \\mapsto \\Omega^\\infty(E \\wedge X)\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">Taylor polynomial \\(T_n f\\)</td><td style="padding:4px 10px">\\(n\\)-excisive approximation \\(P_n F\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">monomial \\(a_n x^n / n!\\)</td><td style="padding:4px 10px">homogeneous layer \\(D_n F(X) \\simeq \\Omega^\\infty\\bigl((\\partial_n F \\wedge X^{\\wedge n})_{h\\Sigma_n}\\bigr)\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">\\(n\\)-th derivative \\(f^{(n)}(0)\\)</td><td style="padding:4px 10px">derivative spectrum \\(\\partial_n F\\) with \\(\\Sigma_n\\)-action</td></tr>' +
            '<tr><td style="padding:4px 10px">Taylor series</td><td style="padding:4px 10px">Taylor tower \\(\\{P_n F\\}\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">radius of convergence</td><td style="padding:4px 10px">\\(\\rho\\)-analyticity: tower converges on \\(\\rho\\)-connected spaces</td></tr>' +
            '<tr><td style="padding:4px 10px">\\(f(0)\\)</td><td style="padding:4px 10px">\\(P_0 F = F(*)\\), the constant approximation</td></tr>' +
            '<tr><td style="padding:4px 10px">difference quotient / finite differences</td><td style="padding:4px 10px">cross effects \\(\\operatorname{cr}_n F\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">chain rule \\((f \\circ g)&prime;\\)</td><td style="padding:4px 10px">Arone&ndash;Ching chain rule: \\(\\partial_*(F \\circ G)\\) from \\(\\partial_* F \\circ \\partial_* G\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">truncation \\(T_n \\to T_{n-1}\\)</td><td style="padding:4px 10px">tower maps \\(P_n F \\to P_{n-1} F\\)</td></tr>' +
          '</tbody>' +
        '</table>' +
        '<p style="margin-top:0.9em;font-size:0.95em;color:#555">A second, independent analogy runs through the ' +
        'theory: polynomial approximation behaves like <strong>sheafification</strong>. In manifold calculus this is a ' +
        'theorem, not a metaphor &mdash; see the <em>Sheafification</em> sub-tab.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>Three calculi</h3>' +
        '<p>&ldquo;Functor calculus&rdquo; is a family of theories sharing the Taylor-tower template. The three ' +
        'classical members, all created between 1990 and 2003:</p>' +
        '<table class="dict-table" style="width:100%;border-collapse:collapse">' +
          '<thead><tr style="border-bottom:1.5px solid #333">' +
            '<th style="padding:6px 10px;text-align:left">Calculus</th>' +
            '<th style="padding:6px 10px;text-align:left">Functors</th>' +
            '<th style="padding:6px 10px;text-align:left">&ldquo;Polynomial&rdquo; means</th>' +
            '<th style="padding:6px 10px;text-align:left">Main reference</th>' +
          '</tr></thead>' +
          '<tbody>' +
            '<tr><td style="padding:4px 10px"><strong>Homotopy calculus</strong></td><td style="padding:4px 10px">\\(F : \\mathcal{S} \\to \\mathcal{S}\\) or \\(\\mathrm{Sp}\\)</td><td style="padding:4px 10px">\\(n\\)-excisive</td><td style="padding:4px 10px">Goodwillie, <em>Calculus I&ndash;III</em> (1990&ndash;2003)</td></tr>' +
            '<tr><td style="padding:4px 10px"><strong>Manifold (embedding) calculus</strong></td><td style="padding:4px 10px">presheaves \\(F : \\mathcal{O}(M)^{\\mathrm{op}} \\to \\mathcal{S}\\)</td><td style="padding:4px 10px">degree \\(\\leq k\\) on disjoint unions of balls</td><td style="padding:4px 10px">Weiss; Goodwillie&ndash;Weiss (Geom. Topol., 1999)</td></tr>' +
            '<tr><td style="padding:4px 10px"><strong>Orthogonal calculus</strong></td><td style="padding:4px 10px">continuous \\(F : \\mathcal{J} \\to \\mathcal{S}\\) on inner-product spaces</td><td style="padding:4px 10px">polynomial in the vector-space variable</td><td style="padding:4px 10px">Weiss (Trans. AMS, 1995)</td></tr>' +
          '</tbody>' +
        '</table>' +
        '<p style="margin-top:0.9em">The three interact: manifold calculus studies \\(\\operatorname{Emb}(M,N)\\) as \\(M\\) varies through ' +
        'open subsets, orthogonal calculus studies functors of the ambient dimension, and homotopy calculus supplies ' +
        'the layer-by-layer analysis of both.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>Why this module lives in KnotLab</h3>' +
        '<p>Applying manifold calculus to the embedding functor of the interval yields the ' +
        '<strong>Goodwillie&ndash;Weiss tower</strong> for the space of <em>long knots</em> ' +
        '\\(\\mathcal{K} = \\operatorname{Emb}_c(\\mathbb{R}, \\mathbb{R}^3)\\). Its stages \\(T_k \\mathcal{K}\\) produce knot ' +
        'invariants that are <strong>finite-type (Vassiliev) invariants</strong> &mdash; the same invariants that appear in the ' +
        '<em>Polynomial Invariants</em> tab as coefficients of the Conway polynomial and of the expansions of the ' +
        'Jones and HOMFLY-PT polynomials after the substitution \\(q = e^h\\) (Birman&ndash;Lin, 1993). The conjecture ' +
        'that the tower is a <em>universal</em> finite-type invariant (now a theorem rationally) is one of the deepest ' +
        'links between knot theory and abstract homotopy theory. The <em>Knots &amp; Embedding Calculus</em> sub-tab ' +
        'develops this bridge in detail.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>Historical origins</h3>' +
        '<p>Goodwillie did not invent the calculus to generalise Taylor series for their own sake. The motivating ' +
        'problem was concrete: compute <span class="kl-term" title="Pseudoisotopy space P(M): the space of diffeomorphisms of M × [0,1] fixing M × {0} and ∂M × [0,1]. Controls the difference between isotopy and concordance of diffeomorphisms.">pseudoisotopy spaces</span> ' +
        'and, through them, <span class="kl-term" title="Waldhausen A-theory A(X): the algebraic K-theory of the category of finite retractive spaces over X; equivalently K(Σ∞₊ΩX). Splits off Whitehead spectra controlling h-cobordism and pseudoisotopy.">Waldhausen&rsquo;s algebraic ' +
        '\\(K\\)-theory of spaces</span> \\(A(X)\\). <em>Calculus I</em> computes the first derivative of the ' +
        'pseudoisotopy functor; the technology of analytic functors in <em>Calculus II</em> was built to prove ' +
        'theorems of the form &ldquo;this map of functors is an equivalence because both sides have the same ' +
        'derivatives.&rdquo; That strategy culminated in the <strong>Dundas&ndash;Goodwillie&ndash;McCarthy theorem</strong> ' +
        'identifying relative algebraic \\(K\\)-theory with relative topological cyclic homology &mdash; see ' +
        '<em>Worked Examples</em>. Only in <em>Calculus III</em> (2003) did the tower itself, with its universal ' +
        'property and homogeneous classification, receive its definitive treatment. The modern, ' +
        '\\(\\infty\\)-categorical formulation is Chapter 6 of Lurie&rsquo;s <em>Higher Algebra</em>; the standard ' +
        'contemporary survey is Arone&ndash;Ching, <em>Goodwillie calculus</em> (Handbook of Homotopy Theory, 2020).</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>Timeline</h3>' +
        '<table class="dict-table" style="width:100%;border-collapse:collapse">' +
          '<tbody>' +
            '<tr><td style="padding:3px 10px;white-space:nowrap"><strong>1990&ndash;92</strong></td><td style="padding:3px 10px">Goodwillie, <em>Calculus I&ndash;II</em>: derivatives, analyticity, higher Blakers&ndash;Massey; ICM address (Kyoto 1990)</td></tr>' +
            '<tr><td style="padding:3px 10px"><strong>1995</strong></td><td style="padding:3px 10px">Johnson: derivatives of the identity; Weiss: orthogonal calculus</td></tr>' +
            '<tr><td style="padding:3px 10px"><strong>1999</strong></td><td style="padding:3px 10px">Weiss &amp; Goodwillie&ndash;Weiss: embedding calculus; Arone&ndash;Mahowald: the identity tower on spheres</td></tr>' +
            '<tr><td style="padding:3px 10px"><strong>2003</strong></td><td style="padding:3px 10px">Goodwillie, <em>Calculus III</em>: the Taylor tower in final form (after a decade as a preprint)</td></tr>' +
            '<tr><td style="padding:3px 10px"><strong>2005</strong></td><td style="padding:3px 10px">Ching: operad structure on \\(\\partial_* \\mathrm{Id}\\); BCSS: the tower discovers the Casson knot invariant</td></tr>' +
            '<tr><td style="padding:3px 10px"><strong>2010&ndash;13</strong></td><td style="padding:3px 10px">Lambrechts&ndash;Turchin&ndash;Voli&cacute;: rational homology of knot spaces; Arone&ndash;Ching: chain rules; Boavida de Brito&ndash;Weiss: manifold calculus = homotopy sheafification; Dundas&ndash;Goodwillie&ndash;McCarthy book</td></tr>' +
            '<tr><td style="padding:3px 10px"><strong>2015&ndash;18</strong></td><td style="padding:3px 10px">Goodwillie&ndash;Klein: multiple disjunction; Munson&ndash;Voli&cacute; textbook; BCKS: tower invariants are finite-type; Lurie, <em>Higher Algebra</em> ch. 6; ABFJ: calculus meets higher topos theory</td></tr>' +
            '<tr><td style="padding:3px 10px"><strong>2021&ndash;24</strong></td><td style="padding:3px 10px">Heuts: Goodwillie approximations to higher categories; Boavida de Brito&ndash;Horel: Galois symmetries of knot spaces; Bauer&ndash;Burke&ndash;Ching: tangent \\(\\infty\\)-categories; Kosanovi&cacute;: surjectivity and rational universality of the knot tower</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>How to read this module</h3>' +
        '<ul>' +
          '<li><strong>Cubes &amp; Excision</strong> &mdash; the language: cubical diagrams, cartesian and cocartesian squares, ' +
          'the definition of \\(n\\)-excision, Blakers&ndash;Massey. Interactive gallery of squares.</li>' +
          '<li><strong>Taylor Tower</strong> &mdash; the \\(T_n\\) and \\(P_n\\) constructions, universal property, convergence ' +
          'and analyticity. Interactive classical-Taylor-series comparison.</li>' +
          '<li><strong>Sheafification</strong> &mdash; \\(P_n\\) as a localization; the theorem that manifold-calculus ' +
          'approximation <em>is</em> homotopy sheafification.</li>' +
          '<li><strong>Derivatives &amp; Layers</strong> &mdash; cross effects, homogeneous functors, the classification ' +
          'theorem, derivatives as spectra. Interactive cross-effect calculator.</li>' +
          '<li><strong>Worked Examples</strong> &mdash; the identity functor, \\(\\Sigma^\\infty\\Omega^\\infty\\), and ' +
          'algebraic \\(K\\)-theory.</li>' +
          '<li><strong>Knots &amp; Embedding Calculus</strong> &mdash; the Goodwillie&ndash;Weiss tower for spaces of knots ' +
          'and finite-type invariants.</li>' +
          '<li><strong>Other Calculi</strong> &mdash; orthogonal calculus, discrete/abelian calculus, tangent ' +
          '\\(\\infty\\)-categories.</li>' +
          '<li><strong>Further Reading</strong> &mdash; annotated bibliography and a 14-week course plan.</li>' +
        '</ul>' +
        '<p style="font-size:0.95em;color:#555">Prerequisites: homotopy (co)limits, basic stable homotopy theory ' +
        '(spectra, smash products), and comfort with homotopy fibers/cofibers. The <em>Homological Invariants</em> ' +
        'tab&rsquo;s introduction to spectra-level thinking is helpful but not required.</p>' +
      '</div>';
  }

  function cubesHTML() {
    return '' +
      '<div class="expo-panel">' +
        '<h3>1. Cubical diagrams</h3>' +
        '<p>Fix a finite set \\(S\\) with \\(|S| = n\\). An <strong>\\(n\\)-cube of spaces</strong> is a functor</p>' +
        '<div class="formula-box">$$\\mathcal{X} : \\mathcal{P}(S) \\longrightarrow \\mathcal{S}, \\qquad T \\mapsto \\mathcal{X}(T),$$</div>' +
        '<p>from the poset of subsets of \\(S\\). A \\(0\\)-cube is a space, a \\(1\\)-cube is a map, a \\(2\\)-cube is a ' +
        'commutative square, a \\(3\\)-cube is a commutative cube. Two comparison maps measure how close a cube is to ' +
        'being a homotopy (co)limit diagram:</p>' +
        '<div class="formula-box">$$a(\\mathcal{X}) : \\mathcal{X}(\\varnothing) \\to \\operatorname*{holim}_{\\varnothing \\neq T \\subseteq S} \\mathcal{X}(T), \\qquad b(\\mathcal{X}) : \\operatorname*{hocolim}_{T \\subsetneq S} \\mathcal{X}(T) \\to \\mathcal{X}(S).$$</div>' +
        '<p>The cube is <strong><span class="kl-term" title="Cartesian cube: the initial vertex maps by a weak equivalence to the homotopy limit of the rest of the cube. For squares: a homotopy pullback square.">cartesian</span></strong> if \\(a(\\mathcal{X})\\) is an equivalence, ' +
        '<strong>\\(k\\)-cartesian</strong> if \\(a(\\mathcal{X})\\) is \\(k\\)-connected, and ' +
        '<strong><span class="kl-term" title="Cocartesian cube: the terminal vertex is the homotopy colimit of the rest of the cube. For squares: a homotopy pushout square.">cocartesian</span></strong> if \\(b(\\mathcal{X})\\) is an equivalence ' +
        '(dually, \\(k\\)-cocartesian). A square is cartesian exactly when it is a homotopy pullback and cocartesian ' +
        'exactly when it is a homotopy pushout.</p>' +
        '<p>An \\(n\\)-cube with \\(n \\geq 2\\) is <strong>strongly cocartesian</strong> if every \\(2\\)-dimensional face is ' +
        'cocartesian (this forces the whole cube and all higher faces to be cocartesian). Strongly cocartesian cubes ' +
        'are the functor-calculus stand-in for the affine grids on which one takes finite differences of a function: ' +
        'they are determined by the \\(n\\) initial maps \\(\\mathcal{X}(\\varnothing) \\to \\mathcal{X}(\\{s\\})\\), just as an ' +
        'affine lattice in \\(\\mathbb{R}^n\\) is determined by its edges at one corner.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>2. Excision and \\(n\\)-excision</h3>' +
        '<p>Let \\(F\\) be a homotopy functor (of spaces or spectra). Goodwillie defines (<em>Calculus II</em>, 1992; ' +
        '<em>Calculus III</em>, 2003):</p>' +
        '<div class="formula-box">$$F \\text{ is } n\\text{-excisive} \\iff F \\text{ sends every strongly cocartesian } (n{+}1)\\text{-cube to a cartesian cube}.$$</div>' +
        '<ul>' +
          '<li>\\(0\\)-excisive = homotopy constant: \\(F(X) \\simeq F(*)\\) for all \\(X\\).</li>' +
          '<li>\\(1\\)-excisive = sends homotopy pushouts to homotopy pullbacks. The name comes from the ' +
          '<span class="kl-term" title="Eilenberg–Steenrod excision axiom: H(X) can be computed from a cover; equivalently the Mayer–Vietoris square of a CW pair maps to a long exact sequence. Homology is the shadow of a 1-excisive functor.">excision axiom</span>: ' +
          'for a reduced, finitary \\(1\\)-excisive \\(F\\), the sequence \\(\\pi_* F(X)\\) is a generalized homology theory, and in fact ' +
          '\\(F(X) \\simeq \\Omega^\\infty(E \\wedge X)\\) for a spectrum \\(E\\). Linear functors <em>are</em> homology theories.</li>' +
          '<li>\\(n\\)-excisive functors form a category \\(\\operatorname{Exc}_n\\); every \\(n\\)-excisive functor is ' +
          '\\((n{+}1)\\)-excisive, mirroring \\(\\deg \\leq n \\Rightarrow \\deg \\leq n{+}1\\).</li>' +
        '</ul>' +
        '<p><strong>The identity is not \\(1\\)-excisive.</strong> The square below (suspension of \\(S^{n-1}\\)) is a homotopy ' +
        'pushout but not a homotopy pullback; the failure is measured by the Freudenthal suspension theorem and is the ' +
        'seed of the whole subject: if \\(\\mathrm{Id}\\) were \\(1\\)-excisive, unstable homotopy theory would collapse ' +
        'into stable homotopy theory.</p>' +
        '<details class="kl-example"><summary>Example: products of excisive functors</summary>' +
        '<p>If \\(F\\) is \\(m\\)-excisive and \\(G\\) is \\(n\\)-excisive (to spectra), then \\(X \\mapsto F(X) \\wedge G(X)\\) is ' +
        '\\((m{+}n)\\)-excisive &mdash; the analogue of \\(\\deg(fg) = \\deg f + \\deg g\\). Likewise ' +
        '\\(X \\mapsto \\Omega^\\infty(E \\wedge X^{\\wedge n})\\) is \\(n\\)-excisive for any spectrum \\(E\\); these are the model ' +
        '\\(n\\)-homogeneous functors classified in <em>Derivatives &amp; Layers</em>.</p>' +
        '</details>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>3. Interactive: a gallery of squares</h3>' +
        '<p>Cartesian-ness and cocartesian-ness are logically independent. Choose a square and inspect both verdicts; ' +
        'the connectivity estimates come from the Blakers&ndash;Massey theorem below.</p>' +
        '<div class="kl-interactive">' +
          '<div class="kl-controls" style="margin-bottom:0.6em">' +
            '<label>Square: ' +
            '<select id="fc-cube-sel">' +
              '<option value="susp" selected>suspension square of S&#8319;&#8315;&#185;</option>' +
              '<option value="prod">product square X &times; Y</option>' +
              '<option value="hopf">cofiber square of the Hopf map</option>' +
              '<option value="const">constant square</option>' +
            '</select></label>' +
          '</div>' +
          '<div id="fc-cube-box"></div>' +
        '</div>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>4. The Blakers&ndash;Massey theorem</h3>' +
        '<p>The engine converting cocartesian information into cartesian information &mdash; the reason calculus has any ' +
        'traction in an unstable world:</p>' +
        '<div class="formula-box">$$\\text{If } \\mathcal{X} \\text{ is a homotopy pushout square whose initial maps are } k_1\\text{- and } k_2\\text{-connected,}$$' +
        '$$\\text{then } \\mathcal{X} \\text{ is } (k_1 + k_2 - 1)\\text{-cartesian.}$$</div>' +
        '<p>(Blakers&ndash;Massey, 1949&ndash;53, for the pair/triad case; see Munson&ndash;Voli&cacute;, ' +
        '<em>Cubical Homotopy Theory</em>, Chapter 4 for the modern cubical statement and proof.) The ' +
        '<strong>generalized Blakers&ndash;Massey theorem</strong> (Goodwillie, <em>Calculus II</em>, Theorem 2.3) extends this to ' +
        'cubes: a strongly cocartesian \\(n\\)-cube whose \\(n\\) initial maps are \\(k_s\\)-connected is ' +
        '\\(\\bigl(1 - n + \\sum_s k_s\\bigr)\\)-cartesian. This estimate is exactly what makes the identity functor ' +
        '<em>analytic</em> (see <em>Taylor Tower</em>): excision fails, but only in a range that improves linearly with ' +
        'connectivity.</p>' +
        '<details class="kl-proof"><summary>Proof sketch: Freudenthal from Blakers&ndash;Massey</summary>' +
        '<p>Apply Blakers&ndash;Massey to the suspension square of an \\((m{-}1)\\)-connected space \\(X\\): both maps ' +
        '\\(X \\to CX \\simeq *\\) are \\(m\\)-connected (the homotopy fiber of \\(X \\to *\\) is \\(X\\) itself, which is \\((m-1)\\)-connected), so the square is \\((2m-1)\\)-cartesian. ' +
        'Cartesian-ness would say \\(X \\simeq \\Omega\\Sigma X\\); being \\((2m-1)\\)-cartesian says the unit ' +
        '\\(X \\to \\Omega\\Sigma X\\) is \\((2m-1)\\)-connected, which is precisely the Freudenthal suspension theorem: ' +
        '\\(\\pi_i(X) \\to \\pi_{i+1}(\\Sigma X)\\) is an isomorphism for \\(i < 2m-1\\) and onto for \\(i = 2m-1\\). ' +
        'Iterating, \\(X \\to \\Omega^k \\Sigma^k X \\to \\cdots \\to \\Omega^\\infty\\Sigma^\\infty X = Q(X)\\): stable homotopy ' +
        'is the limit of the process, and \\(Q = \\Omega^\\infty\\Sigma^\\infty\\) is exactly \\(P_1(\\mathrm{Id})\\).</p>' +
        '</details>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>5. Practice</h3>' +
        '<details class="kl-practice"><summary>Exercise 1: pullback squares</summary>' +
        '<p>Show directly from the definition of homotopy pullback that the product square ' +
        '(\\(X \\times Y\\) mapping to \\(X\\) and \\(Y\\), both mapping to a point) is cartesian for all \\(X, Y\\). ' +
        'Then compute its homotopy pushout and show the square is cocartesian if and only if the join ' +
        '\\(X * Y \\simeq \\Sigma(X \\wedge Y)\\) is contractible. Deduce that it is cocartesian whenever \\(X\\) or ' +
        '\\(Y\\) is contractible, and check that it fails for \\(X = Y = S^0\\). Harder: the converse is false &mdash; ' +
        'find non-contractible \\(X, Y\\) with \\(X * Y \\simeq *\\). <em>Hint: the pushout of ' +
        '\\(X \\leftarrow X \\times Y \\to Y\\) is the join \\(X * Y\\), and \\(X * Y \\simeq \\Sigma(X \\wedge Y)\\) for ' +
        'well-pointed spaces; for the last part try the Moore spaces \\(M(\\mathbb{Z}/2, 1) = \\mathbb{R}P^2\\) and ' +
        '\\(M(\\mathbb{Z}/3, 1)\\) and apply the K&uuml;nneth theorem to the smash.</em></p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 2: strong cocartesian-ness is a 2-face condition</summary>' +
        '<p>Prove that in a strongly cocartesian \\(3\\)-cube, the full cube is cocartesian. ' +
        '<em>Hint: write the hocolim over the punctured cube as an iterated pushout and use that pushouts of ' +
        'pushouts are pushouts (the &ldquo;pasting law&rdquo;).</em></p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 3: 0-excisive and 1-excisive functors</summary>' +
        '<p>(a) Show that \\(F\\) is \\(0\\)-excisive iff \\(F(X) \\to F(*)\\) is an equivalence for every \\(X\\). ' +
        '(b) Show that if \\(F\\) is \\(1\\)-excisive and reduced (\\(F(*) \\simeq *\\)), then \\(F\\) sends finite wedges to ' +
        'products: \\(F(X \\vee Y) \\simeq F(X) \\times F(Y)\\). This is the first hint that \\(1\\)-excisive functors are ' +
        '&ldquo;additive,&rdquo; i.e. linear.</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 4: composites &mdash; degrees do <em>not</em> multiply</summary>' +
        '<p>(a) Show that if \\(F\\) is \\(m\\)-excisive and \\(G\\) preserves finite homotopy limits (e.g. ' +
        '\\(G = \\Omega\\), or \\(G = \\Omega^\\infty\\) applied to a spectrum-valued \\(F\\)), then \\(G \\circ F\\) is ' +
        '\\(m\\)-excisive: \\(G\\) preserves cartesian cubes. ' +
        '(b) Show that if \\(G\\) preserves homotopy pushouts (e.g. \\(G = \\Sigma\\) or \\(G = {-} \\wedge K\\)), then ' +
        '\\(F \\circ G\\) is \\(m\\)-excisive: \\(G\\) preserves strongly cocartesian cubes. ' +
        '(c) In general, however, a composite of excisive functors need <em>not</em> be excisive of <em>any</em> ' +
        'degree &mdash; unlike \\(\\deg(f \\circ g) = \\deg f \\cdot \\deg g\\) for polynomials. Using the stable ' +
        'splitting \\(Q(A \\times B) \\simeq QA \\times QB \\times Q(A \\wedge B)\\) together with Exercise 3(b), show ' +
        'that \\(Q \\circ Q\\) is reduced but not \\(1\\)-excisive, even though \\(Q = \\Omega^\\infty\\Sigma^\\infty = ' +
        'P_1(\\mathrm{Id})\\) is \\(1\\)-excisive. (Equivalently: \\(\\Sigma^\\infty\\Omega^\\infty\\) on spectra is a ' +
        'composite of two \\(1\\)-excisive functors whose Taylor tower has nonvanishing layers in every degree, by ' +
        'the Snaith splitting.) The correct chain rule lives at the level of derivatives &mdash; see ' +
        '<em>Derivatives &amp; Layers</em>.</p>' +
        '</details>' +
      '</div>';
  }

  function towerHTML() {
    return '' +
      '<div class="expo-panel">' +
        '<h3>1. The construction \\(T_n\\): forcing excision one cover at a time</h3>' +
        '<p>For a finite set \\(U\\), let \\(X * U\\) denote the join of \\(X\\) with \\(U\\) &mdash; the space obtained by ' +
        'attaching \\(|U|\\) cone points to \\(X\\): \\(X * \\{u\\} = CX\\) is the cone, and \\(X * \\{u, v\\}\\) is the ' +
        'unreduced suspension of \\(X\\). Goodwillie (<em>Calculus III</em>, 2003) defines</p>' +
        '<div class="formula-box">$$T_n F(X) \\;=\\; \\operatorname*{holim}_{\\varnothing \\neq U \\subseteq \\{0,1,\\dots,n\\}} F(X * U),$$</div>' +
        '<p>with its natural map \\(t_n : F(X) \\to T_n F(X)\\) induced by \\(X \\to X * U\\). The \\((n{+}1)\\)-cube ' +
        '\\(U \\mapsto X * U\\) is strongly cocartesian, so if \\(F\\) were already \\(n\\)-excisive, \\(t_n\\) would be an ' +
        'equivalence. In general \\(T_n F\\) is a &ldquo;partial correction&rdquo;: it repairs the failure of excision on ' +
        'these particular canonical cubes. Iterating repairs everything:</p>' +
        '<div class="formula-box">$$P_n F(X) \\;=\\; \\operatorname*{hocolim}\\Bigl( F(X) \\xrightarrow{\\;t_n\\;} T_n F(X) \\xrightarrow{T_n t_n} T_n^2 F(X) \\longrightarrow \\cdots \\Bigr).$$</div>' +
        '<p><strong>Theorem (Goodwillie, <em>Calculus III</em>, Theorem 1.8).</strong> \\(P_n F\\) is \\(n\\)-excisive, and ' +
        '\\(p_n : F \\to P_n F\\) is the universal approximation: any natural transformation \\(F \\to G\\) with \\(G\\) ' +
        '\\(n\\)-excisive factors through \\(p_n\\), uniquely up to homotopy. Categorically, \\(P_n\\) is a ' +
        '<span class="kl-term" title="Localization: a reflection onto a full subcategory; an idempotent construction L with a natural map X → LX that is an equivalence iff X already lies in the subcategory. Sheafification is the standard example.">localization</span> ' +
        'onto the subcategory \\(\\operatorname{Exc}_n\\) of \\(n\\)-excisive functors &mdash; the theme of the ' +
        '<em>Sheafification</em> sub-tab.</p>' +
        '<details class="kl-proof"><summary>Proof idea: why iterating \\(T_n\\) works</summary>' +
        '<p>Given a strongly cocartesian \\((n{+}1)\\)-cube \\(\\mathcal{X}\\), one compares \\(F(\\mathcal{X})\\) with the ' +
        'cubes obtained by joining each vertex with subsets of \\(\\{0,\\dots,n\\}\\). The key geometric input: the ' +
        'joined cubes interpolate between \\(F(\\mathcal{X})\\) and cubes of higher-connectivity maps, and each ' +
        'application of \\(T_n\\) improves by a definite amount the extent to which \\(F(\\mathcal{X})\\) fails to be ' +
        'cartesian. In the colimit the failure vanishes. The mechanism is the &ldquo;join trick&rdquo; of ' +
        '<em>Calculus III</em>, &sect;1: a strongly cocartesian cube built from \\(X\\) maps into the corresponding ' +
        'cubes built from the joins \\(X * U\\), and those joined cubes are cartesian <em>after applying any</em> ' +
        '\\(F\\) &mdash; they are assembled from equivalences &mdash; so each application of \\(T_n\\) absorbs one layer ' +
        'of the discrepancy, enabling an induction.</p>' +
        '</details>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>2. The tower</h3>' +
        '<p>The inclusion \\(\\operatorname{Exc}_{n-1} \\subset \\operatorname{Exc}_n\\) induces natural maps ' +
        '\\(q_n : P_n F \\to P_{n-1} F\\) commuting with the \\(p_n\\), assembling the <strong>Taylor tower</strong>. Its ' +
        '<span class="kl-term" title="Homogeneous layer DₙF = hofib(PₙF → Pₙ₋₁F): the n-homogeneous part of F; for finitary F it is classified by the derivative spectrum ∂ₙF with its Σₙ-action.">layers</span> ' +
        '\\(D_n F = \\operatorname{hofib}(q_n)\\) are the homogeneous pieces:</p>' +
        '<div class="formula-box">' +
        '$$\\begin{array}{ccc}' +
        ' & & \\vdots \\\\' +
        ' & & \\big\\downarrow \\\\' +
        'D_3 F(X) & \\longrightarrow & P_3 F(X) \\\\' +
        ' & & \\big\\downarrow \\\\' +
        'D_2 F(X) & \\longrightarrow & P_2 F(X) \\\\' +
        ' & & \\big\\downarrow \\\\' +
        'D_1 F(X) & \\longrightarrow & P_1 F(X) \\\\' +
        ' & & \\big\\downarrow \\\\' +
        ' & & P_0 F(X) \\simeq F(*)' +
        '\\end{array}$$' +
        '</div>' +
        '<p>and \\(F(X)\\) maps compatibly to the whole column via \\(p_n\\). Each \\(D_n F\\) is ' +
        '<strong>\\(n\\)-homogeneous</strong> (\\(n\\)-excisive with vanishing \\(P_{n-1}\\)) and &mdash; for finitary ' +
        '\\(F\\) &mdash; is classified by a single ' +
        'spectrum with \\(\\Sigma_n\\)-action; see <em>Derivatives &amp; Layers</em>. This is the precise sense in ' +
        'which the tower is a Taylor series: stage \\(n\\) differs from stage \\(n{-}1\\) by a single ' +
        '&ldquo;monomial of degree \\(n\\).&rdquo;</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>3. Interactive: the classical picture</h3>' +
        '<p>Everything above shadows the classical construction of Taylor polynomials. Choose a function and raise ' +
        'the degree; watch where the approximation is good (inside the radius of convergence) and where it is ' +
        'hopeless (outside). The dictionary readout below the plot translates each feature into functor calculus.</p>' +
        '<div class="kl-interactive">' +
          '<div class="kl-controls" style="margin-bottom:0.6em">' +
            '<label>Function: ' +
            '<select id="fc-taylor-fn">' +
              '<option value="exp" selected>eˣ</option>' +
              '<option value="sin">sin x</option>' +
              '<option value="log1p">ln(1+x)</option>' +
              '<option value="geom">1/(1−x)</option>' +
              '<option value="atan">arctan x</option>' +
            '</select></label>' +
            '<label style="margin-left:1.2em">degree n = <span id="fc-taylor-nval">3</span> ' +
            '<input type="range" id="fc-taylor-n" min="0" max="12" step="1" value="3" style="vertical-align:middle;width:180px"></label>' +
          '</div>' +
          '<div id="fc-taylor-plot" style="width:100%;height:360px"></div>' +
          '<div id="fc-taylor-readout"></div>' +
        '</div>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>4. Convergence and analyticity</h3>' +
        '<p>When does \\(F(X) \\to \\operatorname*{holim}_n P_n F(X)\\) recover \\(F\\)? Goodwillie&rsquo;s answer ' +
        '(<em>Calculus II</em>, 1992) mirrors the theory of analytic functions. \\(F\\) is <strong>stably ' +
        '\\(n\\)-excisive</strong> with constants \\((c, \\kappa)\\) if it sends strongly cocartesian \\((n{+}1)\\)-cubes ' +
        'with \\(k_s\\)-connected initial maps (\\(k_s \\geq \\kappa\\)) to \\(\\bigl(-c + \\sum k_s\\bigr)\\)-cartesian cubes; ' +
        'and \\(F\\) is <strong>\\(\\rho\\)-analytic</strong> if it is stably \\(n\\)-excisive with constants ' +
        '\\((n\\rho - q, \\rho + 1)\\) for all \\(n\\) and some fixed \\(q\\). The number \\(\\rho\\) plays the role of ' +
        '(the reciprocal of) a radius of convergence:</p>' +
        '<div class="formula-box">$$F \\ \\rho\\text{-analytic and } X \\ \\rho\\text{-connected} \\;\\Longrightarrow\\; F(X) \\xrightarrow{\\ \\simeq\\ } \\operatorname*{holim}_n P_n F(X).$$</div>' +
        '<ul>' +
          '<li>The <strong>identity functor is \\(1\\)-analytic</strong>: this is a repackaging of the generalized ' +
          'Blakers&ndash;Massey theorem. Hence the tower of \\(\\mathrm{Id}\\) converges on simply connected spaces ' +
          '(indeed on nilpotent spaces, by later work).</li>' +
          '<li>Waldhausen&rsquo;s \\(A\\)-theory is \\(1\\)-analytic; stable homotopy ' +
          '\\(\\Sigma^\\infty \\Omega^\\infty\\) is \\(0\\)-analytic.</li>' +
          '<li>Convergence can fail dramatically outside the radius: for \\(X\\) not nilpotent the tower of the ' +
          'identity can converge to the wrong thing (its limit computes a localization/completion of \\(X\\), not ' +
          '\\(X\\) itself) &mdash; exactly like \\(\\sum x^n\\) diverging for \\(|x| \\geq 1\\).</li>' +
        '</ul>' +
        '<p style="font-size:0.95em;color:#555">Warning on conventions: some authors index analyticity so that ' +
        '&ldquo;\\(\\rho\\)-analytic&rdquo; functors converge on \\(\\rho\\)-connected spaces (as here), others shift by one. ' +
        'When citing a convergence range, always check which convention the source uses.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>5. Practice</h3>' +
        '<details class="kl-practice"><summary>Exercise 1: the bottom of the tower</summary>' +
        '<p>Show from the definition that \\(T_0 F(X) = F(CX) \\simeq F(*)\\) for homotopy functors, and conclude ' +
        '\\(P_0 F(X) \\simeq F(*)\\): the constant approximation is the &ldquo;value at the basepoint,&rdquo; ' +
        'i.e. \\(f(0)\\).</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 2: \\(P_1\\) as stabilization</summary>' +
        '<p>Let \\(F\\) be reduced (\\(F(*) \\simeq *\\)). Show \\(T_1 F(X) \\simeq \\Omega F(\\Sigma X)\\) ' +
        '(the punctured square has two contractible corners), and conclude</p>' +
        '<div class="formula-box">$$P_1 F(X) \\;\\simeq\\; \\operatorname*{hocolim}_n \\Omega^n F(\\Sigma^n X).$$</div>' +
        '<p>For \\(F = \\mathrm{Id}\\) this is \\(Q = \\Omega^\\infty \\Sigma^\\infty\\): the linearization of the identity ' +
        'is stable homotopy theory. This exercise is the single most important computation in the subject.</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 3: excisive functors are fixed points</summary>' +
        '<p>Show directly that if \\(F\\) is \\(n\\)-excisive then \\(t_n : F \\to T_n F\\) is an equivalence, and ' +
        'conversely that any functor for which \\(t_n\\) is an equivalence is \\(n\\)-excisive on the canonical join ' +
        'cubes. (The full converse requires the join trick.)</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 4: towers of composites</summary>' +
        '<p>For reduced \\(F\\), relate \\(P_1(F \\circ \\Sigma)\\) and \\(P_1(F) \\circ \\Sigma\\). More generally convince ' +
        'yourself that \\(P_n\\) does <em>not</em> commute with composition &mdash; the failure is the subject of the ' +
        'chain rule (see <em>Derivatives &amp; Layers</em>).</p>' +
        '</details>' +
      '</div>';
  }

  function sheafHTML() {
    return '' +
      '<div class="expo-panel">' +
        '<h3>1. Polynomial approximation is a localization</h3>' +
        '<p>Alongside the Taylor-series analogy runs a second, more categorical one. The \\(n\\)-excisive functors form a ' +
        'full subcategory \\(\\operatorname{Exc}_n \\subset \\operatorname{Fun}(\\mathcal{S}, \\mathcal{S})\\), and ' +
        'Goodwillie&rsquo;s theorem says that \\(P_n\\) is a <strong>reflection</strong> onto it: \\(P_n\\) is idempotent ' +
        '(\\(P_n P_n \\simeq P_n\\)), comes with a unit \\(F \\to P_n F\\), and is universal. In Lurie&rsquo;s ' +
        '\\(\\infty\\)-categorical treatment (<em>Higher Algebra</em>, &sect;6.1) this is made precise: for functors ' +
        'out of a small \\(\\infty\\)-category &mdash; e.g. finite pointed spaces, equivalently finitary functors on ' +
        'all spaces &mdash; the functor category is presentable and \\(\\operatorname{Exc}_n\\) is an accessible ' +
        'localization of it. Homotopy theorists have a ' +
        'canonical mental model for such reflections: <strong>sheafification</strong>, the reflection of presheaves onto ' +
        'sheaves. The parallel is remarkably tight:</p>' +
        '<table class="dict-table" style="width:100%;border-collapse:collapse">' +
          '<thead><tr style="border-bottom:1.5px solid #333">' +
            '<th style="padding:6px 10px;text-align:left;color:#2171b5">Sheaf theory</th>' +
            '<th style="padding:6px 10px;text-align:left;color:#c04000">Functor calculus</th>' +
          '</tr></thead>' +
          '<tbody>' +
            '<tr><td style="padding:4px 10px">presheaf \\(F\\) on a site</td><td style="padding:4px 10px">homotopy functor \\(F\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">covering family \\(\\{U_i \\to V\\}\\)</td><td style="padding:4px 10px">strongly cocartesian \\((n{+}1)\\)-cube</td></tr>' +
            '<tr><td style="padding:4px 10px">descent: \\(F(V) \\simeq \\operatorname{holim} F(\\check{C}_\\bullet)\\)</td><td style="padding:4px 10px">cartesian-ness of \\(F(\\mathcal{X})\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">sheaf</td><td style="padding:4px 10px">\\(n\\)-excisive functor</td></tr>' +
            '<tr><td style="padding:4px 10px">Grothendieck plus construction \\(F^+\\)</td><td style="padding:4px 10px">\\(T_n F\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">sheafification \\(= \\) iterated plus construction</td><td style="padding:4px 10px">\\(P_n F = \\operatorname{hocolim}_k T_n^k F\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">stalks / local data</td><td style="padding:4px 10px">derivatives \\(\\partial_1 F, \\dots, \\partial_n F\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">sheafification is left exact</td><td style="padding:4px 10px">\\(P_n\\) is left exact too (Lurie, HA 6.1.1.10) &mdash; but <strong>not topological</strong></td></tr>' +
          '</tbody>' +
        '</table>' +
        '<p style="margin-top:0.9em">Both constructions repair a gluing failure by a colimit of corrections; both are ' +
        'idempotent reflections; one iteration of the correction is not enough in general; and both reflections even ' +
        'preserve finite homotopy limits. Anel&ndash;Biedermann&ndash;Finster&ndash;Joyal ' +
        '(<em>Goodwillie&rsquo;s calculus of functors and higher topos theory</em>, J. Topology 11, 2018) pushed the ' +
        'parallel to its limit: for suitable source and target, the \\(n\\)-excisive functors form an ' +
        '\\(\\infty\\)-<span class="kl-term" title="∞-topos: an ∞-category equivalent to an accessible left exact localization of presheaves of spaces; the homotopy-theoretic generalization of a category of sheaves.">topos</span>, ' +
        'and topos-theoretic technology yields a new proof and generalization of the Blakers&ndash;Massey theorem. ' +
        'The true <em>dis</em>analogy is subtler: the localization \\(P_n\\) is accessible and left exact but ' +
        '<strong>not topological</strong> &mdash; it is not generated by monomorphisms, so \\(n\\)-excisiveness is not the ' +
        'descent condition of any Grothendieck topology on the source. &ldquo;Excisive sheaf theory&rdquo; on spaces is ' +
        'a structural analogy at the level of localization theory. On manifolds, it becomes a literal theorem.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>2. \\(T_n\\) as a plus construction</h3>' +
        '<p>Recall Grothendieck&rsquo;s <span class="kl-term" title="Plus construction F⁺(V) = colim over covers of V of the Čech descent object. For a presheaf of sets, applying it twice yields the sheafification; in homotopy theory transfinitely many iterations may be needed.">plus construction</span>: ' +
        '\\(F^+(V)\\) replaces \\(F(V)\\) by the (co)limit over covers of \\(V\\) of the &Ccaron;ech descent data of ' +
        '\\(F\\) on the cover. For presheaves of <em>sets</em>, \\(F^{++}\\) is already a sheaf; for presheaves of ' +
        'spaces, one iterates transfinitely. Now compare: \\(T_n F(X) = \\operatorname{holim}_{U \\neq \\varnothing} F(X * U)\\) ' +
        'replaces \\(F(X)\\) by a homotopy limit of the values of \\(F\\) on a canonical cubical family of enlargements ' +
        'of \\(X\\), indexed by the poset of nonempty subsets of \\(\\{0, \\dots, n\\}\\) &mdash; the same indexing shape ' +
        'as a &Ccaron;ech nerve on an \\((n{+}1)\\)-element cover. And \\(P_n = \\operatorname{hocolim}_k T_n^k\\) ' +
        'iterates until the correction stabilises &mdash; countably many steps suffice here because homotopy groups are ' +
        'finitary. The formal shape of the two constructions &mdash; an idempotent-when-iterated correction given by a ' +
        'homotopy limit over a canonical diagram &mdash; is identical. (To be scrupulous: the joined cubes are not ' +
        'literally the &Ccaron;ech complex of a cover &mdash; the intersections come out wrong &mdash; so at this level ' +
        'the parallel is one of architecture, not a dictionary. The honest dictionary is the theorem below.)</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>3. The theorem: manifold calculus <em>is</em> sheafification</h3>' +
        '<p>In manifold calculus (Weiss 1999; see the <em>Knots &amp; Embedding Calculus</em> sub-tab for the setup) the ' +
        'metaphor becomes exact. Let \\(M\\) be a smooth \\(m\\)-manifold and \\(\\mathcal{O}(M)\\) its poset of open ' +
        'subsets, and consider presheaves \\(F : \\mathcal{O}(M)^{\\mathrm{op}} \\to \\mathcal{S}\\) taking isotopy ' +
        'equivalences to equivalences (e.g. \\(V \\mapsto \\operatorname{Emb}(V, N)\\)). Define the ' +
        '<strong>Weiss topology</strong> \\(\\mathcal{J}_k\\): a family \\(\\{U_i \\subseteq V\\}\\) is a ' +
        '<em>\\(\\mathcal{J}_k\\)-cover</em> if every subset of \\(V\\) with at most \\(k\\) points is contained in some ' +
        '\\(U_i\\). (For \\(k = 1\\) this is the ordinary open-cover topology; \\(\\mathcal{J}_\\infty\\) requires the ' +
        'condition for all finite subsets.)</p>' +
        '<div class="formula-box">$$\\textbf{Theorem (Boavida de Brito&ndash;Weiss, 2013).}\\quad F \\text{ is polynomial of degree} \\leq k \\iff F \\text{ satisfies homotopy descent for } \\mathcal{J}_k,$$' +
        '$$\\text{and } T_k F \\text{ is the homotopy sheafification of } F \\text{ with respect to } \\mathcal{J}_k.$$</div>' +
        '<p>(<em>Manifold calculus and homotopy sheaves</em>, Homology Homotopy Appl. 15 (2013), arXiv:1202.1305.) ' +
        'Moreover \\(T_\\infty F\\) is the homotopy sheafification for \\(\\mathcal{J}_\\infty\\), and a ' +
        '\\(\\mathcal{J}_\\infty\\)-sheaf is determined by its restriction to the full sub-site of opens ' +
        'diffeomorphic to finite disjoint unions of balls &mdash; the <em>site of disks</em>. So in manifold calculus:</p>' +
        '<ul>' +
          '<li><strong>degree \\(\\leq 1\\) = ordinary homotopy sheaf.</strong> Linearity is literally the classical ' +
          'gluing condition (Mayer&ndash;Vietoris-style descent for honest open covers).</li>' +
          '<li><strong>degree \\(\\leq k\\) = sheaf for \\(k\\)-fold configurations.</strong> The functor is determined by ' +
          'what it does near every constellation of \\(k\\) points at a time.</li>' +
          '<li><strong>the Taylor tower = the tower of sheafifications</strong> along the filtration ' +
          '\\(\\mathcal{J}_1 \\supseteq \\mathcal{J}_2 \\supseteq \\cdots\\) of Grothendieck topologies.</li>' +
        '</ul>' +
        '<details class="kl-example"><summary>Example: why embeddings are not a \\(\\mathcal{J}_1\\)-sheaf</summary>' +
        '<p>Cover \\(V = \\mathbb{R}\\) by two overlapping intervals \\(U_1, U_2\\). Embeddings ' +
        '\\(U_1 \\hookrightarrow \\mathbb{R}^3\\) and \\(U_2 \\hookrightarrow \\mathbb{R}^3\\) agreeing on \\(U_1 \\cap U_2\\) glue to a smooth map ' +
        '\\(V \\to \\mathbb{R}^3\\) that is locally an embedding &mdash; an immersion &mdash; but global injectivity can fail: the two ' +
        'pieces may pass through each other. Injectivity is a condition on <em>pairs</em> of points, i.e. ' +
        '\\(\\mathcal{J}_2\\)-local data. This is precisely why knotting exists: \\(\\operatorname{Emb}\\) satisfies ' +
        '\\(\\mathcal{J}_1\\)-descent only after weakening to \\(\\operatorname{Imm}\\), and indeed by Smale&ndash;Hirsch ' +
        'immersion theory the linear stage of the embedding tower is the immersion space (when the handle dimension ' +
        'of \\(M\\) is less than \\(\\dim N\\)). Knot theory begins at degree \\(2\\).</p>' +
        '</details>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>4. What the sheaf picture buys you</h3>' +
        '<ul>' +
          '<li><strong>Descent formulas.</strong> Sheafification comes with a formula: \\(T_k F(V)\\) is the homotopy ' +
          'limit of \\(F\\) over the poset \\(\\mathcal{O}_k(V)\\) of opens diffeomorphic to \\(\\leq k\\) disjoint balls ' +
          '&mdash; a canonical cofinal system of \\(\\mathcal{J}_k\\)-local data &mdash; and once a functor <em>is</em> a ' +
          '\\(\\mathcal{J}_k\\)-sheaf, its value on \\(V\\) satisfies descent for every \\(\\mathcal{J}_k\\)-cover of ' +
          '\\(V\\). Values on disjoint balls are configuration-space data &mdash; this is how the knot-tower ' +
          'computations in the <em>Knots &amp; Embedding Calculus</em> sub-tab get off the ground.</li>' +
          '<li><strong>Context invariance.</strong> A sheaf-theoretic statement is manifestly independent of the ' +
          'auxiliary choices in the \\(T_k\\) construction, and makes functoriality in \\(M\\) transparent.</li>' +
          '<li><strong>A bridge to factorization homology.</strong> The dual picture &mdash; homotopy ' +
          '<em>co</em>sheaves on the site of disks &mdash; is the setting of factorization homology ' +
          '(Ayala&ndash;Francis, 2015), tying manifold calculus to topological field theory.</li>' +
        '</ul>' +
        '<p style="font-size:0.95em;color:#555"><strong>Caveat for the homotopy calculus.</strong> No Grothendieck ' +
        'topology on a site of spaces has \\(n\\)-excisive functors as its sheaves: Goodwillie&rsquo;s \\(P_n\\) is an ' +
        'accessible <em>left exact</em> localization (Lurie, <em>Higher Algebra</em>, Theorem 6.1.1.10) that is not ' +
        '<em>topological</em>, so &ldquo;\\(P_n =\\) sheafification&rdquo; must never be quoted as a theorem in the ' +
        'homotopy-calculus setting &mdash; only in manifold calculus, where Boavida de Brito&ndash;Weiss prove it. ' +
        'The general framework for such non-topological left exact localizations is the ' +
        'Anel&ndash;Biedermann&ndash;Finster&ndash;Joyal series on left exact localizations of \\(\\infty\\)-topoi ' +
        '(2018&ndash;2024).</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>5. Practice</h3>' +
        '<details class="kl-practice"><summary>Exercise 1: Weiss covers</summary>' +
        '<p>(a) Show \\(\\mathcal{J}_1\\) is the usual open-cover topology on \\(\\mathcal{O}(M)\\). ' +
        '(b) Exhibit a \\(\\mathcal{J}_1\\)-cover of \\(\\mathbb{R}\\) by two intervals that is <em>not</em> a ' +
        '\\(\\mathcal{J}_2\\)-cover, and a \\(\\mathcal{J}_2\\)-cover of \\(\\mathbb{R}\\) by three sets none of which is ' +
        'all of \\(\\mathbb{R}\\). (c) Verify the covering axioms of a Grothendieck topology for \\(\\mathcal{J}_k\\).</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 2: degree \\(\\leq k\\) from descent</summary>' +
        '<p>Weiss&rsquo;s original definition: \\(F\\) is polynomial of degree \\(\\leq k\\) if for every \\(V\\) and every ' +
        'set of \\(k{+}1\\) pairwise disjoint closed subsets \\(A_0, \\dots, A_k \\subseteq V\\), the \\((k{+}1)\\)-cube ' +
        '\\(S \\mapsto F\\bigl(V \\setminus \\bigcup_{i \\in S} A_i\\bigr)\\) is cartesian. Show that a ' +
        '\\(\\mathcal{J}_{k}\\)-sheaf satisfies this condition. (The converse is the hard direction of ' +
        'Boavida de Brito&ndash;Weiss.)</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 3: sets vs spaces</summary>' +
        '<p>For a presheaf of <em>sets</em>, sheafification is \\(F^{++}\\) (two plus constructions). Find where the ' +
        'argument uses that sets have no higher homotopy, and explain why \\(P_n\\) needs ' +
        '\\(\\operatorname{hocolim}_k T_n^k\\) rather than \\(T_n^2\\).</p>' +
        '</details>' +
      '</div>';
  }

  function derivativesHTML() {
    return '' +
      '<div class="expo-panel">' +
        '<h3>1. Cross effects: the finite differences of a functor</h3>' +
        '<p>Classical polynomials can be detected by finite differences; functors can be detected by ' +
        '<strong>cross effects</strong>, introduced for functors of abelian groups by Eilenberg&ndash;MacLane (1954) ' +
        'and imported into topology by Goodwillie. For a reduced homotopy functor \\(F\\), the \\(n\\)-th cross effect ' +
        'is the functor of \\(n\\) variables</p>' +
        '<div class="formula-box">$$\\operatorname{cr}_n F(X_1, \\dots, X_n) \\;=\\; \\operatorname{tfib}\\Bigl( S \\subseteq \\{1,\\dots,n\\} \\;\\longmapsto\\; F\\bigl(\\textstyle\\bigvee_{i \\notin S} X_i\\bigr) \\Bigr),$$</div>' +
        '<p>the <span class="kl-term" title="Total homotopy fiber of an n-cube: the iterated homotopy fiber over all n directions; measures the failure of the cube to be cartesian.">total homotopy fiber</span> of the ' +
        '\\(n\\)-cube of wedges. So \\(\\operatorname{cr}_1 F = F\\) (reduced), and \\(\\operatorname{cr}_2 F\\) measures the ' +
        'failure of \\(F(X \\vee Y) \\to F(X) \\times F(Y)\\) to be an equivalence &mdash; the failure of additivity, ' +
        'exactly as \\(f(x + y) - f(x) - f(y) + f(0)\\) measures the failure of a function to be affine.</p>' +
        '<p>In the classical algebraic setting the analogy is a definition: a functor of abelian categories is ' +
        '<em>polynomial of degree \\(\\leq n\\)</em> (Eilenberg&ndash;MacLane) iff \\(\\operatorname{cr}_{n+1} F = 0\\). In ' +
        'homotopy calculus, \\(n\\)-excision implies that \\(\\operatorname{cr}_{n+1} F\\) vanishes, and cross effects ' +
        'compute the layers of the tower.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>2. Interactive: cross effects of classical polynomial functors</h3>' +
        '<p>Compute cross-effect dimensions for the classical degree-\\(d\\) functors of vector spaces ' +
        '\\(A \\mapsto A^{\\otimes d}\\), \\(\\operatorname{Sym}^d A\\), \\(\\Lambda^d A\\), evaluated on \\(1\\)-dimensional ' +
        'inputs. Watch the cross effects count <em>surjections</em> (tensor powers) or <em>compositions</em> ' +
        '(symmetric powers), or collapse to a single alternating line at \\(k = d\\) (exterior powers) &mdash; and ' +
        '\\(\\operatorname{cr}_{d+1}\\) always vanish.</p>' +
        '<div class="kl-interactive">' +
          '<div class="kl-controls" style="margin-bottom:0.6em">' +
            '<label>Functor: ' +
            '<select id="fc-cross-fn">' +
              '<option value="tensor" selected>A ↦ A^⊗d (tensor power)</option>' +
              '<option value="sym">A ↦ Sym^d A (symmetric power)</option>' +
              '<option value="ext">A ↦ Λ^d A (exterior power)</option>' +
            '</select></label>' +
            '<label style="margin-left:1.2em">degree d = <span id="fc-cross-dval">3</span> ' +
            '<input type="range" id="fc-cross-d" min="1" max="6" step="1" value="3" style="vertical-align:middle;width:160px"></label>' +
          '</div>' +
          '<div id="fc-cross-out"></div>' +
        '</div>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>3. Homogeneous functors and their classification</h3>' +
        '<p>A functor is <strong>\\(n\\)-homogeneous</strong> if it is \\(n\\)-excisive and its \\(P_{n-1}\\) vanishes ' +
        '&mdash; a pure &ldquo;monomial of degree \\(n\\).&rdquo; The layers \\(D_n F = \\operatorname{hofib}(P_n F \\to P_{n-1} F)\\) ' +
        'are \\(n\\)-homogeneous. The central structure theorem of <em>Calculus III</em>:</p>' +
        '<div class="formula-box">$$\\textbf{Theorem (Goodwillie).}\\quad \\text{Every finitary } n\\text{-homogeneous } F \\text{ (to spaces) has the form } \\; F(X) \\simeq \\Omega^\\infty\\bigl( (\\partial_n F \\wedge X^{\\wedge n})_{h\\Sigma_n} \\bigr)$$' +
        '$$\\text{for a spectrum } \\partial_n F \\text{ with } \\Sigma_n\\text{-action, uniquely determined up to equivalence.}$$</div>' +
        '<p>Here \\((-)_{h\\Sigma_n}\\) is the <span class="kl-term" title="Homotopy orbit spectrum E_hG = (EG₊ ∧ E)/G: the derived (freed-up) quotient by the group action.">homotopy orbit</span> construction, ' +
        'and <em>finitary</em> means \\(F\\) preserves filtered homotopy colimits (is determined by finite complexes) ' +
        '&mdash; without it, homogeneous functors need not come from spectra at all. ' +
        'The proof runs through three steps, each a theorem of independent use: (i) homogeneous functors to spaces ' +
        'are infinite loop objects: \\(D_n F = \\Omega^\\infty \\mathbf{D}_n F\\) for a spectrum-valued functor; ' +
        '(ii) spectrum-valued \\(n\\)-homogeneous functors are classified by symmetric multilinear functors via the ' +
        '\\(n\\)-th cross effect; (iii) multilinear functors are, up to equivalence, of the form ' +
        '\\((X_1, \\dots, X_n) \\mapsto E \\wedge X_1 \\wedge \\cdots \\wedge X_n\\). The spectrum \\(\\partial_n F\\) &mdash; ' +
        'the <strong>\\(n\\)-th derivative of \\(F\\) at the one-point space</strong> &mdash; is obtained from ' +
        '\\(\\operatorname{cr}_n F\\) by multilinearization:</p>' +
        '<div class="formula-box">$$\\partial_n F \\;=\\; \\text{(coefficient of)} \\; P_{(1,\\dots,1)} \\operatorname{cr}_n F, \\qquad \\text{with its natural } \\Sigma_n\\text{-action permuting the variables.}$$</div>' +
        '<p>The factor \\(1/n!\\) of classical calculus has become the homotopy quotient by \\(\\Sigma_n\\): dividing by ' +
        '\\(n!\\) is replaced by taking (co)invariants, and much of the fine structure of the subject &mdash; Tate ' +
        'spectra, norm maps, the difference between \\((-)_{h\\Sigma_n}\\) and \\((-)^{h\\Sigma_n}\\) &mdash; lives in the ' +
        'gap between the two.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>4. First derivatives, and derivatives you already know</h3>' +
        '<table class="dict-table" style="width:100%;border-collapse:collapse">' +
          '<thead><tr style="border-bottom:1.5px solid #333">' +
            '<th style="padding:6px 10px;text-align:left">Functor \\(F\\)</th>' +
            '<th style="padding:6px 10px;text-align:left">\\(\\partial_n F\\) (as a spectrum with \\(\\Sigma_n\\)-action)</th>' +
            '<th style="padding:6px 10px;text-align:left">Layers on \\(X\\)</th>' +
          '</tr></thead>' +
          '<tbody>' +
            '<tr><td style="padding:4px 10px">\\(\\Omega^\\infty(E \\wedge -)\\), \\(E\\) a spectrum</td><td style="padding:4px 10px">\\(\\partial_1 = E\\), rest trivial</td><td style="padding:4px 10px">only \\(D_1 = \\Omega^\\infty(E \\wedge X)\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">\\(\\Sigma^\\infty \\Omega^\\infty\\) (on spectra)</td><td style="padding:4px 10px">\\(\\partial_n = \\mathbb{S}\\), trivial action, all \\(n\\)</td><td style="padding:4px 10px">\\(D_n(E) = (E^{\\wedge n})_{h\\Sigma_n}\\)</td></tr>' +
            '<tr><td style="padding:4px 10px">identity on based spaces</td><td style="padding:4px 10px">\\(\\partial_n \\mathrm{Id} \\simeq\\) dual of the partition complex; \\(\\bigvee_{(n-1)!} S^{1-n}\\) non-equivariantly</td><td style="padding:4px 10px">see <em>Worked Examples</em></td></tr>' +
            '<tr><td style="padding:4px 10px">\\(X \\mapsto \\Omega^\\infty(E \\wedge X^{\\wedge k})\\)</td><td style="padding:4px 10px">\\(\\partial_k = \\Sigma_k{}_+ \\wedge E\\) (induced action), rest trivial</td><td style="padding:4px 10px">pure \\(k\\)-homogeneous</td></tr>' +
          '</tbody>' +
        '</table>' +
        '<p style="margin-top:0.9em">For reduced finitary \\(F\\), the first derivative has the concrete stabilization ' +
        'formula \\(\\partial_1 F = \\operatorname{hocolim}_k \\Omega^k F(S^k)\\) (a spectrum with structure maps from the ' +
        'suspension comparison), and \\(P_1 F(X) = \\Omega^\\infty(\\partial_1 F \\wedge X)\\). Derivatives can also be taken ' +
        '<em>at an arbitrary base object</em> \\(Y\\) (derivatives of \\(Z \\mapsto F(Y \\amalg Z)\\)-type constructions); the ' +
        'resulting &ldquo;jets&rdquo; assemble into the tangent-category picture sketched in <em>Other Calculi</em>.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>5. The chain rule</h3>' +
        '<p>Classical calculus without the chain rule would be a curiosity; the same is true here. For composable ' +
        'reduced finitary functors there is first a one-derivative statement (Klein&ndash;Rognes, 2002): ' +
        '\\(\\partial_1(F \\circ G) \\simeq \\partial_1 F \\wedge \\partial_1 G\\) in the appropriate module sense. The full ' +
        'higher chain rule is due to Arone&ndash;Ching (<em>Operads and chain rules for the calculus of functors</em>, ' +
        'Ast&eacute;risque 338, 2011), and its formulation is one of the deepest structural facts in the subject:</p>' +
        '<ul>' +
          '<li>Ching (2005): the symmetric sequence \\(\\partial_* \\mathrm{Id}\\) of derivatives of the identity is an ' +
          '<span class="kl-term" title="Operad: a collection O(n) of objects with Σₙ-actions and composition maps encoding n-ary operations; algebras over it realize the encoded algebraic structure.">operad</span> in spectra ' +
          '&mdash; the <strong>spectral Lie operad</strong>, Koszul dual to the commutative operad (its homology is, up ' +
          'to shift and sign, the Lie operad).</li>' +
          '<li>For general \\(F\\), the derivatives \\(\\partial_* F\\) form a \\((\\partial_*\\mathrm{Id}, \\partial_*\\mathrm{Id})\\)-bimodule, and</li>' +
        '</ul>' +
        '<div class="formula-box">$$\\partial_*(F \\circ G) \\;\\simeq\\; \\partial_* F \\circ_{\\partial_* \\mathrm{Id}} \\partial_* G,$$</div>' +
        '<p>a derived composition product over the spectral Lie operad &mdash; the homotopy-theoretic ' +
        '<span class="kl-term" title="Faà di Bruno formula: the classical expression for the n-th derivative of a composite f∘g as a sum over partitions of {1,…,n}. Its combinatorics is exactly the composition product of symmetric sequences.">Fa&agrave; di Bruno formula</span>. ' +
        'The classical sum over set partitions is visible in the composition product of symmetric sequences.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>6. Practice</h3>' +
        '<details class="kl-practice"><summary>Exercise 1: second cross effect of the tensor square</summary>' +
        '<p>For \\(F(A) = A \\otimes A\\) on vector spaces, compute directly that ' +
        '\\(F(A \\oplus B) \\cong F(A) \\oplus F(B) \\oplus (A \\otimes B) \\oplus (B \\otimes A)\\), so ' +
        '\\(\\operatorname{cr}_2 F(A, B) = (A \\otimes B) \\oplus (B \\otimes A)\\) has dimension \\(2\\) on lines &mdash; matching ' +
        'the calculator (\\(2! \\, S(2,2) = 2\\)). Identify the \\(\\Sigma_2\\)-action.</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 2: multilinearity from cross effects</summary>' +
        '<p>Show that \\(\\operatorname{cr}_n F\\) is reduced in each variable separately, and that if \\(F\\) is ' +
        '\\(n\\)-excisive then \\(\\operatorname{cr}_n F\\) is already \\(1\\)-excisive in each variable &mdash; no ' +
        'multilinearization needed (Goodwillie, <em>Calculus III</em>, &sect;3). ' +
        'This is the mechanism behind step (ii) of the classification.</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 3: homotopy orbits vs fixed points</summary>' +
        '<p>For \\(n = 2\\) and \\(E = \\mathbb{S}\\) with trivial \\(\\Sigma_2\\)-action, compare ' +
        '\\(\\pi_0\\) of \\((\\mathbb{S} \\wedge X^{\\wedge 2})_{h\\Sigma_2}\\) and \\((\\mathbb{S} \\wedge X^{\\wedge 2})^{h\\Sigma_2}\\) ' +
        'for \\(X = S^0\\). The failure of the norm map to be an equivalence (the Tate spectrum ' +
        '\\(\\mathbb{S}^{t\\Sigma_2}\\)) is the homotopical residue of the missing \\(\\tfrac{1}{2}\\) in ' +
        '\\(\\tfrac{f&Prime;(0)}{2}x^2\\).</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 4: derivatives of a representable-ish functor</summary>' +
        '<p>Let \\(F(X) = \\Omega^\\infty \\Sigma^\\infty \\operatorname{Map}(K, X)\\) for a finite complex \\(K\\). Using ' +
        '\\(\\operatorname{Map}(K, -)\\) and the classification theorem, identify \\(\\partial_n F\\) as the ' +
        'Spanier&ndash;Whitehead-type dual \\(\\mathbb{D}(K^{\\wedge n} / \\Delta)\\)-style spectrum built from configurations ' +
        'of \\(n\\) points in \\(K\\) &mdash; a first taste of the configuration-space calculus used for embedding ' +
        'functors (Arone, Goodwillie&ndash;Weiss).</p>' +
        '</details>' +
      '</div>';
  }

  function examplesHTML() {
    return '' +
      '<div class="expo-panel">' +
        '<h3>1. The identity functor</h3>' +
        '<p>The most fundamental &mdash; and hardest &mdash; example. The identity \\(\\mathrm{Id} : \\mathcal{S}_* \\to \\mathcal{S}_*\\) ' +
        'is \\(1\\)-analytic but not \\(n\\)-excisive for any \\(n\\); its Taylor tower interpolates between unstable ' +
        'and stable homotopy theory, starting with \\(P_1 \\mathrm{Id} = Q = \\Omega^\\infty \\Sigma^\\infty\\).</p>' +
        '<ul>' +
          '<li><strong>Derivatives (Johnson 1995; Arone&ndash;Mahowald 1999).</strong> Brenda Johnson ' +
          '(<em>The derivatives of homotopy theory</em>, Trans. AMS 347, 1995) identified \\(\\partial_n \\mathrm{Id}\\) as the ' +
          'Spanier&ndash;Whitehead dual of the <span class="kl-term" title="Partition complex |Πₙ|: the geometric realization of the poset of proper nontrivial partitions of {1,…,n}; homotopy equivalent to a wedge of (n−1)! spheres of dimension n−3. What appears in ∂ₙId is its double suspension Σ|Πₙ|⋄, a wedge of (n−1)! copies of S^{n−1}.">partition complex</span>: ' +
          'non-equivariantly \\(\\partial_n \\mathrm{Id} \\simeq \\bigvee_{(n-1)!} S^{1-n}\\), but the \\(\\Sigma_n\\)-action ' +
          'is deeply nontrivial and carries the real content.</li>' +
          '<li><strong>The tower on spheres (Arone&ndash;Mahowald, Invent. Math. 135, 1999).</strong> Evaluated on an ' +
          'odd sphere and localized at a prime \\(p\\), the layers \\(D_n \\mathrm{Id}(S^{2k+1})\\) are contractible unless ' +
          '\\(n = p^j\\): the tower collapses to a finite-in-each-degree pro-object whose layers are built from the ' +
          'Steinberg-summand spectra \\(L(j)\\). This computation connects the tower to ' +
          '<span class="kl-term" title="vₙ-periodicity: the chromatic filtration of stable homotopy detected by Morava K-theories; vₙ-periodic families are systematic infinite families in the stable stems.">\\(v_j\\)-periodicity</span>: ' +
          'the \\(p^j\\)-th layer sees exactly the \\(j\\)-th chromatic layer of the sphere.</li>' +
          '<li><strong>The operad structure (Ching 2005).</strong> \\(\\partial_* \\mathrm{Id}\\) is an operad in spectra ' +
          '(the spectral Lie operad), Koszul dual to the commutative operad; its algebras behave like ' +
          'topological Lie algebras. Heuts (2021) used this to build Lie-algebra models for ' +
          '\\(v_n\\)-periodic unstable homotopy theory.</li>' +
          '<li><strong>EHP and Whitehead (Behrens 2012; Kuhn).</strong> The Goodwillie tower of the identity on spheres ' +
          'interacts with the EHP sequence (Behrens, <em>The Goodwillie tower and the EHP sequence</em>, Mem. AMS 218, ' +
          '2012), and the contracting homotopy in Kuhn&rsquo;s proof of the Whitehead conjecture is now understood ' +
          'through the same lens (Behrens, Arone&ndash;Dwyer&ndash;Lesh).</li>' +
        '</ul>' +
        '<details class="kl-example"><summary>Worked warm-up: the first two layers of \\(\\mathrm{Id}\\)</summary>' +
        '<p>\\(D_1 \\mathrm{Id}(X) = QX = \\Omega^\\infty \\Sigma^\\infty X\\), with \\(\\partial_1 \\mathrm{Id} = \\mathbb{S}\\). ' +
        'For \\(n = 2\\): \\(\\partial_2 \\mathrm{Id} \\simeq S^{-1}\\) with trivial \\(\\Sigma_2\\)-action, so</p>' +
        '<div class="formula-box">$$D_2 \\mathrm{Id}(X) \\;\\simeq\\; \\Omega^\\infty \\bigl( \\Sigma^{-1} (X \\wedge X)_{h\\Sigma_2} \\bigr).$$</div>' +
        '<p>On \\(X = S^n\\), \\(\\pi_*\\) of this layer is the stable homotopy of a stunted projective ' +
        'space &mdash; the same quadratic construction \\(D_2(S^n)\\) that appears in the EHP sequence and in ' +
        'the James filtration of \\(\\Omega \\Sigma S^n\\). The tower of the identity <em>is</em> the conceptual home of ' +
        'those classical constructions.</p>' +
        '</details>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>2. Stable homotopy of infinite loop spaces: \\(\\Sigma^\\infty \\Omega^\\infty\\)</h3>' +
        '<p>Treat \\(F = \\Sigma^\\infty \\Omega^\\infty : \\mathrm{Sp} \\to \\mathrm{Sp}\\). Its derivatives are as simple as ' +
        'possible &mdash; \\(\\partial_n F = \\mathbb{S}\\) with trivial \\(\\Sigma_n\\)-action &mdash; so the layers are the ' +
        '<span class="kl-term" title="Extended power Dₙ(E) = (EΣₙ)₊ ∧_Σₙ E^∧n: the homotopy-orbit smash power, building block of stable splittings and power operations.">extended powers</span></p>' +
        '<div class="formula-box">$$D_n(\\Sigma^\\infty \\Omega^\\infty)(E) \\;\\simeq\\; (E^{\\wedge n})_{h\\Sigma_n}.$$</div>' +
        '<ul>' +
          '<li><strong>Snaith splitting.</strong> For \\(E = \\Sigma^\\infty X\\) with \\(X\\) connected, the tower splits: ' +
          '\\(\\Sigma^\\infty Q X \\simeq \\bigvee_n \\Sigma^\\infty (X^{\\wedge n})_{h\\Sigma_n}\\) &mdash; the classical stable ' +
          'splitting of \\(QX\\) (Snaith 1974, Kahn), recovered as a split Taylor tower (the tower interpretation is ' +
          'worked out in Arone, Trans. AMS 351, 1999). Splitting is the exception, not the rule: in general the ' +
          'tower has nontrivial \\(k\\)-invariants, and that is precisely what makes it a spectral-sequence-grade ' +
          'computational tool.</li>' +
          '<li><strong>Kuhn&rsquo;s periodic splitting (Invent. Math. 157, 2004).</strong> After telescopic localization ' +
          '\\(L_{T(j)}\\), the tower of \\(\\Sigma^\\infty \\Omega^\\infty\\) splits for <em>every</em> input spectrum &mdash; ' +
          'one reason chromatic homotopy theory and Goodwillie calculus communicate so well (see Kuhn&rsquo;s survey ' +
          '<em>Goodwillie towers and chromatic homotopy: an overview</em>, 2007). Note the logic: splitting of the ' +
          'tower and convergence of the tower are independent questions &mdash; identifying the limit with ' +
          '\\(L_{T(j)}\\Sigma^\\infty\\Omega^\\infty X\\) still requires a connectivity hypothesis.</li>' +
          '<li><strong>Power operations.</strong> The extended powers appearing in the layers are precisely the ' +
          'source of Dyer&ndash;Lashof operations; the tower organises them degree by degree.</li>' +
        '</ul>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>3. Algebraic \\(K\\)-theory: the killer application</h3>' +
        '<p>Functor calculus was invented for this example. Waldhausen&rsquo;s ' +
        '\\(A\\)-theory \\(A(X) = K(\\Sigma^\\infty_+ \\Omega X)\\) splits as ' +
        '\\(A(X) \\simeq \\Sigma^\\infty_+ X \\times \\mathrm{Wh}^{\\mathrm{Diff}}(X)\\), and the Whitehead spectrum ' +
        '\\(\\mathrm{Wh}^{\\mathrm{Diff}}\\) controls spaces of pseudoisotopies and hence, through smoothing theory, ' +
        'diffeomorphism groups of high-dimensional manifolds: \\(\\Omega^2 \\mathrm{Wh}^{\\mathrm{Diff}}(M) \\simeq \\mathcal{P}(M)\\) ' +
        'in the stable range (Waldhausen&ndash;Jahren&ndash;Rognes). <em>Calculus I</em> (1990) computes the first ' +
        'derivative of pseudoisotopy theory and of \\(A\\)-theory &mdash; the differential of \\(A\\) at a space \\(Y\\) is ' +
        'built from the spectrum \\(\\Sigma^\\infty_+ \\Omega Y\\) (note: this is the <em>Calculus I</em> notion of ' +
        'derivative at an arbitrary base \\(Y\\), not the Taylor coefficient \\(\\partial_n\\) at a point); the ' +
        'analyticity of \\(A\\) proved in <em>Calculus II</em>, &sect;4, then powers the following landmark:</p>' +
        '<div class="formula-box">$$\\textbf{Dundas&ndash;Goodwillie&ndash;McCarthy.}\\quad \\text{For a map } R \\to S \\text{ of connective ring spectra with } \\pi_0 R \\twoheadrightarrow \\pi_0 S$$' +
        '$$\\text{nilpotent kernel, the square relating } K \\text{ and } \\mathrm{TC} \\text{ is homotopy cartesian:}\\qquad' +
        '\\begin{CD} K(R) @>>> \\mathrm{TC}(R) \\\\ @VVV @VVV \\\\ K(S) @>>> \\mathrm{TC}(S) \\end{CD}$$</div>' +
        '<p>(McCarthy 1997 for simplicial rings; Dundas 1997; the book-length treatment is ' +
        'Dundas&ndash;Goodwillie&ndash;McCarthy, <em>The Local Structure of Algebraic K-Theory</em>, Springer 2013.) ' +
        'The slogan: <strong>\\(K\\)-theory and topological cyclic homology have the same derivative everywhere</strong>, ' +
        'so their difference is &ldquo;locally constant.&rdquo; Virtually every modern computation of \\(K\\)-theory of ' +
        'ring spectra (via \\(\\mathrm{THH}\\), \\(\\mathrm{TC}\\), prismatic methods) descends from this theorem &mdash; ' +
        'calculus of functors is silently underneath all of it.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>4. Classical algebra: where the words came from</h3>' +
        '<p>All the vocabulary &mdash; polynomial functors, cross effects, degree &mdash; predates topology, in the study ' +
        'of functors of abelian groups: Eilenberg&ndash;MacLane (Ann. of Math. 60, 1954) introduced cross effects to ' +
        'analyse \\(H_*(K(A,n))\\); \\(\\operatorname{Sym}^d\\), \\(\\Lambda^d\\), \\(\\Gamma^d\\), tensor powers are polynomial of degree ' +
        '\\(d\\) (see the calculator in <em>Derivatives &amp; Layers</em>); and Dold&ndash;Puppe (Ann. Inst. Fourier 11, ' +
        '1961) defined derived functors of non-additive functors by simplicial resolutions. The discrete calculus of ' +
        'Johnson&ndash;McCarthy (<em>Other Calculi</em>) recovers Dold&ndash;Puppe theory as the Taylor tower of a ' +
        'functor of simplicial modules, and the layers reproduce stable derived functors. The classical statement ' +
        '&ldquo;a degree-\\(d\\) polynomial is determined by its values at \\(d{+}1\\) points&rdquo; has an exact ' +
        'analogue in the abelian setting: a polynomial functor is determined by its cross effects. In the ' +
        'homotopical setting the slogan needs care &mdash; the derivatives determine the <em>layers</em>, but ' +
        'reassembling \\(F\\) requires extension data (\\(k\\)-invariants), and two \\(n\\)-excisive functors can agree ' +
        'on all finite complexes without being equivalent unless finitary-ness is imposed. The healthy version of ' +
        'the principle is the disk-site description in the <em>Sheafification</em> sub-tab.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>5. Practice</h3>' +
        '<details class="kl-practice"><summary>Exercise 1: \\(\\pi_*\\) through the tower</summary>' +
        '<p>Take \\(X = S^1\\). Using \\(P_1\\mathrm{Id}(S^1) = QS^1\\) and the layer formula for \\(D_2\\), compute the ' +
        'tower approximation to \\(\\pi_3(S^1)\\) (which must die) and watch the cancellation between \\(\\pi_3 QS^1\\) and ' +
        'the quadratic layer. Every convergence statement is a highly organised cancellation.</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 2: Snaith splitting degree by degree</summary>' +
        '<p>For \\(E = \\mathbb{S}\\), identify the \\(n\\)-th layer \\((\\mathbb{S}^{\\wedge n})_{h\\Sigma_n} \\simeq ' +
        '\\Sigma^\\infty_+ B\\Sigma_n\\), and compare the resulting tower for \\(\\Sigma^\\infty QS^0\\) with the ' +
        'Barratt&ndash;Priddy&ndash;Quillen description of \\(QS^0\\) in terms of symmetric groups. Which classical ' +
        'filtration of \\(\\Sigma^\\infty_+ B\\Sigma_\\infty\\) do the tower stages reproduce?</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 3: derivatives of \\(\\operatorname{Sym}^d\\)-type functors</summary>' +
        '<p>In the discrete calculus, show the \\(n\\)-th layer of \\(\\operatorname{Sym}^d\\) (as an endofunctor of ' +
        'simplicial \\(\\mathbb{Q}\\)-modules) vanishes for \\(n \\neq d\\) rationally, and relate the \\(d\\)-th layer to ' +
        'homotopy orbits \\((A^{\\otimes d})_{h\\Sigma_d}\\). Rationally, homotopy orbits agree with strict orbits &mdash; ' +
        'which is why characteristic \\(0\\) algebra never needed the Tate correction.</p>' +
        '</details>' +
      '</div>';
  }

  function knotsHTML() {
    return '' +
      '<div class="expo-panel">' +
        '<h3>1. Manifold calculus in one panel</h3>' +
        '<p>Fix a smooth \\(m\\)-manifold \\(M\\) and study presheaves ' +
        '\\(F : \\mathcal{O}(M)^{\\mathrm{op}} \\to \\mathcal{S}\\) on its open subsets &mdash; contravariant in the open ' +
        'set, as restriction of embeddings demands &mdash; taking isotopy equivalences to ' +
        'equivalences &mdash; the fundamental example is \\(V \\mapsto \\operatorname{Emb}(V, N)\\) for a target ' +
        '\\(n\\)-manifold \\(N\\). Weiss (Geom. Topol. 3, 1999) defines \\(F\\) to be <strong>polynomial of degree ' +
        '\\(\\leq k\\)</strong> if for every \\(V\\) and pairwise disjoint closed subsets \\(A_0, \\dots, A_k \\subseteq V\\), ' +
        'the \\((k{+}1)\\)-cube</p>' +
        '<div class="formula-box">$$S \\subseteq \\{0, \\dots, k\\} \\;\\longmapsto\\; F\\bigl(V \\setminus \\textstyle\\bigcup_{i \\in S} A_i\\bigr) \\qquad \\text{is cartesian,}$$</div>' +
        '<p>and the approximation is a homotopy limit over the sub-poset \\(\\mathcal{O}_k(V)\\) of opens diffeomorphic ' +
        'to at most \\(k\\) disjoint balls:</p>' +
        '<div class="formula-box">$$T_k F(V) \\;=\\; \\operatorname*{holim}_{U \\in \\mathcal{O}_k(V)} F(U).$$</div>' +
        '<p>(Note the notational trap: in manifold calculus \\(T_k\\) <em>is</em> the polynomial approximation ' +
        '&mdash; one homotopy limit suffices &mdash; whereas in homotopy calculus \\(P_n = \\operatorname{colim} T_n^j\\). ' +
        'By Boavida de Brito&ndash;Weiss, \\(T_k\\) is homotopy sheafification for the Weiss topology ' +
        '\\(\\mathcal{J}_k\\) &mdash; see <em>Sheafification</em>.) Values on \\(\\mathcal{O}_k\\) are configuration-space ' +
        'data: \\(\\operatorname{Emb}(\\coprod_j \\mathring{D}^m, N)\\) is equivalent to the space of framed-ish ' +
        'configurations of \\(j \\leq k\\) points in \\(N\\), so the tower systematically approximates embeddings by ' +
        'point configurations.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>2. The linear stage is immersion theory; convergence needs codimension \\(3\\)</h3>' +
        '<p>The degree-\\(1\\) stage is classical: by Smale&ndash;Hirsch theory, when \\(\\dim M < \\dim N\\) (more ' +
        'generally, positive handle codimension) the immersion functor is linear, and</p>' +
        '<div class="formula-box">$$T_1 \\operatorname{Emb}(-, N) \\;\\simeq\\; \\operatorname{Imm}(-, N).$$</div>' +
        '<p>Weiss&rsquo;s slogan &mdash; <em>embeddings from the point of view of immersion theory</em> &mdash; is that the ' +
        'tower extends the \\(h\\)-principle one configuration size at a time. The deep theorem is convergence ' +
        '(Goodwillie&ndash;Weiss, Geom. Topol. 3, 1999, powered by the multiple-disjunction estimates of ' +
        'Goodwillie&ndash;Klein, J. Topol. 8, 2015):</p>' +
        '<div class="formula-box">$$\\operatorname{Emb}(M, N) \\longrightarrow T_k \\operatorname{Emb}(M, N) \\quad \\text{is } \\bigl(k(n - m - 2) + 1 - m\\bigr)\\text{-connected},$$</div>' +
        '<p>so the tower converges when the codimension satisfies \\(n - m \\geq 3\\) &mdash; the analyticity radius of ' +
        'embedding functors. For classical knots (\\(m = 1\\), \\(n = 3\\), codimension \\(2\\)) the estimate degenerates: ' +
        '<strong>convergence for the space of classical knots is an open problem</strong>. Everything below lives in ' +
        'that fascinating gap: the tower still exists, still produces invariants, and conjecturally still sees ' +
        'everything finite-type.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>3. Long knots and their tower</h3>' +
        '<p>The standard model is the space of <span class="kl-term" title="Long knot: an embedding of ℝ into ℝⁿ agreeing with a fixed straight line outside a compact set. For n = 3, its path components are classical knot types.">long knots</span></p>' +
        '<div class="formula-box">$$\\mathcal{K}_n \\;=\\; \\operatorname{Emb}_c(\\mathbb{R}, \\mathbb{R}^n), \\qquad \\pi_0 \\mathcal{K}_3 = \\{\\text{classical knot types}\\},$$</div>' +
        '<p>with its Goodwillie&ndash;Weiss tower \\(\\{T_k \\mathcal{K}_n\\}\\). In practice one studies ' +
        '\\(\\overline{\\mathcal{K}}_n = \\operatorname{hofib}(\\operatorname{Emb}_c \\to \\operatorname{Imm}_c)\\), long ' +
        'knots <em>modulo immersions</em>: by Smale&ndash;Hirsch \\(\\operatorname{Imm}_c(\\mathbb{R}, \\mathbb{R}^n) ' +
        '\\simeq \\Omega S^{n-1}\\), and Sinha showed \\(\\overline{\\mathcal{K}}_n \\simeq \\mathcal{K}_n \\times ' +
        '\\Omega^2 S^{n-1}\\), so no information is lost &mdash; but be alert to which model a given paper computes. ' +
        'Two concrete models make the tower computable:</p>' +
        '<ul>' +
          '<li><strong>Punctured knots.</strong> \\(T_k\\) is assembled from the spaces of embeddings of \\(\\mathbb{R}\\) ' +
          'with \\(j \\leq k\\) subintervals removed &mdash; &ldquo;knots that forgot part of themselves&rdquo; &mdash; ' +
          'glued along restriction maps; each punctured-knot space is equivalent to a configuration space of ' +
          'framed points.</li>' +
          '<li><strong>Sinha&rsquo;s cosimplicial model.</strong> Using the Fulton&ndash;MacPherson/Axelrod&ndash;Singer ' +
          'compactification of configuration spaces, Sinha (<em>The topology of spaces of knots: cosimplicial models</em>, ' +
          'Amer. J. Math. 131, 2009) built a cosimplicial space whose partial totalizations compute the tower of long ' +
          'knots <em>modulo immersions</em>: \\(T_k \\overline{\\mathcal{K}}_n \\simeq \\operatorname{Tot}^k\\) ' +
          '(established for \\(n \\geq 4\\)). Its second-quadrant spectral sequence is exactly the one ' +
          'Vassiliev found from the other side (see below); Sinha (<em>Operads and knot spaces</em>, J. Amer. Math. ' +
          'Soc. 19, 2006) upgraded the model to the level of little-disks operad actions.</li>' +
        '</ul>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>4. The tower computes finite-type invariants</h3>' +
        '<p>Here is the bridge to the rest of KnotLab. Recall from the <em>Polynomial Invariants</em> tab that a knot ' +
        'invariant is <strong>finite-type (Vassiliev) of degree \\(\\leq d\\)</strong> if its extension to singular knots ' +
        'via \\(v(L_\\times) = v(L_+) - v(L_-)\\) vanishes on knots with \\(d{+}1\\) double points.</p>' +
        '<ul>' +
          '<li><strong>The first invariant in the tower (Budney&ndash;Conant&ndash;Scannell&ndash;Sinha, ' +
          '<em>New perspectives on self-linking</em>, Adv. Math. 191, 2005).</strong> The third stage ' +
          '\\(T_3 \\mathcal{K}_3\\) carries an integer-valued invariant which BCSS identify with the unique type-\\(2\\) ' +
          'invariant \\(c_2\\) &mdash; the coefficient of \\(z^2\\) in the Conway polynomial &mdash; realized ' +
          'geometrically by counting <span class="kl-term" title="Quadrisecant: a straight line meeting the knot in four distinct points. BCSS express the Casson knot invariant c₂ via counts of quadrisecants and related configuration-space integrals.">quadrisecants</span>. ' +
          'The tower <em>discovers</em> \\(c_2\\) from pure homotopy theory, with no diagram combinatorics input.</li>' +
          '<li><strong>All tower invariants are finite-type (Budney&ndash;Conant&ndash;Koytcheff&ndash;Sinha, ' +
          '<em>Embedding calculus knot invariants are of finite type</em>, Algebr. Geom. Topol. 17, 2017).</strong> ' +
          '\\(\\pi_0 T_n \\mathcal{K}_3\\) is an abelian group, the evaluation map ' +
          '\\(\\mathrm{ev}_n : \\pi_0 \\mathcal{K}_3 \\to \\pi_0 T_n \\mathcal{K}_3\\) is a monoid homomorphism for connected ' +
          'sum, and it is invariant under degree-\\(n\\) <span class="kl-term" title="Clasper / grope surgery: geometric refinements of crossing changes; invariance under degree-n clasper surgery characterizes finite-type invariants of degree ≤ n−1 (Habiro, Goussarov).">clasper surgery</span> ' +
          '&mdash; hence a finite-type invariant of degree \\(\\leq n-1\\). Mind the ubiquitous off-by-one: the ' +
          '<em>\\(n\\)-th stage</em> gives <em>type \\(n{-}1\\)</em>.</li>' +
          '<li><strong>Universality: a ladder of theorems and one conjecture.</strong> ' +
          'BCKS conjecture that \\(\\mathrm{ev}_{n+1}\\) is the <em>universal additive</em> type-\\(n\\) invariant over ' +
          '\\(\\mathbb{Z}\\). Current status: over \\(\\mathbb{R}\\), every type-\\(n\\) invariant factors through the ' +
          'stage \\(T_{2n}\\) (Voli&cacute;, Compos. Math. 142, 2006); \\(p\\)-locally, \\(\\mathrm{ev}_{n+1}\\) is universal ' +
          'for degrees \\(n \\leq p + 1\\) via Galois symmetries of profinite little-disks operads ' +
          '(Boavida de Brito&ndash;Horel, Compos. Math. 157, 2021); and \\(\\mathrm{ev}_n\\) is <em>surjective</em>, with ' +
          'values computed by grope cobordism (Kosanovi&cacute;, Adv. Math. 451, 2024) &mdash; which combined with ' +
          'Boavida de Brito&ndash;Horel makes \\(\\mathrm{ev}_{n+1}\\) a universal additive Vassiliev invariant over ' +
          '\\(\\mathbb{Q}\\), dominating the Kontsevich integral rationally. Over \\(\\mathbb{Z}\\) &mdash; where the tower ' +
          'could see torsion the Kontsevich integral misses &mdash; the conjecture is open; Kosanovi&cacute;&rsquo;s ' +
          'surjectivity is exactly one half of it.</li>' +
        '</ul>' +
        '<p style="font-size:0.95em;color:#555">Status warning for lecture use: &ldquo;tower invariants are ' +
        'finite-type&rdquo; is a theorem (BCKS 2017); universality is a theorem over \\(\\mathbb{Q}\\) (and ' +
        '\\(p\\)-locally in a range), a conjecture over \\(\\mathbb{Z}\\). Keep the statements separated, and keep the ' +
        'indexing convention (stage \\(n\\) &harr; type \\(n{-}1\\)) fixed throughout a lecture.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>5. The homotopy type of knot spaces</h3>' +
        '<ul>' +
          '<li><strong>Codimension \\(\\geq 3\\): complete rational answer.</strong> For \\(n \\geq 4\\) the tower ' +
          'converges, and Lambrechts&ndash;Turchin&ndash;Voli&cacute; (<em>The rational homology of spaces of long knots ' +
          'in codimension \\(&gt; 2\\)</em>, Geom. Topol. 14, 2010) proved the Vassiliev spectral sequence collapses ' +
          'rationally: \\(H_*(\\mathcal{K}_n; \\mathbb{Q})\\) is computed by a graph complex. The key input is ' +
          'Kontsevich&rsquo;s formality of the little-disks operad.</li>' +
          '<li><strong>Operad actions.</strong> Budney (<em>Little cubes and long knots</em>, Topology 46, 2007) showed ' +
          '\\(\\mathcal{K}_3\\) is a free algebra over the little \\(2\\)-cubes operad on the space of prime long knots ' +
          '&mdash; the homotopy-theoretic refinement of the prime decomposition of knots (Schubert). Connected sum ' +
          '<em>is</em> a little-cubes multiplication.</li>' +
          '<li><strong>Spectral Lie / hairy graph descriptions.</strong> Arone&ndash;Turchin identified the layers of ' +
          'the embedding tower with derived spaces of maps between modules over the little-disks operads ' +
          '(&ldquo;infinitesimal bimodules&rdquo;), leading to hairy-graph-complex computations of ' +
          '\\(\\pi_*(\\mathcal{K}_n)\\) (Arone&ndash;Turchin 2014&ndash;15; Fresse&ndash;Turchin&ndash;Willwacher).</li>' +
        '</ul>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>6. Dimensions of finite-type invariants</h3>' +
        '<p>For orientation, the dimensions of the graded pieces of the space of rational finite-type invariants ' +
        '(Bar-Natan, Topology 34, 1995, computed through degree \\(9\\); Kneissler through \\(12\\)):</p>' +
        '<table class="dict-table" style="border-collapse:collapse">' +
          '<thead><tr style="border-bottom:1.5px solid #333">' +
            '<th style="padding:5px 12px;text-align:left">degree \\(d\\)</th>' +
            '<th style="padding:5px 12px">0</th><th style="padding:5px 12px">1</th><th style="padding:5px 12px">2</th>' +
            '<th style="padding:5px 12px">3</th><th style="padding:5px 12px">4</th><th style="padding:5px 12px">5</th>' +
            '<th style="padding:5px 12px">6</th><th style="padding:5px 12px">7</th><th style="padding:5px 12px">8</th>' +
            '<th style="padding:5px 12px">9</th>' +
          '</tr></thead>' +
          '<tbody><tr>' +
            '<td style="padding:5px 12px">\\(\\dim \\mathcal{V}_d / \\mathcal{V}_{d-1}\\)</td>' +
            '<td style="padding:5px 12px;text-align:center">1</td><td style="padding:5px 12px;text-align:center">0</td>' +
            '<td style="padding:5px 12px;text-align:center">1</td><td style="padding:5px 12px;text-align:center">1</td>' +
            '<td style="padding:5px 12px;text-align:center">3</td><td style="padding:5px 12px;text-align:center">4</td>' +
            '<td style="padding:5px 12px;text-align:center">9</td><td style="padding:5px 12px;text-align:center">14</td>' +
            '<td style="padding:5px 12px;text-align:center">27</td><td style="padding:5px 12px;text-align:center">44</td>' +
          '</tr></tbody>' +
        '</table>' +
        '<p style="margin-top:0.9em">Mind what the tower actually tracks: the universality conjecture concerns ' +
        '<em>additive</em> (primitive) invariants, so under it the successive stages add rank equal to the dimensions ' +
        'of the spaces of degree-\\(d\\) primitives, of which the table above is the polynomial-algebra closure ' +
        '(a general finite-type invariant is a polynomial in additive ones). Compare the ' +
        '<em>Polynomial Invariants</em> tab (Vassiliev sub-tab), where the same numbers arise from chord diagrams ' +
        'modulo the 4T relation.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>7. Practice</h3>' +
        '<details class="kl-practice"><summary>Exercise 1: the linear stage for long knots</summary>' +
        '<p>Using Smale&ndash;Hirsch, show \\(\\operatorname{Imm}_c(\\mathbb{R}, \\mathbb{R}^3) \\simeq \\Omega S^2\\) ' +
        '(compactly supported immersions of the line, i.e. the linear stage of the long-knot tower before reducing ' +
        'modulo immersions). Conclude that \\(T_1\\) sees only the winding data of the unit tangent vector &mdash; no ' +
        'knotting at all, consistent with knotting being a degree-\\(\\geq 2\\) phenomenon.</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 2: configurations from punctures</summary>' +
        '<p>Remove \\(j\\) disjoint closed intervals from \\(\\mathbb{R}\\): what remains is two rays and \\(j - 1\\) ' +
        'compact arcs. Show that the embedding space of each ray (standard near infinity) is weakly contractible ' +
        '&mdash; pull it in from infinity &mdash; so that the punctured-knot space, modulo immersions, is equivalent ' +
        'to a configuration space of \\(j - 1\\) framed points in \\(\\mathbb{R}^3\\). Start with \\(j = 3\\) ' +
        '(two middle arcs \\(\\rightsquigarrow\\) \\(2\\) points).</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 3: \\(c_2\\) two ways</summary>' +
        '<p>Compute \\(c_2\\) (the \\(z^2\\)-coefficient of the Conway polynomial) for the trefoil and figure-eight from ' +
        'the <em>Polynomial Invariants</em> tab (\\(c_2(3_1) = 1\\), \\(c_2(4_1) = -1\\)), then read the BCSS paper&rsquo;s ' +
        'quadrisecant formula and verify the trefoil count qualitatively on a standard diagram. Two definitions, one ' +
        'invariant &mdash; that coincidence <em>is</em> the content of the tower being finite-type.</p>' +
        '</details>' +
        '<details class="kl-practice"><summary>Exercise 4: why codimension 2 is hard</summary>' +
        '<p>Trace through the connectivity estimate \\(\\bigl(k(n-m-2)+1-m\\bigr)\\) for \\(m=1\\): for \\(n = 4\\) the tower ' +
        'converges (how fast?); for \\(n = 3\\) each stage could a priori add or destroy \\(\\pi_0\\)-information. ' +
        'Where exactly does the disjunction argument of Goodwillie&ndash;Klein need codimension \\(\\geq 3\\)? ' +
        '(Think: pushing an arc off a ball meets obstructions of dimension \\(m + 1 + m - n\\)&hellip;)</p>' +
        '</details>' +
      '</div>';
  }

  function otherCalculiHTML() {
    return '' +
      '<div class="expo-panel">' +
        '<h3>1. Orthogonal calculus</h3>' +
        '<p>Weiss&rsquo;s <strong>orthogonal calculus</strong> (<em>Orthogonal calculus</em>, Trans. Amer. Math. Soc., 1995) ' +
        'studies continuous functors \\(F : \\mathcal{J} \\to \\mathcal{S}\\) from the category of finite-dimensional real ' +
        'inner-product spaces and linear isometric embeddings &mdash; functors of the <em>dimension</em> rather than of a ' +
        'space. Standard examples:</p>' +
        '<div class="formula-box">$$V \\mapsto BO(V), \\qquad V \\mapsto B\\mathrm{Top}(V), \\qquad V \\mapsto B\\mathrm{Diff}_\\partial(D^V), \\qquad V \\mapsto \\operatorname{Emb}(M, N \\times V).$$</div>' +
        '<p>The theory runs parallel to homotopy calculus: polynomial degree \\(\\leq n\\) in the vector-space variable, ' +
        'approximations \\(T_n F\\), a tower, and \\(n\\)-th derivative <em>spectra</em> \\(\\Theta^{(n)} F\\) now carrying an ' +
        'action of the orthogonal group \\(O(n)\\) rather than \\(\\Sigma_n\\); the layers are ' +
        '\\(\\Omega^\\infty\\bigl( (\\Theta^{(n)}F \\wedge S^{nV})_{hO(n)} \\bigr)\\)-shaped. Because the inputs are ' +
        'representations, orthogonal calculus is the natural home for questions about \\(BO\\), block bundles, and ' +
        'spaces of manifolds; it has seen a renaissance in the study of diffeomorphism groups ' +
        '(e.g. the Weiss fibrations behind exotic phenomena in \\(B\\mathrm{Top}(n)\\), Weiss 2021, and subsequent ' +
        'work of Kupers, Randal-Williams, and others).</p>' +
        '<p style="font-size:0.95em;color:#555">Relation to the other calculi: for a fixed manifold \\(M\\), ' +
        '\\(V \\mapsto \\operatorname{Emb}(M, N \\times V)\\) is simultaneously an orthogonal functor in \\(V\\) and, in ' +
        '\\(M\\), a manifold-calculus presheaf; playing the two towers against each other is a standard technique ' +
        '(Arone, Arone&ndash;Turchin).</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>2. Discrete and abelian functor calculus</h3>' +
        '<p>For functors of <em>abelian</em> or module categories, everything can be done with chain complexes and ' +
        '<span class="kl-term" title="Cotriple (comonad): an endofunctor with counit and comultiplication; iterating it produces a simplicial resolution, whose realization defines derived functors.">cotriple</span> resolutions. ' +
        'Johnson&ndash;McCarthy (<em>Deriving calculus with cotriples</em>, Trans. Amer. Math. Soc. 356, 2004) build a ' +
        'Taylor tower for functors of abelian (later, via Bauer&ndash;Johnson&ndash;McCarthy, unbased and more general) ' +
        'categories out of Eilenberg&ndash;MacLane cross effects: \\(P_n F\\) is the total complex of the cotriple ' +
        'resolution generated by \\(\\operatorname{cr}_{n+1}\\). The theory:</p>' +
        '<ul>' +
          '<li>recovers Eilenberg&ndash;MacLane&rsquo;s polynomial functors (\\(\\operatorname{cr}_{n+1} = 0\\)) as the ' +
          '\\(n\\)-excisive objects &mdash; the calculator in <em>Derivatives &amp; Layers</em> lives here;</li>' +
          '<li>recovers Dold&ndash;Puppe derived functors of non-additive functors (1961) and stable derived functors ' +
          'as linearizations;</li>' +
          '<li>agrees with the Goodwillie tower under stability hypotheses, but is genuinely different in general ' +
          '&mdash; a useful cautionary pair of towers for the same functor.</li>' +
        '</ul>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>3. \\(\\infty\\)-categories, tangent categories, and where the subject is going</h3>' +
        '<ul>' +
          '<li><strong>Lurie, <em>Higher Algebra</em>, Chapter 6.</strong> The modern foundation: \\(n\\)-excisive ' +
          'functors between \\(\\infty\\)-categories, \\(P_n\\) as a left exact accessible localization, and the beautiful ' +
          'reformulation of stability itself: the \\(\\infty\\)-category of spectra is <em>defined</em> as ' +
          '\\(\\mathrm{Sp} = \\operatorname{Exc}_*(\\mathcal{S}^{\\mathrm{fin}}_*, \\mathcal{S})\\), <em>reduced</em> ' +
          '\\(1\\)-excisive functors (HA Definition 1.4.2.8 &mdash; the subscript \\(*\\) for reducedness matters: ' +
          'without it one picks up the extra datum \\(F(*)\\)) &mdash; linear algebra as the first chapter of ' +
          'calculus.</li>' +
          '<li><strong>Heuts, <em>Goodwillie approximations to higher categories</em> (Mem. AMS 272, 2021).</strong> ' +
          'Categorifies the tower: the \\(\\infty\\)-category of spaces itself has a Taylor tower of \\(\\infty\\)-categories ' +
          'interpolating from \\(\\mathcal{S}_*\\) to \\(\\mathrm{Sp}\\), with layers controlled by \\(\\partial_* \\mathrm{Id}\\). ' +
          'Combined with the spectral Lie operad this yields Lie-algebra models for \\(v_n\\)-periodic unstable homotopy ' +
          'theory (Heuts, 2021).</li>' +
          '<li><strong>Tangent \\(\\infty\\)-categories (Bauer&ndash;Burke&ndash;Ching, 2021&ndash;).</strong> ' +
          'Goodwillie calculus is literally differential geometry: there is a tangent structure (in the sense of ' +
          'Rosick&yacute; and Cockett&ndash;Cruttwell) on the \\((\\infty,2)\\)-category of <em>differentiable</em> ' +
          '\\(\\infty\\)-categories and sequential-colimit-preserving functors, whose ' +
          'tangent spaces are stabilizations \\(T_X \\mathcal{C} \\simeq \\mathrm{Sp}(\\mathcal{C}_{/X})\\) and whose ' +
          'differential objects are stable \\(\\infty\\)-categories; Goodwillie&rsquo;s \\(P_n\\) and \\(\\partial_n\\) ' +
          'become jets and derivatives in the formal sense. (Still an arXiv preprint as of mid-2026; cite it as ' +
          'such.)</li>' +
          '<li><strong>Topos-theoretic calculus (Anel&ndash;Biedermann&ndash;Finster&ndash;Joyal, 2018&ndash;2024).</strong> ' +
          'See <em>Sheafification</em>: left exact localizations and a Blakers&ndash;Massey theorem abstract enough to ' +
          'apply to the Goodwillie tower and to reprove the classical statement.</li>' +
        '</ul>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>4. The calculi at a glance</h3>' +
        '<table class="dict-table" style="width:100%;border-collapse:collapse">' +
          '<thead><tr style="border-bottom:1.5px solid #333">' +
            '<th style="padding:6px 10px;text-align:left"></th>' +
            '<th style="padding:6px 10px;text-align:left">Homotopy</th>' +
            '<th style="padding:6px 10px;text-align:left">Manifold</th>' +
            '<th style="padding:6px 10px;text-align:left">Orthogonal</th>' +
            '<th style="padding:6px 10px;text-align:left">Discrete/abelian</th>' +
          '</tr></thead>' +
          '<tbody>' +
            '<tr><td style="padding:4px 10px"><strong>input</strong></td><td style="padding:4px 10px">spaces / spectra</td><td style="padding:4px 10px">opens of \\(M\\)</td><td style="padding:4px 10px">inner-product spaces</td><td style="padding:4px 10px">modules / abelian cats</td></tr>' +
            '<tr><td style="padding:4px 10px"><strong>polynomial</strong></td><td style="padding:4px 10px">\\(n\\)-excisive</td><td style="padding:4px 10px">degree \\(\\leq k\\) (Weiss covers)</td><td style="padding:4px 10px">poly degree \\(\\leq n\\) in \\(V\\)</td><td style="padding:4px 10px">\\(\\operatorname{cr}_{n+1} = 0\\)</td></tr>' +
            '<tr><td style="padding:4px 10px"><strong>layer coefficients</strong></td><td style="padding:4px 10px">spectra + \\(\\Sigma_n\\)</td><td style="padding:4px 10px">configuration-space data</td><td style="padding:4px 10px">spectra + \\(O(n)\\)</td><td style="padding:4px 10px">chain complexes + \\(\\Sigma_n\\)</td></tr>' +
            '<tr><td style="padding:4px 10px"><strong>approximation is sheafification?</strong></td><td style="padding:4px 10px">analogy (left exact, non-topological)</td><td style="padding:4px 10px"><strong>theorem</strong> (Weiss topology)</td><td style="padding:4px 10px">analogy</td><td style="padding:4px 10px">analogy</td></tr>' +
            '<tr><td style="padding:4px 10px"><strong>signature application</strong></td><td style="padding:4px 10px">\\(K \\simeq \\mathrm{TC}\\) locally; \\(v_n\\)-periodicity</td><td style="padding:4px 10px">knot spaces; \\(\\operatorname{Emb}\\)</td><td style="padding:4px 10px">\\(B\\mathrm{Top}(n)\\), \\(B\\mathrm{Diff}\\)</td><td style="padding:4px 10px">Dold&ndash;Puppe, Andr&eacute;&ndash;Quillen</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>';
  }

  function furtherReadingHTML() {
    return '' +
      '<div class="expo-panel">' +
        '<h3>Primary sources</h3>' +
        '<ul>' +
          '<li>T. Goodwillie, <em>Calculus I: The first derivative of pseudoisotopy theory</em>, ' +
          '<em>K</em>-Theory 4 (1990), 1&ndash;27.</li>' +
          '<li>T. Goodwillie, <em>Calculus II: Analytic functors</em>, <em>K</em>-Theory 5 (1991/92), 295&ndash;332. ' +
          '(Cited as both 1991 and 1992; the volume straddles the years.)</li>' +
          '<li>T. Goodwillie, <em>Calculus III: Taylor series</em>, Geom. Topol. 7 (2003), 645&ndash;711 ' +
          '(arXiv:math/0310481). Circulated as a preprint for a decade before publication &mdash; 1990s papers cite it ' +
          'as such.</li>' +
          '<li>M. Weiss, <em>Orthogonal calculus</em>, Trans. Amer. Math. Soc. 347 (1995), 3743&ndash;3796; ' +
          'erratum Trans. Amer. Math. Soc. 350 (1998), 851&ndash;855.</li>' +
          '<li>M. Weiss, <em>Embeddings from the point of view of immersion theory I</em>, Geom. Topol. 3 (1999), ' +
          '67&ndash;101 (arXiv:math/9905202); erratum Geom. Topol. 15 (2011), 407&ndash;409 &mdash; cite the corrected ' +
          'statements.</li>' +
          '<li>T. Goodwillie and M. Weiss, <em>Embeddings from the point of view of immersion theory II</em>, ' +
          'Geom. Topol. 3 (1999), 103&ndash;118 (arXiv:math/9905203).</li>' +
          '<li>T. Goodwillie and J. Klein, <em>Multiple disjunction for spaces of smooth embeddings</em>, ' +
          'J. Topol. 8 (2015), 651&ndash;674 (arXiv:1407.6787) &mdash; the engine behind convergence.</li>' +
          '<li>P. Boavida de Brito and M. Weiss, <em>Manifold calculus and homotopy sheaves</em>, ' +
          'Homology Homotopy Appl. 15 (2013), 361&ndash;383 (arXiv:1202.1305).</li>' +
        '</ul>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>Surveys and textbooks &mdash; where to actually start</h3>' +
        '<ul>' +
          '<li><strong>G. Arone and M. Ching, <em>Goodwillie calculus</em></strong>, in <em>Handbook of Homotopy ' +
          'Theory</em> (H. Miller, ed.), CRC Press, 2020 (arXiv:1902.00803). The survey of record; start here.</li>' +
          '<li><strong>B. Munson and I. Voli&cacute;, <em>Cubical Homotopy Theory</em></strong>, Cambridge Univ. Press, ' +
          '2015. The standard teaching text: Part I is the (co)cartesian-cube technology, with full proofs of ' +
          'Blakers&ndash;Massey; the final chapter builds the homotopy and manifold calculi, with ' +
          'embeddings/immersions and spaces of knots as the applications (orthogonal calculus is not covered). ' +
          'The natural companion volume for this module.</li>' +
          '<li>N. Kuhn, <em>Goodwillie towers and chromatic homotopy: an overview</em>, Geom. Topol. Monogr. 10 ' +
          '(2007), 245&ndash;279 (arXiv:math/0410342).</li>' +
          '<li>B. Munson, <em>Introduction to the manifold calculus of Goodwillie&ndash;Weiss</em>, ' +
          'Morfismos 14 (2010) (arXiv:1005.1698) &mdash; gentle entry to the embedding side.</li>' +
          '<li>J. Lurie, <em>Higher Algebra</em>, Chapter 6 &mdash; the \\(\\infty\\)-categorical foundation.</li>' +
          '<li>C. Rezk, <em>A streamlined proof of Goodwillie&rsquo;s \\(n\\)-excisive approximation</em>, ' +
          'Algebr. Geom. Topol. 13 (2013), 1049&ndash;1051 (arXiv:0812.1324) &mdash; two pages; read after the ' +
          '<em>Taylor Tower</em> sub-tab.</li>' +
          '<li>B. Dundas, T. Goodwillie, and R. McCarthy, <em>The Local Structure of Algebraic K-Theory</em>, ' +
          'Springer, 2013 &mdash; the \\(K \\simeq \\mathrm{TC}\\) story in full.</li>' +
        '</ul>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>The knot-theory thread</h3>' +
        '<ul>' +
          '<li>D. Sinha, <em>Operads and knot spaces</em>, J. Amer. Math. Soc. 19 (2006), 461&ndash;486; ' +
          '<em>The topology of spaces of knots: cosimplicial models</em>, Amer. J. Math. 131 (2009), 945&ndash;980.</li>' +
          '<li>R. Budney, F. Cohen, <em>et al.</em> on the homotopy type of knot spaces; R. Budney, ' +
          '<em>Little cubes and long knots</em>, Topology 46 (2007), 1&ndash;27.</li>' +
          '<li>Budney&ndash;Conant&ndash;Scannell&ndash;Sinha, <em>New perspectives on self-linking</em>, ' +
          'Adv. Math. 191 (2005), 78&ndash;113 &mdash; the type-\\(2\\) invariant from the tower.</li>' +
          '<li>Budney&ndash;Conant&ndash;Koytcheff&ndash;Sinha, <em>Embedding calculus knot invariants are of finite ' +
          'type</em>, Algebr. Geom. Topol. 17 (2017), 1701&ndash;1742.</li>' +
          '<li>I. Voli&cacute;, <em>Finite type knot invariants and the calculus of functors</em>, ' +
          'Compos. Math. 142 (2006), 222&ndash;250.</li>' +
          '<li>P. Boavida de Brito and G. Horel, <em>Galois symmetries of knot spaces</em>, ' +
          'Compos. Math. 157 (2021), 997&ndash;1021.</li>' +
          '<li>D. Kosanovi&cacute;, <em>Embedding calculus and grope cobordism of knots</em>, ' +
          'Adv. Math. 451 (2024).</li>' +
          '<li>Lambrechts&ndash;Turchin&ndash;Voli&cacute;, <em>The rational homology of spaces of long knots in ' +
          'codimension \\(&gt; 2\\)</em>, Geom. Topol. 14 (2010), 2151&ndash;2187.</li>' +
          '<li>See the <em>Knots &amp; Embedding Calculus</em> sub-tab for how these fit together, and the ' +
          '<em>Polynomial Invariants</em> tab for the Vassiliev-invariant background.</li>' +
        '</ul>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>Lecture notes and courses (verified available, July 2026)</h3>' +
        '<ul>' +
          '<li>MIT <strong>Talbot Workshop 2012</strong>: <em>Calculus of Functors</em> (mentored by Arone and Ching) ' +
          '&mdash; full workshop notes online.</li>' +
          '<li>J. Noel and R. Reis, Goodwillie-calculus graduate seminar notes (2012).</li>' +
          '<li>A. Debray, UT Austin graduate seminar notes on Goodwillie calculus (Fall 2017).</li>' +
          '<li>M. Blans and G. Heuts, Utrecht seminar (Fall 2022): a close reading of <em>Calculus III</em>.</li>' +
          '<li>Oxford Topology Advanced Class on Goodwillie Calculus, Hilary Term 2025.</li>' +
          '<li>Historical: the Oberwolfach Arbeitsgemeinschaft on Goodwillie calculus (Report 17/2004), organized by ' +
          'Goodwillie and McCarthy &mdash; its program is still a good syllabus skeleton.</li>' +
        '</ul>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>A 14-week graduate course plan</h3>' +
        '<table class="dict-table" style="width:100%;border-collapse:collapse">' +
          '<thead><tr style="border-bottom:1.5px solid #333">' +
            '<th style="padding:6px 10px;text-align:left">Weeks</th>' +
            '<th style="padding:6px 10px;text-align:left">Topic</th>' +
            '<th style="padding:6px 10px;text-align:left">Reading</th>' +
            '<th style="padding:6px 10px;text-align:left">KnotLab sub-tab</th>' +
          '</tr></thead>' +
          '<tbody>' +
            '<tr><td style="padding:4px 10px">1&ndash;2</td><td style="padding:4px 10px">homotopy (co)limits, cubes, total (co)fibers</td><td style="padding:4px 10px">Munson&ndash;Voli&cacute; ch. 3, 5</td><td style="padding:4px 10px">Cubes &amp; Excision &sect;1</td></tr>' +
            '<tr><td style="padding:4px 10px">3</td><td style="padding:4px 10px">Blakers&ndash;Massey; Freudenthal</td><td style="padding:4px 10px">Munson&ndash;Voli&cacute; ch. 4, 6</td><td style="padding:4px 10px">Cubes &amp; Excision &sect;4</td></tr>' +
            '<tr><td style="padding:4px 10px">4&ndash;5</td><td style="padding:4px 10px">\\(n\\)-excision; \\(T_n\\), \\(P_n\\), the tower; Rezk&rsquo;s proof</td><td style="padding:4px 10px">Calc III &sect;1; Rezk 2013; Arone&ndash;Ching &sect;&sect;1&ndash;3</td><td style="padding:4px 10px">Taylor Tower</td></tr>' +
            '<tr><td style="padding:4px 10px">6</td><td style="padding:4px 10px">localization view; manifold calculus as sheafification</td><td style="padding:4px 10px">Boavida de Brito&ndash;Weiss 2013; Lurie HA &sect;6.1.1</td><td style="padding:4px 10px">Sheafification</td></tr>' +
            '<tr><td style="padding:4px 10px">7&ndash;8</td><td style="padding:4px 10px">cross effects; homogeneous classification; derivatives</td><td style="padding:4px 10px">Calc III &sect;&sect;2&ndash;5</td><td style="padding:4px 10px">Derivatives &amp; Layers</td></tr>' +
            '<tr><td style="padding:4px 10px">9</td><td style="padding:4px 10px">convergence, analyticity; identity functor</td><td style="padding:4px 10px">Calc II; Arone&ndash;Mahowald 1999 (survey level)</td><td style="padding:4px 10px">Worked Examples &sect;1</td></tr>' +
            '<tr><td style="padding:4px 10px">10</td><td style="padding:4px 10px">\\(\\Sigma^\\infty\\Omega^\\infty\\); \\(K\\)-theory and \\(\\mathrm{TC}\\)</td><td style="padding:4px 10px">Kuhn overview; DGM book (skim)</td><td style="padding:4px 10px">Worked Examples &sect;&sect;2&ndash;3</td></tr>' +
            '<tr><td style="padding:4px 10px">11&ndash;12</td><td style="padding:4px 10px">manifold calculus; \\(\\operatorname{Emb}\\); convergence</td><td style="padding:4px 10px">Weiss 1999; Munson survey; Goodwillie&ndash;Weiss 1999</td><td style="padding:4px 10px">Knots &amp; Embedding Calculus &sect;&sect;1&ndash;3</td></tr>' +
            '<tr><td style="padding:4px 10px">13</td><td style="padding:4px 10px">long knots; finite-type invariants from the tower</td><td style="padding:4px 10px">Sinha 2009; BCSS 2005; BCKS 2017</td><td style="padding:4px 10px">Knots &amp; Embedding Calculus &sect;&sect;4&ndash;6</td></tr>' +
            '<tr><td style="padding:4px 10px">14</td><td style="padding:4px 10px">outlook: chain rules, orthogonal calculus, tangent categories</td><td style="padding:4px 10px">Arone&ndash;Ching 2011 (statements); Heuts 2021</td><td style="padding:4px 10px">Other Calculi</td></tr>' +
          '</tbody>' +
        '</table>' +
        '<p style="margin-top:0.9em;font-size:0.95em;color:#555">Assessment suggestion: the practice exercises in each ' +
        'sub-tab are calibrated as weekly problem-set seeds; a term paper re-proving one layer computation ' +
        '(e.g. \\(D_2 \\mathrm{Id}\\) on spheres, or the \\(T_3\\)-stage knot invariant) makes a strong capstone.</p>' +
      '</div>' +

      '<div class="expo-panel">' +
        '<h3>Prerequisites checklist</h3>' +
        '<ul>' +
          '<li>homotopy limits and colimits, model-categorical or \\(\\infty\\)-categorical, at the level of ' +
          'Munson&ndash;Voli&cacute; chapters 3 and 5 or Riehl&rsquo;s <em>Categorical Homotopy Theory</em>;</li>' +
          '<li>spectra: smash products, connectivity, homotopy orbits/fixed points (any modern introduction &mdash; ' +
          'the layer formula is unreadable without them);</li>' +
          '<li>for the knot applications: configuration spaces and the basics of finite-type invariants ' +
          '(<em>Polynomial Invariants</em> tab, Vassiliev sub-tab, is exactly the needed background);</li>' +
          '<li>optional but enriching: operads (for the chain rule), Grothendieck topologies (for the ' +
          'sheafification sub-tab), and the EHP sequence (for the identity-functor material).</li>' +
        '</ul>' +
      '</div>';
  }

  // ───────────────────────────────────────────────────────────────────
  //  Interactive demo wiring (called after innerHTML is set)
  // ───────────────────────────────────────────────────────────────────

  // ── Demo 1: classical Taylor approximation, side by side with the tower ──

  var TAYLOR_FNS = {
    exp: {
      label: 'eˣ',
      latex: 'e^{x}',
      f: function (x) { return Math.exp(x); },
      coef: function (k) { return 1 / factorial(k); },
      termLatex: function (k) {
        if (k === 0) return '1';
        if (k === 1) return 'x';
        return '\\frac{x^{' + k + '}}{' + k + '!}';
      },
      sign: function (k) { return 1; },
      radius: Infinity, xrange: [-3, 3], yrange: [-2, 12]
    },
    sin: {
      label: 'sin x',
      latex: '\\sin x',
      f: function (x) { return Math.sin(x); },
      coef: function (k) {
        if (k % 2 === 0) return 0;
        var m = (k - 1) / 2;
        return (m % 2 === 0 ? 1 : -1) / factorial(k);
      },
      termLatex: function (k) {
        if (k === 1) return 'x';
        return '\\frac{x^{' + k + '}}{' + k + '!}';
      },
      sign: function (k) { var m = (k - 1) / 2; return m % 2 === 0 ? 1 : -1; },
      radius: Infinity, xrange: [-7, 7], yrange: [-3, 3]
    },
    log1p: {
      label: 'ln(1+x)',
      latex: '\\ln(1+x)',
      f: function (x) { return Math.log(1 + x); },
      coef: function (k) {
        if (k === 0) return 0;
        return (k % 2 === 1 ? 1 : -1) / k;
      },
      termLatex: function (k) {
        if (k === 1) return 'x';
        return '\\frac{x^{' + k + '}}{' + k + '}';
      },
      sign: function (k) { return k % 2 === 1 ? 1 : -1; },
      radius: 1, xrange: [-0.98, 3], yrange: [-4, 2]
    },
    geom: {
      label: '1/(1−x)',
      latex: '\\frac{1}{1-x}',
      f: function (x) { return 1 / (1 - x); },
      coef: function (k) { return 1; },
      termLatex: function (k) {
        if (k === 0) return '1';
        if (k === 1) return 'x';
        return 'x^{' + k + '}';
      },
      sign: function (k) { return 1; },
      radius: 1, xrange: [-2, 0.98], yrange: [-1, 8]
    },
    atan: {
      label: 'arctan x',
      latex: '\\arctan x',
      f: function (x) { return Math.atan(x); },
      coef: function (k) {
        if (k % 2 === 0) return 0;
        var m = (k - 1) / 2;
        return (m % 2 === 0 ? 1 : -1) / k;
      },
      termLatex: function (k) {
        if (k === 1) return 'x';
        return '\\frac{x^{' + k + '}}{' + k + '}';
      },
      sign: function (k) { var m = (k - 1) / 2; return m % 2 === 0 ? 1 : -1; },
      radius: 1, xrange: [-3, 3], yrange: [-1.8, 1.8]
    }
  };

  function taylorEval(fn, n, x) {
    var s = 0;
    for (var k = 0; k <= n; k++) s += fn.coef(k) * Math.pow(x, k);
    return s;
  }

  function taylorPolyLatex(fn, n) {
    var parts = [];
    for (var k = 0; k <= n; k++) {
      var c = fn.coef(k);
      if (c === 0) continue;
      var t = fn.termLatex(k);
      if (parts.length === 0) {
        parts.push((fn.sign(k) < 0 ? '-' : '') + t);
      } else {
        parts.push((fn.sign(k) < 0 ? ' - ' : ' + ') + t);
      }
    }
    if (parts.length === 0) parts.push('0');
    return parts.join('');
  }

  function wireTaylorDemo() {
    var sel = document.getElementById('fc-taylor-fn');
    var slider = document.getElementById('fc-taylor-n');
    var nLabel = document.getElementById('fc-taylor-nval');
    var plotDiv = document.getElementById('fc-taylor-plot');
    var readout = document.getElementById('fc-taylor-readout');
    if (!sel || !slider || !plotDiv || typeof Plotly === 'undefined') return;

    function update() {
      var fn = TAYLOR_FNS[sel.value];
      var n = parseInt(slider.value, 10);
      if (nLabel) nLabel.textContent = String(n);

      var xs = [], ys = [], ts = [];
      var x0 = fn.xrange[0], x1 = fn.xrange[1];
      var N = 400;
      for (var i = 0; i <= N; i++) {
        var x = x0 + (x1 - x0) * i / N;
        xs.push(x);
        ys.push(fn.f(x));
        ts.push(taylorEval(fn, n, x));
      }

      var traces = [
        { type: 'scatter', mode: 'lines', x: xs, y: ys,
          line: { color: '#2171b5', width: 2.5 }, name: 'f(x)' },
        { type: 'scatter', mode: 'lines', x: xs, y: ts,
          line: { color: '#d6604d', width: 2, dash: 'solid' }, name: 'Tₙf(x)' }
      ];

      var shapes = [];
      if (isFinite(fn.radius)) {
        shapes.push({ type: 'line', x0: fn.radius, x1: fn.radius,
          y0: fn.yrange[0], y1: fn.yrange[1],
          line: { color: '#888', width: 1, dash: 'dash' } });
        shapes.push({ type: 'line', x0: -fn.radius, x1: -fn.radius,
          y0: fn.yrange[0], y1: fn.yrange[1],
          line: { color: '#888', width: 1, dash: 'dash' } });
      }

      Plotly.newPlot(plotDiv, traces, {
        title: { text: fn.label + '  vs  degree-' + n + ' Taylor polynomial', font: { size: 14 } },
        margin: { l: 45, r: 15, t: 40, b: 40 },
        paper_bgcolor: '#f5f5f5', plot_bgcolor: '#fff',
        xaxis: { range: fn.xrange, zeroline: true },
        yaxis: { range: fn.yrange, zeroline: true },
        showlegend: true,
        legend: { x: 0.02, y: 0.98 },
        shapes: shapes
      }, { responsive: true, displayModeBar: false });

      if (readout) {
        var radiusNote = isFinite(fn.radius)
          ? 'Radius of convergence \\(R = ' + fn.radius + '\\) (dashed lines): outside it the tower of polynomials does <em>not</em> converge to \\(f\\), no matter how large \\(n\\).'
          : 'This series converges everywhere: \\(f\\) is <em>entire</em>, the analogue of a functor with unlimited analyticity.';
        var layerClause = (n >= 1)
          ? 'the difference between consecutive stages corresponds to the homogeneous layer ' +
            '\\(D_{' + n + '}F = \\operatorname{fib}(P_{' + n + '}F \\to P_{' + (n - 1) + '}F)\\); '
          : 'the constant term corresponds to \\(P_0 F \\simeq F(*)\\), the bottom of the tower; ';
        readout.innerHTML =
          '<div class="formula-box">$$T_{' + n + '}f(x) = ' + taylorPolyLatex(fn, n) + '$$</div>' +
          '<p>' + radiusNote + '</p>' +
          '<p style="color:#555;font-size:0.93em"><strong>Dictionary.</strong> The degree-\\(' + n + '\\) polynomial ' +
          '\\(T_{' + n + '}f\\) corresponds to the \\(' + n + '\\)-excisive approximation \\(P_{' + n + '}F\\); ' +
          layerClause +
          'the radius of convergence corresponds to \\(\\rho\\)-analyticity: for a \\(\\rho\\)-analytic ' +
          'functor the tower converges on \\(\\rho\\)-connected spaces.</p>';
        mathRender(readout);
      }
    }

    sel.addEventListener('change', update);
    slider.addEventListener('input', update);
    update();
  }

  // ── Demo 2: (co)cartesian squares gallery ──

  // Shared square-diagram builder: 3x3 CSS grid with KaTeX corner labels.
  function squareDiagram(tl, tr, bl, br) {
    var cell = 'display:flex;align-items:center;justify-content:center;padding:6px 10px;min-width:70px';
    var arrow = 'display:flex;align-items:center;justify-content:center;color:#666;font-size:1.25em';
    return '' +
      '<div style="display:grid;grid-template-columns:auto auto auto;justify-content:center;margin:0.8em 0" data-edit-skip>' +
        '<div style="' + cell + '">' + tl + '</div>' +
        '<div style="' + arrow + '">&#10230;</div>' +
        '<div style="' + cell + '">' + tr + '</div>' +
        '<div style="' + arrow + '">&#8595;</div>' +
        '<div></div>' +
        '<div style="' + arrow + '">&#8595;</div>' +
        '<div style="' + cell + '">' + bl + '</div>' +
        '<div style="' + arrow + '">&#10230;</div>' +
        '<div style="' + cell + '">' + br + '</div>' +
      '</div>';
  }

  function verdictBadges(cocart, cart) {
    function badge(label, yes, detail) {
      var color = yes ? '#2e7d32' : '#c62828';
      var mark = yes ? '&#10003;' : '&#10007;';
      return '<span style="display:inline-block;border:1.5px solid ' + color + ';color:' + color +
        ';border-radius:4px;padding:2px 10px;margin-right:10px;font-weight:600">' +
        label + ' ' + mark + (detail ? ' <span style="font-weight:400;font-size:0.9em">(' + detail + ')</span>' : '') +
        '</span>';
    }
    return '<p style="margin:0.4em 0 0.7em 0">' +
      badge('cocartesian', cocart.yes, cocart.detail) +
      badge('cartesian', cart.yes, cart.detail) + '</p>';
  }

  var CUBE_EXAMPLES = {
    susp: {
      html: squareDiagram('\\(S^{n-1}\\)', '\\(D^n\\)', '\\(D^n\\)', '\\(S^n\\)') +
        verdictBadges({ yes: true, detail: '' }, { yes: false, detail: '(2n&minus;3)-cartesian' }) +
        '<p>The two hemispheres of \\(S^n\\) glued along the equator: a homotopy pushout by construction ' +
        '(this <em>is</em> the suspension \\(\\Sigma S^{n-1} = S^n\\)). But the homotopy pullback of ' +
        '\\(D^n \\to S^n \\leftarrow D^n\\) is the path space \\(\\Omega S^n\\) (both disks are contractible), and the ' +
        'comparison map is the Freudenthal unit \\(S^{n-1} \\to \\Omega S^n = \\Omega \\Sigma S^{n-1}\\), which is ' +
        '\\((2n-3)\\)-connected (Blakers&ndash;Massey with both initial maps \\((n{-}1)\\)-connected) but never an ' +
        'equivalence.</p>' +
        '<p><strong>Concrete failure at \\(n = 1\\):</strong> cover the circle by two arcs. The pullback ' +
        '\\(\\Omega S^1\\) has one path component for every winding number &mdash; \\(\\pi_0(\\Omega S^1) = \\mathbb{Z}\\) &mdash; while the ' +
        'equator \\(S^0\\) has just two points. Excision sees only winding numbers \\(0\\) and \\(1\\); the identity ' +
        'functor is blind to nothing, so it cannot be \\(1\\)-excisive. Applied to this square, the tower stage ' +
        '\\(P_1(\\mathrm{Id}) = \\Omega^\\infty \\Sigma^\\infty\\) replaces the failure by its best linear approximation: ' +
        'stable homotopy.</p>'
    },
    prod: {
      html: squareDiagram('\\(X \\times Y\\)', '\\(X\\)', '\\(Y\\)', '\\(*\\)') +
        verdictBadges({ yes: false, detail: 'pushout is the join X &lowast; Y' }, { yes: true, detail: '' }) +
        '<p>A homotopy pullback by definition: \\(X \\times Y = X \\times_* Y\\). It is almost never a homotopy ' +
        'pushout: the pushout of \\(X \\leftarrow X \\times Y \\to Y\\) is the <span class="kl-term" ' +
        'title="Join X ∗ Y: the space of line segments from points of X to points of Y; homotopy equivalent to Σ(X ∧ Y) for well-pointed spaces. Example: S&sup1; = S&#8304; ∗ S&#8304;.">join</span> ' +
        '\\(X * Y \\simeq \\Sigma(X \\wedge Y)\\), not a point.</p>' +
        '<p><strong>Concrete case \\(X = Y = S^0\\):</strong> the square has \\(4\\) points mapping to \\(2\\) points ' +
        'twice; the pushout glues four segments into the circle \\(S^0 * S^0 = S^1\\), which is visibly not \\(*\\). ' +
        'Note the duality with the suspension square: cocartesian-but-not-cartesian and cartesian-but-not-cocartesian ' +
        'are both generic; squares that are both are the exception.</p>'
    },
    hopf: {
      html: squareDiagram('\\(S^3\\)', '\\(D^4\\)', '\\(S^2\\)', '\\(\\mathbb{CP}^2\\)') +
        verdictBadges({ yes: true, detail: '' }, { yes: false, detail: '3-cartesian' }) +
        '<p>The attaching square of the Hopf map \\(\\eta : S^3 \\to S^2\\): gluing a \\(4\\)-cell to \\(S^2\\) along ' +
        '\\(\\eta\\) produces \\(\\mathbb{CP}^2\\), so the square is cocartesian. Blakers&ndash;Massey: the map ' +
        '\\(S^3 \\to D^4 \\simeq *\\) is \\(3\\)-connected and the Hopf map \\(\\eta : S^3 \\to S^2\\) (fiber \\(S^1\\)) is \\(1\\)-connected, so the square is ' +
        '\\((3 + 1 - 1) = 3\\)-cartesian. The estimate is sharp: \\(\\pi_4\\) of the homotopy pullback ' +
        '\\(\\operatorname{hofib}(S^2 \\to \\mathbb{CP}^2)\\) receives a copy of \\(\\mathbb{Z}\\) from ' +
        '\\(\\pi_5(\\mathbb{CP}^2) \\cong \\pi_5(S^5)\\) (via the fibration \\(S^1 \\to S^5 \\to \\mathbb{CP}^2\\)), which the ' +
        'comparison map from \\(S^3\\) (with \\(\\pi_4(S^3) = \\mathbb{Z}/2\\)) cannot cover &mdash; so the square is ' +
        '\\(3\\)- but not \\(4\\)-cartesian.</p>'
    },
    const: {
      html: squareDiagram('\\(X\\)', '\\(X\\)', '\\(X\\)', '\\(X\\)') +
        verdictBadges({ yes: true, detail: '' }, { yes: true, detail: '' }) +
        '<p>All maps the identity: both comparison maps are equivalences, so the square is cartesian <em>and</em> ' +
        'cocartesian (&ldquo;\\(\\infty\\)-(co)cartesian&rdquo;). Constant cubes are sent to cartesian cubes by every ' +
        'homotopy functor &mdash; which is why \\(0\\)-excisive functors (constant ones) exist at all, and why the ' +
        'tower starts from \\(P_0 F = F(*)\\) rather than from nothing.</p>'
    }
  };

  function wireCubeDemo() {
    var sel = document.getElementById('fc-cube-sel');
    var box = document.getElementById('fc-cube-box');
    if (!sel || !box) return;
    function update() {
      var ex = CUBE_EXAMPLES[sel.value];
      if (!ex) return;
      box.innerHTML = ex.html;
      mathRender(box);
    }
    sel.addEventListener('change', update);
    update();
  }

  // ── Demo 3: cross-effect calculator for classical polynomial functors ──

  function crossEffectDim(family, d, k) {
    // dim of the k-th cross effect cr_k F (Q, ..., Q) for F applied to
    // 1-dimensional rational vector spaces.
    if (k === 0) return d === 0 ? 1 : 0;   // cr_0 F = F(0), and 0^{⊗d} = Sym^d(0) = Λ^d(0) = 0 for d ≥ 1
    if (k > d) return 0;
    if (family === 'tensor') return factorial(k) * stirling2(d, k);      // surjections {1..d} -> {1..k}
    if (family === 'sym') return binomial(d - 1, k - 1);                 // compositions of d into k positive parts
    if (family === 'ext') return k === d ? 1 : 0;                        // parts must all equal 1
    return 0;
  }

  function wireCrossEffectDemo() {
    var sel = document.getElementById('fc-cross-fn');
    var slider = document.getElementById('fc-cross-d');
    var dLabel = document.getElementById('fc-cross-dval');
    var out = document.getElementById('fc-cross-out');
    if (!sel || !slider || !out) return;

    var FAMILY_INFO = {
      tensor: {
        name: '\\(F(A) = A^{\\otimes d}\\)',
        formula: 'k!\\,S(d,k)',
        note: 'the number of surjections \\(\\{1,\\dots,d\\} \\twoheadrightarrow \\{1,\\dots,k\\}\\): ' +
          'each tensor factor must choose which of the \\(k\\) arguments it draws from, and every ' +
          'argument must actually be used (cross effects are reduced in each variable).'
      },
      sym: {
        name: '\\(F(A) = \\operatorname{Sym}^d A\\)',
        formula: '\\binom{d-1}{k-1}',
        note: 'the number of compositions \\(d = d_1 + \\cdots + d_k\\) with every \\(d_i \\geq 1\\): ' +
          '\\(\\operatorname{cr}_k(\\operatorname{Sym}^d)(A_1,\\dots,A_k) = \\bigoplus \\operatorname{Sym}^{d_1}A_1 ' +
          '\\otimes \\cdots \\otimes \\operatorname{Sym}^{d_k}A_k\\), and each \\(\\operatorname{Sym}^{d_i}\\) of a line is a line.'
      },
      ext: {
        name: '\\(F(A) = \\Lambda^d A\\)',
        formula: '[k = d]',
        note: 'the same composition sum with \\(\\Lambda^{d_i}\\) in place of \\(\\operatorname{Sym}^{d_i}\\); ' +
          'but \\(\\Lambda^{j}\\) of a 1-dimensional space vanishes for \\(j \\geq 2\\), so only the ' +
          'composition \\(1 + 1 + \\cdots + 1\\) (forcing \\(k = d\\)) survives.'
      }
    };

    function update() {
      var fam = sel.value;
      var d = parseInt(slider.value, 10);
      if (dLabel) dLabel.textContent = String(d);
      var info = FAMILY_INFO[fam];

      var rows = '';
      for (var k = 1; k <= d + 1; k++) {
        var dim = crossEffectDim(fam, d, k);
        var hl = (k === d + 1)
          ? ';background:#eef6ee'
          : (dim === 0 ? ';color:#999' : '');
        rows += '<tr>' +
          '<td style="padding:4px 12px;border-bottom:1px solid #eee' + hl + '">\\(\\operatorname{cr}_{' + k + '}\\)</td>' +
          '<td style="padding:4px 12px;border-bottom:1px solid #eee;text-align:right' + hl + '">' + dim + '</td>' +
          '</tr>';
      }

      out.innerHTML =
        '<p style="margin-top:0.4em">Cross-effect dimensions of ' + info.name + ' evaluated on lines ' +
        '\\((\\mathbb{Q}, \\dots, \\mathbb{Q})\\), general formula \\(\\dim \\operatorname{cr}_k = ' + info.formula + '\\):</p>' +
        '<table style="border-collapse:collapse;margin:0.5em 0">' +
        '<thead><tr>' +
        '<th style="padding:4px 12px;text-align:left;border-bottom:1.5px solid #333">cross effect</th>' +
        '<th style="padding:4px 12px;text-align:right;border-bottom:1.5px solid #333">dim over \\(\\mathbb{Q}\\)</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table>' +
        '<p style="color:#555;font-size:0.93em">Why: ' + info.note + '</p>' +
        '<p><strong>Degree read-off:</strong> \\(\\operatorname{cr}_{' + (d + 1) + '} = 0\\) (highlighted row), so this functor is ' +
        'polynomial of degree \\(\\leq ' + d + '\\) in the classical Eilenberg&ndash;MacLane sense &mdash; ' +
        'the algebraic shadow of \\(' + d + '\\)-excision.</p>';
      mathRender(out);
    }

    sel.addEventListener('change', update);
    slider.addEventListener('input', update);
    update();
  }

  // ───────────────────────────────────────────────────────────────────
  //  Router
  // ───────────────────────────────────────────────────────────────────

  var RENDERERS = [
    overviewHTML,
    cubesHTML,
    towerHTML,
    sheafHTML,
    derivativesHTML,
    examplesHTML,
    knotsHTML,
    otherCalculiHTML,
    furtherReadingHTML
  ];

  // Post-render wiring per sub-tab (null = static content).
  var WIRERS = [
    null,
    wireCubeDemo,
    wireTaylorDemo,
    null,
    wireCrossEffectDemo,
    null,
    null,
    null,
    null
  ];

  window.renderFunctorCalculus = function (containerEl) {
    var activeTab = 0;
    containerEl.innerHTML = '';

    var controls = document.createElement('div');
    controls.className = 'fk-controls';

    var subtabs = document.createElement('div');
    subtabs.className = 'fk-subtabs';

    var tabBtns = [];
    SUB_TABS.forEach(function (name, i) {
      var btn = document.createElement('button');
      btn.className = 'fk-subtab' + (i === 0 ? ' active' : '');
      btn.innerHTML = name;
      btn.addEventListener('click', function () { switchTab(i); });
      subtabs.appendChild(btn);
      tabBtns.push(btn);
    });
    controls.appendChild(subtabs);
    containerEl.appendChild(controls);

    var content = document.createElement('div');
    content.className = 'fk-content';
    containerEl.appendChild(content);

    function switchTab(idx) {
      activeTab = idx;
      tabBtns.forEach(function (b, i) { b.classList.toggle('active', i === idx); });
      renderTab(idx);
    }

    function renderTab(idx) {
      content.innerHTML = RENDERERS[idx]();
      mathRender(content);
      if (WIRERS[idx]) {
        try { WIRERS[idx](); } catch (e) { /* demo failed; static content stands */ }
      }
    }

    switchTab(0);
  };
})();
