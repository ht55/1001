// src/lib/buildFakerConstraints.ts
import type {
  StructuralState,
  WorldModifier,
} from "@/data/sourceStories/types"
import type { ReactionProfile } from "@/types/reactionProfile"
import type { VoiceKey } from "@/types/voiceKeys"

export type FakerConstraints = {
  sourceId: string
  structural_state: StructuralState[]
  world_modifiers: WorldModifier[]
  reaction_profile: ReactionProfile
  voice: VoiceKey
  slice: {
    target: number
    margin: number
  }
}

export function buildFakerConstraints(params: {
  sourceId: string
  structuralState: StructuralState[]
  worldModifiers: WorldModifier[]
  reactionProfile: ReactionProfile
  voice: VoiceKey
  slice?: { target: number; margin: number }
}): FakerConstraints {
  return {
    sourceId: params.sourceId,
    structural_state: params.structuralState,
    world_modifiers: params.worldModifiers,
    reaction_profile: params.reactionProfile,
    voice: params.voice,
    slice: params.slice ?? { target: 1200, margin: 300 },
  }
}
