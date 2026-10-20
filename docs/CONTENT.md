# Content and launch requirements

## Ownership

The current company identity is provisional. Ankara is confirmed; no street address, represented brands, dealership authorisation, customer names, credentials or performance claims have been supplied. Do not infer them from reference websites. All 12 supplied machine listings are fabricated design fixtures, not stock. Their technical values must never be used in an actual quotation.

## Product collection checklist

For every new model: stable reference, actual brand/model, category, approved model photographs and image descriptions, configurations, manufacturer-supported specifications, intended applications, source reference, brochure if licensed, and reviewed Turkish/English descriptions.

For every used unit: all relevant model facts plus unique listing reference, manufacturing year, actual operating hours, current photographs of the specific machine, inspection/condition information, available maintenance records and available/reserved/sold status. Do not substitute generic brand photographs for actual unit photography.

The source field is publicly displayed. Put public manufacturer/reference information there, never internal notes or personal information. Keep private inspections or documents outside the public dataset unless approved for publication.

## Editorial workflow

Use the Sanity draft state and Bilingual preview. A content owner checks facts, technical terminology, photograph rights and translations before publishing. Each article needs an actual author/reviewer and a review date for live builds. Reference technical claims through the sources list. Do not create fictitious reviews, ratings or generic city landing pages.

Machine facts are shared across languages; names, descriptions, image descriptions, article text and slugs are translated. The `published` field selects public locales. The build rejects missing content for enabled locales. Categories currently require both languages because the launch navigation is bilingual.

## Search strategy

Category pages own broad equipment intent. Model pages own brand/model intent. Individual used listings own unit-specific information. Guides answer actual buyer questions and link to those categories. Gather search vocabulary from real customer enquiries and Search Console after launch.

Search/filter URLs canonicalise to the base page and receive `noindex` metadata; Cloudflare middleware also adds `X-Robots-Tag` on filtered catalogue/category requests. Curated category pages have independent URLs and descriptions. No schema includes invented prices, reviews or offers. Basic Product markup describes real equipment but does not guarantee Google product rich-result eligibility.

Preserve useful sold-listing pages with a sold label and relevant alternatives. When retiring a page, use a directly relevant replacement or an intentional 404/410. Never redirect all retired products to the homepage. Record old slugs in Cloudflare redirect rules before changing published URLs.

## Launch gates

- Verified display/legal name, contact address/channels, company description and brand relationships.
- Genuine hero photograph and individual product photographs with approved rights.
- No `sample` documents or illustrative machine images in a live dataset.
- Reviewed Turkish/English company and privacy copy in site settings; `privacyReviewed` set after company review.
- Working enquiries, challenge keys, company-owned sender domain and sales destination.
- Preview hosting access restriction for draft material. `noindex` is not access control.
- Actual domain and canonical URL. Enable indexing only for the approved production build.
- Search Console verification and sitemap submission by the domain owner.

Analytics is intentionally not installed. A local `enquiry:accepted` browser event exposes only language and machine ID, allowing an approved analytics integration later. Do not attach form values or personal information.
