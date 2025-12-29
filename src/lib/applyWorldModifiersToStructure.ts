// src/lib/applyWorldModifiersToStructure.ts

import type { StructuralState } from "@/types/StructuralState"
import type { worldModifier, WorldModifierType } from "@/types/worldModifier"
import type { ReactionProfile } from "@/types/reactionProfile"
import { applyWorldModifier } from "@/lib/applyWorldModifierToStructure"

// 複数 WorldModifier を順序付きで StructuralState に適用する

export function applyWorldModifiersToStructure(
  state: StructuralState,
  modifiers: (worldModifier & { id: WorldModifierType })[],
  reaction: ReactionProfile
): StructuralState {
  return modifiers.reduce(
    (currentState, modifier) =>
      applyWorldModifier(currentState, modifier, modifier.id, reaction),
    state
  )
}
