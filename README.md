# Kilimanjaro Pazuri

Website and lightweight enquiry manager for Kilimanjaro Pazuri, a boutique villa in Moshi, Tanzania.

## Stack

- SvelteKit 2 and Svelte 5
- TypeScript
- SQLite via `better-sqlite3`
- Node adapter for production

## Local development

```sh
npm install
cp .env.example .env
npm run dev
```

The site is available at `http://localhost:5173` by default.

## Environment

Set these values in `.env`:

```env
DATABASE_PATH=data/kilimanjaro-pazuri.db
ADMIN_USERNAME=pazuri
ADMIN_PASSWORD_HASH=generate-with-npm-run-hash-password
```

Generate an admin password hash with:

```sh
npm run hash-password -- "your password"
```

Copy the printed value into `ADMIN_PASSWORD_HASH`. The local `.env` and SQLite data directory are intentionally excluded from Git.

## Validation and production

```sh
npm run check
npm run build
npm run start
```

`npm run start` serves the Node production build using the values in `.env`.
