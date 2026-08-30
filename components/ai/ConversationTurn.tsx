import { type ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { type ChatMessage } from '@/constants/ai';
import type { SolderiPalette } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

export type { ChatMessage };

type ConversationTurnProps = {
  message: ChatMessage;
  children?: ReactNode;
};

export function ConversationTurn({ message, children }: ConversationTurnProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isUser = message.role === 'user';

  return (
    <View style={[styles.turn, isUser ? styles.turnUser : styles.turnAssistant]}>
      <Text style={styles.role}>{isUser ? 'You' : 'Solderi'}</Text>
      <Text style={[styles.body, isUser && styles.bodyUser]}>{message.content}</Text>
      {children ? <View style={styles.richSlot}>{children}</View> : null}
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    turn: {
      gap: Spacing.xs,
    },
    turnUser: {
      alignItems: 'flex-end',
    },
    turnAssistant: {
      borderLeftWidth: 2,
      borderLeftColor: colors.accent,
      paddingLeft: Spacing.md,
    },
    role: {
      ...Typography.metadata,
      color: colors.textMuted,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    body: {
      ...Typography.body,
      color: colors.textPrimary,
    },
    bodyUser: {
      textAlign: 'right',
      color: colors.textSecondary,
      maxWidth: '86%',
    },
    richSlot: {
      marginTop: Spacing.sm,
    },
  });
}
