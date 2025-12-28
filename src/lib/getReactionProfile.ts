// src/lib/getReactionProfile.ts

import { ReactionProfile, ReactionAxis, ReactionMagnitude } from "@/types/reactionProfile"
import { reactionRules } from "@/data/reactionRules"
import { characterProfileBias } from "@/data/characterProfileBias"

export function getReactionProfile(
  characterId: string,
  motifId: string
): ReactionProfile {

  // ① 明示ルール（正）
  const ruleForCharacter = reactionRules[characterId]
  if (ruleForCharacter && ruleForCharacter[motifId]) {
    return ruleForCharacter[motifId] // ReactionProfile をそのまま返す
  }


  // ② キャラ固有バイアス
  const bias = characterProfileBias[characterId]
  if (bias && bias.length > 0) {
    return profileFromAxes(
      bias,
      bias.map((_, i) => clampMagnitude(5 - i))
    )
  }

  // ③ デフォルト（安全）
  return emptyProfile()
}

function emptyProfile(): ReactionProfile {
  return {
    resonance: 0,
    tension: 0,
    distortion: 0,
    collapse: 0,
    void: 0,
    transcendence: 0
  }
}

function profileFromAxes(
  axes: ReactionAxis[],
  magnitudes: ReactionMagnitude[]
): ReactionProfile {
  const profile = emptyProfile()
  axes.forEach((axis, i) => {
    profile[axis] = magnitudes[i]
  })
  return profile
}

function clampMagnitude(n: number): ReactionMagnitude {
  if (n <= 0) return 0
  if (n >= 5) return 5
  return n as ReactionMagnitude
}
