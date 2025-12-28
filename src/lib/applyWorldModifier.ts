// src/lib/applyWorldModifier.ts

import type { WorldModifier } from "@/types/worldModifier"
import type { ReactionAxis } from "@/types/reactionAxis"
import type { StructuralState } from "@/types/StructuralState"
import type { ReactionProfile } from "@/types/reactionProfile"

// Phase2: StructuralState × WorldModifier × ReactionProfile → StructuralState（構造のみ変形）
// 注意: ReactionProfile は「参照」するだけ, 文章量・ReactionProfile自体は変更しない
export function applyWorldModifier(
  state: StructuralState,
  modifier: WorldModifier,
  reaction: ReactionProfile
): StructuralState {
  const functions = state.functions.map(fn => {
    switch (modifier.type) {
      case "inversion":
        return {
          ...fn,
          polarity: fn.polarity * -1,
        }

      case "erosion":
        return {
          ...fn,
          weight: Math.max(0, fn.weight - reaction.collapse),
        }

      case "voidification":
        return {
          ...fn,
          active: false,
          weight: 0,
        }

      case "fixation":
        return {
          ...fn,
          weight: Math.max(fn.weight, reaction.tension),
        }

      case "distortion":
      case "observer_bias":
        return {
          ...fn,
          weight: fn.weight * (1 + reaction.distortion),
        }

      case "failed_transcendence":
        return {
          ...fn,
          weight: fn.weight * (1 - reaction.transcendence),
        }

      case "emergent_possibility":
        return {
          ...fn,
          weight: fn.weight * (1 + reaction.resonance),
        }

      default:
        return fn
    }
  })

  return {
    ...state,
    functions,
    // 文章は一切増やさない・触らない
    paragraphs: state.paragraphs,
  }
}
