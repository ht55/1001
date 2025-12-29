// src/types/situationKeys.ts

export const situationKeys = [
  'circus',
  'neon_district',
  'royal_court',
  'shopping_mall',
  'wall_street',
  'snowy_mountains',
  'tropical_beach',
  'deep_forest',
  'lost_undersea_kingdom',
  'room_all_to_oneself',
  'ruined_tower',
  'space_station',
  'boundary_to_another_world',
  'train_with_no_known_destination',
  'steampunk_planet',
  'quiet_village',
  'zoo_on_a_rainy_day',
  'twilight_library',
  'artificial_garden',
  'infinite_labyrinth',
] as const

export type situationKey = typeof situationKeys[number]

