---
version: alpha
name: TECHNICSAN / Pressure
description: A pressure-centred industrial product catalogue in forest green, lime and steel
colors:
  background: '#FFFFFF'
  steel: '#EDF1EE'
  graphite: '#1E2D26'
  primary: '#003B27'
  primary-hover: '#0B563D'
  accent: '#9BC900'
  accent-hover: '#B1DC20'
  brand-soft: '#E8EEE9'
  amber: '#D99A24'
  muted: '#5B6961'
  border: '#D6DFD8'
  stage: '#101C17'
  stage-ink: '#F2F5F0'
  stage-muted: '#BDCBC2'
  stage-silver: '#DCE3DE'
  stage-border: '#42594B'
  stage-menu: '#1D3428'
  stage-focus: '#B7DF3B'
  stage-accent: '#9BC900'
  stage-paper: '#F6F8F5'
  stage-mobile: '#101815'
typography:
  hero:
    fontFamily: 'Anton, Arial Narrow, sans-serif'
  display:
    fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif'
  body:
    fontFamily: 'Source Sans 3, Arial, sans-serif'
rounded:
  DEFAULT: '3px'
spacing:
  page-max: '1320px'
  section-gap: '88px'
components:
  button:
    rounded: '3px'
  card:
    rounded: '3px'
---

# TECHNICSAN / Pressure

## Approved identity and scope

The owner supplied the TECHNICSAN logo and the fixed signature **OUR PRESSURE. YOUR TREASURE.**. Preserve the actual wordmark letterforms and three diagonal bars. The full lockup includes the English slogan in both language versions. Use `Brand.astro` and the scalable exports in `public/brand/`; never stretch or replace the lettering with a similar font. Keep clear space and use the light lockup on dark surfaces. The browser icon uses the emblem.

There are exactly five product types, in this order: **Cement bulker · LPG catalog · Compressors · Mixers · Silos**. Turkish equivalents are Çimento silobası, LPG kataloğu, Kompresörler, Mikserler and Silolar. `src/data/product-types.ts` is the shared taxonomy. Content validation rejects a sixth or missing type; Sanity uses the same approved IDs. The English wording LPG catalog follows the owner's explicit instruction.

The current scope replaces the earlier construction-machinery demonstration and new/used browsing split. Its original mockups remain historical design references. Excavators, loaders, road equipment, lifting and attachments are not live product types. The public language is Products / Ürünler; routes are `/en/products/` and `/tr/urunler/`. Preserve matching language links, product-specific enquiries and curated category routes.

## Visual direction

Retain the selected steel style: physical silver typography, strong proportions, dark industrial stages, pale working surfaces and restrained graphic details. Pressure is now the brand idea, expressed through an abstract machined ring and the supplied emblem. `PressureArtwork.astro` owns this vector artwork. Its marks are decorative, with no numbers or implied instrument readings. Do not use an excavator illustration as a pressure-product image or imply a rating, certification or performance figure through the artwork.

The header is white with the full green logo and a lime quote action. Dark surfaces use silver titles and pale text; practical browsing, forms and specifications use pale surfaces. Lime is an accent and control background, with dark-green text. Use green for links and small text on light surfaces. Never use lime body text on white. The small angled rules echo the emblem. Amber is reserved for contextual notices, not the brand's primary accent.

## Components and layout

`Layout.astro` owns navigation, language switching, metadata, structured-data assembly and the intro. Header height is 88px on desktop and at least 64px on phones. Mobile navigation starts at 900px. The site has no repeated black logo/navigation footer. Do not introduce decorative arrows or terminal full stops in titles.

`Home.astro` owns the large silver PRESSURE / BASINÇ title, brand signature, catalogue/contact actions, five product-family links, brand story, buyer guides and one pale contact ending. The pressure emblem sits beside the title and moves through a short entrance. The five types appear together with equal prominence. Do not add generic SaaS cards, neon glows, particle fields, fake statistics or invented company strengths.

