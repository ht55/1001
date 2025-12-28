export function formatStoryOutput(text: string): string {
  // 余計な空行を整理
  const cleaned = text
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  // 最後に余韻用の空行を1つ
  return `${cleaned}\n`
}
