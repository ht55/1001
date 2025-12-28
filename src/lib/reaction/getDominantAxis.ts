// src/lib/reaction/getDominantAxis.ts
import type { ReactionProfile } from "@/types/reactionProfile"

export function getDominantAxis(profile: ReactionProfile) {
  return (Object.entries(profile)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "void") as keyof ReactionProfile
}
