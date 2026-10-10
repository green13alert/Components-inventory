-- Phase A batch 1 catalogue rows.
-- Eighteen new components. Existing slugs, inventory, BOMs, and reviews are untouched.
-- Resistor resistance is the known identity. Wattage and tolerance are not stored.
-- No substitution reviews.

insert into public.components (name, category, description, slug)
values
  ('100 Ω resistor', 'modules', '100 Ω through-hole resistor', 'resistor-100'),
  ('330 Ω resistor', 'modules', '330 Ω through-hole resistor', 'resistor-330'),
  ('470 Ω resistor', 'modules', '470 Ω through-hole resistor', 'resistor-470'),
  ('1 kΩ resistor', 'modules', '1 kΩ through-hole resistor', 'resistor-1k'),
  ('2.2 kΩ resistor', 'modules', '2.2 kΩ through-hole resistor', 'resistor-2k2'),
  ('4.7 kΩ resistor', 'modules', '4.7 kΩ through-hole resistor', 'resistor-4k7'),
  ('10 kΩ resistor', 'modules', '10 kΩ through-hole resistor', 'resistor-10k'),
  ('47 kΩ resistor', 'modules', '47 kΩ through-hole resistor', 'resistor-47k'),
  ('100 kΩ resistor', 'modules', '100 kΩ through-hole resistor', 'resistor-100k'),
  ('100 nF ceramic capacitor', 'modules', '100 nF ceramic capacitor', 'capacitor-100nf'),
  ('10 µF electrolytic capacitor', 'modules', '10 µF polarised electrolytic capacitor', 'capacitor-10uf'),
  ('100 µF electrolytic capacitor', 'modules', '100 µF polarised electrolytic capacitor', 'capacitor-100uf'),
  ('Tactile push button', 'modules', 'Momentary push button', 'button-tactile'),
  ('10 kΩ potentiometer', 'modules', '10 kΩ potentiometer, distinct from a fixed 10 kΩ part', 'potentiometer-10k'),
  ('AI-Thinker ESP32-CAM', 'microcontrollers', 'Camera development board, not an ESP32 DevKit', 'esp32-cam'),
  ('Raspberry Pi Pico W', 'microcontrollers', 'RP2040 microcontroller board with wireless', 'raspberry-pi-pico-w'),
  ('Raspberry Pi 4 Model B', 'computers', 'Linux single-board computer, RAM size not specified', 'raspberry-pi-4'),
  ('Raspberry Pi 5', 'computers', 'Linux single-board computer, not interchangeable with another Pi model', 'raspberry-pi-5')
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description;

insert into public.component_capabilities (component_id, capability, value)
select c.id, v.capability, v.value
from public.components c
join (
  values
    ('resistor-100', 'function', 'fixed_resistor'),
    ('resistor-100', 'resistance_ohms', '100'),
    ('resistor-330', 'function', 'fixed_resistor'),
    ('resistor-330', 'resistance_ohms', '330'),
    ('resistor-470', 'function', 'fixed_resistor'),
    ('resistor-470', 'resistance_ohms', '470'),
    ('resistor-1k', 'function', 'fixed_resistor'),
    ('resistor-1k', 'resistance_ohms', '1000'),
    ('resistor-2k2', 'function', 'fixed_resistor'),
    ('resistor-2k2', 'resistance_ohms', '2200'),
    ('resistor-4k7', 'function', 'fixed_resistor'),
    ('resistor-4k7', 'resistance_ohms', '4700'),
    ('resistor-10k', 'function', 'fixed_resistor'),
    ('resistor-10k', 'resistance_ohms', '10000'),
    ('resistor-47k', 'function', 'fixed_resistor'),
    ('resistor-47k', 'resistance_ohms', '47000'),
    ('resistor-100k', 'function', 'fixed_resistor'),
    ('resistor-100k', 'resistance_ohms', '100000')
) as v(slug, capability, value) on v.slug = c.slug
on conflict (component_id, capability, value) do update
set value = excluded.value;
