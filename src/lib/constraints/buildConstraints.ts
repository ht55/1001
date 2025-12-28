// src/lib/constraints/buildConstraints.ts

import { StoryContextInput } from "@/types/StoryContextInput"
import { getReactionProfile } from "@/lib/getReactionProfile"
import { applyTransition } from "@/lib/applyTransition"
import { pickExpressionGate } from "@/lib/pickExpressionGate"
import { characterSenseSemantics } from "@/data/characterSenseSemantics"
import { getDominantAxis } from "@/lib/getDominantAxis"
import type { StoryConstraints } from "./constraints.schema"

export function buildConstraints(input: StoryContextInput): StoryConstraints {
  // Phase1: 意味生成（6軸ベクトル）
  const reactionProfile = getReactionProfile(
    input.characterId,
    input.themeId
  )
  const dominantAxis = getDominantAxis(reactionProfile)
  const magnitude = reactionProfile[dominantAxis]

  // Phase2: 意味変形
  const transition = applyTransition(
    dominantAxis,
    input.situationId
  )

  // Expression Gate
  const entry = pickExpressionGate(dominantAxis)

  return {
    meta: {
      mode: "faker_llm",
      language: "ja",
      axisLock: true
    },

    core: {
      character: input.characterId,
      theme: input.themeId,
      situation: input.situationId,
      voice: input.voiceId
    },

    phase1: {
      reactionProfile: dominantAxis,
      magnitude
    },

    phase2: {
      transition
    },

    expression: {
      entry,
      axisLockTarget: "world_attribute"
    },

    semantics: {
      characterSense:
        entry.kind === "sense"
          ? characterSenseSemantics[input.characterId]?.[entry.sense]
          : null
    },

    template: {
      sections: [
        "situation_anchor",
        "initial_anomaly",
        "axis_locked_progression",
        "unresolved_residue"
      ],
      rules: {
        oneEntryOnly: true,
        noAbstractTerms: true,
        noResolution: true,
        noMoral: true
      },
      length: {
        min: 1500,
        max: 3000
      }
    }
  } 
}
