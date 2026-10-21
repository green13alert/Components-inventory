-- The servo supply is a wall adapter, not a breadboard module with a rail LED.

update public.project_steps as step
set
  description = replace(step.description, 'Power the supply before you expect the servos to hold.', 'Plug in the GST18A05-P1J before you expect the servos to hold.'),
  blocks = replace(
    replace(
      step.blocks::text,
      'Then apply supply input and confirm the servo 5 V indicator (if it has one) is on.',
      'Then plug in the GST18A05-P1J.'
    ),
    'Apply supply power so the servos have 5V.',
    'Plug in the GST18A05-P1J so the servos have 5 V.'
  )::jsonb
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and (
    step.description like '%Power the supply before you expect the servos to hold.%'
    or step.blocks::text like '%apply supply input%'
    or step.blocks::text like '%Apply supply power%'
  );
