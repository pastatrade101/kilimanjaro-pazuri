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
| `src/lib/server/` | The backend: SQLite schema and seed, queries, validation, sessions, rate limiting. |
| `src/routes/(site)/` | The seven public pages plus the six room pages. |
| `src/routes/api/` | JSON API: rooms, booking enquiries, contact, health. |
| `src/routes/admin/` | Enquiry inbox, room and rate editing, and the pre-launch checklist. |
| `static/assets/` | The template's CSS and icons, the brand layer, and the villa's own photographs. |
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
npm run hash-password -- "a password for the admin area"   # paste into .env
npm run dev
```

The database is created and seeded with the six rooms on first run.

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
| `ORIGIN` | in production | SvelteKit rejects every form POST with 403 without it. |
| `DATABASE_PATH` | yes | Where the SQLite file lives. Put it on a volume. |
| `ADMIN_USERNAME` | yes | Sign-in for `/admin`. |
| `ADMIN_PASSWORD_HASH` | yes | `salt:hash` from `npm run hash-password`. The plain password is never stored. |
| `ADDRESS_HEADER` / `XFF_DEPTH` | behind a proxy | Otherwise the rate limiter sees only the proxy, putting every visitor in one bucket. |
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

SQLite, on the `pazuri-data` volume (or `data/` under systemd). It holds the
rooms, the enquiries and the admin sessions. To back it up:

```bash
docker compose exec kilimanjaro-pazuri \
  node -e "require('better-sqlite3')(process.env.DATABASE_PATH).backup('/data/backup.db')"
```

## Before the site goes live

The copy is ready; fourteen operational details are not. They are listed on the
admin dashboard and must be confirmed by the property owner before launch —
among them the exact street address and Maps pin, check-in and check-out times,
occupancy and bed type per room, the children and cancellation policies, and
the exact spelling of the Seluhi room name.

Until occupancy and bed type are confirmed in `/admin`, the room pages simply
do not mention them, rather than publishing a placeholder as fact.
