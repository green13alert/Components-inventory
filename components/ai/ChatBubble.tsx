import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';

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
    backgroundColor: ArduinoColors.surface,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    borderBottomLeftRadius: 6,
  },
  bubbleUser: {
    backgroundColor: ArduinoColors.blue,
    borderBottomRightRadius: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: ArduinoColors.textPrimary,
  },
  textUser: {
    color: '#FFFFFF',
  },
});
