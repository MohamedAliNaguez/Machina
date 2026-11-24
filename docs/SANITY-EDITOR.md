# TECHNICSAN content editor

Open **https://technicsan-content.sanity.studio/** and sign in with the Google account used during setup. The project uses Sanity Free; you edit as Administrator. No paid subscription or separate Editor seat was purchased.

## What you can edit

- **Products:** fourteen catalogue entries, bilingual descriptions, photographs, specifications, configuration tables, brochures and review status.
- **Guides & articles:** create a guide, add Turkish and English text, a cover image, product-family reference, reading time, sources and actual author/reviewer details.
- **Five product families:** edit the existing family descriptions and buyer requirements. The five families are fixed.
- **Company & launch settings:** public contact details and approved company/privacy copy. Review switches remain off until approval.

The approved logo, slogan, visual design, history animation and product-3D registry remain in the website project. They are not arbitrary editorial fields.

## Write, review and publish

1. Open a product or create a guide. Changes save as a draft automatically.
2. Fill both languages and their URL fields. Keep existing URLs stable after publication.
3. Upload genuine product images, describe each in both languages and record rights/illustrative status honestly. Generic placeholder images remain labelled.
4. Use **Bilingual preview** to inspect the saved draft inside your signed-in Studio. This is a content preview, not a full website layout preview.
5. Resolve validation errors, then select **Publish** to make the approved content available to the website build.
6. Refresh the local website after a few seconds to see published changes. Unpublished drafts do not appear on it.

The latest three published guides appear on the homepage automatically. Each guide gets its own page and appears in Guides. A guide can be saved as a draft without publishing it. No sample articles were added to the published collection.

## Publishing content and deploying the website

Publishing in Sanity does **not** deploy the website. Its GitHub workflow still has only a manual deployment trigger. The owner requested republishing the current review website on 24 November 2026. Each manual build reads published Sanity content; the separate launch gates and preview/noindex settings remain enabled. Future deployments still require an owner request.

The local development server is at **http://127.0.0.1:4330/**. To start it yourself, use `npm run dev -- --port 4330 --ignore-lock`; Sanity is the default content source. `CONTENT_SOURCE=repository` remains an offline recovery mode using the retained local catalogue.

## Public and private information

Sanity Free uses a public dataset. Treat published fields and uploaded assets as publicly readable, even while the website is offline. Draft documents require authentication, but uploaded assets must not contain confidential material. Keep customer enquiries, passwords, API tokens, private supplier provenance, internal pricing and restricted documents outside Sanity. The sales form continues using its existing separate delivery/storage path.

## Technical maintenance

- Public project configuration: `src/data/sanity.json` (`orvo6y9t`, `production`). Project IDs are not secrets.
- Connection and published-content validation: `npm run content:check`.
- Editor type check/build: `npm run studio:check` / `npm run studio:build`.
- Local editor: `npm run studio`, at http://127.0.0.1:3333/.
- Redeploy the editor after schema changes: `npm --prefix studio run deploy`. This publishes the authenticated editor, not the company website.
- Safe initial import: `npm run content:seed`. It skips existing published records and drafts, never replaces editorial work and retains review flags. Assets are deduplicated. Only active public catalogue content is imported; private archives are excluded.
- Backup including assets: from `studio/`, use the authenticated Sanity CLI `npx sanity datasets export production ../exports/technicsan-backup.tar.gz`. Use a unique dated filename for each backup and keep it private. Export before migrations; restore into a separate test dataset before considering production recovery.

Published content is fetched at build time. Production is static and requires a new manual deployment to reflect edits. Local development refreshes its content cache after two seconds. Missing or invalid CMS content fails the build; it does not silently substitute sample data.
