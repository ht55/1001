// src/lib/expandStory.ts

import type { SourceStory } from "@/data/sourceStories/types"

type ExpandOptions = {
  targetMin: number
  targetMax: number
  maxParagraphs?: number // 安全装置
}

const DEFAULT_MAX_PARAGRAPHS = 10

export function expandStory(
  source: SourceStory,
  options: ExpandOptions
): string {
  const maxParagraphs =
    options.maxParagraphs ?? DEFAULT_MAX_PARAGRAPHS

  // 初期パラグラフ
  const baseParagraphs = source.text
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean)

  const output: string[] = []
  let charCount = 0

  // まず元テキストを入れる
  for (const p of baseParagraphs) {
    output.push(p)
    charCount += p.length
    if (output.length >= maxParagraphs) break
  }

  // Expansion（安全版）
  let safety = 0
  while (
    charCount < options.targetMin &&
    output.length < maxParagraphs &&
    safety < maxParagraphs
  ) {
    // 単純リミックス（創作しない）
    const pick =
      baseParagraphs[safety % baseParagraphs.length]

    output.push(pick)
    charCount += pick.length
    safety++
  }

  // 上限超過時はカット
  let result = output.join("\n\n")
  if (result.length > options.targetMax) {
    result = result.slice(0, options.targetMax)
  }

  return result
}
