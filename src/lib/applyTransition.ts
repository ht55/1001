// src/lib/applyTransition.ts

import type { ReactionAxis } from "@/types/reactionProfile"
import type { situationCategoryId } from "@/situations/situationCategories"
import { TRANSITION_MATRIX } from "./transitionMatrix"

export function applyTransition(
  axis: ReactionAxis,
  categoryId: situationCategoryId
) {
  return TRANSITION_MATRIX[categoryId][axis]
}


