// src/data/situationPresets.ts

import { SituationPreset } from '@/situations'

export const SITUATION_PRESETS: SituationPreset[] = [
  // 1. 人の集う場所
  {
    id: "circus",
    label: "サーカス",
    sceneId: "circus_tent",
    worldModifierId: "inversion",
    notes: "非日常的で夢のような演じられた世界"
  },
  {
    id: "neon_district",
    label: "ネオン街",
    sceneId: "neon_district",
    worldModifierId: "observer_bias",
    notes: "妖しいネオンが照らし出すもの"
  },
  {
    id: "royal_court",
    label: "王宮",
    sceneId: "royal_court",
    worldModifierId: "inversion",
    notes: "豪華絢爛な歴史と権力の象徴"
  },
  {
    id: "shopping_mall",
    label: "巨大ショッピングモール",
    sceneId: "shopping_mall",
    worldModifierId: "voidification",
    notes: "無数のありきたりな幸せが同時に存在"
  },
  {
    id: "wall_street",
    label: "ニューヨークのウォール街",
    sceneId: "wall_street",
    worldModifierId: "inversion",
    notes: "巨万の富と思惑が渦巻く都会の喧騒"
  },

  // 2. 自然・外界 
  {
    id: "snowy_mountains",
    label: "雪山",
    sceneId: "snowy_mountains",
    worldModifierId: "fixation",
    notes: "手足も悴む真っ白な厳しさ"
  },
  {
    id: "tropical_beach",
    label: "異国のビーチ",
    sceneId: "tropical_beach",
    worldModifierId: "distortion",
    notes: "楽園のはずなのに違和感"
  },
  {
    id: "deep_forest",
    label: "深い森",
    sceneId: "deep_forest",
    worldModifierId: "distortion",
    notes: "空を覆われ方角も感覚も消えていく場所"
  },
  {
    id: "lost_undersea_kingdom",
    label: "失われた海底世界",
    sceneId: "lost_undersea_world",
    worldModifierId: "voidification",
    notes: "過ぎ去った栄華が囁く海底深く沈んだ領域"
  },

  // 3. 閉じた空間・構造物
  {
    id: "room_all_to_oneself",
    label: "一人きりの部屋",
    sceneId: "room_all_to_oneself",
    worldModifierId: "observer_bias",
    notes: "安らぎの聖域か心の空洞か"
  },
  {
    id: "ruined_tower",
    label: "朽ちた塔",
    sceneId: "ruined_tower",
    worldModifierId: "erosion",
    notes: "過去や歴史の崩壊が残した遺物"
  },
  {
    id: "space_station",
    label: "宇宙ステーション",
    sceneId: "space_station",
    worldModifierId: "fixation",
    notes: "人間の存在がちっぽけで無力"
  },

  // 4. 境界・異界
  {
    id: "boundary_to_another_world",
    label: "異界との境界",
    sceneId: "boundary_to_another_world",
    worldModifierId: "observer_bias",
    notes: "越えてはいないが戻れないかも"
  },
  {
    id: "train_with_no_known_destination",
    label: "誰も行き先を知らない列車",
    sceneId: "train_with_no_known_destination",
    worldModifierId: "Voidification",
    notes: "終点も目的もないまま走り続ける"
  },
  {
    id: "steampunk_planet",
    label: "スチームパンクの惑星",
    sceneId: "steampunk_planet",
    worldModifierId: "distortion",
    notes: "機械的でノスタルジック、でも未来的"
  },

  // 5. 日常の歪み
  {
    id: "quiet_village",
    label: "静かな村",
    sceneId: "quiet_village",
    worldModifierId: "emergent_possibility",
    notes: "何も起こらないはずの場所",
  },
  {
    id: "zoo_on_a_rainy_day",
    label: "雨の日の動物園",
    sceneId: "zoo_on_a_rainy_day",
    worldModifierId: "observer_bias",
    notes: "観ているはずが観られている",
  },
  {
    id: "artificial_garden",
    label: "人工庭園",
    sceneId: "artificial_garden",
    worldModifierId: "inversion",
    notes: "どこか無機質な庭園"
  },
  { id: "twilight_library",
    label: "夕暮れの図書館",
    sceneId: "twilight_library",
    worldModifierId: "fixation",
    notes: "何かが静かに止まり始めるのか動き始めるのか"
  },

  // 6. 枠外・異端
  {
    id: "infinite_labyrinth",
    label: "無限の迷宮",
    sceneId: "infinite_labyrinth",
    worldModifierId: "fixation",
    notes: "形も時間も空間も全ての概念が不安定で変動的"
  }
]
