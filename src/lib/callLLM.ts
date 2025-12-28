// src/lib/callLLM.ts

import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function callLLM(prompt: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: "gpt-5.2",
    messages: [{ role: "user", content: prompt }],
  })

  return res.choices[0]?.message?.content ?? ""
}
