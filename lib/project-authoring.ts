import type { PhysicalEndpoint, WiringLayout } from '../constants/wiring-diagrams/types.ts'
import type { AuthoredWalkthroughStep, StepConnection } from '../constants/walkthrough-content.ts'
import { validateAssemblySequence } from './assembly-progress.ts'
import { componentKeyProblems } from './component-key.ts'
import { jumperInventory, validatePhysicalLayout } from './breadboard-layout.ts'
import { resolvePort } from './wiring-diagram.ts'

export type AuthoringGate =
  | 'hardware'
  | 'electrical'
  | 'code'
  | 'firmware'
  | 'instructions'
  | 'behaviour'
  | 'troubleshooting'
  | 'visual'
  | 'compatibility'
  | 'publication'

export type AuthoringFinding = {
  level: 'error' | 'review'
  gate: AuthoringGate
  message: string
}

export type AuthoringRequirement = {
  policy: 'exact' | 'direct' | 'conditional'
  approvedReviewIds: readonly string[]
}

export type AuthoredProjectInput = {
  slug: string
  title: string
  isPublished: boolean
  learningObjectives: readonly string[]
  coverPending: boolean
  bom: readonly { slug: string; quantity: number }[]
  catalogueIds: ReadonlySet<string>
  steps: readonly AuthoredWalkthroughStep[]
  connections: readonly StepConnection[]
  layout: WiringLayout | null
  firmware: string | null
  requirements: readonly AuthoringRequirement[]
  /**
   * `single-program` projects paste one firmware file.
   * `growing-sketches` projects show a new complete sketch at each code step.
   */
  codeStyle: 'single-program' | 'growing-sketches'
  compilation: 'not_run' | 'passed' | 'failed'
  hardwareTested: boolean
}

function connectionKey(row: StepConnection): string {
  return [row.fromComponent, row.fromPin, row.toComponent, row.toPin, row.signal ?? ''].join('|')
}

function bodyOf(block: AuthoredWalkthroughStep['blocks'][number]): string | null {
  if (block.type === 'components' || block.type === 'wiring' || block.type === 'connections' || block.type === 'image') {
    return null
  }
  if (block.type === 'troubleshooting') {
    return block.items.map((item) => `${item.problem} ${item.solution}`).join('\n')
  }
  if (block.type === 'code') {
    return block.code
  }
  return block.body
}

function isModuleEnd(end: PhysicalEndpoint): end is { kind: 'module'; elementId: string; portId: string } {
  return 'kind' in end && end.kind === 'module'
}

/** Servo motor current has to leave the breadboard and land on a named screw-terminal jack. */
function externalServoSupplyProblems(input: AuthoredProjectInput): string[] {
  if (!input.bom.some((item) => item.slug === 'gst18a05-p1j')) {
    return []
  }
  const layout = input.layout
  const physical = layout?.physical
  if (!layout || !physical) {
    return ['An external servo supply is on the BOM and the physical layout is missing.']
  }
  const jack = layout.elements.find((element) => element.kind === 'dc-jack')
  const catalogueId = jack?.identity?.catalogueId
  if (!jack || !catalogueId || !input.bom.some((item) => item.slug === catalogueId)) {
    return ['The external 5 V supply needs a screw-terminal jack on the diagram and on the BOM.']
  }
  const problems: string[] = []
  if (layout.elements.some((element) => element.kind === 'breadboard-psu')) {
    problems.push('The diagram still draws a breadboard power supply.')
  }
  let groundTied = false
  for (const jumper of physical.jumpers) {
    const ends = [jumper.from, jumper.to]
    const onJack = (portId: string) => ends.some((end) => isModuleEnd(end) && end.elementId === jack.id && end.portId === portId)
    const plusRail = ends.some((end) => !isModuleEnd(end) && end.kind === 'rail' && end.polarity === 'plus')
    const anyRail = ends.some((end) => !isModuleEnd(end) && end.kind === 'rail')
    const servoPower = ends.some(
      (end) => isModuleEnd(end) && (end.portId === 'vcc' || end.portId === 'gnd') && layout.elements.some((element) => element.id === end.elementId && element.kind === 'servo'),
    )
    if (onJack('5v') && plusRail) {
      problems.push('The adapter positive screw is tied to a breadboard positive rail.')
    }
    if (servoPower && plusRail) {
      problems.push(`${jumper.id} carries servo power onto a breadboard positive rail.`)
    }
    if (onJack('gnd') && anyRail) {
      groundTied = true
    }
    if (servoPower && !ends.some((end) => isModuleEnd(end) && end.elementId === jack.id)) {
      problems.push(`${jumper.id} does not land on the screw-terminal jack.`)
    }
  }
  if (!groundTied) {
    problems.push('The adapter ground screw is not tied to the controller ground.')
  }
  return problems
}

