---
version: alpha
name: Machine Theatre / Precision workshop
description: A sculptural steel-stage homepage with a restrained bilingual machinery catalogue.
colors:
  background: '#FFFFFF'
  steel: '#EEF2F5'
  graphite: '#202830'
  primary: '#2156D9'
  amber: '#D99A24'
  muted: '#5B6671'
  border: '#D4DCE3'
  stage: '#11171C'
  stage-ink: '#EDF0F2'
  stage-muted: '#BDC6CF'
  stage-silver: '#D1D5D8'
  stage-border: '#454E59'
  stage-menu: '#29323B'
  stage-focus: '#A9C2FF'
  stage-accent: '#88AAFF'
  stage-paper: '#F5F7F9'
  stage-mobile: '#111518'
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

# Machine Theatre / Precision workshop

## Overview

Professional machinery buyers in Turkey and export markets need to find equipment, assess it, and reach sales. Turkish and English have equivalent interfaces. The brand/home is expressive; catalogue, specifications, and enquiry pages are restrained. Sanity supplies the administration UI; no bespoke admin styling.

Homepage signature: the user-selected Machine Theatre concept (option 2, 2026-10-20). A full-width sculptural steel stage presents illustrative machinery in front of oversized, textured silver condensed typography. Preserve true photographic foreground silhouettes so the title sits behind the excavator and steel blades. A bright category strip immediately follows, then two equally prominent new/used editorial routes. Extend the steel title and photography system to catalogue, guide, product, company and contact pages, with readable light working surfaces. No fictitious measurements.

Anti-references: full-screen cinematic sliders that delay browsing, generic gradient SaaS cards, neon effects, decorative performance statistics, invented trust claims. The provisional wordmark is MACHINA, explicitly identified as a preview identity.

Token mapping: the common frontmatter tokens mirror `:root` in `src/styles/global.css`. The hero typography token maps to `--hero-display` in `src/styles/theatre.css`, consumed by the homepage H1. The stage tokens (including border, menu, focus, accent, paper and mobile tonal variants) map to `:root` in `src/styles/theatre.css`; their consumers are the approved homepage and all steel interior templates. Update documentation and the owning CSS together. The shared dark header and photographic title bands belong to the steel site family; practical content stays light. Forced colors preserve native control visibility.

## Colors

White browsing surfaces, steel image mats, graphite text, cobalt links/actions. The home stage uses #11171C, silver #D1D5D8 headlines, #EDF0F2 primary text, and #BDC6CF secondary text. Tonal variants provide #454E59 borders, #29323B mobile menu controls, #A9C2FF focus/hover, #88AAFF language accents, #F5F7F9 editorial surfaces and #111518 to blend the mobile stage artwork. Amber marks preview context, never body text on white. Muted text stays readable. Selection and focus use cobalt. Borders encode real grouping.

## Typography

Self-host Barlow Condensed 600/700 for section headings and Source Sans 3 400/600 for prose and UI, including Latin Extended subsets for Turkish. Hero, interior display titles and major editorial headings use self-hosted Anton 400, with its natural horizontal proportions and a restrained vertical display treatment to match the selected reference. Do not reintroduce the horizontally compressed Barlow title. Clip the supplied brushed-metal raster texture into real HTML text; preserve a solid silver fallback and forced-colors support. Body text starts at 17px; labels 12–14px. Tabular numerals for hours and years.

## Layout

1320px maximum, 5% gutters, 88px section rhythm. Desktop home uses a roughly 610px steel stage at 1440px width, five unboxed category thumbnails separated by rules, two equal new/used image-and-copy lanes, and three-column inventory. At 900px and below, the homepage uses its reflowing title, portrait artwork and stacked browsing layout; this includes a narrow in-app preview pane. The ordinary catalogue retains its existing tablet/phone breakpoints. Turkish title paint includes room for accents and extra interline space; do not clip dots, umlauts or cedillas. Keep images at a reserved aspect ratio. Native select popups intentionally use operating-system presentation.

## Elevation & Depth

Flat cards and hairline boundaries. No hover lift or layered card shells; use hairline boundaries and a restrained image scale transition.

## Shapes

3px functional radii. Preserve the existing diagonal MACHINA brand glyph. Machinery, sculptural stage and editorial photography are raster artwork, not approximate code drawings. Never imitate technical certification symbols.

## Components

Shared Layout owns navigation, language switching and SEO. Breadcrumbs and SteelIntro own visible interior route context. There is no repeated bottom logo/navigation footer. Preview context appears beside the relevant sample content. MachineCard owns availability and sample labels. EnquiryForm owns validation and submission states. Catalogue owns URL filters and no-results feedback. Use native links, buttons, selects and tables, visible focus, 44px minimum control targets, and reduced-motion handling.

## Do's and Don'ts

Do label sample equipment and illustrative photographs in both languages. Do hide unverified brands/contact channels. Do not claim production readiness, dealership status, live stock, or email delivery until verified. Functional hover transitions stay near 220ms. The homepage stage has one 3.5-second light entrance, then input-driven depth movement limited to a few pixels. Homepage art never loops or delays access to content; the optional loading treatment follows the readiness contract below. Disable movement for reduced-motion preferences, stop updating off-screen, and preserve the complete layout without JavaScript. Scrollbars remain visible and inherit the global steel/cobalt baseline.

## Current owner preferences

Headings and editorial titles have no terminal full stops in either language. Avoid decorative arrows in buttons, links, cards, and section navigation. Communicate actions with clear text, visible focus, underlines, and purposeful contrast. Preserve meaningful functional icons.

