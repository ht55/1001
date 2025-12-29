// src/lib/getDominantAxis.ts

import { ReactionProfile, ReactionAxis } from "@/types/reactionProfile"

export function getDominantAxis(profile: ReactionProfile): ReactionAxis {
  return (Object.entries(profile)
    .sort((a, b) => b[1] - a[1])[0][0]) as ReactionAxis
}
