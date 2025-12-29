// src/types/voice.ts

import { voiceKey } from "./voiceKeys"

export type voice = {
  id: voiceKey
  label: string
  keywords: string[]
  categoryID?: string
  styleGuide?: string
}
