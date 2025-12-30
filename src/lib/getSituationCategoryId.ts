import { situationCategories } from "@/situations/situationCategories"
import type { situationKey } from "@/types/situationKeys"
import type { situationCategoryId } from "@/situations/situationCategories"

export function getSituationCategoryId(
  situationId: situationKey
): situationCategoryId {
  const category = situationCategories.find(c =>
    c.situations.some(s => s.id === situationId)
  )

  if (!category) {
    throw new Error(`Unknown situationId: ${situationId}`)
  }

  return category.categoryId
}
