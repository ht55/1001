// src/types/StoryContextSnapshot.ts

import type { situationKey } from "@/types/situationKeys"
import type { voiceKey } from "@/types/voiceKeys"
import type { ReactionProfile } from "@/types/reactionProfile"

export type StoryContextSnapshot = {
  characterId: string
  themeId: string
  situationId: situationKey
  voiceId: voiceKey
  reactionProfile?: ReactionProfile
}
