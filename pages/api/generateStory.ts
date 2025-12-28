// pages/api/generateStory.ts

import type { NextApiRequest, NextApiResponse } from "next"
import { runStoryPipeline } from "@/lib/runStoryPipeline"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await runStoryPipeline(req.body)
    res.status(200).json(result)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}
