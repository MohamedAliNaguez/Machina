# TECHNICSAN search release

## Current release scope

The owner approved a **brand-only release on 26 November 2026**: English and Turkish Home and Contact only. These four pages use confirmed TECHNICSAN branding, Ankara location and sales contact details. This does not verify the registered company identity, factory address, manufacturing role, privacy review, company history, product specifications or guide authorship.

Sanity → Company & launch settings → Search release scope controls this boundary. `brand-only` requires valid brand/contact facts and separate language-specific SEO approval, and excludes every other page regardless of its individual approval. `company` restores the complete company-evidence requirements plus each page's checks. Existing verification flags were left unchanged.

The first release sitemap must contain exactly:

- `https://technicsan.com/en/`
- `https://technicsan.com/tr/`
- `https://technicsan.com/en/contact/`
- `https://technicsan.com/tr/iletisim/`

Catalogue filters, categories, products, company history/About, guides and privacy remain `noindex`. Public non-indexable pages remain crawlable so search engines can read their exclusion instructions. cPanel and webmail should not be indexed; their older Search Console exclusions are not sales-website errors.

## Deployment

Production uses Cloudflare Pages with a managed certificate, HTTPS redirects and the canonical host `https://technicsan.com`. The deployed sales form uses Formspree. Cloudflare preview hostnames always receive `X-Robots-Tag: noindex, follow`, even when the production artifact is search-enabled. Design routes are removed from every production artifact.

`deployment/cloudflare/search-release.json` records that normal production deployments are search-enabled. `npm run cloudflare:build` and `npm run cloudflare:deploy` preserve the release by default. Readiness checks verify published content, the enquiry endpoint, HTTPS and canonical-host redirects before release. They do not send test emails.

Use `--review` explicitly to generate or deploy an entirely excluded review artifact. `--search-release` explicitly requests release; it cannot be combined with `--review`. The manual GitHub workflow defaults its `search_release` input to true; turning it off explicitly passes `--review`. Repository deployment credentials still need to be present for the GitHub button to work; local authenticated deployment remains available.

## Verification

Run the relevant unit/browser checks and Studio typecheck before deployment. Production build verification checks canonical URLs, reciprocal language alternates, structured data, internal links/assets and sitemap membership. Confirm the four-page sitemap, crawlable robots file, indexable Home/Contact HTML and excluded product/guide HTML on the canonical host after deployment. Confirm preview hostnames remain excluded.

Submit `https://technicsan.com/sitemap.xml` to the owner-controlled Search Console property after deployment. Use live URL inspection on representative Home/Contact pages. An accepted sitemap or indexing request does not guarantee indexing or rankings. Historical reports can still list URLs crawled before the hosting move.

## Expanding the release

Legal company name, public address, manufacturing evidence and actual technical author/reviewer remain outstanding. Complete and review these facts before switching to company scope. Categories require original evidence and translated editorial content; products require verified technical facts and genuine approved photography; guides require genuine authorship, sources and review/publication dates. Publishing in Sanity remains separate from search approval and requires a website rebuild. Do not invent verification flags, addresses, dates or authors to pass a gate.
