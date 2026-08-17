import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { ONBOARDING_PCB_IMAGE } from '@/constants/onboarding';

type PcbBackgroundProps = {
  source?: ImageSource;
};

export function PcbBackground({ source = ONBOARDING_PCB_IMAGE }: PcbBackgroundProps) {
  return (
    <View style={styles.layer} pointerEvents="none" accessibilityElementsHidden>
      <View style={styles.fallback} />
      <Image source={source} style={styles.image} contentFit="cover" />
      <LinearGradient
        colors={['#181B1E99', '#181B1E4D', '#181B1EA8', '#181B1EF2']}
        locations={[0, 0.3, 0.58, 1]}
        style={styles.overlay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SolderiColors.background,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
