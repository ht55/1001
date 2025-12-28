// src/lib/buildStructualState.ts

import type { StructuralFunction } from "@/data/sourceStories/types"
import type { FunctionState } from "@/data/sourceStories/types"

export function buildStructuralState(
  functions: StructuralFunction[]
): FunctionState[] {
  return functions.map(fn => ({
    function: fn,
    weight: 1,
    polarity: 1,
    active: true,
  }))
}

