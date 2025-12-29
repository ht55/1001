// src/lib/mapSituationToRequiredFunctions.ts

import type { StructuralFunction } from "@/data/sourceStories/types"
import type { situationKey } from "@/types/situationKeys"

export function mapSituationToRequiredFunctions(
  situationId: situationKey
): StructuralFunction[] {
  switch (situationId) {
    case "circus":
      return ["observer_distortion", "division"]
    case "deep_forest":
      return ["erosion", "void_ending"]
    case "steampunk_planet":
      return ["stagnation", "consequence"]
    case "train_with_no_known_destination":
      return ["inversion", "observer_distortion"]
    default:
      return []
  }
}
