// src/lib/buildLLMSnapshot.ts

import type { ThemeKey } from "@/types/themeKeys";
import type { SituationKey } from "@/types/situationKeys";
import type { VoiceKey } from "@/types/voiceKeys";

export type LLMSnapshot = {
  theme: ThemeKey;
  situation: SituationKey;
  voice: VoiceKey;
  worldModifierId: string;
};

export function buildLLMSnapshot(input: {
  theme: ThemeKey;
  situation: SituationKey;
  voice: VoiceKey;
  worldModifierId: string;
}): LLMSnapshot {
  return {
    theme: input.theme,
    situation: input.situation,
    voice: input.voice,
    worldModifierId: input.worldModifierId,
  };
}
