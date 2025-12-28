// src/types/StructualState.ts

import type { FunctionState } from "@/types/FunctionState"

export type StructuralState = {
  functions: FunctionState[]
  paragraphs: string[]
}
