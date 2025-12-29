// src/lib/collectMetrics.ts

import type { StructuralState } from "@/types/StructuralState"
import type { worldModifier } from "@/types/worldModifier"

export type StoryMetrics = {
  inactiveCount: number
  invertedCount: number
  avgWeight: number
  appliedModifiers: worldModifier[]
}

export function collectMetrics(
  state: StructuralState,
  modifiers: worldModifier[]
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
