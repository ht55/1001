// src/data/sourceStories/types.ts

export type StructuralFunction =
  | "ordered_world"
  | "taboo"
  | "temptation"
  | "transgression"
  | "division"
  | "exile"
  | "stagnation"
  | "erosion"
  | "inversion"
  | "observer_distortion"
  | "consequence"
  | "void_ending"

export type StoryTone =
  | "dark"
  | "absurd"
  | "occult"
  | "mythic"
  | "neutral"
  | "uncanny"
  | "cosmic"
  | "folkloric"
  | "surreal"

export type SourceStory = {
  id: string
  text: string
  structural_functions: StructuralFunction[]
  tone: string 

  meta?: {
    culture?: string
    ending_state?: "closure" | "loss" | "void" | "unknown"

    // Optional, batch-time only
    // Not used for generation
    // Max 2 recommended
    tone?: StoryTone[]
  }
}
