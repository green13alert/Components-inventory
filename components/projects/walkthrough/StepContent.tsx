import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { WiringDiagram } from '@/components/projects/walkthrough/WiringDiagram';
import type { SolderiPalette } from '@/constants/colors';
import type { ProjectComponent } from '@/constants/projects-data';
import { Fonts } from '@/constants/theme';
import type { StepBlock, StepConnection, StepTroubleshootingItem } from '@/constants/walkthrough-content';
import { useSolderiColors } from '@/context/theme-context';

type StepContentProps = {
  blocks: StepBlock[];
};

function useStepTheme() {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

export function StepContent({ blocks }: StepContentProps) {
  const { styles } = useStepTheme();
  if (blocks.length === 0) return null;

  return (
    <View style={styles.stack}>
      {blocks.map((block, index) => (
        <StepBlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </View>
  );
}

function StepBlockView({ block }: { block: StepBlock }) {
  switch (block.type) {
    case 'text':
      return <TextBlock body={block.body} />;
    case 'image':
      return <ReferenceImage source={block.source} caption={block.caption} />;
    case 'wiring':
      return <WiringDiagram pair={block.pair} connections={block.connections} />;
    case 'connections':
      return <ConnectionsBlock rows={block.rows} summary={block.summary} />;
    case 'code':
      return (
        <CodeBlock
          language={block.language}
          filename={block.filename}
          libraries={block.libraries}
          code={block.code}
        />
      );
    case 'tip':
      return <Callout tone="tip" body={block.body} />;
    case 'warning':
      return <Callout tone="warning" body={block.body} />;
    case 'expected':
      return <ExpectedResult heading={block.heading} body={block.body} />;
    case 'troubleshooting':
      return <TroubleshootingBlock heading={block.heading} items={block.items} />;
    case 'components':
      return <ComponentsBlock items={block.items} />;
    default:
      return null;
  }
}

function TextBlock({ body }: { body: string }) {
  const { styles } = useStepTheme();
  return <Text style={styles.body}>{body}</Text>;
}

function SectionLabel({ children }: { children: string }) {
  const { styles } = useStepTheme();
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function ReferenceImage({ source, caption }: { source: ImageSource; caption?: string }) {
  const { styles } = useStepTheme();
  return (
    <View style={styles.imageBlock}>
      <Image source={source} style={styles.image} contentFit="cover" transition={200} />
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

function ConnectionsBlock({ rows, summary }: { rows: StepConnection[]; summary?: string }) {
  const { styles } = useStepTheme();
  return (
    <View style={styles.section}>
      <SectionLabel>Connections</SectionLabel>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      <View style={styles.connectionList}>
        {rows.map((row) => (
          <View key={`${row.fromComponent}-${row.fromPin}-${row.toPin}`} style={styles.connectionRow}>
            <Text style={styles.connectionPin}>{row.fromPin}</Text>
            <Text style={styles.connectionArrow}>→</Text>
            <Text style={styles.connectionPin}>{row.toPin}</Text>
            {summary ? null : (
              <Text style={styles.connectionHint} numberOfLines={1}>
                {row.fromComponent} · {row.toComponent}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

async function copyText(value: string) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function CodeBlock({
  language,
  filename,
  libraries,
  code,
}: {
  language: string;
  filename?: string;
  libraries?: string[];
  code: string;
}) {
  const { colors, styles } = useStepTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <View style={styles.section}>
      <SectionLabel>Code</SectionLabel>
      <View style={styles.codeShell}>
        <View style={styles.codeHeader}>
          <View style={styles.codeMeta}>
            <Text style={styles.language}>{language}</Text>
            {filename ? <Text style={styles.filename}>{filename}</Text> : null}
          </View>
          <Pressable
            onPress={handleCopy}
            style={styles.copyButton}
            accessibilityRole="button"
            accessibilityLabel="Copy code">
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={16}
              color={copied ? colors.success : colors.textSecondary}
            />
            <Text style={[styles.copyLabel, copied && styles.copyLabelDone]}>{copied ? 'Copied' : 'Copy'}</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.codeScroll}>
          <Text
            style={[
              styles.code,
              Platform.OS === 'web' ? ({ whiteSpace: 'pre' } as object) : null,
            ]}>
            {code}
          </Text>
        </ScrollView>
      </View>
      {libraries && libraries.length > 0 ? (
        <View style={styles.libraries}>
          <Text style={styles.librariesLabel}>Required libraries</Text>
          {libraries.map((library) => (
            <Text key={library} style={styles.libraryItem}>
              {library}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Callout({ tone, body }: { tone: 'tip' | 'warning'; body: string }) {
  const { colors, styles } = useStepTheme();
  const isWarning = tone === 'warning';
  return (
    <View style={[styles.callout, isWarning ? styles.calloutWarning : styles.calloutTip]}>
      <Ionicons
        name={isWarning ? 'warning-outline' : 'bulb-outline'}
        size={18}
        color={isWarning ? colors.error : colors.warning}
      />
      <View style={styles.calloutCopy}>
        <Text style={[styles.calloutTitle, isWarning ? styles.warningTitle : styles.tipTitle]}>
          {isWarning ? 'Warning' : 'Tip'}
        </Text>
        <Text style={[styles.calloutBody, isWarning ? styles.warningBody : styles.tipBody]}>{body}</Text>
      </View>
    </View>
  );
}

function ExpectedResult({ heading, body }: { heading?: string; body: string }) {
  const { styles } = useStepTheme();
  return (
    <View style={styles.section}>
      <SectionLabel>{heading ?? 'Expected result'}</SectionLabel>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

function TroubleshootingBlock({
  heading,
  items,
}: {
  heading?: string;
  items: StepTroubleshootingItem[];
}) {
  const { styles } = useStepTheme();
  return (
    <View style={styles.section}>
      <SectionLabel>{heading ?? 'Troubleshooting'}</SectionLabel>
      <View style={styles.troubleList}>
        {items.map((item) => (
          <View key={item.problem} style={styles.troubleItem}>
            <Text style={styles.troubleProblem}>{item.problem}</Text>
            <Text style={styles.troubleSolution}>{item.solution}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ComponentsBlock({ items }: { items: ProjectComponent[] }) {
  const { styles } = useStepTheme();
  return (
    <View style={styles.section}>
      <SectionLabel>Components</SectionLabel>
      <View style={styles.componentList}>
        {items.map((item) => (
          <View key={item.id} style={styles.componentRow}>
            <ComponentIllustration id={item.illustrationId} name={item.name} size={40} plate />
            <Text style={styles.componentName}>{item.name}</Text>
            <Text style={styles.componentQty}>×{item.quantity}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    stack: {
      gap: 22,
    },
    section: {
      gap: 10,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    body: {
      fontSize: 16,
      lineHeight: 26,
      color: colors.textSecondary,
    },
    imageBlock: {
      gap: 10,
    },
    image: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: 16,
      backgroundColor: colors.surfaceElevated,
    },
    caption: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
    },
    summary: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    connectionList: {
      gap: 0,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    connectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    connectionPin: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      minWidth: 40,
    },
    connectionArrow: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.accent,
    },
    connectionHint: {
      flex: 1,
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'right',
    },
    codeShell: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    codeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    codeMeta: {
      flex: 1,
      gap: 2,
    },
    language: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
      textTransform: 'uppercase',
    },
    filename: {
      fontSize: 12,
      color: colors.textMuted,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    copyLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    copyLabelDone: {
      color: colors.success,
    },
    codeScroll: {
      padding: 14,
    },
    code: {
      fontFamily: Fonts?.mono ?? 'monospace',
      fontSize: 12,
      lineHeight: 18,
      color: colors.textPrimary,
      flexShrink: 0,
    },
    libraries: {
      gap: 4,
    },
    librariesLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    libraryItem: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    callout: {
      flexDirection: 'row',
      gap: 12,
      borderRadius: 14,
      borderWidth: 1,
      padding: 14,
    },
    calloutTip: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accentBorder,
    },
    calloutWarning: {
      backgroundColor: colors.errorMuted,
      borderColor: 'rgba(248, 113, 113, 0.28)',
    },
    calloutCopy: {
      flex: 1,
      gap: 4,
    },
    calloutTitle: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    tipTitle: {
      color: colors.warning,
    },
    warningTitle: {
      color: colors.error,
    },
    calloutBody: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '500',
    },
    tipBody: {
      color: colors.warning,
    },
    warningBody: {
      color: colors.error,
    },
    troubleList: {
      gap: 16,
    },
    troubleItem: {
      gap: 4,
      paddingLeft: 12,
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
    },
    troubleProblem: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    troubleSolution: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSecondary,
    },
    componentList: {
      gap: 4,
    },
    componentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    componentName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    componentQty: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });
}
