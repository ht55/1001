// src/types/worldModifier.ts 

import type { ReactionAxis } from "@/types/reactionAxis"

export type WorldModifierType =
  | "distortion"
  | "inversion"
  | "fixation"
  | "erosion"
  | "voidification"
  | "failed_transcendence"
  | "observer_bias"
  | "emergent_possibility"

export interface WorldModifier {
  id: WorldModifierType      
  label: string
  description?: string
  effects?: Partial<Record<ReactionAxis, number>>
  transitionBias?: {
    toCollapse?: number
    toTranscendence?: number
    suppressExtremes?: boolean
  }
  notes?: string
}

