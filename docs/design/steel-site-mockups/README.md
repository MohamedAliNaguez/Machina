# Steel website screen collection

Design review set · 2026-10-20 · proposed screens, not implemented pages

Footer cleanup revision: all ten desktop mockups were regenerated with the built-in ImageGen editor to remove the repeated black MACHINA logo-and-navigation strip at the bottom. The main header and useful photographic callouts remain. The three mobile views already omitted that strip. The review gallery also ends on a light surface. `footer-revision.json` contains the exact edit prompts and output paths; originals remain recoverable from the prior source paths. This revision changes mockup deliverables, not the running company website.

The approved homepage is the visual reference. These mockups extend its brushed-steel typography, graphite stage, yellow equipment photography, cobalt actions and restrained technical rules. They are one coherent direction, not competing alternatives. Company identity, photographs, stock and technical figures remain sample material.

Open `index.html` for the review gallery. Select a screen to inspect it, use Previous / Next to move through the collection, and Escape to close. Full-resolution PNGs remain alongside smaller JPEG previews. The gallery works offline with local files and fonts. `overview.jpg` is the contact sheet.

## Screen map

| File                       | Interface                   | Purpose                                                                      |
| -------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| 00-approved-homepage.jpg   | Approved homepage reference | Existing implementation, not a newly generated proposal                      |
| 01-catalogue.png           | All machines                | Model search, condition/category/brand filters and new/used listings         |
| 02-category.png            | Curated category            | Category introduction, scoped browsing and relevant buying guide             |
| 03-new-model.png           | New-model detail            | Model configuration, applications, gallery, specifications and quote enquiry |
| 04-used-machine.png        | Individual used listing     | Unit year/hours, condition, status, photographs and enquiry                  |
| 05-guides.png              | Guides index                | Featured article and supporting editorial stories                            |
| 06-article.png             | Guide article               | Short answer, page outline, readable article and related equipment           |
| 07-about.png               | About                       | Company introduction, new/used routes and contact action                     |
| 08-contact.png             | Contact / quote             | Product context, accessible form and verified contact destinations           |
| 09-privacy.png             | Privacy                     | Calm policy reading template; copy requires completion and review            |
| 10-not-found.png           | Missing page                | Clear recovery through machines or homepage                                  |
| 11-mobile-catalogue.png    | Mobile catalogue            | Compact navigation, collapsible filters and single-column results            |
| 12-mobile-used-machine.png | Mobile machine detail       | Readable unit facts, gallery and enquiry                                     |
| 13-mobile-contact-tr.png   | Turkish mobile enquiry      | Stacked labels and fields, Turkish typography and product context            |

Desktop design targets are 1440 × 1100 CSS pixels. Mobile targets are 390 × 1000; generated raster sizes differ slightly and are recorded in `manifest.json`. Mobile screens show a natural scroll segment, not every section compressed into one viewport. Textual titles remain actual HTML during future implementation; the raster mockups are visual references only.

## Shared templates and conditional pages

- All Turkish and English routes share these templates. Desktop mockups use English; the Turkish mobile form demonstrates longer labels and accented characters. The complete translation and narrow-width checks still belong to implementation QA.
- New-only and used-only catalogue views reuse the catalogue template. Used-only filters add year and operating hours only when supported by actual data.
- Other categories reuse the category template with appropriate imagery and copy.
- A verified brand directory can reuse the simple editorial list layout; brand equipment pages reuse the scoped catalogue template. Brands remain absent from navigation until verified content exists. There are no invented brand partnerships in this set.
- General contact uses the contact template with its optional product context removed. Product enquiries preserve the selected reference across languages and submission attempts.
- Sanity Studio remains the standard authenticated content editor. This set covers the public website, with no custom admin dashboard.

## Interaction states for implementation

| Situation                         | Presentation and behavior                                                                                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Filters open on mobile            | Expand a clearly labelled filter panel; keep selected values visible, provide Apply filters and Reset filters, and return focus to the trigger on close                    |
| No matching machines              | Replace the result grid with “No machines match these filters”, a Reset filters action, and Contact sales; preserve the search query                                       |
| Reserved unit                     | Amber square and explicit Reserved text; enquiry remains possible with clear status and confirmation wording                                                               |
| Sold unit                         | Explicit Sold text; retain useful facts and gallery, replace the primary sale action with Browse alternatives, and keep optional enquiry clearly about similar equipment   |
| Missing specification or brochure | Omit unverified specifications; hide absent brochures in the finished site. The mockup’s muted pending-document row is a preview annotation, not a dead production control |
| Unverified contact channel        | Hide the destination in production until verified. “Details pending” rows are preview annotations                                                                          |
| Invalid enquiry                   | Field-level error plus short summary, focus first invalid field, preserve entered data; require name, message and at least one contact method                              |
| Sending                           | Disable repeat submission and announce Sending without shifting layout                                                                                                     |
| Saved enquiry                     | Show “Your enquiry has been received” only after durable storage. Failed notification delivery must not turn an already stored enquiry into a false failure                |
| Connection or storage failure     | Keep entered data and show a clear retry action; no invented success acknowledgement                                                                                       |
| Duplicate submission              | Preserve one logical submission and show the existing received state                                                                                                       |
| Missing translation               | Do not offer a language link to an unpublished page; preserve the current route when a published equivalent exists                                                         |

## Motion direction

These are static mockups. Motion is proposed, not demonstrated or implemented in these images.

- Interior title bands: one 450–650 ms entrance of the photographic layer, moving no more than 8 px. Text and controls remain readable immediately.
- Machine photographs: a restrained 1.015 scale on hover over 220 ms; no displacement of layout or automatic carousel.
- Links and buttons: 150–220 ms underline/color transitions; no arrows, magnetic cursor or large bouncing effects.
- Gallery: short opacity transition on explicit thumbnail selection, never autoplay. Preserve image dimensions to avoid layout movement.
- Filters and form feedback: 180 ms expansion/opacity where appropriate, with focus management and live status announcements.
- Reduced motion: disable transform, parallax and animated entrances. Content remains fully available with JavaScript disabled where practical.
- Do not animate entire long articles or require scrolling to reveal essential product data. No loops, particle fields, glowing effects or startup sequences.

## Fidelity and release notes

The header, metallic title treatment, gutters and compact radii belong to a shared component system. Do not reintroduce the repeated black logo/navigation footer strip shown in the first mockup revision. No headings gain a terminal full stop; actions use clear words without decorative arrows. Product photography and material textures are conceptual, not evidence of real equipment or facilities. Machine values are taken from the existing demonstration dataset and labelled as samples.

Before implementation, use the gallery to review layout and hierarchy. Before public launch, replace sample identity/stock/imagery, review both languages, supply verified contact details and approved privacy content, and run the project’s functional, accessibility, SEO and performance checks. Static image mockups cannot prove those checks pass.

`generation-prompts.json` records art direction. `manifest.json` records source image paths, reference images, actual pixel dimensions and final deliverables. The mobile used-listing header was revised to remove the crowded desktop navigation; the gallery contains the corrected version only.
