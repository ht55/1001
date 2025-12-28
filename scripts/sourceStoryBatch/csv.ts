// scripts/sourceStoryBatch/csv.ts

import fs from "fs"

export type CSVIndex = Record<string, string[]>

export function loadCSVIndex(path: string): CSVIndex {
  if (!fs.existsSync(path)) return {}

  const lines = fs.readFileSync(path, "utf-8").split("\n").filter(Boolean)
  const [, ...rows] = lines // skip header

  const index: CSVIndex = {}
  for (const row of rows) {
    const [id, funcs] = row.split(",")
    index[id] = funcs ? funcs.split("|").filter(Boolean) : []
  }
  return index
}

export function writeCSVIndex(
  path: string,
  ids: string[]
) {
  const header = "id,structural_functions\n"
  const rows = ids.map(id => `${id},`).join("\n")
  fs.writeFileSync(path, header + rows, "utf-8")
}
