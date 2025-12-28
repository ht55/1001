export type StoryPattern = {
  id: string
  blocks: {
    intro: string[]
    anomaly: string[]
    progression: string[]
    ending: string[]
  }
}

export const storyPatterns: StoryPattern[] = [
  {
    id: "boundary_distortion",
    blocks: {
      intro: [
        "{character}は{place}にいた。",
        "{place}は日常の延長にあるはずだった。"
      ],
      anomaly: [
        "しかし、{sense}だけが信用できなかった。",
        "{sense}が示す情報が、現実と一致しない。"
      ],
      progression: [
        "時間は進んでいる。",
        "だが、進行と理解が噛み合わない。"
      ],
      ending: [
        "{character}は立ち止まった。",
        "答えは出ないまま、違和だけが残った。"
      ]
    }
  }, 
  {
    id: "boundary_crossing",
    blocks: {
      intro: [
        "{character}は{place}にいた。",
        "{place}は境界として機能しているようだった。"
      ],
      anomaly: [
        "{sense}だけが、内と外の区別を失っている。",
        "こちら側にいるはずなのに、向こう側の感触が混じる。"
      ],
      progression: [
        "進むたびに、境界は後方にずれていく。",
        "越えたはずの線が、常に足元に残り続けた。"
      ],
      ending: [
        "{character}は振り返らなかった。",
        "境界は、越えるものではなかったのかもしれない。"
      ]
    }
 },

 {
  id: "irreversible_collapse",
  blocks: {
    intro: [
      "{place}は、すでに壊れかけていた。",
      "{character}が来る前から、終わりは始まっていた。"
    ],
    anomaly: [
      "{sense}が示す破損は、修復を拒んでいる。",
      "直したはずの箇所が、同じ形で再び崩れる。"
    ],
    progression: [
      "崩壊は進行しない。ただ、固定されている。",
      "変化ではなく、停止として現れていた。"
    ],
    ending: [
      "{character}は何もしなかった。",
      "それ以上の破壊は、必要なかった。"
    ]
  }
 },

 {
  id: "absence_void",
  blocks: {
    intro: [
      "{place}には、本来あるはずのものが欠けていた。",
      "欠如だけが、はっきりと存在している。"
    ],
    anomaly: [
      "{sense}は、空白の輪郭をなぞっている。",
      "何もないはずの場所に、抵抗がある。"
    ],
    progression: [
      "人は通り過ぎる。",
      "だが、欠如だけは動かない。"
    ],
    ending: [
      "{character}は空白を残したまま立ち去った。",
      "そこは、最後まで埋まらなかった。"
    ]
  }
 },

 {
  id: "transcendence_inversion",
  blocks: {
    intro: [
      "{place}は、上と下を失っていた。",
      "基準が反転したまま固定されている。"
    ],
    anomaly: [
      "{sense}が示す方向は、常に逆を指す。",
      "正しいはずの動作が、誤りとして返ってくる。"
    ],
    progression: [
      "反転は一度きりだった。",
      "だが、その状態が正解として続いている。"
    ],
    ending: [
      "{character}は適応した。",
      "元に戻す理由は、もう存在しなかった。"
    ]
  }
 },

 {
  id: "daily_distortion",
  blocks: {
    intro: [
      "{place}は、いつもと同じ構造をしている。",
      "配置も順序も、記憶と一致していた。"
    ],
    anomaly: [
      "ただし、{sense}だけが合わない。",
      "違和は小さく、無視できる程度だった。"
    ],
    progression: [
      "その小ささが、消えない。",
      "日常の中に、異物として残り続ける。"
    ],
    ending: [
      "{character}は日常に戻った。",
      "違和だけが、持ち帰られた。"
    ]
  }
 }

]
