// src/lib/runWithLLM.ts

import { callOpenAI } from "@/lib/callOpenAI"

const MODE3_SYSTEM_PROMPT = `
You are a literary renderer.
All narrative meaning is already fixed.
Do not add explanations or meta commentary.
生成する物語の長さに制限はないが、一般的な短編の長さであることが望ましい。
ユーザーが選んだ文調・voiceは、生成した物語を出力する直前に物語全体に適応すること。

`.trim()

export async function runWithLLM(
  prompt: string,
  apiKey: string 
): Promise<string> {
  return callOpenAI({
    apiKey,               
    system: MODE3_SYSTEM_PROMPT,
    user: prompt,
  })
}
