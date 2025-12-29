import { voiceKey } from "./voiceKeys"

// src/types/voice.ts
export type Voice = {
  id: voiceKey
  label: string
  keywords: string[]
  categoryID?: string
  styleGuide?: string
}
