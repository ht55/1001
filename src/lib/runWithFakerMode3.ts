// src/lib/runWithFakerMode3.ts  

import type { StoryContextSnapshot } from "@/types/StoryContextSnapshot"
import type { StoryResult } from "@/types/storyResult"

import { resolveStoryContext } from "@/lib/resolveStoryContext"
import { selectSourceStory } from "@/lib/selectSourceStory"
import { mapSituationToWorldModifiers } from "@/lib/mapSituationToWorldModifiers"
import { mapSituationToRequiredFunctions } from "@/lib/mapSituationToRequiredFunctions"
import { getReactionProfile } from "@/lib/getReactionProfile"
import { buildPromptSchema } from "@/lib/buildPromptSchema"
import { runWithLLM } from "@/lib/runWithLLM"

export async function runWithFakerMode3(
  snapshot: StoryContextSnapshot
): Promise<StoryResult> {

  // 0) resolve
  const resolved = resolveStoryContext(snapshot)

  // 1) Reaction（構造重み）
  const reactionProfile = getReactionProfile(
    snapshot.characterId,
    snapshot.themeId
  )

  // 2) SourceStory（Situation ID は snapshot 側を使う）
  const sourceStory = selectSourceStory({
    reactionProfile,
    requiredFunctions: mapSituationToRequiredFunctions(
      snapshot.situationId
    ),
  })

  if (!sourceStory) {
    throw new Error("SourceStory not found")
  }

  // 3) WorldModifier（Situation ID は snapshot 側を使う）
  const worldModifiers =
    mapSituationToWorldModifiers(
      snapshot.situationId,
      reactionProfile
    )

  // 4) Prompt
  const prompt = buildPromptSchema({
    sourceStory,
    characterLabel: resolved.character.label,
    themeLabel: resolved.theme.label,
    situationLabel: resolved.situation.label,
    voiceLabel: resolved.voice.label,
    worldModifiers,
    targetLength: "1500-3000",
  })

  // 5) LLM
  const text = await runWithLLM({
    meta: { language: "ja" },
    template: {
      length: { min: 1500, max: 3000 }
    },
    core: { prompt },
    phase1: {},
    phase2: {},
  } as any)

  return {
    text,
    metrics: null,
    sourceId: sourceStory.id,
    worldModifiers,
    reactionProfile,
  }
}
