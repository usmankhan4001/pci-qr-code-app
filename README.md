# PCI QR Code Generator

Internal tool for Premier Choice International to generate, brand, manage, and
track dynamic QR codes.

## Features

- **Generation**: URL, vCard, Wi-Fi, plain text, email, and phone QR codes
- **Branding**: colors, dot/corner styles, and logo overlay via reusable brand templates
- **Dynamic + trackable**: every QR encodes a readable `/q/{slug}` tracking link, so the
  destination can be edited after printing, and every scan is logged
- **Library**: search/filter, tagging, clone, archive
- **Analytics**: per-QR scan counts, a 30-day time series, and a device-type breakdown
- **Export**: SVG, PNG (512/1024/2048px), and print-ready PDF

## Local development

Requires Node 20+, Docker (for a local Postgres), and npm.

```bash
docker run -d --name pci-qr-postgres \
  -e POSTGRES_USER=pciqr -e POSTGRES_PASSWORD=pciqr_dev_pw -e POSTGRES_DB=pci_qr \
  -p 5432:5432 postgres:16

cp .env.example .env   # then fill in DATABASE_URL etc. for local use

npm install
npx prisma migrate dev
npm run db:seed        # creates the first admin user + a default brand template
npm run dev
```

Open http://localhost:3000 and sign in with the seed admin credentials
(`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`, defaults in
`prisma/seed.ts`). **Change that password after first login.**

## Architecture notes

- **Stack**: Next.js 16 (App Router) + Prisma 7 (via `@prisma/adapter-pg`) + Postgres + Auth.js v5 (Credentials, JWT sessions)
- **Route protection**: `proxy.ts` (Next 16's renamed `middleware.ts`) gates `/dashboard`, `/qr`, `/templates`
- **Dynamic redirect**: `app/q/[shortcode]/route.ts` — resolves readable slugs first and legacy
  shortcodes second, 302s for URL/email/phone types, and serves a
  `.vcf` download for vCard; renders a small landing page for Wi-Fi/text (a QR pointing at a
  tracking link can't trigger the OS's native "join this network" prompt — that only fires when
  a camera scans a raw `WIFI:` string directly — so Wi-Fi QRs show credentials with a copy button
  instead)
- **Readable public links**: new QR codes use meaningful slugs such as
  `/q/damac-riverside-brochure`. Existing random shortcodes remain valid for already printed codes.
  If a URL QR must show the original destination in the phone camera preview, encode the original
  URL directly instead of the tracking link; that removes dynamic editing and scan analytics for
  that QR.
- **Server-side rendering/export**: `lib/qr-render.ts` uses `qr-code-styling` in jsdom mode, then
  `sharp` for PNG rasterization and `pdf-lib` for PDF. Logo images are read from disk and inlined
  as data URIs rather than fetched over the network from inside jsdom.

## Deploying (Dokploy)

The Docker image is self-contained for Dokploy: one container runs bundled Postgres, applies
Prisma migrations, optionally seeds the first admin user, then starts the Next.js standalone server.

1. Create a Dockerfile app in Dokploy from this repository.
2. Set these as **build-time** args/env vars in Dokploy. They are inlined into the client JS at
   `next build`, so they must exist during the image build:
   - `NEXT_PUBLIC_BASE_URL`
   - `NEXT_PUBLIC_REDIRECT_BASE_URL`
3. Set these runtime env vars:
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`
   - `AUTH_SECRET` (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_BASE_URL`
    - `NEXT_PUBLIC_REDIRECT_BASE_URL`
    - `SEED_ADMIN_EMAIL`
    - `SEED_ADMIN_PASSWORD`
    - Optional R2 backups: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
      `R2_BUCKET`, `R2_PREFIX`, `R2_BACKUP_INTERVAL_HOURS`
4. Expose container port `3000` in Dokploy.
5. Mount persistent volumes at these paths:
   - `/var/lib/postgresql/data` for the bundled Postgres database
   - `/app/public/uploads` for uploaded brand-template logos
6. Deploy. On startup the container initializes Postgres if needed, creates the app role/database,
    runs `prisma migrate deploy`, runs the seed script when `SEED_ADMIN_PASSWORD` is set, then starts
    the app. When `SEED_ADMIN_PASSWORD` is set, the seed script also updates the admin password for
    `SEED_ADMIN_EMAIL`, so those values are the portal login.

### Backups (Cloudflare R2)

The runtime image includes `scripts/backup-r2.sh`. It creates a custom-format `pg_dump`, archives
`/app/public/uploads`, writes a small manifest, and uploads all files to Cloudflare R2 using the
S3-compatible API.

Set `R2_BACKUP_INTERVAL_HOURS=24` (or another positive whole number) to run backups automatically
inside the container after migrations complete. Set it to `0` or leave it empty to disable the
loop and run backups manually from Dokploy/SSH:

```bash
docker exec <container> /app/scripts/backup-r2.sh
```

Restore database backup:

```bash
pg_restore --clean --if-exists --no-owner --no-acl -d "$DATABASE_URL" backup.dump
```

Restore uploaded logos by extracting the matching `*-uploads.tar.gz` archive into `/app/public`.

### Why the Dockerfile looks the way it does

- `node:20-bookworm-slim` (glibc, not Alpine) plus `libcairo2`/`libpango`/`librsvg2`/etc. at
   runtime — `qr-code-styling`'s server-side rendering needs the `canvas` package to decode logo
   images inside jsdom. Without `canvas` installed, logo exports don't error, they hang for 10s+
   per request.
- `postgresql` is installed in the runtime image because Dokploy deployment is intentionally
  single-container for this project. Keep `/var/lib/postgresql/data` mounted as a persistent volume
  or the database will be recreated on each redeploy.
- `awscli` is installed in the runtime image only for Cloudflare R2 backups via the S3-compatible
  endpoint. Backups are optional and require R2 env vars.
- `openssl` is installed explicitly — Prisma's query engine can't auto-detect the OpenSSL version
  on a slim image otherwise and silently defaults to the wrong one.
- The full `node_modules` from the `deps` stage is copied over Next's traced `.next/standalone`
  output — standalone's file tracer can miss native addons (`sharp`, `canvas`) since they resolve
  platform binaries at runtime rather than via static `require` calls that tracing can follow.
- `prisma.config.ts` and `package.json` are copied alongside `prisma/` — Prisma 7 reads the
  datasource URL from the config file, not from `schema.prisma` directly, so `migrate deploy`
  fails without it.
- `app/generated/prisma` (the Prisma client, normally only needed by the Next.js server bundle
  that already includes it) is also copied so `prisma/seed.ts` — a script run ad hoc via
  `docker exec`, not part of any route — can resolve its import of it.
- `trustHost: true` is set in `lib/auth.ts` — Auth.js otherwise rejects requests behind Docker's
  port mapping or a reverse proxy/tunnel (like the Cloudflare Tunnel in front of Dokploy) with an
  `UntrustedHost` error, since the `Host` header it sees isn't a single fixed, pre-known origin.
