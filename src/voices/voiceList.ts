// src/voices/voiceList.ts

import type { Voice } from '@/types/voice'
import {
  neutral,
  poetic,
  melancholic,
  cold,
  scholarly,
  mystic,
  heroic,
  childlike,
  playful,
  osaka_obahan
} from './index'

export const voices: Voice[] = [
  neutral,
  poetic,
  melancholic,
  cold,
  scholarly,
  mystic,
  heroic,
  childlike,
  playful,
  osaka_obahan,
]

export const voicesById: Record<string, Voice> =
  Object.fromEntries(voices.map(v => [v.id, v]))
