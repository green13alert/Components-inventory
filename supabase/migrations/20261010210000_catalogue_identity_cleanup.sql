-- Catalogue identity cleanup for two database names.
-- Aliases are not stored on public.components.
-- Does not insert or delete components.
-- Does not change ids, slugs, categories, inventory, BOMs, or reviews.
--
-- ESP8266 stays the generic row. Its description no longer says "module",
-- which was the only word leaning toward an ESP-01. ESP-01 and NodeMCU
-- are not assigned.
-- The motion-alarm steps call the catalogue buzzer an active buzzer and
-- drive it with digitalWrite. The stored name now says that.

update public.components
set description = 'Wi-Fi microcontroller'
where slug = 'esp8266'
  and description is distinct from 'Wi-Fi microcontroller';

update public.components
set
  name = 'Active buzzer',
  description = 'Active buzzer. A HIGH on the signal pin makes it sound.'
where slug = 'buzzer'
  and (
    name is distinct from 'Active buzzer'
    or description is distinct from 'Active buzzer. A HIGH on the signal pin makes it sound.'
  );
