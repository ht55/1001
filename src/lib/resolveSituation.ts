// src/lib/resolveSituation.ts

import { SITUATION_PRESETS } from "@/data/situationPresets"

export function resolveSituation(situationId: string) {
  const preset = SITUATION_PRESETS.find(p => p.id === situationId)

  if (!preset) {
    throw new Error(`Unknown situationId: ${situationId}`)
  }

  return {
    sceneId: preset.sceneId,
    worldModifierId: preset.worldModifierId,
    notes: preset.notes
  }
}
