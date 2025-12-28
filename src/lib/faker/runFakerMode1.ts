// src/lib/faker/runFakerMode1.ts

import type { SourceStory, StructuralFunction, StructuralState, WorldModifier } from "@/data/sourceStories/types"
import type { ReactionProfile } from "@/types/reactionProfile"
import { applyWorldModifiersToStructure } from "@/lib/applyWorldModifiersToStructure"
import { renderStoryText } from "@/lib/renderStoryText"
import { pick } from "@/lib/faker/pick"
import { sourceStories } from "@/data/sourceStories"
import { buildStructuralState } from "@/lib/buildStructuralState"
import type { VoiceKey } from "@/types/voiceKeys"


// 既存SourceStoryを選択（文章は必ず既存）
export function selectSourceStory(): SourceStory {
  return pick(sourceStories)
}

// 原文に存在する構造機能のみを State 化
export function runFakerMode1(params: {
  reaction: ReactionProfile
  modifiers: WorldModifier[]
  voice: VoiceKey
  replace?: {
    characterMap?: Record<string, string>
    placeMap?: Record<string, string>
  }
}): { text: string; sourceId: string } {
  const source = selectSourceStory()

  const initialState = buildStructuralState(source.structural_functions)

  const transformedStates = applyWorldModifiersToStructure(
    initialState,
    params.modifiers,
    params.reaction
  )

  let text = source.text

  if (params.replace?.characterMap) {
    for (const [from, to] of Object.entries(params.replace.characterMap)) {
      text = text.replaceAll(from, to)
    }
  }

  if (params.replace?.placeMap) {
    for (const [from, to] of Object.entries(params.replace.placeMap)) {
      text = text.replaceAll(from, to)
    }
  }

  const rendered = renderStoryText(text, transformedStates, {
    voice: params.voice,
  })

  return {
    text: rendered,
    sourceId: source.id,
  }
}
