// src/lib/mapSituationToWorldModifiers.ts

import type { SituationKey } from "@/types/situationKeys"
import type { ReactionProfile } from "@/types/reactionProfile"
import type { WorldModifierType } from "@/types/worldModifier"
import { calcRecursiveReflectionIntensity } from "@/lib/calcRecursiveReflectionIntensity"

export function mapSituationToWorldModifiers(
  situationId: SituationKey,
  reactionProfile: ReactionProfile
): WorldModifierType[] {
  const modifiers: WorldModifierType[] = []

  switch (situationId) {
    case "circus":
      modifiers.push("distortion" )
      modifiers.push("observer_bias" )
      break

    case "deep_forest":
      modifiers.push("erosion" )
      modifiers.push("voidification" )
      break

    case "steampunk_planet":
      modifiers.push("fixation")
      break

    case "train_with_no_known_destination":
      modifiers.push("inversion" )
      modifiers.push("observer_bias")
      break
  }


  return modifiers
}


