// src/types/situationPreset.ts

import type { situationKey } from './situationKeys'

export interface situationPreset {
  id: situationKey
  label: string
  sceneId: string
  worldModifierId: string
  notes?: string
}
