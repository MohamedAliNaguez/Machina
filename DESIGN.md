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

On 18 November 2026 the owner approved the refined vector redraw as the identity reference for the entire project. `docs/brand/technicsan-master.svg` is the authoritative source. All full/light/compact logos, intro wordmarks, browser icons, sharing graphics and pressure-motif emblem geometry derive from this file through `node scripts/prepare-brand.mjs`. The older JPEG traces and automatic-smoothing outputs are retired; never use them to regenerate current brand assets. Keep the approved custom contours, colours and outlined slogan.

The owner supplied the TECHNICSAN logo and the fixed signature **OUR PRESSURE. YOUR TREASURE.**. Preserve the actual wordmark letterforms and three diagonal bars. The full lockup includes the English slogan in both language versions. Use `Brand.astro` and the scalable exports in `public/brand/`; never stretch or replace the lettering with a similar font. Keep clear space and use the light lockup on dark surfaces. The browser icon uses the emblem.

There are exactly five product types, in this order: **Cement bulker · LPG catalog · Compressors · Mixers · Silos**. Turkish equivalents are Çimento silobası, LPG kataloğu, Kompresörler, Mikserler and Silolar. `src/data/product-types.ts` is the shared taxonomy. Content validation rejects a sixth or missing type; Sanity uses the same approved IDs. The English wording LPG catalog follows the owner's explicit instruction.

The current scope replaces the earlier construction-machinery demonstration and new/used browsing split. Its original mockups remain historical design references. Excavators, loaders, road equipment, lifting and attachments are not live product types. The public language is Products / Ürünler; routes are `/en/products/` and `/tr/urunler/`. Preserve matching language links, product-specific enquiries and curated category routes.

## Visual direction

Retain the strong proportions, dark industrial stages, pale working surfaces and restrained graphic details. The homepage uses the approved **Lime Signature** product alphabet: a silo P, mixer R and compressor U with graphite housings, lime accents and lime conventional letters. These are imaginative brand letter sculptures, not photographs or technically functional equipment designs. The abstract ring remains in the intro, owned by `PressureArtwork.astro`; its marks have no numbers or implied readings. Do not imply a rating, certification or performance figure through artwork.

The header is white with the full green logo and a lime quote action. The homepage hero uses a deep forest `#061C14` background and the approved lime/graphite alphabet. Interior dark surfaces retain silver titles and pale text; practical browsing, forms and specifications use pale surfaces. Lime is an accent and control background, with dark-green text. Use green for links and small text on light surfaces. Never use lime body text on white. The small angled rules echo the emblem. Amber is reserved for contextual notices, not the brand's primary accent.

## Components and layout

`Layout.astro` owns navigation, language switching, metadata, structured-data assembly and the intro. Header height is 88px on desktop and at least 64px on phones. Mobile navigation starts at 900px. The site has no repeated black logo/navigation footer. Do not introduce decorative arrows or terminal full stops in titles.

`Home.astro` owns the full-width Lime Signature PRESSURE artwork, brand signature, catalogue/contact actions, five product-family links, brand story, buyer guides and one pale contact ending. The approved English brand artwork appears in both locales with a real localized HTML H1 (PRESSURE / BASINÇ); all supporting copy and actions remain localized. Its image is decorative to assistive technology. The concept label and raster slogan are framed out in CSS, preserving the approved artwork's pixels; the visible slogan is live HTML. The large ring no longer competes with the headline. The five product types appear together with equal prominence. Do not add generic SaaS cards, neon glows, particle fields, fake statistics or invented company strengths.

`Catalogue.astro` owns search, five category choices, fixed-category navigation and no-results/reset behavior. `catalogue.ts` preserves category/search state in the URL and in language links, supports Turkish folding and IME input, and excludes filter combinations from indexing. New/used condition, year and hours filters are absent from this product catalogue.

`ProductDetail.astro` owns the product overview, photographs, enquiry route, specifications, application questions, brochures and other product types. `ProductVisual.astro` reserves a consistent image aspect ratio and visibly labels placeholders. Actual image arrays populate the gallery; image controls update source, descriptions and pressed states. Approved brochures are real downloads; absent brochures show a note rather than a fake button.

Selecting the main product image opens `ProductLightbox.astro`, a native modal dialog with a full-viewport white studio canvas, quiet Source Sans 3 captions and circular zoom/close controls. A floating translucent forest-green dock holds compact thumbnails and text Previous/Next controls; it disappears for a single image. Avoid heavy header/footer bars and outlined rectangular controls. `product-gallery.ts` decodes before smoothly sliding/crossfading between photographs, supports keyboard navigation and horizontal touch swipes, and restores focus and page scrolling on exit. Clicking the image or zoom control enables 1.8× inspection with pointer dragging; Fit image or the 0 key resets it. Navigation resets zoom. The selected photograph remains on the product page. Reduced motion swaps images and zoom immediately. Without JavaScript the main image link opens the source image normally. Keep controls at least 44px, retain complete image proportions and provide no decorative arrow icons. Failed images show a localized message with navigation still usable. CSS backdrop filtering is an enhancement with an opaque-colour fallback; no viewer dependency is added.

