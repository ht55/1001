// src/lib/constraints/normalizeMode3.ts

import type { situationKey } from "@/types/situationKeys"
import type { voiceKey } from "@/types/voiceKeys"

import { resolveStoryContext } from "@/lib/resolveStoryContext"
import { selectSourceStory } from "@/lib/selectSourceStory"
import { mapSituationToWorldModifiers } from "@/lib/mapSituationToWorldModifiers"
import { mapSituationToRequiredFunctions } from "@/lib/mapSituationToRequiredFunctions"
import { getReactionProfile } from "@/lib/getReactionProfile"
import { buildPromptSchema } from "@/lib/buildPromptSchema"

type Mode3Input = {
  characterId: string
  themeId: string
  situationId: situationKey
  voiceId: voiceKey
}

export function normalizeMode3(
  input: Mode3Input
): { prompt: string } {
  // 1) 表示用ラベル解決（uiLevelは型合わせのみ）
  const resolved = resolveStoryContext({
    characterId: input.characterId,
    themeId: input.themeId,
    situationId: input.situationId,
    voiceId: input.voiceId,

  })

  // 2) Reaction
  const reactionProfile = getReactionProfile(
    input.characterId,
    input.themeId
  )

  // 3) SourceStory
  const sourceStory = selectSourceStory({
    reactionProfile,
    requiredFunctions: mapSituationToRequiredFunctions(
      input.situationId
    ),
  })

  if (!sourceStory) {
    throw new Error("SourceStory not found (Mode3)")
  }

  // 4) WorldModifier
  const worldModifiers = mapSituationToWorldModifiers(
    input.situationId,
    reactionProfile
  )

  // 5) Prompt（targetLengthは無効化）
  const prompt = buildPromptSchema({
    sourceStory,
    characterLabel: resolved.character.label,
    themeLabel: resolved.theme.label,
    situationLabel: resolved.situation.label,
    voice: resolved.voice,
    worldModifiers,
    targetLength: undefined, // ← Mode3では使わない
  })

  return { prompt }
}


