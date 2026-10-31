import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg'

import type { SolderiPalette } from '@/constants/colors'
import { useSolderiColors } from '@/context/theme-context'
import { fitContentSize } from '@/lib/diagram-viewport'
import type { SchematicSheet, SchematicSymbol } from '@/lib/schematic-sheet'
import { ledDrawing } from '@/lib/schematic-symbols'

const PREVIEW_MAX_HEIGHT = 320

export function SchematicPreview({ sheet }: { sheet: SchematicSheet }) {
  const colors = useSolderiColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const [canvasWidth, setCanvasWidth] = useState(0)
  const fitted = fitContentSize(canvasWidth, PREVIEW_MAX_HEIGHT, sheet.width, sheet.height)

  return (
    <View style={styles.canvas} onLayout={(event) => setCanvasWidth(event.nativeEvent.layout.width)}>
      {sheet.verified ? (
        <View style={styles.previewFrame}>
          <View style={{ width: fitted.width, height: fitted.height }}>
            <SchematicDiagram sheet={sheet} />
          </View>
        </View>
      ) : (
        <SchematicNotice sheet={sheet} />
      )}
    </View>
  )
}

export function SchematicDiagram({ sheet }: { sheet: SchematicSheet }) {
  if (!sheet.verified) {
    return <SchematicNotice sheet={sheet} />
  }
  const ink = '#1C1E20'
  const paper = '#FCFAF6'
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${sheet.width} ${sheet.height}`}>
      <Rect x={0} y={0} width={sheet.width} height={sheet.height} fill={paper} />
      {sheet.symbols.map((symbol) => (
        <SymbolGlyph key={symbol.id} symbol={symbol} ink={ink} fill={paper} />
      ))}
      {sheet.wires.map((wire) => (
        <Path
          key={`${wire.netId}:${wire.points.map((point) => `${point.x},${point.y}`).join('-')}`}
          d={polyline(wire.points)}
          fill="none"
          stroke={ink}
          strokeWidth={1.75}
          strokeLinejoin="miter"
        />
      ))}
      {sheet.junctions.map((junction) => (
        <Path
          key={`${junction.netId}:${junction.x},${junction.y}`}
          d={`M ${junction.x - 3.5} ${junction.y} a 3.5 3.5 0 1 0 7 0 a 3.5 3.5 0 1 0 -7 0`}
          fill={ink}
        />
      ))}
      {sheet.labels.map((label) => (
        <SvgText
          key={`${label.text}:${label.x},${label.y}`}
          x={label.x + label.width / 2}
          y={label.y + 11}
          fill={ink}
          fontSize={12}
          fontWeight="700"
          textAnchor="middle">
          {label.text}
        </SvgText>
      ))}
    </Svg>
  )
}

export function SchematicNotice({ sheet }: { sheet: SchematicSheet }) {
  const colors = useSolderiColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>This schematic could not be checked against the circuit.</Text>
      {sheet.issues.map((issue) => (
        <Text key={`${issue.code}:${issue.message}`} style={styles.noticeBody}>
          {issue.message}
        </Text>
      ))}
    </View>
  )
}

function SymbolGlyph({ symbol, ink, fill }: { symbol: SchematicSymbol; ink: string; fill: string }) {
  if (symbol.kind === 'resistor') {
    return <ResistorGlyph symbol={symbol} ink={ink} fill={fill} />
  }
  if (symbol.kind === 'led') {
    return <LedGlyph symbol={symbol} ink={ink} />
  }
  if (symbol.kind === 'power') {
    return <PowerGlyph symbol={symbol} ink={ink} />
  }
  if (symbol.kind === 'ground') {
    return <GroundGlyph symbol={symbol} ink={ink} />
  }
  return <BlockGlyph symbol={symbol} ink={ink} fill={fill} />
}

function BlockGlyph({ symbol, ink, fill }: { symbol: SchematicSymbol; ink: string; fill: string }) {
  return (
    <G>
      <Rect x={symbol.x} y={symbol.y} width={symbol.width} height={symbol.height} fill={fill} stroke={ink} strokeWidth={1.75} />
      <SvgText x={symbol.x + symbol.width / 2} y={symbol.y + symbol.height / 2 - 4} fill={ink} fontSize={14} fontWeight="700" textAnchor="middle">
        {symbol.ref}
      </SvgText>
      {symbol.height >= 80 ? (
        <SvgText x={symbol.x + symbol.width / 2} y={symbol.y + symbol.height / 2 + 14} fill={ink} fontSize={12} textAnchor="middle">
          {symbol.value}
        </SvgText>
      ) : null}
      {symbol.kind === 'buzzer' ? <SounderMark symbol={symbol} ink={ink} /> : null}
      {symbol.pins.map((pin) => (
        <SvgText
          key={pin.portId}
          x={pinTextX(symbol, pin.x, pin.side)}
          y={pinTextY(symbol, pin.y, pin.side)}
          fill={ink}
          fontSize={12}
          fontWeight="700"
          textAnchor={pin.side === 'right' ? 'end' : 'start'}>
          {pin.label}
        </SvgText>
      ))}
    </G>
  )
}

function SounderMark({ symbol, ink }: { symbol: SchematicSymbol; ink: string }) {
  const x = symbol.x + 16
  const y = symbol.y + symbol.height - 24
  return (
    <G>
      <Path d={`M ${x} ${y + 12} Q ${x + 12} ${y} ${x} ${y - 12}`} fill="none" stroke={ink} strokeWidth={1.5} />
      <Path d={`M ${x + 7} ${y + 12} Q ${x + 19} ${y} ${x + 7} ${y - 12}`} fill="none" stroke={ink} strokeWidth={1.5} />
    </G>
  )
}

function ResistorGlyph({ symbol, ink, fill }: { symbol: SchematicSymbol; ink: string; fill: string }) {
  return <Rect x={symbol.x} y={symbol.y} width={symbol.width} height={symbol.height} fill={fill} stroke={ink} strokeWidth={1.75} />
}

function LedGlyph({ symbol, ink }: { symbol: SchematicSymbol; ink: string }) {
  const anode = symbol.pins.find((pin) => pin.portId === 'anode')
  const cathode = symbol.pins.find((pin) => pin.portId === 'cathode')
  const centerY = anode ? anode.y - symbol.y : symbol.height / 2
  const drawing = ledDrawing(symbol.width, centerY)
  const at = (point: { x: number; y: number }) => `${symbol.x + point.x} ${symbol.y + point.y}`
  const chain = (points: { x: number; y: number }[]) => points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${at(point)}`).join(' ')
  return (
    <G>
      <Path d={chain([drawing.anode, drawing.lead[0], drawing.lead[1], drawing.cathode])} fill="none" stroke={ink} strokeWidth={1.75} />
      <Path d={`${chain(drawing.triangle)} Z`} fill="none" stroke={ink} strokeWidth={1.75} strokeLinejoin="miter" />
      <Path d={chain(drawing.bar)} fill="none" stroke={ink} strokeWidth={1.75} />
      {drawing.arrows.map((arrow) => (
        <Path key={chain(arrow)} d={chain(arrow)} fill="none" stroke={ink} strokeWidth={1.5} strokeLinejoin="miter" />
      ))}
      {anode ? (
        <SvgText x={symbol.x + 2} y={anode.y - 4} fill={ink} fontSize={11} fontWeight="700">
          A
        </SvgText>
      ) : null}
      {cathode ? (
        <SvgText x={cathode.x - 4} y={cathode.y - 4} fill={ink} fontSize={11} fontWeight="700" textAnchor="end">
          K
        </SvgText>
      ) : null}
    </G>
  )
}

