// src/types/FunctionState.ts

import type { StructuralFunction } from "@/data/sourceStories/types"

export type FunctionState = {
  function: StructuralFunction   
  weight: number
  polarity: number
  active: boolean
}
