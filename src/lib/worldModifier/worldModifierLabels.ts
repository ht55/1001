// src/lib/worldModifier/worldModifierLabels.ts

import type { WorldModifierType } from "@/types/worldModifier"

export const worldModifierLabelMap: Record<WorldModifierType, string> = {
  distortion: "歪曲",
  inversion: "反転",
  fixation: "固着",
  erosion: "侵食",
  voidification: "欠落",
  failed_transcendence: "超越失敗",
  observer_bias: "観測歪み",
  emergent_possibility: "好転の可能性",
}
