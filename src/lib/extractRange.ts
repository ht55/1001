// src/lib/extractRange.ts

export function extractRange(
  text: string,
  target = 1200,
  margin = 300
): string {
  const L = text.length
  if (L <= target + margin) return text

  const minLen = Math.max(200, target - margin)
  const maxLen = target + margin

  const maxStart = Math.max(0, L - maxLen)
  const start = Math.floor(Math.random() * (maxStart + 1))
  let end = start + Math.floor(
    minLen + Math.random() * (maxLen - minLen + 1)
  )

  end = Math.min(end, L)

  // 文境界に軽く寄せる（最大+200）
  const tail = text.slice(end, Math.min(L, end + 200))
  const m = tail.search(/[。．\n]/)
  if (m !== -1) end += m + 1

  return text.slice(start, end)
}
