// src/types/StoryContextSnapshot.ts

import type { SituationKey } from "@/types/situationKeys"
import type { VoiceKey } from "@/types/voiceKeys"
import type { ReactionProfile } from "@/types/reactionProfile"

export type StoryContextSnapshot = {
  characterId: string
  themeId: string
  situationId: SituationKey
  voiceId: VoiceKey
  reactionProfile?: ReactionProfile
}
