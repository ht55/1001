// src/lib/adaptSnapshotToGenerationParams.ts
// 多分これもういらないファイル

import type { StoryContextSnapshot } from "@/lib/buildStoryContextSnapshot";
import type { ThemeKey } from "@/types/themeKeys";
import type { SituationKey } from "@/types/situationKeys";
import type { VoiceKey } from "@/types/voiceKeys";

export type GenerationParams = {
  motif: ThemeKey;
  situation: SituationKey;
  voice: VoiceKey;
};

// Snapshot と既存選択（motif / voice）をrunWithFaker用のGenerationParamsに束ねるだけのアダプター
export function adaptSnapshotToGenerationParams(
  snapshot: StoryContextSnapshot,
  motif: ThemeKey,
  voice: VoiceKey
): GenerationParams {
  return {
    motif,
    situation: snapshot.situationId as SituationKey,
    voice,
  };
}
