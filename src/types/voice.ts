import { VoiceKey } from "./voiceKeys"

// src/types/voice.ts
export type Voice = {
  id: VoiceKey
  label: string
  keywords: string[]
  categoryID?: string
}
