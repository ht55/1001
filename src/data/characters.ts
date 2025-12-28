// src/data/characters.ts

export interface Character {
  id: string
  name: string
  tags: string[]
}

export const characters: Character[] = [
  { id: "holmes", name: "ホームズ", tags: ["論理", "観察", "緊張", "冷静沈着", "陰鬱", "天才的", "頭脳明晰"] },
  { id: "little_prince", name: "星の王子さま", tags: ["純粋", "孤独", "超越", "友情", "本当に大切なものは目に見えない"] },
  { id: "izanami", name: "イザナミ", tags: ["死", "神", "創生", "境界", "虚無", "冥界", "呪い", "ネガティブに変化する愛情"] },
  { id: "yeti", name: "イエティ", tags: ["孤立", "未開", "未知", "異形", "自然", "雪", "人に危害を加えない"] },
  { id: "square_flatland", name: "フラットランドの正方形", tags: ["次元", "歪み", "不合理", "数学的", "現状批判"] },
  { id: "alice", name: "アリス", tags: ["好奇心", "混乱", "冒険", "異形", "異世界", "非論理的"] },
  { id: "ludwig_ii", name: "ルートヴィヒ2世", tags: ["理想", "崩壊", "空想", "デカダン", "耽美", "芸術愛好家"] },
  { id: "kingyo_ataishi", name: "金魚のあたい", tags: ["好奇心", "不安定", "空想", "愛らしい", "擬人化"] },
  { id: "snufkin", name: "スナフキン", tags: ["自由", "放浪", "空白", "疎外感", "孤独の楽しさ", "自然と共存", "飄々とした"] },
  { id: "honda_tadakatsu", name: "本田忠勝", tags: ["忠義", "戦", "武士道", "戦士", "最強の武将", "晩年の不遇"] },
  { id: "tinkerbell", name: "ティンカーベル", tags: ["魔法", "消失", "小生意気", "いたずら", "頑固で短気", "愛らしい"] },
  { id: "ragnar", name: "ラグナル", tags: ["策略", "崩壊", "権力", "残虐", "バイキング", "戦士", "統治"] }, 
  { id: "lupin", name: "ルパン三世", tags: ["狡猾", "遊戯", "女たらし", "頭脳明晰", "大胆不敵", "女性にモテる"] },
  { id: "puss_in_boots", name: "長靴をはいた猫", tags: ["策略", "成功", "下剋上", "擬人化", "頭脳明晰", "忠誠"] },
  { id: "marie_antoinette", name: "マリー・アントワネット", tags: ["権力", "崩壊", "美貌", "衰退", "没落", "運命に翻弄される"] }
]
export const charactersById: Record<string, Character> =
  Object.fromEntries(
    characters.map(c => [c.id, c])
  )
