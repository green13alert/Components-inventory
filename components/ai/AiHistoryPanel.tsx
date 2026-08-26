import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AI_COPY, type ChatSession } from '@/constants/ai';
import { SolderiColors } from '@/constants/colors';
import { Radii, Spacing, Typography } from '@/constants/tokens';

type AiHistoryPanelProps = {
  sessions: ChatSession[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onClose: () => void;
};

export function AiHistoryPanel({
  sessions,
  activeId,
  onNewChat,
  onSelectChat,
  onClose,
}: AiHistoryPanelProps) {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable
        style={styles.scrim}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close chats"
      />
      <View style={styles.panel}>
        <Pressable
          onPress={onNewChat}
          accessibilityRole="button"
          accessibilityLabel={AI_COPY.newChat}
          style={({ pressed }) => [styles.newChat, pressed && styles.pressed]}>
          <View style={styles.newChatIcon}>
            <Ionicons name="add" size={18} color={SolderiColors.accent} />
          </View>
          <Text style={styles.newChatLabel}>{AI_COPY.newChat}</Text>
        </Pressable>

        <Text style={styles.section}>{AI_COPY.recent}</Text>
        <View style={styles.list}>
          {sessions.map((session) => {
            const selected = session.id === activeId;
            return (
              <Pressable
                key={session.id}
                onPress={() => onSelectChat(session.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.row,
                  selected && styles.rowSelected,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.rowTitle, selected && styles.rowTitleSelected]} numberOfLines={1}>
                  {session.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SolderiColors.overlayLight,
  },
  panel: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    backgroundColor: SolderiColors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SolderiColors.border,
    gap: Spacing.lg,
  },
  newChat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  newChatIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    backgroundColor: SolderiColors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: SolderiColors.textPrimary,
  },
  section: {
    ...Typography.sectionTitle,
    color: SolderiColors.textMuted,
  },
  list: {
    gap: 2,
  },
  row: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
  },
  rowSelected: {
    backgroundColor: SolderiColors.accentMuted,
  },
  rowTitle: {
    ...Typography.body,
    color: SolderiColors.textSecondary,
  },
  rowTitleSelected: {
    color: SolderiColors.textPrimary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.72,
  },
});
