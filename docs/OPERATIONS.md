# Operations and deployment

## Free development

Use `npm run dev`. Local API storage lives in `.local/enquiries.sqlite` and is ignored by Git. Only enter test data. No vendor account, email destination or billing setup is required. Astro telemetry is disabled for project scripts through an environment flag, without changing global machine settings.

## GitHub-only hosted preview

The owner chose free GitHub Pages hosting in the public `MohamedAliNaguez/Machina` repository. `.github/workflows/deploy.yml` builds with Node 24, runs type checks and unit tests, and publishes a Pages artifact. GitHub's own deployment token is used; no provider secrets are required. Changes to `main` redeploy automatically. Pages must use **GitHub Actions** as its source.

The build sets `PUBLIC_HOSTING=github-pages`, `PUBLIC_LAUNCH_READY=false`, `CONTENT_SOURCE=sample`, `PUBLIC_SITE_URL` to Pages' origin and `PUBLIC_BASE_PATH` to its repository path. `withBase` prefixes native routes and public image paths; Astro prefixes bundled scripts, styles, fonts and CSS artwork. The build verifier rejects root-relative links that escape that repository prefix. The root HTML redirects to the repository's Turkish homepage; the custom 404 also retains the prefix.

GitHub Pages serves static files only. It does not execute the Cloudflare Functions or notification Worker. The hosted contact screen clearly disables sending and contact-data inputs; the client also prevents form submission. The local development API remains available for testing with invented data. Never describe hosted demo submissions as stored locally or emailed. The launch build gate prevents treating this static preview as the full enquiry-enabled production release.

All preview pages retain `noindex` metadata and sample/draft labels. A repository-scoped robots.txt cannot control the root github.io host; per-page metadata is the indexing control. Neither prevents access: both the website and repository are public by the owner's choice. Private `.env`, `.local`, database, export, generated workspace and credential files are ignored by Git. Build output includes `.nojekyll` and omits Cloudflare-specific `_headers`/`_redirects` files.

For rollback, rerun the successful GitHub Pages workflow for a known revision or revert the offending change on `main`. Keep the successful deployment run and commit reference. A custom domain can be configured later; the workflow derives its origin/base from Pages so paths remain correct after rebuilding.

Official setup references: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/).

The Cloudflare instructions below are an optional future backend/hosting path, not part of this GitHub-only deployment.

## Cloudflare runtime rehearsal

```sh
npm run build
npm run db:local
npm run local:cloudflare
```

The local-only zero UUID in `wrangler.toml` is a placeholder. These local commands do not create a cloud database. Set `.dev.vars` from the example and use `SITE_ORIGIN=http://localhost:4322` if that is the exact browser origin. Preview API responses explicitly state that no sales email was sent.

## Deploy later using company accounts

1. Create a Cloudflare Pages project and a free-tier D1 database. Replace the database ID in both Wrangler files with that database's ID. No resources have been created automatically.
2. Apply the migration to that database with `npx wrangler d1 migrations apply machinery-enquiries --remote`. Confirm the account/database before any remote change.
3. Bind `DB` to Pages and the notification Worker. Store secrets with Cloudflare's secret mechanism, never in source or build-time public variables.
4. Pages build command: `npm ci && npm run build`; output: `dist`; Node version: 24. Set public site URL and Sanity variables from `.env.example` in the build environment.
5. For production enquiries configure `ENVIRONMENT=production`, exact HTTPS `SITE_ORIGIN`, `RESEND_API_KEY`, `SALES_EMAIL`, `FROM_EMAIL`, a randomly generated `RATE_LIMIT_SECRET` of at least 32 characters, and `TURNSTILE_SECRET_KEY`. Add the matching public site key to Sanity site settings. Configure the same notification settings on the retry Worker. Set a verified sender domain at Resend.
6. Deploy the notification Worker with `npx wrangler deploy --config wrangler.notifications.toml`. It checks the durable outbox every five minutes and has no public operation endpoint.
7. Test storage, notifications and retries with approved test details. Set `PUBLIC_LAUNCH_READY=true` only after `npm run verify:launch`, content review and deployment checks pass. Rebuild to generate the indexable sitemap. Use preview environments with separate data and secret scopes.

