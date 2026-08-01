# Yuxu Chen — Academic Homepage

This repository is the deployed source for [chanyuxu.github.io](https://chanyuxu.github.io/).

The homepage and section pages are dependency-free static HTML/CSS/JavaScript. Earlier placeholder posts and their legacy archive have been removed.

## Main files

- `index.html` — academic homepage and complete publication list
- `domain-theory/index.html` — latest Domain Theory monthly article and archive navigation
- `ai4math/index.html` — featured AI4MATH article and right-side article navigation
- `ai4math/paper-to-lean/index.html` — Paper to Lean project article
- `ai4math/unit-interval-retracts/index.html` — Unit-interval retracts Lean 4 case study
- `ai4math/rb-function-space-characterization/index.html` — RB-domain function-space Lean 4 case study
- `downloads/unit-interval-retracts/` — downloadable manuscript PDF and Lean source bundle
- `downloads/rb-function-space-characterization/` — downloadable manuscript PDF and Lean source bundle
- `notes/index.html` — future research notes
- `css/academic.css` — shared academic-site design system
- `js/academic.js` — automatic publication numbering and footer year

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
