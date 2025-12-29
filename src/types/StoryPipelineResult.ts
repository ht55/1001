// src/types/StoryPipelineResult.ts

import type { worldModifier } from "@/types/worldModifier"
import type { ReactionProfile } from "@/types/reactionProfile"

export type StoryPipelineResult = {
  prompt: string
  sourceId: string
  worldModifiers: worldModifier[]
  reactionProfile: ReactionProfile
}
