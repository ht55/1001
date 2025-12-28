// src/types/themeKeys.ts

export const themeKeys = [
  'beauty_and_cruelty',
  'between_life_and_death',
  'collapse_of_reality',
  'collective_madness',
  'distorted_justice',
  'erosion_of_love',
  'forbidden_knowledge',
  'genesis_and_apocalypse',
  'inevitable_end',
  'logic_of_the_night',
  'loneliness_and_collapse',
  'salvation_without_god',
  'self_denial_and_fragmentation',
  'sin_and_retribution',
  'violence_of_memory_and_time'
] as const

export type ThemeKey = typeof themeKeys[number]