function PowerGlyph({ symbol, ink }: { symbol: SchematicSymbol; ink: string }) {
  return (
    <SvgText x={symbol.x + symbol.width / 2} y={symbol.y + 16} fill={ink} fontSize={13} fontWeight="700" textAnchor="middle">
      {symbol.value}
    </SvgText>
  )
}

function GroundGlyph({ symbol, ink }: { symbol: SchematicSymbol; ink: string }) {
  const anchor = symbol.anchor ?? { x: symbol.x + symbol.width / 2, y: symbol.y }
  const fromSide = anchor.x <= symbol.x + 1 || anchor.x >= symbol.x + symbol.width - 1
  if (fromSide) {
    const y = anchor.y
    const x = anchor.x <= symbol.x + 1 ? anchor.x : anchor.x - 16
    return (
      <G>
        <Line x1={x} y1={y} x2={x + 16} y2={y} stroke={ink} strokeWidth={1.75} />
        <Line x1={x + 4} y1={y + 5} x2={x + 12} y2={y + 5} stroke={ink} strokeWidth={1.75} />
        <Line x1={x + 7} y1={y + 9} x2={x + 9} y2={y + 9} stroke={ink} strokeWidth={1.75} />
      </G>
    )
  }
  const direction = anchor.y <= symbol.y + 1 ? 1 : -1
  return (
    <G>
      <Line x1={anchor.x - 12} y1={anchor.y} x2={anchor.x + 12} y2={anchor.y} stroke={ink} strokeWidth={1.75} />
      <Line x1={anchor.x - 8} y1={anchor.y + 6 * direction} x2={anchor.x + 8} y2={anchor.y + 6 * direction} stroke={ink} strokeWidth={1.75} />
      <Line x1={anchor.x - 4} y1={anchor.y + 12 * direction} x2={anchor.x + 4} y2={anchor.y + 12 * direction} stroke={ink} strokeWidth={1.75} />
    </G>
  )
}

function pinTextX(_symbol: SchematicSymbol, x: number, side: SchematicSymbol['pins'][number]['side']): number {
  if (side === 'right') {
    return x - 8
  }
  return x + 8
}

function pinTextY(symbol: SchematicSymbol, y: number, side: SchematicSymbol['pins'][number]['side']): number {
  if (side === 'up') {
    return y + 16
  }
  if (side === 'down') {
    return y - 8
  }
  return y + 4
}

function polyline(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    canvas: {
      paddingHorizontal: 8,
      paddingTop: 4,
      gap: 10,
    },
    previewFrame: {
      alignItems: 'center',
      overflow: 'hidden',
    },
    notice: {
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 14,
    },
    noticeTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    noticeBody: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
  })
}
