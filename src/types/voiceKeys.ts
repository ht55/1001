// src/types/voiceKeys.ts

export const voiceKeys = [
  'neutral',
  'neutral',
  'emotional',   // 激情的
  'casual',      // チャラい
  'formal',      // お堅い
  'samurai',     // 侍言葉
  'osaka_obahan'
] as const

export type voiceKey = typeof voiceKeys[number]
