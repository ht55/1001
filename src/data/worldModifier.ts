// src/data/worldModifier.ts  

import type { WorldModifier } from "@/types/worldModifier"

export const WORLD_MODIFIERS: readonly WorldModifier[] = [
  {
    id: "distortion",
    label: "歪曲",
    effects: { distortion: 0.4, resonance: -0.2 },
    notes: "意味と因果の対応を乱す",
  },
  {
    id: "inversion",
    label: "反転",
    notes: "数値は保持し、解釈のみ反転",
  },
  {
    id: "fixation",
    label: "固着",
    transitionBias: { suppressExtremes: true },
    notes: "状態遷移を抑制し、極端値を保持",
  },
  {
    id: "erosion",
    label: "侵食",
    effects: { distortion: 0.2, resonance: -0.1 },
    transitionBias: { toCollapse: 0.2 },
    notes: "時間経過で歪みが累積",
  },
  {
    id: "voidification",
    label: "欠落",
    effects: { resonance: -0.3, tension: -0.2, void: 0.4 },
    notes: "行為や感情の意味が希薄化",
  },
  {
    id: "failed_transcendence",
    label: "超越失敗",
    transitionBias: { toTranscendence: 0.3, toCollapse: 0.3 },
    notes: "超越を狙うが失敗時に崩壊",
  },
  {
    id: "observer_bias",
    label: "観測歪み",
    notes: "評価が観測点に依存して揺れる",
  },
  {
    id: "emergent_possibility",
    label: "好転の可能性",
    transitionBias: { suppressExtremes: true },
    notes: "希望成分が非ゼロになるが結果は保証しない",
  },
]
