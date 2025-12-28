// src/affinities/affinityIcons.ts
export const affinityIcons = {
  '◎': '/affinities/icons/strong.png',
  '◯': '/affinities/icons/neutral.png',
  '△': '/affinities/icons/mismatch.png',
} as const

export type AffinitySymbol = keyof typeof affinityIcons
