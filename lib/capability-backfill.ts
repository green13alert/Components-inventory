/**
 * Capability and requirement rows for the authored projects.
 * A slug that is not a catalogue id joins to nothing. The 20261020210000
 * insert used the slug 'undefined' and stored no rows.
 */

export type CapabilityRow = {
  slug: string
  capability: string
  value: string
}

export type RequirementConstraintRow = {
  projectSlug: string
  componentSlug: string
  capability: string
  value: string
}

export const CAPABILITY_BACKFILL: CapabilityRow[] = [
  { slug: 'esp32-devkitc-v4', capability: 'function', value: 'development_board' },
  { slug: 'esp32-devkitc-v4', capability: 'logic_level_v', value: '3.3' },
  { slug: 'esp32-devkitc-v4', capability: 'programming_environment', value: 'arduino_ide' },
  { slug: 'esp32-devkitc-v4', capability: 'board_package', value: 'esp32' },
  { slug: 'esp32-devkitc-v4', capability: 'physical_form', value: 'male_header' },
  { slug: 'bme280', capability: 'function', value: 'bme280' },
  { slug: 'bme280', capability: 'interface', value: 'i2c' },
  { slug: 'bme280', capability: 'interface', value: 'spi' },
  { slug: 'stemma-qt-female', capability: 'physical_form', value: 'female_socket' },
  { slug: 'stemma-qt-cable', capability: 'physical_form', value: 'male_pin' },
  { slug: 'pir-sensor', capability: 'function', value: 'pir' },
  { slug: 'buzzer', capability: 'function', value: 'buzzer' },
  { slug: 'buzzer', capability: 'physical_form', value: 'three_pin_module' },
  { slug: 'sg90', capability: 'function', value: 'servo' },
  { slug: 'sg90', capability: 'servo_kind', value: 'position' },
  { slug: 'joystick', capability: 'function', value: 'joystick' },
  { slug: 'joystick', capability: 'supply_v', value: '5' },
  { slug: 'joystick', capability: 'physical_form', value: 'five_pin_male' },
  { slug: 'max7219', capability: 'function', value: 'led_matrix' },
  { slug: 'max7219', capability: 'supply_v', value: '5' },
  { slug: 'max7219', capability: 'interface', value: 'spi' },
  { slug: 'max7219', capability: 'physical_form', value: 'fc16_male_header' },
  { slug: 'gst18a05-p1j', capability: 'function', value: 'power_supply' },
  { slug: 'gst18a05-p1j', capability: 'supply_v', value: '5' },
  { slug: 'adafruit-368', capability: 'physical_form', value: 'screw_terminal_jack' },
  { slug: 'jumper-wires', capability: 'physical_form', value: 'male_male' },
  { slug: 'jumper-male-female', capability: 'physical_form', value: 'male_female' },
  { slug: 'rgb-led-ca', capability: 'function', value: 'rgb_led' },
  { slug: 'rgb-led-ca', capability: 'physical_form', value: 'common_anode' },
  { slug: 'rgb-led-cc', capability: 'function', value: 'rgb_led' },
  { slug: 'rgb-led-cc', capability: 'physical_form', value: 'common_cathode' },
  { slug: 'pn2222a', capability: 'function', value: 'npn_transistor' },
  { slug: 'pn2222a', capability: 'physical_form', value: 'to-92' },
  { slug: 'pn2222a', capability: 'physical_form', value: 'ebc' },
  { slug: 'resistor-220', capability: 'function', value: 'fixed_resistor' },
  { slug: 'resistor-220', capability: 'resistance_ohms', value: '220' },
  { slug: 'resistor-1k', capability: 'function', value: 'fixed_resistor' },
  { slug: 'resistor-1k', capability: 'resistance_ohms', value: '1000' },
]

