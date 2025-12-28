// scripts/sourceStoryBatch/loadSourceStoriesFromTSV.ts

import fs from "fs"
import path from "path"
import { normalizeText } from "./normalize"

export type RawSourceStory = {
  id: string
  structural_functions: string[]
  tone?: string 
  text: string
}

const MIN_LEN = 80
const MAX_LEN = 400

export function loadSourceStoriesFromTSV(): RawSourceStory[] {
  const tsvPath = path.resolve(
    process.cwd(),
    "scripts/sourceStoryBatch/index.tsv"
  )

  const raw = fs.readFileSync(tsvPath, "utf-8")
  const lines = raw.split("\n").filter(Boolean)

  const header = lines.shift()
  if (!header) throw new Error("TSV header missing")

  const stories: RawSourceStory[] = []

  for (const line of lines) {
    const [id, structuralRaw, tone, text] = line.split("\t")

    if (!id || !text || !structuralRaw) continue

    const normalized = normalizeText(text)
    const len = normalized.length

    if (len < MIN_LEN || len > MAX_LEN) {
      console.warn(
        `[SKIP] ${id} length=${len} (allowed ${MIN_LEN}-${MAX_LEN})`
      )
      continue
    }

    stories.push({
      id: id.trim(),
      structural_functions: structuralRaw
        .split("|")
        .map(s => s.trim().toLowerCase()),
      tone: tone?.trim(),
      text: normalized
    })
  }

  console.log(`✔ loaded ${stories.length} source stories`)
  return stories
}
