// src/types/StoryContextInput.ts

import type { ThemeKey } from "@/types/themeKeys"
import type { SituationKey } from "@/types/situationKeys"
import type { VoiceKey } from "@/types/voiceKeys"


export type StoryContextInput = {
  characterId: string
  themeId: string
  situationId: SituationKey
  voiceId: VoiceKey

}