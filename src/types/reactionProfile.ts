// src/types/reactionProfile.ts
// Character x Theme による化学反応、つまりこの２つの組み合わせの相性の傾向が６つのreactionProfileに分類される。その傾向のマグニチュードを５段階評価で表した。

export type ReactionAxis =
  | "resonance"
  | "tension"
  | "distortion"
  | "collapse"
  | "void"
  | "transcendence"

// 0–5 の整数だけを許す
export type ReactionMagnitude = 0 | 1 | 2 | 3 | 4 | 5

export type ReactionProfile = {
  [K in ReactionAxis]: ReactionMagnitude
}
