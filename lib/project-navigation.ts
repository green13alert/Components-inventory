import type { ProjectStatus } from '@/constants/projects-data';

/**
 * Walkthrough entry for every catalogue project, published or draft.
 * Project details already starts the build. The walkthrough route must not
 * ask for Start Building again. A project with no steps stays on the
 * coming-soon screen.
 */
export type BuildDestination = 'coming_soon' | 'walkthrough' | 'complete' | 'review_steps' | 'review_code';

const PROJECT_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Catalogue covers that still need a 16:9 workbench photograph. A diagram is not a substitute. */
export const PENDING_PROJECT_COVER_KEYS = ['esp32BleRgb'] as const;

export const WALKTHROUGH_BUTTON_MIN_HEIGHT = 52;
export const WALKTHROUGH_FOOTER_MIN_PADDING = 16;
export const WALKTHROUGH_SAVE_FAILED = 'Progress was not saved. You can keep reading.';

export type WalkthroughButtonPlacement = 'row' | 'standalone';

/**
 * Flex for a walkthrough button.
 * `flex: 1` inside a column stretches the button vertically. A row button
 * needs flexGrow 1 together with flexBasis 0. flexGrow 0 combined with
 * flexBasis 0 collapses the Next button to zero width.
 */
export function walkthroughButtonFlex(placement: WalkthroughButtonPlacement): {
  flexGrow: number;
  flexShrink: number;
  flexBasis: number | undefined;
  alignSelf: 'stretch' | 'auto';
  minHeight: number;
} {
  if (placement === 'row') {
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      alignSelf: 'auto',
      minHeight: WALKTHROUGH_BUTTON_MIN_HEIGHT,
    };
  }
  return {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: undefined,
    alignSelf: 'stretch',
    minHeight: WALKTHROUGH_BUTTON_MIN_HEIGHT,
  };
}

export function walkthroughFooterPadding(insetBottom: number): number {
  return Math.max(insetBottom, WALKTHROUGH_FOOTER_MIN_PADDING);
}

export function walkthroughFooterControls(input: {
  stepIndex: number;
  stepCount: number;
  reviewing: boolean;
}): {
  previousEnabled: boolean;
  nextLabel: 'Next Step' | 'Finish Project' | 'Done';
  nextEnabled: boolean;
} {
  const last = Math.max(0, input.stepCount - 1);
  const index = Math.min(Math.max(0, input.stepIndex), last);
  const atEnd = input.stepCount > 0 && index >= last;
  return {
    previousEnabled: index > 0,
    nextLabel: input.reviewing ? (atEnd ? 'Done' : 'Next Step') : atEnd ? 'Finish Project' : 'Next Step',
    nextEnabled: input.stepCount > 0,
  };
}

export function moveWalkthroughStep(current: number, direction: -1 | 1, stepCount: number): number {
  const last = Math.max(0, stepCount - 1);
  const index = Math.min(Math.max(0, Math.floor(current)), last);
  return Math.min(Math.max(0, index + direction), last);
}

export function walkthroughProgressPercent(stepIndex: number, stepCount: number, completed = false): number {
  if (stepCount <= 0) {
    return 0;
  }
  if (completed) {
    return 100;
  }
  const index = Math.min(Math.max(0, Math.floor(stepIndex)), stepCount - 1);
  return Math.round(((index + 1) / stepCount) * 100);
}

export function applyWalkthroughSave(input: {
  displayedStep: number;
  confirmedStep: number;
  saved: boolean;
}): { displayedStep: number; confirmedStep: number; notice: string | null } {
  if (input.saved) {
    return {
      displayedStep: input.displayedStep,
      confirmedStep: input.displayedStep,
      notice: null,
    };
  }
  return {
    displayedStep: input.displayedStep,
    confirmedStep: input.confirmedStep,
    notice: WALKTHROUGH_SAVE_FAILED,
  };
}

export const PENDING_PROJECT_COVER_CAPTION =
  'The workbench photograph is not in the app yet. The wiring diagram is the connection reference.';

export function projectCoverIsPending(imageKey: string): boolean {
  return (PENDING_PROJECT_COVER_KEYS as readonly string[]).includes(imageKey);
}

export function displayProjectCoverCaption(caption?: string): string {
  if (caption?.includes('not in the app yet')) {
    return caption;
  }
  return PENDING_PROJECT_COVER_CAPTION;
}

export function resolveBuildDestination(input: {
  stepCount: number;
  status: ProjectStatus;
  reviewingSteps: boolean;
  reviewingCode: boolean;
}): BuildDestination {
  if (input.stepCount <= 0) {
    return 'coming_soon';
  }
  if (input.status === 'completed' && input.reviewingCode) {
    return 'review_code';
  }
  if (input.status === 'completed' && input.reviewingSteps) {
    return 'review_steps';
  }
  if (input.status === 'completed') {
    return 'complete';
  }
  return 'walkthrough';
}

export function resolveCatalogueProjectId(
  idOrSlug: string,
  publishedProjects: readonly { id: string; slug: string }[],
  userProjectIds: readonly string[] = [],
): string | null {
  if (userProjectIds.includes(idOrSlug)) {
    return idOrSlug;
  }
  const byId = publishedProjects.find((project) => project.id === idOrSlug);
  if (byId) {
    return byId.id;
  }
  const bySlug = publishedProjects.find((project) => project.slug === idOrSlug);
  if (bySlug) {
    return bySlug.id;
  }
  // Detail and walkthrough screens pass the UUID they already loaded.
  // That includes an unpublished draft. A numeric slug is not an id.
  if (PROJECT_UUID.test(idOrSlug)) {
    return idOrSlug;
  }
  return null;
}
