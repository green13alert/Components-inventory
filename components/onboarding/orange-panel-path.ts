import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Shallow arc from a large circle — sagitta controls curve depth. */
export const ORANGE_ARC_SAGITTA = 34;
export const ORANGE_ARC_RADIUS =
  (SCREEN_WIDTH * SCREEN_WIDTH) / (8 * ORANGE_ARC_SAGITTA) + ORANGE_ARC_SAGITTA / 2;

/** Closed path: shallow top arc + full-width body (same geometry for fill and clip). */
export function getOrangePanelPath(width: number, height: number) {
  const edgeY = ORANGE_ARC_SAGITTA;
  const r = ORANGE_ARC_RADIUS;

  return [
    `M 0 ${edgeY}`,
    `A ${r} ${r} 0 0 1 ${width} ${edgeY}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    'Z',
  ].join(' ');
}

export { SCREEN_WIDTH as ORANGE_PANEL_WIDTH };
