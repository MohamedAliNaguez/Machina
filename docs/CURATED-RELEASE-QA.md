# Curated catalogue implementation review — 21 November 2026

The public website remains offline. The manual GitHub deployment workflow was retained and was not run.

## Completed verification

- Nine active records across the five approved families; all retained IDs and translated slugs preserved. Search and filters work without pagination.
- The original 155 records, compatibility redirects and provenance were archived privately before cleanup. There are 146 inactive entries and 79 unused reference images. A representative archived record and image were restored into an ignored scratch directory and compared successfully. The archive is excluded from Git and public builds; it requires a separate secure backup.
- Preview build: 73 pages, zero indexable URLs, 1,319 verified internal link/asset references, valid JSON-LD and reciprocal language links.
- Production output excludes the pending inspection studies, private source-review links, an archived LPG part route and its removed image. All nine normal product pages omit the 3D action while the approved-model registry is empty.
- Type checking: zero errors/warnings. Formatting and whitespace checks passed. Unit tests: 28 passed. Browser tests: 17 passed, including bilingual filtering, archived-route 404, gallery keyboard/swipe/zoom, inspection preview focus, sales delivery failure/retry and accessibility scans.
- Production preflight correctly refuses the current repository content because company identity/privacy are unverified. Tests demonstrate that approved repository content can use Formspree without unused Cloudflare challenge settings; Cloudflare delivery retains its challenge requirement. No real sales email was sent during these automated checks.

## Local rendering sample

Measured the static build in headless Microsoft Edge at 390 × 844, without network or CPU throttling, on the local machine. These are spot checks, not field Core Web Vitals or a real mobile-network benchmark.

| Page          | Observed LCP | Observed layout shift | Horizontal overflow |
| ------------- | ------------ | --------------------- | ------------------- |
| Homepage      | 504 ms       | 0.0005                | None                |
| Catalogue     | 304 ms       | 0.0015                | None                |
| Bulker detail | 152 ms       | 0.0406                | None                |

INP needs representative interactions and eventual field data. Repeat performance testing on the authorised hosting environment after real photographs are added. The optional, lazy-loaded model-viewer bundle still produces a build-size warning; normal catalogue browsing does not request it.

## Outstanding owner-dependent work

Approve actual model specifications, photography and image permissions, company/legal/privacy copy, delivery/support information and reviewed guides. Obtain additional photographs and assess whether they support a realistic bulker model before generating or registering one. Do not reuse rejected geometry. Before any authorised launch, verify actual email receipt, domain/HTTPS, hosted rollback and Search Console/aggregate measurement setup.

See [EDITORIAL-WORKFLOW.md](EDITORIAL-WORKFLOW.md) for the editing, evidence, recovery and release procedure.

## About animation correction

The static desktop composite was rejected and retired. The active scene now uses independently growing ribbon geometry, a lazily loaded Three.js illuminated branch renderer, separate product/foliage layers, and real bilingual copy and milestone labels. The fallback uses animated SVG paths, not a flattened reveal. The current checks passed 30 unit tests and all 22 browser tests; the About tests verify actual changing geometry, WebGL activation, pause/resume/replay, stage selection, reduced motion, no-JavaScript content and animated fallback with WebGL deliberately unavailable. The original scene PNG is not requested by the About page. New background and sprite assets are conceptual illustrations, not verified product photographs. Earlier pixel-identical static-composite checks are superseded and are not claims about the animated 3D render. The public site remains offline.

## Sculptural visual refinement

The owner rejected the initial branch appearance. The current renderer uses independently rigged CGI surface layers with smoother arc-length travel and fifth-order easing, replacing the procedural material surfaces. It is animated 2.5D artwork, not a fully volumetric 3D equipment model. Centreline and normal sampling are cached per mesh column to reduce redundant work. The new visual review checked the final sculpture plus intermediate growth states; all five About browser checks and 30 unit tests passed after refinement. Earlier physical-material descriptions are historical, not a claim about the current texture-skinned render.