export const REQUIREMENT_CONSTRAINT_BACKFILL: RequirementConstraintRow[] = [
  { projectSlug: '8', componentSlug: 'arduino-uno-r3', capability: 'function', value: 'development_board' },
  { projectSlug: '8', componentSlug: 'arduino-uno-r3', capability: 'logic_level_v', value: '5' },
  { projectSlug: '8', componentSlug: 'arduino-uno-r3', capability: 'header_profile', value: 'uno_r3' },
  { projectSlug: '8', componentSlug: 'pir-sensor', capability: 'function', value: 'pir' },
  { projectSlug: '8', componentSlug: 'buzzer', capability: 'function', value: 'buzzer' },
  { projectSlug: '8', componentSlug: 'buzzer', capability: 'physical_form', value: 'three_pin_module' },
  { projectSlug: '8', componentSlug: 'resistor-220', capability: 'resistance_ohms', value: '220' },
  { projectSlug: '8', componentSlug: 'jumper-wires', capability: 'physical_form', value: 'male_male' },
  { projectSlug: '18', componentSlug: 'arduino-uno-r3', capability: 'function', value: 'development_board' },
  { projectSlug: '18', componentSlug: 'arduino-uno-r3', capability: 'logic_level_v', value: '5' },
  { projectSlug: '18', componentSlug: 'arduino-uno-r3', capability: 'header_profile', value: 'uno_r3' },
  { projectSlug: '18', componentSlug: 'sg90', capability: 'function', value: 'servo' },
  { projectSlug: '18', componentSlug: 'sg90', capability: 'servo_kind', value: 'position' },
  { projectSlug: '18', componentSlug: 'joystick', capability: 'function', value: 'joystick' },
  { projectSlug: '18', componentSlug: 'adafruit-368', capability: 'physical_form', value: 'screw_terminal_jack' },
  { projectSlug: '18', componentSlug: 'gst18a05-p1j', capability: 'function', value: 'power_supply' },
  { projectSlug: '18', componentSlug: 'gst18a05-p1j', capability: 'supply_v', value: '5' },
  { projectSlug: '18', componentSlug: 'jumper-wires', capability: 'physical_form', value: 'male_male' },
  { projectSlug: '23', componentSlug: 'esp32-devkitc-v4', capability: 'function', value: 'development_board' },
  { projectSlug: '23', componentSlug: 'esp32-devkitc-v4', capability: 'logic_level_v', value: '3.3' },
  { projectSlug: '23', componentSlug: 'esp32-devkitc-v4', capability: 'board_package', value: 'esp32' },
  { projectSlug: '23', componentSlug: 'esp32-devkitc-v4', capability: 'physical_form', value: 'male_header' },
  { projectSlug: '23', componentSlug: 'bme280', capability: 'function', value: 'bme280' },
  { projectSlug: '23', componentSlug: 'bme280', capability: 'interface', value: 'i2c' },
  { projectSlug: '23', componentSlug: 'stemma-qt-female', capability: 'physical_form', value: 'female_socket' },
  { projectSlug: '24', componentSlug: 'esp32-devkitc-v4', capability: 'function', value: 'development_board' },
  { projectSlug: '24', componentSlug: 'esp32-devkitc-v4', capability: 'logic_level_v', value: '3.3' },
  { projectSlug: '24', componentSlug: 'esp32-devkitc-v4', capability: 'board_package', value: 'esp32' },
  { projectSlug: '24', componentSlug: 'esp32-devkitc-v4', capability: 'physical_form', value: 'male_header' },
  { projectSlug: '24', componentSlug: 'rgb-led-ca', capability: 'function', value: 'rgb_led' },
  { projectSlug: '24', componentSlug: 'rgb-led-ca', capability: 'physical_form', value: 'common_anode' },
  { projectSlug: '24', componentSlug: 'pn2222a', capability: 'function', value: 'npn_transistor' },
  { projectSlug: '24', componentSlug: 'pn2222a', capability: 'physical_form', value: 'to-92' },
  { projectSlug: '24', componentSlug: 'pn2222a', capability: 'physical_form', value: 'ebc' },
  { projectSlug: '24', componentSlug: 'resistor-220', capability: 'resistance_ohms', value: '220' },
  { projectSlug: '24', componentSlug: 'resistor-1k', capability: 'resistance_ohms', value: '1000' },
  { projectSlug: '24', componentSlug: 'jumper-wires', capability: 'physical_form', value: 'male_male' },
  { projectSlug: '24', componentSlug: 'jumper-male-female', capability: 'physical_form', value: 'male_female' },
  { projectSlug: '25', componentSlug: 'arduino-uno-r3', capability: 'function', value: 'development_board' },
  { projectSlug: '25', componentSlug: 'arduino-uno-r3', capability: 'logic_level_v', value: '5' },
  { projectSlug: '25', componentSlug: 'arduino-uno-r3', capability: 'header_profile', value: 'uno_r3' },
  { projectSlug: '25', componentSlug: 'max7219', capability: 'function', value: 'led_matrix' },
  { projectSlug: '25', componentSlug: 'max7219', capability: 'supply_v', value: '5' },
  { projectSlug: '25', componentSlug: 'max7219', capability: 'interface', value: 'spi' },
  { projectSlug: '25', componentSlug: 'max7219', capability: 'physical_form', value: 'fc16_male_header' },
  { projectSlug: '25', componentSlug: 'joystick', capability: 'function', value: 'joystick' },
  { projectSlug: '25', componentSlug: 'joystick', capability: 'supply_v', value: '5' },
  { projectSlug: '25', componentSlug: 'joystick', capability: 'physical_form', value: 'five_pin_male' },
  { projectSlug: '25', componentSlug: 'jumper-wires', capability: 'physical_form', value: 'male_male' },
  { projectSlug: '25', componentSlug: 'jumper-male-female', capability: 'physical_form', value: 'male_female' },
]

export function rowsJoinedToCatalogue<T extends { slug?: string; componentSlug?: string }>(
  rows: readonly T[],
  catalogueIds: ReadonlySet<string>,
): T[] {
  return rows.filter((row) => catalogueIds.has(row.slug ?? row.componentSlug ?? ''))
}

function sqlValue(value: string): string {
  return `'${value.replaceAll("'", "''")}'`
}

export function capabilityBackfillSql(): string {
  const capabilities = CAPABILITY_BACKFILL
    .map((row) => `  (${sqlValue(row.slug)}, ${sqlValue(row.capability)}, ${sqlValue(row.value)})`)
    .join(',\n')
  const requirements = REQUIREMENT_CONSTRAINT_BACKFILL
    .map((row) => `  (${sqlValue(row.projectSlug)}, ${sqlValue(row.componentSlug)}, ${sqlValue(row.capability)}, ${sqlValue(row.value)})`)
    .join(',\n')
  return `-- Backfill component capabilities and project requirement constraints.
-- Joins real catalogue slugs. A missing slug inserts nothing.
-- Does not change is_published or user_projects.current_step.

insert into public.component_capabilities (component_id, capability, value)
select component.id, spec.capability, spec.value
from (
  values
${capabilities}
) as spec(slug, capability, value)
join public.components as component on component.slug = spec.slug
on conflict (component_id, capability, value) do nothing;

insert into public.project_requirement_constraints (requirement_id, capability, value)
select requirement.id, spec.capability, spec.value
from (
  values
${requirements}
) as spec(project_slug, component_slug, capability, value)
join public.projects as project on project.slug = spec.project_slug
join public.components as component on component.slug = spec.component_slug
join public.project_components as line
  on line.project_id = project.id
  and line.component_id = component.id
join public.project_requirements as requirement on requirement.project_component_id = line.id
on conflict (requirement_id, capability, value) do nothing;
`
}
