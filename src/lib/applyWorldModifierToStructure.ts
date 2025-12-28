// src/lib/applyWorldModifierToStructure.ts

import type { StructuralState } from "@/types/StructuralState"
import type { WorldModifier, WorldModifierType } from "@/types/worldModifier"
import type { ReactionProfile } from "@/types/reactionProfile"

export function applyWorldModifier(
  state: StructuralState,
  modifier: WorldModifier,
  modifierId: WorldModifierType, // ← 追加（1点）
  reaction: ReactionProfile
): StructuralState {
  const functions = state.functions.map(fn => {
    switch (modifierId) {
      case "inversion":
        return { ...fn, polarity: fn.polarity * -1 }

      case "erosion":
        return { ...fn, weight: Math.max(0, fn.weight - reaction.collapse) }

      case "voidification":
        return { ...fn, active: false, weight: 0 }

      case "fixation":
        return { ...fn, weight: Math.max(fn.weight, reaction.tension) }

      case "distortion":
      case "observer_bias":
        return { ...fn, weight: fn.weight * (1 + reaction.distortion) }

      case "failed_transcendence":
        return { ...fn, weight: fn.weight * (1 - reaction.transcendence) }

      case "emergent_possibility":
        return { ...fn, weight: fn.weight * (1 + reaction.resonance) }

      default:
        return fn
    }
  })

  return {
    ...state,
    functions,
    paragraphs: state.paragraphs,
  }
}

