// src/affinities/affinityMap.ts

import type { AffinityCell } from "./affinityCell"

// 型
export type AffinityMap = {
  [situationId: string]: {
    [voiceId: string]: AffinityCell
  }
}

export const affinityMap = {
  circus: {
    neutral: { level: "◯", comment: "バランスの取れた語り口がサーカスの多様性を引き立てる" },
    poetic: { level: "◎", comment: "幻想的な描写がサーカスの魅力を増幅" },
    melancholic: { level: "△", comment: "華やかさとの対比が独特の余韻を残す" },
    cold: { level: "△", comment: "冷静な視点が非現実感を強調" },
    scholarly: { level: "◯", comment: "歴史的・文化的視点で奥行きが出る" },
    mystic: { level: "◎", comment: "魔術的雰囲気が世界観を深化" },
    heroic: { level: "△", comment: "サーカスを舞台にした英雄譚に" },
    childlike: { level: "◎", comment: "驚きと楽しさに満ちた語りが合う" },
    playful: { level: "◎", comment: "混沌とユーモアがマッチする" },
    osaka_obahan: { level: "◎", comment: "騒がしさと混沌が共鳴" }
  },

  deep_forest: {
    neutral: { level: "◯", comment: "自然の描写に最適な落ち着いた文体" },
    poetic: { level: "◎", comment: "自然と抒情の調和" },
    melancholic: { level: "◎", comment: "静けさと孤独感が際立つ" },
    cold: { level: "△", comment: "やや淡白だがミステリアスさは出せる" },
    scholarly: { level: "◯", comment: "生態学的な視点で深みが出る" },
    mystic: { level: "◎", comment: "森の神秘と相性抜群" },
    heroic: { level: "△", comment: "やや非現実的だが冒険譚になりうる" },
    childlike: { level: "◯", comment: "不思議の森として描写できる" },
    playful: { level: "△", comment: "静けさとのギャップが鍵" },
    osaka_obahan: { level: "△", comment: "自然とのギャップでユニークに" }
  },

  snowy_mountains: {
    neutral: { level: "◯", comment: "冷静な語りで雪の静寂を表現" },
    poetic: { level: "◎", comment: "雪の描写と詩情がマッチ" },
    melancholic: { level: "◎", comment: "孤独と記憶を呼び起こす" },
    cold: { level: "◯", comment: "感情を排した語りが合う" },
    scholarly: { level: "△", comment: "やや情緒に欠けるが考察には向く" },
    mystic: { level: "◎", comment: "雪と神秘が融合" },
    heroic: { level: "△", comment: "厳しい自然が試練の舞台に" },
    childlike: { level: "△", comment: "幻想的な雪遊びの世界になる" },
    playful: { level: "△", comment: "ギャップがユーモラスに働く" },
    osaka_obahan: { level: "△", comment: "雪山でのテンションの差が面白い" }
  },

  quiet_village: {
    neutral: { level: "◎", comment: "日常の空気感を素直に描ける" },
    poetic: { level: "◯", comment: "静けさが抒情に映える" },
    melancholic: { level: "◎", comment: "過去や喪失の匂いと合う" },
    cold: { level: "△", comment: "人情との距離がズレになる" },
    scholarly: { level: "△", comment: "分析的すぎると温度が下がる" },
    mystic: { level: "◯", comment: "隠れた伝承の村になる" },
    heroic: { level: "△", comment: "英雄性が浮きやすい" },
    childlike: { level: "◯", comment: "素朴な昔話風" },
    playful: { level: "△", comment: "静寂との対比が鍵" },
    osaka_obahan: { level: "△", comment: "生活感の暴力が面白い" }
  },

  royal_court: {
    neutral: { level: "◯", comment: "状況整理に向く" },
    poetic: { level: "◎", comment: "権威と美の誇張が映える" },
    melancholic: { level: "◯", comment: "栄華の陰を描ける" },
    cold: { level: "◎", comment: "権力構造と相性抜群" },
    scholarly: { level: "◎", comment: "政治・制度描写が強い" },
    mystic: { level: "△", comment: "魔術色を足す必要あり" },
    heroic: { level: "◯", comment: "叙事詩的展開に" },
    childlike: { level: "△", comment: "複雑さが壁になる" },
    playful: { level: "△", comment: "風刺寄りなら成立" },
    osaka_obahan: { level: "△", comment: "宮廷ゴシップ化する" }
  },

  tropical_beach: {
    neutral: { level: "◯", comment: "異国感を整理できる" },
    poetic: { level: "◎", comment: "光と海の表現が強い" },
    melancholic: { level: "◯", comment: "旅の終わり感" },
    cold: { level: "△", comment: "開放感と噛み合わない" },
    scholarly: { level: "△", comment: "観光記録寄りになる" },
    mystic: { level: "◯", comment: "海の伝承と相性" },
    heroic: { level: "△", comment: "戦場化しない工夫が必要" },
    childlike: { level: "◎", comment: "冒険と遊びの海" },
    playful: { level: "◎", comment: "陽気さが噛み合う" },
    osaka_obahan: { level: "◎", comment: "海外テンション全開" }
  },

  boundary_to_another_world: {
    neutral: { level: "◯", comment: "状況説明に向く" },
    poetic: { level: "◎", comment: "曖昧さを美にできる" },
    melancholic: { level: "◎", comment: "別れと選択の場" },
    cold: { level: "◯", comment: "境界管理者視点" },
    scholarly: { level: "◯", comment: "世界構造の説明向き" },
    mystic: { level: "◎", comment: "王道の相性" },
    heroic: { level: "◎", comment: "越境の物語になる" },
    childlike: { level: "△", comment: "抽象度が高い" },
    playful: { level: "△", comment: "軽くすると不思議寄り" },
    osaka_obahan: { level: "△", comment: "異界ツッコミ役" }
  },

  ruined_tower: {
    neutral: { level: "◯", comment: "状況説明がしやすい" },
    poetic: { level: "◎", comment: "崩壊と時間の比喩が映える" },
    melancholic: { level: "◎", comment: "失われた栄光と相性良し" },
    cold: { level: "◯", comment: "遺構として淡々と描ける" },
    scholarly: { level: "◎", comment: "建築・歴史考察向き" },
    mystic: { level: "◯", comment: "封印や呪いを匂わせられる" },
    heroic: { level: "◎", comment: "攻略対象として成立" },
    childlike: { level: "△", comment: "危険さが強い" },
    playful: { level: "△", comment: "軽さとのズレ" },
    osaka_obahan: { level: "△", comment: "廃墟ツッコミ役" }
  },

  neon_district: {
    neutral: { level: "◯", comment: "情報量を制御できる" },
    poetic: { level: "◎", comment: "光と孤独の都市詩" },
    melancholic: { level: "◎", comment: "夜の虚無と相性抜群" },
    cold: { level: "◎", comment: "無機質な都市感覚" },
    scholarly: { level: "△", comment: "レポート調になりがち" },
    mystic: { level: "△", comment: "SF寄り調整が必要" },
    heroic: { level: "◯", comment: "アンチヒーロー向き" },
    childlike: { level: "△", comment: "刺激が強い" },
    playful: { level: "◯", comment: "カオスな楽しさ" },
    osaka_obahan: { level: "◎", comment: "街ツッコミが炸裂" }
  },

  wall_street: {
    neutral: { level: "◯", comment: "現実的描写に向く" },
    poetic: { level: "△", comment: "抽象化が必要" },
    melancholic: { level: "◯", comment: "欲望の虚しさ" },
    cold: { level: "◎", comment: "数字と非情さが噛み合う" },
    scholarly: { level: "◎", comment: "経済構造の語り" },
    mystic: { level: "△", comment: "比喩的処理向き" },
    heroic: { level: "△", comment: "英雄像がズレる" },
    childlike: { level: "△", comment: "理解が難しい" },
    playful: { level: "△", comment: "皮肉寄りになる" },
    osaka_obahan: { level: "◎", comment: "金の話が主役" }
  },

  shopping_mall: {
    neutral: { level: "◯", comment: "空間整理に向く" },
    poetic: { level: "△", comment: "日常感が強い" },
    melancholic: { level: "◯", comment: "空虚な消費空間" },
    cold: { level: "◯", comment: "人工性が強調される" },
    scholarly: { level: "△", comment: "社会分析寄り" },
    mystic: { level: "△", comment: "異界化が必要" },
    heroic: { level: "△", comment: "スケールがズレる" },
    childlike: { level: "◎", comment: "巨大な遊び場" },
    playful: { level: "◎", comment: "カオスと相性良し" },
    osaka_obahan: { level: "◎", comment: "日常トーク無双" }
  },

  space_station: {
    neutral: { level: "◯", comment: "SF描写が安定" },
    poetic: { level: "◎", comment: "孤独と宇宙の詩" },
    melancholic: { level: "◎", comment: "隔絶感と相性良し" },
    cold: { level: "◎", comment: "無重力の非情さ" },
    scholarly: { level: "◎", comment: "技術描写向き" },
    mystic: { level: "△", comment: "科学寄り調整" },
    heroic: { level: "◯", comment: "防衛・救出劇" },
    childlike: { level: "△", comment: "理解が難しい" },
    playful: { level: "△", comment: "緊張感が崩れる" },
    osaka_obahan: { level: "△", comment: "宇宙で世話焼き" }
  },

  artificial_garden: {
    neutral: { level: "◯", comment: "構造を整理できる" },
    poetic: { level: "◎", comment: "人工と自然の対比" },
    melancholic: { level: "◯", comment: "作られた楽園感" },
    cold: { level: "◯", comment: "管理視点と合う" },
    scholarly: { level: "◎", comment: "設計思想を描ける" },
    mystic: { level: "△", comment: "神秘性は薄め" },
    heroic: { level: "△", comment: "戦いの場ではない" },
    childlike: { level: "◎", comment: "不思議な庭園" },
    playful: { level: "◯", comment: "実験場として楽しい" },
    osaka_obahan: { level: "◯", comment: "世話焼き視点" }
  },

  steampunk_planet: {
    neutral: { level: "◯", comment: "世界説明向き" },
    poetic: { level: "◎", comment: "煙と歯車の詩" },
    melancholic: { level: "◯", comment: "時代遅れの哀愁" },
    cold: { level: "◎", comment: "機械文明と相性" },
    scholarly: { level: "◎", comment: "技術史的に強い" },
    mystic: { level: "△", comment: "魔法寄り調整" },
    heroic: { level: "◎", comment: "反乱・革命譚" },
    childlike: { level: "△", comment: "複雑すぎる" },
    playful: { level: "◯", comment: "ガジェット感" },
    osaka_obahan: { level: "△", comment: "煙への文句" }
  },

  lost_undersea_kingdom: {
    neutral: { level: "◯", comment: "状況整理が必要" },
    poetic: { level: "◎", comment: "沈黙と光の世界" },
    melancholic: { level: "◎", comment: "滅びの美学" },
    cold: { level: "◯", comment: "深海の非情さ" },
    scholarly: { level: "◎", comment: "文明考古学向き" },
    mystic: { level: "◎", comment: "伝説との親和性" },
    heroic: { level: "◯", comment: "探索譚になる" },
    childlike: { level: "△", comment: "怖さが勝る" },
    playful: { level: "△", comment: "雰囲気維持が難しい" },
    osaka_obahan: { level: "△", comment: "水圧ツッコミ" }
  },

  infinite_labyrinth: {
    neutral: { level: "◯", comment: "構造整理が重要" },
    poetic: { level: "◎", comment: "終わりなき比喩" },
    melancholic: { level: "◎", comment: "迷いと絶望" },
    cold: { level: "◎", comment: "非人間的空間" },
    scholarly: { level: "◯", comment: "論理迷宮向き" },
    mystic: { level: "◎", comment: "存在論的世界" },
    heroic: { level: "◎", comment: "試練の極致" },
    childlike: { level: "△", comment: "難解すぎる" },
    playful: { level: "△", comment: "緊張感が崩れる" },
    osaka_obahan: { level: "△", comment: "永遠に迷うオチ" }
  }
} satisfies AffinityMap
