import type { SourceStory, StructuralFunction } from "@/data/sourceStories/types"

type ExtractOptions = {
  targetLength: number
  attractors: StructuralFunction[] // Situation / Reaction 由来
}

export function extractStructuralSegment(
  source: SourceStory,
  options: ExtractOptions
): string {
  const paragraphs = source.text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) return source.text

  const total = paragraphs.length

  // 候補インデックス生成
  const candidates = new Set<number>()

  // ① 終盤は必ず候補
  for (let i = Math.floor(total * 0.7); i < total; i++) {
    candidates.add(i)
  }

  // ② 変化点っぽい場所（前後差分）
  for (let i = 1; i < total - 1; i++) {
    const lenPrev = paragraphs[i - 1].length
    const lenCurr = paragraphs[i].length
    if (Math.abs(lenCurr - lenPrev) > 200) {
      candidates.add(i)
    }
  }

  // ③ attractor が多い場合は中央寄りも混ぜる（引き寄せ）
  if (options.attractors.length >= 2) {
    candidates.add(Math.floor(total / 2))
  }

  const pool = Array.from(candidates)
  if (pool.length === 0) return source.text

  // 開始点をランダム選択
  const startIndex = pool[Math.floor(Math.random() * pool.length)]

  // 前後に広げて targetLength まで拾う
  let result: string[] = []
  let length = 0

  let left = startIndex
  let right = startIndex + 1

  while (length < options.targetLength && (left >= 0 || right < total)) {
    if (left >= 0) {
      result.unshift(paragraphs[left])
      length += paragraphs[left].length
      left--
    }
    if (length >= options.targetLength) break
    if (right < total) {
      result.push(paragraphs[right])
      length += paragraphs[right].length
      right++
    }
  }

  return result.join("\n\n")
}
