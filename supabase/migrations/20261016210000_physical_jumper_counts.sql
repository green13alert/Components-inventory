-- Count the individual jumper wires the four physical layouts actually use.
-- Slug 8 uses 10 male-to-male, slug 18 uses 16, and slug 24 uses 8.
-- Male-to-female counts on slugs 23 and 24 were already exact.

update public.project_components as line
set quantity = case projects.slug
  when '8' then 10
  when '18' then 16
  when '24' then 8
  else line.quantity
end
from public.projects as projects, public.components as components
where line.project_id = projects.id
  and line.component_id = components.id
  and components.slug = 'jumper-wires'
  and projects.slug in ('8', '18', '24');

update public.project_steps as step
set blocks = replace(
  step.blocks::text,
  '"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1',
  '"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":10'
)::jsonb
from public.projects as projects
where step.project_id = projects.id
  and projects.slug = '8'
  and step.blocks::text like '%"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1%';

update public.project_steps as step
set blocks = replace(
  step.blocks::text,
  '"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1',
  '"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":16'
)::jsonb
from public.projects as projects
where step.project_id = projects.id
  and projects.slug = '18'
  and step.blocks::text like '%"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1%';

update public.project_steps as step
set blocks = replace(
  step.blocks::text,
  '"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1',
  '"id":"jumper-wires","name":"Male-to-male jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":8'
)::jsonb
from public.projects as projects
where step.project_id = projects.id
  and projects.slug = '24'
  and step.blocks::text like '%"id":"jumper-wires","name":"Jumper wires","illustrationId":"jumper-wires","owned":false,"quantity":1%';

update public.project_steps as step
set blocks = replace(
  step.blocks::text,
  'The jumper-wire line is one pack. Take six male-to-male wires from it: three emitters, the LED anode, and one bridge on each of the + and − rails so the left and right rails are joined. Component leads do not reach a rail and a row at the same time.',
  'The parts list counts eight male-to-male wires: three emitters, the LED anode, one bridge on each of the + and − rails, the green link from b15 to j9, and the blue link from j12 to j8. A wire that arches over the board enters only the two holes named for it.'
)::jsonb
from public.projects as projects
where step.project_id = projects.id
  and projects.slug = '24'
  and step.blocks::text like '%Take six male-to-male wires%';

update public.project_steps as step
set blocks = replace(
  step.blocks::text,
  'The jumper-wire line is one pack. Take eight male-to-male wires from it:',
  'The parts list counts eight male-to-male wires:'
)::jsonb
from public.projects as projects
where step.project_id = projects.id
  and projects.slug = '24'
  and step.blocks::text like '%The jumper-wire line is one pack. Take eight male-to-male wires%';
