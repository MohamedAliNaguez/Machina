# TECHNICSAN content and launch workflow

## Edit the focused catalogue

**Sanity is now the primary editor.** Use https://technicsan-content.sanity.studio/ for products, guides, the five families and company settings. Follow [SANITY-EDITOR.md](SANITY-EDITOR.md). The local JSON files below remain recovery/seed snapshots, not a bidirectional mirror of subsequent CMS edits. Website deployment remains manual and the public website remains offline.

Use `src/data/catalogue-products.json` for the fourteen retained products. Keep their IDs and bilingual slugs stable. There is one cement bulker, seven LPG products, two compressors, two mixers and two silos. Search and family filters show every match without pagination. Do not restore imported components merely to fill the catalogue.

In offline repository mode, use `src/data/repository-settings.json` for company/privacy copy, `src/data/repository-articles.json` for reviewed guides and `src/data/contact.json` for contact destinations. Select `CONTENT_SOURCE=repository` to use those snapshots; the default is `sanity`. `CONTENT_SOURCE=sample` is for fixture review only and cannot launch. Settings and products currently remain unapproved; do not change approval flags as a workaround for failing validation.

For each product:

- Confirm the supplied model/configuration and right to offer it. Record supporting specifications and image permissions in the private provenance folder.
- Review Turkish and English names, useful purpose statements, application context, configuration questions and image descriptions. Specifications must match actual documentation; questions are not specifications.
- Target four genuinely different photographs: overall, opposite side, connections/controls and a useful detail. Launch requires at least two distinct approved photographs of the product. Mark illustrative imagery honestly; it is not eligible as exact product photography.
- Use consistent neutral backgrounds, uncropped machinery, reserved image dimensions and responsive compressed images. Keep the source originals privately. Do not generate unseen views or replace technical details during retouching.
- Approve image rights explicitly and set `technicalReview=approved` only after checking evidence. Remove `sample` only when the page is genuine, complete and reviewed. Both languages must be ready.
- Add only an approved brochure. A missing brochure gets an explanation, not a download or navigation link.

For guides, supply useful original content, supporting sources, an actual author, reviewer and review date. Approved guides go in the repository article file; draft guides remain sample fixtures. Empty guide collections show an honest empty state and no empty homepage section.

## Company and sales information

Obtain the legal business name, exact address, approved bilingual company/privacy copy, delivery coverage and actual support arrangements. Do not infer certifications, dealer status, experience, response times or warranties. Include confirmed delivery/support information in approved company copy. The contact page explains what to provide and what to confirm in a quotation without promising unverified service terms.

The configured GitHub Pages delivery provider is Formspree. Local development stores test enquiries without sending sales emails. `npm run verify:launch` checks the selected provider and content. GitHub Pages requires a valid Formspree endpoint; Cloudflare requires its challenge setup and separately verified deployed storage/secrets. Configuration checks cannot prove inbox delivery. Use one explicitly labelled delivery check, confirm it arrives, and test failure/retry without losing form values. Never include contact values in analytics.

## Recover an archived entry

The original 155-product inventory, redirects, provenance snapshot and removed reference images are preserved under the ignored `.local/catalogue-archive/2026-11-21/`. Back up that folder securely: Git does not protect ignored files. The archive contains the original inventory before this cleanup; the active fourteen records contain later editorial improvements.

To recover an entry, copy only its selected record into the active JSON, restore its referenced assets from `assets/` into the matching `public/` paths, and recover its private provenance. Restore only its own compatibility redirects if needed. Review facts, rights and translations before publication. Do not copy the complete archive or source metadata into public assets. Removed product URLs deliberately return 404; they do not redirect to unrelated equipment.

## Prepare the bulker 3D pilot

While awaiting photographs, ordinary product pages have no 3D action. `/design/inspection/` and `/design/inspection-tr/` are development-only interface studies. The rejected experimental assets must remain disabled.

Request overlapping photographs around the complete machine, with consistent equipment, lighting and focal length, plus top/underside coverage where safely available and detail views of hoses, fittings and chassis. Obtain permission to use all views. Photograph coverage determines feasibility; more photographs alone do not guarantee realistic reconstruction. Decide the modelling route only after assessing the actual assets. No additional generation or credit spending is authorised by this workflow.

Review an exportable GLB against the photographs for silhouette, axle/fitting placement, lettering, materials and hidden-area assumptions. Do not claim dimensional accuracy or offer measurements. Register only an approved local model in `src/lib/product-models.ts`, including reviewed model-space hotspots. Test on-demand loading, orbit/zoom/reset, reduced motion, keyboard/mobile controls and load-failure photo fallback before enabling it for visitors.

## Release and measurement

1. Run formatting, type checks, unit/browser/accessibility checks and a production-style preview build. Verify retained and removed routes, reciprocal translations, metadata, structured data and sitemap. Confirm private sources and local design routes are absent from output.
2. Check mobile photographs/specifications, reserved image space and keyboard focus. Measure LCP/CLS and interaction responsiveness in a real browser; targets remain LCP ≤2.5s, INP ≤200ms and CLS ≤0.1. Field INP requires real usage and cannot be certified by a build.
3. Complete `npm run verify:launch` with the actual HTTPS origin, production hosting, `CONTENT_SOURCE=repository` and approved content. Pending business or product evidence must fail this check.
4. Verify real inbox delivery, domain/HTTPS, privacy approval and restore/export. Test recovery locally from a copy of the backup. Before publishing, document the known-good commit/artifact and rehearse its build; only a later authorised deployment can verify hosted rollback.
5. Keep `PUBLIC_LAUNCH_READY=false` and the public site offline until explicit publication instructions. The workflow remains manual-only. Do not publish or enable indexing just to test configuration.
6. At authorised launch, configure Search Console using the owner's account, submit the approved sitemap and measure aggregate product/enquiry events without contact values. Review search queries, useful enquiries and field performance after sufficient usage; SEO/GEO visibility is an outcome, not a guarantee.
