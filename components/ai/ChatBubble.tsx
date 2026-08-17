import { StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type ChatBubbleProps = {
  message: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleAssistant: {
    backgroundColor: SolderiColors.surface,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    borderBottomLeftRadius: 6,
  },
  bubbleUser: {
    backgroundColor: SolderiColors.accent,
    borderBottomRightRadius: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: SolderiColors.textPrimary,
  },
  textUser: {
    color: SolderiColors.onAccent,
  },
});
