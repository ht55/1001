// src/voices/voiceList.ts

import type { Voice } from '@/types/voice'
import {
 neutral,
 emotional,   // 激情的
 casual,      // チャラい
 formal,      // お堅い
 samurai,     // 侍言葉
 osaka_obahan
} from './index'

export const voices: Voice[] = [
 neutral,
 emotional,   // 激情的
 casual,      // チャラい
 formal,      // お堅い
 samurai,     // 侍言葉
 osaka_obahan
]

export const voicesById: Record<string, Voice> =
  Object.fromEntries(voices.map(v => [v.id, v]))
