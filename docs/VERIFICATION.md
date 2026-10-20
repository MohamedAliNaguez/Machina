# Implementation and hosted-preview verification

Verified on 2026-10-20. The public GitHub Pages preview is published from [MohamedAliNaguez/Machina](https://github.com/MohamedAliNaguez/Machina). It uses labelled sample content, noindex metadata and a disabled enquiry form; it is not the verified company launch.

## Current checks

- Astro/public-site and backend TypeScript checks: zero errors, warnings or hints.
- Static GitHub Pages build: 56 pages, 1310 valid internal link/asset references, valid JSON-LD and reciprocal language links. Every local URL retains the repository base path.
- Unit/backend suite: 18 tests pass, covering content/launch gates, translations, used-machine fields, validation, same-origin requests, rate limits, durable storage, duplicate/concurrent submissions, database failure, challenge validation, notification retry/lease behavior and repository path handling.
- GitHub's website verification job passed formatting, types, unit tests, build and all six Playwright browser workflows on a clean Ubuntu runner. The first Pages deployment completed successfully; latest statuses are visible in [Actions](https://github.com/MohamedAliNaguez/Machina/actions).
- Browser checks against the repository-hosted build: ten representative English/Turkish screens have no missing eager images or links escaping /Machina/. URL filters return the expected four matches; language switching retains filters. Gallery images and selected-machine context retain the base path.
- Hosted personal-data inputs and Send action are disabled with explicit preview-only copy; there is no outgoing form request. Local development retains its working sample enquiry API.
- Static preview remains noindex. A project-scoped robots.txt does not govern the github.io root; native per-page metadata is retained.
- Existing steel-design accessibility scans and visual comparison history are documented in [design-qa.md](../design-qa.md). This is automated/manual coverage, not formal assistive-technology certification.
- Sanity Studio has its own explicit Node type dependency for clean standalone installation. Its type check passes locally, and the verification workflow separately installs both package manifests, checks and builds it. Sanity's Vite resolver also reads the parent Astro tsconfig, so the root build dependencies are installed in the editor job. No real Sanity project is connected or deployed.
- Private environment files, local databases, exports and generated workspace folders are ignored by Git. A credential-pattern scan of the initial published source found no credential matches.

## Dependency maintenance

Installing the standalone editor's explicit Node types reported 17 existing/transitive audit findings (8 moderate, 9 high) in the Studio dependency tree. Studio is not included in the GitHub Pages artifact. Review these dependencies before connecting or publishing the editor; a forced breaking upgrade was not applied during website deployment.

## Earlier local-runtime evidence

Before the steel screen implementation, the local Cloudflare rehearsal compiled Pages Functions, applied the local D1 migration, saved an example enquiry, confirmed duplicate handling and restored an isolated SQLite export. The notification Worker bundled without deployment. A mobile Lighthouse run on that earlier local baseline measured score 100, LCP 1.2 seconds and CLS 0.001; those historical lab numbers are not measurements or guarantees for the newly hosted steel site. Real-user INP and field performance remain to be measured.

## Full-launch inputs

Verified company/contact data, actual inventory/photos/specifications, reviewed bilingual copy and privacy policy; a company-owned content editor/project; a real enquiry backend, notification destination and spam protection; content publishing automation; production backups/rollback rehearsal; Search Console and field measurement. No email delivery, live stock, ranking, GEO citation or production recovery outcome is claimed by the static preview.
