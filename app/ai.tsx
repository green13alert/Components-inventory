import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatBubble, ChatMessage } from '@/components/ai/ChatBubble';
import { SuggestionChip } from '@/components/ai/SuggestionChip';
import { SolderiColors } from '@/constants/colors';

const SUGGESTIONS = [
  'What parts do I need for a weather station?',
  'Help me debug my LED circuit',
  'Suggest a beginner project with my inventory',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm Atlas AI, your Arduino building assistant. I can help with wiring, component selection, debugging, and project ideas based on your inventory. What are you working on?",
};

function getMockResponse(input: string): string {
  const query = input.toLowerCase();

  if (query.includes('weather')) {
    return 'For a basic weather station you\'ll need: Arduino Uno, DHT22 (temp/humidity), BMP280 (pressure), a 16x2 LCD or OLED display, breadboard, jumper wires, and a 10kΩ resistor. You already own 7 of 9 parts — you\'re missing the BMP280 and LCD.';
  }
  if (query.includes('led') || query.includes('debug')) {
    return 'Common LED issues: check polarity (long leg = anode/+), confirm you\'re using a 220Ω–330Ω resistor, verify the pin is set to OUTPUT in setup(), and make sure GND is connected. If it\'s dim, the resistor may be too large.';
  }
  if (query.includes('beginner') || query.includes('inventory') || query.includes('suggest')) {
    return 'Based on your inventory, I\'d recommend the Motion Sensor Alarm — you have 5 of 6 parts. It\'s a 1.5 hr beginner build and only needs a PIR sensor you don\'t have yet. Want me to list the full wiring steps?';
  }

  return 'Good question! I can help with component lists, wiring diagrams, code snippets, and troubleshooting. Try asking about a specific project or part you\'re stuck on.';
}

export default function AiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: getMockResponse(trimmed),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 900);
  };

  const showSuggestions = messages.length === 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={SolderiColors.textPrimary} />
          </Pressable>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={20} color={SolderiColors.accent} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Atlas AI</Text>
            <Text style={styles.headerSubtitle}>Your Arduino building assistant</Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          ItemSeparatorComponent={() => <View style={styles.messageGap} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            showSuggestions ? (
              <View style={styles.suggestions}>
                <Text style={styles.suggestionsLabel}>Try asking</Text>
                <View style={styles.suggestionChips}>
                  {SUGGESTIONS.map((suggestion) => (
                    <SuggestionChip
                      key={suggestion}
                      label={suggestion}
                      onPress={() => sendMessage(suggestion)}
                    />
                  ))}
                </View>
              </View>
            ) : isTyping ? (
              <View style={styles.typingRow}>
                <View style={styles.typingBubble}>
                  <Text style={styles.typingText}>Atlas AI is thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Ask about wiring, parts, or projects..."
              placeholderTextColor={SolderiColors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              editable={!isTyping}
            />
            <Pressable
              style={[styles.sendButton, (!input.trim() || isTyping) && styles.sendButtonDisabled]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              accessibilityRole="button"
              accessibilityLabel="Send message">
              <Ionicons name="arrow-up" size={20} color={SolderiColors.onAccent} />
            </Pressable>
          </View>
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
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: SolderiColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SolderiColors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SolderiColors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: SolderiColors.textSecondary,
  },
  messageList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  messageGap: {
    height: 12,
  },
  suggestions: {
    marginTop: 8,
    gap: 10,
  },
  suggestionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: SolderiColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionChips: {
    gap: 8,
  },
  typingRow: {
    marginTop: 4,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 14,
    color: SolderiColors.textMuted,
    fontStyle: 'italic',
  },
  inputBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: SolderiColors.border,
    backgroundColor: SolderiColors.background,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: SolderiColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: SolderiColors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SolderiColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
