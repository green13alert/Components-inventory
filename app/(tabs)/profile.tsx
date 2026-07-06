import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/ui/page-header';
import { ArduinoColors } from '@/constants/colors';
import { tabBarBottomPadding } from '@/constants/layout';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarBottomPadding(insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}>
        <PageHeader title="Profile" subtitle="Your maker stats and settings" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ArduinoColors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
});
