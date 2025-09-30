begin;

-- Ensure only the desired six teams exist in public.teams
with desired(name) as (
  values
    ('Navgekar Stickers'),
    ('Pathak Panthers'),
    ('Joshi Warriors'),
    ('The Aurwadkars'),
    ('GUPTE GLADIATORS'),
    ('Brije Blasters')
)
-- Delete any teams not in the desired list
delete from public.teams t
where t.name not in (select name from desired);

-- Insert any missing desired teams with a sensible default for initial_points
insert into public.teams (id, name, initial_points, created_at, updated_at)
select gen_random_uuid(), d.name, 100000, now(), now()
from desired d
where not exists (
  select 1 from public.teams t where t.name = d.name
);

-- Normalize casing/spacing to exactly match desired names
update public.teams t
set name = d.name, updated_at = now()
from (
  values
    ('Navgekar Stickers'),
    ('Pathak Panthers'),
    ('Joshi Warriors'),
    ('The Aurwadkars'),
    ('GUPTE GLADIATORS'),
    ('Brije Blasters')
) as d(name)
where lower(t.name) = lower(d.name) and t.name <> d.name;

commit;

