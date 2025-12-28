// src/themes/index.ts

import { themes } from "./themeList"

export { sin_and_retribution } from './sin_and_retribution'
export { distorted_justice } from './distorted_justice'
export { erosion_of_love } from './erosion_of_love'
export { loneliness_and_collapse } from './loneliness_and_collapse'
export { self_denial_and_fragmentation } from './self_denial_and_fragmentation'
export { violence_of_memory_and_time } from './violence_of_memory_and_time'
export { collapse_of_reality } from './collapse_of_reality'
export { forbidden_knowledge } from './forbidden_knowledge'
export { salvation_without_god } from './salvation_without_god'
export { genesis_and_apocalypse } from './genesis_and_apocalypse'
export { between_life_and_death } from './between_life_and_death'
export { logic_of_the_night } from './logic_of_the_night'
export { beauty_and_cruelty } from './beauty_and_cruelty'
export { collective_madness } from './collective_madness'
export { inevitable_end } from './inevitable_end'

export * from "./themeList"

export const themesById = Object.fromEntries(
  themes.map(t => [t.id, t])
)