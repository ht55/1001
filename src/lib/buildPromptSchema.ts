// src/lib/buildPromptSchema.ts

import type { worldModifier } from "@/types/worldModifier"
import type { SourceStory } from "@/data/sourceStories/types"
import type { Voice } from "@/types/voice"

type Params = {
  sourceStory: SourceStory
  characterLabel: string
  themeLabel: string
  situationLabel: string
  voice: Voice
  worldModifiers: worldModifier[]
  targetLength?: string
}

export function buildPromptSchema(p: Params): string {
  return `
あなたは物語作家です。

【最重要：Narrative Voice（厳守）】
この物語全体は「${p.voice.label}」の文体で書くこと。
以下の行動指針を全文に適用せよ。
途中で文体を変えてはならない。
${p.voice.styleGuide ?? ""}

【主人公】
${p.characterLabel}

【テーマ】
${p.themeLabel}

【シチュエーション】
${p.situationLabel}

【構造制約（必須）】
${p.sourceStory.structural_functions.join(" → ")}

【歪み・制約】
${p.worldModifiers.map(m => `- ${m.label}`).join("\n")}

【元テンプレ（参考構造）】
※ 文体・語彙・語り口は一切模倣してはならない
${p.sourceStory.text}

【生成条件】
- 文字数：${p.targetLength}
- 主人公＝選択キャラ
- 構造は保持、表現は自由
- 結末は過剰に説明しない
- Voice(文調)${p.voice.styleGuide ?? ""} を厳守する

では物語を書いてください。
`.trim()
}
