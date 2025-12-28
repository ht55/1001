import type { ReactionProfile } from "@/types/reactionProfile"
import type { WorldModifier, StructuralFunction } from "@/data/sourceStories/types"

export type PlannedMetrics = {
  requiredFunctions: StructuralFunction[]
  plannedModifiers: WorldModifier[]
  reactionProfile: ReactionProfile
}
