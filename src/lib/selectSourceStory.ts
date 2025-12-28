// src/lib/selectSourceStory.ts

import type { ReactionProfile } from "@/types/reactionProfile"
import type {
  SourceStory,
  StructuralFunction
} from "@/data/sourceStories/types"
import { sourceStories } from "@/data/sourceStories"

const ALL_STORIES: SourceStory[] = sourceStories ?? []

type SelectParams = {
  requiredFunctions?: StructuralFunction[]
  reactionProfile?: ReactionProfile
}

export function selectSourceStory({
  requiredFunctions = [],
  reactionProfile,
}: SelectParams = {}): SourceStory | undefined {

  if (ALL_STORIES.length === 0) return undefined

  // 1) 構造機能フィルタ（弱条件）
  let candidates = ALL_STORIES.filter(story =>
    requiredFunctions.length === 0 ||
    requiredFunctions.some(fn =>
      (story.structural_functions ?? []).includes(fn)
    )
  )

  // 2) ReactionProfile による軽いバイアス
  if (reactionProfile && candidates.length > 1) {
    const axis = dominantAxis(reactionProfile)
    candidates = weightByAxis(candidates, axis)
  }

  // 3) フォールバック
  if (candidates.length === 0) {
    candidates = ALL_STORIES
  }

  // 4) ランダム選択
  return candidates[
    Math.floor(Math.random() * candidates.length)
  ]
}

// helpers

function dominantAxis(profile: ReactionProfile): string | undefined {
  return Object.entries(profile)
    .sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0]
}

function weightByAxis(
  stories: SourceStory[],
  axis?: string
): SourceStory[] {
  if (!axis) return stories

  const preferred: StructuralFunction[] =
    axis === "void" ? ["void_ending"] :
    axis === "distortion" ? ["division", "observer_distortion"] :
    []

  if (preferred.length === 0) return stories

  const boosted = stories.filter(s =>
    preferred.some(fn =>
      (s.structural_functions ?? []).includes(fn)
    )
  )

  return boosted.length ? boosted : stories
}
