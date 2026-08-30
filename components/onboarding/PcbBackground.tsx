import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { ONBOARDING_PCB_IMAGE } from '@/constants/onboarding';
import { useSolderiColors } from '@/context/theme-context';

type PcbBackgroundProps = {
  source?: ImageSource;
};

export function PcbBackground({ source = ONBOARDING_PCB_IMAGE }: PcbBackgroundProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const bg = colors.background;

  return (
    <View style={styles.layer} pointerEvents="none" accessibilityElementsHidden>
      <View style={styles.fallback} />
      <Image source={source} style={styles.image} contentFit="cover" />
      <LinearGradient
        colors={[`${bg}99`, `${bg}4D`, `${bg}A8`, `${bg}F2`]}
        locations={[0, 0.3, 0.58, 1]}
        style={styles.overlay}
      />
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    layer: {
      ...StyleSheet.absoluteFillObject,
    },
    fallback: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
    },
    image: {
      ...StyleSheet.absoluteFillObject,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },
  });
}
