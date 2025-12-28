// src/data/characterProfileBias.ts
import { ReactionAxis } from "@/types/reactionAxis"

export const characterProfileBias: Record<string, ReactionAxis[]> = {
  holmes: ["tension", "resonance", "distortion"],
  little_prince: ["transcendence", "resonance", "void"],
  izanami: ["collapse", "void", "transcendence"],
  yeti: ["void", "distortion"],
  square_flatland: ["distortion", "tension"],
  alice: ["distortion", "tension", "transcendence"],
  ludwig_ii: ["distortion", "void", "collapse"],
  kingyo_atai: ["void", "distortion", "transcendence"],
  snufkin: ["void", "tension"],
  honda_tadakatsu: ["resonance", "tension"],
  tinkerbell: ["distortion", "collapse"],
  ragnar: ["collapse", "resonance", "tension", "transcendence"],
  lupin: ["resonance", "tension"],
  puss_in_boots: ["resonance", "tension"],
  marie_antoinette: ["tension", "collapse"],
}
