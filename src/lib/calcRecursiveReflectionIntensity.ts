// src/lib/calcRecursiveReflectionIntensity.ts

import type { ReactionProfile } from "@/data/sourceStories/types"

export function calcRecursiveReflectionIntensity(
  reaction: ReactionProfile
): number {
  return Math.min(
    1,
    reaction.distortion * 0.4 +
    reaction.resonance * 0.4 +
    reaction.collapse * 0.2
  )
}
