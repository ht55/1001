// src/lib/applyTransition.ts

import { ReactionAxis } from "@/types/reactionProfile"

export function applyTransition(
  profile: ReactionAxis,
  _situationId: string
) {
  void _situationId

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

