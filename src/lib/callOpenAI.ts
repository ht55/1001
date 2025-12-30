// src/lib/callOpenAI.ts

type CallOpenAIArgs = {
  apiKey: string
  system: string
  user: string
  temperature?: number
}

export async function callOpenAI(
  args: CallOpenAIArgs
): Promise<string> {
  const { apiKey, system, user, temperature } = args

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: temperature ?? 0.9,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI API error: ${res.status} ${text}`)
  }

  const json = await res.json()
  const content = json.choices?.[0]?.message?.content

  if (typeof content !== "string") {
    throw new Error("Invalid OpenAI response format")
  }

  return content.trim()
}
