// src/lib/projectToScene.ts

import { ReactionProfile } from "@/types/reactionProfile"
import { Scene } from "@/types/scene"

export interface StoryContext {
  sceneId: string
  sceneLabel: string
  reactionProfile: ReactionProfile
  worldModifierId?: string
}

export function projectToScene(
  profile: ReactionProfile,
  scene: Scene,
  worldModifierId?: string
): StoryContext {
  return {
    sceneId: scene.id,
    sceneLabel: scene.label,
    reactionProfile: profile,
    worldModifierId
  }
}
