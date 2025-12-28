// src/lib/collectMetrics.ts

import type {
  StructuralState,
  WorldModifier,
} from "@/data/sourceStories/types"

export type StoryMetrics = {
  inactiveCount: number
  invertedCount: number
  avgWeight: number
  appliedModifiers: WorldModifier[]
}

export function collectMetrics(
  state: StructuralState,
  modifiers: WorldModifier[]
): StoryMetrics {
  const { functions } = state

  const avgWeight =
    functions.reduce((a, f) => a + f.weight, 0) /
    Math.max(functions.length, 1)

  return {
    inactiveCount: functions.filter(f => !f.active).length,
    invertedCount: functions.filter(f => f.polarity === -1).length,
    avgWeight,
    appliedModifiers: modifiers,
  }
}
