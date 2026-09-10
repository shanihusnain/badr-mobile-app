export type CompletionRecitationProgress = {
  targetCompletions: number;
  completedCompletions: number;
};

const MOCK_COMPLETION_PROGRESS: CompletionRecitationProgress = {
  targetCompletions: 3,
  completedCompletions: 0,
};

export function getCompletionRecitationProgress(): CompletionRecitationProgress {
  return MOCK_COMPLETION_PROGRESS;
}

export function isCompletionGoalComplete(
  progress: CompletionRecitationProgress,
): boolean {
  return progress.completedCompletions >= progress.targetCompletions;
}

/** Returns 1-based current completion number, or null when the goal is complete. */
export function getCurrentCompletionNumber(
  progress: CompletionRecitationProgress,
): number | null {
  if (isCompletionGoalComplete(progress)) return null;
  return progress.completedCompletions + 1;
}
