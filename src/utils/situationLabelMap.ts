// src/utils/situationLabelMap.ts

import { situationCategories } from '@/situations'

export const situationLabelMap: Record<string, string> =
  Object.fromEntries(
    situationCategories.flatMap(cat =>
      cat.situations.map(s => [s.id, s.label])
    )
  )
