# Local implementation verification

The website is a local preview. No cloud account, paid service, public deployment or real sales destination has been enabled.

## Completed checks

- Astro/public-site type check: zero errors, warnings or hints.
- Cloudflare endpoint/worker TypeScript check: passed.
- Production-format static build: 56 pages generated, in preview mode.
- Built-page integrity: 1,607 internal links/asset references checked; JSON-LD parsed successfully; translated-page links verified as reciprocal. Preview pages remain excluded from indexing and the sitemap.
- Unit/integration suite: 16 tests passed. Includes content completeness/launch gates, used-machine facts, duplicate routes, unsafe media URLs, contact validation, same-origin checks, rate limiting, durable storage, duplicate/racing requests, database failures, challenge verification, notification failures/retries and notification leases.
- Browser suite: six workflows passed. Covers translated navigation, URL filters, empty results, clear/reset, form validation and actual local storage, interrupted requests, mobile navigation, reduced motion, horizontal overflow, loaded images, preview metadata and sold-machine alternatives.
- Accessibility: axe checked five representative Turkish/English pages with WCAG 2 A/AA, WCAG 2.1 A/AA and WCAG 2.2 AA tags. No violations in the final run. This is automated coverage, not a claim of full manual assistive-technology certification.
- Sanity Studio type check and static build: passed using the explicit non-connected `preview00` build ID. No real project was accessed. Authenticated publishing/preview against the company's account remains to be configured and verified.
- Cloudflare local emulator: Pages Functions compiled; D1 migration applied; built pages served successfully; a sample enquiry saved; duplicate retry returned the same reference; preview/filter indexing headers verified.
- Local D1 export restored into an isolated SQLite database, preserving the sample enquiry. The scheduled notification Worker bundled successfully in dry-run mode without deployment.
- Premium static project audit: no findings. Official DESIGN.md lint: zero errors; informational orphan-token warnings remain because runtime CSS usage is documented rather than encoded as component references.
- Formatting check: passed.

## Performance

A mobile Lighthouse run against the built site in the local Cloudflare emulator measured a performance score of 100, FCP 0.8 seconds, LCP 1.2 seconds, total blocking time 0 milliseconds and CLS 0.001. These are local lab observations, not production field guarantees. INP requires real interaction/field data after launch. The preview deliberately fails the indexability SEO check; do not remove that protection while sample content remains.

## External verification still required at launch

Company-owned Sanity project, published content and webhook; protected full-site draft host; verified email sender and sales destination; production Turnstile keys; actual Cloudflare bindings/secrets; remote backup and deployment rollback rehearsal; Search Console ownership; approved company/privacy content and native-language review. No real email, live availability, SEO ranking, GEO citation or production recovery outcome is claimed by the local preview.
