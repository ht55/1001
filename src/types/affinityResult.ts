// src/types/reactionResult.ts

import { AffinitySymbol } from './affinity'
import { ReactionProfile } from './reactionProfile'

export type AffinityResult = {
  uiLevel: AffinitySymbol     // ◎◯△（見せる）
  profile: ReactionProfile   // 内部ロジック用
}
