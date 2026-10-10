-- Traffic Light Simulator (slug 12): direct substitute for the series resistors only.
-- Canonical BOM component stays the generic resistor, quantity 3.
-- resistor-220 is approved for this requirement only.
-- This does not reuse or change the slug 11 review.
-- No walkthrough variants. No substitution change rows.
-- Does not modify project_components, inventory_items, project_steps,
-- component catalogue rows, publication status, or other projects.

do $$
declare
  missing text;
begin
  select string_agg(required.slug, ', ' order by required.slug)
  into missing
  from (
    values
      ('resistor'),
      ('resistor-220')
  ) as required(slug)
  where not exists (
    select 1 from public.components c where c.slug = required.slug
  );

  if missing is not null then
    raise exception 'traffic light resistor substitute missing catalogue slugs: %', missing;
  end if;

  if not exists (
    select 1
    from public.project_components pc
    join public.projects p on p.id = pc.project_id
    join public.components c on c.id = pc.component_id
    where p.slug = '12'
      and c.slug = 'resistor'
      and pc.quantity = 3
  ) then
    raise exception 'slug 12 is missing a generic resistor BOM line with quantity 3';
  end if;

  if not exists (
    select 1
    from public.components c
    join public.component_capabilities cap on cap.component_id = c.id
    where c.slug = 'resistor-220'
      and cap.capability = 'function'
      and cap.value = 'fixed_resistor'
  ) or not exists (
    select 1
    from public.components c
    join public.component_capabilities cap on cap.component_id = c.id
    where c.slug = 'resistor-220'
      and cap.capability = 'resistance_ohms'
      and cap.value = '220'
  ) then
    raise exception 'resistor-220 is missing fixed_resistor or resistance_ohms = 220';
  end if;

  if exists (
    select 1
    from public.project_requirements r
    join public.project_components pc on pc.id = r.project_component_id
    join public.projects p on p.id = r.project_id
    join public.components c on c.id = pc.component_id
    where p.slug = '12'
      and c.slug = 'resistor'
      and (
        r.role is distinct from 'series_resistor'
        or r.substitution_policy is distinct from 'direct'
      )
  ) then
    raise exception 'slug 12 resistor line already has a different requirement';
  end if;
end;
$$;

-- Requirement points at the existing generic resistor BOM line.
-- Quantity stays on project_components. Capability rows are not rewritten.
insert into public.project_requirements (
  project_id,
  project_component_id,
  role,
  substitution_policy,
  sort_order
)
select
  p.id,
  pc.id,
  'series_resistor',
  'direct',
  pc.sort_order
from public.projects p
join public.project_components pc on pc.project_id = p.id
join public.components c on c.id = pc.component_id
where p.slug = '12'
  and c.slug = 'resistor'
on conflict (project_component_id) do update
set
  role = excluded.role,
  substitution_policy = excluded.substitution_policy,
  sort_order = excluded.sort_order;

insert into public.project_requirement_constraints (requirement_id, capability, value)
select r.id, v.capability, v.value
from public.project_requirements r
join public.project_components pc on pc.id = r.project_component_id
join public.projects p on p.id = r.project_id
join public.components c on c.id = pc.component_id
cross join (
  values
    ('function', 'fixed_resistor'),
    ('resistance_ohms', '220')
) as v(capability, value)
where p.slug = '12'
  and c.slug = 'resistor'
  and r.role = 'series_resistor'
on conflict (requirement_id, capability, value) do nothing;

-- One direct review. No change rows: the traffic-light steps do not change.
insert into public.requirement_substitution_reviews (
  requirement_id,
  component_id,
  assessed_result,
  sort_order
)
select
  r.id,
  substitute.id,
  'direct',
  0
from public.project_requirements r
join public.project_components pc on pc.id = r.project_component_id
join public.projects p on p.id = r.project_id
join public.components canonical on canonical.id = pc.component_id
join public.components substitute on substitute.slug = 'resistor-220'
where p.slug = '12'
  and canonical.slug = 'resistor'
  and r.role = 'series_resistor'
on conflict (requirement_id, component_id) do update
set
  assessed_result = excluded.assessed_result,
  sort_order = excluded.sort_order;
