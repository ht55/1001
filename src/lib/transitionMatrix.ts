// src/lib/transitionMatrix.ts

import type { ReactionAxis } from "@/types/reactionProfile"
import type { situationCategoryId } from "@/situations/situationCategories"

export type Transition =
  | "stabilize"
  | "amplify"
  | "destabilize"
  | "collapse"
  | "fix"
  | "invert"

export const TRANSITION_MATRIX: Record<
  situationCategoryId,
  Record<ReactionAxis, Transition>
> = {
  crowded: {
    resonance: "stabilize",
    tension: "amplify",
    distortion: "destabilize",
    collapse: "collapse",
    void: "fix",
    transcendence: "invert",
  },
  nature: {
    resonance: "stabilize",
    tension: "amplify",
    distortion: "amplify",
    collapse: "collapse",
    void: "fix",
    transcendence: "invert",
  },
  closed: {
    resonance: "fix",
    tension: "amplify",
    distortion: "destabilize",
    collapse: "collapse",
    void: "fix",
    transcendence: "invert",
  },
  boundary: {
    resonance: "destabilize",
    tension: "amplify",
    distortion: "amplify",
    collapse: "collapse",
    void: "fix",
    transcendence: "invert",
  },
  daily_shift: {
    resonance: "fix",
    tension: "amplify",
    distortion: "destabilize",
    collapse: "collapse",
    void: "fix",
    transcendence: "invert",
  },
  outsider: {
    resonance: "destabilize",
    tension: "amplify",
    distortion: "amplify",
    collapse: "collapse",
    void: "fix",
    transcendence: "invert",
  },
}