`Catalogue.astro` owns search, five category choices, fixed-category navigation and no-results/reset behavior. `catalogue.ts` preserves category/search state in the URL and in language links, supports Turkish folding and IME input, and excludes filter combinations from indexing. New/used condition, year and hours filters are absent from this product catalogue.

`ProductDetail.astro` owns the product overview, photographs, enquiry route, specifications, application questions, brochures and other product types. `ProductVisual.astro` reserves a consistent image aspect ratio and visibly labels placeholders. Actual image arrays populate the gallery; image controls update source, descriptions and pressed states. Approved brochures are real downloads; absent brochures show a note rather than a fake button.

The preview catalogue contains 155 entries collected from the four owner-specified manufacturer sites. Present TECHNICSAN only. Preserve source identity, image credits and supporting documentation in the ignored private archive. Do not invent model codes, technical figures, prices, ratings, certification claims or stock claims. Product images use contain sizing so labels and watermarks remain visible. Gallery photographs expand in native details elements; the main catalogue shows 24 entries per page with accessible text controls. Empty specification arrays are allowed only for labelled sample content; verified product records require actual specifications. The buyer prompts describe information to discuss, not technical instructions. Do not assume that all mixers or silos are pressurised.

`InformationPage.astro` and `ArticleDetail.astro` carry the same pressure identity through About, Contact, Guides, Privacy and draft articles. The form selects a product family and preserves its reference across language switching. Server storage, idempotency, spam protection and notification retry behavior remain the enquiry contract. Personal submissions never enter public content.

## Typography and accessibility

Self-host Anton 400 for silver display titles; Barlow Condensed 600/700 for product and section headings; Source Sans 3 400/600 for body and controls. Include Latin Extended subsets for Turkish. Keep titles real selectable HTML with the supplied brushed-steel text fill, a silver fallback and forced-colours support. Leave room for Turkish diacritics and wrapping; never clip the final letter or squeeze a long category title into a narrow image area.

Use visible focus, labelled native controls, keyboard navigation and at least 44px control targets. Reserve image dimensions and readable mobile text. Placeholder captions inside links must be included in the accessible name. Motion respects reduced-motion preferences, and all navigation/content remain usable without animation. Automated axe scans supplement manual checks; they do not constitute formal WCAG certification.

## Motion and intro

Keep the selected three-shutter steel reveal, now opening onto the TECHNICSAN wordmark and abstract pressure motif. There is no excavator photograph in the current intro. It uses the lightweight shared vector artwork and real logo assets. The review page at `/design/loaders/` previews this selected intro only.

The owner requested a noticeable first-visit introduction: retain the 3,500ms hold and 160ms exit, with an independent four-second deadline and 4.3-second CSS escape hatch. Skip repeated session visits, history restoration and automatic reduced-motion playback. A visible Continue to website action, keyboard focus and scroll interaction dismiss it early. The session key is `technicsan:pressure-intro:v1`. Explicit review playback is separate, traps focus on its exit and restores the opener. Do not imply that an already-ready page is still loading.

The hero ring uses a single short settling rotation. Avoid continuous motion behind catalogue reading. Artwork has no effect on page readiness. Storage restrictions or disabled JavaScript must leave content usable.

## Implementation ownership

Common tokens live in `global.css`; stage and display tokens live in `theatre.css`. `steel.css` and `steel-content.css` retain shared control/editorial foundations. `brand.css` owns the logo/header/green-lime identity. `pressure.css` owns the current pressure hero, product families, catalogue, details and responsive adaptations. Update the owning CSS and this document together.

All internal routes and public assets use `withBase`/`url` for repository-prefixed builds. The historical GitHub repository name is a deployment setting, not visitor-facing identity. Static GitHub previews disable personal contact input/sending; local development keeps the sample enquiry flow. Live deployment still requires approved company/contact/privacy information and genuine product content/photos. The abstract brand hero does not require a fabricated product photograph.

The next content stage replaces labelled brand placeholders with actual product images, then verified model specifications and reviewed copy. `docs/CONTENT.md` records the handoff. `design-qa.md` records verification and historical mockup comparisons.
