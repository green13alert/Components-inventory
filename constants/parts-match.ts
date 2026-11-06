/** A full parts match is the listed catalogue rows only. It is not a hardware test. */
export const LISTED_PARTS_COMPLETE = 'You have every listed component.';

export function listedPartsLabel(percent: number, ownedCount: number, totalRequired: number): string {
  return `${Math.round(percent)}% of listed parts · ${ownedCount}/${totalRequired} available`;
}
