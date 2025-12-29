// src/lib/buildPlammedMetrics.ts

import type { ReactionProfile } from "@/types/reactionProfile"
import type { worldModifier } from "@/types/worldModifier"
import type { StructuralFunction } from "@/data/sourceStories/types"

export type PlannedMetrics = {
  requiredFunctions: StructuralFunction[]
  plannedModifiers: worldModifier[]
  reactionProfile: ReactionProfile
}
