// src/situations/situationMap.ts

import type { situation } from "@/types/situation"
import type { situationKey } from "@/types/situationKeys"
import { situations } from "./situationCategories"


export const situationsById: Record<situationKey, situation> =
  Object.fromEntries(
    situations.map(s => [s.id, s])
  ) as Record<situationKey, situation>