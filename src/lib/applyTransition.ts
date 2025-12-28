// src/lib/applyTransition.ts

import { ReactionAxis } from "@/types/reactionProfile"
import { SituationCategory } from "@/types/situationCategory"


export function applyTransition(
  profile: ReactionAxis,
  _situationId: string
) {
  switch (profile) {
    case "distortion":
      return "destabilize"
    case "tension":
      return "amplify"
    case "void":
      return "fix"
    case "collapse":
      return "collapse"
    case "transcendence":
      return "invert"
    case "resonance":
    default:
      return "stabilize"
  }
}

