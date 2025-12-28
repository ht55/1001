// src/lib/debug/runStructurePipeline.ts
// SourceStory → WorldModifier → render の通し確認（最小）

import { applyWorldModifier } from "@/lib/applyWorldModifierToStructure"
import { renderStoryText } from "@/lib/renderStoryText"
import type { StructuralState } from "@/data/sourceStories/types"
import type { WorldModifier } from "@/data/sourceStories/types"
import type { ReactionProfile } from "@/types/reactionProfile"

// 仮の SourceStory（構造機能）
const sourceStates: StructuralState[] = [
  { function: "ordered_world", weight: 1, active: true, polarity: 1 },
  { function: "division", weight: 1, active: true, polarity: 1 },
  { function: "void_ending", weight: 1, active: true, polarity: 1 },
]

// 仮の Modifier（Situation由来）
const modifiers: WorldModifier[] = ["erosion", "voidification"]

// 仮の ReactionProfile
const reactionProfile: ReactionProfile = {
  resonance: 0,
  tension: 0,
  distortion: 2,
  collapse: 1,
  void: 0,
  transcendence: 0,
}

// 1) 構造に Modifier 適用
const transformedStates = modifiers.reduce(
  (states, m) => applyWorldModifier(states, m, reactionProfile),
  sourceStates
)

// 2) テキスト render
const sourceText = `
世界は静かに保たれていた。
やがて違和感が生まれ、
最後には何も残らなかった。
`.trim()

export const debugRenderedText = renderStoryText(
  sourceText,
  transformedStates,
  { voice: "neutral" }
)

// console で確認
console.log("=== STRUCTURE ===")
console.log(transformedStates)
console.log("=== RENDERED ===")
console.log(debugRenderedText)
