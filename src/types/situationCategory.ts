// src/types/situationCategory.ts

import { situationCategories } from "@/situations/situationCategories"

export type situationCategoryId =
  typeof situationCategories[number]["categoryId"]
