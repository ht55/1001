// src/types/voiceKeys.ts

export const voiceKeys = [
  'neutral',
  'poetic',
  'melancholic',
  'cold',
  'scholarly',
  'mystic',
  'heroic',
  'childlike',
  'playful',
  'osaka_obahan'
] as const

export type VoiceKey = typeof voiceKeys[number]
