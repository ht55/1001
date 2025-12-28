// src/lib/buildPromptSchema.ts

import type { WorldModifier } from "@/types/worldModifier"
import type { SourceStory } from "@/data/sourceStories/types"

type Params = {
  sourceStory: SourceStory
  characterLabel: string
  themeLabel: string
  situationLabel: string
  voiceLabel: string
  worldModifiers: WorldModifier[]
  targetLength?: string
}

export function buildPromptSchema(p: Params): string {
  return `
あなたは物語作家です。

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
${p.sourceStory.text}

【生成条件】
- 文字数：${p.targetLength}
- 主人公＝選択キャラ
- 構造は保持、表現は自由
- 結末は過剰に説明しない
- Voice(文調)${p.voiceLabel} は物語のナレーター。voiceは物語の人格・話者・登場人物ではなく、は表現傾向・言語的クセ・感情の出方の偏りである（物語世界・登場人物・視点・因果には影響を与えないが、語りの調子・感情の滲み・言い淀み・ツッコミなどは許可される）

では物語を書いてください。
`.trim()
}
