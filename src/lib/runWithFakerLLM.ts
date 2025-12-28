// src/lib/runWithFakerLLM.ts

import type { StoryContextSnapshot } from "@/types/StoryContextSnapshot"
import { resolveStoryContext } from "@/lib/resolveStoryContext"
import { selectSourceStory } from "@/lib/selectSourceStory"
import { mapSituationToRequiredFunctions } from "@/lib/mapSituationToRequiredFunctions"
import { mapSituationToWorldModifiers } from "@/lib/mapSituationToWorldModifiers"
import { getReactionProfile } from "@/lib/getReactionProfile"
import { buildPromptSchema } from "@/lib/buildPromptSchema"
import type { StoryPipelineResult } from "@/types/StoryPipelineResult"

export async function runWithFakerLLM(
  snapshot: StoryContextSnapshot
): Promise<StoryPipelineResult> {
  // 1) 解決済みコンテキスト
  const resolved = resolveStoryContext(snapshot)

  // 2) Reaction Profile
  const reactionProfile = getReactionProfile(
    snapshot.characterId,
    snapshot.themeId
  )

  // 3) SourceStory（構造アンカー）
  const sourceStory = selectSourceStory({
    reactionProfile,
    requiredFunctions: mapSituationToRequiredFunctions(
      snapshot.situationId
    ),
  })

  if (!sourceStory) {
    throw new Error("SourceStory not found")
  }

  // 4) WorldModifiers
  const worldModifiers = mapSituationToWorldModifiers(
    snapshot.situationId,
    reactionProfile
  )

  // 5) Prompt Schema
  const prompt = buildPromptSchema({
    sourceStory,
    characterLabel: resolved.character.label,
    themeLabel: resolved.theme.label,
    situationLabel: resolved.situation.label,
    voiceLabel: resolved.voice.label,
    worldModifiers,
    targetLength: "1500-3000",
})

  return {
    prompt,
    sourceId: sourceStory.id,
    worldModifiers,
    reactionProfile,
  }
}