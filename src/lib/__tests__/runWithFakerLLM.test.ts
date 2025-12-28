// src/lib/__tests__/runWithFakerLLM.test.ts

import { runWithFakerLLM } from "@/lib/runWithFakerLLM"
import { UIBiasLevel } from "@/types/uiBias"
import { StoryContextSnapshot } from "@/types/StoryContextSnapshot"
import { SituationKey } from "@/types/situationKeys"
import { VoiceKey } from "@/types/voiceKeys"


describe("runWithFakerLLM", () => {
  it("should return valid text from Faker + LLM pipeline", async () => {
    const snapshot = {
    characterId: "holmes",
    themeId: "distorted_justice",
    situationId: "circus" as SituationKey,
    voiceId: "neutral" as VoiceKey,
    uiLevel: "△" as UIBiasLevel, 
}

    const result = await runWithFakerLLM(snapshot)

    expect(result.text).toBeDefined()
    expect(result.text.length).toBeGreaterThan(0)
  })
})