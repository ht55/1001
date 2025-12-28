// src/lib/buildStoryContextSnapshot.ts

import type { StoryContextInput } from "@/types/StoryContextInput"
import type { StoryContextSnapshot } from "@/types/StoryContextSnapshot"

export function buildStoryContextSnapshot(
  input: StoryContextInput
): StoryContextSnapshot {
  return {
    characterId: input.characterId,
    themeId: input.themeId,
    situationId: input.situationId,
    voiceId: input.voiceId,
    uiLevel: input.uiLevel,
  }
}
