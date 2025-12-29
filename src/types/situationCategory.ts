// src/types/situationCategory.ts

import { situationCategories } from "@/situations/situationCategories"

export type SituationCategory =
  typeof situationCategories[number]["categoryId"]
