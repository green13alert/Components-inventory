import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsRow } from '@/components/profile/SettingsRow';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { SettingsSelectModal } from '@/components/profile/SettingsSelectModal';
import { AUTH_ERRORS } from '@/constants/auth';
import type { SolderiPalette, ThemePreference } from '@/constants/colors';
import { useAuth } from '@/context/auth-context';
import { useSolderiTheme } from '@/context/theme-context';

const THEME_OPTIONS = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const;

const UNIT_OPTIONS = [
  { id: 'metric', label: 'Metric' },
  { id: 'imperial', label: 'Imperial' },
] as const;

function unavailable(title: string) {
  Alert.alert(title, 'This will be available in a future update.');
}

export function SettingsPanel() {
  const router = useRouter();
  const { signOut } = useAuth();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const { preference, resolvedScheme, colors, setPreference } = useSolderiTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [units, setUnits] = useState<(typeof UNIT_OPTIONS)[number]['id']>('metric');
  const [unitsPickerOpen, setUnitsPickerOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [signingOut, setSigningOut] = useState(false);

  const themeLabel = THEME_OPTIONS.find((option) => option.id === preference)?.label ?? 'Dark';
  const unitsLabel = UNIT_OPTIONS.find((option) => option.id === units)?.label ?? 'Metric';

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'You will need to log in again to access your workshop.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (signingOut) {
              return;
            }

            setSigningOut(true);
            const result = await signOut();
            setSigningOut(false);

            if (result.error) {
              Alert.alert('Sign out', AUTH_ERRORS.signOutFailed);
              return;
            }

            router.replace('/onboarding/login');
          })();
        },
      },
    ]);
  };

  const showLanguagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'English'],
          cancelButtonIndex: 0,
          userInterfaceStyle: resolvedScheme,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) setLanguage('English');
        },
      );
      return;
    }

    Alert.alert('Language', undefined, [
      { text: 'English', onPress: () => setLanguage('English') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const showAboutSolderi = () => {
    Alert.alert(
      'About Solderi',
      'Solderi is a workshop for electronics makers. Track components, follow build guides, and keep your projects organised.',
    );
  };

  return (
    <View style={styles.list}>
      <SettingsSection title="Appearance">
        <SettingsRow
          grouped
          icon="moon-outline"
          label="Theme"
          value={themeLabel}
          onPress={() => setThemePickerOpen(true)}
        />
      </SettingsSection>

      <SettingsSection title="Notifications">
        <SettingsRow
          grouped
          icon="notifications-outline"
          label="Notifications"
          subtitle="Manage your notification preferences"
          onPress={() => router.push('/settings/notifications')}
        />
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsRow
          grouped
          icon="person-outline"
          label="Edit Profile"
          onPress={() => unavailable('Edit Profile')}
        />
        <SettingsRow
          grouped
          icon="mail-outline"
          label="Change Email"
          onPress={() => unavailable('Change Email')}
        />
        <SettingsRow
          grouped
          icon="lock-closed-outline"
          label="Password & Security"
          onPress={() => unavailable('Password & Security')}
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsRow
          grouped
          icon="resize-outline"
          label="Units"
          value={unitsLabel}
          onPress={() => setUnitsPickerOpen(true)}
        />
        <SettingsRow
          grouped
          icon="globe-outline"
          label="Language"
          value={language}
          onPress={showLanguagePicker}
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsRow
          grouped
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => unavailable('Help & Support')}
        />
        <SettingsRow
          grouped
          icon="warning-outline"
          label="Report a Problem"
          onPress={() => unavailable('Report a Problem')}
        />
        <SettingsRow
          grouped
          icon="chatbubble-ellipses-outline"
          label="Send Feedback"
          onPress={() => unavailable('Send Feedback')}
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow
          grouped
          icon="information-circle-outline"
          label="About Solderi"
          onPress={showAboutSolderi}
        />
        <SettingsRow grouped icon="code-slash-outline" label="Version" value={appVersion} />
        <SettingsRow
          grouped
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => unavailable('Privacy Policy')}
        />
        <SettingsRow
          grouped
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => unavailable('Terms of Service')}
        />
      </SettingsSection>

      <Pressable
        style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}
        onPress={confirmSignOut}
        disabled={signingOut}
        accessibilityRole="button"
        accessibilityLabel="Sign Out"
        accessibilityState={{ disabled: signingOut, busy: signingOut }}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <SettingsSelectModal
        visible={themePickerOpen}
        title="Theme"
        options={THEME_OPTIONS}
        value={preference}
        onSelect={(id) => setPreference(id as ThemePreference)}
        onClose={() => setThemePickerOpen(false)}
      />
      <SettingsSelectModal
        visible={unitsPickerOpen}
        title="Units"
        options={UNIT_OPTIONS}
        value={units}
        onSelect={(id) => setUnits(id as typeof units)}
        onClose={() => setUnitsPickerOpen(false)}
      />
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    list: {
      gap: 22,
      paddingBottom: 12,
    },
    signOut: {
      marginTop: 40,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signOutPressed: {
      opacity: 0.72,
    },
    signOutText: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.error,
    },
  });
}
