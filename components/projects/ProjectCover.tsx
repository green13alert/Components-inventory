import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageContentFit, type ImageStyle } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { getProjectImage } from '@/constants/projects';
import { projectCoverIsPending } from '@/lib/project-navigation';

type ProjectCoverProps = {
  imageKey: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
};

export function ProjectCover({ imageKey, style, contentFit = 'cover' }: ProjectCoverProps) {
  if (projectCoverIsPending(imageKey)) {
    return <ProjectCoverPlaceholder style={style as StyleProp<ViewStyle>} />;
  }

  return <Image source={getProjectImage(imageKey)} style={style} contentFit={contentFit} transition={200} />;
}

function ProjectCoverPlaceholder({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[styles.placeholder, style]}
      accessibilityRole="image"
      accessibilityLabel="Cover photograph not yet added. Needs a 16:9 workbench photo of the finished build.">
      <Ionicons name="image-outline" size={22} color="#D4D4D4" />
      <Text style={styles.label} numberOfLines={2}>
        Photo needed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#3A3A3A',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'center',
    color: '#D4D4D4',
  },
});
