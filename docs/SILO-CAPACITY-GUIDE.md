# Cement silo capacity guide

Published English document: `article-guide-cement-silo-capacity`.

Public route: `/en/guides/cement-silo-capacity-selection-guide/`.

The supplied manuscript is preserved in `src/data/articles/cement-silo-capacity.en.md` and converted to editable blocks by `src/data/silo-capacity.ts`. All 17 numbered topics, the conclusion, nine tables, nine FAQs and three figures are retained. The layout, contents navigation, figures, print behavior and contact destinations reuse the existing guide components.

Three original figures are available as SVG, 2400 × 1600 PNG and WebP under `public/images/guides/silo-*`. Regenerate them with `scripts/draw-silo-figures.py` in a Python environment with matplotlib and Pillow. The website uses uploaded Sanity copies; regeneration does not automatically replace those published assets. Figure captions distinguish illustrative calculation assumptions from approved equipment limits.

The cover reuses the existing silo catalogue photograph. Publishing creates a new article and leaves earlier guides, product galleries and private article drafts untouched. `studio/silo-capacity-publish.ts` refuses duplicate IDs/slugs and saves a private backup before uploading assets and creating the document. Subsequent editorial changes belong in Sanity.

The capacity planner is implemented in `src/lib/silo-planner.ts` and the corresponding component/controller. It computes daily consumption, safety stock, reorder point, conservative inventory target, required nominal volume, estimated usable inventory, autonomy and average delivery requirements. It identifies undersized proposed volume without presenting a result as a safe receiving or structural loading limit. Invalid values and nonpositive usable inventory are rejected. No calculator inputs are transmitted to analytics or sales.

Interactive tools are restricted to their supported family: this planner belongs to Silos; existing procurement tools remain restricted to Cement bulker. The editor exposes the planner in each section's tool menu and allows explicit related-guide references. Related links work in both directions and only display a guide if that language is published.

The article is English only. The Turkish slug is reserved but not published. SEO approval remains pending; no author, reviewer or review date is invented. Existing Home/Contact search eligibility and the independent Online/Maintenance control remain unchanged.

Validation covers the complete manuscript, the worked calculations, density scenarios, invalid inputs, loaded figure assets, related links, calculator controls, mobile overflow and automated accessibility. Existing guide browsing and procurement calculators are checked alongside the new guide.
