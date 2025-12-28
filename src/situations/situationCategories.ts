// src/situations/situationCategories.ts

// Crowded
import { circus } from './crowded/circus'
import { neon_district } from './crowded/neon_district'
import { royal_court } from './crowded/royal_court'
import { shopping_mall } from './crowded/shopping_mall'
import { wall_street } from './crowded/wall_street'

// Nature
import { snowy_mountains } from './nature/snowy_mountains'
import { tropical_beach } from './nature/tropical_beach'
import { deep_forest } from './nature/deep_forest'
import { lost_undersea_kingdom } from './nature/lost_undersea_kingdom'

// Closed
import { room_all_to_oneself } from './closed/room_all_to_oneself'
import { ruined_tower } from './closed/ruined_tower'
import { space_station } from './closed/space_station'

// Boundary
import { boundary_to_another_world } from './boundary/boundary_to_another_world'
import { train_with_no_known_destination } from './boundary/train_with_no_known_destination'
import { steampunk_planet } from './boundary/steampunk_planet'

// Daily Shift
import { quiet_village } from './daily_shift/quiet_village'
import { zoo_on_a_rainy_day } from './daily_shift/zoo_on_a_rainy_day'
import { twilight_library } from './daily_shift/twilight_library'
import { artificial_garden } from './daily_shift/artificial_garden'

// Outsider
import { infinite_labyrinth } from './outsider/infinite_labyrinth'

import type { SituationPreset } from '@/types/situationPreset'

export const situationCategories = [
  {
    id: 'crowded',
    label: '人の集まる場所',
    categoryId: 'crowded',
    situations: [circus, neon_district, royal_court, shopping_mall, wall_street],
    notes: '人の存在が世界を歪ませる',
  },
  {
    id: 'nature',
    label: '自然・外界',
    categoryId: 'nature',
    situations: [
      snowy_mountains,
      tropical_beach,
      deep_forest,
      lost_undersea_kingdom,
    ],
    notes: '人間の理解や管理が及ばない領域',
  },
  {
    id: 'closed',
    label: '閉じた空間・構造物',
    categoryId: 'closed',
    situations: [room_all_to_oneself, ruined_tower, space_station],
    notes: '内側で時間や意味が停滞',
  },
  {
    id: 'boundary',
    label: '境界・異界',
    categoryId: 'boundary',
    situations: [
      boundary_to_another_world,
      train_with_no_known_destination,
      steampunk_planet,
    ],
    notes: '狭間にいるのか別世界か',
  },
  {
    id: 'daily_shift',
    label: '日常の歪み',
    categoryId: 'daily_shift',
    situations: [
      quiet_village,
      zoo_on_a_rainy_day,
      twilight_library,
      artificial_garden,
    ],
    notes: '見慣れた風景が少しだけ信用できない',
  },
  {
    id: 'outsider',
    label: '枠外・異端',
    categoryId: 'outsider',
    situations: [infinite_labyrinth],
    notes: '概念外',
  },
] as const

export type SituationCategoryID =
  typeof situationCategories[number]['categoryId']

/**
 * UI / Matrix 用フラット配列
 */
export const situations: SituationPreset[] =
  situationCategories.flatMap(c => c.situations)
