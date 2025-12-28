// src/lib/callOpenAI.ts

type CallOpenAIArgs = {
  system: string
  user: string
  temperature?: number
}

export async function callOpenAI(
  args: CallOpenAIArgs
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set")
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // 安定・高速・コスト低
      temperature: args.temperature ?? 0.9,
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.user },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI API error: ${res.status} ${text}`)
  }

  const json = await res.json()

  const content =
    json.choices?.[0]?.message?.content

  if (!content || typeof content !== "string") {
    throw new Error("Invalid OpenAI response format")
  }

  return content.trim()
}
