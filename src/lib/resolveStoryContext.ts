// src/lib/resolveStoryContext.ts

import type { StoryContextSnapshot } from "@/types/StoryContextSnapshot"
import type { ResolvedStoryContext } from "@/types/ResolvedStoryContext"

import { charactersById } from "@/data/characters"
import { themesById } from "@/themes"
import { situationsById } from "@/situations"
import { voicesById } from "@/voices/voiceList"

export function resolveStoryContext(
  snapshot: StoryContextSnapshot
): ResolvedStoryContext {
  const character = charactersById[snapshot.characterId]
  const theme = themesById[snapshot.themeId]
  const situation = situationsById[snapshot.situationId]
  const voice = voicesById[snapshot.voiceId]

  return {
    character: {
      id: snapshot.characterId,
      label: character.name,
      description: character.tags.join(","),
    },
    theme: {
      id: snapshot.themeId,
      label: theme.label,
    },
    situation: {
      id: snapshot.situationId,
      label: situation.label,
    },
    voice: voice
  }
}
