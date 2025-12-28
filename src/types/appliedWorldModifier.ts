// src/types/appliedWorldModifier.ts

export type AppliedWorldModifier =
  | { type: "inversion" }
  | { type: "erosion" }
  | { type: "voidification" }
  | { type: "fixation" }
  | { type: "distortion" }
  | { type: "observer_bias" }
  | { type: "failed_transcendence" }
  | { type: "emergent_possibility" }
  | { type: "recursive_reflection"; intensity: number }
