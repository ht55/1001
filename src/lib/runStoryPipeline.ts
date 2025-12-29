// src/lib/runStoryPipeline.ts

import type { AffinitySymbol } from "@/types/affinity"
import type { StoryResult } from "@/types/storyResult"
import type { situationKey } from "@/types/situationKeys"
import type { voiceKey } from "@/types/voiceKeys"

import { runWithFakerMode3 } from "@/lib/runWithFakerMode3"

type RunStoryPipelineInput = {
  characterId: string
  themeId: string
  situationId: situationKey
  voiceId: voiceKey
  uiLevel: AffinitySymbol
  apiKey: string 
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
  },
  input.apiKey 
)

  return result
}


