// src/types/ResolvedStoryContext.ts

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
  voice: {
    id: string
    label: string
  }
}