export function reviewAuthoredProject(input: AuthoredProjectInput): AuthoringFinding[] {
  const findings: AuthoringFinding[] = []
  const error = (gate: AuthoringGate, message: string) => findings.push({ level: 'error', gate, message })
  const review = (gate: AuthoringGate, message: string) => findings.push({ level: 'review', gate, message })

  if (!input.slug.trim() || !input.title.trim()) {
    error('instructions', 'The project needs a slug and a title.')
  }
  if (input.learningObjectives.some((item) => !item.trim())) {
    error('instructions', 'A learning objective is empty.')
  } else if (input.learningObjectives.length === 0) {
    review('instructions', 'Learning objectives are not in this local authoring file.')
  }
  if (input.bom.length === 0) {
    error('hardware', 'The bill of materials is empty.')
  }

  const bomSlugs = new Set<string>()
  for (const item of input.bom) {
    if (bomSlugs.has(item.slug)) {
      error('hardware', `BOM slug ${item.slug} is listed more than once.`)
    }
    bomSlugs.add(item.slug)
    if (!input.catalogueIds.has(item.slug)) {
      error('hardware', `BOM slug ${item.slug} is not in the component catalogue.`)
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      error('hardware', `BOM slug ${item.slug} needs a quantity of at least 1.`)
    }
  }

  if (input.steps.length === 0) {
    error('instructions', 'The walkthrough has no steps.')
  }
  const ordered = input.steps.slice().sort((a, b) => a.sortOrder - b.sortOrder)
  ordered.forEach((step, index) => {
    if (step.sortOrder !== index) {
      error('instructions', `Step sort order must be 0 through ${ordered.length - 1} without gaps.`)
    }
    if (!step.title.trim() || !step.description.trim() || !step.stageTitle.trim()) {
      error('instructions', `Step ${index + 1} needs a stage, heading, and description.`)
    }
    if (step.blocks.length === 0) {
      error('instructions', `Step ${index + 1} has no content blocks.`)
    }
    if (index > 0 && step.stageSortOrder < ordered[index - 1].stageSortOrder) {
      error('instructions', `Stage order goes backwards at step ${index + 1}.`)
    }
  })

  const stageTitles = new Map<number, string>()
  for (const step of ordered) {
    const existing = stageTitles.get(step.stageSortOrder)
    if (existing && existing !== step.stageTitle) {
      error('instructions', `Stage ${step.stageSortOrder} uses more than one title.`)
    }
    stageTitles.set(step.stageSortOrder, step.stageTitle)
  }

  const masterKeys = new Set(input.connections.map(connectionKey))
  const seenConnectionKeys = new Set<string>()
  for (const step of ordered) {
    for (const block of step.blocks) {
      const body = bodyOf(block)
      if (body != null && !body.trim()) {
        error('instructions', `Step “${step.title}” has an empty ${block.type} block.`)
      }
      if (block.type === 'components') {
        for (const item of block.items) {
          if (!bomSlugs.has(item.id)) {
            error('hardware', `Step “${step.title}” lists ${item.id}, which is not on the BOM.`)
          }
        }
      }
      if (block.type === 'image' && !block.imageKey?.trim()) {
        error('visual', `Step “${step.title}” has an image block without an image key.`)
      }
      if (block.type === 'troubleshooting') {
        for (const item of block.items) {
          if (!item.problem.trim() || !item.solution.trim()) {
            error('troubleshooting', `Step “${step.title}” has a troubleshooting row without a problem and a solution.`)
          }
        }
      }
      if (block.type === 'wiring') {
        for (const row of block.connections) {
          const key = connectionKey(row)
          seenConnectionKeys.add(key)
          if (!masterKeys.has(key)) {
            error('electrical', `Step “${step.title}” draws ${row.fromPin} to ${row.toPin}, which is not in the project connection list.`)
          }
        }
      }
      if (block.type === 'connections') {
        for (const row of block.rows) {
          const key = connectionKey(row)
          seenConnectionKeys.add(key)
          if (!masterKeys.has(key)) {
            error('electrical', `Step “${step.title}” lists ${row.fromPin} to ${row.toPin}, which is not in the project connection list.`)
          }
        }
      }
      if (block.type === 'code' && input.codeStyle === 'single-program') {
        if (input.firmware == null) {
          error('code', `Step “${step.title}” shows code, but this project has no firmware string to compare it with.`)
        } else if (!input.firmware.includes(block.code)) {
          error('code', `Step “${step.title}” shows code that is not in the project firmware.`)
        }
      }
    }
  }

  if (input.connections.length > 0) {
    if (!input.layout) {
      error('electrical', 'The project has wiring connections and no wiring-diagram layout.')
    } else {
      if (input.layout.slug !== input.slug) {
        error('electrical', 'The wiring-diagram layout slug does not match the project slug.')
      }
      for (const row of input.connections) {
        if (!resolvePort(input.layout, row.fromComponent, row.fromPin)) {
          error('electrical', `No diagram port matches ${row.fromComponent} ${row.fromPin}.`)
        }
        if (!resolvePort(input.layout, row.toComponent, row.toPin)) {
          error('electrical', `No diagram port matches ${row.toComponent} ${row.toPin}.`)
        }
        if (!seenConnectionKeys.has(connectionKey(row))) {
          error('electrical', `${row.fromPin} to ${row.toPin} is in the connection list and is not drawn in a step.`)
        }
      }
      for (const problem of validatePhysicalLayout(input.layout, input.connections)) {
        error('electrical', problem)
      }
      for (const problem of externalServoSupplyProblems(input)) {
        error('electrical', problem)
      }
      if (input.layout.physical) {
        const inventory = jumperInventory(input.layout.physical)
        const maleMale = input.bom.find((item) => item.slug === 'jumper-wires')?.quantity ?? 0
        const maleFemale = input.bom.find((item) => item.slug === 'jumper-male-female')?.quantity ?? 0
        if (maleMale !== inventory.maleMale) {
          error('hardware', `Male-to-male jumper quantity is ${maleMale} and the layout draws ${inventory.maleMale}.`)
        }
        if (maleFemale !== inventory.maleFemale) {
          error('hardware', `Male-to-female jumper quantity is ${maleFemale} and the layout draws ${inventory.maleFemale}.`)
        }
      }
      if (input.layout.physical) {
        for (const problem of validateAssemblySequence(input.layout, input.steps)) {
          error('instructions', problem)
        }
        for (const problem of componentKeyProblems(input.layout)) {
          error('instructions', problem)
        }
      }
    }
  }

  if (input.codeStyle === 'single-program' && input.firmware) {
    const pasted = input.steps.some((step) => step.blocks.some((block) => block.type === 'code' && block.code === input.firmware))
    if (!pasted) {
      error('code', 'The complete firmware is not pasted into a walkthrough step.')
    }
  }
  if (input.codeStyle === 'growing-sketches') {
    if (!input.firmware) {
      error('code', 'A growing-sketch project needs one authoritative final sketch.')
    } else {
      const codeBlocks = input.steps.flatMap((step) => step.blocks).filter((block) => block.type === 'code')
      const matches = codeBlocks.filter((block) => block.type === 'code' && block.code === input.firmware)
      if (matches.length !== 1) {
        error('code', 'The authoritative final sketch must appear once, unchanged, in the walkthrough.')
      }
      const finalIndex = codeBlocks.findIndex((block) => block.type === 'code' && block.code === input.firmware)
      codeBlocks.forEach((block, index) => {
        if (block.type !== 'code' || index <= finalIndex) {
          return
        }
        if (!input.firmware?.includes(block.code)) {
          error('code', 'A code block after the final sketch is not taken from that sketch.')
        }
      })
      const pins = [...input.firmware.matchAll(/^const int (\w+) = (\d+);/gm)]
      for (const block of codeBlocks) {
        if (block.type !== 'code' || block.code === input.firmware) {
          continue
        }
        for (const pin of pins) {
          const found = block.code.match(new RegExp(`const int ${pin[1]} = (\\d+);`))
          if (found && found[1] !== pin[2]) {
            error('code', `${pin[1]} is ${found[1]} in an earlier sketch and ${pin[2]} in the final sketch.`)
          }
        }
      }
    }
  }

  if (input.firmware && /map\s*\(/.test(input.firmware) && /DEADZONE/.test(input.firmware)) {
    error('behaviour', 'A deadzone around an absolute map() jumps the servo when the stick leaves the deadzone. Use a relative rate, or remove the hold-last-angle deadzone.')
  }
  if (JSON.stringify(input.steps).includes('slide the plastic housing')) {
    review('electrical', 'A Dupont pin clamped under a screw is not a verified servo-power connection.')
  }

  if (input.layout) {
    for (const element of input.layout.elements) {
      for (const catalogueId of [element.identity?.catalogueId, element.accessory?.catalogueId]) {
        if (catalogueId && !bomSlugs.has(catalogueId)) {
          error('hardware', `Diagram part ${element.label} uses ${catalogueId}, which is not on the BOM.`)
        }
      }
    }
  }

  if (input.bom.length > 0 && input.requirements.length !== input.bom.length) {
    error('compatibility', 'Every BOM line needs one compatibility requirement.')
  }
  for (const requirement of input.requirements) {
    if (requirement.policy === 'exact' && requirement.approvedReviewIds.length > 0) {
      error('compatibility', 'An exact requirement also lists approved substitution reviews.')
    }
    if (requirement.policy !== 'exact') {
      for (const reviewId of requirement.approvedReviewIds) {
        if (!reviewId.trim()) {
          error('compatibility', 'A substitution is marked approved without a review id.')
        }
      }
    }
  }

  if (input.coverPending) {
    review('visual', 'The photographic cover is still missing. Do not treat a placeholder or another project’s photo as the cover.')
  }
  if (input.compilation === 'not_run') {
    review('firmware', 'Firmware compilation has not been run. Do not report it as passed.')
  } else if (input.compilation === 'failed') {
    error('firmware', 'Firmware compilation failed.')
  }
  if (!input.hardwareTested) {
    review('behaviour', 'The build has not been run on the specified hardware. Expected behaviour is not the same as tested behaviour.')
  }
  review('publication', 'Populated fields, a passing structural check, and an unpublished flag do not make a project publication-ready.')

  return findings
}

export function authoringErrors(findings: readonly AuthoringFinding[]): AuthoringFinding[] {
  return findings.filter((finding) => finding.level === 'error')
}

export function publicationBlockers(input: AuthoredProjectInput, findings: readonly AuthoringFinding[]): string[] {
  const blockers = authoringErrors(findings).map((finding) => finding.message)
  if (input.coverPending) {
    blockers.push('The photographic cover is missing.')
  }
  if (input.compilation !== 'passed') {
    blockers.push('Firmware compilation has not passed.')
  }
  if (!input.hardwareTested) {
    blockers.push('The project has not been tested on the specified hardware.')
  }
  if (input.isPublished) {
    blockers.push('This check does not decide publication. Leave publishing to a separate review.')
  }
  return blockers
}
