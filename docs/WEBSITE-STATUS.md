# Online and maintenance control

Open [Website status in Sanity](https://technicsan-content.sanity.studio/website-status) and sign in with your existing content-editor account.

- **Switch to maintenance** replaces public pages with a branded English or Turkish maintenance page. It keeps the confirmed phone, email and WhatsApp destinations available.
- **Bring website online** restores the current deployed website.
- Changes normally reach visitors within about 30 seconds. “Saved status” confirms the saved selection; “Check public website” opens the actual visitor experience.
- No website build, GitHub workflow, DNS change or new paid service is required for either action. The website is left **online** when this control is introduced.

The authenticated Studio tool updates only the published `websiteAvailability` document. It reads the current revision before each write, reports failed saves and prevents duplicate clicks. The separate document avoids publishing unrelated company or product drafts. Re-deploying the website never resets this state. The initialization script uses `createIfNotExists` and preserves an existing maintenance selection.

Cloudflare reads that document using the public, published Sanity API. Each edge caches the status for 30 seconds and retains its last known state for recovery. Concurrent refreshes share a request; requests have a 1.5-second timeout. A source outage preserves a known maintenance state. An edge with no saved state defaults to online if the source cannot be reached, prioritizing availability. This feature is for temporary maintenance, **not access control**: uploaded files and Sanity's public dataset remain publicly accessible. It cannot recall a page already open in a visitor's browser.

Maintenance responses use HTTP **503**, `Retry-After`, `Cache-Control: no-store` and `noindex,follow`. They do not permanently redirect or replace indexed pages with successful error responses. Canonical HTTPS redirects remain active. Search-release transport checks recognize the deliberate maintenance response while still rejecting certificate errors, broken redirects and unexplained outages. Restoring Online returns the original search policy; the control does not approve any additional pages for indexing. Keep maintenance brief because prolonged downtime can affect search visibility.

Email hosting, mail records, Formspree and domain registration are unchanged. The website's enquiry form is unavailable during maintenance, while direct contact links remain usable. This cannot cancel a submission already accepted by Formspree.

Recovery: if Studio's custom tool fails, an authenticated maintainer can patch `websiteAvailability.status` to `online` or `maintenance` with the Sanity CLI. Do not delete the document to take the site offline. Backups and content exports should retain this document. Existing website rollback artifacts from before this feature do not enforce the new control; redeploy the current worker after rolling back page content.
