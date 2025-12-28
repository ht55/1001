// src/lib/runWithFaker.ts

import type { StoryContextSnapshot } from "@/types/StoryContextSnapshot"
import { situationLabelMap } from "@/utils/situationLabelMap"
import { voiceLabelMap } from "@/utils/voiceLabelMap"

import { storyPatterns } from "@/lib/faker/storyPatterns"
import { pick } from "@/lib/faker/pick"
import { getReactionProfile } from "@/lib/getReactionProfile"
import { reactionSenseMap } from "@/lib/faker/reactionSenseMap"
import { getDominantAxis } from "@/lib/reaction/getDominantAxis"
import { patternByReaction } from "@/lib/faker/patternByReaction"

export function runWithFaker(snapshot: StoryContextSnapshot): string {
  // Phase1（Mode1用・UIBiasなし）
  const reactionProfile = getReactionProfile(
    snapshot.characterId,
    snapshot.themeId
  )

  const axis = getDominantAxis(reactionProfile)
  const senses = reactionSenseMap[axis] ?? ["第六感"]

  const ctx = {
    character: snapshot.characterId,
    place:
      situationLabelMap[snapshot.situationId] ??
      snapshot.situationId,
    voice:
      voiceLabelMap[snapshot.voiceId] ??
      snapshot.voiceId,
    sense: pick([...senses])
  }

  const candidateIds = patternByReaction[axis]
  const candidates = candidateIds
    ? storyPatterns.filter(p =>
      (candidateIds as readonly string[]).includes(p.id)
    )
    : storyPatterns

  const pattern = pick(candidates.length ? candidates : storyPatterns)

  const render = (lines: string[]) =>
    pick(lines).replace(/\{(\w+)\}/g, (_, k) => (ctx as any)[k])

  const intro = render(pattern.blocks.intro)
  const anomaly = render(pattern.blocks.anomaly)
  const ending = render(pattern.blocks.ending)

  const body: string[] = []
  while (([intro, anomaly, ...body, ending].join("\n\n")).length < 1000) {
    body.push(render(pattern.blocks.progression))
  }

  return [intro, anomaly, ...body, ending]
    .join("\n\n")
    .slice(0, 1500)

}
