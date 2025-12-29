// src/voices/voiceList.ts

import type { voice } from '@/types/voice'
import {
 neutral,
 emotional,   // 激情的
 casual,      // チャラい
 formal,      // お堅い
 samurai,     // 侍言葉
 osaka_obahan
} from './index'

export const voices: voice[] = [
 neutral,
 emotional,   // 激情的
 casual,      // チャラい
 formal,      // お堅い
 samurai,     // 侍言葉
 osaka_obahan
]

export const voicesById: Record<string, voice> =
  Object.fromEntries(voices.map(v => [v.id, v]))
