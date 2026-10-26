export type DiagramPanel = 'none' | 'components' | 'connections'

export function toggleDiagramPanel(current: DiagramPanel, target: 'components' | 'connections'): DiagramPanel {
  return current === target ? 'none' : target
}

export type ViewerTransform = {
  scale: number
  x: number
  y: number
}

/** Panel changes never carry a new zoom or pan. */
export function panelTransition(transform: ViewerTransform, current: DiagramPanel, target: 'components' | 'connections') {
  return {
    transform,
    panel: toggleDiagramPanel(current, target),
  }
}
