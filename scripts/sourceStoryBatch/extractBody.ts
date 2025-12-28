import { extractRange } from "@/lib/extractRange"

export function extractBody(raw: string): string {
  return extractRange(raw)
}
