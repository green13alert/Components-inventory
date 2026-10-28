-- Plain-language overviews and step 1 introductions for slugs 8, 18, 23, 24, and 25.
-- Touches overview, description, and the first step's text only.
-- Does not change titles, difficulty, duration, publication, ids, step order, or RLS.

update public.projects
set overview = $overview$Build an alarm that notices when someone moves nearby. A light turns on and a buzzer sounds while the sensor still sees movement, then both switch off.$overview$
where slug = '8';

update public.projects
set
  description = $description$Aim a small camera mount with a joystick. Letting go holds the aim.$description$,
  overview = $overview$Build a mount you can aim with a joystick. Push the stick to pan and tilt, let go, and it holds that aim. You can put a light camera on the plate, or leave the plate empty. This project moves the mount — it does not record video.$overview$
where slug = '18';

update public.projects
set
  description = $description$See temperature, humidity, and air pressure on a page in your home Wi-Fi.$description$,
  overview = $overview$Build a small weather station you can open from a phone or computer on your home Wi-Fi. It shows temperature, humidity, and air pressure, and the numbers refresh on their own. Nothing is sent to an online account.$overview$
where slug = '23';

update public.projects
set
  description = $description$Change a light’s colour and brightness from your phone.$description$,
  overview = $overview$Build a colour light you control from your phone. Connect over Bluetooth, then mix red, green, and blue and change how bright it is. The light keeps the last colour when you disconnect.$overview$
where slug = '24';

update public.projects
set
  description = $description$Guide a glowing dot through five mazes with a joystick.$description$,
  overview = $overview$Build a miniature maze game on a grid of lights. Guide a glowing dot through five levels with a joystick, reach the finish, and see how long each level took.$overview$
where slug = '25';

update public.project_steps as step
set
  description = $description$When something moves nearby, a light and a buzzer turn on together.$description$,
  blocks = (
    select coalesce(jsonb_agg(
      case
        when item->>'type' = 'text' and item->>'heading' = 'What we''re building'
          then jsonb_set(item, '{body}', to_jsonb($body$The sensor watches the space in front of it. Movement turns the light and the buzzer on. They stay on while the sensor still reports movement, then switch off. You will connect the sensor, the light, and the buzzer, then upload a short sketch that joins them. The board is armed once that sketch finishes warming up. There is no separate arming switch.$body$::text))
        when item->>'type' = 'image'
          then jsonb_set(item, '{caption}', to_jsonb($caption$Finished motion alarm. The wiring steps place the sensor, the light, and the buzzer.$caption$::text))
        else item
      end
      order by ordinality
    ), '[]'::jsonb)
    from jsonb_array_elements(step.blocks) with ordinality as entry(item, ordinality)
  )
from public.projects as project
where step.project_id = project.id
  and project.slug = '8'
  and step.sort_order = 0;

update public.project_steps as step
set
  description = $description$A joystick aims a two-axis mount. Let go and the plate stays where you pointed it. This build does not record video.$description$,
  blocks = (
    select coalesce(jsonb_agg(
      case
        when item->>'type' = 'text' and item->>'heading' = 'What we''re building'
          then jsonb_set(item, '{body}', to_jsonb($body$You will assemble the bracket, connect the joystick, and upload a sketch. Push the stick to swing the plate left, right, up, or down. Release it and the plate holds. Mount a lightweight camera if you have one, or leave the plate empty while you learn the movement.$body$::text))
        when item->>'type' = 'image'
          then jsonb_set(item, '{caption}', to_jsonb($caption$Finished pan-tilt mount. Later steps name each wire.$caption$::text))
        else item
      end
      order by ordinality
    ), '[]'::jsonb)
    from jsonb_array_elements(step.blocks) with ordinality as entry(item, ordinality)
  )
from public.projects as project
where step.project_id = project.id
  and project.slug = '18'
  and step.sort_order = 0;

update public.project_steps as step
set
  description = $description$A desk sensor reports temperature, humidity, and air pressure to a page on your home Wi-Fi.$description$,
  blocks = (
    select coalesce(jsonb_agg(
      case
        when item->>'type' = 'text' and item->>'heading' = 'What you are building'
          then jsonb_set(item, '{body}', to_jsonb($body$You will connect the sensor with one cable, put your Wi-Fi name in the sketch, and upload it. A phone or computer on that same network opens a page and sees temperature in degrees Celsius, humidity in percent, and air pressure in hectopascals. The numbers refresh about every two seconds. Nothing is sent to an online account.$body$::text))
        when item->>'type' = 'image'
          then jsonb_set(item, '{caption}', to_jsonb($caption$Finished weather station, powered from USB. The wiring diagram is the connection reference.$caption$::text))
        else item
      end
      order by ordinality
    ), '[]'::jsonb)
    from jsonb_array_elements(step.blocks) with ordinality as entry(item, ordinality)
  )
from public.projects as project
where step.project_id = project.id
  and project.slug = '23'
  and step.sort_order = 0;

update public.project_steps as step
set
  blocks = (
    select coalesce(jsonb_agg(
      case
        when item->>'type' = 'text' and item->>'heading' = 'What you are building'
          then jsonb_set(item, '{body}', to_jsonb($body$A colour light you set from your phone. You will wire the light one colour at a time, upload a sketch, then connect with the nRF Connect app. The light starts red and dim, under the Bluetooth name Solderi RGB.$body$::text))
        when item->>'type' = 'text' and item->>'heading' = 'What it will do'
          then jsonb_set(item, '{body}', to_jsonb($body$From the phone you send a colour and a brightness. You can mix red, green, and blue — orange, purple, white, or off — and make the light brighter or dimmer. Disconnecting the phone leaves the last colour on.$body$::text))
        else item
      end
      order by ordinality
    ), '[]'::jsonb)
    from jsonb_array_elements(step.blocks) with ordinality as entry(item, ordinality)
  )
from public.projects as project
where step.project_id = project.id
  and project.slug = '24'
  and step.sort_order = 0;

update public.project_steps as step
set
  description = $description$A joystick moves a glowing dot through five mazes on a grid of lights.$description$,
  blocks = (
    select coalesce(jsonb_agg(
      case
        when item->>'type' = 'text' and item->>'heading' = 'The game'
          then jsonb_set(item, '{body}', to_jsonb($body$You guide one light through five mazes. Each maze is the same every time you play it. Walls stay lit, your dot blinks, and the finish winks more slowly. Push the stick to move one square. A wall or the edge of the grid blocks the move. Reaching the finish loads the next maze. The joystick button restarts the level you are on. After level 5, a light runs around the border, and the button starts again at level 1. The Serial Monitor shows how long each level took, and the total when you finish level 5. You will set the board beside the breadboard, connect the display and the joystick, and upload one sketch.$body$::text))
        else item
      end
      order by ordinality
    ), '[]'::jsonb)
    from jsonb_array_elements(step.blocks) with ordinality as entry(item, ordinality)
  )
from public.projects as project
where step.project_id = project.id
  and project.slug = '25'
  and step.sort_order = 0;
