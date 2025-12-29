// src/lib/mapSituationToWorldModifiers.ts

import type { situationKey } from "@/types/situationKeys"
import type { ReactionProfile } from "@/types/reactionProfile"
import type { WorldModifierType, worldModifier } from "@/types/worldModifier"
import { WORLD_MODIFIERS } from "@/data/worldModifier"

export function mapSituationToWorldModifiers(
  situationId: situationKey,
  reactionProfile: ReactionProfile
): worldModifier[] {

  const modifierTypes: WorldModifierType[] = []

  switch (situationId) {
    case "circus":
      modifierTypes.push("distortion", "observer_bias")
      break

    case "deep_forest":
      modifierTypes.push("erosion", "voidification")
      break

    case "steampunk_planet":
      modifierTypes.push("fixation")
      break

    case "train_with_no_known_destination":
      modifierTypes.push("inversion", "observer_bias")
      break
  }

  // ★ ここが決定的に足りなかった部分
  return modifierTypes
    .map(type => WORLD_MODIFIERS.find(m => m.id === type))
    .filter((m): m is worldModifier => m !== undefined)
}


