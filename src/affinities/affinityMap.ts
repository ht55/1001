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
    neutral: { level: "◯", comment: "バランスの取れた語り口が多様性を引き立てる" },
    emotional: { level: "◎", comment: "過剰な感情表現がサーカスの狂騒と融合" },
    casual: { level: "◯", comment: "軽薄さが見世物感と噛み合う" },
    formal: { level: "△", comment: "格式ばった語りが生む場違いな緊張" },
    samurai: { level: "△", comment: "武士道と曲芸のズレが異様さを強調" },
    osaka_obahan: { level: "◎", comment: "騒がしさと混沌が共鳴" }
  },

  deep_forest: {
    neutral: { level: "◯", comment: "自然の描写に最適な落ち着いた文体" },
    emotional: { level: "◯", comment: "感情の揺れが森の圧迫感と共鳴" },
    casual: { level: "△", comment: "神秘性を壊しかねない軽さ" },
    formal: { level: "◯", comment: "観察者視点として安定" },
    samurai: { level: "◎", comment: "修行・覚悟の場として王道" },
    osaka_obahan: { level: "△", comment: "自然とのギャップでユニークに" }
  },

  snowy_mountains: {
    neutral: { level: "◯", comment: "冷静な語りで雪の静寂を表現" },
    emotional: { level: "◎", comment: "極限状況での激情が映える" },
    casual: { level: "△", comment: "命の重さとのギャップが強い" },
    formal: { level: "◯", comment: "厳粛な自然描写と相性良し" },
    samurai: { level: "◎", comment: "覚悟と死生観が噛み合う" },
    osaka_obahan: { level: "△", comment: "雪山でのテンションの差が面白い" }
  },

  quiet_village: {
    neutral: { level: "◎", comment: "日常の空気感を素直に描ける" },
    emotional: { level: "◯", comment: "抑圧された感情が滲み出る" },
    casual: { level: "△", comment: "空気を読むことの難しさ" },
    formal: { level: "◯", comment: "記録的語りとして成立" },
    samurai: { level: "△", comment: "際立つ時代感のズレ" },
    osaka_obahan: { level: "△", comment: "生活感の暴力が面白い" }
  },

  royal_court: {
    neutral: { level: "◯", comment: "状況整理に向く" },
    emotional: { level: "◯", comment: "愛憎劇として機能する" },
    casual: { level: "△", comment: "格式破壊がチャラくなる" },
    formal: { level: "◎", comment: "制度と権威の描写に最適" },
    samurai: { level: "◯", comment: "忠義と主君関係で成立" },
    osaka_obahan: { level: "△", comment: "宮廷ゴシップ化する" }
  },

  tropical_beach: {
    neutral: { level: "◯", comment: "異国感を整理できる" },
    emotional: { level: "◯", comment: "解放感を満喫" },
    casual: { level: "◎", comment: "陽気さと相性抜群" },
    formal: { level: "△", comment: "ザ・硬物 in リゾート" },
    samurai: { level: "△", comment: "戦場でない違和感が強い" },
    osaka_obahan: { level: "◎", comment: "海外テンション全開" }
  },

  boundary_to_another_world: {
    neutral: { level: "◯", comment: "的確な状況説明" },
    emotional: { level: "◎", comment: "決断と別れの感情が最大化" },
    casual: { level: "△", comment: "境界の重みを削ぐほどの軽さ" },
    formal: { level: "◯", comment: "儀式・管理者視点として有効" },
    samurai: { level: "◎", comment: "越境＝覚悟の物語になる" },
    osaka_obahan: { level: "△", comment: "異界ツッコミ役" }
  },

  ruined_tower: {
    neutral: { level: "◯", comment: "状況説明がしやすい" },
    emotional: { level: "◎", comment: "失われた栄光への感情が映える" },
    casual: { level: "△", comment: "狂い始める廃墟とのズレ" },
    formal: { level: "◯", comment: "遺構調査として安定" },
    samurai: { level: "◎", comment: "討死や因縁の舞台に最適" },
    osaka_obahan: { level: "△", comment: "廃墟ツッコミ役" }
  },

  neon_district: {
    neutral: { level: "◯", comment: "情報量を制御できる" },
    emotional: { level: "◎", comment: "欲望と孤独の爆発" },
    casual: { level: "◯", comment: "夜遊び視点として成立" },
    formal: { level: "◯", comment: "スレた街を報道風に" },
    samurai: { level: "△", comment: "時代錯誤感を楽しむ枠" },
    osaka_obahan: { level: "◎", comment: "街ツッコミが炸裂" }
  },

  wall_street: {
    neutral: { level: "◯", comment: "現実的描写に向く" },
    emotional: { level: "◯", comment: "欲望の振れ幅を描写可能" },
    casual: { level: "△", comment: "現実から目を背けよう" },
    formal: { level: "◎", comment: "経済儀礼と相性抜群" },
    samurai: { level: "△", comment: "刀と数字のズレを楽しむ" },
    osaka_obahan: { level: "◎", comment: "金の話が主役" }
  },

  shopping_mall: {
    neutral: { level: "◯", comment: "巨大空間をしっかり把握" },
    emotional: { level: "◯", comment: "消費への執着を誇張できる" },
    casual: { level: "◎", comment: "日常の騒がしさにピッタリ" },
    formal: { level: "△", comment: "無機質すぎて逆に浮く" },
    samurai: { level: "△", comment: "現代性との落差が強め" },
    osaka_obahan: { level: "◎", comment: "日常トーク無双" }
  },

  space_station: {
    neutral: { level: "◯", comment: "安定のSF描写" },
    emotional: { level: "◯", comment: "大気圏外でもドラマチック" },
    casual: { level: "△", comment: "緊張感と逆行するチャラさ" },
    formal: { level: "◎", comment: "規律空間との相性が非常に良い" },
    samurai: { level: "◯", comment: "最後の覚悟の場に最適" },
    osaka_obahan: { level: "△", comment: "宇宙で世話焼き" }
  },

  artificial_garden: {
    neutral: { level: "◯", comment: "構造を整理できる" },
    emotional: { level: "◯", comment: "作られた美への違和感" },
    casual: { level: "△", comment: "人工感をも弱める軽さ" },
    formal: { level: "◎", comment: "設計思想の語りに最適" },
    samurai: { level: "△", comment: "自然観のズレが強め" },
    osaka_obahan: { level: "◯", comment: "ここでも世話焼き発動" }
  },

  steampunk_planet: {
    neutral: { level: "◯", comment: "世界説明向き" },
    emotional: { level: "◎", comment: "熱血文明描写" },
    casual: { level: "◯", comment: "ガジェット遊び感" },
    formal: { level: "◎", comment: "技術官僚的語りが映える" },
    samurai: { level: "◯", comment: "義と機械の対比が面白い" },
    osaka_obahan: { level: "△", comment: "煙への文句" }
  },

  lost_undersea_kingdom: {
    neutral: { level: "◯", comment: "状況整理が必要" },
    emotional: { level: "◎", comment: "溢れ出る滅びへの強い感情" },
    casual: { level: "△", comment: "神話性ブチ壊し" },
    formal: { level: "◯", comment: "調査記録的に成立" },
    samurai: { level: "◎", comment: "滅びの美学と相性抜群" },
    osaka_obahan: { level: "△", comment: "水圧ツッコミ" }
  },

  infinite_labyrinth: {
  neutral: { level: "◯", comment: "得意の構造整理" },
  emotional: { level: "◎", comment: "ダイレクトな狂気と絶望" },
  casual: { level: "△", comment: "緊張感が瓦解する" },
  formal: { level: "◯", comment: "論理迷宮として機能" },
  samurai: { level: "◎", comment: "試練と覚悟の極限" },
  osaka_obahan: { level: "△", comment: "永遠に迷うオチ" }
  }
} satisfies AffinityMap
