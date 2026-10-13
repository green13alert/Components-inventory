-- Slug 23 cover caption. The in-app cover is a pending workbench photograph,
-- not a drawing. Does not change is_published or any other project.

update public.project_steps as ps
set blocks = (
  select jsonb_agg(
    case
      when elem.block->>'type' = 'image'
        and elem.block->>'imageKey' = 'esp32WifiWeather'
      then jsonb_set(
        elem.block,
        '{caption}',
        to_jsonb(
          'The finished station is an ESP32 DevKit and a BME280 on a breadboard, powered from USB. The workbench photograph is not in the app yet. The wiring diagram is the connection reference.'::text
        )
      )
      else elem.block
    end
    order by elem.ordinality
  )
  from jsonb_array_elements(ps.blocks) with ordinality as elem(block, ordinality)
)
from public.projects as p
where ps.project_id = p.id
  and p.slug = '23'
  and p.title = 'ESP32 Wi-Fi Weather Station';
