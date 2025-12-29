// src/types/ResolvedStoryContext.ts

import type { Voice } from "@/types/voice"

export type ResolvedStoryContext = {
  character: {
    id: string
    label: string
    description?: string
  }
  theme: {
    id: string
    label: string
  }
  situation: {
    id: string
    label: string
  }
  voice: Voice 
  
}
