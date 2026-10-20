# Steel website implementation review

final result: passed

Reviewed on 2026-10-20 against the owner's approved homepage and footer-cleaned interior screen collection. This report supersedes the earlier homepage-only review.

## Canonical references and implementation

The visual sources are `docs/design/steel-site-mockups/01-catalogue.png` through `10-not-found.png`, plus `11-mobile-catalogue.png`, `12-mobile-used-machine.png` and `13-mobile-contact-tr.png`. The approved homepage composition remains the source recorded in `docs/design/selected-homepage.png` and the previous title-correction evidence.

The working website is served at `http://127.0.0.1:4330/en/` and `/tr/`. Shared native templates cover all categories, all new/used machines, guides, articles, About, Contact, Privacy, Brands and the recovery page. The repeated bottom black logo/navigation footer and global contact band are removed. No decorative arrows or terminal title periods are introduced.

## Browser evidence and comparison method

Final evidence is under `test-results/steel-implementation/`:

- Ten complete desktop screenshots: `catalogue-desktop.png`, `category-desktop.png`, `new-desktop.png`, `used-desktop.png`, `guides-desktop.png`, `article-desktop.png`, `about-desktop.png`, `contact-desktop.png`, `privacy-desktop.png`, `404-desktop.png`
- Ten `*-comparison.png` images and four `comparison-board-*.png` files, with canonical reference left and implementation right
- Three mobile captures and comparisons: `catalogue-mobile.png`, `used-mobile.png`, `contact-tr-mobile.png`, with corresponding `*-mobile-comparison.png`
- `comparisons.json` records source/capture dimensions
- `responsive.json` records 36 English/Turkish checks at 320px and 682px
- `axe-desktop.json` and `axe-mobile.json` record the final accessibility scans

Desktop CSS viewport: 1440 × 1100. Mobile CSS viewport: 390 × 1000. Full-page screenshots are used: this browser's viewport-only screenshot crops some bottom pixels. Actual full captures are normalized proportionally to 1440px or 390px wide, then the top 1100px/1000px is compared; the page is never vertically stretched to fit the desktop reference. Reference raster dimensions differ slightly from their intended frames. Browsing scrollbars remain visible.

## Findings and correction history

1. **P1 resolved — inconsistent screen family.** The previous light interior headers and card/form styling are replaced with the approved steel header, native metallic display headings, contextual photography and light content surfaces. Shared component owners apply the result to both languages and all records.
2. **P1 resolved — unwanted footer duplication.** Both repeated global bottom bands are removed. Page-specific photographic callouts remain part of the approved category/About compositions.
3. **P2 resolved — title and stage proportions.** Catalogue header height, subtitle spacing, category title width, larger used-machine heading, condensed editorial headings and new-model artwork framing were corrected in side-by-side comparisons. Busy steel detail behind the category headline is subdued so its lettering remains clean.
4. **P2 resolved — obsolete image sizing.** Inherited fixed-height images stretched guide and About layouts. Reserved aspect ratios, automatic heights and subject-specific image crops now control these surfaces.
5. **P1 resolved — hidden phone menu.** An old zero-size font rule hid Menu/Menü. The shared mobile header now has visible text, a working disclosure, Escape dismissal and focus restoration.
6. **P2 resolved — mobile product reading order.** One gallery control group is placed after the quote summary on phones and beside the stage on desktop. There are no duplicate controls. Model text, machine artwork, facts, quote and thumbnails follow the approved mobile sequence.
7. **P2 resolved — enquiry empty space and context.** Removed obsolete minimum status height, tightened the message field and form rhythm, and added the selected-machine bar with working removal and matching-language state.
8. **P2 resolved — contrast.** Automated checks found the pending brochure annotation below 4.5:1 and a shared rule darkening the homepage sales link on phones. Both foreground colours were corrected and rescanned.
9. **P2 resolved — category/content mismatches.** Non-excavator product summaries retain their own category information. The attachment guide's bilingual excerpt/body now matches its title. Non-staged machine galleries retain relevant photographs.

No unresolved P0–P2 implementation findings remain in the reviewed flows. Remaining P3 visual differences are the exact generated machine silhouettes, photographic crops, metal grain and raster font rendering. The supplied references are flattened images, not source design files or manufacturer photographs; this is a faithful functional reconstruction, not a claim of pixel-identical raster reproduction.