The preview catalogue contains 155 entries collected from the four owner-specified manufacturer sites. Present TECHNICSAN only. Preserve source identity, image credits and supporting documentation in the ignored private archive. Do not invent model codes, technical figures, prices, ratings, certification claims or stock claims. Product images use contain sizing so labels and watermarks remain visible. Gallery photographs expand in native details elements; the main catalogue shows 24 entries per page with accessible text controls. Empty specification arrays are allowed only for labelled sample content; verified product records require actual specifications. The buyer prompts describe information to discuss, not technical instructions. Do not assume that all mixers or silos are pressurised.

`InformationPage.astro` and `ArticleDetail.astro` carry the same pressure identity through About, Contact, Guides, Privacy and draft articles. The form selects a product family and preserves its reference across language switching. Server storage, idempotency, spam protection and notification retry behavior remain the enquiry contract. Personal submissions never enter public content.

## Typography and accessibility

Self-host Anton 400 for interior silver display titles; Barlow Condensed 600/700 for product and section headings; Source Sans 3 400/600 for body and controls. Include Latin Extended subsets for Turkish. Keep titles real HTML. The homepage's illustrated alphabet is an essential artistic treatment with a localized semantic H1 and a visible text fallback in forced-colours mode. Its responsive 800/1400/1774px WebP sources are eagerly loaded with high fetch priority, with reserved aspect ratio to prevent layout shifts. The artwork uses no new font dependency. Leave room for Turkish diacritics and wrapping; never clip the final letter or squeeze a long category title into a narrow image area.

Use visible focus, labelled native controls, keyboard navigation and at least 44px control targets. Reserve image dimensions and readable mobile text. Placeholder captions inside links must be included in the accessible name. Motion respects reduced-motion preferences, and all navigation/content remain usable without animation. Automated axe scans supplement manual checks; they do not constitute formal WCAG certification.

## Motion and intro

Keep the selected three-shutter steel reveal, now opening onto the TECHNICSAN wordmark and abstract pressure motif. There is no excavator photograph in the current intro. It uses the lightweight shared vector artwork and real logo assets. The review page at `/design/loaders/` previews this selected intro only.

The refined intro uses clean gradient panels instead of enlarged raster grain. Its dedicated `technicsan-wordmark-sharp.svg` uses the same approved master letterforms as the header. The main wordmark is limited to 820px, with the full-opacity vector pressure emblem above it and centered status copy below. Mobile uses separate proportional sizing to avoid overlap. No blur filters or enlarged bitmap textures are used in this intro.

The owner requested a noticeable first-visit introduction: retain the 3,500ms hold and 160ms exit, with an independent four-second deadline and 4.3-second CSS escape hatch. Skip repeated session visits, history restoration and automatic reduced-motion playback. A visible Continue to website action, keyboard focus and scroll interaction dismiss it early. The session key is `technicsan:pressure-intro:v1`. Explicit review playback is separate, traps focus on its exit and restores the opener. Do not imply that an already-ready page is still loading.

The intro ring uses a single short settling rotation. The product alphabet needs no JavaScript or animation to appear. `PressureWordmark.astro`, `pressure-motion.ts` and `pressure-motion.css` add one 3.8-second mechanical sequence after the intro has closed and the artwork is decoded and in view. The compressor pistons alternate, mixer vanes turn, a restrained pressure trace reaches the silo discharge, then a small compression/release and one masked surface highlight settle back to the approved still. These are abstract brand cues, not a functional process demonstration.

The cleaned homepage has no eyebrow, location/inventory micro-labels or replay control. Supporting copy sits directly below the slogan, with the two actions grouped alongside on desktop and underneath on smaller screens. The entrance plays once per page load without an endless loop. Settle immediately when the illustration leaves view, the tab is hidden, or reduced-motion/high-contrast settings are enabled. History restoration keeps the still. Forced colours keeps the visible text heading. The overlay reuses the already-decoded responsive image and native SVG/Web Animations, with no video or animation library. All active animations are cancelled after settling, preserving the selected still exactly. Artwork has no effect on page readiness. Storage restrictions or disabled JavaScript must leave content usable.

## Implementation ownership

Common tokens live in `global.css`; stage and display tokens live in `theatre.css`. `steel.css` and `steel-content.css` retain shared control/editorial foundations. `brand.css` owns the logo/header/green-lime identity. `pressure.css` owns the current pressure hero, product families, catalogue, details and responsive adaptations. Update the owning CSS and this document together.

All internal routes and public assets use `withBase`/`url` for repository-prefixed builds. The historical GitHub repository name is a deployment setting, not visitor-facing identity. Static GitHub previews disable personal contact input/sending; local development keeps the sample enquiry flow. Live deployment still requires approved company/contact/privacy information and genuine product content/photos. The abstract brand hero does not require a fabricated product photograph.

The next content stage replaces labelled brand placeholders with actual product images, then verified model specifications and reviewed copy. `docs/CONTENT.md` records the handoff. `design-qa.md` records verification and historical mockup comparisons.
