// src/types/StoryContextInput.ts

import type { ThemeKey } from "@/types/themeKeys"
import type { situationKey } from "@/types/situationKeys"
import type { voiceKey } from "@/types/voiceKeys"

export type StoryContextInput = {
  characterId: string
  themeId: string
  situationId: situationKey
  voiceId: voiceKey

}