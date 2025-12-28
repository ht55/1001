// src/lib/runStoryPipeline.ts

import type { AffinitySymbol } from "@/types/affinity"
import type { StoryResult } from "@/types/storyResult"
import type { SituationKey } from "@/types/situationKeys"
import type { VoiceKey } from "@/types/voiceKeys"

import { runWithFakerMode3 } from "@/lib/runWithFakerMode3"

type RunStoryPipelineInput = {
  characterId: string
  themeId: string
  situationId: SituationKey
  voiceId: VoiceKey
  uiLevel: AffinitySymbol
}

export async function runStoryPipeline(
  input: RunStoryPipelineInput
): Promise<StoryResult> {
  const {
    characterId,
    themeId,
    situationId,
    voiceId,
    uiLevel,
  } = input

  const result = await runWithFakerMode3({
    characterId,
    themeId,
    situationId,
    voiceId,
    uiLevel,
  })

  return result
}


