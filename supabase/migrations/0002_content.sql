-- Editable site content.
--
-- The deck's words stay in src/lib/content/site.ts as the defaults. This table
-- holds only what the owner has since changed: one row per field, addressed by
-- its path through that file — 'home.heroTitle', 'about.paragraphs.1',
-- 'location.distances.0.name'. A missing row means "still as the deck wrote
-- it", so a fresh database renders the deck exactly.
--
-- Deriving the fields from the content file rather than a hand-kept list means
-- a new paragraph becomes editable the moment it is written.

-- An earlier design gave each repeatable list its own table. The path-addressed
-- rows above cover those too, and one mechanism is easier to trust than five.
drop table if exists hero_slides;
drop table if exists reasons;
drop table if exists distances;
drop table if exists amenities;

-- An interim version of this table carried label/page/section/kind columns and
-- was seeded with the deck's own wording, which under the design above would
-- read as if every field had been overridden. It is identifiable by its `label`
-- column; dropping it once is safe because it never held an actual edit. After
-- that the column is gone, so this never fires again and real edits are kept.
do $$
begin
	if exists (
		select 1 from information_schema.columns
		 where table_schema = 'public'
		   and table_name = 'content_blocks'
		   and column_name = 'label'
	) then
		drop table content_blocks;
	end if;
end $$;

create table if not exists content_blocks (
	key        text        primary key,
	value      text        not null,
	updated_at timestamptz not null default now()
);

-- Uploaded photographs. Kept in Postgres so the server stays stateless and no
-- second set of storage credentials is needed; served from /media/:id with a
-- long cache lifetime, and there are only ever a few dozen of them.
create table if not exists media (
	id           text        primary key,
	filename     text        not null,
	content_type text        not null,
	bytes        bytea       not null,
	byte_size    integer     not null,
	created_at   timestamptz not null default now()
);

alter table content_blocks enable row level security;
alter table media          enable row level security;
