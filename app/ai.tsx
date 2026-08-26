import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiCommandBar } from '@/components/ai/AiCommandBar';
import { AiHistoryPanel } from '@/components/ai/AiHistoryPanel';
import { AiNetworkVisual } from '@/components/ai/AiNetworkVisual';
import { ConversationTurn } from '@/components/ai/ConversationTurn';
import {
  AI_COPY,
  PLACEHOLDER_CHATS,
  type ChatMessage,
  type ChatSession,
} from '@/constants/ai';
import { SolderiColors } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';

function getMockResponse(input: string): string {
  const query = input.toLowerCase();

  if (query.includes('weather')) {
    return 'A compact weather station can start with temperature and humidity, then add pressure if you want a fuller reading. I can outline the sensors and wiring once you pick indoor or outdoor.';
  }
  if (query.includes('led') || query.includes('debug')) {
    return 'For a typical LED circuit I would check polarity first, confirm a 220Ω–330Ω resistor is in series, and verify the pin is set to OUTPUT.';
  }
  if (query.includes('esp32') || query.includes('temperature')) {
    return 'On ESP32, power the sensor from 3.3V, share ground, and use a free GPIO for data. I can map the pins once you choose the sensor.';
  }
  if (query.includes('robot') || query.includes('arm')) {
    return 'A small arm can begin with three servos and a simple gripper. Prove the base rotation first, then add reach.';
  }

  return 'Tell me what you are building and I can help with parts, wiring, or a first plan.';
}

function titleFromPrompt(input: string) {
  const trimmed = input.trim();
  if (trimmed.length <= 36) return trimmed;
  return `${trimmed.slice(0, 33).trim()}…`;
}

export default function AiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(PLACEHOLDER_CHATS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeId) ?? null,
    [activeId, sessions],
  );
  const messages = activeSession?.messages ?? [];
  const isEmpty = messages.length === 0;

  const closeMenu = () => setMenuOpen(false);

  const startNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveId(null);
    setInput('');
    setIsWorking(false);
    closeMenu();
  };

  const selectChat = (id: string) => {
    Haptics.selectionAsync();
    setActiveId(id);
    setInput('');
    setIsWorking(false);
    closeMenu();
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isWorking) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const sessionId = activeId ?? `chat-${Date.now()}`;
    const nextTitle = activeSession?.title ?? titleFromPrompt(trimmed);

    setSessions((prev) => {
      const existing = prev.find((session) => session.id === sessionId);
      if (existing) {
        return prev.map((session) =>
          session.id === sessionId
            ? { ...session, messages: [...session.messages, userMessage] }
            : session,
        );
      }
      return [{ id: sessionId, title: nextTitle, messages: [userMessage] }, ...prev];
    });
    setActiveId(sessionId);
    setInput('');
    setIsWorking(true);

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: getMockResponse(trimmed),
      };
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session,
        ),
      );
      setIsWorking(false);
    }, 900);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={SolderiColors.textPrimary} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{AI_COPY.title}</Text>
            <Text style={styles.headerSubtitle}>{AI_COPY.subtitle}</Text>
          </View>
          <Pressable
            style={styles.headerButton}
            onPress={() => {
              Haptics.selectionAsync();
              setMenuOpen((open) => !open);
            }}
            accessibilityRole="button"
            accessibilityLabel={AI_COPY.openChats}
            accessibilityState={{ expanded: menuOpen }}>
            <Ionicons
              name={menuOpen ? 'close' : 'menu-outline'}
              size={22}
              color={SolderiColors.textPrimary}
            />
          </Pressable>
        </View>

        <View style={styles.workspace}>
          {isEmpty ? (
            <View style={styles.empty}>
              <AiNetworkVisual />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ConversationTurn message={item} />}
              ItemSeparatorComponent={() => <View style={styles.turnGap} />}
              contentContainerStyle={styles.thread}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              ListFooterComponent={
                isWorking ? (
                  <View style={styles.working}>
                    <View style={styles.workingMark} />
                    <Text style={styles.workingText}>{AI_COPY.working}</Text>
                  </View>
                ) : (
                  <View style={styles.threadEnd} />
                )
              }
            />
          )}

          <AiCommandBar
            value={input}
            placeholder={AI_COPY.inputPlaceholder}
            disabled={isWorking}
            bottomInset={insets.bottom}
            onChangeText={setInput}
            onSubmit={() => sendMessage(input)}
          />

          {menuOpen ? (
            <AiHistoryPanel
              sessions={sessions}
              activeId={activeId}
              onNewChat={startNewChat}
              onSelectChat={selectChat}
              onClose={closeMenu}
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SolderiColors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    ...Typography.cardTitle,
    color: SolderiColors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: SolderiColors.textSecondary,
  },
  workspace: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thread: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  turnGap: {
    height: Spacing['2xl'],
  },
  working: {
    marginTop: Spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  workingMark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SolderiColors.accent,
  },
  workingText: {
    ...Typography.caption,
    color: SolderiColors.textMuted,
  },
  threadEnd: {
    height: Spacing.lg,
  },
});
