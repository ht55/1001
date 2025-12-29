// types/storyResult.ts

import type { StructuralState } from "@/types/StructuralState"
import type { worldModifier } from "@/types/worldModifier"
import type { ReactionProfile } from "@/types/reactionProfile"

export type StoryResult = {
  // 表示用（必須）
  text: string
  metrics: any | null

  // ↓ Mode3 用（Faker内部状態・任意）
  sourceId?: string
  structuralState?: StructuralState
  worldModifiers?: worldModifier[]
  reactionProfile?: ReactionProfile
}