## Fidelity surfaces

**Typography:** Native, selectable Anton headings and Source Sans 3 UI/body, with Barlow Condensed retained where the established design calls for it. Self-hosted Latin Extended subsets support Turkish. Metallic material remains separate artwork clipped into HTML; forced-colour fallback is included. Headings retain language-specific spacing and readable wrapping.

**Spacing:** Compact desktop title bands, left catalogue filters, three-column desktop inventory, paired product details, editorial main/supporting columns and the contact split follow the canonical layouts. Phones stack naturally and expose filters through a labelled disclosure. Working forms retain usable targets and 16px input text.

**Colour:** Graphite stage/header, silver display material, light steel content and cobalt actions share the documented tokens. Sample tags and draft states remain readable. Focus is visible on dark and light surfaces.

**Images:** Optimized original WebP artwork matches the subject and composition of each reference. Relevant gallery images replace the old generic assets. Transparent machine silhouettes are verified; display text is never baked into the artwork. Asset provenance and icon/font licences are documented in `docs/ASSETS.md`.

**Copy and functional differences:** Sample inventory remains explicitly labelled. Unverified brand controls and contact destinations are hidden or plainly pending. Brochure placeholders are annotations rather than fake downloads. The catalogue retains all 12 records beyond the six pictured in the reference frame. Complete article content can extend below that frame. The enquiry note truthfully describes local storage; it does not repeat the mockup's false statement that the working form does nothing.

## Behaviour and technical verification

- Catalogue: four matches for used/year ≥2021/hours ≤5000; no-results feedback; clear-search restores four; reset restores 12; excavator + loader selection yields six
- Gallery: selected photograph changes the actual main image and pressed state
- Enquiry: product context follows the machine link and language change; removal restores the chooser and clears the URL parameter
- Validation: empty submit marks invalid fields and focuses Name; a sample contact/message submission reports successful local storage without claiming email delivery
- Mobile: Menu/Menü opens, Escape closes; filters open, update results and close with Escape
- Both languages at 320px and 682px: no horizontal overflow or missing eager images in the nine principal screen types
- Desktop: all ten reference routes render without overflow, missing visible artwork or repeated footer
- Automated axe WCAG 2/2.1/2.2 A/AA tag scans: 16 representative routes at desktop and phone iframe widths; zero final violations. This supplements manual keyboard/focus review and is not a claim of formal WCAG certification.
- Unit/backend tests: all 16 pass, including durable storage, idempotency, concurrent duplicates, database failure, email failure/retry and notification leases
- Astro/TypeScript: zero errors, warnings or hints
- Production output: 56 pages; 1310 valid internal link/asset references; valid JSON-LD, reciprocal alternate links, canonical metadata and preview noindex exclusion
- Strict frontend design audit: zero findings
- DESIGN.md lint: zero errors; 15 orphan-token warnings reflect component references stored in runtime CSS rather than the document frontmatter. Runtime owners are explicitly mapped in DESIGN.md.
- Formatting checked on the changed sources and documentation
- Browser console: no errors in the final route review

Browser interaction and axe checks ran through the in-app browser against a temporary local-only review harness. Its public files were removed before the clean build. Existing Playwright specifications were updated for the new labels and states; the separate Playwright CLI suite was not invoked in this workflow.

## Launch boundaries

Company details, approved actual stock imagery/specifications, reviewed bilingual articles/privacy copy, provider credentials and real sales destinations remain launch inputs. Local preview completion does not configure Sanity accounts, Cloudflare hosting, Resend delivery or public indexing. The existing launch guard prevents publishing sample data as verified live content. No paid services or public deployment were initiated.

## Subsequent GitHub Pages preview

The owner later authorized a public `Machina` repository and GitHub-only hosting. That preview is now deployed; the earlier launch-boundary statement above describes the initial implementation review. Native route/public image helpers and Astro's base setting preserve `/Machina/` paths. The hosted form clearly disables sending and contact-data inputs, while local development keeps its sample storage flow. All 18 unit tests, the repository-prefixed build and GitHub's six website browser workflows passed. The source and deployed preview remain distinct from the unconfigured full company launch. See `docs/VERIFICATION.md` for deployment scope and editor dependency maintenance.
