# Precision Machinery

A bilingual Astro catalogue for an Ankara-based heavy machinery reseller. Includes 12 explicitly labelled sample machines, 3 editorial drafts, catalogue filters, product/category pages, enquiries, Sanity schemas and Cloudflare deployment configuration. No external account or paid service is needed for the local preview.

## GitHub Pages preview

Live preview: [Machina](https://mohamedalinaguez.github.io/Machina/en/). Public repository: [MohamedAliNaguez/Machina](https://github.com/MohamedAliNaguez/Machina).

The GitHub Pages workflow builds and publishes the static preview on every push to `main`, using the repository's Pages origin and base path. It needs no Cloudflare account or deployment secret. Repository settings → Pages → Source must be **GitHub Actions**.

The hosted version retains sample labels and `noindex` metadata. It has no server or enquiry storage: sending and personal contact inputs are disabled with a clear preview notice. The local development version still supports local SQLite enquiry testing. A real enquiry backend, reviewed privacy copy and verified company content are needed for the full launch.

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

1. When ready, create your own free Sanity project. No project has been created on your behalf.
2. Copy `studio/.env.example` to `studio/.env` and enter its public project ID and dataset. Never put write/read tokens in `SANITY_STUDIO_*` variables.
3. Run `npm --prefix studio ci`, then `npm run studio`.
4. The authenticated Studio contains company settings, categories, brands, new models, used machines and guides. The **Bilingual preview** tab previews draft content within the signed-in editor.
5. Enter categories first, then products and articles. Stable IDs must be unique across categories/products/articles. Brand navigation appears only for verified brands.
6. To use real content on the website, copy `.env.example` to `.env`, set `CONTENT_SOURCE=sanity`, project ID and dataset, then rebuild. Failed CMS requests stop the build instead of silently replacing real content with examples.

For full-site draft preview builds, see [operations](docs/OPERATIONS.md). Draft tokens are server/build secrets. Preview access must be restricted at the hosting layer before uploading company drafts.

## Architecture

- Astro static rendering; small TypeScript interactions, no React bundle on public pages.
- Self-hosted Anton for the approved steel display typography, Barlow Condensed for supporting headings, and Source Sans 3 for body text, including Turkish characters.
- Sanity authenticated editor; published content fetched at build time.
- Cloudflare Pages Functions implement `POST /api/enquiries`; D1 holds private submissions and an email outbox.
- Resend sends notifications after durable storage; a scheduled Worker retries failures.
- Turkish and English slugs are linked through content IDs. Search/filter state lives in URL parameters.

See [design rules](DESIGN.md), [content/launch requirements](docs/CONTENT.md), [operations and recovery](docs/OPERATIONS.md), and [asset sources](docs/ASSETS.md).

## Preview and launch

The default build is **noindex**, excludes URLs from the sitemap and uses sample labels. It is a working preview, not a live company or inventory feed. No sales contact destinations are invented.

Production requires genuine company copy, approved machine images/specifications, reviewed translations and privacy copy, actual contact details, and provider configuration. `PUBLIC_LAUNCH_READY=true` is deliberately blocked with sample data. See the launch preflight in the operations guide. All accounts should belong to the company. The public GitHub Pages preview is separate from this verified company launch. No paid provider plan has been enabled.

The approved steel interior screen family is implemented across the public templates. See [visual and functional review](design-qa.md) for comparison evidence, tested journeys and remaining launch inputs.
