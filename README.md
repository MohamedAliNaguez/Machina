# TECHNICSAN

A bilingual Astro product catalogue for TECHNICSAN, focused on exactly five types: **Cement bulker, LPG catalog, Compressors, Mixers and Silos**. The active catalogue has fourteen curated products, bilingual pages, galleries, family/search filters and a sales enquiry form. Products and guides are edited in the company's free Sanity project. Content remains a preview until technical facts, photographs and company details are approved. Shared branding is documented in `DESIGN.md`; scalable logo assets live in `public/brand/`.

## Cloudflare Pages hosting

The review website is hosted on [Cloudflare Pages](https://technicsan.com/en/). The domain stays registered at Namecheap; Cloudflare manages DNS and valid HTTPS for the apex and www. Email remains on Namecheap Private Email and enquiries remain on Formspree. Search indexing stays disabled pending company/content approval.

Use `npm run cloudflare:build` to validate and build published Sanity content, and `npm run cloudflare:deploy` to publish using the owner account. The manual-only GitHub workflow is prepared for the same deployment. See [migration status](docs/CLOUDFLARE-MIGRATION.md) for remaining credential verification. Pushes and Sanity edits do not automatically publish.

## Run locally

Requires Node.js 24 LTS and npm. From this directory:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4321/en/** (the default) or **http://127.0.0.1:4321/tr/**. The development API automatically creates `.local/enquiries.sqlite` using Node's built-in SQLite. It stores example submissions locally and never sends real emails. Use invented contact details while testing.

```sh
npm run check
npm test
npm run build
npm run test:browser
```

Browser tests require Playwright Chromium (`npx playwright install chromium`). `npm run preview` serves built HTML only. Use `npm run dev` for working local form submissions, or `npm run local:cloudflare` for the Cloudflare runtime after applying the local D1 migration.

## Content editor

Open **[TECHNICSAN Content Studio](https://technicsan-content.sanity.studio/)** and sign in with the owner account used during setup. Sanity Free is connected, with five families, fourteen products and company settings imported. Five private guide drafts are prepared in Studio; the public guide collection stays empty until reviewed articles are published. See [the editing guide](docs/SANITY-EDITOR.md).

Run `npm --prefix studio ci`, then `npm run studio` for a local editor. `npm run content:check` checks the published content connection. Public project defaults live in `src/data/sanity.json`; never put secrets in `SANITY_STUDIO_*` or `PUBLIC_*` variables. `CONTENT_SOURCE=repository` uses the retained local catalogue for offline recovery. Failed CMS requests stop the build instead of silently substituting sample content.

For full-site draft preview builds, see [operations](docs/OPERATIONS.md). Draft tokens are server/build secrets. Preview access must be restricted at the hosting layer before uploading company drafts.

## Architecture

- Astro static rendering; small TypeScript interactions, no React bundle on public pages.
- Self-hosted Barlow Condensed headings and Source Sans 3 body text, including Turkish characters; Anton remains only for legacy design studies.
- Sanity authenticated editor; published content fetched at build time.
- Cloudflare Pages serves the public site; Formspree handles hosted enquiries.
- Optional native Functions/D1 enquiry storage remains separate from the deployed site.
- The optional native backend supports Resend and retries; production continues using the confirmed Formspree inbox.
- Turkish and English slugs are linked through content IDs. Search/filter state lives in URL parameters.

See [design rules](DESIGN.md), [content/launch requirements](docs/CONTENT.md), [operations and recovery](docs/OPERATIONS.md), and [asset sources](docs/ASSETS.md).

## Preview and launch

The default build is **noindex**, excludes URLs from the sitemap and uses sample labels. It is a working preview, not a live company or inventory feed. No sales contact destinations are invented.

Production requires genuine company copy, approved machine images/specifications, reviewed translations and privacy copy, actual contact details, and provider configuration. `PUBLIC_LAUNCH_READY=true` requires valid production HTTPS and approved company details. Individual pages additionally need language-specific SEO and evidence approval; pending products can coexist with approved company/category pages. See the launch preflight in the operations guide. All accounts should belong to the company. The public GitHub Pages preview is separate from this verified company launch. No paid provider plan has been enabled.

The approved steel interior screen family is implemented across the public templates. See [visual and functional review](design-qa.md) for comparison evidence, tested journeys and remaining launch inputs.

## SEO release workflow

See [SEO release and measurement](docs/SEO-RELEASE.md) for the Search readiness editor checklist, five category landing pages, guide drafts, free search-account setup, consent-aware analytics, performance baselines and manual phased deployment. `npm run seo:audit` reports missing approvals without changing them. The manual deployment workflow defaults to review mode; its optional `search_release` must pass the production preflight.
