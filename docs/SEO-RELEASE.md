# TECHNICSAN search release

## Current state

The SEO implementation supports selective English and Turkish releases. It does **not** approve company facts or publish the guide drafts automatically. The owner has not yet supplied the legal business name, public factory address or actual guide author/reviewer, and has no Search Console, Bing or GA4 accounts configured.

- Published CMS content: five categories and fourteen products, all search approvals pending.
- Five original bilingual buying-guide drafts are in the authenticated Sanity Studio. They are not public articles. Sources, actual authorship, image descriptions and expert review must be completed before publication/search approval. No publication or review dates have been invented.
- All five category landing pages have editable explanations, selection advice and buyer questions. Their production-evidence fields need original, reviewed company information.
- HTTPS certificate provisioning remains an external GitHub prerequisite. The current certificate must be checked again before release. Never disable certificate validation to pass a check.

## Editor workflow

Open [TECHNICSAN Content Studio](https://technicsan-content.sanity.studio/). Each document has a **Search readiness** tab.

1. Complete Company & launch settings: legal identity, public address, sales contacts, approved company description and privacy notice. Confirm the manufacturing role against real company evidence. Only use information suitable for the public dataset.
2. Review Home, About and Contact search titles/descriptions separately for English and Turkish. About also requires approval of the visible company chronology.
3. Review each category's explanation, applications, configurations, buyer questions and actual production evidence. Keep the navigation label **LPG catalog**. Record only verified capabilities; imported catalogue data and branded illustrations are not proof of manufacturing.
4. Approve a language's SEO only when its content and evidence are complete. Publishing in Sanity alone does not grant search approval. An unfinished Turkish version does not block an approved English version.
5. Release products individually after reconciling the facts with actual TECHNICSAN documentation. Each needs technical approval, complete published-language facts, image rights and at least **one genuine approved photograph**. Extra gallery views are optional. Use a real model code/SKU only when the company actually has one. A sold unit may retain its useful page and related alternatives.
6. Complete the five private guide drafts with first-hand input, supporting sources, the actual author and technical reviewer, image descriptions and actual publication/review dates. Publish and approve the language versions that are complete. Technical and safety statements need the appropriate expert review.

Do not put confidential supplier provenance or customer enquiries in the public Sanity dataset. The migration fills missing fields, snapshots content locally and preserves existing copy, flags and drafts. It does not overwrite editorial changes or grant approvals.

## Release checks and deployment

Useful commands from the project root:

```text
npm run seo:audit          # Report readiness without approving anything
npm run content:check      # Validate the published CMS snapshot; never substitute samples
npm run check
npm run studio:check
npm test
npm run build
npm run test:browser
```

`npm run verify:launch` additionally requires `PUBLIC_SITE_URL=https://technicsan.com`, `PUBLIC_HOSTING=github-pages`, published Sanity content, the configured enquiry endpoint, approved company checks and at least one eligible page. It tests the real HTTPS certificate and HTTP/www redirects. It does not send an email.

Commit and push these local workflow changes before expecting the new release option in GitHub. This implementation has not redeployed the public website.

The [Deploy TECHNICSAN workflow](https://github.com/MohamedAliNaguez/Machina/actions/workflows/deploy.yml) stays manual. Its **search_release** option defaults to **false**. Leave it false for a review deployment. When the prerequisites pass, selecting it releases only the eligible pages; pending pages keep `noindex,follow`.

The first wave can contain up to sixteen pages: Home, About, Contact and five categories in each language. Public product filters always remain `noindex,follow`, directly in HTML. Editorial categories link to the separate interactive catalogue. Empty Guides/Brands and privacy pages remain excluded. Design experiments are removed from deployment artifacts.

Released `robots.txt` permits crawling, including AI search and training bots, and references the sitemap. Pending public pages stay crawlable so search engines can read their `noindex` directive. Review/preview builds retain the blanket crawl exclusion and an empty sitemap. Neither robots rules nor noindex are authentication; actual Sanity drafts stay behind sign-in.

Canonicals use the production HTTPS host. Eligible translations receive reciprocal `hreflang`; English receives `x-default`. Unavailable or unapproved translations are not advertised to search engines. Language navigation still works for available review pages. The root redirects immediately to `/en/`. Existing direct legacy aliases and proper 404 responses remain intact.

Organization, breadcrumb, Product and Article identifiers are stable and connected. Product data uses verified visible properties without invented prices, stock offers or ratings. Basic Product markup alone does not promise a Google product rich result.

## Free search accounts

Create accounts under company-controlled access. Keep ownership and recovery access with the company.

1. [Google Search Console](https://search.google.com/search-console): add `technicsan.com` as a Domain property and copy its TXT verification value into Namecheap Advanced DNS. Add a new TXT record; preserve all existing MX, SPF, DKIM and other mail records. Alternatively, a URL-prefix property can use the optional `PUBLIC_GOOGLE_SITE_VERIFICATION` value.
2. [Bing Webmaster Tools](https://www.bing.com/webmasters/): verify the site or import the verified Search Console property. The optional HTML value is `PUBLIC_BING_SITE_VERIFICATION`.
3. After HTTPS and the first approved release, submit `https://technicsan.com/sitemap.xml` to both. Inspect representative English/Turkish Home, category and product URLs as they become eligible. Check fetched HTML, canonical, crawl permission and indexing eligibility. Submission does not guarantee indexing or ranking.

Verification values are public; configure them as GitHub repository Actions variables with the names above. Never put account passwords or private tokens in public variables.

## Optional consent-aware GA4

Create an owner-controlled [Google Analytics](https://analytics.google.com/) property with the production HTTPS web stream. Disable **all Enhanced Measurement** for this stream, including page-history, form, scroll and outbound tracking. This project sends explicit events instead. Disable Google Signals, advertising personalization and user-provided data collection, and review the applicable privacy text before activation.

Set repository variables `PUBLIC_GA4_MEASUREMENT_ID=G-…` and `PUBLIC_ANALYTICS_REVIEWED=true` only after that review. Empty/default values leave the integration inactive. Preview builds never activate it.

The integration loads Google's tag only after a visitor opts in. Visitors can decline or change their preference. Events are:

| Event                                            | Meaning                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `enquiry_success`                                | The delivery endpoint accepted the enquiry; local samples and failed requests are excluded |
| `phone_click` / `whatsapp_click` / `email_click` | A contact link interaction; not a confirmed enquiry                                        |
| `brochure_click`                                 | A brochure interaction; not a confirmed enquiry                                            |
| `page_view`                                      | A consented navigation                                                                     |

Only language, a known product family and the page path are emitted. Query strings, fragments, names, email addresses, phone numbers, messages, raw form values and enquiry IDs are not sent. Referrer information is restricted to its origin. Create an event-scoped custom dimension for `product_family`. Mark only `enquiry_success` as a key event. Qualification remains a separate sales review.

## Performance and ongoing measurement

`npm run perf:baseline` checks production HTTPS and runs Lighthouse for Home, category, product, Contact and About in mobile and desktop modes. For a built local preview, use `PERF_BASE_URL=http://127.0.0.1:4335 npm run perf:baseline -- --local` (set the environment variable with PowerShell syntax on Windows). Set `CHROME_PATH` when needed. Results and network details stay in ignored `.local/lighthouse/` folders. Run without competing browser tests or builds and repeat measurements before drawing conclusions.

Responsive Sanity images and thumbnail sizes preserve full-resolution gallery originals. Header-logo variants are lossless derivatives of the approved 4K artwork. About's background and decorative product/foliage sprites have AVIF sources with the original WebP fallbacks and prioritised background loading; its animated vector scene paints first, then loads the optional WebGL enhancement when idle and visible. Reduced-motion users do not download that enhancement initially. Animation pauses offscreen and in hidden tabs. No 3D product model is loaded without an approved asset and an explicit viewer interaction.

The 24 November local diagnostics measured Home, category, product and Contact at 98–100 performance on mobile, with LCP 1.07–2.33 seconds and CLS below 0.05. About remains the exception: roughly 3.6 seconds LCP and 524 ms lab TBT in the final throttled run, despite reducing its transfer size from 1.32 MB to 0.89 MB. Its desktop performance was 99. Further mobile animation profiling is a launch follow-up; do not present its targets as achieved. All five tested page types scored 100 in the automated Lighthouse accessibility category; this is not a full accessibility certification. Reports are local diagnostics, not field results.

Targets are LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1. Lighthouse provides lab diagnostics and TBT, **not field INP**. Local reports are not production Core Web Vitals evidence. After HTTPS works, establish the production baseline and later use Search Console/CrUX field data when traffic is sufficient.

Each month, review impressions, clicks, queries, countries and landing pages by product family and language, alongside consented enquiries and separately qualified leads. Record identifiable AI referrals without claiming a complete citation count. Add original production stories, technical answers and legitimate industry references as evidence becomes available. Avoid repetitive country pages and fabricated reviews, certifications or projects.

## Rollback and recovery

Before content migrations, export the dataset with the authenticated Sanity CLI or `npm run content:export`. A full CLI archive includes assets; the lightweight script export requires a read token and separate asset backup. Local migration snapshots live in `.local/sanity/`; keep protected backups outside the public repository. A complete rehearsal on 24 November 2026 exported 25 documents and 69 assets, restored them into a temporary **private** dataset, and matched the content, five draft documents and published catalogue against production. The temporary dataset was removed after verification; the archive and report remain in ignored `exports/`. `studio/recovery-check.ts` provides the repeatable authenticated comparison using a `RECOVERY_DATASET` beginning with `seo-recovery-`. Always restore into a private isolated dataset before relying on a backup. Never replace current production content just to test recovery.

For code rollback, select a previously verified commit and run the manual deployment workflow for that revision. Use a revision containing the approval policy and keep review mode unless its own release preflight passes. A rollback must not remove preview exclusions or turn pending content into indexed content. Account-dependent URL Inspection and an actual production deployment rollback remain release-stage checks. The recovery rehearsal did not replace production content.

References: [Google robots directives](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [AI search guidance](https://developers.google.com/search/docs/appearance/ai-features), [Product requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
