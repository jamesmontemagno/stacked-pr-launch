# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and engineering teams who need to ship a substantial change without asking reviewers to parse one large, risky pull request.

## Product Purpose

This launch site teaches developers how GitHub stacked pull requests turn a large change into a series of small, reviewable layers. Success means a visitor understands the workflow and can practice it locally.

## Positioning

Stacked pull requests are an ordered series of pull requests built into GitHub. Each pull request targets the layer below it, so existing reviews, checks, branch protections, and merge requirements continue to apply.

## Operating Context

The product is evaluated from a browser while a developer is deciding how to organize and review multi-part code changes. The companion workshop is run from a local terminal with the GitHub CLI.

## Capabilities and Constraints

The site is static and deploys to GitHub Pages. It includes an interactive, client-side stack simulator and a workshop. The following details are inferred from the requested release announcement: public-preview availability, the `github/gh-stack` CLI extension, parallel review, and merging an entire ready stack or individual layers.

## Evidence on Hand

The supplied GitHub Changelog announcement published July 30, 2026 is the source for all product claims:
https://github.blog/changelog/2026-07-30-stacked-pull-requests-are-now-in-public-preview/

## Product Principles

- Explain through an honest, manipulable workflow rather than abstract feature claims.
- Preserve the safety and familiarity of existing GitHub protections.
- Make the next step small enough to try immediately.
- Keep every product claim traceable to the release announcement.

