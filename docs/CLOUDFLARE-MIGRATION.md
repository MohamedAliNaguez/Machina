# Cloudflare Pages migration — 25 November 2026

Cloudflare account connected and free Pages project `technicsan` created. First review deployment: https://efac10ae.technicsan.pages.dev ; stable production branch preview: https://technicsan.pages.dev/en/ .

The custom domain has NOT moved yet. Namecheap sign-in is needed to back up the complete cPanel DNS zone before copying records to Cloudflare DNS and changing nameservers. Preserve MX, SPF, DKIM, DMARC and all non-web records. Domain registration stays at Namecheap. Do not cancel the old hosting until DNS and email dependencies are verified.

Build with `npm run cloudflare:build`; publish with `npm run cloudflare:deploy`. The dedicated `deployment/cloudflare` configuration excludes the unused native enquiry Functions and D1 backend. Formspree remains the configured sales service. Indexing stays disabled by default. Public draft previews are prohibited.

The manual-only GitHub workflow is prepared for Cloudflare but is not connected yet: it needs company-scoped CLOUDFLARE_API_TOKEN (Account / Cloudflare Pages / Edit) and CLOUDFLARE_ACCOUNT_ID secrets. Do not commit credentials. Previous GitHub deployment workflow is archived at `deployment/github-pages.workflow.yml`, outside active workflows. Local changes have not yet been committed/pushed.

Security headers authorize Astro inline modules through exact build-time SHA-256 hashes. The Pages worker handles canonical domain, root and legacy redirects and preserves 404 responses. Preview hostnames always receive noindex headers, including after a future selective search release.

Before domain cutover: verify complete DNS backup, copied email records, Free zone, Pages custom domain attachment, then change nameservers. After cutover: validate apex/www certificates without bypassing TLS errors, redirects, bilingual routes, galleries, enquiry handling and unchanged mail DNS. Set no paid upgrade automatically. Keep rollback DNS and deployment references privately.

## Domain activation verified

On 25 November 2026, Namecheap saved finley.ns.cloudflare.com and lorna.ns.cloudflare.com. Cloudflare reports active. Both public resolvers confirm these nameservers and the unchanged Private Email MX destinations. Strict TLS checks confirm valid certificates for technicsan.com (200) and www.technicsan.com (308 to HTTPS apex). Both Pages domain associations are configured; both DNS CNAMEs target technicsan.pages.dev. All other thirteen DNS records are preserved and DNS-only. Original zone export is saved privately in `.local/dns-before-cloudflare-cutover.txt` and Downloads/technicsan.com.txt.

A Pages Edit credential for the specific company account was created with expiry 23 February 2027. Its initial value was rotated after appearing in a form snapshot. The initial value is invalid. Saving the replacement in GitHub is pending GitHub email identity confirmation; finish that before testing the manual deployment workflow. Add the account ID secret as well. No permanent credential was created.
