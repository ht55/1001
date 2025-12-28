// src/types/affinity.ts

export type AffinitySymbol = '◎' | '◯' | '△'

export type AffinityLevel = 'Strong' | 'Neutral' | 'Mismatch'

export const affinitySymbolToLevel: Record<AffinitySymbol, AffinityLevel> = {
  '◎': 'Strong',
  '◯': 'Neutral',
  '△': 'Mismatch',
}

export type AffinityEntry = {
  level: AffinitySymbol
  comment: string
}
