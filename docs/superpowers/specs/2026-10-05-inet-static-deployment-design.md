# iNET Static Deployment Design

## Goal

Create `deployment/hungphattech-production.zip` for direct extraction into an
Apache `public_html` directory. The ZIP must contain `index.html` at its root,
must not contain Node.js runtime files or development sources, and must preserve
all public website routes and assets.

## Architecture

The existing Next.js standalone build remains the source application, but it is
not suitable for plain `public_html` hosting because it requires `server.js` and
runtime dependencies. A temporary staging copy will build the public site using
Next.js `output: "export"`, `trailingSlash: true`, and unoptimized local images.

The staging copy excludes `/api/admin/*` and `/quan-tri/*`, which require a Node
server and are already unavailable in production. Public pages, generated
category routes, generated product routes, CSS, JavaScript, fonts, favicon, and
published images remain in the static export.

## Package Layout

The contents of the generated `out` directory become the contents of
`deployment/hungphattech-production`:

```text
index.html
404.html
_next/
images/
uploads/
danh-muc/
san-pham/
...
```

The ZIP is created from these entries, not from the parent directory, so
extracting it directly in `public_html` places `index.html` at
`public_html/index.html`.

## Verification

- Run a clean static build.
- Confirm every public route has an HTML entry point.
- Serve the exported directory through a local static HTTP server.
- Verify representative pages, CSS, JavaScript, fonts, images, and favicon.
- Scan for secrets, localhost references, Node runtime, Git metadata, logs, and
  development sources.
- Open the ZIP and verify `index.html` is a top-level entry.
- Extract the ZIP into a fresh temporary directory and repeat structural checks.

## Limitations

The static package does not include the local content editor or admin APIs.
Changing published content requires rebuilding and uploading a new static
package. No database is required.