The verification workflow checks pushes and pull requests. The active deployment workflow targets GitHub Pages only. If Cloudflare hosting is introduced later, use company-scoped credentials and a separate reviewed deployment workflow. Provider billing remains a separate human decision; never enable paid plans automatically.

## Publishing and authenticated previews

Use Cloudflare's Git integration with a deployment hook. In Sanity create a signed-in administrator-managed webhook for published document create/update/delete, excluding draft IDs, to that private hook URL. Treat the hook URL as a secret; do not put it in the website. Deployments rebuild the public dataset; they never expose a CMS token to the browser. Keep the last successful deployment if a build fails and investigate the build alert. Availability is subject to sales confirmation while a rebuild is pending.

The Studio Bilingual preview reads the authenticated displayed document; it does not publicly fetch drafts. For full-site draft builds use `SANITY_PREVIEW=true`, a least-privilege server/build `SANITY_READ_TOKEN`, and `PUBLIC_LAUNCH_READY=false`. Restrict the preview host with Cloudflare Access before deployment. Never put draft builds on the production domain. Search directives do not provide confidentiality.

## Enquiry guarantees and failures

The endpoint accepts JSON with name, email or phone, message, language and optional stable machine ID. It requires an exact same-origin header and a UUID `Idempotency-Key`. It rejects oversize bodies and invalid fields. It allows five new requests per ten-minute IP-hash bucket, uses a honeypot and verifies production Turnstile tokens/hostname.

Acknowledgement means a durable enquiry record exists. A retry using the same key and payload returns the existing reference; a changed payload with that key returns 409. Email runs after storage. Notification claims use a ten-minute lease and a stable Resend idempotency key. Backoff is exponential with a maximum of five attempts, all within the provider's idempotency window under normal operation. Provider outages longer than that window need manual review before redispatching.

Check pending/failed notifications in the company Cloudflare console (operator access required). Log only references/status, not contact data. Failed notification records remain stored, never silently deleted. Inspect records with status `failed`; resolve provider issues, confirm whether delivery occurred, and only then reset a record to `pending`, attempts to zero and next-attempt time to now. No public retry endpoint exists. Monitor failed deployments, outbox failures and enquiry service errors through the company's chosen operator alerts; no external alert destination is configured.

The retry job removes expired rate-limit hashes. Enquiry retention/deletion must follow the company's approved policy; no destructive retention schedule is invented here. The placeholder privacy notice must be replaced before accepting live personal information.

## Backups and recovery

Before a release, retain the successful Git revision and Cloudflare deployment ID. Use Cloudflare deployment rollback to restore previous static pages/functions; confirm the database schema remains backward-compatible. Migration 0001 is additive. Rehearse rollback on a separate preview project before launch.

`npm run content:export` downloads authenticated Sanity documents to ignored `exports/`. For a complete archive including assets, use the authenticated Sanity CLI `sanity dataset export` from `studio/`, then restore with `sanity dataset import` into a separate test dataset. Verify machine counts, references, images and both languages before promoting recovered content. Store exports privately outside the repository. Do not import backups into production as a rehearsal.

For D1 use the company's Cloudflare export/recovery tools, keep the export encrypted and access restricted, and test restore into a separate database. This requires a real company account; cloud backup/rollback has not been executed in the unconfigured local preview.

## Monthly maintenance

Reserve 2–4 technical hours initially: check the enquiry outbox, run a test enquiry, review dependency changes, verify backups/recovery, inspect deployment failures and review performance/indexing. Inventory accuracy, article writing and translation review are separate recurring work.
