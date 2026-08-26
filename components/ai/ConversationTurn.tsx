import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { type ChatMessage } from '@/constants/ai';
import { SolderiColors } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';

export type { ChatMessage };

type ConversationTurnProps = {
  message: ChatMessage;
  children?: ReactNode;
};

export function ConversationTurn({ message, children }: ConversationTurnProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.turn, isUser ? styles.turnUser : styles.turnAssistant]}>
      <Text style={styles.role}>{isUser ? 'You' : 'Solderi'}</Text>
      <Text style={[styles.body, isUser && styles.bodyUser]}>{message.content}</Text>
      {children ? <View style={styles.richSlot}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  turn: {
    gap: Spacing.xs,
  },
  turnUser: {
    alignItems: 'flex-end',
  },
  turnAssistant: {
    borderLeftWidth: 2,
    borderLeftColor: SolderiColors.accent,
    paddingLeft: Spacing.md,
  },
  role: {
    ...Typography.metadata,
    color: SolderiColors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  body: {
    ...Typography.body,
    color: SolderiColors.textPrimary,
  },
  bodyUser: {
    textAlign: 'right',
    color: SolderiColors.textSecondary,
    maxWidth: '86%',
  },
  richSlot: {
    marginTop: Spacing.sm,
  },
});
