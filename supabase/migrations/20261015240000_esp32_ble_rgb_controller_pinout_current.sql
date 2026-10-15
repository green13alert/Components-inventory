-- Correct the typical red-channel current for slug 24.
-- (4.7 - 2.2 - 0.2) / 220 is about 10.5 mA. Leaves the project unpublished.

update public.project_steps
set blocks = replace(blocks::text, 'about 10 mA', 'about 10.5 mA')::jsonb
where project_id = (select id from public.projects where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller')
  and blocks::text like '%about 10 mA%';

update public.projects
set is_published = false
where slug = '24' and title = 'ESP32 Bluetooth RGB LED Controller';
