// src/lib/renderStoryText.ts

import type { StructuralState } from "@/types/StructuralState"
import type { VoiceKey } from "@/types/voiceKeys"

type RenderOptions = {
  voice?: VoiceKey
}

/* =========================
 * 基本ユーティリティ
 * ========================= */

function removeEvaluativeLanguage(text: string): string {
  return text.replace(/必ず|当然|正しく|間違いなく/g, "")
}

function invertEvaluativeTone(text: string): string {
  return text
    .replace(/幸せ/g, "不穏")
    .replace(/正しい/g, "疑わしい")
}

function blurCausality(text: string): string {
  return text
    .replace(/だから/g, "それでも")
    .replace(/なぜなら/g, "")
}

function averageWeight(functions: StructuralState["functions"]): number {
  const sum = functions.reduce((acc, f) => acc + f.weight, 0)
  return sum / Math.max(functions.length, 1)
}

/* =========================
 * Voice Profile 定義
 * ========================= */

type VoiceRule = [RegExp, string]

type VoiceProfile = {
  insertionRate: number   // 0.0–1.0
  rules: VoiceRule[]
}

const VOICE_PROFILES: Record<VoiceKey, VoiceProfile> = {
  neutral: {
    insertionRate: 0,
    rules: [],
  },

  poetic: {
    insertionRate: 0.3,
    rules: [
      [/。/g, "。……"],
      [/静か/g, "ひそやか"],
      [/暗い/g, "翳りを帯びた"],
    ],
  },

  melancholic: {
    insertionRate: 0.35,
    rules: [
      [/思った/g, "そう感じてしまった"],
      [/。/g, "。それだけが残った。"],
    ],
  },

  cold: {
    insertionRate: 0.25,
    rules: [
      [/私は/g, "観測者は"],
      [/感じた/g, "確認した"],
      [/。/g, "。以上だ。"],
    ],
  },

  scholarly: {
    insertionRate: 0.3,
    rules: [
      [/つまり/g, "換言すれば"],
      [/奇妙/g, "特異"],
      [/。/g, "。と考えられる。"],
    ],
  },

  mystic: {
    insertionRate: 0.35,
    rules: [
      [/夜/g, "境界の刻"],
      [/影/g, "兆し"],
      [/。/g, "。それは名を持たない。"],
    ],
  },

  heroic: {
    insertionRate: 0.3,
    rules: [
      [/恐れた/g, "立ち向かった"],
      [/逃げた/g, "踏みとどまった"],
      [/。/g, "。運命はそこで試された。"],
    ],
  },

  childlike: {
    insertionRate: 0.4,
    rules: [
      [/思った/g, "思ったんだ"],
      [/怖い/g, "ちょっとこわい"],
      [/。/g, "。ね。"],
    ],
  },

  playful: {
    insertionRate: 0.4,
    rules: [
      [/しかし/g, "ところがどっこい"],
      [/本当/g, "めちゃくちゃ"],
      [/。/g, "。えへへ。"],
    ],
  },

  osaka_obahan: {
    insertionRate: 0.45,
    rules: [
      [/^/gm, "あのな、"],
      [/しかし/g, "せやけど"],
      [/それでも/g, "それでもやで"],
      [/だと思った/g, "やと思てん"],
      [/に違いない/g, "やろ思うわ"],
      [/。/g, "、ほんまに。"],
      [/です。/g, "やで。"],
      [/だ。/g, "やねん。"],
    ],
  },
}
function replaceCharacter(text: string, characterName: string): string {
  return text.replace(/〈キャラ〉/g, characterName)
}

/* =========================
 * Voice 適用ロジック
 * ========================= */

function applyVoice(text: string, voice: VoiceKey): string {
  const profile = VOICE_PROFILES[voice]
  if (!profile || profile.rules.length === 0) return text

  return text
    .split(/(?<=。)/)
    .map(sentence => {
      if (Math.random() > profile.insertionRate) return sentence
      return profile.rules.reduce(
        (t, [re, rep]) => t.replace(re, rep),
        sentence
      )
    })
    .join("")
}

/* =========================
 * メイン
 * ========================= */

export function renderStoryText(
  sourceText: string,
  state: StructuralState,
  options?: RenderOptions
): string {
  let text = sourceText
  const { functions } = state

  // 1) Void
  if (functions.some(f => !f.active)) {
    text = removeEvaluativeLanguage(text)
  }

  // 2) Inversion
  if (functions.some(f => f.polarity === -1)) {
    text = invertEvaluativeTone(text)
  }

  // 3) Distortion
  if (averageWeight(functions) > 1.2) {
    text = blurCausality(text)
  }

  // 4) Voice
  if (options?.voice) {
    text = applyVoice(text, options.voice)
  }

  return text
}
