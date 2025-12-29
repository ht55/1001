// src/components/situation/situationCategoryMap.ts

import { situationCategoryId } from "@/situations/situationCategories";

export const situation_category_map: Record<
  string,
  situationCategoryId
> = {
  // 人の集まる場所
  circus: "crowded",
  neon_district: "crowded",
  royal_palace: "crowded",
  shopping_mall: "crowded",
  wall_street: "crowded",

  // 自然・外界
  snowy_mountains: "nature",
  tropical_beach: "nature",
  deep_forest: "nature",
  lost_undersea_kingdom: "nature",

  // 閉じた空間・構造物
  room_all_to_oneself: "closed",
  ruined_tower: "closed",
  space_station: "closed",

  // 境界・異界
  train_with_no_known_destination: "boundary",
  boundary_to_another_world: "boundary",
  steampunk_planet: "boundary",

  // 日常の歪み
  quiet_village: "daily_shift",
  zoo_on_a_rainy_day: "daily_shift",
  twilight_library: "daily_shift",
  artificial_garden: "daily_shift",

  // 枠外・異端
  infinite_labyrinth: "outsider",
};
