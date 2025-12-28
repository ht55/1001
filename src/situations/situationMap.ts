import type { SituationPreset } from "@/types/situationPreset"
import { situations } from "./situationCategories"

export const situationsById: Record<string, SituationPreset> =
  Object.fromEntries(
    situations.map(s => [s.id, s])
  )
