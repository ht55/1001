// src/lib/renderWithLLM.ts

// renderWithLLM.ts（未接続）
import type { LLMSnapshot } from "@/lib/buildLLMSnapshot";
import { WORLD_MODIFIERS } from "@/data/worldModifier";

export function buildLLMPrompt(snapshot: LLMSnapshot): string {
  const modifier = WORLD_MODIFIERS[snapshot.worldModifierId];

  return `
You are a storyteller.

World distortion rule:
${modifier.prompt}

Motif: ${snapshot.motif.label}
Situation: ${snapshot.situation}
Narrative voice: ${snapshot.voice}

Write a short story.
`.trim();
}
