import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';

type AuthTextFieldProps = {
  label: string;
  error?: string;
  disabled?: boolean;
  compact?: boolean;
} & TextInputProps;

export function AuthTextField({
  label,
  error,
  disabled = false,
  compact = false,
  value,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  ...inputProps
}: AuthTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = secureTextEntry === true;
  const filled = Boolean(value && String(value).length > 0);
  const hasError = Boolean(error);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && !hasError && styles.fieldFocused,
          filled && !focused && !hasError && styles.fieldFilled,
          hasError && styles.fieldError,
          disabled && styles.fieldDisabled,
        ]}>
        <TextInput
          {...inputProps}
          value={value}
          editable={!disabled}
          secureTextEntry={isPassword && !passwordVisible}
          placeholderTextColor={SolderiColors.textMuted}
          style={[styles.input, disabled && styles.inputDisabled, style]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setPasswordVisible((visible) => !visible)}
            disabled={disabled}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            style={styles.toggle}>
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={disabled ? SolderiColors.textMuted : SolderiColors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {hasError ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  wrapCompact: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SolderiColors.textPrimary,
  },
  labelDisabled: {
    color: SolderiColors.textMuted,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
  },
  fieldFocused: {
    borderColor: SolderiColors.accentBorder,
    backgroundColor: SolderiColors.surfaceElevated,
  },
  fieldFilled: {
    borderColor: SolderiColors.borderSubtle,
  },
  fieldError: {
    borderColor: SolderiColors.error,
    backgroundColor: SolderiColors.errorMuted,
  },
  fieldDisabled: {
    opacity: 0.55,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: SolderiColors.textPrimary,
    paddingVertical: Spacing.md,
  },
  inputDisabled: {
    color: SolderiColors.textMuted,
  },
  toggle: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    color: SolderiColors.error,
  },
});
