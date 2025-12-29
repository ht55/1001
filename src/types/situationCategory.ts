// src/types/situationCategory.ts

import { situationCategories } from "@/situations/situationCategories"

export type situationCategory =
  typeof situationCategories[number]["categoryId"]
