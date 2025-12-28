// pages/api/llm.ts

import type { StoryConstraints } from "@/lib/constraints/constraints.schema"


export async function runWithLLM(
  constraints: StoryConstraints
): Promise<string> {
  const res = await fetch("/api/llm", {
    method: "POST",
    body: JSON.stringify(constraints),
  })

  const { text } = await res.json()
  return text
}
