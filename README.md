# Yuxu Chen — Academic Homepage

This repository is the deployed source for [chanyuxu.github.io](https://chanyuxu.github.io/).

The homepage and section pages are dependency-free static HTML/CSS/JavaScript. Earlier placeholder posts and their legacy archive have been removed.

## Main files

- `index.html` — academic homepage and complete publication list
- `domain-theory/index.html` — automatic latest-article entry for Domain Theory
- `domain-theory/finite-valuation-approximable-domains/index.html` — introduction to the finite-valuation approximable category and the Jung--Tix problem
- `domain-theory/fs-domains-are-not-always-rb-domains/index.html` — archived July 2026 Domain Theory article
- `ai4math/index.html` — automatic latest-article entry for AI4MATH
- `ai4math/formalizing-domain-theory-in-the-age-of-ai/index.html` — talk article with an embedded slide viewer
- `ai4math/paper-to-lean/index.html` — Paper to Lean project article
- `ai4math/unit-interval-retracts/index.html` — Unit-interval retracts Lean 4 case study
- `ai4math/rb-function-space-characterization/index.html` — RB-domain function-space Lean 4 case study
- `ai4math/coherence-homogeneity/index.html` — AI-assisted literature-search and coherence-space case study
- `ai4math/lipschitz-yoneda-final-topology/index.html` — axiom-audited Lean
  proof of the Lipschitz Yoneda final-topology headline theorem
- `downloads/unit-interval-retracts/` — downloadable manuscript PDF and Lean source bundle
- `downloads/rb-function-space-characterization/` — downloadable manuscript PDF and Lean source bundle
- `downloads/coherence-homogeneity/` — revised manuscript PDF and Lean source bundle
- `downloads/lipschitz-yoneda-final-topology/` — manuscript PDF and the
  claim-ledgered Lean source bundle
- `notes/index.html` — future research notes
- `css/academic.css` — shared academic-site design system
- `data/articles.json` — generated article registry used by section entry pages and article sidebars
- `scripts/build-article-index.mjs` — scans article metadata and regenerates the registry
- `js/academic.js` — latest-article routing, sidebar generation, publication numbering, and footer year

## Automatic latest-article routing

Each article must have an `article:published_time` meta tag and a
`section-label` meta tag. Run the following command after adding an article:

```sh
node scripts/build-article-index.mjs
node scripts/test-article-navigation.mjs
```

The generated registry is sorted by publication date. Section links, section
entry pages, and right-side article navigation all use that one registry. The
`Update article index` GitHub Actions workflow reruns the generator after
article pages are pushed and commits the registry if it changed.

## Content still to confirm

Before adding these items publicly, verify them with Yuxu:

- portrait photograph
- researcher identifiers and profile links (ORCID, Google Scholar, arXiv)
- downloadable CV

Do not infer or invent any of these fields from similarly named researchers.

## Local preview

Run a static server from the repository root, for example:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.
