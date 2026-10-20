# Excavator motion studies

Route: `/design/loaders/`. Mode: Experience. Three proposals within the approved Machine Theatre identity; the owner selected **The steel reveal**. The comparison stays outside public navigation and is always excluded from indexing. The selected loader is integrated through the shared bilingual Layout, with the original homepage composition preserved.

- Hydraulic rhythm: an intentionally geometric side-elevation diagram with nested boom, stick and bucket pivots. A 4.8-second digging cycle supplies the focal movement; no realistic equipment specifications are implied.
- The steel reveal: the existing illustrative excavator WebP and real HTML silver wordmark are uncovered by three physical steel shutters. This is the closest continuation of the approved homepage.
- From the drawing board: a light steel sheet with a cobalt technical elevation, traced from incomplete linework to the full machine. Construction lines belong to the actual diagram, not an ornamental UI grid.

The page supplies full-size previews, shared pause/play and replay controls, native dialog focus containment, Escape dismissal and focus restoration. Loops belong only to this comparison surface. There are no fabricated percentages. Reduced motion presents complete still compositions; offscreen and hidden-document animation is paused. No audio, animation library, external service or new raster asset is required.

Budget: CSS transforms, opacity and a contained SVG line trace, with one 4.8-second sequence per concept in the comparison. Artwork has reserved dimensions. Common colors/type inherit global.css and theatre.css. SteelRevealArt.astro and steel-reveal.css now share the approved artwork between the comparison and actual loader; steel-loader.css and steel-loader.ts own its readiness-based lifecycle.

## Initial concept verification

2026-10-20: inspected the comparison and expanded previews at 1280 × 720 and 390 × 844. No horizontal overflow or console errors; all artwork and fonts loaded. Pause produced paused computed animation states, replay resumed playback, Escape closed the native dialog and restored its opener, and background previews suspended while a dialog was open. Reduced-motion behavior is implemented with a media query and matching control state; OS emulation was not available in the browser tool.

`npm run check`, formatting checks and all 18 existing unit tests passed. Normal and `/Machina` GitHub Pages builds passed with 57 pages and 1,372 internal references. The strict premium audit returned zero findings. Impeccable's detector reported only advisory artwork color shades outside the shared UI palette; those shades are intentionally isolated to the proposal illustration. No production design tokens or existing pages changed. Local screenshot evidence: `.local/loading-concepts/overview.png`.

## Initial selected implementation verification (v1)

The actual loader waits 160ms before appearing and is cancelled if critical above-the-fold image decoding and fonts settle first. It has no minimum playback time. Readiness dismisses it with a 160ms exit; a two-second deadline releases stalled assets. CSS independently hides an interrupted overlay. Subsequent session visits, history restoration and automatic reduced-motion playback are skipped. The loader photo is deferred and fetched at low priority without joining the readiness condition. Missing JavaScript leaves the overlay hidden.

Built the actual static site and served it through temporary local test servers. A five-second critical-image delay produced `timeout` and a hidden loader; an intentional failed image produced `ready` without displaying the loader; subsequent catalogue navigation produced `session-skipped`. English and Turkish status/continue copy were checked. The explicit Try selected loader review used the actual component, isolated the background, focused its exit, supported Escape and restored focus. At the available 682 × 668 browser viewport, artwork and controls fit without horizontal overflow. The browser viewport override did not apply requested desktop/phone dimensions in this pass, so those exact integrated viewport captures remain unverified. The initial comparison's 1280 × 720 and 390 × 844 checks are recorded above.

After integration, type checking reported zero errors/warnings/hints; all 18 existing unit tests, formatting, normal build and `/Machina` GitHub Pages build passed. Both builds verified 57 pages and 1,428 internal references. The strict premium audit and selected-code design detector returned no findings. DESIGN.md lint returned no errors and the same 15 existing frontmatter token-reference warnings. No paid service or deployment was created for this change. Temporary test servers were closed. The ordinary development server remains at port 4330.

## Approved one-second introduction (v2)

The owner could not notice the load-only treatment and explicitly chose “Show a 1-second intro once per session”. The loader now appears immediately, holds for one second before its opacity exit when assets are ready, and retains the two-second recovery limit. Shutters open in 600ms with 35ms offsets so the revealed excavator remains visible before the exit. The caption is now truthful brand copy, New and used machinery / Yeni ve ikinci el iş makineleri. A versioned session key allows visitors who saw the previous version to see this revised intro once. Reduced-motion, history, dismissal, unavailable storage and no-JavaScript safeguards remain.

Verified the built `/Machina` About page through a temporary instrumented local server: the complete visible cycle measured approximately 1.1 seconds including its exit, and a same-session reload returned `session-skipped`. The timing instrumentation was confined to ignored local test fixtures. Type checking, all 18 unit tests, formatting and the 57-page built-site verification passed. The strict premium audit and selected-code detector returned no findings.

The intro caption is static brand text rather than a live status announcement. This keeps enquiry success/error announcements semantically distinct, including the short overlap while the introduction fades out.
