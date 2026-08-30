import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AI_COPY } from '@/constants/ai';
import type { SolderiPalette } from '@/constants/colors';
import { Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

const INPUT_LINE_HEIGHT = 22;

type AiCommandBarProps = {
  value: string;
  placeholder: string;
  disabled?: boolean;
  bottomInset: number;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

export function AiCommandBar({
  value,
  placeholder,
  disabled = false,
  bottomInset,
  onChangeText,
  onSubmit,
}: AiCommandBarProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [inputHeight, setInputHeight] = useState(INPUT_LINE_HEIGHT);
  const canSend = value.trim().length > 0 && !disabled;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const onPlaceholderControl = async (kind: 'camera' | 'voice') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void kind;
  };

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: keyboardOpen ? Spacing.xs : Math.max(bottomInset, Spacing.xs) },
      ]}>
      <View style={[styles.field, focused && styles.fieldFocused]}>
        <Pressable
          onPress={() => onPlaceholderControl('camera')}
          disabled={disabled}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={AI_COPY.attachPhoto}
          style={({ pressed }) => [styles.control, pressed && styles.controlPressed]}>
          <Ionicons name="camera-outline" size={22} color={colors.textSecondary} />
        </Pressable>

        <TextInput
          style={[styles.input, { height: inputHeight }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={(next) => {
            if (next.length === 0) setInputHeight(INPUT_LINE_HEIGHT);
            onChangeText(next);
          }}
          onContentSizeChange={(event) => {
            if (!value) {
              setInputHeight(INPUT_LINE_HEIGHT);
              return;
            }
            const nextHeight = Math.round(event.nativeEvent.contentSize.height);
            setInputHeight(Math.min(88, Math.max(INPUT_LINE_HEIGHT, nextHeight)));
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          maxLength={500}
          editable={!disabled}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={onSubmit}
        />

        <Pressable
          onPress={() => onPlaceholderControl('voice')}
          disabled={disabled}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={AI_COPY.voiceInput}
          style={({ pressed }) => [styles.control, pressed && styles.controlPressed]}>
          <Ionicons name="mic-outline" size={22} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.send, !canSend && styles.sendDisabled]}
          onPress={onSubmit}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send">
          <Ionicons name="arrow-up" size={16} color={colors.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    bar: {
      paddingHorizontal: Spacing.sm,
      paddingTop: Spacing.sm,
      backgroundColor: colors.background,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 50,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 28,
      paddingLeft: 6,
      paddingRight: 6,
      paddingVertical: 6,
    },
    fieldFocused: {
      borderColor: colors.accentBorder,
    },
    control: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlPressed: {
      opacity: 0.55,
    },
    input: {
      flex: 1,
      fontSize: 17,
      lineHeight: INPUT_LINE_HEIGHT,
      color: colors.textPrimary,
      paddingVertical: 0,
      paddingHorizontal: Spacing.xs,
    },
    send: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendDisabled: {
      opacity: 0.35,
    },
  });
}
