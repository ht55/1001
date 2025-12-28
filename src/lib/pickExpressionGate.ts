// src/lib/pickExpressionGate.ts

import { ReactionAxis } from "@/types/reactionProfile"

type Sense = "vision" | "hearing" | "smell" | "touch" | "sixth"

export function pickExpressionGate(profile: ReactionAxis) {
  const senseMap: Record<ReactionAxis, Sense[]> = {
    distortion: ["vision", "touch"],
    tension: ["hearing", "sixth"],
    void: ["smell"],
    collapse: ["touch"],
    transcendence: ["vision", "sixth"],
    resonance: ["hearing"]
  }

  const senses = senseMap[profile]
  const sense = senses[Math.floor(Math.random() * senses.length)]

  return {
    kind: "sense" as const,
    sense
  }
}
