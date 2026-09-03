# Kilimanjaro Pazuri

The website for Kilimanjaro Pazuri — a boutique African villa in Moshi, Tanzania.

A SvelteKit application: the site and its backend are one deployable. Every
word comes from the *Kilimanjaro Pazuri Brand & Copy Deck*, and the layout is
built on the Zoomvilla single-property template, re-themed to the brand.

Live at **https://pazuri.makutano.co.tz**

---

## What is here

| Path | What it holds |
| --- | --- |
| `src/lib/content/site.ts` | Every published sentence, in one file. The deck is the source of truth — edit here, not in the pages. |
| `src/lib/server/` | The backend: the Postgres connection, queries, validation, sessions, rate limiting. |
| `src/routes/(site)/` | The seven public pages plus the six room pages. |
| `src/routes/api/` | JSON API: rooms, booking enquiries, contact, health. |
| `src/routes/admin/` | Enquiry inbox, room and rate editing, and the pre-launch checklist. |
| `static/assets/` | The template's CSS and icons, the brand layer, and the villa's own photographs. |
| `supabase/migrations/` | The schema. Applied on boot, and by `supabase db push`. |
| `deploy/` | Caddy snippet, systemd unit, deploy script. |

The villa's photographs in `static/assets/images/villa/` were extracted from
the brand deck. They are the property's own; the deck is explicit that stock
imagery is not the brand.

## Running it

Requires **Node 22.12+** (this repo pins 22.16 in `.nvmrc`; Node 23 is not
supported by the build toolchain).

```bash
nvm use
npm install
cp .env.example .env
# Put your Supabase pooler URL in DATABASE_URL, then:
npm run hash-password -- "a password for the admin area"   # paste into .env
npm run dev
```

Data lives in **Supabase Postgres**. On first query the app applies
`supabase/migrations/0001_init.sql` and seeds the six rooms and the gallery, so
a fresh project needs nothing done by hand. Both steps are idempotent.

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run check` | Type and Svelte checking |
| `npm run build` | Production build (adapter-node) |
| `npm start` | Run the production build, reading `.env` |
| `npm run hash-password -- "…"` | Print an `ADMIN_PASSWORD_HASH` line |

## Configuration

| Variable | Required | Why |
| --- | --- | --- |
| `DATABASE_URL` | yes | Supabase → Settings → Database → Connection string → URI. Use the **port 6543 pooler**. |
| `ORIGIN` | in production | SvelteKit rejects every form POST with 403 without it. `docker-compose` sets it from `PUBLIC_SITE_URL`. |
| `ADMIN_USERNAME` | yes | Sign-in for `/admin`. |
| `ADMIN_PASSWORD_HASH` | yes | `salt:hash` from `npm run hash-password`. The plain password is never stored. |
| `ADDRESS_HEADER` / `XFF_DEPTH` | behind a proxy | Otherwise the rate limiter sees only the proxy, putting every visitor in one bucket. |
| `DATABASE_POOL_MAX` | no | Connections this app holds open. Defaults to 5. |
| `PORT` | no | Defaults to 3000. |

## The API

```
GET  /api/health           service and room count
GET  /api/rooms            the six rooms, rates and what each rate includes
POST /api/bookings         a booking enquiry (JSON or form encoded)
POST /api/contact          a general enquiry
```

Both `POST` endpoints validate their input, reject unknown rooms, carry a
honeypot field, and are rate limited per address. Enquiries land in `/admin`.

## Deploying

DNS for `pazuri.makutano.co.tz` already points at the server, which runs Caddy.

**On the server, once:**

```bash
git clone https://github.com/pastatrade101/kilimanjaro-pazuri.git
cd kilimanjaro-pazuri
cp .env.example .env      # then fill in ADMIN_USERNAME and ADMIN_PASSWORD_HASH
```

Generate the password hash on any machine with Node:

```bash
npm run hash-password -- "the admin password"
```

On the Makutano server this lives at `~/app/services/kilimanjaro-pazuri`,
alongside the other sites.

**Start it.** The port is not published; Caddy reaches the container by name
over the shared `makutano-net`:

```bash
docker compose up -d --build
```

**Put Caddy in front** — append `deploy/Caddyfile.snippet` to
`~/app/config/Caddyfile`, then reload the Caddy container. It issues the
certificate itself:

```bash
docker exec makutano-digital-caddy caddy reload --config /etc/caddy/Caddyfile
```

**Afterwards**, `./deploy/deploy.sh` pulls, rebuilds and health-checks.

Without Docker, use `deploy/kilimanjaro-pazuri.service` instead: build with
`npm ci && npm run build`, then enable the unit.

### The database

Supabase Postgres — four tables: `rooms`, `enquiries`, `gallery_images` and
`sessions`. Backups are Supabase's own; nothing on the server holds state, so
the container can be rebuilt or moved freely.

Row Level Security is enabled on all four tables and deliberately has **no
policies**: the anon and service keys can therefore read nothing, even if one
leaks. Access is only ever server-side, over `DATABASE_URL`, which connects as
the table owner and bypasses RLS.

To apply the schema yourself instead of letting the app do it:

```bash
supabase db push          # or paste supabase/migrations/0001_init.sql
                          # into the SQL editor
```

## Before the site goes live

The copy is ready; fourteen operational details are not. They are listed on the
admin dashboard and must be confirmed by the property owner before launch —
among them the exact street address and Maps pin, check-in and check-out times,
occupancy and bed type per room, the children and cancellation policies, and
the exact spelling of the Seluhi room name.

Until occupancy and bed type are confirmed in `/admin`, the room pages simply
do not mention them, rather than publishing a placeholder as fact.
