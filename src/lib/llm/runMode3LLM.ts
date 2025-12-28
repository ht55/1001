// src/lib/llm/runMode3LLM.ts

import OpenAI from "openai"
import { MODE3_PROMPT } from "@/lib/llm/prompts/mode3"

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing")
  return new OpenAI({ apiKey })
}

export async function runMode3LLM(params: {
  text: string
  constraints: unknown
}): Promise<string> {
  const openai = getOpenAI() 
  
  const messages = [
    { role: "system" as const, content: MODE3_PROMPT },
    {
      role: "user" as const,
      content: [
        "【編集対象テキスト】",
        params.text,
        "",
        "【constraints.json】",
        JSON.stringify(params.constraints, null, 2),
      ].join("\n"),
    },
  ]

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini", //画像生成フェーズが構築できたらgpt-image-1などにUpdateする
    messages,
    temperature: 0.2,
  })

  return res.choices[0].message.content ?? ""
}



