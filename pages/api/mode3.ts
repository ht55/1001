// pages/api/mode3.ts

import type { NextApiRequest, NextApiResponse } from "next"

import { normalizeMode3 } from "@/lib/constraints/normalizeMode3"
import { runWithLLM } from "@/lib/runWithLLM"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method Not Allowed" })
    return
  }

  try {
    const input = req.body

    // 1) Mode3 正規化（prompt生成のみ）
    const { prompt } = normalizeMode3(input)

    // 2) LLM 実行
    const text = await runWithLLM(prompt)

    // 3) 返却
    res.status(200).json({
      ok: true,
      text,
    })
  } catch (err) {
    console.error("[mode3 api error]", err)

    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    })
  }
}

