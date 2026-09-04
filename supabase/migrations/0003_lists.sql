-- Repeatable content the owner can grow or shrink.
--
-- content_blocks addresses one string at a time, which is enough to reword an
-- existing item but cannot add a seventh reason or drop a distance. A row here
-- overrides a whole array — 'home.why', 'location.distances',
-- 'amenities.groups.0.items' — with the list as it now stands. No row means
-- the deck's own list is used.
create table if not exists content_lists (
	path       text        primary key,
	items      jsonb       not null,
	updated_at timestamptz not null default now()
);

alter table content_lists enable row level security;
