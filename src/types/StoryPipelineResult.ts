// src/types/StoryPipelineResult.ts

import type { WorldModifier } from "@/types/worldModifier"
import type { ReactionProfile } from "@/types/reactionProfile"

export type StoryPipelineResult = {
  prompt: string
  sourceId: string
  worldModifiers: WorldModifier[]
  reactionProfile: ReactionProfile
}
