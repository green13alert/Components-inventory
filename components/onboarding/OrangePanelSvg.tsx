import Svg, { Path } from 'react-native-svg';

import { getOrangePanelPath } from '@/components/onboarding/orange-panel-path';

type OrangePanelSvgProps = {
  width: number;
  height: number;
  color: string;
};

export function OrangePanelSvg({ width, height, color }: OrangePanelSvgProps) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Path d={getOrangePanelPath(width, height)} fill={color} />
    </Svg>
  );
}
