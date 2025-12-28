// src/data/characterSenseSemantics.ts

export const characterSenseSemantics: Record<
  string,
  Partial<Record<string, string[]>>
> = {
  holmes: {
    vision: [
      "見えるものは正しい",
      "同一性は信用できない"
    ],
    hearing: [
      "音は事実だが順序は保証されない"
    ]
  },

  izanami: {
    smell: [
      "生の匂いは境界違反",
      "死には匂いが存在しない",
      "匂いがあること自体が異常"
    ]
  },

  little_prince: {
    vision: [
      "見えなくなることで本質が残る"
    ],
    sixth: [
      "理由は不要",
      "分かることと説明は別"
    ]
  },

  lupin: {
    hearing: [
      "音は罠になりうる",
      "聞かれていること自体が情報"
    ]
  }
}
