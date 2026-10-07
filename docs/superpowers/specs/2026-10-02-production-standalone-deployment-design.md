# Hung Phat Production Standalone Deployment Design

## Goal

Prepare the existing Next.js application to run at `https://hungphattech.net`
as a production Node.js standalone deployment without changing the visual
design or business content.

## Deployment Architecture

The application remains a Next.js server application because it contains route
handlers, a filesystem content repository, image processing through `sharp`,
and local administration routes. `next.config.ts` will use
`output: "standalone"` so the production artifact contains a `server.js`
startup file suitable for a Node process manager or a cPanel Node application.

The production artifact is `.next/standalone`. A post-build packaging script
will copy the assets that Next.js does not copy automatically:

- `.next/static` to `.next/standalone/.next/static`
- `public` to `.next/standalone/public`
- `.content/default-content.json` to `.next/standalone/.content`
- `.content/published.json` to `.next/standalone/.content`

Drafts, history, tests, logs, development artifacts, and the Windows
`node_modules` directory are not part of the production artifact. The
standalone artifact must be built on the target Linux host or in Linux CI
before it is uploaded to Linux hosting because `sharp` contains native
platform binaries.

## Domain And Environment

The canonical production origin is `https://hungphattech.net`.

A server-only `SITE_URL` environment variable will configure the origin. It
will be validated as an absolute HTTP or HTTPS URL and will default to the
approved production origin so local build verification does not require a
secret file. `.env.example` will document:

```dotenv
SITE_URL=https://hungphattech.net
```

`SITE_URL` is public configuration, not a secret. Future API keys, SMTP
credentials, passwords, and tokens must use untracked `.env` files and must
never be placed in `.env.example`, browser-exposed `NEXT_PUBLIC_*` variables,
logs, or source control.

Local test and screenshot URLs will be supplied by explicit test-only
environment variables instead of production runtime code. Production pages
and APIs will not construct or depend on localhost URLs.

## Metadata And Search Indexing

Production metadata will use `SITE_URL` as `metadataBase`. The root page will
use the production origin for Open Graph URL and canonical metadata. Existing
route-specific titles and descriptions remain unchanged.

The production site will:

- allow search indexing and following;
- publish `robots.txt` with the sitemap location;
- publish `sitemap.xml`;
- include all static public pages, approved category routes, and product
  detail routes;
- exclude `/quan-tri`, editor previews, and `/api/admin/*`.

Structured data will include the public business URL. No visual content or
customer-facing copy is changed by these metadata updates.

## Administration And Backend Safety

The current editor has no production authentication and must not be exposed on
the public domain. Production will keep `/quan-tri`, editor previews, and admin
API route handlers unavailable by returning not found before reading or
writing content.

Development editor access remains possible only in `NODE_ENV=development`.
Production will not use a flag that can accidentally expose the editor without
authentication. Write requests continue to require a same-origin request and
an accepted content type.

The public contact form remains unchanged in this deployment task because no
mail provider, recipient workflow, credential, or durable submission store has
been approved. Enabling real contact submission is a separate backend and
security task.

## Routing And Apache

Next.js handles direct requests for `/san-pham`, category routes, product
routes, assets, and route handlers. No SPA fallback rewrite is needed.

No repository `.htaccess` will be created because cPanel Passenger directives
depend on the account-specific application path and Node manager configuration.
If the selected iNET plan uses cPanel Node App Manager, its application root
must point to the standalone directory and its startup file must be
`server.js`. Apache or Passenger performs the account-specific proxying.

## Content And Asset Integrity

The current published content, not the unpublished draft, is the production
source of truth. The packaging step must fail if
`.content/published.json` is missing.

The packaging verifier will check that every `/uploads/...` path referenced by
published content exists below `public/uploads`. It will also verify that the
standalone package contains:

- `server.js`;
- `.next/static`;
- `public`;
- `.content/default-content.json`;
- `.content/published.json`.

URLs for images, JavaScript, CSS, fonts, and API calls remain root-relative so
deployment at the root domain does not require `basePath` or `assetPrefix`.

## Testing And Verification

Implementation follows test-first changes where behavior is introduced:

1. Add failing tests for production URL parsing, robots/sitemap output,
   production editor denial, and standalone packaging validation.
2. Implement the minimum configuration and helpers that satisfy those tests.
3. Run the complete unit test suite.
4. Run TypeScript checking and ESLint.
5. Run a clean production build and packaging step.
6. Start the standalone server locally with production environment variables.
7. Verify the homepage, representative category and product routes,
   `_next/static` assets, uploaded images, `robots.txt`, and `sitemap.xml`.
8. Run Playwright against the standalone server.

No upload, DNS change, hosting mutation, or production deployment is included
in this implementation phase.

