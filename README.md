# TECHNICSAN

A bilingual Astro product catalogue for TECHNICSAN, focused on exactly five types: **Cement bulker, LPG catalog, Compressors, Mixers and Silos**. The active catalogue has fourteen curated products, bilingual pages, galleries, family/search filters and a sales enquiry form. Products and guides are edited in the company's free Sanity project. Content remains a preview until technical facts, photographs and company details are approved. Shared branding is documented in `DESIGN.md`; scalable logo assets live in `public/brand/`.

## GitHub Pages preview

The owner requested republishing the current review website on 24 November 2026 at [technicsan.com](https://technicsan.com/). Content approval and noindex gates remain in place. Public repository: [MohamedAliNaguez/Machina](https://github.com/MohamedAliNaguez/Machina).

The GitHub Pages workflow has a **manual trigger only**. It builds published Sanity content and deploys only when explicitly run. Publishing content in Sanity or pushing code does not update the public website.

The hosted version retains sample labels and `noindex` metadata. Its sales enquiry form sends to the owner-confirmed **info@technicsan.com** inbox through the company Formspree form configured in `src/data/enquiry-delivery.json`. This is separate from GitHub hosting: Formspree handles private submission storage and email notifications. The local development version still uses local SQLite and sends no email. Verified company/product content and reviewed privacy copy are still needed for the full launch.

## Run locally

Requires Node.js 24 LTS and npm. From this directory:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4321/tr/** or **http://127.0.0.1:4321/en/**. The development API automatically creates `.local/enquiries.sqlite` using Node's built-in SQLite. It stores example submissions locally and never sends real emails. Use invented contact details while testing.

```sh
npm run check
npm test
npm run build
npm run test:browser
```

Browser tests require Playwright Chromium (`npx playwright install chromium`). `npm run preview` serves built HTML only. Use `npm run dev` for working local form submissions, or `npm run local:cloudflare` for the Cloudflare runtime after applying the local D1 migration.

## Content editor

Open **[TECHNICSAN Content Studio](https://technicsan-content.sanity.studio/)** and sign in with the owner account used during setup. Sanity Free is connected, with five families, fourteen products and company settings imported. The guide collection is empty until reviewed articles are published. See [the editing guide](docs/SANITY-EDITOR.md).

Run `npm --prefix studio ci`, then `npm run studio` for a local editor. `npm run content:check` checks the published content connection. Public project defaults live in `src/data/sanity.json`; never put secrets in `SANITY_STUDIO_*` or `PUBLIC_*` variables. `CONTENT_SOURCE=repository` uses the retained local catalogue for offline recovery. Failed CMS requests stop the build instead of silently substituting sample content.

For full-site draft preview builds, see [operations](docs/OPERATIONS.md). Draft tokens are server/build secrets. Preview access must be restricted at the hosting layer before uploading company drafts.

## Architecture

- Astro static rendering; small TypeScript interactions, no React bundle on public pages.
- Self-hosted Barlow Condensed headings and Source Sans 3 body text, including Turkish characters; Anton remains only for legacy design studies.
- Sanity authenticated editor; published content fetched at build time.
- Cloudflare Pages Functions implement `POST /api/enquiries`; D1 holds private submissions and an email outbox.
- Resend sends notifications after durable storage; a scheduled Worker retries failures.
- Turkish and English slugs are linked through content IDs. Search/filter state lives in URL parameters.

See [design rules](DESIGN.md), [content/launch requirements](docs/CONTENT.md), [operations and recovery](docs/OPERATIONS.md), and [asset sources](docs/ASSETS.md).

## Preview and launch

The default build is **noindex**, excludes URLs from the sitemap and uses sample labels. It is a working preview, not a live company or inventory feed. No sales contact destinations are invented.

Production requires genuine company copy, approved machine images/specifications, reviewed translations and privacy copy, actual contact details, and provider configuration. `PUBLIC_LAUNCH_READY=true` is deliberately blocked with sample data. See the launch preflight in the operations guide. All accounts should belong to the company. The public GitHub Pages preview is separate from this verified company launch. No paid provider plan has been enabled.

The approved steel interior screen family is implemented across the public templates. See [visual and functional review](design-qa.md) for comparison evidence, tested journeys and remaining launch inputs.