Selected direction: Machine Theatre, the second displayed proposal. Recreate its dark steel stage, silver display typography, actual machine thumbnail strip and paired image-led new/used routes. Preserve the MACHINA preview name rather than the mockup’s concept-name wordmark. Avoid generic neon gradients, particle fields, and interchangeable technology marketing motifs. Motion must respect reduced-motion preferences and leave browsing immediately available.

## Fidelity correction after owner review

The owner rejected the earlier title approximation. Match the selected prototype's heavy letter shapes, silver material and foreground occlusion. The earlier flat title, broad header divider and separate top preview strip were not faithful enough. The homepage keeps sample identity and illustrative equipment labels in the scene caption instead. Interior pages carry contextual sample labels instead of a separate preview strip. Foreground compositing uses the original scene colors with an extracted alpha mask, rather than a rasterized headline or approximate drawn cutout. Keep the headline selectable, translated and crawlable.

The desktop headline uses a max-content paint box with a small right ink allowance, so the metallic fill cannot clip the final letter. At narrow widths it returns to a normal wrapping block. Foreground art starts below the copy in the compact layout; avoid the old tablet treatment that placed sales controls over the excavator bucket.

## Implemented interior screen family

The owner requested full implementation of the footer-cleaned mockups on 2026-10-20. Canonical references are `docs/design/steel-site-mockups/01-catalogue.png` through `13-mobile-contact-tr.png`; the approved homepage remains the existing Machine Theatre composition. The ten desktop layouts and three mobile references now have working native interfaces. Do not restore the black bottom logo/navigation band or a second global contact band.

`src/styles/steel.css` owns the common header, interior title bands, catalogue filters/cards, product stage, specifications, galleries and related equipment. `src/styles/steel-content.css` owns editorial, about, contact, privacy and recovery layouts. Both follow global.css and theatre.css. Keep component variants in these owners; do not change the approved homepage title composition to restyle an interior template.

Interior desktop header is 77px, compact interior header 56px, with text Menu/Menü and language controls. Mobile menu starts at 900px. At 700px the catalogue becomes one column with a labelled filter disclosure; product details show photo, summary/quote, gallery thumbnails, then specification and related content. Contact shows the enquiry before the contact aside on phones. Reading outlines become a compact section list. Native forms keep readable 16px inputs and usable control targets.

Catalogue search is local, IME-safe and stores filters in the URL. Multiple categories combine as alternatives; condition, brand, minimum year and maximum hours narrow the set. Escape closes filters and restores focus. Available, reserved and sold states remain clear; sold detail pages offer relevant alternatives. Product galleries update actual images, alt text and pressed state. Contact keeps the machine context across language switching and supports removal without losing entered enquiry data. Client validation and the existing server validation/storage/idempotency/retry contract remain the canonical enquiry behavior.

Brand navigation/filtering only appears with verified brand content. Phone and WhatsApp destinations only become links when verified. Brochure placeholders are annotations, never fake download controls. Keep all actual records beyond the six cards visible in the raster reference. Articles retain complete reviewed content even when it extends below the reference frame. General pages and product pages in both languages share the same template owners.

Metal titles remain selectable HTML with a physical material fill, not rasterized text. Self-hosted Latin Extended fonts preserve Turkish glyphs. The reference photographs are rebuilt as original illustrative WebP assets, with subject/composition matched to each screen. New model and individual used-unit information remain separate content types; artwork never supplies factual specifications. All sample inventory, example figures, editorial drafts and provisional identity stay labelled and excluded from public indexing until the launch gate is satisfied.

Verification evidence and comparison history are maintained in `design-qa.md`. Production services and real company content are separate launch configuration work, not implied by local interface completion.

## GitHub Pages preview behavior

The public hosted preview is static. Keep the approved contact layout and selected-machine context, but label its disabled send action Preview only / Yalnızca önizleme and explain that contact details are not collected. Disable personal contact inputs there. Local development keeps its working sample enquiry flow. `PUBLIC_HOSTING=github-pages` owns this deployment-specific distinction; never imply a hosted enquiry was saved locally. All local asset and native route rendering goes through the common base-path helper for repository hosting.

## Selected steel loading screen

The owner selected option 2, The steel reveal, on 2026-10-20. `SteelRevealArt.astro` and `steel-reveal.css` own its photographic excavator, silver HTML wordmark and three steel shutters, shared with the comparison page. `SteelLoader.astro`, `steel-loader.css` and `steel-loader.ts` own the actual loading lifecycle in the shared bilingual Layout.

After finding the shorter versions too easy to miss, the owner explicitly requested 3–4 seconds on the first visit. Show it immediately on the first eligible visit and retain it for 3,500ms, then use a 160ms opacity exit when critical page assets are ready. Open the steel shutters in 1.1 seconds with small offsets, leaving about two seconds to see the revealed composition. Use truthful brand copy, New and used machinery, rather than implying that an already-ready page is still loading. An independent four-second deadline and 4.3-second CSS escape hatch prevent missing media, fonts or interrupted scripts from trapping visitors. Failed media counts as settled. Skip repeat session visits, history restoration and automatic reduced-motion playback. A Continue to website control, keyboard focus and scroll interaction can dismiss it early. Storage restrictions and disabled JavaScript must leave content usable. Fetch the decorative loader photograph at low priority only when shown; never wait for that photograph to open the actual page. The v3 session key makes the revised intro visible once after this behavior change.

The `/design/loaders/` comparison includes an explicit Try selected loader action. This labelled preview holds the selected design for inspection, traps focus on its exit and restores the opener. Its timing is separate from actual page loading. Reduced-motion preview uses a complete still composition. Keep titles without terminal full stops, avoid decorative arrows, and preserve the existing page layout and navigation.
