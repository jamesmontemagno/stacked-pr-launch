# Stacked, not stalled

[![Validate static site](https://github.com/jamesmontemagno/stacked-pr-launch/actions/workflows/ci.yml/badge.svg)](https://github.com/jamesmontemagno/stacked-pr-launch/actions/workflows/ci.yml)
[![Deploy GitHub Pages](https://github.com/jamesmontemagno/stacked-pr-launch/actions/workflows/pages.yml/badge.svg)](https://github.com/jamesmontemagno/stacked-pr-launch/actions/workflows/pages.yml)

An interactive, static learning experience for GitHub stacked pull requests.

**Live site:** https://jamesmontemagno.github.io/stacked-pr-launch/

The project explains why stacks matter, demonstrates how dependent pull requests are created and merged, and provides a runnable workshop that turns the mental model into a real three-pull-request stack.

## What is included

- **Animated stack simulator** — builds pull requests upward from `main`, tracks review readiness, and animates ready layers through the merge path.
- **Before-and-after explanation** — contrasts a single large pull request with focused, independently reviewable layers.
- **Live GitHub news** — displays a static snapshot refreshed daily from the official GitHub Changelog RSS feed.
- **Hands-on workshop** — guides developers through a tested task model, HTTP API, and browser interface across three branches.
- **Runnable reference app** — provides the completed workshop application for comparison and recovery.
- **Accessible interaction** — includes keyboard-friendly controls, explicit status narration, responsive layouts, and reduced-motion behavior.
- **Architecture deck** — documents the experience, front-end structure, content pipeline, CI/CD, and operational boundaries.

## Site routes

| Route | Purpose |
| --- | --- |
| [`/`](https://jamesmontemagno.github.io/stacked-pr-launch/) | Product explanation, interactive simulator, preview news, and workshop entry point |
| [`/workshop.html`](https://jamesmontemagno.github.io/stacked-pr-launch/workshop.html) | Six-checkpoint runnable stacked pull request lab |
| [`/examples/task-workshop/`](examples/task-workshop/) | Completed Node.js reference implementation |

## How the site works

The production site has no framework, server, client-side build, database, or runtime secret.

```text
GitHub Changelog RSS
        |
        v
scheduled GitHub Action
        |
        v
data/changelog.json
        |
        v
static HTML + CSS + JavaScript
        |
        v
GitHub Pages
```

`index.html` and `workshop.html` contain the semantic page structure. `styles.css` owns the shared visual and responsive system. `script.js` manages simulator state, workshop progress, copy controls, syntax highlighting, and the static changelog snapshot. Prism is vendored locally so workshop code remains highlighted without a third-party runtime request.

## Local development

Serve the repository root with any static file server:

```shell
python -m http.server 4173
```

Then open:

- http://localhost:4173/
- http://localhost:4173/workshop.html

Opening the HTML files directly also works for most of the experience, but a local server is recommended because browsers may restrict `fetch()` for `file://` pages.

## Workshop reference app

The workshop builds a small task inbox in three reviewable layers:

```text
task-ui    -> task-api -> task-model -> main
browser UI    HTTP API    domain logic
```

Run the finished reference implementation:

```shell
cd examples/task-workshop
npm test
npm start
```

Open http://localhost:3000. The app uses only Node.js built-ins and requires Node.js 22 or later.

## Validation

Run the same lightweight checks used by CI:

```shell
node --check script.js
node --check scripts/update-changelog.mjs
node --check examples/task-workshop/server.js
npm test --prefix examples/task-workshop
```

The CI workflow additionally verifies that both HTML documents contain complete page structure and that `data/changelog.json` matches the expected shape.

## GitHub Actions

| Workflow | Trigger | Responsibility |
| --- | --- | --- |
| [`Validate static site`](.github/workflows/ci.yml) | Pull requests and pushes to `main` | Checks JavaScript syntax, HTML structure, changelog data, and workshop tests |
| [`Deploy GitHub Pages`](.github/workflows/pages.yml) | Pushes to `main` and manual dispatch | Repeats validation, uploads the static artifact, and deploys through the protected Pages environment |
| [`Refresh changelog news`](.github/workflows/update-changelog.yml) | Daily at `13:17 UTC` and manual dispatch | Fetches the official RSS feed and commits `data/changelog.json` only when content changes |

The Pages deployment uses GitHub's OIDC-backed deployment action. No deployment token or repository secret is required.

## Refreshing changelog content locally

```shell
node scripts/update-changelog.mjs
```

The updater:

1. Fetches `https://github.blog/changelog/feed/`.
2. Keeps only entries whose GitHub Changelog type is `Release` or `Improvement`.
3. Selects the six newest matching entries.
4. Normalizes titles, links, dates, types, and summaries.
5. Writes `data/changelog.json` only when the serialized content changes.

If the browser cannot load the snapshot, the page retains the verified stacked pull request launch announcement as a meaningful fallback.

## Project structure

```text
.
|-- .github/workflows/        CI, Pages deployment, and scheduled news refresh
|-- data/changelog.json       Versioned GitHub Changelog snapshot
|-- examples/task-workshop/   Runnable workshop reference application
|-- scripts/                  Content updater and architecture deck generator
|-- vendor/prism.js           Local syntax-highlighting runtime
|-- index.html                Main learning experience and simulator
|-- workshop.html             Runnable developer workshop
|-- script.js                 Interactive behavior
|-- styles.css                Shared visual system
|-- PRODUCT.md                Durable product context
|-- DESIGN.md                 Design-system decisions
`-- Stacked-PR-Launch-Architecture.pptx
```

## Product sources

Product behavior and claims are based on:

- [Stacked pull requests are now in public preview](https://github.blog/changelog/2026-07-30-stacked-pull-requests-are-now-in-public-preview/)
- [GitHub stacked pull requests documentation](https://gh.io/stacks)
- [`github/gh-stack`](https://github.com/github/gh-stack)

Stacked pull requests are in public preview and their interface or CLI behavior may change. The scheduled content workflow keeps the news area current; workshop commands should be checked against the official documentation when the preview changes.
