# LPG catalogue expansion — 24 November 2026

Seven LPG product types from the requested reference site are now represented in Sanity and the repository recovery snapshot:

| Product                   | Reference photographs |
| ------------------------- | --------------------: |
| LPG semi-trailer          |                    14 |
| LPG bobtail               |                    12 |
| LPG dispenser skid system |                     2 |
| LPG scale skid system     |                     5 |
| LPG bulk storage tank     |                     7 |
| LPG domestic tank         |                    13 |
| LPG vaporiser             |                     5 |

Five new records were added and the two existing LPG placeholder galleries were replaced. Existing published product text was retained. The importer skips drafts and approved records, preserves changed fields, revision-checks updates and backs up prior remote records privately before changing them. The overall catalogue now has fourteen products, still within the exact five approved families.

Product titles, summaries, descriptions and image descriptions support Turkish and English. Shared source specification values are retained without inventing missing data. The vaporiser page's volume entry was deliberately excluded because its meaning as a capacity measure is unclear. Source material grades and listed design codes remain unverified; they are not TECHNICSAN certification claims. Sales must confirm the actual offered configuration and documentation.

Photos remain reference photographs with reuse permission pending. No source logos were erased or replaced, and source equipment is not represented as TECHNICSAN-manufactured or confirmed stock. Keep every imported product's sample and technical-review flags pending until company review. The existing launch gate rejects unapproved content and rights. All galleries are optimized WebP, loaded on demand below the primary product image; originals and source-page snapshots are retained privately.

The ignored `.local/lpg-import/` folder contains the source manifest, HTML, originals, prepared records and pre-import recovery snapshot. `.local/sanity/lpg-before-*.json` contains remote record backups. Source review links use the existing ignored provenance mapping and appear only in local development. These files must not be copied to public assets or Sanity fields.

`studio/import-lpg.ts` applies the reviewed local manifest through the authenticated CLI. It requires those private inputs; do not rerun it against unrelated content. The normal seed command remains non-replacing. No website deployment was performed.
